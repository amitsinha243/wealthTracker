import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MutualFund } from "@/hooks/useAssets";

interface EditMutualFundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fund: MutualFund;
  onUpdate: (id: string, data: Partial<MutualFund>) => Promise<void>;
}

export const EditMutualFundDialog = ({ 
  open, 
  onOpenChange, 
  fund,
  onUpdate 
}: EditMutualFundDialogProps) => {
  const [fundName, setFundName] = useState(fund.fundName);
  const [schemeName, setSchemeName] = useState(fund.schemeName);
  const [units, setUnits] = useState(fund.units.toString());
  const [nav, setNav] = useState(fund.nav.toString());
  const [purchaseDate, setPurchaseDate] = useState(fund.purchaseDate);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onUpdate(fund.id, {
        fundName,
        schemeName,
        units: parseFloat(units),
        nav: parseFloat(nav),
        purchaseDate
      });
      
      toast.success("Mutual fund updated successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update mutual fund");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Mutual Fund</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fundName">Fund Name</Label>
            <Input
              id="fundName"
              value={fundName}
              onChange={(e) => setFundName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="schemeName">Scheme Name</Label>
            <Input
              id="schemeName"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="units">Units</Label>
            <Input
              id="units"
              type="number"
              step="0.01"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="nav">NAV (₹)</Label>
            <Input
              id="nav"
              type="number"
              step="0.01"
              value={nav}
              onChange={(e) => setNav(e.target.value)}
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
            {loading ? "Updating..." : "Update Fund"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
