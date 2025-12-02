import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { expenseAPI } from '@/services/api';

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  savingsAccountId?: string;
}

export const useExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await expenseAPI.getAll();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;
    
    try {
      await expenseAPI.create(expense);
      await fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;
    
    try {
      await expenseAPI.delete(id);
      await fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  return { expenses, loading, addExpense, deleteExpense };
};
