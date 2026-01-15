import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit2, Trash2, Filter } from "lucide-react";
import { useIncome, Income } from "@/hooks/useIncome";
import { EditIncomeDialog } from "@/components/EditIncomeDialog";
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

export const IncomeList = () => {
  const { incomes, deleteIncome } = useIncome();
  const [editIncome, setEditIncome] = useState<Income | null>(null);
  const [deleteIncomeId, setDeleteIncomeId] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState<string>("all");

  // Get unique months from incomes
  const availableMonths = useMemo(() => {
    const months = new Map<string, string>();
    incomes.forEach(income => {
      const date = new Date(income.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.set(key, label);
    });
    return Array.from(months.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [incomes]);

  // Filter incomes based on selected month
  const filteredIncomes = useMemo(() => {
    if (monthFilter === "all") return incomes;
    
    return incomes.filter(income => {
      const date = new Date(income.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return key === monthFilter;
    });
  }, [incomes, monthFilter]);

  const filteredTotal = filteredIncomes.reduce((sum, inc) => sum + inc.amount, 0);

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
  const sortedIncomes = [...filteredIncomes].sort((a, b) => 
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
      {/* Filter Section */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            {availableMonths.map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {monthFilter !== "all" && (
          <Badge variant="default" className="ml-auto">
            Total: ₹{filteredTotal.toLocaleString('en-IN')}
          </Badge>
        )}
      </div>

      {sortedIncomes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No income entries for selected month.
          </CardContent>
        </Card>
      ) : (
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
      )}

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