import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wallet, ArrowLeft, Landmark, TrendingUp, PiggyBank, LineChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAssets } from "@/hooks/useAssets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Footer } from "@/components/Footer";

const Assets = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { savingsAccounts, mutualFunds, fixedDeposits, stocks } = useAssets();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalMutualFunds = mutualFunds.reduce((sum, fund) => sum + (fund.units * fund.nav), 0);
  const totalFixedDeposits = fixedDeposits.reduce((sum, fd) => sum + fd.amount, 0);
  const totalStocks = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.purchasePrice), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                  <Wallet className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">All Assets</h1>
              </div>
            </div>
            <NavigationMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Deposits */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Landmark className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Deposits</h2>
            <Badge variant="secondary" className="ml-2">
              ₹{totalFixedDeposits.toLocaleString('en-IN')}
            </Badge>
          </div>
          {fixedDeposits.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No deposits added yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fixedDeposits.map((fd) => {
                const years = (new Date(fd.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365);
                let maturityAmount: number;
                
                if (fd.depositType === 'RD') {
                  const months = Math.max(0, Math.ceil(years * 12));
                  const monthlyRate = fd.interestRate / 100 / 12;
                  if (monthlyRate === 0) {
                    maturityAmount = fd.amount * months;
                  } else {
                    maturityAmount = fd.amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
                  }
                } else {
                  maturityAmount = fd.amount * Math.pow(1 + fd.interestRate / 100, years);
                }
                
                return (
                  <Card key={fd.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{fd.bankName}</CardTitle>
                      <Badge variant="outline" className="w-fit">
                        {fd.depositType === 'RD' ? 'Recurring Deposit' : 'Fixed Deposit'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {fd.depositType === 'RD' ? 'Monthly Installment:' : 'Amount:'}
                        </span>
                        <span className="font-semibold">₹{fd.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Interest Rate:</span>
                        <span className="font-semibold">{fd.interestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Maturity Date:</span>
                        <span className="font-semibold">{new Date(fd.maturityDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Maturity Amount:</span>
                        <span className="font-bold text-primary">₹{maturityAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Mutual Funds */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Mutual Funds</h2>
            <Badge variant="secondary" className="ml-2">
              ₹{totalMutualFunds.toLocaleString('en-IN')}
            </Badge>
          </div>
          {mutualFunds.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No mutual funds added yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mutualFunds.map((fund) => {
                const currentValue = fund.units * fund.nav;
                
                return (
                  <Card key={fund.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{fund.fundName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{fund.schemeName}</p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Units:</span>
                        <span className="font-semibold">{fund.units}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">NAV:</span>
                        <span className="font-semibold">₹{fund.nav}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Purchase Date:</span>
                        <span className="font-semibold">{new Date(fund.purchaseDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Current Value:</span>
                        <span className="font-bold text-primary">₹{currentValue.toLocaleString('en-IN')}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Stocks */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Stocks</h2>
            <Badge variant="secondary" className="ml-2">
              ₹{totalStocks.toLocaleString('en-IN')}
            </Badge>
          </div>
          {stocks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No stocks added yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map((stock) => {
                const totalValue = stock.quantity * stock.purchasePrice;
                return (
                  <Card key={stock.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{stock.stockName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{stock.symbol}</p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <span className="font-semibold">{stock.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Purchase Price:</span>
                        <span className="font-semibold">₹{stock.purchasePrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Purchase Date:</span>
                        <span className="font-semibold">{new Date(stock.purchaseDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Total Value:</span>
                        <span className="font-bold text-primary">₹{totalValue.toLocaleString('en-IN')}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Savings Accounts */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <PiggyBank className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Savings Accounts</h2>
            <Badge variant="secondary" className="ml-2">
              ₹{totalSavings.toLocaleString('en-IN')}
            </Badge>
          </div>
          {savingsAccounts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No savings accounts added yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savingsAccounts.map((account) => (
                <Card key={account.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{account.bankName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Account Number:</span>
                      <span className="font-semibold">****{account.accountNumber.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Balance:</span>
                      <span className="font-bold text-primary">₹{account.balance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Interest Rate:</span>
                      <span className="font-semibold">{account.interestRate}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Assets;
