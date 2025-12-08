import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Percent, Edit, Trash2 } from "lucide-react";
import { FixedDeposit } from "@/hooks/useAssets";
import { EditFixedDepositDialog } from "./EditFixedDepositDialog";
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

interface FixedDepositDetailsProps {
  deposits: FixedDeposit[];
  onUpdate: (id: string, data: Partial<FixedDeposit>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const FixedDepositDetails = ({ deposits, onUpdate, onDelete }: FixedDepositDetailsProps) => {
  const [editDeposit, setEditDeposit] = useState<FixedDeposit | null>(null);
  const [deleteDepositId, setDeleteDepositId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteDepositId) return;
    
    try {
      await onDelete(deleteDepositId);
      toast.success("Fixed deposit deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete fixed deposit");
    } finally {
      setDeleteDepositId(null);
    }
  };
  if (deposits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No deposits added yet. Click "Add Deposit" to get started.
      </div>
    );
  }

  // Calculate maturity amount based on deposit type
  const calculateMaturityAmount = (fd: FixedDeposit) => {
    const years = (new Date(fd.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365);
    
    if (fd.depositType === 'RD') {
      // For RD: M = P × [{(1 + r/n)^(n×t) – 1} / (r/n)] × (1 + r/n)
      // Simplified monthly compound interest formula for RD
      const months = Math.max(0, Math.ceil(years * 12));
      const monthlyRate = fd.interestRate / 100 / 12;
      if (monthlyRate === 0) return fd.amount * months;
      const maturity = fd.amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      return maturity;
    } else {
      // For FD: Standard compound interest
      const maturityAmount = fd.amount * Math.pow(1 + fd.interestRate / 100, years);
      return maturityAmount;
    }
  };

  const totalPrincipal = deposits.reduce((sum, fd) => {
    if (fd.depositType === 'RD') {
      const years = (new Date(fd.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365);
      const months = Math.max(0, Math.ceil(years * 12));
      return sum + (fd.amount * months);
    }
    return sum + fd.amount;
  }, 0);
  const totalMaturityAmount = deposits.reduce((sum, fd) => sum + calculateMaturityAmount(fd), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Deposits</h3>
          <p className="text-sm text-muted-foreground">{deposits.length} active deposit{deposits.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total Principal</p>
          <p className="text-2xl font-bold text-foreground">₹{totalPrincipal.toLocaleString('en-IN')}</p>
          <p className="text-xs text-accent font-medium">
            Maturity: ₹{totalMaturityAmount.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {deposits.map((fd) => {
          const maturityAmount = calculateMaturityAmount(fd);
          
          return (
            <Card 
              key={fd.id}
              className="p-4 hover:shadow-md transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-secondary/20"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{fd.bankName}</h4>
                    <Badge variant="outline" className="mt-1">
                      {fd.depositType === 'RD' ? 'Recurring Deposit' : 'Fixed Deposit'}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    {fd.interestRate}% p.a.
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {fd.depositType === 'RD' ? 'Monthly Installment' : 'Principal Amount'}
                    </p>
                    <p className="text-lg font-bold text-foreground">₹{fd.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Maturity Amount</p>
                    <p className="text-lg font-bold text-accent">₹{maturityAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Matures on: {new Date(fd.maturityDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditDeposit(fd)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => setDeleteDepositId(fd.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
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
