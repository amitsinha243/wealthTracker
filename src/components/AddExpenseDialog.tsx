import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpenses } from "@/hooks/useExpenses";
import { useAssets, SavingsAccount } from "@/hooks/useAssets";
import { toast } from "sonner";
import { EXPENSE_CATEGORIES } from "@/types/models";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddExpenseDialog = ({ open, onOpenChange }: AddExpenseDialogProps) => {
  const { addExpense } = useExpenses();
  const { savingsAccounts, fetchAssets } = useAssets();
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [savingsAccountId, setSavingsAccountId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !amount || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const expenseAmount = parseFloat(amount);
    
    // Check if selected account has sufficient balance
    if (savingsAccountId) {
      const selectedAccount = savingsAccounts.find(acc => acc.id === savingsAccountId);
      if (selectedAccount && selectedAccount.balance < expenseAmount) {
        toast.error(`Insufficient balance in ${selectedAccount.bankName}. Available: ₹${selectedAccount.balance.toLocaleString()}`);
        return;
      }
    }

    await addExpense({
      category,
      amount: expenseAmount,
      date,
      description,
      savingsAccountId: savingsAccountId || undefined,
    });

    // Refresh assets to show updated balance
    if (savingsAccountId) {
      await fetchAssets();
    }

    toast.success("Expense added successfully");
    setCategory("");
    setAmount("");
    setDate(new Date().toISOString().split('T')[0]);
    setDescription("");
    setSavingsAccountId("");
    onOpenChange(false);
  };

  // Mask account number to show only last 2 digits
  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber || accountNumber.length < 2) return accountNumber;
    return '****' + accountNumber.slice(-2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="savingsAccount">Deduct from Bank Account (Optional)</Label>
            <Select value={savingsAccountId || "none"} onValueChange={(val) => setSavingsAccountId(val === "none" ? "" : val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select account to deduct from" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {savingsAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.bankName} ({maskAccountNumber(account.accountNumber)}) - ₹{account.balance.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {savingsAccountId && (
              <p className="text-xs text-muted-foreground">
                Amount will be automatically deducted from the selected account
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
