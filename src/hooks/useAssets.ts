import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface SavingsAccount {
  id: string;
  bank: string;
  accountNumber: string;
  balance: number;
  interestRate: number;
}

export interface MutualFund {
  id: string;
  name: string;
  units: number;
  nav: number;
  investedAmount: number;
}

export interface FixedDeposit {
  id: string;
  bank: string;
  amount: number;
  interestRate: number;
  maturityDate: string;
  maturityAmount: number;
}

export const useAssets = () => {
  const { user } = useAuth();
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);

  useEffect(() => {
    if (user) {
      const key = `assets_${user.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        setSavingsAccounts(data.savingsAccounts || []);
        setMutualFunds(data.mutualFunds || []);
        setFixedDeposits(data.fixedDeposits || []);
      }
    }
  }, [user]);

  const saveToStorage = (savings: SavingsAccount[], funds: MutualFund[], deposits: FixedDeposit[]) => {
    if (user) {
      const key = `assets_${user.id}`;
      localStorage.setItem(key, JSON.stringify({
        savingsAccounts: savings,
        mutualFunds: funds,
        fixedDeposits: deposits
      }));
    }
  };

  const addSavingsAccount = (account: Omit<SavingsAccount, 'id'>) => {
    const newAccount = { ...account, id: crypto.randomUUID() };
    const updated = [...savingsAccounts, newAccount];
    setSavingsAccounts(updated);
    saveToStorage(updated, mutualFunds, fixedDeposits);
  };

  const addMutualFund = (fund: Omit<MutualFund, 'id'>) => {
    const newFund = { ...fund, id: crypto.randomUUID() };
    const updated = [...mutualFunds, newFund];
    setMutualFunds(updated);
    saveToStorage(savingsAccounts, updated, fixedDeposits);
  };

  const addFixedDeposit = (deposit: Omit<FixedDeposit, 'id'>) => {
    const newDeposit = { ...deposit, id: crypto.randomUUID() };
    const updated = [...fixedDeposits, newDeposit];
    setFixedDeposits(updated);
    saveToStorage(savingsAccounts, mutualFunds, updated);
  };

  return {
    savingsAccounts,
    mutualFunds,
    fixedDeposits,
    addSavingsAccount,
    addMutualFund,
    addFixedDeposit
  };
};
