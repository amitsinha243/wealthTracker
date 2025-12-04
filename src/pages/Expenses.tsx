import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wallet, ArrowLeft, Receipt, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useExpenses } from "@/hooks/useExpenses";
import { useAssets } from "@/hooks/useAssets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationMenu } from "@/components/NavigationMenu";
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
  const { expenses, deleteExpense } = useExpenses();
  const { savingsAccounts } = useAssets();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Helper to get bank name from savings account ID
  const getBankName = (savingsAccountId?: string) => {
    if (!savingsAccountId) return '-';
    const account = savingsAccounts.find(acc => acc.id === savingsAccountId);
    return account ? account.bankName : '-';
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Sort expenses by date (most recent first)
  const sortedExpenses = [...expenses].sort((a, b) => 
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {expenses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No expenses recorded yet</p>
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
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(expense.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} WealthTracker. All rights reserved. Developed by Amit
        </div>
      </footer>

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
