import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wallet, TrendingUp, PiggyBank, Landmark, Plus, LogOut, Receipt, LayoutGrid, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAssets } from "@/hooks/useAssets";
import { AssetCard } from "@/components/AssetCard";
import { SavingsChart } from "@/components/SavingsChart";
import { TopExpenses } from "@/components/TopExpenses";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SavingsAccountDetails } from "@/components/SavingsAccountDetails";
import { MutualFundDetails } from "@/components/MutualFundDetails";
import { FixedDepositDetails } from "@/components/FixedDepositDetails";
import { AddAssetDialog } from "@/components/AddAssetDialog";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";

type AssetType = 'savings' | 'mutualfunds' | 'fixeddeposits' | null;

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { savingsAccounts, mutualFunds, fixedDeposits } = useAssets();
  const [selectedAsset, setSelectedAsset] = useState<AssetType>(null);
  const [addAssetType, setAddAssetType] = useState<'savings' | 'mutual-fund' | 'fixed-deposit' | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalMutualFunds = mutualFunds.reduce((sum, fund) => sum + (fund.units * fund.nav), 0);
  const totalFixedDeposits = fixedDeposits.reduce((sum, fd) => sum + fd.amount, 0);
  const totalAssets = totalSavings + totalMutualFunds + totalFixedDeposits;

  return (
    <div className="min-h-screen bg-background">
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
              <Button variant="outline" size="icon" asChild>
                <Link to="/assets">
                  <LayoutGrid className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link to="/expenses">
                  <FileText className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Assets Overview */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Your Assets</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <AssetCard
                title="Fixed Deposits"
                amount={totalFixedDeposits}
                icon={Landmark}
                description={`${fixedDeposits.length} deposit${fixedDeposits.length !== 1 ? 's' : ''}`}
                onViewDetails={() => setSelectedAsset('fixeddeposits')}
              />
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setAddAssetType('fixed-deposit')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Fixed Deposit
              </Button>
            </div>
            <div className="space-y-4">
              <AssetCard
                title="Mutual Funds"
                amount={totalMutualFunds}
                icon={TrendingUp}
                description={`${mutualFunds.length} fund${mutualFunds.length !== 1 ? 's' : ''}`}
                onViewDetails={() => setSelectedAsset('mutualfunds')}
              />
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setAddAssetType('mutual-fund')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Mutual Fund
              </Button>
            </div>
            <div className="space-y-4">
              <AssetCard
                title="Savings Account"
                amount={totalSavings}
                icon={PiggyBank}
                description={`${savingsAccounts.length} account${savingsAccounts.length !== 1 ? 's' : ''}`}
                onViewDetails={() => setSelectedAsset('savings')}
              />
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setAddAssetType('savings')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Savings Account
              </Button>
            </div>
          </div>
        </section>

        {/* Savings & Expenses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Financial Insights</h2>
            <Button onClick={() => setShowAddExpense(true)}>
              <Receipt className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SavingsChart />
            <TopExpenses />
          </div>
        </section>
      </main>

      {/* Asset Details Dialog */}
      <Dialog open={selectedAsset !== null} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Asset Details</DialogTitle>
          </DialogHeader>
          {selectedAsset === 'savings' && <SavingsAccountDetails accounts={savingsAccounts} />}
          {selectedAsset === 'mutualfunds' && <MutualFundDetails funds={mutualFunds} />}
          {selectedAsset === 'fixeddeposits' && <FixedDepositDetails deposits={fixedDeposits} />}
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
