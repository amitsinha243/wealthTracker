import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Wallet, ArrowLeft, Receipt, Trash2, Pencil,
  Filter, X, CalendarIcon, Download, Plus,
  Search, ArrowUpRight, ArrowDownRight, MoreVertical,
  ChevronRight, Landmark, ShoppingBag, Utensils,
  Car, Home, Zap, Heart, Plane, Music, TrendingDown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useExpenses, Expense } from "@/hooks/useExpenses";
import { useAssets } from "@/hooks/useAssets";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Footer } from "@/components/Footer";
import { EditExpenseDialog } from "@/components/EditExpenseDialog";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  "Food": { icon: Utensils, color: "text-orange-600", bg: "bg-orange-600/10" },
  "Groceries": { icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-600/10" },
  "Transportation": { icon: Car, color: "text-blue-600", bg: "bg-blue-600/10" },
  "Housing": { icon: Home, color: "text-amber-600", bg: "bg-amber-600/10" },
  "Utilities": { icon: Zap, color: "text-yellow-600", bg: "bg-yellow-600/10" },
  "Healthcare": { icon: Heart, color: "text-rose-600", bg: "bg-rose-600/10" },
  "Travel": { icon: Plane, color: "text-indigo-600", bg: "bg-indigo-600/10" },
  "Entertainment": { icon: Music, color: "text-purple-600", bg: "bg-purple-600/10" },
  "Other": { icon: Receipt, color: "text-slate-600", bg: "bg-slate-600/10" },
};

const Expenses = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { expenses, updateExpense, deleteExpense } = useExpenses();
  const { savingsAccounts } = useAssets();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [bankAccountFilter, setBankAccountFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("this-month");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);

  // Helper to get bank name from savings account ID
  const getBankName = (savingsAccountId?: string) => {
    if (!savingsAccountId) return 'N/A';
    const account = savingsAccounts.find(acc => acc.id === savingsAccountId);
    return account ? account.bankName : 'Unknown';
  };

  // Get unique categories from expenses
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(expenses.map(exp => exp.category))];
    return uniqueCategories.sort();
  }, [expenses]);

  // Get unique bank accounts from expenses
  const bankAccounts = useMemo(() => {
    const accountIds = [...new Set(expenses.map(exp => exp.savingsAccountId).filter(Boolean))];
    return savingsAccounts.filter(acc => accountIds.includes(acc.id));
  }, [expenses, savingsAccounts]);

  // Filter expenses based on selected filters
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    if (categoryFilter !== "all") {
      filtered = filtered.filter(exp => exp.category === categoryFilter);
    }

    if (bankAccountFilter !== "all") {
      filtered = filtered.filter(exp => exp.savingsAccountId === bankAccountFilter);
    }

    if (dateRangeFilter !== "all") {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      filtered = filtered.filter(exp => {
        const expDate = new Date(exp.date);
        const expMonth = expDate.getMonth();
        const expYear = expDate.getFullYear();

        switch (dateRangeFilter) {
          case "this-month":
            return expMonth === currentMonth && expYear === currentYear;
          case "last-month":
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return expMonth === lastMonth && expYear === lastMonthYear;
          case "last-3-months":
            const threeMonthsAgo = new Date(currentYear, currentMonth - 2, 1);
            return expDate >= threeMonthsAgo;
          case "last-6-months":
            const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
            return expDate >= sixMonthsAgo;
          case "this-year":
            return expYear === currentYear;
          case "custom":
            if (customStartDate && expDate < customStartDate) return false;
            if (customEndDate) {
              const endOfDay = new Date(customEndDate);
              endOfDay.setHours(23, 59, 59, 999);
              if (expDate > endOfDay) return false;
            }
            return true;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [expenses, categoryFilter, bankAccountFilter, dateRangeFilter, customStartDate, customEndDate, expenses]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const filteredTotal = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const isFiltered = categoryFilter !== "all" || bankAccountFilter !== "all" || dateRangeFilter !== "all";

  const sortedExpenses = [...filteredExpenses].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const expensesByMonth = sortedExpenses.reduce((acc, expense) => {
    const monthYear = new Date(expense.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(expense);
    return acc;
  }, {} as Record<string, typeof expenses>);

  const clearFilters = () => {
    setCategoryFilter("all");
    setBankAccountFilter("all");
    setDateRangeFilter("all");
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
  };

  const handleDateRangeChange = (value: string) => {
    setDateRangeFilter(value);
    if (value !== "custom") {
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteExpense(deleteId);
      toast.success("Expense deleted successfully");
      setDeleteId(null);
    }
  };

  const exportToCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.error("No expenses to export");
      return;
    }

    const headers = ["Date", "Category", "Description", "Bank Account", "Amount"];
    const rows = filteredExpenses.map(exp => [
      format(new Date(exp.date), "yyyy-MM-dd"),
      exp.category,
      exp.description || "",
      getBankName(exp.savingsAccountId),
      exp.amount.toString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Expenses exported successfully");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="rounded-full hover:bg-muted/80 transition-all active:scale-90"
              >
                <Link to="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-rose-600 to-pink-500 shadow-lg shadow-rose-500/20">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-foreground tracking-tighter">ALL EXPENSES</h1>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] leading-none mt-1">Transaction History</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right pr-4 border-r border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Spending</p>
                <p className="text-xl font-black text-rose-600">
                  ₹{totalExpenses.toLocaleString('en-IN')}
                </p>
              </div>
              <Button
                onClick={() => setShowAddExpense(true)}
                className="bg-gradient-to-br from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 font-bold shadow-lg shadow-rose-500/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Expense
              </Button>
              <NavigationMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1 max-w-7xl">
        {/* Filter Section */}
        <Card className="mb-8 border-none bg-muted/30 backdrop-blur-sm overflow-hidden rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <Filter className="h-3.5 w-3.5" />
                  Filter By
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px] h-10 rounded-xl border-border/50 bg-background/50">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={bankAccountFilter} onValueChange={setBankAccountFilter}>
                  <SelectTrigger className="w-[180px] h-10 rounded-xl border-border/50 bg-background/50">
                    <SelectValue placeholder="Bank Account" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Accounts</SelectItem>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>{account.bankName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dateRangeFilter} onValueChange={handleDateRangeChange}>
                  <SelectTrigger className="w-[160px] h-10 rounded-xl border-border/50 bg-background/50">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>

                {isFiltered && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-10 text-muted-foreground hover:text-rose-600 transition-colors"
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Clear
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                    {isFiltered ? 'Filtered Amount' : 'Period Total'}
                  </p>
                  <p className="text-xl font-black text-rose-600">
                    ₹{filteredTotal.toLocaleString('en-IN')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={exportToCSV}
                  className="rounded-xl border-border/50 hover:bg-background h-10 w-10"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {dateRangeFilter === "custom" && (
              <div className="flex gap-3 mt-4 pt-4 border-t border-border/40 animate-in fade-in slide-in-from-top-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-10 rounded-xl bg-background/50 border-border/50">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {customStartDate ? format(customStartDate, "dd MMM yyyy") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl">
                    <Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-10 rounded-xl bg-background/50 border-border/50">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {customEndDate ? format(customEndDate, "dd MMM yyyy") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl">
                    <Calendar
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      disabled={(date) => customStartDate ? date < customStartDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
        </Card>

        {sortedExpenses.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center opacity-70">
            <div className="p-6 rounded-full bg-muted mb-4">
              <Receipt className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold mb-1">No Transactions Found</h3>
            <p className="text-muted-foreground max-w-sm">
              We couldn't find any expenses matching your filters. Try adjusting them or clear the filters.
            </p>
            {isFiltered && (
              <Button variant="link" onClick={clearFilters} className="mt-4 font-bold text-rose-600">
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-12 pb-10">
            {Object.entries(expensesByMonth).map(([monthYear, monthExpenses]) => {
              const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

              return (
                <div key={monthYear} className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-black text-foreground tracking-tight">{monthYear}</h3>
                      <Badge variant="outline" className="rounded-full px-3 py-0.5 border-rose-600/20 text-rose-600 font-mono font-bold">
                        {monthExpenses.length} activity
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-bold">
                      <span className="text-[10px] uppercase tracking-[0.2em]">Spent:</span>
                      <span className="text-lg text-foreground font-black">₹{monthTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {monthExpenses.map((expense) => {
                      const config = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG["Other"];
                      const Icon = config.icon;

                      return (
                        <div
                          key={expense.id}
                          className="group relative flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/30 hover:bg-muted/40 hover:border-border/60 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl shadow-sm transition-all duration-300 group-hover:scale-110", config.bg, config.color)}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground text-lg">{expense.category}</span>
                                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                <span className="text-xs font-bold text-muted-foreground uppercase opacity-70">
                                  {format(new Date(expense.date), "dd MMM, yyyy")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-sm text-muted-foreground/80 font-medium">
                                  {expense.description || "No description provided"}
                                </p>
                                {expense.savingsAccountId && (
                                  <>
                                    <span className="h-3 w-[1px] bg-muted-foreground/20" />
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-background/50 border border-border/50">
                                      <Landmark className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{getBankName(expense.savingsAccountId)}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-xl font-black text-rose-600">₹{expense.amount.toLocaleString('en-IN')}</p>
                              <div className="flex justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                                  onClick={() => setEditExpense(expense)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-600"
                                  onClick={() => setDeleteId(expense.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Edit Expense Dialog */}
      <EditExpenseDialog
        open={editExpense !== null}
        onOpenChange={(open) => !open && setEditExpense(null)}
        expense={editExpense}
        onUpdate={updateExpense}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-2">
              <TrendingDown className="h-6 w-6 text-rose-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-black tracking-tight">Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              This will permanently remove this expense from your records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold border-border/50">Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
      />
    </div>
  );
};

export default Expenses;
