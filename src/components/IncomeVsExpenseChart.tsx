import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Receipt } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncome } from "@/hooks/useIncome";
import { IncomeList } from "@/components/IncomeList";
import { useMemo } from "react";

export const IncomeVsExpenseChart = () => {
  const { expenses } = useExpenses();
  const { incomes } = useIncome();
  const [showIncomeList, setShowIncomeList] = useState(false);

  const chartData = useMemo(() => {
    const monthlyExpenses: { [key: string]: number } = {};
    const monthlyIncomes: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + expense.amount;
    });

    incomes.forEach(income => {
      const date = new Date(income.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyIncomes[monthKey] = (monthlyIncomes[monthKey] || 0) + income.amount;
    });

    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      months.push({
        month: monthName,
        income: monthlyIncomes[monthKey] || 0,
        expense: monthlyExpenses[monthKey] || 0,
      });
    }

    return months;
  }, [expenses, incomes]);

  return (
    <>
      <Card className="col-span-full lg:col-span-2 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Income vs Expense</CardTitle>
              <p className="text-sm text-muted-foreground">Monthly comparison of your income and expenses</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowIncomeList(true)}>
              <Receipt className="h-4 w-4 mr-2" />
              View Incomes
            </Button>
          </div>
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
                if (name === 'income') return [`₹${value.toLocaleString('en-IN')}`, 'Income'];
                return [`₹${value.toLocaleString('en-IN')}`, 'Expense'];
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="expense" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--destructive))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* Income List Dialog */}
    <Dialog open={showIncomeList} onOpenChange={setShowIncomeList}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Income Entries</DialogTitle>
        </DialogHeader>
        <IncomeList />
      </DialogContent>
    </Dialog>
    </>
  );
};
