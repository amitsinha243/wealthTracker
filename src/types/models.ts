// MongoDB-ready data models

export interface User {
  _id?: string;
  email: string;
  name: string;
  password: string; // hashed
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingsAccount {
  _id?: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  interestRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MutualFund {
  _id?: string;
  userId: string;
  fundName: string;
  schemeName: string;
  units: number;
  nav: number;
  purchaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FixedDeposit {
  _id?: string;
  userId: string;
  bankName: string;
  amount: number;
  interestRate: number;
  maturityDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  _id?: string;
  userId: string;
  category: string;
  amount: number;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const EXPENSE_CATEGORIES = [
  'Subscriptions',
  'Groceries',
  'Bike Petrol',
  'Car Petrol',
  'Utilities',
  'Public Transport',
  'Healthcare',
  'Education',
  'Shopping',
  'Dining Out',
  'EMI/Loans',
  'Personal Care',
  'Gifts & Donations',
  'Other'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
