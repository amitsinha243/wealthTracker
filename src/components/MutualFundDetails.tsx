import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MutualFund } from "@/hooks/useAssets";

interface MutualFundDetailsProps {
  funds: MutualFund[];
}

export const MutualFundDetails = ({ funds }: MutualFundDetailsProps) => {
  if (funds.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No mutual funds added yet. Click "Add Mutual Fund" to get started.
      </div>
    );
  }

  const totalValue = funds.reduce((sum, fund) => sum + (fund.units * fund.nav), 0);
  const totalInvested = funds.reduce((sum, fund) => sum + fund.investedAmount, 0);
  const overallReturns = ((totalValue - totalInvested) / totalInvested) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Mutual Funds</h3>
          <p className="text-sm text-muted-foreground">{funds.length} active investments</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">₹{totalValue.toLocaleString('en-IN')}</p>
          <p className="text-sm text-accent font-medium flex items-center justify-end gap-1">
            <TrendingUp className="h-3 w-3" />
            {overallReturns.toFixed(2)}% returns
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {funds.map((fund) => {
          const currentValue = fund.units * fund.nav;
          const returns = ((currentValue - fund.investedAmount) / fund.investedAmount) * 100;
          const isPositive = returns > 0;
          
          return (
            <Card 
              key={fund.id}
              className="p-4 hover:shadow-md transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-secondary/20"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{fund.name}</h4>
                  </div>
                  <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1">
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {returns.toFixed(2)}%
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Value</p>
                    <p className="text-lg font-bold text-foreground">₹{currentValue.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Invested</p>
                    <p className="text-lg font-bold text-foreground">₹{fund.investedAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Units</p>
                    <p className="text-sm font-medium text-foreground">{fund.units.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">NAV</p>
                    <p className="text-sm font-medium text-foreground">₹{fund.nav.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
