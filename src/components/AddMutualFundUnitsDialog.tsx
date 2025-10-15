import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mutualFundAPI } from '@/services/api';
import { toast } from 'sonner';

interface AddMutualFundUnitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mutualFund: any;
  onSuccess: () => void;
}

export const AddMutualFundUnitsDialog = ({ 
  open, 
  onOpenChange, 
  mutualFund,
  onSuccess 
}: AddMutualFundUnitsDialogProps) => {
  const [formData, setFormData] = useState({
    units: '',
    nav: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await mutualFundAPI.addUnits(
        mutualFund.id,
        parseFloat(formData.units),
        parseFloat(formData.nav),
        formData.purchaseDate
      );
      
      toast.success('Units added successfully!');
      setFormData({
        units: '',
        nav: '',
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
          <DialogTitle>Add Units to {mutualFund?.fundName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="units">Units</Label>
            <Input 
              id="units" 
              type="number" 
              step="0.001"
              value={formData.units} 
              onChange={(e) => setFormData({ ...formData, units: e.target.value })} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nav">NAV (₹)</Label>
            <Input 
              id="nav" 
              type="number" 
              step="0.01"
              value={formData.nav} 
              onChange={(e) => setFormData({ ...formData, nav: e.target.value })} 
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
