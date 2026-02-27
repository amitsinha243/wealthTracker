import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { savingsAccountAPI, mutualFundAPI, fixedDepositAPI, stockAPI } from '@/services/api';

export interface SavingsAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  interestRate: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MutualFund {
  id: string;
  fundName: string;
  schemeName: string;
  units: number;
  nav: number;
  purchaseDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FixedDeposit {
  id: string;
  bankName: string;
  amount: number;
  interestRate: number;
  maturityDate: string;
  depositType: 'FD' | 'RD'; // FD = Fixed Deposit, RD = Recurring Deposit
  startDate?: string; // When the RD actually started (for RDs)
  savingsAccountId?: string; // Linked savings account for automatic deductions (for RDs)
  lastDeductionDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Stock {
  id: string;
  stockName: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MutualFundTransaction {
  id: string;
  mutualFundId: string;
  units: number;
  nav: number;
  purchaseDate: string;
  createdAt: string;
}

export interface StockTransaction {
  id: string;
  stockId: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  createdAt: string;
}

export const useAssets = () => {
  const { user } = useAuth();
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [mutualFundTransactions, setMutualFundTransactions] = useState<MutualFundTransaction[]>([]);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [savings, funds, deposits, stocksData, mfTrans, sTrans] = await Promise.all([
        savingsAccountAPI.getAll(),
        mutualFundAPI.getAll(),
        fixedDepositAPI.getAll(),
        stockAPI.getAll(),
        mutualFundAPI.getAllTransactions(),
        stockAPI.getAllTransactions()
      ]);

      setSavingsAccounts(savings);
      setMutualFunds(funds);
      setFixedDeposits(deposits);
      setStocks(stocksData);
      setMutualFundTransactions(mfTrans);
      setStockTransactions(sTrans);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [user]);

  const addSavingsAccount = async (account: Omit<SavingsAccount, 'id'>) => {
    if (!user) return;

    try {
      await savingsAccountAPI.create(account);
      // Force a fresh fetch with a small delay to ensure backend updates
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error adding savings account:', error);
      throw error;
    }
  };

  const addMutualFund = async (fund: Omit<MutualFund, 'id'>) => {
    if (!user) return;

    try {
      await mutualFundAPI.create(fund);
      // Force a fresh fetch with a small delay to ensure backend updates
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error adding mutual fund:', error);
      throw error;
    }
  };

  const addFixedDeposit = async (deposit: Omit<FixedDeposit, 'id'>) => {
    if (!user) return;

    try {
      await fixedDepositAPI.create(deposit);
      // Force a fresh fetch with a small delay to ensure backend updates
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error adding fixed deposit:', error);
      throw error;
    }
  };

  const addStock = async (stock: Omit<Stock, 'id'>) => {
    if (!user) return;

    try {
      await stockAPI.create(stock);
      // Force a fresh fetch with a small delay to ensure backend updates
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error adding stock:', error);
      throw error;
    }
  };

  const updateSavingsAccount = async (id: string, account: Partial<SavingsAccount>) => {
    if (!user) return;

    try {
      await savingsAccountAPI.update(id, account);
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error updating savings account:', error);
      throw error;
    }
  };

  const updateMutualFund = async (id: string, fund: Partial<MutualFund>) => {
    if (!user) return;

    try {
      await mutualFundAPI.update(id, fund);
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error updating mutual fund:', error);
      throw error;
    }
  };

  const updateFixedDeposit = async (id: string, deposit: Partial<FixedDeposit>) => {
    if (!user) return;

    try {
      await fixedDepositAPI.update(id, deposit);
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error updating fixed deposit:', error);
      throw error;
    }
  };

  const updateStock = async (id: string, stock: Partial<Stock>) => {
    if (!user) return;

    try {
      await stockAPI.update(id, stock);
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  const deleteSavingsAccount = async (id: string) => {
    if (!user) return;

    try {
      await savingsAccountAPI.delete(id);
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error deleting savings account:', error);
      throw error;
    }
  };

  const deleteMutualFund = async (id: string) => {
    if (!user) return;

    try {
      await mutualFundAPI.delete(id);
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error deleting mutual fund:', error);
      throw error;
    }
  };

  const deleteFixedDeposit = async (id: string) => {
    if (!user) return;

    try {
      await fixedDepositAPI.delete(id);
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error deleting fixed deposit:', error);
      throw error;
    }
  };

  const deleteStock = async (id: string) => {
    if (!user) return;

    try {
      await stockAPI.delete(id);
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error deleting stock:', error);
      throw error;
    }
  };

  return {
    savingsAccounts,
    mutualFunds,
    fixedDeposits,
    stocks,
    mutualFundTransactions,
    stockTransactions,
    loading,
    fetchAssets,
    addSavingsAccount,
    addMutualFund,
    addFixedDeposit,
    addStock,
    updateSavingsAccount,
    updateMutualFund,
    updateFixedDeposit,
    updateStock,
    deleteSavingsAccount,
    deleteMutualFund,
    deleteFixedDeposit,
    deleteStock
  };
};
