import { useState, useEffect } from "react";
import { Trash2, Plus, Users, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTrips } from "@/hooks/useTrips";
import { useToast } from "@/hooks/use-toast";
import { AddTripExpenseDialog } from "@/components/AddTripExpenseDialog";
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

interface TripDetailsProps {
  trip: any;
  onClose: () => void;
}

export const TripDetails = ({ trip, onClose }: TripDetailsProps) => {
  const { getTripExpenses, deleteTripExpense, deleteTrip } = useTrips();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [showDeleteTrip, setShowDeleteTrip] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, [trip.id]);

  const loadExpenses = async () => {
    try {
      const data = await getTripExpenses(trip.id);
      setExpenses(data);
    } catch (error) {
      console.error("Failed to load expenses:", error);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deleteExpenseId) return;
    
    try {
      await deleteTripExpense(trip.id, deleteExpenseId);
      toast({
        title: "Success",
        description: "Expense deleted successfully"
      });
      loadExpenses();
      setDeleteExpenseId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTrip = async () => {
    try {
      await deleteTrip(trip.id);
      toast({
        title: "Success",
        description: "Trip deleted successfully"
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive"
      });
    }
  };

  // Calculate settlements
  const calculateSettlements = () => {
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const perPersonShare = totalExpense / trip.participants.length;
    
    // Calculate balances for each participant
    const balances: { [key: string]: number } = {};
    trip.participants.forEach((participant: string) => {
      balances[participant] = -perPersonShare; // Everyone owes their share initially
    });
    
    // Add what each person paid
    expenses.forEach((expense) => {
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
    });

    // Separate creditors (positive balance) and debtors (negative balance)
    const creditors = Object.entries(balances)
      .filter(([_, balance]) => balance > 0.01)
      .sort((a, b) => b[1] - a[1]);
    
    const debtors = Object.entries(balances)
      .filter(([_, balance]) => balance < -0.01)
      .sort((a, b) => a[1] - b[1]);

    // Calculate settlements
    const settlements: Array<{ from: string; to: string; amount: number }> = [];
    let i = 0, j = 0;
    
    while (i < creditors.length && j < debtors.length) {
      const [creditor, creditAmount] = creditors[i];
      const [debtor, debtAmount] = debtors[j];
      
      const settleAmount = Math.min(creditAmount, Math.abs(debtAmount));
      
      if (settleAmount > 0.01) {
        settlements.push({
          from: debtor,
          to: creditor,
          amount: settleAmount
        });
      }
      
      creditors[i][1] -= settleAmount;
      debtors[j][1] += settleAmount;
      
      if (Math.abs(creditors[i][1]) < 0.01) i++;
      if (Math.abs(debtors[j][1]) < 0.01) j++;
    }

    return { totalExpense, perPersonShare, balances, settlements };
  };

  const { totalExpense, perPersonShare, balances, settlements } = calculateSettlements();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-2xl font-bold">{trip.tripName}</h2>
            <p className="text-muted-foreground">{trip.destination}</p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteTrip(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {trip.startDate && (
          <p className="text-sm text-muted-foreground">
            {new Date(trip.startDate).toLocaleDateString()}
            {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString()}`}
          </p>
        )}
      </div>

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {trip.participants.map((participant: string, idx: number) => (
              <Badge key={idx} variant="secondary">
                {participant}
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

        <ScrollArea className="max-h-96">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteExpenseId(expense.id)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Add Expense Dialog */}
      <AddTripExpenseDialog
        open={showAddExpense}
        onOpenChange={(open) => {
          setShowAddExpense(open);
          if (!open) loadExpenses();
        }}
        tripId={trip.id}
        participants={trip.participants}
      />

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

      {/* Delete Trip Dialog */}
      <AlertDialog open={showDeleteTrip} onOpenChange={setShowDeleteTrip}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trip? This will also delete all expenses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTrip} className="bg-destructive text-destructive-foreground">
              Delete Trip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};