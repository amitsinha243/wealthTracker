import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wallet, TrendingUp, PiggyBank, Landmark, Plus, Receipt, TrendingDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAssets } from "@/hooks/useAssets";
import { AssetCard } from "@/components/AssetCard";
import { SavingsChart } from "@/components/SavingsChart";
import { TopExpenses } from "@/components/TopExpenses";
import { IncomeVsExpenseChart } from "@/components/IncomeVsExpenseChart";
import { AddIncomeDialog } from "@/components/AddIncomeDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NavigationMenu } from "@/components/NavigationMenu";
import { SavingsAccountDetails } from "@/components/SavingsAccountDetails";
import { MutualFundDetails } from "@/components/MutualFundDetails";
import { FixedDepositDetails } from "@/components/FixedDepositDetails";
import { StockDetails } from "@/components/StockDetails";
import { AddAssetDialog } from "@/components/AddAssetDialog";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { Footer } from "@/components/Footer";

type AssetType = 'savings' | 'mutualfunds' | 'fixeddeposits' | 'stocks' | null;

const Index = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const {
    savingsAccounts,
    mutualFunds,
    fixedDeposits,
    stocks,
    mutualFundTransactions,
    stockTransactions,
    fetchAssets,
    updateSavingsAccount,
    updateMutualFund,
    updateFixedDeposit,
    updateStock,
    deleteSavingsAccount,
    deleteMutualFund,
    deleteFixedDeposit,
    deleteStock
  } = useAssets();
  const [selectedAsset, setSelectedAsset] = useState<AssetType>(null);
  const [addAssetType, setAddAssetType] = useState<'savings' | 'mutual-fund' | 'fixed-deposit' | 'stock' | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);

  if (loading) return null;

  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalMutualFunds = mutualFunds.reduce((sum, fund) => sum + (fund.units * fund.nav), 0);
  const totalFixedDeposits = fixedDeposits.reduce((sum, fd) => {
    if (fd.depositType === 'RD') {
      const startDate = new Date(fd.startDate || fd.createdAt || new Date());
      const now = new Date();
      const monthsElapsed = Math.max(1,
        (now.getFullYear() - startDate.getFullYear()) * 12 +
        (now.getMonth() - startDate.getMonth()) + 1
      );
      const maturityDate = new Date(fd.maturityDate);
      const totalMonths = Math.max(1,
        (maturityDate.getFullYear() - startDate.getFullYear()) * 12 +
        (maturityDate.getMonth() - startDate.getMonth())
      );
      return sum + (fd.amount * Math.min(monthsElapsed, totalMonths));
    }
    return sum + fd.amount;
  }, 0);
  const totalStocks = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.purchasePrice), 0);
  const totalAssets = totalSavings + totalMutualFunds + totalFixedDeposits + totalStocks;

  // Calculate monthly additions (current month and previous month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const getMonthlyAddition = (assets: any[], month: number, year: number, amountKey?: string) => {
    return assets
      .filter(asset => {
        if (!asset.createdAt) return false;
        const createdDate = new Date(asset.createdAt);
        return createdDate.getMonth() === month && createdDate.getFullYear() === year;
      })
      .reduce((sum, asset) => {
        if (amountKey) {
          return sum + (asset[amountKey] || 0);
        }
        // For mutual funds/stocks (backward compatibility if no transactions)
        if (asset.units && asset.nav) {
          return sum + (asset.units * asset.nav);
        }
        if (asset.quantity && asset.purchasePrice) {
          return sum + (asset.quantity * asset.purchasePrice);
        }
        return sum;
      }, 0);
  };

  /**
   * Computes additions from transaction records for MF and Stocks.
   */
  const getMonthlyTransactionAddition = (transactions: any[], month: number, year: number, type: 'MF' | 'Stock') => {
    return transactions
      .filter(tx => {
        const txDate = new Date(tx.purchaseDate || tx.createdAt);
        return txDate.getMonth() === month && txDate.getFullYear() === year;
      })
      .reduce((sum, tx) => {
        if (type === 'MF') {
          return sum + (tx.units * tx.nav);
        } else {
          return sum + (tx.quantity * tx.purchasePrice);
        }
      }, 0);
  };

  /**
   * Computes fixed-deposit additions for a given month+year.
   * - FD: counted once in the month it was created (like before).
   * - RD: counted every month the RD is actively running (startDate → maturityDate),
   *       because a monthly instalment is invested each of those months.
   */
  const getMonthlyFDAddition = (deposits: any[], month: number, year: number): number => {
    return deposits.reduce((sum, fd) => {
      if (fd.depositType === 'RD') {
        // Active if target month is within [startDate, maturityDate)
        const start = new Date(fd.startDate || fd.createdAt || new Date());
        const maturity = new Date(fd.maturityDate);
        const targetFirst = new Date(year, month, 1);
        const startFirst = new Date(start.getFullYear(), start.getMonth(), 1);
        const maturityFirst = new Date(maturity.getFullYear(), maturity.getMonth(), 1);
        if (targetFirst >= startFirst && targetFirst < maturityFirst) {
          return sum + (fd.amount || 0);
        }
        return sum;
      } else {
        // Regular FD: count it in the month it was created
        if (!fd.createdAt) return sum;
        const createdDate = new Date(fd.createdAt);
        if (createdDate.getMonth() === month && createdDate.getFullYear() === year) {
          return sum + (fd.amount || 0);
        }
        return sum;
      }
    }, 0);
  };

  const monthlyFixedDeposits = getMonthlyFDAddition(fixedDeposits, currentMonth, currentYear);
  const monthlyMutualFunds = getMonthlyTransactionAddition(mutualFundTransactions, currentMonth, currentYear, 'MF');
  const monthlySavings = getMonthlyAddition(savingsAccounts, currentMonth, currentYear, 'balance');
  const monthlyStocks = getMonthlyTransactionAddition(stockTransactions, currentMonth, currentYear, 'Stock');

  const prevMonthFixedDeposits = getMonthlyFDAddition(fixedDeposits, previousMonth, previousYear);
  const prevMonthMutualFunds = getMonthlyTransactionAddition(mutualFundTransactions, previousMonth, previousYear, 'MF');
  const prevMonthSavings = getMonthlyAddition(savingsAccounts, previousMonth, previousYear, 'balance');
  const prevMonthStocks = getMonthlyTransactionAddition(stockTransactions, previousMonth, previousYear, 'Stock');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">WealthTracker</h1>
                <p className="text-xs text-muted-foreground">Welcome, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ₹{totalAssets.toLocaleString('en-IN')}
                </p>
              </div>
              <NavigationMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Assets Overview */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Your Assets</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <AssetCard
                title="Deposits"
                amount={totalFixedDeposits}
                icon={Landmark}
                accentGradient="from-amber-600 to-yellow-400"
                accentLight="#f59e0b14"
                accentBorder="#f59e0b30"
                accentColor="#f59e0b"
                thisMonth={monthlyFixedDeposits}
                lastMonth={prevMonthFixedDeposits}
                count={fixedDeposits.length}
                countLabel={`deposit${fixedDeposits.length !== 1 ? 's' : ''}`}
                onViewDetails={() => setSelectedAsset('fixeddeposits')}
              />
              <Button
                variant="outline"
                className="w-full group hover:border-amber-500/50 hover:bg-amber-50/50 transition-all duration-300"
                onClick={() => setAddAssetType('fixed-deposit')}
              >
                <div className="p-1 rounded-md bg-amber-100 text-amber-600 mr-2 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium">Add Deposit</span>
              </Button>
            </div>
            <div className="space-y-4">
              <AssetCard
                title="Mutual Funds"
                amount={totalMutualFunds}
                icon={TrendingUp}
                accentGradient="from-blue-600 to-indigo-500"
                accentLight="#3b82f614"
                accentBorder="#3b82f630"
                accentColor="#3b82f6"
                thisMonth={monthlyMutualFunds}
                lastMonth={prevMonthMutualFunds}
                count={mutualFunds.length}
                countLabel={`fund${mutualFunds.length !== 1 ? 's' : ''}`}
                onViewDetails={() => setSelectedAsset('mutualfunds')}
              />
              <Button
                variant="outline"
                className="w-full group hover:border-blue-500/50 hover:bg-blue-50/50 transition-all duration-300"
                onClick={() => setAddAssetType('mutual-fund')}
              >
                <div className="p-1 rounded-md bg-blue-100 text-blue-600 mr-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium">Add Mutual Fund</span>
              </Button>
            </div>
            <div className="space-y-4">
              <AssetCard
                title="Savings Account"
                amount={totalSavings}
                icon={PiggyBank}
                accentGradient="from-emerald-600 to-teal-400"
                accentLight="#10b98114"
                accentBorder="#10b98130"
                accentColor="#10b981"
                thisMonth={monthlySavings}
                lastMonth={prevMonthSavings}
                count={savingsAccounts.length}
                countLabel={`account${savingsAccounts.length !== 1 ? 's' : ''}`}
                onViewDetails={() => setSelectedAsset('savings')}
              />
              <Button
                variant="outline"
                className="w-full group hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all duration-300"
                onClick={() => setAddAssetType('savings')}
              >
                <div className="p-1 rounded-md bg-emerald-100 text-emerald-600 mr-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium">Add Savings Account</span>
              </Button>
            </div>
            <div className="space-y-4">
              <AssetCard
                title="Stocks"
                amount={totalStocks}
                icon={TrendingUp}
                accentGradient="from-violet-600 to-purple-400"
                accentLight="#8b5cf614"
                accentBorder="#8b5cf630"
                accentColor="#8b5cf6"
                thisMonth={monthlyStocks}
                lastMonth={prevMonthStocks}
                count={stocks.length}
                countLabel={`holding${stocks.length !== 1 ? 's' : ''}`}
                onViewDetails={() => setSelectedAsset('stocks')}
              />
              <Button
                variant="outline"
                className="w-full group hover:border-violet-500/50 hover:bg-violet-50/50 transition-all duration-300"
                onClick={() => setAddAssetType('stock')}
              >
                <div className="p-1 rounded-md bg-violet-100 text-violet-600 mr-2 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium">Add Stock</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Savings & Expenses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Financial Insights</h2>
            <div className="flex gap-3">
              <AddIncomeDialog />
              <Button
                onClick={() => setShowAddExpense(true)}
                className="group relative overflow-hidden bg-gradient-to-br from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 border-none shadow-lg shadow-rose-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <div className="p-1 rounded-md bg-white/20 group-hover:bg-white/30 transition-colors">
                    <Receipt className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold tracking-wide">Add Expense</span>
                </div>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <IncomeVsExpenseChart />
            <TopExpenses />
          </div>
          <div className="grid grid-cols-1 mt-6">
            <SavingsChart />
          </div>
        </section>
      </main>

      <Footer />

      {/* Asset Details Dialog */}
      <Dialog open={selectedAsset !== null} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Asset Details</DialogTitle>
          </DialogHeader>
          {selectedAsset === 'savings' && <SavingsAccountDetails accounts={savingsAccounts} onUpdate={updateSavingsAccount} onDelete={deleteSavingsAccount} />}
          {selectedAsset === 'mutualfunds' && <MutualFundDetails funds={mutualFunds} onRefresh={() => window.location.reload()} onUpdate={updateMutualFund} onDelete={deleteMutualFund} />}
          {selectedAsset === 'fixeddeposits' && <FixedDepositDetails deposits={fixedDeposits} onUpdate={updateFixedDeposit} onDelete={deleteFixedDeposit} />}
          {selectedAsset === 'stocks' && <StockDetails stocks={stocks} onUpdate={updateStock} onDelete={deleteStock} onRefresh={fetchAssets} />}
        </DialogContent>
      </Dialog>

      {/* Add Asset Dialog */}
      <AddAssetDialog
        open={addAssetType !== null}
        onOpenChange={(open) => !open && setAddAssetType(null)}
        type={addAssetType!}
      />

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
      />
    </div>
  );
};

export default Index;
