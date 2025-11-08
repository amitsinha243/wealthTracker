import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SavingsAccount } from "@/hooks/useAssets";

interface EditSavingsAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: SavingsAccount;
  onUpdate: (id: string, data: Partial<SavingsAccount>) => Promise<void>;
}

export const EditSavingsAccountDialog = ({ 
  open, 
  onOpenChange, 
  account,
  onUpdate 
}: EditSavingsAccountDialogProps) => {
  const [bankName, setBankName] = useState(account.bankName);
  const [accountNumber, setAccountNumber] = useState(account.accountNumber);
  const [balance, setBalance] = useState(account.balance.toString());
  const [interestRate, setInterestRate] = useState(account.interestRate.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onUpdate(account.id, {
        bankName,
        accountNumber,
        balance: parseFloat(balance),
        interestRate: parseFloat(interestRate)
      });
      
      toast.success("Savings account updated successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update savings account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Savings Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="balance">Balance (₹)</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
