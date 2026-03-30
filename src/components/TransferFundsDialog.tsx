import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, IndianRupee, Landmark, ChevronRight } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { toast } from "sonner";

export const TransferFundsDialog = () => {
  const [open, setOpen] = useState(false);
  const { savingsAccounts, transferFunds } = useAssets();
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.fromAccountId === formData.toAccountId) {
      toast.error("Source and destination accounts must be different");
      return;
    }

    setLoading(true);
    try {
      await transferFunds(
        formData.fromAccountId,
        formData.toAccountId,
        parseFloat(formData.amount)
      );

      toast.success("Funds transferred successfully");
      setOpen(false);
      setFormData({
        fromAccountId: '',
        toAccountId: '',
        amount: ''
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to transfer funds");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 border-none shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
          <div className="flex items-center gap-1.5 relative z-10">
            <ArrowLeftRight className="h-3.5 w-3.5 text-white" />
            <span className="font-semibold tracking-wide text-xs">Transfer</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none sm:rounded-2xl">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-500 p-6 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ArrowLeftRight size={120} />
          </div>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Landmark className="h-5 w-5 text-white" />
              <DialogTitle className="text-2xl font-bold text-white">Transfer Funds</DialogTitle>
            </div>
            <DialogDescription className="text-blue-50/80 text-sm">
              Move money between your savings accounts.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-card">
          <div className="space-y-2">
            <Label htmlFor="fromAccount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              From Account
            </Label>
            <Select
              value={formData.fromAccountId}
              onValueChange={(value) => setFormData({ ...formData, fromAccountId: value })}
              required
            >
              <SelectTrigger className="h-11 border-border/50 focus:ring-blue-500/20 bg-muted/30 hover:bg-muted/50 transition-all">
                <SelectValue placeholder="Select source account" />
              </SelectTrigger>
              <SelectContent>
                {savingsAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.bankName} (**** {account.accountNumber.slice(-4)}) - ₹{account.balance.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toAccount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              To Account
            </Label>
            <Select
              value={formData.toAccountId}
              onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}
              required
            >
              <SelectTrigger className="h-11 border-border/50 focus:ring-blue-500/20 bg-muted/30 hover:bg-muted/50 transition-all">
                <SelectValue placeholder="Select destination account" />
              </SelectTrigger>
              <SelectContent>
                {savingsAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.bankName} (**** {account.accountNumber.slice(-4)}) - ₹{account.balance.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              Amount (₹)
            </Label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-md bg-blue-50 text-blue-600 group-focus-within:bg-blue-600 group-focus-within:text-white transition-all duration-300">
                <IndianRupee className="h-4 w-4" />
              </div>
              <Input
                id="amount"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                min="0.01"
                className="pl-12 h-12 text-lg font-bold border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 bg-muted/30 group-hover:bg-muted/50 transition-all"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-12 font-semibold hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-[2] h-12 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              {loading ? "Processing..." : "Confirm Transfer"}
              {!loading && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
