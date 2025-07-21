export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  subcategory?: string;
  type: 'income' | 'expense';
  account: string;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense' | 'both';
  subcategories: Subcategory[];
  budgetLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  budgetLimit?: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'investment';
  balance: number;
  currency: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  limit: number;
  period: 'monthly' | 'yearly';
  alertThreshold: number; // percentage (e.g., 80 for 80%)
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  theme: 'light' | 'dark';
  createdAt: string;
}

export interface Alert {
  id: string;
  type: 'budget_exceeded' | 'goal_reminder' | 'bill_due' | 'recurring_transaction';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface ImportTransaction {
  description: string;
  amount: number;
  date: string;
  category?: string;
  account: string;
  type?: 'income' | 'expense';
  isMatched: boolean;
}

export interface FilterOptions {
  dateFrom?: string;
  dateTo?: string;
  type?: 'income' | 'expense' | 'all';
  categories?: string[];
  accounts?: string[];
  amountMin?: number;
  amountMax?: number;
  search?: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}