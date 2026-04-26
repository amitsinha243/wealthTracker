import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { expenseBookAPI } from '@/services/api';

export interface ExpenseBook {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  memberUserIds: string[];
  memberEmails: string[];
  memberNames: string[];
}

export interface ExpenseBookExpense {
  id: string;
  expenseBookId: string;
  description: string;
  amount: number;
  paidBy: string;
  paidByUserId: string;
  expenseDate: string;
  addedByUserId: string;
}

export const useExpenseBooks = () => {
  const { user } = useAuth();
  const [expenseBooks, setExpenseBooks] = useState<ExpenseBook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenseBooks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await expenseBookAPI.getAll();
      setExpenseBooks(data);
    } catch (error) {
      console.error('Error fetching expense books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseBooks();
  }, [user]);

  const addExpenseBook = async (bookData: any) => {
    await expenseBookAPI.create(bookData);
    await fetchExpenseBooks();
  };

  const updateExpenseBook = async (id: string, bookData: any) => {
    await expenseBookAPI.update(id, bookData);
    await fetchExpenseBooks();
  };

  const deleteExpenseBook = async (id: string) => {
    await expenseBookAPI.delete(id);
    await fetchExpenseBooks();
  };

  const addMember = async (bookId: string, email: string) => {
    await expenseBookAPI.addMember(bookId, email);
    await fetchExpenseBooks();
  };

  const removeMember = async (bookId: string, userId: string) => {
    await expenseBookAPI.removeMember(bookId, userId);
    await fetchExpenseBooks();
  };

  const getExpenses = async (bookId: string) => {
    return await expenseBookAPI.getExpenses(bookId);
  };

  const addExpense = async (bookId: string, expenseData: any) => {
    await expenseBookAPI.addExpense(bookId, expenseData);
  };

  const updateExpense = async (bookId: string, expenseId: string, expenseData: any) => {
    await expenseBookAPI.updateExpense(bookId, expenseId, expenseData);
  };

  const deleteExpense = async (bookId: string, expenseId: string) => {
    await expenseBookAPI.deleteExpense(bookId, expenseId);
  };

  return {
    expenseBooks,
    loading,
    fetchExpenseBooks,
    addExpenseBook,
    updateExpenseBook,
    deleteExpenseBook,
    addMember,
    removeMember,
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense
  };
};
