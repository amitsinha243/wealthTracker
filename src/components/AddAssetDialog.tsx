import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAssets } from '@/hooks/useAssets';
import { toast } from 'sonner';

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'savings' | 'mutual-fund' | 'fixed-deposit';
}

export const AddAssetDialog = ({ open, onOpenChange, type }: AddAssetDialogProps) => {
  const { addSavingsAccount, addMutualFund, addFixedDeposit } = useAssets();
  const [formData, setFormData] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'savings') {
      addSavingsAccount({
        bank: formData.bank,
        accountNumber: formData.accountNumber,
        balance: parseFloat(formData.balance),
        interestRate: parseFloat(formData.interestRate)
      });
    } else if (type === 'mutual-fund') {
      addMutualFund({
        name: formData.name,
        units: parseFloat(formData.units),
        nav: parseFloat(formData.nav),
        investedAmount: parseFloat(formData.investedAmount)
      });
    } else if (type === 'fixed-deposit') {
      addFixedDeposit({
        bank: formData.bank,
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate),
        maturityDate: formData.maturityDate,
        maturityAmount: parseFloat(formData.maturityAmount)
      });
    }

    toast.success('Asset added successfully!');
    setFormData({});
    onOpenChange(false);
  };

  const renderForm = () => {
    if (type === 'savings') {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="bank">Bank Name</Label>
            <Input id="bank" value={formData.bank || ''} onChange={(e) => setFormData({ ...formData, bank: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input id="accountNumber" value={formData.accountNumber || ''} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="balance">Balance (₹)</Label>
            <Input id="balance" type="number" value={formData.balance || ''} onChange={(e) => setFormData({ ...formData, balance: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input id="interestRate" type="number" step="0.01" value={formData.interestRate || ''} onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })} required />
          </div>
        </>
      );
    } else if (type === 'mutual-fund') {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Fund Name</Label>
            <Input id="name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="units">Units</Label>
            <Input id="units" type="number" step="0.001" value={formData.units || ''} onChange={(e) => setFormData({ ...formData, units: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nav">NAV (₹)</Label>
            <Input id="nav" type="number" step="0.01" value={formData.nav || ''} onChange={(e) => setFormData({ ...formData, nav: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="investedAmount">Invested Amount (₹)</Label>
            <Input id="investedAmount" type="number" value={formData.investedAmount || ''} onChange={(e) => setFormData({ ...formData, investedAmount: e.target.value })} required />
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="bank">Bank Name</Label>
            <Input id="bank" value={formData.bank || ''} onChange={(e) => setFormData({ ...formData, bank: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" type="number" value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input id="interestRate" type="number" step="0.01" value={formData.interestRate || ''} onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maturityDate">Maturity Date</Label>
            <Input id="maturityDate" type="date" value={formData.maturityDate || ''} onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maturityAmount">Maturity Amount (₹)</Label>
            <Input id="maturityAmount" type="number" value={formData.maturityAmount || ''} onChange={(e) => setFormData({ ...formData, maturityAmount: e.target.value })} required />
          </div>
        </>
      );
    }
  };

  const getTitle = () => {
    if (type === 'savings') return 'Add Savings Account';
    if (type === 'mutual-fund') return 'Add Mutual Fund';
    return 'Add Fixed Deposit';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderForm()}
          <Button type="submit" className="w-full">Add Asset</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
