import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useExpenses } from "@/hooks/useExpenses";
import { useAssets } from "@/hooks/useAssets";
import { useMemo } from "react";

export const SavingsChart = () => {
  const { expenses } = useExpenses();
  const { savingsAccounts, mutualFunds, fixedDeposits } = useAssets();

  const chartData = useMemo(() => {
    // Group expenses by month
    const monthlyExpenses: { [key: string]: number } = {};
    const monthlyAssets: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + expense.amount;
    });

    // Calculate total assets for each month when assets were added
    [...savingsAccounts, ...fixedDeposits].forEach(asset => {
      const date = new Date(asset.createdAt || new Date());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const assetValue = 'balance' in asset ? asset.balance : asset.amount;
      monthlyAssets[monthKey] = (monthlyAssets[monthKey] || 0) + assetValue;
    });

    mutualFunds.forEach(fund => {
      const date = new Date(fund.purchaseDate || fund.createdAt || new Date());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyAssets[monthKey] = (monthlyAssets[monthKey] || 0) + (fund.units * fund.nav);
    });

    // Get last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      months.push({
        month: monthName,
        expenses: monthlyExpenses[monthKey] || 0,
        assets: monthlyAssets[monthKey] || 0,
      });
    }

    return months;
  }, [expenses, savingsAccounts, mutualFunds, fixedDeposits]);
  return (
    <Card className="col-span-full lg:col-span-2 border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Financial Overview</CardTitle>
        <p className="text-sm text-muted-foreground">Track your monthly expenses and asset additions</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
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
              formatter={(value: number, name: string) => {
                if (name === 'expenses') return [`₹${value.toLocaleString('en-IN')}`, 'Expenses'];
                return [`₹${value.toLocaleString('en-IN')}`, 'Assets Added'];
              }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--destructive))', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="assets" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'hsl(var(--primary))', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
