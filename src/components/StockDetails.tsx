import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stock } from "@/hooks/useAssets";

interface StockDetailsProps {
  stocks: Stock[];
}

export const StockDetails = ({ stocks }: StockDetailsProps) => {
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
                <span className="text-muted-foreground">Purchase Price:</span>
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
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
