import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Wallet, ArrowLeft, Landmark, TrendingUp,
  PiggyBank, LineChart, Activity,
  ArrowUpRight, ShieldCheck, Calendar
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAssets } from "@/hooks/useAssets";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Footer } from "@/components/Footer";
import { Progress } from "@/components/ui/progress";

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

  const totalFixedDeposits = fixedDeposits.reduce((sum, fd) => {
    if (fd.depositType === 'RD') {
      const startDate = new Date(fd.startDate || fd.createdAt || new Date());
      const now = new Date();
      // Calculate months elapsed (including current month)
      const monthsElapsed = Math.max(1,
        (now.getFullYear() - startDate.getFullYear()) * 12 +
        (now.getMonth() - startDate.getMonth()) + 1
      );
      const maturityDate = new Date(fd.maturityDate);
      const totalMonths = Math.max(1,
        (maturityDate.getFullYear() - startDate.getFullYear()) * 12 +
        (maturityDate.getMonth() - startDate.getMonth())
      );
      // Count only what's invested so far
      return sum + (fd.amount * Math.min(monthsElapsed, totalMonths));
    }
    return sum + fd.amount;
  }, 0);

  const totalStocks = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.purchasePrice), 0);
  const totalAssets = totalSavings + totalMutualFunds + totalFixedDeposits + totalStocks;

  const AssetSectionHeader = ({ icon: Icon, title, amount, colorClass, gradientClass }: any) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientClass} shadow-lg shadow-${colorClass}/20`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">Current Investment</p>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-2xl border border-border/50 backdrop-blur-sm">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground leading-none mb-1">Current Value</p>
          <p className={`text-xl font-black ${colorClass}`}>₹{amount.toLocaleString('en-IN')}</p>
        </div>
        <div className={`h-8 w-[2px] ${gradientClass.split(' ')[0]} opacity-20 rounded-full`} />
        <Badge variant="outline" className="bg-background/50 font-mono font-bold">
          {((amount / totalAssets) * 100).toFixed(1)}%
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="rounded-full hover:bg-muted/80 transition-all active:scale-90"
              >
                <Link to="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                  <Wallet className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-foreground tracking-tighter">CURRENT ASSETS</h1>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] leading-none mt-1">Net Worth Overview</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right pr-4 border-r border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Liquid Net Worth</p>
                <p className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ₹{totalAssets.toLocaleString('en-IN')}
                </p>
              </div>
              <NavigationMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10 flex-1 max-w-7xl">

        {/* Deposits */}
        <section className="mb-16">
          <AssetSectionHeader
            icon={Landmark}
            title="Deposits"
            amount={totalFixedDeposits}
            colorClass="text-amber-600"
            gradientClass="from-amber-600 to-yellow-400"
          />
          {fixedDeposits.length === 0 ? (
            <Card className="border-dashed py-12 flex flex-col items-center justify-center bg-muted/10">
              <Landmark className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No deposits added yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fixedDeposits.map((fd) => {
                const startDate = new Date(fd.startDate || fd.createdAt || new Date());
                const maturityDate = new Date(fd.maturityDate);
                const today = new Date();
                const years = (maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
                const monthsElapsed = Math.max(1,
                  (today.getFullYear() - startDate.getFullYear()) * 12 +
                  (today.getMonth() - startDate.getMonth()) + 1
                );
                const totalMonths = Math.max(1,
                  (maturityDate.getFullYear() - startDate.getFullYear()) * 12 +
                  (maturityDate.getMonth() - startDate.getMonth())
                );
                let maturityAmount: number;
                const totalPrincipal = fd.depositType === 'RD' ? fd.amount * totalMonths : fd.amount;

                if (fd.depositType === 'RD') {
                  const monthlyRate = fd.interestRate / 100 / 12;
                  if (monthlyRate === 0) {
                    maturityAmount = fd.amount * totalMonths;
                  } else {
                    maturityAmount = fd.amount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
                  }
                } else {
                  maturityAmount = fd.amount * Math.pow(1 + fd.interestRate / 100, years);
                }

                // Calculate progress
                const totalDays = Math.max(1, (maturityDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
                const elapsedDays = Math.max(0, (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
                const progress = Math.min(100, (elapsedDays / totalDays) * 100);

                return (
                  <Card key={fd.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-yellow-400" />
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-bold">{fd.bankName}</CardTitle>
                          <Badge variant="secondary" className="mt-1 bg-amber-500/10 text-amber-700 border-amber-500/20">
                            {fd.depositType === 'RD' ? 'Recurring' : 'Fixed'}
                          </Badge>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                          <Landmark className="h-5 w-5 text-amber-600 group-hover:text-inherit" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-3 rounded-xl">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Installment</p>
                          <p className="text-lg font-bold">₹{fd.amount.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-xl">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Current Invested</p>
                          <p className="text-lg font-bold">₹{(fd.amount * Math.min(monthsElapsed, totalMonths)).toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <span>Progress</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-amber-100" indicatorClassName="bg-gradient-to-r from-amber-500 to-yellow-400" />
                      </div>

                      <div className="flex justify-between items-end pt-4 border-t border-border/50">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Maturity Value</p>
                          <p className="text-2xl font-black text-amber-600 leading-none">
                            ₹{maturityAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">Maturity Date</p>
                          <p className="text-sm font-black text-amber-900 leading-none">{new Date(fd.maturityDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Mutual Funds */}
        <section className="mb-16">
          <AssetSectionHeader
            icon={TrendingUp}
            title="Mutual Funds"
            amount={totalMutualFunds}
            colorClass="text-blue-600"
            gradientClass="from-blue-600 to-indigo-500"
          />
          {mutualFunds.length === 0 ? (
            <Card className="border-dashed py-12 flex flex-col items-center justify-center bg-muted/10">
              <TrendingUp className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No mutual funds added yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mutualFunds.map((fund) => {
                const currentValue = fund.units * fund.nav;

                return (
                  <Card key={fund.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 mr-4">
                          <CardTitle className="text-xl font-bold truncate">{fund.fundName}</CardTitle>
                          <CardDescription className="text-xs font-medium truncate mt-1">{fund.schemeName}</CardDescription>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                          <TrendingUp className="h-5 w-5 text-blue-600 group-hover:text-inherit" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-3 rounded-xl">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Units</p>
                          <p className="text-lg font-bold">{fund.units.toFixed(3)}</p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-xl">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Current NAV</p>
                          <p className="text-lg font-bold">₹{fund.nav}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Purchased on {new Date(fund.purchaseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-border/50">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Current Value</p>
                          <p className="text-2xl font-black text-blue-600 leading-none">
                            ₹{currentValue.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="group/btn h-10 w-10 hover:bg-blue-600 hover:text-white transition-all rounded-full border border-blue-100">
                          <ArrowUpRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Stocks */}
        <section className="mb-16">
          <AssetSectionHeader
            icon={LineChart}
            title="Stocks"
            amount={totalStocks}
            colorClass="text-violet-600"
            gradientClass="from-violet-600 to-purple-400"
          />
          {stocks.length === 0 ? (
            <Card className="border-dashed py-12 flex flex-col items-center justify-center bg-muted/10">
              <LineChart className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No stocks added yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stocks.map((stock) => {
                const totalValue = stock.quantity * stock.purchasePrice;
                return (
                  <Card key={stock.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-purple-400" />
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 mr-4">
                          <CardTitle className="text-xl font-bold truncate">{stock.stockName}</CardTitle>
                          <Badge variant="secondary" className="mt-1 bg-violet-500/10 text-violet-700 border-violet-500/20 font-mono">
                            {stock.symbol}
                          </Badge>
                        </div>
                        <div className="p-2 rounded-lg bg-violet-50 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                          <LineChart className="h-5 w-5 text-violet-600 group-hover:text-inherit" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-3 rounded-xl">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Quantity</p>
                          <p className="text-lg font-bold">{stock.quantity}</p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-xl">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Avg Price</p>
                          <p className="text-lg font-bold">₹{stock.purchasePrice}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-violet-700 bg-violet-50 p-2 rounded-lg border border-violet-100">
                        <Activity className="h-3.5 w-3.5" />
                        <span>Holding for {Math.floor((new Date().getTime() - new Date(stock.purchaseDate).getTime()) / (1000 * 3600 * 24))} days</span>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-border/50">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Total Value</p>
                          <p className="text-2xl font-black text-violet-600 leading-none">
                            ₹{totalValue.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="group/btn h-10 w-10 hover:bg-violet-600 hover:text-white transition-all rounded-full border border-violet-100">
                          <ArrowUpRight className="h-5 w-5" />
                        </Button>
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
          <AssetSectionHeader
            icon={PiggyBank}
            title="Savings"
            amount={totalSavings}
            colorClass="text-emerald-600"
            gradientClass="from-emerald-600 to-teal-400"
          />
          {savingsAccounts.length === 0 ? (
            <Card className="border-dashed py-12 flex flex-col items-center justify-center bg-muted/10">
              <PiggyBank className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No savings accounts added yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savingsAccounts.map((account) => (
                <Card key={account.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-teal-400" />
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold">{account.bankName}</CardTitle>
                        <p className="text-xs font-mono font-bold text-muted-foreground mt-1">
                          **** {account.accountNumber.slice(-4)}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                        <PiggyBank className="h-5 w-5 text-emerald-600 group-hover:text-inherit" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-700">
                          <ShieldCheck size={14} />
                        </div>
                        <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Secure Account</span>
                      </div>
                      <Badge variant="outline" className="font-bold text-emerald-600 border-emerald-200">
                        {account.interestRate}% Interest
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-border/50">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Current Balance</p>
                        <p className="text-2xl font-black text-emerald-600 leading-none">
                          ₹{account.balance.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className={`p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-60`}>
                        <ArrowUpRight className="h-6 w-6 text-emerald-600" />
                      </div>
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
