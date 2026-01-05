import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FixedDeposit, useAssets } from "@/hooks/useAssets";

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
  const { savingsAccounts } = useAssets();
  const [bankName, setBankName] = useState(deposit.bankName);
  const [amount, setAmount] = useState(deposit.amount.toString());
  const [interestRate, setInterestRate] = useState(deposit.interestRate.toString());
  const [maturityDate, setMaturityDate] = useState(deposit.maturityDate);
  const [depositType, setDepositType] = useState<'FD' | 'RD'>(deposit.depositType || 'FD');
  const [startDate, setStartDate] = useState(deposit.startDate || '');
  const [savingsAccountId, setSavingsAccountId] = useState(deposit.savingsAccountId || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onUpdate(deposit.id, {
        bankName,
        amount: parseFloat(amount),
        interestRate: parseFloat(interestRate),
        maturityDate,
        depositType,
        startDate: depositType === 'RD' ? startDate : undefined,
        savingsAccountId: depositType === 'RD' ? (savingsAccountId || undefined) : undefined
      });
      
      toast.success("Deposit updated successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update deposit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Deposit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="depositType">Deposit Type</Label>
            <Select value={depositType} onValueChange={(value: 'FD' | 'RD') => setDepositType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select deposit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FD">Fixed Deposit (FD)</SelectItem>
                <SelectItem value="RD">Recurring Deposit (RD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            <Label htmlFor="amount">{depositType === 'RD' ? 'Monthly Installment (₹)' : 'Amount (₹)'}</Label>
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
          {depositType === 'RD' && (
            <>
              <div>
                <Label htmlFor="startDate">RD Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="savingsAccountId">Linked Bank Account (for auto-deduction)</Label>
                <Select value={savingsAccountId} onValueChange={setSavingsAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No account linked</SelectItem>
                    {savingsAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bankName} - ****{account.accountNumber.slice(-4)} (₹{account.balance.toLocaleString('en-IN')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Monthly installment will be auto-deducted from this account</p>
              </div>
            </>
          )}
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
