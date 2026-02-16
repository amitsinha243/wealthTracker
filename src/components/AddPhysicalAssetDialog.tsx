import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PHYSICAL_ASSET_TYPES } from '@/hooks/usePhysicalAssets';
import { toast } from 'sonner';

interface AddPhysicalAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (asset: any) => Promise<void>;
}

export const AddPhysicalAssetDialog = ({ open, onOpenChange, onAdd }: AddPhysicalAssetDialogProps) => {
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAdd({
        assetName: formData.assetName,
        assetType: formData.assetType,
        purchasePrice: parseFloat(formData.purchasePrice),
        currentValue: parseFloat(formData.currentValue),
        purchaseDate: formData.purchaseDate,
        description: formData.description || ''
      });
      toast.success('Physical asset added successfully!');
      setFormData({});
      onOpenChange(false);
    } catch {
      toast.error('Failed to add physical asset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Physical Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assetName">Asset Name</Label>
            <Input id="assetName" placeholder="e.g. Honda Activa, My House" value={formData.assetName || ''} onChange={(e) => setFormData({ ...formData, assetName: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assetType">Asset Type</Label>
            <Select value={formData.assetType || ''} onValueChange={(value) => setFormData({ ...formData, assetType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {PHYSICAL_ASSET_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
            <Input id="purchasePrice" type="number" value={formData.purchasePrice || ''} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentValue">Current Value (₹)</Label>
            <Input id="currentValue" type="number" value={formData.currentValue || ''} onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input id="purchaseDate" type="date" value={formData.purchaseDate || ''} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" placeholder="Any notes about this asset..." value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Asset'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
