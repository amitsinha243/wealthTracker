import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Edit, Trash2, Percent, TrendingUp, Landmark } from "lucide-react";
import { SavingsAccount } from "@/hooks/useAssets";
import { EditSavingsAccountDialog } from "./EditSavingsAccountDialog";
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
import { maskAccountNumber } from "@/lib/utils";

interface SavingsAccountDetailsProps {
  accounts: SavingsAccount[];
  onUpdate: (id: string, data: Partial<SavingsAccount>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const BANK_COLORS = [
  { bg: "from-blue-600 to-blue-400", light: "#3b82f618", border: "#3b82f640", text: "#3b82f6" },
  { bg: "from-emerald-600 to-emerald-400", light: "#10b98118", border: "#10b98140", text: "#10b981" },
  { bg: "from-violet-600 to-violet-400", light: "#8b5cf618", border: "#8b5cf640", text: "#8b5cf6" },
  { bg: "from-amber-600 to-amber-400", light: "#f59e0b18", border: "#f59e0b40", text: "#f59e0b" },
  { bg: "from-rose-600 to-rose-400", light: "#f43f5e18", border: "#f43f5e40", text: "#f43f5e" },
];

export const SavingsAccountDetails = ({ accounts, onUpdate, onDelete }: SavingsAccountDetailsProps) => {
  const [editAccount, setEditAccount] = useState<SavingsAccount | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteAccountId) return;
    try {
      await onDelete(deleteAccountId);
      toast.success("Savings account deleted successfully!");
    } catch {
      toast.error("Failed to delete savings account");
    } finally {
      setDeleteAccountId(null);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-3">
        <Landmark className="h-10 w-10 opacity-20" />
        <p className="text-sm">No savings accounts added yet.</p>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10">
            <Building2 className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Savings Accounts</h3>
            <p className="text-xs text-muted-foreground">{accounts.length} account{accounts.length !== 1 ? "s" : ""} · Total across all banks</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-0.5">Total Balance</p>
          <p className="text-2xl font-bold text-foreground">₹{totalBalance.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Account cards */}
      <div className="space-y-3">
        {accounts.map((account, idx) => {
          const palette = BANK_COLORS[idx % BANK_COLORS.length];
          const sharePercent = totalBalance > 0 ? (account.balance / totalBalance) * 100 : 0;
          // Estimated annual interest
          const annualInterest = (account.balance * account.interestRate) / 100;

          return (
            <div
              key={account.id}
              className="rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300 bg-card"
            >
              {/* Coloured top strip */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${palette.bg}`} />

              <div className="p-4 space-y-3">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${palette.bg} flex-shrink-0`}>
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground leading-tight">{account.bankName}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        A/c {maskAccountNumber(account.accountNumber)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-foreground whitespace-nowrap">
                    ₹{account.balance.toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Stat chips */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: palette.light, border: `1px solid ${palette.border}`, color: palette.text }}
                  >
                    <Percent className="h-3 w-3" />
                    {account.interestRate}% p.a.
                  </span>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: "#10b98114", border: "1px solid #10b98130", color: "#10b981" }}
                  >
                    <TrendingUp className="h-3 w-3" />
                    ~₹{annualInterest.toLocaleString("en-IN", { maximumFractionDigits: 0 })} / yr
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {sharePercent.toFixed(1)}% of total
                  </Badge>
                </div>

                {/* Share-of-total mini progress bar */}
                <div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${palette.bg} transition-all duration-700`}
                      style={{ width: `${sharePercent}%` }}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setEditAccount(account)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setDeleteAccountId(account.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editAccount && (
        <EditSavingsAccountDialog
          open={!!editAccount}
          onOpenChange={(open) => !open && setEditAccount(null)}
          account={editAccount}
          onUpdate={onUpdate}
        />
      )}

      <AlertDialog open={!!deleteAccountId} onOpenChange={(open) => !open && setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Savings Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this savings account? This action cannot be undone.
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
