import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Edit, Trash2 } from "lucide-react";
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

interface SavingsAccountDetailsProps {
  accounts: SavingsAccount[];
  onUpdate: (id: string, data: Partial<SavingsAccount>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const SavingsAccountDetails = ({ accounts, onUpdate, onDelete }: SavingsAccountDetailsProps) => {
  const [editAccount, setEditAccount] = useState<SavingsAccount | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteAccountId) return;
    
    try {
      await onDelete(deleteAccountId);
      toast.success("Savings account deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete savings account");
    } finally {
      setDeleteAccountId(null);
    }
  };
  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No savings accounts added yet. Click "Add Savings Account" to get started.
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Savings Accounts</h3>
          <p className="text-sm text-muted-foreground">Total across all banks</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">₹{totalBalance.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="space-y-3">
        {accounts.map((account) => (
          <Card 
            key={account.id}
            className="p-4 hover:shadow-md transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-secondary/20"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{account.bankName}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A/c: {account.accountNumber}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {account.interestRate}% interest
                  </Badge>
                </div>
              </div>
              <div className="text-right space-y-2">
                <p className="text-xl font-bold text-foreground">
                  ₹{account.balance.toLocaleString('en-IN')}
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditAccount(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteAccountId(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
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
