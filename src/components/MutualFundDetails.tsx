import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Plus, Edit, Trash2 } from "lucide-react";
import { MutualFund } from "@/hooks/useAssets";
import { AddMutualFundUnitsDialog } from './AddMutualFundUnitsDialog';
import { EditMutualFundDialog } from './EditMutualFundDialog';
import { toast } from "sonner";
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

interface MutualFundDetailsProps {
  funds: MutualFund[];
  onRefresh?: () => void;
  onUpdate: (id: string, data: Partial<MutualFund>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const MutualFundDetails = ({ funds, onRefresh, onUpdate, onDelete }: MutualFundDetailsProps) => {
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [showAddUnitsDialog, setShowAddUnitsDialog] = useState(false);
  const [editFund, setEditFund] = useState<MutualFund | null>(null);
  const [deleteFundId, setDeleteFundId] = useState<string | null>(null);

  const handleAddUnits = (fund: any) => {
    setSelectedFund(fund);
    setShowAddUnitsDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteFundId) return;
    
    try {
      await onDelete(deleteFundId);
      toast.success("Mutual fund deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete mutual fund");
    } finally {
      setDeleteFundId(null);
    }
  };
  if (funds.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No mutual funds added yet. Click "Add Mutual Fund" to get started.
      </div>
    );
  }

  const totalValue = funds.reduce((sum, fund) => sum + (fund.units * fund.nav), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Mutual Funds</h3>
          <p className="text-sm text-muted-foreground">{funds.length} active investments</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">₹{totalValue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="space-y-3">
        {funds.map((fund) => {
          const currentValue = fund.units * fund.nav;
          
          return (
            <Card 
              key={fund.id}
              className="p-4 hover:shadow-md transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-secondary/20"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{fund.fundName}</h4>
                    <p className="text-sm text-muted-foreground">{fund.schemeName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Value</p>
                    <p className="text-lg font-bold text-foreground">₹{currentValue.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Units</p>
                    <p className="text-sm font-medium text-foreground">{fund.units.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">NAV</p>
                    <p className="text-sm font-medium text-foreground">₹{fund.nav.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Purchase Date</p>
                    <p className="text-sm font-medium text-foreground">{new Date(fund.purchaseDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => handleAddUnits(fund)}
                    className="flex-1"
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Units
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditFund(fund)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteFundId(fund.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedFund && (
        <AddMutualFundUnitsDialog
          open={showAddUnitsDialog}
          onOpenChange={setShowAddUnitsDialog}
          mutualFund={selectedFund}
          onSuccess={() => {
            onRefresh?.();
          }}
        />
      )}

      {editFund && (
        <EditMutualFundDialog
          open={!!editFund}
          onOpenChange={(open) => !open && setEditFund(null)}
          fund={editFund}
          onUpdate={onUpdate}
        />
      )}

      <AlertDialog open={!!deleteFundId} onOpenChange={(open) => !open && setDeleteFundId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mutual Fund</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this mutual fund? This will also delete all associated transaction history. This action cannot be undone.
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
