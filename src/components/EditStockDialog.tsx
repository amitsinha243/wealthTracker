import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Stock } from "@/hooks/useAssets";

interface EditStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: Stock;
  onUpdate: (id: string, data: Partial<Stock>) => Promise<void>;
}

export const EditStockDialog = ({ 
  open, 
  onOpenChange, 
  stock,
  onUpdate 
}: EditStockDialogProps) => {
  const [stockName, setStockName] = useState(stock.stockName);
  const [symbol, setSymbol] = useState(stock.symbol);
  const [quantity, setQuantity] = useState(stock.quantity.toString());
  const [purchasePrice, setPurchasePrice] = useState(stock.purchasePrice.toString());
  const [purchaseDate, setPurchaseDate] = useState(stock.purchaseDate);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onUpdate(stock.id, {
        stockName,
        symbol,
        quantity: parseInt(quantity),
        purchasePrice: parseFloat(purchasePrice),
        purchaseDate
      });
      
      toast.success("Stock updated successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="stockName">Stock Name</Label>
            <Input
              id="stockName"
              value={stockName}
              onChange={(e) => setStockName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
            <Input
              id="purchasePrice"
              type="number"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Stock"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
