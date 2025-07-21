import { z } from 'zod';

export const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  type: z.enum(['income', 'expense']),
  account: z.string().min(1, 'Account is required'),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  tags: z.array(z.string()).optional()
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  color: z.string().min(1, 'Color is required'),
  icon: z.string().min(1, 'Icon is required'),
  type: z.enum(['income', 'expense', 'both']),
  budgetLimit: z.number().min(0).optional()
});

export const subcategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  budgetLimit: z.number().min(0).optional()
});

export const accountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  type: z.enum(['cash', 'bank', 'credit', 'investment']),
  balance: z.number(),
  currency: z.string().min(1, 'Currency is required'),
  color: z.string().min(1, 'Color is required'),
  isActive: z.boolean()
});

export const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().optional(),
  limit: z.number().min(0.01, 'Limit must be greater than 0'),
  period: z.enum(['monthly', 'yearly']),
  alertThreshold: z.number().min(0).max(100)
});

export const goalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  targetAmount: z.number().min(0.01, 'Target amount must be greater than 0'),
  currentAmount: z.number().min(0),
  targetDate: z.string().min(1, 'Target date is required'),
  category: z.string().min(1, 'Category is required')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const filterSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  type: z.enum(['income', 'expense', 'all']).optional(),
  categories: z.array(z.string()).optional(),
  accounts: z.array(z.string()).optional(),
  amountMin: z.number().min(0).optional(),
  amountMax: z.number().min(0).optional(),
  search: z.string().optional()
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type SubcategoryFormData = z.infer<typeof subcategorySchema>;
export type AccountFormData = z.infer<typeof accountSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type GoalFormData = z.infer<typeof goalSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type FilterFormData = z.infer<typeof filterSchema>;