import { useState, useEffect } from "react";
import { Trash2, Plus, Users, Receipt, Edit2, UserMinus, UserPlus, Search, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  // Calculate settlements
  const calculateSettlements = () => {
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const memberCount = book.memberNames?.length || 1;
    const perPersonShare = totalExpense / memberCount;

    const balances: { [key: string]: number } = {};
    (book.memberNames || []).forEach((name: string) => {
      balances[name] = -perPersonShare;
    });

    expenses.forEach((expense) => {
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
    });

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

    return { totalExpense, perPersonShare, settlements };
  };

  const { totalExpense, perPersonShare, settlements } = calculateSettlements();

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

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
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

      {/* Settlements */}
      {settlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Settlements</CardTitle>
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
          </h3>
          <Button onClick={() => setShowAddExpense(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <div>
          {expenses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No expenses added yet
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
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
