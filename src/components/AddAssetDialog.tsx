import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssets } from '@/hooks/useAssets';
import { toast } from 'sonner';

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'savings' | 'mutual-fund' | 'fixed-deposit' | 'stock';
}

export const AddAssetDialog = ({ open, onOpenChange, type }: AddAssetDialogProps) => {
  const { addSavingsAccount, addMutualFund, addFixedDeposit, addStock } = useAssets();
  const [formData, setFormData] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'savings') {
      addSavingsAccount({
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        balance: parseFloat(formData.balance),
        interestRate: parseFloat(formData.interestRate)
      });
    } else if (type === 'mutual-fund') {
      addMutualFund({
        fundName: formData.fundName,
        schemeName: formData.schemeName,
        units: parseFloat(formData.units),
        nav: parseFloat(formData.nav),
        purchaseDate: formData.purchaseDate
      });
    } else if (type === 'fixed-deposit') {
      addFixedDeposit({
        bankName: formData.bankName,
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate),
        maturityDate: formData.maturityDate,
        depositType: formData.depositType || 'FD'
      });
    } else if (type === 'stock') {
      addStock({
        stockName: formData.stockName,
        symbol: formData.symbol,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        purchaseDate: formData.purchaseDate
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
            <Label htmlFor="bankName">Bank Name</Label>
            <Input id="bankName" value={formData.bankName || ''} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} required />
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
            <Label htmlFor="fundName">Fund Name</Label>
            <Input id="fundName" value={formData.fundName || ''} onChange={(e) => setFormData({ ...formData, fundName: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schemeName">Scheme Name</Label>
            <Input id="schemeName" value={formData.schemeName || ''} onChange={(e) => setFormData({ ...formData, schemeName: e.target.value })} required />
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
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input id="purchaseDate" type="date" value={formData.purchaseDate || ''} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} required />
          </div>
        </>
      );
    } else if (type === 'fixed-deposit') {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="depositType">Deposit Type</Label>
            <Select value={formData.depositType || 'FD'} onValueChange={(value) => setFormData({ ...formData, depositType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select deposit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FD">Fixed Deposit (FD)</SelectItem>
                <SelectItem value="RD">Recurring Deposit (RD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input id="bankName" value={formData.bankName || ''} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">{formData.depositType === 'RD' ? 'Monthly Installment (₹)' : 'Amount (₹)'}</Label>
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
        </>
      );
    } else {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="stockName">Stock Name</Label>
            <Input id="stockName" value={formData.stockName || ''} onChange={(e) => setFormData({ ...formData, stockName: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input id="symbol" value={formData.symbol || ''} onChange={(e) => setFormData({ ...formData, symbol: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" step="0.001" value={formData.quantity || ''} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
            <Input id="purchasePrice" type="number" step="0.01" value={formData.purchasePrice || ''} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input id="purchaseDate" type="date" value={formData.purchaseDate || ''} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} required />
          </div>
        </>
      );
    }
  };

  const getTitle = () => {
    if (type === 'savings') return 'Add Savings Account';
    if (type === 'mutual-fund') return 'Add Mutual Fund';
    if (type === 'stock') return 'Add Stock';
    return 'Add Deposit';
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
