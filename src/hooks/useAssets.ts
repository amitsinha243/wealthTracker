import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { savingsAccountAPI, mutualFundAPI, fixedDepositAPI } from '@/services/api';

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
  createdAt?: string;
  updatedAt?: string;
}

export const useAssets = () => {
  const { user } = useAuth();
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [savings, funds, deposits] = await Promise.all([
        savingsAccountAPI.getAll(),
        mutualFundAPI.getAll(),
        fixedDepositAPI.getAll()
      ]);
      
      setSavingsAccounts(savings);
      setMutualFunds(funds);
      setFixedDeposits(deposits);
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
      await fetchAssets();
    } catch (error) {
      console.error('Error adding savings account:', error);
    }
  };

  const addMutualFund = async (fund: Omit<MutualFund, 'id'>) => {
    if (!user) return;
    
    try {
      await mutualFundAPI.create(fund);
      await fetchAssets();
    } catch (error) {
      console.error('Error adding mutual fund:', error);
    }
  };

  const addFixedDeposit = async (deposit: Omit<FixedDeposit, 'id'>) => {
    if (!user) return;
    
    try {
      await fixedDepositAPI.create(deposit);
      await fetchAssets();
    } catch (error) {
      console.error('Error adding fixed deposit:', error);
    }
  };

  return {
    savingsAccounts,
    mutualFunds,
    fixedDeposits,
    loading,
    addSavingsAccount,
    addMutualFund,
    addFixedDeposit
  };
};
