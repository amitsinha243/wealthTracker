import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Receipt, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncome } from "@/hooks/useIncome";
import { IncomeList } from "@/components/IncomeList";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  Math.abs(v) >= 1_00_000
    ? `₹${(v / 1_00_000).toFixed(1)}L`
    : Math.abs(v) >= 1_000
      ? `₹${(v / 1_000).toFixed(1)}k`
      : `₹${v.toFixed(0)}`;

const fmtFull = (v: number) =>
  `${v < 0 ? "-" : ""}₹${Math.abs(v).toLocaleString("en-IN")}`;

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const income = payload.find((p: any) => p.dataKey === "income")?.value ?? 0;
  const expense = payload.find((p: any) => p.dataKey === "expense")?.value ?? 0;
  const net = income - expense;
  const surplus = net >= 0;

  return (
    <div
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: 14,
        padding: "14px 18px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
        minWidth: 210,
      }}
    >
      {/* Month header */}
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "hsl(var(--foreground))",
          marginBottom: 10,
          borderBottom: "1px solid hsl(var(--border))",
          paddingBottom: 8,
        }}
      >
        {label}
      </p>

      {/* Income row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Income</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#10b981" }}>{fmtFull(income)}</span>
      </div>

      {/* Expense row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f43f5e", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Expenses</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#f43f5e" }}>{fmtFull(expense)}</span>
      </div>

      {/* Net savings pill */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: surplus ? "#10b98120" : "#f43f5e20",
          border: `1px solid ${surplus ? "#10b98140" : "#f43f5e40"}`,
          borderRadius: 8,
          padding: "6px 10px",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--muted-foreground))" }}>
          Net {surplus ? "Savings" : "Deficit"}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: surplus ? "#10b981" : "#f43f5e",
          }}
        >
          {fmtFull(net)}
        </span>
      </div>
    </div>
  );
};

// ── Custom Legend ──────────────────────────────────────────────────────────────
const CustomLegend = () => (
  <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 12 }}>
    {[
      { label: "Income", color: "#10b981", start: "#34d399", end: "#059669" },
      { label: "Expenses", color: "#f43f5e", start: "#fb7185", end: "#e11d48" },
    ].map((s) => (
      <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 28,
            height: 3,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${s.start}, ${s.end})`,
            display: "inline-block",
          }}
        />
        <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", fontWeight: 500 }}>
          {s.label}
        </span>
      </div>
    ))}
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
export const IncomeVsExpenseChart = () => {
  const { expenses } = useExpenses();
  const { incomes } = useIncome();
  const [showIncomeList, setShowIncomeList] = useState(false);

  const chartData = useMemo(() => {
    const monthlyExpenses: { [key: string]: number } = {};
    const monthlyIncomes: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + expense.amount;
    });

    incomes.forEach((income) => {
      const date = new Date(income.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyIncomes[monthKey] = (monthlyIncomes[monthKey] || 0) + income.amount;
    });

    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthName = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      const income = monthlyIncomes[monthKey] || 0;
      const expense = monthlyExpenses[monthKey] || 0;

      months.push({
        month: monthName,
        income,
        expense,
        net: income - expense,
      });
    }

    return months;
  }, [expenses, incomes]);

  // ── Summary stats ────────────────────────────────────────────────────────
  const totalIncome = useMemo(() => chartData.reduce((s, r) => s + r.income, 0), [chartData]);
  const totalExpense = useMemo(() => chartData.reduce((s, r) => s + r.expense, 0), [chartData]);
  const totalNet = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalNet / totalIncome) * 100).toFixed(1) : "0.0";

  return (
    <>
      <Card className="col-span-full lg:col-span-2 border-border/50 overflow-hidden">
        {/* ── Card Header ──────────────────────────────────────────────── */}
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <Wallet className="h-4 w-4 text-blue-500" />
                </div>
                <CardTitle className="text-foreground text-lg">Income vs Expenses</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground ml-9">
                Monthly cash-flow comparison for the last 6 months
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowIncomeList(true)}
              className="flex items-center gap-1.5 text-xs h-8"
            >
              <Receipt className="h-3.5 w-3.5" />
              View Incomes
            </Button>
          </div>

          {/* Summary stat pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {/* Income */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "#10b98118", border: "1px solid #10b98140", color: "#10b981" }}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Income: {fmt(totalIncome)}
            </div>

            {/* Expense */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "#f43f5e18", border: "1px solid #f43f5e40", color: "#f43f5e" }}
            >
              <TrendingDown className="h-3.5 w-3.5" />
              Expenses: {fmt(totalExpense)}
            </div>

            {/* Net */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: totalNet >= 0 ? "#3b82f618" : "#f43f5e18",
                border: `1px solid ${totalNet >= 0 ? "#3b82f640" : "#f43f5e40"}`,
                color: totalNet >= 0 ? "#3b82f6" : "#f43f5e",
              }}
            >
              <Wallet className="h-3.5 w-3.5" />
              Net: {fmtFull(totalNet)}
            </div>

            {/* Savings rate */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "#8b5cf618", border: "1px solid #8b5cf640", color: "#8b5cf6" }}
            >
              Savings Rate: {savingsRate}%
            </div>
          </div>
        </CardHeader>

        {/* ── Chart ────────────────────────────────────────────────────── */}
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 8, bottom: 0 }}
            >
              <defs>
                {/* Income gradient */}
                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.03} />
                </linearGradient>
                {/* Expense gradient */}
                <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                stroke="hsl(var(--border))"
                vertical={false}
                strokeOpacity={0.5}
              />

              <XAxis
                dataKey="month"
                stroke="hsl(var(--border))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))", strokeOpacity: 0.5 }}
              />

              <YAxis
                stroke="hsl(var(--border))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={fmt}
                width={58}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1, strokeDasharray: "4 4" }} />

              {/* Zero reference line */}
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="4 4" strokeOpacity={0.6} />

              {/* Income area */}
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#gradIncome)"
                dot={{ fill: "#10b981", stroke: "#fff", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={900}
                animationEasing="ease-out"
              />

              {/* Expense area */}
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#f43f5e"
                strokeWidth={2.5}
                fill="url(#gradExpense)"
                dot={{ fill: "#f43f5e", stroke: "#fff", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#f43f5e", strokeWidth: 2, fill: "#fff" }}
                isAnimationActive={true}
                animationBegin={150}
                animationDuration={900}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>

          <CustomLegend />
        </CardContent>
      </Card>

      {/* ── Income List Dialog ────────────────────────────────────────── */}
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
