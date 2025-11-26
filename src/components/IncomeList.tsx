import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit2, Trash2 } from "lucide-react";
import { useIncome, Income } from "@/hooks/useIncome";
import { EditIncomeDialog } from "@/components/EditIncomeDialog";
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

export const IncomeList = () => {
  const { incomes, deleteIncome } = useIncome();
  const [editIncome, setEditIncome] = useState<Income | null>(null);
  const [deleteIncomeId, setDeleteIncomeId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteIncomeId) return;
    
    try {
      await deleteIncome(deleteIncomeId);
      toast.success("Income deleted successfully");
      setDeleteIncomeId(null);
    } catch (error) {
      toast.error("Failed to delete income");
    }
  };

  // Sort incomes by date (most recent first)
  const sortedIncomes = [...incomes].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (incomes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No income entries found. Add your first income entry to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <ScrollArea className="max-h-96">
        <div className="space-y-2">
          {sortedIncomes.map((income) => (
            <Card key={income.id}>
              <CardContent className="py-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-semibold">{income.source}</p>
                        {income.description && (
                          <p className="text-sm text-muted-foreground">{income.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        ₹{income.amount.toLocaleString('en-IN')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(income.date).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditIncome(income)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteIncomeId(income.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Edit Income Dialog */}
      {editIncome && (
        <EditIncomeDialog
          open={!!editIncome}
          onOpenChange={(open) => !open && setEditIncome(null)}
          income={editIncome}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteIncomeId} onOpenChange={() => setDeleteIncomeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};