import { useState, useEffect, useMemo } from "react";
import { Trash2, Plus, Users, Receipt, Edit2, UserMinus, UserPlus, Search, Crown, Loader2, CalendarDays, ArrowRightLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpenseBooks } from "@/hooks/useExpenseBooks";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { userSearchAPI } from "@/services/api";
import { AddExpenseBookExpenseDialog } from "@/components/AddExpenseBookExpenseDialog";
import { EditExpenseBookExpenseDialog } from "@/components/EditExpenseBookExpenseDialog";
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

interface ExpenseBookDetailsProps {
  book: any;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  email: string;
  name: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const ExpenseBookDetails = ({ book, onClose }: ExpenseBookDetailsProps) => {
  const { getExpenses, deleteExpense, deleteExpenseBook, addMember, removeMember } = useExpenseBooks();
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [editExpense, setEditExpense] = useState<any | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [showDeleteBook, setShowDeleteBook] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberSearchResults, setMemberSearchResults] = useState<SearchResult[]>([]);
  const [memberSearching, setMemberSearching] = useState(false);
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);

  // Month filter state — default to current month
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  const isCreator = book.createdBy === user?.id;

  useEffect(() => {
    loadExpenses();
  }, [book.id]);

  const loadExpenses = async () => {
    try {
      const data = await getExpenses(book.id);
      setExpenses(data);
    } catch (error) {
      console.error("Failed to load expenses:", error);
    }
  };

  // Derive available months from expenses
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    expenses.forEach((exp) => {
      if (exp.expenseDate) {
        const d = new Date(exp.expenseDate);
        monthSet.add(`${d.getFullYear()}-${d.getMonth()}`);
      }
    });
    // Always include the current filter month
    monthSet.add(`${filterYear}-${filterMonth}`);
    // Always include current month
    monthSet.add(`${now.getFullYear()}-${now.getMonth()}`);

    return Array.from(monthSet)
      .map((key) => {
        const [y, m] = key.split("-").map(Number);
        return { year: y, month: m };
      })
      .sort((a, b) => b.year - a.year || b.month - a.month);
  }, [expenses, filterMonth, filterYear]);

  // Filter expenses by selected month
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (!exp.expenseDate) return false;
      const d = new Date(exp.expenseDate);
      return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
    });
  }, [expenses, filterMonth, filterYear]);

  // Navigate months
  const goToPrevMonth = () => {
    if (filterMonth === 0) {
      setFilterMonth(11);
      setFilterYear(filterYear - 1);
    } else {
      setFilterMonth(filterMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (filterMonth === 11) {
      setFilterMonth(0);
      setFilterYear(filterYear + 1);
    } else {
      setFilterMonth(filterMonth + 1);
    }
  };

  // Next month's 1st date for the settlement overview label
  const nextMonth = filterMonth === 11 ? 0 : filterMonth + 1;
  const nextMonthYear = filterMonth === 11 ? filterYear + 1 : filterYear;
  const settlementDateLabel = `1st ${MONTH_NAMES[nextMonth]} ${nextMonthYear}`;

  const handleDeleteExpense = async () => {
    if (!deleteExpenseId) return;

    try {
      await deleteExpense(book.id, deleteExpenseId);
      toast({ title: "Success", description: "Expense deleted successfully" });
      loadExpenses();
      setDeleteExpenseId(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete expense", variant: "destructive" });
    }
  };

  const handleDeleteBook = async () => {
    try {
      await deleteExpenseBook(book.id);
      toast({ title: "Success", description: "Expense book deleted successfully" });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete expense book", variant: "destructive" });
    }
  };

  const handleMemberSearch = async (value: string) => {
    setMemberSearchQuery(value);
    if (value.trim().length < 2) {
      setMemberSearchResults([]);
      return;
    }

    try {
      setMemberSearching(true);
      const results = await userSearchAPI.searchByEmail(value.trim());
      const filtered = results.filter(
        (r: SearchResult) => !book.memberUserIds.includes(r.id)
      );
      setMemberSearchResults(filtered);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setMemberSearching(false);
    }
  };

  const handleAddMember = async (result: SearchResult) => {
    try {
      await addMember(book.id, result.email);
      toast({ title: "Success", description: `${result.name} added to the book` });
      // Update local state for members
      book.memberUserIds.push(result.id);
      book.memberEmails.push(result.email);
      book.memberNames.push(result.name);
      setMemberSearchQuery("");
      setMemberSearchResults([]);
      setShowAddMember(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add member", variant: "destructive" });
    }
  };

  const handleRemoveMember = async () => {
    if (!removeMemberId) return;

    try {
      await removeMember(book.id, removeMemberId);
      const index = book.memberUserIds.indexOf(removeMemberId);
      if (index >= 0) {
        book.memberUserIds.splice(index, 1);
        book.memberEmails.splice(index, 1);
        book.memberNames.splice(index, 1);
      }
      toast({ title: "Success", description: "Member removed" });
      setRemoveMemberId(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to remove member", variant: "destructive" });
    }
  };

  // Calculate settlements based on filtered (monthly) expenses
  const calculateSettlements = (expenseList: any[]) => {
    const totalExpense = expenseList.reduce((sum, exp) => sum + exp.amount, 0);
    const memberCount = book.memberNames?.length || 1;
    const perPersonShare = totalExpense / memberCount;

    // Per-member balance: positive = is owed money, negative = owes money
    const balances: { [key: string]: number } = {};
    (book.memberNames || []).forEach((name: string) => {
      balances[name] = -perPersonShare;
    });

    expenseList.forEach((expense) => {
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
    });

    // Per-member paid amounts
    const paidAmounts: { [key: string]: number } = {};
    (book.memberNames || []).forEach((name: string) => {
      paidAmounts[name] = 0;
    });
    expenseList.forEach((expense) => {
      paidAmounts[expense.paidBy] = (paidAmounts[expense.paidBy] || 0) + expense.amount;
    });

    // Build member overview
    const memberOverview = (book.memberNames || []).map((name: string) => ({
      name,
      paid: paidAmounts[name] || 0,
      share: perPersonShare,
      balance: balances[name] || 0,
    }));

    // Compute minimal settlements
    const creditors = Object.entries(balances)
      .filter(([_, balance]) => balance > 0.01)
      .sort((a, b) => b[1] - a[1]);

    const debtors = Object.entries(balances)
      .filter(([_, balance]) => balance < -0.01)
      .sort((a, b) => a[1] - b[1]);

    const settlements: Array<{ from: string; to: string; amount: number }> = [];
    let i = 0, j = 0;

    while (i < creditors.length && j < debtors.length) {
      const [creditor, creditAmount] = creditors[i];
      const [debtor, debtAmount] = debtors[j];
      const settleAmount = Math.min(creditAmount, Math.abs(debtAmount));

      if (settleAmount > 0.01) {
        settlements.push({ from: debtor, to: creditor, amount: settleAmount });
      }

      creditors[i] = [creditor, creditAmount - settleAmount];
      debtors[j] = [debtor, debtAmount + settleAmount];

      if (Math.abs(creditors[i][1] as number) < 0.01) i++;
      if (Math.abs(debtors[j][1] as number) < 0.01) j++;
    }

    return { totalExpense, perPersonShare, settlements, memberOverview };
  };

  const { totalExpense, perPersonShare, settlements, memberOverview } = calculateSettlements(filteredExpenses);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-2xl font-bold">{book.name}</h2>
            {book.description && (
              <p className="text-muted-foreground">{book.description}</p>
            )}
          </div>
          {isCreator && (
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteBook(true)} className="mr-6">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({book.memberNames?.length || 0})
            </CardTitle>
            {isCreator && (
              <Button size="sm" variant="outline" onClick={() => setShowAddMember(!showAddMember)}>
                <UserPlus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add member search */}
          {showAddMember && isCreator && (
            <div className="relative mb-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={memberSearchQuery}
                    onChange={(e) => handleMemberSearch(e.target.value)}
                    placeholder="Search by email..."
                    className="pl-9"
                  />
                </div>
                {memberSearching && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {memberSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                  {memberSearchResults.map((result) => (
                    <button
                      key={result.id}
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors flex items-center justify-between"
                      onClick={() => handleAddMember(result)}
                    >
                      <div>
                        <p className="text-sm font-medium">{result.name}</p>
                        <p className="text-xs text-muted-foreground">{result.email}</p>
                      </div>
                      <UserPlus className="h-4 w-4 text-primary" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Member list */}
          <div className="flex flex-wrap gap-2">
            {(book.memberNames || []).map((name: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5">
                {book.memberUserIds[idx] === book.createdBy && (
                  <Crown className="h-3 w-3 text-amber-500" />
                )}
                {name}
                {isCreator && book.memberUserIds[idx] !== book.createdBy && (
                  <UserMinus
                    className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors ml-1"
                    onClick={() => setRemoveMemberId(book.memberUserIds[idx])}
                  />
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Month Filter ─── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={goToPrevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm">
                {MONTH_NAMES[filterMonth]} {filterYear}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary for selected month */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Monthly Summary — {MONTH_NAMES[filterMonth]} {filterYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Expenses:</span>
            <span className="font-bold text-lg">₹{totalExpense.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Per Person:</span>
            <span className="font-semibold">₹{perPersonShare.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* ─── Member Overview — Due on 1st of next month ─── */}
      {memberOverview.length > 0 && totalExpense > 0 && (
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-amber-600" />
              Settlement Overview
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Amounts due / receivable on <span className="font-semibold text-foreground">{settlementDateLabel}</span>
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {memberOverview.map((member, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-background/80 border border-border/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      member.balance > 0.01
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : member.balance < -0.01
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{member.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Paid ₹{member.paid.toFixed(0)} · Share ₹{member.share.toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {member.balance > 0.01 ? (
                      <div>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          +₹{member.balance.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-emerald-600/70 font-medium">RECEIVABLE</p>
                      </div>
                    ) : member.balance < -0.01 ? (
                      <div>
                        <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                          -₹{Math.abs(member.balance).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-rose-600/70 font-medium">PAYABLE</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-muted-foreground">₹0.00</p>
                        <p className="text-[10px] text-muted-foreground font-medium">SETTLED</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settlements */}
      {settlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How to Settle</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {settlements.map((settlement, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span>
                      <span className="font-semibold">{settlement.from}</span>
                      {" pays "}
                      <span className="font-semibold">{settlement.to}</span>
                    </span>
                    <Badge variant="default">₹{settlement.amount.toFixed(2)}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Expenses */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Expenses
            <Badge variant="outline" className="ml-1">{filteredExpenses.length}</Badge>
          </h3>
          <Button onClick={() => setShowAddExpense(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <div>
          {filteredExpenses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No expenses for {MONTH_NAMES[filterMonth]} {filterYear}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredExpenses
                .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())
                .map((expense) => (
                <Card key={expense.id}>
                  <CardContent className="py-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold">{expense.description}</p>
                          <Badge variant="outline">₹{expense.amount.toFixed(2)}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Paid by <span className="font-medium">{expense.paidBy}</span>
                          {expense.expenseDate && (
                            <span> • {new Date(expense.expenseDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditExpense(expense);
                            setShowEditExpense(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteExpenseId(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Dialog */}
      <AddExpenseBookExpenseDialog
        open={showAddExpense}
        onOpenChange={(open) => {
          setShowAddExpense(open);
          if (!open) loadExpenses();
        }}
        bookId={book.id}
        memberNames={book.memberNames || []}
        memberUserIds={book.memberUserIds || []}
      />

      {/* Edit Expense Dialog */}
      {editExpense && (
        <EditExpenseBookExpenseDialog
          open={showEditExpense}
          onOpenChange={setShowEditExpense}
          bookId={book.id}
          expense={editExpense}
          memberNames={book.memberNames || []}
          memberUserIds={book.memberUserIds || []}
          onUpdate={loadExpenses}
        />
      )}

      {/* Delete Expense Dialog */}
      <AlertDialog open={!!deleteExpenseId} onOpenChange={() => setDeleteExpenseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExpense}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Book Dialog */}
      <AlertDialog open={showDeleteBook} onOpenChange={setShowDeleteBook}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense book? This will also delete all expenses. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBook} className="bg-destructive text-destructive-foreground">
              Delete Book
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!removeMemberId} onOpenChange={() => setRemoveMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the expense book?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
