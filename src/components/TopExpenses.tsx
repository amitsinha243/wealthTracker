import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenses } from "@/hooks/useExpenses";
import {
  ShoppingCart, Utensils, Car, Home, Zap, Heart, Plane, BookOpen,
  Music, Gift, Smartphone, MoreHorizontal, Receipt,
} from "lucide-react";

// ── Category icon + colour map ────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; gradient: string; light: string; border: string; color: string }> = {
  "Food": { icon: Utensils, gradient: "from-orange-500 to-amber-400", light: "#f9731614", border: "#f9731630", color: "#f97316" },
  "Groceries": { icon: ShoppingCart, gradient: "from-green-500 to-emerald-400", light: "#22c55e14", border: "#22c55e30", color: "#22c55e" },
  "Transport": { icon: Car, gradient: "from-blue-500 to-cyan-400", light: "#3b82f614", border: "#3b82f630", color: "#3b82f6" },
  "Housing": { icon: Home, gradient: "from-violet-500 to-purple-400", light: "#8b5cf614", border: "#8b5cf630", color: "#8b5cf6" },
  "Utilities": { icon: Zap, gradient: "from-yellow-500 to-amber-400", light: "#eab30814", border: "#eab30830", color: "#eab308" },
  "Health": { icon: Heart, gradient: "from-rose-500 to-pink-400", light: "#f43f5e14", border: "#f43f5e30", color: "#f43f5e" },
  "Travel": { icon: Plane, gradient: "from-sky-500 to-blue-400", light: "#0ea5e914", border: "#0ea5e930", color: "#0ea5e9" },
  "Education": { icon: BookOpen, gradient: "from-indigo-500 to-blue-400", light: "#6366f114", border: "#6366f130", color: "#6366f1" },
  "Entertainment": { icon: Music, gradient: "from-fuchsia-500 to-pink-400", light: "#d946ef14", border: "#d946ef30", color: "#d946ef" },
  "Gifts": { icon: Gift, gradient: "from-red-500 to-rose-400", light: "#ef444414", border: "#ef444430", color: "#ef4444" },
  "Electronics": { icon: Smartphone, gradient: "from-slate-500 to-gray-400", light: "#64748b14", border: "#64748b30", color: "#64748b" },
};

const RANK_GRADIENTS = [
  "from-amber-500 to-yellow-400",
  "from-slate-400 to-gray-300",
  "from-orange-600 to-amber-500",
  "from-blue-500 to-cyan-400",
  "from-violet-500 to-purple-400",
];

const RANK_COLORS = ["#f59e0b", "#94a3b8", "#ea580c", "#3b82f6", "#8b5cf6"];

function getCategoryConfig(category: string) {
  // Exact match first
  if (CATEGORY_CONFIG[category]) return CATEGORY_CONFIG[category];
  // Partial match
  const key = Object.keys(CATEGORY_CONFIG).find((k) =>
    category.toLowerCase().includes(k.toLowerCase())
  );
  return key
    ? CATEGORY_CONFIG[key]
    : { icon: MoreHorizontal, gradient: "from-gray-500 to-slate-400", light: "#6b728014", border: "#6b728030", color: "#6b7280" };
}

const fmt = (v: number) =>
  v >= 1_00_000
    ? `₹${(v / 1_00_000).toFixed(1)}L`
    : v >= 1_000
      ? `₹${(v / 1_000).toFixed(1)}k`
      : `₹${v.toFixed(0)}`;

// ── Component ─────────────────────────────────────────────────────────────────
export const TopExpenses = () => {
  const { expenses: allExpenses } = useExpenses();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthExpenses = allExpenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const categoryTotals = monthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalAmount = Object.values(categoryTotals).reduce((s, v) => s + v, 0);

  const topExpenses = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <Card className="border-border/50 overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="p-1.5 rounded-lg bg-rose-500/10">
                <Receipt className="h-4 w-4 text-rose-500" />
              </div>
              <CardTitle className="text-foreground text-base">Top 5 Expenses</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground ml-8">{monthName}</p>
          </div>

          {/* Total pill */}
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-muted-foreground">Total spent</p>
            <p className="text-lg font-bold text-foreground">
              {fmt(totalAmount)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {topExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
            <Receipt className="h-8 w-8 opacity-20" />
            <p className="text-sm">No expenses recorded for {monthName}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topExpenses.map((expense, index) => {
              const cfg = getCategoryConfig(expense.category);
              const Icon = cfg.icon;
              const rankGrad = RANK_GRADIENTS[index];
              const rankColor = RANK_COLORS[index];

              return (
                <div
                  key={expense.category}
                  className="group flex items-center gap-3 rounded-xl p-3 hover:bg-muted/40 transition-all duration-200 cursor-default"
                >
                  {/* Rank badge */}
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br ${rankGrad} flex items-center justify-center shadow-sm`}
                  >
                    <span className="text-[10px] font-bold text-white leading-none">
                      {index + 1}
                    </span>
                  </div>

                  {/* Category icon */}
                  <div
                    className={`flex-shrink-0 p-2 rounded-xl bg-gradient-to-br ${cfg.gradient} shadow-sm`}
                  >
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>

                  {/* Label + progress bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-foreground/90">
                        {expense.category}
                      </p>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: cfg.light, border: `1px solid ${cfg.border}`, color: cfg.color }}
                        >
                          {expense.percentage}%
                        </span>
                        <p className="text-sm font-bold text-foreground tabular-nums">
                          {fmt(expense.amount)}
                        </p>
                      </div>
                    </div>

                    {/* Gradient progress bar */}
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-700`}
                        style={{ width: `${expense.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Mini summary footer */}
            <div className="mt-2 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>{monthExpenses.length} transaction{monthExpenses.length !== 1 ? "s" : ""} this month</span>
              <span className="font-semibold text-foreground">
                Total: ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
