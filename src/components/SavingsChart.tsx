import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { useAssets } from "@/hooks/useAssets";
import { useIncome } from "@/hooks/useIncome";
import { useExpenses } from "@/hooks/useExpenses";
import { useMemo } from "react";
import { TrendingUp } from "lucide-react";

// ── Colour palette ────────────────────────────────────────────────────────────
const SERIES = [
  {
    key: "Savings Accounts",
    color: "#10b981",        // emerald
    gradientStart: "#34d399",
    gradientEnd: "#059669",
    dot: "bg-emerald-400",
  },
  {
    key: "Mutual Funds",
    color: "#3b82f6",        // blue
    gradientStart: "#60a5fa",
    gradientEnd: "#1d4ed8",
    dot: "bg-blue-400",
  },
  {
    key: "Deposits",
    color: "#f59e0b",        // amber
    gradientStart: "#fcd34d",
    gradientEnd: "#d97706",
    dot: "bg-amber-400",
  },
  {
    key: "Stocks",
    color: "#8b5cf6",        // violet
    gradientStart: "#a78bfa",
    gradientEnd: "#6d28d9",
    dot: "bg-violet-400",
  },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  v >= 1_00_000
    ? `₹${(v / 1_00_000).toFixed(1)}L`
    : v >= 1_000
      ? `₹${(v / 1_000).toFixed(1)}k`
      : `₹${v.toFixed(0)}`;

const fmtFull = (v: number) => `₹${v.toLocaleString("en-IN")}`;

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  // The raw row data is accessible via payload[0].payload
  const rawRow = payload[0]?.payload ?? {};

  // For Savings Accounts, use the real signed delta from the raw row
  // so negative months show correctly even though bar is clamped to 0
  const getSavingsDisplayValue = (dataKey: string) => {
    if (dataKey === "Savings Accounts") return rawRow["savingsDelta"] ?? 0;
    const entry = payload.find((p: any) => p.dataKey === dataKey);
    return entry?.value ?? 0;
  };

  // Total uses real signed delta
  const total =
    (rawRow["savingsDelta"] ?? 0) +
    ((rawRow["Mutual Funds"] ?? 0) +
      (rawRow["Deposits"] ?? 0) +
      (rawRow["Stocks"] ?? 0));

  return (
    <div
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "12px",
        padding: "12px 16px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        minWidth: 220,
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "hsl(var(--foreground))",
          marginBottom: 10,
          borderBottom: "1px solid hsl(var(--border))",
          paddingBottom: 6,
        }}
      >
        {label}
      </p>

      {SERIES.map((s) => {
        const displayVal = getSavingsDisplayValue(s.key);
        const isNegative = s.key === "Savings Accounts" && displayVal < 0;
        return (
          <div
            key={s.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: isNegative ? "#ef4444" : s.color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                {s.key}
                {isNegative && <span style={{ fontSize: 10, marginLeft: 4, color: "#ef4444" }}>▼ loss</span>}
              </span>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: isNegative ? "#ef4444" : s.color,
              }}
            >
              {isNegative ? `-${fmtFull(Math.abs(displayVal))}` : fmtFull(displayVal)}
            </span>
          </div>
        );
      })}

      <div
        style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: "1px solid hsl(var(--border))",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
          Net Total
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: total < 0 ? "#ef4444" : "hsl(var(--foreground))",
          }}
        >
          {total < 0 ? `-${fmtFull(Math.abs(total))}` : fmtFull(total)}
        </span>
      </div>
    </div>
  );
};

// ── Custom Legend ─────────────────────────────────────────────────────────────
const CustomLegend = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: 20,
      flexWrap: "wrap",
      marginTop: 12,
    }}
  >
    {SERIES.map((s) => (
      <div
        key={s.key}
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${s.gradientStart}, ${s.gradientEnd})`,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 12,
            color: "hsl(var(--muted-foreground))",
            fontWeight: 500,
          }}
        >
          {s.key}
        </span>
      </div>
    ))}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export const SavingsChart = () => {
  const {
    fixedDeposits,
    mutualFundTransactions,
    stockTransactions,
    loading: assetsLoading
  } = useAssets();

  const { incomes, loading: incomeLoading } = useIncome();
  const { expenses, loading: expenseLoading } = useExpenses();

  const chartData = useMemo(() => {
    const monthlyIncome: { [key: string]: number } = {};
    const monthlyExpense: { [key: string]: number } = {};
    const monthlyFunds: { [key: string]: number } = {};
    const monthlyDeposits: { [key: string]: number } = {};
    const monthlyStocks: { [key: string]: number } = {};

    incomes.forEach(income => {
      const date = new Date(income.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + income.amount;
    });

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyExpense[monthKey] = (monthlyExpense[monthKey] || 0) + expense.amount;
    });

    mutualFundTransactions.forEach((transaction) => {
      const date = new Date(transaction.purchaseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyFunds[monthKey] =
        (monthlyFunds[monthKey] || 0) + transaction.units * transaction.nav;
    });

    fixedDeposits.forEach((deposit) => {
      if (deposit.depositType === "RD") {
        const startDate = new Date(deposit.startDate || deposit.createdAt || new Date());
        const maturityDate = new Date(deposit.maturityDate);
        const now = new Date();
        const endDate = maturityDate < now ? maturityDate : now;

        let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        while (currentDate <= endDate) {
          const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
          monthlyDeposits[monthKey] = (monthlyDeposits[monthKey] || 0) + deposit.amount;
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      } else {
        const date = new Date(deposit.createdAt || new Date());
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyDeposits[monthKey] = (monthlyDeposits[monthKey] || 0) + deposit.amount;
      }
    });

    stockTransactions.forEach((transaction) => {
      const date = new Date(transaction.purchaseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyStocks[monthKey] = (monthlyStocks[monthKey] || 0) + transaction.quantity * transaction.purchasePrice;
    });

    const months: ({
      month: string;
      "Savings Accounts": number;
      savingsDelta: number;
      "Mutual Funds": number;
      Deposits: number;
      Stocks: number;
    })[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthName = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      const mFunds = monthlyFunds[monthKey] || 0;
      const mDeposits = monthlyDeposits[monthKey] || 0;
      const mStocks = monthlyStocks[monthKey] || 0;
      const mIncome = monthlyIncome[monthKey] || 0;
      const mExpense = monthlyExpense[monthKey] || 0;

      // Signed delta: net cash flow after all investments
      const netSavings = mIncome - mExpense;
      const savingsDelta = netSavings - (mFunds + mDeposits + mStocks);

      months.push({
        month: monthName,
        // Bar height is clamped to 0 for negative months
        "Savings Accounts": Math.max(0, savingsDelta),
        // Real signed value for the tooltip
        savingsDelta,
        "Mutual Funds": mFunds,
        Deposits: mDeposits,
        Stocks: mStocks,
      });
    }

    return months;
  }, [incomes, expenses, mutualFundTransactions, stockTransactions, fixedDeposits]);

  // ── Summary stats for header pills ───────────────────────────────────────
  const totals = useMemo(
    () =>
      SERIES.map((s) => ({
        ...s,
        total: chartData.reduce(
          (sum, row) => sum + ((row as any)[s.key] || 0),
          0
        ),
      })),
    [chartData]
  );

  const grandTotal = totals.reduce((s, t) => s + t.total, 0);

  return (
    <Card className="col-span-full lg:col-span-2 border-border/50 overflow-hidden">
      {/* ── Card Header ─────────────────────────────────────────────────── */}
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <CardTitle className="text-foreground text-lg">
                Monthly Savings by Asset Type
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground ml-9">
              Asset additions by category across the last 12 months
            </p>
          </div>

          {/* Grand total pill */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground">12-Month Total</span>
            <span className="text-xl font-bold text-foreground">
              {fmtFull(grandTotal)}
            </span>
          </div>
        </div>

        {/* Per-series stat pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {totals.map((t) => (
            <div
              key={t.key}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: `${t.color}18`,
                border: `1px solid ${t.color}40`,
                color: t.color,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: t.color,
                  display: "inline-block",
                }}
              />
              {t.key}: {fmt(t.total)}
            </div>
          ))}
        </div>
      </CardHeader>

      {/* ── Chart ───────────────────────────────────────────────────────── */}
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={380}>
          <BarChart
            data={chartData}
            barCategoryGap="22%"
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
          >
            {/* Gradient definitions */}
            <defs>
              {SERIES.map((s) => (
                <linearGradient
                  key={s.key}
                  id={`grad-${s.key.replace(/\s/g, "")}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.gradientStart} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={s.gradientEnd} stopOpacity={0.85} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
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
              width={56}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: "hsl(var(--muted))",
                radius: 4,
                fillOpacity: 0.4,
              }}
            />

            <Legend content={<CustomLegend />} />

            {SERIES.map((s, idx) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                stackId="a"
                fill={`url(#grad-${s.key.replace(/\s/g, "")})`}
                maxBarSize={48}
                radius={idx === SERIES.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                isAnimationActive={true}
                animationBegin={idx * 100}
                animationDuration={800}
                animationEasing="ease-out"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
