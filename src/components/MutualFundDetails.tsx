import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";
import { MutualFund } from "@/hooks/useAssets";
import { AddMutualFundUnitsDialog } from './AddMutualFundUnitsDialog';

interface MutualFundDetailsProps {
  funds: MutualFund[];
  onRefresh?: () => void;
}

export const MutualFundDetails = ({ funds, onRefresh }: MutualFundDetailsProps) => {
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [showAddUnitsDialog, setShowAddUnitsDialog] = useState(false);

  const handleAddUnits = (fund: any) => {
    setSelectedFund(fund);
    setShowAddUnitsDialog(true);
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
                <Button 
                  onClick={() => handleAddUnits(fund)}
                  className="w-full mt-4"
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Units
                </Button>
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
    </div>
  );
};
