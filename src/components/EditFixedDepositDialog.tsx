import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FixedDeposit } from "@/hooks/useAssets";

interface EditFixedDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deposit: FixedDeposit;
  onUpdate: (id: string, data: Partial<FixedDeposit>) => Promise<void>;
}

export const EditFixedDepositDialog = ({ 
  open, 
  onOpenChange, 
  deposit,
  onUpdate 
}: EditFixedDepositDialogProps) => {
  const [bankName, setBankName] = useState(deposit.bankName);
  const [amount, setAmount] = useState(deposit.amount.toString());
  const [interestRate, setInterestRate] = useState(deposit.interestRate.toString());
  const [maturityDate, setMaturityDate] = useState(deposit.maturityDate);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onUpdate(deposit.id, {
        bankName,
        amount: parseFloat(amount),
        interestRate: parseFloat(interestRate),
        maturityDate
      });
      
      toast.success("Fixed deposit updated successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update fixed deposit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Fixed Deposit</DialogTitle>
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
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
          <div>
            <Label htmlFor="maturityDate">Maturity Date</Label>
            <Input
              id="maturityDate"
              type="date"
              value={maturityDate}
              onChange={(e) => setMaturityDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Deposit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
