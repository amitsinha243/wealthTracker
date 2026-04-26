import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpenseBooks } from "@/hooks/useExpenseBooks";
import { useToast } from "@/hooks/use-toast";

interface EditExpenseBookExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  expense: any;
  memberNames: string[];
  memberUserIds: string[];
  onUpdate: () => void;
}

export const EditExpenseBookExpenseDialog = ({
  open,
  onOpenChange,
  bookId,
  expense,
  memberNames,
  memberUserIds,
  onUpdate,
}: EditExpenseBookExpenseDialogProps) => {
  const { updateExpense } = useExpenseBooks();
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidByIndex, setPaidByIndex] = useState("");
  const [expenseDate, setExpenseDate] = useState("");

  useEffect(() => {
    if (expense) {
      setDescription(expense.description || "");
      setAmount(String(expense.amount || ""));
      setExpenseDate(expense.expenseDate || new Date().toISOString().split("T")[0]);

      // Find the index of the paidBy user
      const idx = memberNames.findIndex((name) => name === expense.paidBy);
      setPaidByIndex(idx >= 0 ? String(idx) : "");
    }
  }, [expense, memberNames]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const idx = parseInt(paidByIndex);
      await updateExpense(bookId, expense.id, {
        description,
        amount: parseFloat(amount),
        paidBy: memberNames[idx],
        paidByUserId: memberUserIds[idx],
        expenseDate,
      });

      toast({
        title: "Success",
        description: "Expense updated successfully",
      });

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-eb-description">Description *</Label>
            <Input
              id="edit-eb-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-eb-amount">Amount (₹) *</Label>
            <Input
              id="edit-eb-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-eb-paidBy">Paid By *</Label>
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
            <Label htmlFor="edit-eb-date">Date *</Label>
            <Input
              id="edit-eb-date"
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
            <Button type="submit">Update Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
