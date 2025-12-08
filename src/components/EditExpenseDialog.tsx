import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssets } from "@/hooks/useAssets";
import { toast } from "sonner";
import { EXPENSE_CATEGORIES } from "@/types/models";
import { Expense } from "@/hooks/useExpenses";

interface EditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onUpdate: (id: string, data: Omit<Expense, 'id'>) => Promise<void>;
}

export const EditExpenseDialog = ({ open, onOpenChange, expense, onUpdate }: EditExpenseDialogProps) => {
  const { savingsAccounts } = useAssets();
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [savingsAccountId, setSavingsAccountId] = useState("");

  useEffect(() => {
    if (expense) {
      setCategory(expense.category);
      setAmount(expense.amount.toString());
      setDate(expense.date.split('T')[0]);
      setDescription(expense.description || "");
      setSavingsAccountId(expense.savingsAccountId || "");
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expense) return;
    
    if (!category || !amount || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    await onUpdate(expense.id, {
      category,
      amount: parseFloat(amount),
      date,
      description,
      savingsAccountId: savingsAccountId || undefined,
    });

    toast.success("Expense updated successfully");
    onOpenChange(false);
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber || accountNumber.length < 2) return accountNumber;
    return '****' + accountNumber.slice(-2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
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
            <Label htmlFor="savingsAccount">Bank Account (Optional)</Label>
            <Select value={savingsAccountId || "none"} onValueChange={(val) => setSavingsAccountId(val === "none" ? "" : val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
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
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
