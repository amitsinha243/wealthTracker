import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { incomeAPI } from '@/services/api';

export interface Income {
  id: string;
  amount: number;
  date: string;
  source: string;
  description?: string;
}

export const useIncome = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchIncomes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await incomeAPI.getAll();
      setIncomes(data);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [user]);

  const addIncome = async (income: Omit<Income, 'id'>) => {
    if (!user) return;
    
    try {
      await incomeAPI.create(income);
      await fetchIncomes();
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const updateIncome = async (id: string, income: Partial<Income>) => {
    if (!user) return;
    
    try {
      await incomeAPI.update(id, income);
      await fetchIncomes();
    } catch (error) {
      console.error('Error updating income:', error);
    }
  };

  const deleteIncome = async (id: string) => {
    if (!user) return;
    
    try {
      await incomeAPI.delete(id);
      await fetchIncomes();
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  return { incomes, loading, addIncome, updateIncome, deleteIncome };
};
