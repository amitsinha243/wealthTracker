import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAssets } from "@/hooks/useAssets";
import { useMemo, useEffect, useState } from "react";
import { mutualFundAPI } from "@/services/api";

export const SavingsChart = () => {
  const { savingsAccounts, mutualFunds, fixedDeposits, stocks } = useAssets();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await mutualFundAPI.getAllTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      }
    };
    fetchTransactions();
  }, [mutualFunds]);

  const chartData = useMemo(() => {
    const monthlySavings: { [key: string]: number } = {};
    const monthlyFunds: { [key: string]: number } = {};
    const monthlyDeposits: { [key: string]: number } = {};
    const monthlyStocks: { [key: string]: number } = {};
    
    savingsAccounts.forEach(account => {
      const date = new Date(account.createdAt || new Date());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlySavings[monthKey] = (monthlySavings[monthKey] || 0) + account.balance;
    });

    // Use transactions for mutual funds
    transactions.forEach(transaction => {
      const date = new Date(transaction.purchaseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyFunds[monthKey] = (monthlyFunds[monthKey] || 0) + (transaction.units * transaction.nav);
    });

    fixedDeposits.forEach(deposit => {
      if (deposit.depositType === 'RD') {
        // For RD, add monthly installment for each month from creation to maturity (or now)
        const startDate = new Date(deposit.createdAt || new Date());
        const maturityDate = new Date(deposit.maturityDate);
        const now = new Date();
        const endDate = maturityDate < now ? maturityDate : now;
        
        let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        while (currentDate <= endDate) {
          const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
          monthlyDeposits[monthKey] = (monthlyDeposits[monthKey] || 0) + deposit.amount;
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      } else {
        // For FD, add the full amount at creation date
        const date = new Date(deposit.createdAt || new Date());
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyDeposits[monthKey] = (monthlyDeposits[monthKey] || 0) + deposit.amount;
      }
    });

    stocks.forEach(stock => {
      const date = new Date(stock.purchaseDate || stock.createdAt || new Date());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyStocks[monthKey] = (monthlyStocks[monthKey] || 0) + (stock.quantity * stock.purchasePrice);
    });

    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      months.push({
        month: monthName,
        'Savings Accounts': monthlySavings[monthKey] || 0,
        'Mutual Funds': monthlyFunds[monthKey] || 0,
        'Deposits': monthlyDeposits[monthKey] || 0,
        'Stocks': monthlyStocks[monthKey] || 0,
      });
    }

    return months;
  }, [savingsAccounts, mutualFunds, fixedDeposits, stocks, transactions]);
  return (
    <Card className="col-span-full lg:col-span-2 border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Monthly Savings by Asset Type</CardTitle>
        <p className="text-sm text-muted-foreground">Track your asset additions by category each month</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barCategoryGap="10%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '11px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `₹${value/1000}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
            />
            <Legend />
            <Bar dataKey="Savings Accounts" stackId="a" fill="#10b981" maxBarSize={40} />
            <Bar dataKey="Mutual Funds" stackId="a" fill="#3b82f6" maxBarSize={40} />
            <Bar dataKey="Deposits" stackId="a" fill="#f59e0b" maxBarSize={40} />
            <Bar dataKey="Stocks" stackId="a" fill="#8b5cf6" maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
