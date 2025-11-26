import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIncome, Income } from "@/hooks/useIncome";
import { toast } from "sonner";

const INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment Returns',
  'Rental Income',
  'Other'
] as const;

interface EditIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income: Income;
}

export const EditIncomeDialog = ({ open, onOpenChange, income }: EditIncomeDialogProps) => {
  const { updateIncome } = useIncome();
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    source: 'Salary' as typeof INCOME_SOURCES[number],
    description: ''
  });

  useEffect(() => {
    if (income) {
      setFormData({
        amount: income.amount.toString(),
        date: income.date,
        source: income.source as typeof INCOME_SOURCES[number],
        description: income.description || ''
      });
    }
  }, [income]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateIncome(income.id, {
        amount: parseFloat(formData.amount),
        date: formData.date,
        source: formData.source,
        description: formData.description
      });
      
      toast.success("Income updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update income");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Income</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select
              value={formData.source}
              onValueChange={(value) => setFormData({ ...formData, source: value as typeof INCOME_SOURCES[number] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INCOME_SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">Update Income</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};