import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import { Stock } from "@/hooks/useAssets";
import { EditStockDialog } from "./EditStockDialog";
import { AddStockUnitsDialog } from "./AddStockUnitsDialog";
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

interface StockDetailsProps {
  stocks: Stock[];
  onUpdate: (id: string, data: Partial<Stock>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export const StockDetails = ({ stocks, onUpdate, onDelete, onRefresh }: StockDetailsProps) => {
  const [editStock, setEditStock] = useState<Stock | null>(null);
  const [addUnitsStock, setAddUnitsStock] = useState<Stock | null>(null);
  const [deleteStockId, setDeleteStockId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteStockId) return;
    
    try {
      await onDelete(deleteStockId);
      toast.success("Stock deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete stock");
    } finally {
      setDeleteStockId(null);
    }
  };

  return (
    <div className="space-y-4">
      {stocks.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No stocks found</p>
      ) : (
        stocks.map((stock) => (
          <Card key={stock.id}>
            <CardHeader>
              <CardTitle className="text-lg">{stock.stockName} ({stock.symbol})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-semibold">{stock.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. Purchase Price:</span>
                <span className="font-semibold">₹{stock.purchasePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Value:</span>
                <span className="font-semibold">₹{(stock.quantity * stock.purchasePrice).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Purchase Date:</span>
                <span className="font-semibold">{new Date(stock.purchaseDate).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setAddUnitsStock(stock)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Units
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditStock(stock)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => setDeleteStockId(stock.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {editStock && (
        <EditStockDialog
          open={!!editStock}
          onOpenChange={(open) => !open && setEditStock(null)}
          stock={editStock}
          onUpdate={onUpdate}
        />
      )}

      {addUnitsStock && (
        <AddStockUnitsDialog
          open={!!addUnitsStock}
          onOpenChange={(open) => !open && setAddUnitsStock(null)}
          stock={addUnitsStock}
          onSuccess={onRefresh}
        />
      )}

      <AlertDialog open={!!deleteStockId} onOpenChange={(open) => !open && setDeleteStockId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stock</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this stock? This action cannot be undone.
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
