import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpenses } from "@/hooks/useExpenses";
import { useAssets } from "@/hooks/useAssets";
import { toast } from "sonner";
import { EXPENSE_CATEGORIES } from "@/types/models";
import {
  Receipt, IndianRupee, Calendar, FileText, Landmark,
  ChevronRight, AlertCircle, ShoppingBag, Utensils,
  Car, Home, Zap, Heart, Plane, Music, TrendingDown
} from "lucide-react";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Food': Utensils,
  'Groceries': ShoppingBag,
  'Transportation': Car,
  'Housing': Home,
  'Utilities': Zap,
  'Healthcare': Heart,
  'Travel': Plane,
  'Entertainment': Music,
  'Other': Receipt
};

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

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber || accountNumber.length < 2) return accountNumber;
    return '****' + accountNumber.slice(-2);
  };

  const selectedAccount = savingsAccounts.find(acc => acc.id === savingsAccountId);
  const CategoryIcon = CATEGORY_ICONS[category] || Receipt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none sm:rounded-2xl">
        <div className="bg-gradient-to-br from-rose-600 to-pink-500 p-6 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <TrendingDown size={120} />
          </div>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-white">Add Expense</DialogTitle>
            </div>
            <DialogDescription className="text-rose-50/80 text-sm">
              Log your spending to keep your budget on track.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-card">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              Amount (₹)
            </Label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-md bg-rose-50 text-rose-600 group-focus-within:bg-rose-600 group-focus-within:text-white transition-all duration-300">
                <IndianRupee className="h-4 w-4" />
              </div>
              <Input
                id="amount"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="pl-12 h-12 text-lg font-bold border-border/50 focus:border-rose-500/50 focus:ring-rose-500/20 bg-muted/30 group-hover:bg-muted/50 transition-all"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="h-11 border-border/50 focus:ring-rose-500/20 bg-muted/30 hover:bg-muted/50 transition-all">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="border-border/50">
                  {EXPENSE_CATEGORIES.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat] || Receipt;
                    return (
                      <SelectItem key={cat} value={cat} className="focus:bg-rose-50 focus:text-rose-600">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-muted group-hover:bg-rose-100 transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span>{cat}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Date
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                  <Calendar className="h-4 w-4" />
                </div>
                <Input
                  id="date"
                  type="date"
                  required
                  className="pl-10 h-11 border-border/50 focus:ring-rose-500/20 bg-muted/30 group-hover:bg-muted/50 transition-all"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              Description (Optional)
            </Label>
            <div className="relative group">
              <div className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                <FileText className="h-4 w-4" />
              </div>
              <Input
                id="description"
                placeholder="What was this for?"
                className="pl-10 h-11 border-border/50 focus:ring-rose-500/20 bg-muted/30 group-hover:bg-muted/50 transition-all"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="savingsAccount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              Payment Method
            </Label>
            <Select value={savingsAccountId || "none"} onValueChange={(val) => setSavingsAccountId(val === "none" ? "" : val)}>
              <SelectTrigger className="h-11 border-border/50 focus:ring-rose-500/20 bg-muted/30 hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-slate-500/10">
                    <Landmark className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                  <SelectValue placeholder="Select account" />
                </div>
              </SelectTrigger>
              <SelectContent className="border-border/50 max-h-[200px]">
                <SelectItem value="none">None (Cash/Other)</SelectItem>
                {savingsAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{account.bankName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {maskAccountNumber(account.accountNumber)} • Balance: ₹{account.balance.toLocaleString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAccount && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100/50">
                <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
                <p className="text-[11px] text-blue-700 leading-tight">
                  ₹{parseFloat(amount || "0").toLocaleString()} will be deducted from {selectedAccount.bankName}.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-12 font-semibold hover:bg-muted"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-[2] h-12 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95"
            >
              Confirm Expense
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
