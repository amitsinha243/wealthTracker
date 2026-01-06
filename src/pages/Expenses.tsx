import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wallet, ArrowLeft, Receipt, Trash2, Pencil, Filter, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useExpenses, Expense } from "@/hooks/useExpenses";
import { useAssets } from "@/hooks/useAssets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Footer } from "@/components/Footer";
import { EditExpenseDialog } from "@/components/EditExpenseDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const Expenses = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { expenses, updateExpense, deleteExpense } = useExpenses();
  const { savingsAccounts } = useAssets();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("this-month");

  // Helper to get bank name from savings account ID
  const getBankName = (savingsAccountId?: string) => {
    if (!savingsAccountId) return '-';
    const account = savingsAccounts.find(acc => acc.id === savingsAccountId);
    return account ? account.bankName : '-';
  };

  // Get unique categories from expenses
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(expenses.map(exp => exp.category))];
    return uniqueCategories.sort();
  }, [expenses]);

  // Filter expenses based on selected filters
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];
    
    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(exp => exp.category === categoryFilter);
    }
    
    // Date range filter
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
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [expenses, categoryFilter, dateRangeFilter]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const filteredTotal = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const isFiltered = categoryFilter !== "all" || dateRangeFilter !== "all";
  
  // Sort filtered expenses by date (most recent first)
  const sortedExpenses = [...filteredExpenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group expenses by month
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
    setDateRangeFilter("all");
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteExpense(deleteId);
      toast.success("Expense deleted successfully");
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                  <Wallet className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">All Expenses</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Total: ₹{totalExpenses.toLocaleString('en-IN')}
              </Badge>
              <NavigationMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                  <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
              
              {isFiltered && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
              
              {isFiltered && (
                <Badge variant="default" className="ml-auto text-base px-4 py-2">
                  Filtered Total: ₹{filteredTotal.toLocaleString('en-IN')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {sortedExpenses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {isFiltered ? "No expenses match the selected filters" : "No expenses recorded yet"}
              </p>
              {isFiltered && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(expensesByMonth).map(([monthYear, monthExpenses]) => {
              const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
              
              return (
                <Card key={monthYear}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{monthYear}</CardTitle>
                      <Badge variant="outline">₹{monthTotal.toLocaleString('en-IN')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Bank Account</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthExpenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell className="font-medium">
                              {new Date(expense.date).toLocaleDateString('en-IN')}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{expense.category}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {expense.description || '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {getBankName(expense.savingsAccountId)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ₹{expense.amount.toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditExpense(expense)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteId(expense.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Expenses;
