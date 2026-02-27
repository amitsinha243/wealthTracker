import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Calendar, Percent, Edit, Trash2, ChevronDown, ChevronUp,
  CheckCircle2, Clock, Landmark, TrendingUp, Timer,
} from "lucide-react";
import { FixedDeposit } from "@/hooks/useAssets";
import { EditFixedDepositDialog } from "./EditFixedDepositDialog";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FixedDepositDetailsProps {
  deposits: FixedDeposit[];
  onUpdate: (id: string, data: Partial<FixedDeposit>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const generateInstallmentHistory = (fd: FixedDeposit) => {
  const startDate = new Date(fd.startDate || fd.createdAt || new Date());
  const maturityDate = new Date(fd.maturityDate);
  const now = new Date();
  const installments: { date: Date; amount: number; status: "paid" | "pending" }[] = [];
  let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  while (currentDate < maturityDate) {
    installments.push({ date: new Date(currentDate), amount: fd.amount, status: currentDate <= now ? "paid" : "pending" });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  return installments;
};

const calculateMaturityAmount = (fd: FixedDeposit) => {
  const startDate = new Date(fd.startDate || fd.createdAt || new Date());
  const maturityDate = new Date(fd.maturityDate);
  const years = (maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  if (fd.depositType === "RD") {
    const quarters = Math.max(0, Math.ceil(years * 4));
    const quarterlyRate = fd.interestRate / 400;
    if (quarterlyRate === 0) return fd.amount * quarters * 3;
    const compoundFactor = Math.pow(1 + quarterlyRate, quarters);
    const denominator = 1 - Math.pow(1 + quarterlyRate, -1 / 3);
    return fd.amount * ((compoundFactor - 1) / denominator);
  }
  return fd.amount * Math.pow(1 + fd.interestRate / 100, years);
};

const getCurrentDepositedAmount = (fd: FixedDeposit) => {
  if (fd.depositType === "RD") {
    const startDate = new Date(fd.startDate || fd.createdAt || new Date());
    const now = new Date();
    const monthsElapsed = Math.max(1, (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth()) + 1);
    const maturityDate = new Date(fd.maturityDate);
    const totalMonths = Math.max(1, (maturityDate.getFullYear() - startDate.getFullYear()) * 12 + (maturityDate.getMonth() - startDate.getMonth()));
    return fd.amount * Math.min(monthsElapsed, totalMonths);
  }
  return fd.amount;
};

const getRDProgress = (fd: FixedDeposit) => {
  const startDate = new Date(fd.startDate || fd.createdAt || new Date());
  const maturityDate = new Date(fd.maturityDate);
  const now = new Date();
  const totalDuration = maturityDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  if (elapsed <= 0) return 0;
  if (elapsed >= totalDuration) return 100;
  return Math.round((elapsed / totalDuration) * 100);
};

const getTotalPrincipal = (fd: FixedDeposit) => {
  if (fd.depositType === "RD") {
    const startDate = new Date(fd.startDate || fd.createdAt || new Date());
    const maturityDate = new Date(fd.maturityDate);
    const totalMonths = Math.max(1, (maturityDate.getFullYear() - startDate.getFullYear()) * 12 + (maturityDate.getMonth() - startDate.getMonth()));
    return fd.amount * totalMonths;
  }
  return fd.amount;
};

const getDaysToMaturity = (fd: FixedDeposit) => {
  const maturityDate = new Date(fd.maturityDate);
  const now = new Date();
  const diff = maturityDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const FD_COLORS = [
  { bg: "from-amber-600 to-yellow-400", light: "#f59e0b14", border: "#f59e0b30", text: "#f59e0b", progress: "bg-amber-400" },
  { bg: "from-emerald-600 to-teal-400", light: "#10b98114", border: "#10b98130", text: "#10b981", progress: "bg-emerald-400" },
  { bg: "from-blue-600 to-cyan-400", light: "#3b82f614", border: "#3b82f630", text: "#3b82f6", progress: "bg-blue-400" },
  { bg: "from-violet-600 to-purple-400", light: "#8b5cf614", border: "#8b5cf630", text: "#8b5cf6", progress: "bg-violet-400" },
  { bg: "from-rose-600 to-pink-400", light: "#f43f5e14", border: "#f43f5e30", text: "#f43f5e", progress: "bg-rose-400" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export const FixedDepositDetails = ({ deposits, onUpdate, onDelete }: FixedDepositDetailsProps) => {
  const [editDeposit, setEditDeposit] = useState<FixedDeposit | null>(null);
  const [deleteDepositId, setDeleteDepositId] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteDepositId) return;
    try {
      await onDelete(deleteDepositId);
      toast.success("Fixed deposit deleted successfully!");
    } catch {
      toast.error("Failed to delete fixed deposit");
    } finally {
      setDeleteDepositId(null);
    }
  };

  if (deposits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-3">
        <Landmark className="h-10 w-10 opacity-20" />
        <p className="text-sm">No deposits added yet. Click "Add Deposit" to get started.</p>
      </div>
    );
  }

  const totalPrincipal = deposits.reduce((s, fd) => s + getTotalPrincipal(fd), 0);
  const totalMaturity = deposits.reduce((s, fd) => s + calculateMaturityAmount(fd), 0);
  const totalInterest = totalMaturity - totalPrincipal;

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10">
            <Landmark className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Deposits</h3>
            <p className="text-xs text-muted-foreground">{deposits.length} active deposit{deposits.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-xs text-muted-foreground">Principal / Maturity</p>
          <p className="text-xl font-bold text-foreground">
            ₹{totalPrincipal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs font-semibold text-emerald-500">
            ▲ ₹{totalInterest.toLocaleString("en-IN", { maximumFractionDigits: 0 })} interest
          </p>
        </div>
      </div>

      {/* Deposit cards */}
      <div className="space-y-3">
        {deposits.map((fd, idx) => {
          const palette = FD_COLORS[idx % FD_COLORS.length];
          const maturityAmount = calculateMaturityAmount(fd);
          const principal = getTotalPrincipal(fd);
          const interestEarned = maturityAmount - principal;
          const installments = fd.depositType === "RD" ? generateInstallmentHistory(fd) : [];
          const isExpanded = expandedHistoryId === fd.id;
          const rdProgress = fd.depositType === "RD" ? getRDProgress(fd) : getRDProgress(fd); // same formula works for FD too
          const daysToMaturity = getDaysToMaturity(fd);
          const isRD = fd.depositType === "RD";
          const paidCount = installments.filter((i) => i.status === "paid").length;

          return (
            <div
              key={fd.id}
              className="rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300 bg-card"
            >
              {/* Coloured top strip */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${palette.bg}`} />

              <div className="p-4 space-y-3">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${palette.bg} flex-shrink-0`}>
                      <Landmark className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground leading-tight">{fd.bankName}</h4>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge
                          className="text-xs"
                          style={{ background: palette.light, border: `1px solid ${palette.border}`, color: palette.text }}
                        >
                          {isRD ? "Recurring Deposit" : "Fixed Deposit"}
                        </Badge>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: palette.light, border: `1px solid ${palette.border}`, color: palette.text }}
                        >
                          <Percent className="h-2.5 w-2.5" />
                          {fd.interestRate}% p.a.
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Maturity amount */}
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Maturity</p>
                    <p className="text-xl font-bold" style={{ color: palette.text }}>
                      ₹{maturityAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                {/* Stat tiles */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Principal */}
                  <div
                    className="rounded-xl p-2.5 text-center"
                    style={{ background: palette.light, border: `1px solid ${palette.border}` }}
                  >
                    <p className="text-xs text-muted-foreground mb-1">{isRD ? "Monthly" : "Principal"}</p>
                    <p className="text-sm font-bold" style={{ color: palette.text }}>
                      ₹{fd.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  {/* Interest earned */}
                  <div
                    className="rounded-xl p-2.5 text-center"
                    style={{ background: "#10b98114", border: "1px solid #10b98130" }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      <span className="text-xs text-muted-foreground">Interest</span>
                    </div>
                    <p className="text-sm font-bold text-emerald-500">
                      +₹{interestEarned.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  {/* Days to maturity */}
                  <div
                    className="rounded-xl p-2.5 text-center"
                    style={{ background: daysToMaturity < 30 ? "#f43f5e14" : palette.light, border: `1px solid ${daysToMaturity < 30 ? "#f43f5e30" : palette.border}` }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Timer className="h-3 w-3" style={{ color: daysToMaturity < 30 ? "#f43f5e" : palette.text }} />
                      <span className="text-xs text-muted-foreground">Days left</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: daysToMaturity < 30 ? "#f43f5e" : palette.text }}>
                      {daysToMaturity}
                    </p>
                  </div>
                </div>

                {/* For RD — deposited so far */}
                {isRD && (
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                    style={{ background: palette.light, border: `1px solid ${palette.border}` }}
                  >
                    <span className="text-muted-foreground">Deposited so far</span>
                    <span className="font-semibold" style={{ color: palette.text }}>
                      ₹{getCurrentDepositedAmount(fd).toLocaleString("en-IN")} of ₹{principal.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {/* Tenure progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {fd.depositType === "RD" && fd.startDate
                          ? new Date(fd.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "Started"}{" "}
                        →{" "}
                        {new Date(fd.maturityDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <span className="font-semibold" style={{ color: palette.text }}>{rdProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${palette.bg} transition-all duration-700`}
                      style={{ width: `${rdProgress}%` }}
                    />
                  </div>
                </div>

                {/* RD Installment History */}
                {isRD && installments.length > 0 && (
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => setExpandedHistoryId(isExpanded ? null : fd.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs">
                        <span>
                          Installment History — <span className="text-emerald-500 font-semibold">{paidCount} paid</span>
                          {" / "}{installments.length} total
                        </span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-border/50 mt-1">
                        <table className="w-full text-xs">
                          <thead className="bg-muted/50 sticky top-0">
                            <tr>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">#</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Date</th>
                              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Amount</th>
                              <th className="text-center px-3 py-2 font-medium text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {installments.map((inst, i) => (
                              <tr key={i} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                                <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                                <td className="px-3 py-2">
                                  {inst.date.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                                </td>
                                <td className="px-3 py-2 text-right font-medium">₹{inst.amount.toLocaleString("en-IN")}</td>
                                <td className="px-3 py-2 text-center">
                                  {inst.status === "paid" ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
                                      <Clock className="h-3.5 w-3.5" /> Pending
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setEditDeposit(fd)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setDeleteDepositId(fd.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editDeposit && (
        <EditFixedDepositDialog
          open={!!editDeposit}
          onOpenChange={(open) => !open && setEditDeposit(null)}
          deposit={editDeposit}
          onUpdate={onUpdate}
        />
      )}

      <AlertDialog open={!!deleteDepositId} onOpenChange={(open) => !open && setDeleteDepositId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deposit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this deposit? This action cannot be undone.
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
