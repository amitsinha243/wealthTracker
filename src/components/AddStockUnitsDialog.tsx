import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { stockAPI } from '@/services/api';
import { toast } from 'sonner';

interface AddStockUnitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: any;
  onSuccess: () => void;
}

export const AddStockUnitsDialog = ({ 
  open, 
  onOpenChange, 
  stock,
  onSuccess 
}: AddStockUnitsDialogProps) => {
  const [formData, setFormData] = useState({
    quantity: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await stockAPI.addUnits(
        stock.id,
        parseFloat(formData.quantity),
        parseFloat(formData.purchasePrice),
        formData.purchaseDate
      );
      
      toast.success('Units added successfully!');
      setFormData({
        quantity: '',
        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0]
      });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error('Failed to add units');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Units to {stock?.stockName} ({stock?.symbol})</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input 
              id="quantity" 
              type="number" 
              step="0.001"
              value={formData.quantity} 
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
            <Input 
              id="purchasePrice" 
              type="number" 
              step="0.01"
              value={formData.purchasePrice} 
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input 
              id="purchaseDate" 
              type="date" 
              value={formData.purchaseDate} 
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} 
              required 
            />
          </div>
          <Button type="submit" className="w-full">Add Units</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
