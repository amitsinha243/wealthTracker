import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpenseBooks } from "@/hooks/useExpenseBooks";
import { useToast } from "@/hooks/use-toast";

interface AddExpenseBookExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  memberNames: string[];
  memberUserIds: string[];
}

export const AddExpenseBookExpenseDialog = ({
  open,
  onOpenChange,
  bookId,
  memberNames,
  memberUserIds,
}: AddExpenseBookExpenseDialogProps) => {
  const { addExpense } = useExpenseBooks();
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidByIndex, setPaidByIndex] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paidByIndex) {
      toast({
        title: "Error",
        description: "Please select who paid",
        variant: "destructive",
      });
      return;
    }

    try {
      const idx = parseInt(paidByIndex);
      await addExpense(bookId, {
        description,
        amount: parseFloat(amount),
        paidBy: memberNames[idx],
        paidByUserId: memberUserIds[idx],
        expenseDate,
      });

      toast({
        title: "Success",
        description: "Expense added successfully",
      });

      // Reset form
      setDescription("");
      setAmount("");
      setPaidByIndex("");
      setExpenseDate(new Date().toISOString().split("T")[0]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eb-description">Description *</Label>
            <Input
              id="eb-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Groceries"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eb-amount">Amount (₹) *</Label>
            <Input
              id="eb-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eb-paidBy">Paid By *</Label>
            <Select value={paidByIndex} onValueChange={setPaidByIndex}>
              <SelectTrigger>
                <SelectValue placeholder="Select who paid" />
              </SelectTrigger>
              <SelectContent>
                {memberNames.map((name, idx) => (
                  <SelectItem key={idx} value={String(idx)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eb-date">Date *</Label>
            <Input
              id="eb-date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
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
