import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus, Edit, Trash2, BarChart2, Hash, CalendarDays } from "lucide-react";
import { MutualFund } from "@/hooks/useAssets";
import { AddMutualFundUnitsDialog } from "./AddMutualFundUnitsDialog";
import { EditMutualFundDialog } from "./EditMutualFundDialog";
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

interface MutualFundDetailsProps {
  funds: MutualFund[];
  onRefresh?: () => void;
  onUpdate: (id: string, data: Partial<MutualFund>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const FUND_COLORS = [
  { bg: "from-blue-600 to-indigo-500", light: "#3b82f614", border: "#3b82f630", text: "#3b82f6" },
  { bg: "from-violet-600 to-purple-400", light: "#8b5cf614", border: "#8b5cf630", text: "#8b5cf6" },
  { bg: "from-emerald-600 to-teal-400", light: "#10b98114", border: "#10b98130", text: "#10b981" },
  { bg: "from-amber-600 to-yellow-400", light: "#f59e0b14", border: "#f59e0b30", text: "#f59e0b" },
  { bg: "from-rose-600 to-pink-400", light: "#f43f5e14", border: "#f43f5e30", text: "#f43f5e" },
];

export const MutualFundDetails = ({ funds, onRefresh, onUpdate, onDelete }: MutualFundDetailsProps) => {
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [showAddUnitsDialog, setShowAddUnitsDialog] = useState(false);
  const [editFund, setEditFund] = useState<MutualFund | null>(null);
  const [deleteFundId, setDeleteFundId] = useState<string | null>(null);

  const handleAddUnits = (fund: any) => {
    setSelectedFund(fund);
    setShowAddUnitsDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteFundId) return;
    try {
      await onDelete(deleteFundId);
      toast.success("Mutual fund deleted successfully!");
    } catch {
      toast.error("Failed to delete mutual fund");
    } finally {
      setDeleteFundId(null);
    }
  };

  if (funds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-3">
        <BarChart2 className="h-10 w-10 opacity-20" />
        <p className="text-sm">No mutual funds added yet.</p>
      </div>
    );
  }

  const totalValue = funds.reduce((sum, f) => sum + f.units * f.nav, 0);

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10">
            <BarChart2 className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Mutual Funds</h3>
            <p className="text-xs text-muted-foreground">{funds.length} active investment{funds.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-0.5">Total Value</p>
          <p className="text-2xl font-bold text-foreground">₹{totalValue.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Fund cards */}
      <div className="space-y-3">
        {funds.map((fund, idx) => {
          const palette = FUND_COLORS[idx % FUND_COLORS.length];
          const currentValue = fund.units * fund.nav;
          const sharePercent = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;

          return (
            <div
              key={fund.id}
              className="rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300 bg-card"
            >
              {/* Coloured top strip */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${palette.bg}`} />

              <div className="p-4 space-y-3">
                {/* Fund name & value */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${palette.bg} flex-shrink-0`}>
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground leading-tight truncate">{fund.fundName}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{fund.schemeName}</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-foreground whitespace-nowrap">
                    ₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
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
                      <span className="text-xs text-muted-foreground">Units</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: palette.text }}>{fund.units.toFixed(3)}</p>
                  </div>
                  <div
                    className="rounded-xl p-2.5 text-center"
                    style={{ background: palette.light, border: `1px solid ${palette.border}` }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <BarChart2 className="h-3 w-3" style={{ color: palette.text }} />
                      <span className="text-xs text-muted-foreground">NAV</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: palette.text }}>₹{fund.nav.toFixed(2)}</p>
                  </div>
                  <div
                    className="rounded-xl p-2.5 text-center"
                    style={{ background: palette.light, border: `1px solid ${palette.border}` }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CalendarDays className="h-3 w-3" style={{ color: palette.text }} />
                      <span className="text-xs text-muted-foreground">Since</span>
                    </div>
                    <p className="text-xs font-bold" style={{ color: palette.text }}>
                      {new Date(fund.purchaseDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                    </p>
                  </div>
                </div>

                {/* Share bar + badge */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Portfolio share</span>
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
                    onClick={() => handleAddUnits(fund)}
                    className="flex-1 h-8 text-xs"
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Units
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setEditFund(fund)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setDeleteFundId(fund.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedFund && (
        <AddMutualFundUnitsDialog
          open={showAddUnitsDialog}
          onOpenChange={setShowAddUnitsDialog}
          mutualFund={selectedFund}
          onSuccess={() => onRefresh?.()}
        />
      )}

      {editFund && (
        <EditMutualFundDialog
          open={!!editFund}
          onOpenChange={(open) => !open && setEditFund(null)}
          fund={editFund}
          onUpdate={onUpdate}
        />
      )}

      <AlertDialog open={!!deleteFundId} onOpenChange={(open) => !open && setDeleteFundId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mutual Fund</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this mutual fund? This will also delete all associated transaction history. This action cannot be undone.
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
