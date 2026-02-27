import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, IndianRupee, Calendar, FileText, ChevronRight, Briefcase, TrendingUp, Home, MoreHorizontal } from "lucide-react";
import { useIncome } from "@/hooks/useIncome";
import { toast } from "sonner";

const INCOME_SOURCES = [
  { label: 'Salary', value: 'Salary', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Freelance', value: 'Freelance', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { label: 'Business', value: 'Business', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Investment Returns', value: 'Investment Returns', icon: IndianRupee, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Rental Income', value: 'Rental Income', icon: Home, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { label: 'Other', value: 'Other', icon: MoreHorizontal, color: 'text-slate-500', bg: 'bg-slate-500/10' }
] as const;

export const AddIncomeDialog = () => {
  const [open, setOpen] = useState(false);
  const { addIncome } = useIncome();
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    source: 'Salary' as typeof INCOME_SOURCES[number]['value'],
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addIncome({
        amount: parseFloat(formData.amount),
        date: formData.date,
        source: formData.source,
        description: formData.description
      });

      toast.success("Income added successfully");
      setOpen(false);
      setFormData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        source: 'Salary',
        description: ''
      });
    } catch (error) {
      toast.error("Failed to add income");
    }
  };

  const selectedSource = INCOME_SOURCES.find(s => s.value === formData.source) || INCOME_SOURCES[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border-none shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
          <div className="flex items-center gap-2 relative z-10">
            <div className="p-1 rounded-md bg-white/20 group-hover:bg-white/30 transition-colors">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold tracking-wide">Add Income</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none sm:rounded-2xl">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-500 p-6 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <TrendingUp size={120} />
          </div>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee className="h-5 w-5 text-white" />
              <DialogTitle className="text-2xl font-bold text-white">Add Income</DialogTitle>
            </div>
            <DialogDescription className="text-emerald-50/80 text-sm">
              Record new earnings and track your wealth growth.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-card">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              Amount (₹)
            </Label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-md bg-emerald-50 text-emerald-600 group-focus-within:bg-emerald-600 group-focus-within:text-white transition-all duration-300">
                <IndianRupee className="h-4 w-4" />
              </div>
              <Input
                id="amount"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="pl-12 h-12 text-lg font-bold border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 bg-muted/30 group-hover:bg-muted/50 transition-all"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Source
              </Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData({ ...formData, source: value as typeof INCOME_SOURCES[number]['value'] })}
              >
                <SelectTrigger className="h-11 border-border/50 focus:ring-emerald-500/20 bg-muted/30 hover:bg-muted/50 transition-all">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent className="border-border/50">
                  {INCOME_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value} className="focus:bg-emerald-50 focus:text-emerald-600">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${source.bg}`}>
                          <source.icon className={`h-4 w-4 ${source.color}`} />
                        </div>
                        <span>{source.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Date
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-600 transition-colors">
                  <Calendar className="h-4 w-4" />
                </div>
                <Input
                  id="date"
                  type="date"
                  required
                  className="pl-10 h-11 border-border/50 focus:ring-emerald-500/20 bg-muted/30 group-hover:bg-muted/50 transition-all"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              Description (Optional)
            </Label>
            <div className="relative group">
              <div className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-emerald-600 transition-colors">
                <FileText className="h-4 w-4" />
              </div>
              <Input
                id="description"
                placeholder="Where did this come from?"
                className="pl-10 h-11 border-border/50 focus:ring-emerald-500/20 bg-muted/30 group-hover:bg-muted/50 transition-all"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              className="flex-[2] h-12 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              Confirm Income
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
