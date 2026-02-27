import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon, Eye, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AssetCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  change?: number;
  description?: string;
  onViewDetails?: () => void;
  // Richer props
  accentGradient?: string;        // e.g. "from-blue-600 to-indigo-500"
  accentLight?: string;           // e.g. "#3b82f614"
  accentBorder?: string;          // e.g. "#3b82f630"
  accentColor?: string;           // e.g. "#3b82f6"
  thisMonth?: number;
  lastMonth?: number;
  count?: number;
  countLabel?: string;
}

export const AssetCard = ({
  title,
  amount,
  icon: Icon,
  change,
  description,
  onViewDetails,
  accentGradient = "from-primary to-primary/70",
  accentLight = "hsl(var(--primary) / 0.08)",
  accentBorder = "hsl(var(--primary) / 0.25)",
  accentColor = "hsl(var(--primary))",
  thisMonth,
  lastMonth,
  count,
  countLabel,
}: AssetCardProps) => {
  const isPositive = change !== undefined && change > 0;
  const isNeutral = change === 0 || change === undefined;

  // Month-over-month delta
  const momDelta =
    thisMonth !== undefined && lastMonth !== undefined
      ? thisMonth - lastMonth
      : undefined;
  const momPositive = momDelta !== undefined && momDelta >= 0;

  return (
    <Card className="overflow-hidden border-border/50 bg-card hover:shadow-xl transition-all duration-300 group relative">
      {/* Decorative blurred accent blob */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${accentGradient} opacity-10 blur-2xl pointer-events-none group-hover:opacity-20 transition-opacity duration-500`}
      />

      {/* Subtle left accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${accentGradient} rounded-l`}
      />

      <CardContent className="pt-5 pb-4 pl-5 pr-4">
        {/* Top row: title + icon */}
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <div
            className={`p-2.5 rounded-xl bg-gradient-to-br ${accentGradient} shadow-md flex-shrink-0`}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Main amount */}
        <p className="text-2xl font-bold text-foreground leading-tight mb-1">
          ₹{amount.toLocaleString("en-IN")}
        </p>

        {/* Count pill */}
        {count !== undefined && countLabel && (
          <p className="text-xs text-muted-foreground mb-3">
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium mr-1"
              style={{ background: accentLight, border: `1px solid ${accentBorder}`, color: accentColor }}
            >
              {count}
            </span>
            {countLabel}
          </p>
        )}

        {/* Divider */}
        <div className="h-px bg-border/50 my-3" />

        {/* This month vs last month */}
        {thisMonth !== undefined && lastMonth !== undefined && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">This month</p>
              <p
                className="text-sm font-semibold"
                style={{ color: accentColor }}
              >
                ₹{thisMonth.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Last month</p>
              <p className="text-sm font-semibold text-muted-foreground">
                ₹{lastMonth.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        )}

        {/* MoM delta badge */}
        {momDelta !== undefined && (
          <div className="flex items-center gap-1.5 mb-3">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={
                momDelta === 0
                  ? { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
                  : momPositive
                    ? { background: "#10b98114", border: "1px solid #10b98130", color: "#10b981" }
                    : { background: "#f43f5e14", border: "1px solid #f43f5e30", color: "#f43f5e" }
              }
            >
              {momDelta === 0 ? (
                <Minus className="h-3 w-3" />
              ) : momPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {momDelta === 0
                ? "No change"
                : `${momPositive ? "+" : ""}₹${Math.abs(momDelta).toLocaleString("en-IN")} vs last month`}
            </span>
          </div>
        )}

        {/* Legacy change indicator (kept for compatibility) */}
        {change !== undefined && thisMonth === undefined && (
          <p
            className={`text-xs font-medium flex items-center gap-1 mb-3 ${isPositive ? "text-emerald-500" : isNeutral ? "text-muted-foreground" : "text-destructive"
              }`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? "+" : ""}{Math.abs(change)}% from last month
          </p>
        )}

        {/* View details button */}
        {onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs font-medium mt-1 border-border/60 hover:border-transparent transition-all duration-200"
            style={{
              ["--hover-bg" as any]: accentLight,
            }}
            onClick={onViewDetails}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
