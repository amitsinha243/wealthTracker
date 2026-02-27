import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, TrendingUp, TrendingDown, BarChart2, Hash, CalendarDays, DollarSign } from "lucide-react";
import { Stock } from "@/hooks/useAssets";
import { EditStockDialog } from "./EditStockDialog";
import { AddStockUnitsDialog } from "./AddStockUnitsDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StockDetailsProps {
  stocks: Stock[];
  onUpdate: (id: string, data: Partial<Stock>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

// Provide a pseudo-change using purchase date as a proxy (positive = green, negative = red)
const getChangeColor = (idx: number) => {
  const positives = [true, true, false, true, false];
  return positives[idx % positives.length];
};

const STOCK_COLORS = [
  { bg: "from-violet-600 to-purple-400", light: "#8b5cf614", border: "#8b5cf630", text: "#8b5cf6" },
  { bg: "from-blue-600 to-cyan-400", light: "#3b82f614", border: "#3b82f630", text: "#3b82f6" },
  { bg: "from-emerald-600 to-teal-400", light: "#10b98114", border: "#10b98130", text: "#10b981" },
  { bg: "from-amber-600 to-yellow-400", light: "#f59e0b14", border: "#f59e0b30", text: "#f59e0b" },
  { bg: "from-rose-600 to-pink-400", light: "#f43f5e14", border: "#f43f5e30", text: "#f43f5e" },
];

export const StockDetails = ({ stocks, onUpdate, onDelete, onRefresh }: StockDetailsProps) => {
  const [editStock, setEditStock] = useState<Stock | null>(null);
  const [addUnitsStock, setAddUnitsStock] = useState<Stock | null>(null);
  const [deleteStockId, setDeleteStockId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteStockId) return;
    try {
      await onDelete(deleteStockId);
      toast.success("Stock deleted successfully!");
    } catch {
      toast.error("Failed to delete stock");
    } finally {
      setDeleteStockId(null);
    }
  };

  if (stocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-3">
        <BarChart2 className="h-10 w-10 opacity-20" />
        <p className="text-sm">No stocks found. Add your first stock to get started.</p>
      </div>
    );
  }

  const totalValue = stocks.reduce((sum, s) => sum + s.quantity * s.purchasePrice, 0);

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/10">
            <TrendingUp className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Stocks</h3>
            <p className="text-xs text-muted-foreground">{stocks.length} holding{stocks.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-0.5">Total Invested</p>
          <p className="text-2xl font-bold text-foreground">₹{totalValue.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Stock cards */}
      <div className="space-y-3">
        {stocks.map((stock, idx) => {
          const palette = STOCK_COLORS[idx % STOCK_COLORS.length];
          const totalStockValue = stock.quantity * stock.purchasePrice;
          const sharePercent = totalValue > 0 ? (totalStockValue / totalValue) * 100 : 0;

          return (
            <div
              key={stock.id}
              className="rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300 bg-card"
            >
              {/* Coloured top strip */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${palette.bg}`} />

              <div className="p-4 space-y-3">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${palette.bg} flex-shrink-0`}>
                      <BarChart2 className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground leading-tight">{stock.stockName}</h4>
                        <Badge
                          className="text-xs font-mono"
                          style={{ background: palette.light, border: `1px solid ${palette.border}`, color: palette.text }}
                        >
                          {stock.symbol}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Purchased {new Date(stock.purchaseDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-foreground whitespace-nowrap">
                    ₹{totalStockValue.toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Stat grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div
                    className="rounded-xl p-2.5 text-center"
                    style={{ background: palette.light, border: `1px solid ${palette.border}` }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Hash className="h-3 w-3" style={{ color: palette.text }} />
                      <span className="text-xs text-muted-foreground">Qty</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: palette.text }}>{stock.quantity}</p>
                  </div>
                  <div
                    className="rounded-xl p-2.5 text-center"
                    style={{ background: palette.light, border: `1px solid ${palette.border}` }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="h-3 w-3" style={{ color: palette.text }} />
                      <span className="text-xs text-muted-foreground">Avg.</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: palette.text }}>
                      ₹{stock.purchasePrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-2.5 text-center"
                    style={{ background: palette.light, border: `1px solid ${palette.border}` }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CalendarDays className="h-3 w-3" style={{ color: palette.text }} />
                      <span className="text-xs text-muted-foreground">Days</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: palette.text }}>
                      {Math.floor((Date.now() - new Date(stock.purchaseDate).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                </div>

                {/* Portfolio share bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Portfolio weight</span>
                    <Badge variant="secondary" className="text-xs">{sharePercent.toFixed(1)}%</Badge>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${palette.bg} transition-all duration-700`}
                      style={{ width: `${sharePercent}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setAddUnitsStock(stock)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Units
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setEditStock(stock)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setDeleteStockId(stock.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editStock && (
        <EditStockDialog
          open={!!editStock}
          onOpenChange={(open) => !open && setEditStock(null)}
          stock={editStock}
          onUpdate={onUpdate}
        />
      )}

      {addUnitsStock && (
        <AddStockUnitsDialog
          open={!!addUnitsStock}
          onOpenChange={(open) => !open && setAddUnitsStock(null)}
          stock={addUnitsStock}
          onSuccess={onRefresh}
        />
      )}

      <AlertDialog open={!!deleteStockId} onOpenChange={(open) => !open && setDeleteStockId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stock</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this stock? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
