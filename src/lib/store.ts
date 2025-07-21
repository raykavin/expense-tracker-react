import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Category, Account, Budget, Goal, User, Alert, FilterOptions } from './types';

interface AppState {
  // User
  user: User | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  
  // Data
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  goals: Goal[];
  alerts: Alert[];
  
  // UI State
  sidebarOpen: boolean;
  currentFilters: FilterOptions;
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuth: boolean) => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByAccount: (accountId: string) => Transaction[];
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  getFilteredTransactions: (filters: FilterOptions) => Transaction[];
  
  // Category actions
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Account actions
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  // Budget actions
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Alert actions
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;
  markAlertAsRead: (id: string) => void;
  clearAlerts: () => void;
  
  // Filter actions
  setFilters: (filters: FilterOptions) => void;
  clearFilters: () => void;
  
  // Utility functions
  getTotalBalance: () => number;
  getTotalIncome: (period?: string) => number;
  getTotalExpenses: (period?: string) => number;
  getCategorySpending: (categoryId: string, period?: string) => number;
  getAccountBalance: (accountId: string) => number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      theme: 'light',
      transactions: [],
      categories: [
        {
          id: '1',
          name: 'Food & Dining',
          color: '#FF6B6B',
          icon: '🍽️',
          type: 'expense',
          subcategories: [
            { id: '1-1', name: 'Restaurants' },
            { id: '1-2', name: 'Groceries' },
            { id: '1-3', name: 'Fast Food' }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Transportation',
          color: '#4ECDC4',
          icon: '🚗',
          type: 'expense',
          subcategories: [
            { id: '2-1', name: 'Gas' },
            { id: '2-2', name: 'Public Transport' },
            { id: '2-3', name: 'Maintenance' }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Salary',
          color: '#45B7D1',
          icon: '💰',
          type: 'income',
          subcategories: [
            { id: '3-1', name: 'Monthly Salary' },
            { id: '3-2', name: 'Bonus' },
            { id: '3-3', name: 'Overtime' }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      accounts: [
        {
          id: '1',
          name: 'Main Checking',
          type: 'bank',
          balance: 5000,
          currency: 'USD',
          color: '#45B7D1',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Cash Wallet',
          type: 'cash',
          balance: 250,
          currency: 'USD',
          color: '#96CEB4',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      budgets: [],
      goals: [],
      alerts: [],
      sidebarOpen: true,
      currentFilters: {},
      
      // Actions
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      // Transaction actions
      addTransaction: (transactionData) => {
        const transaction: Transaction = {
          ...transactionData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set((state) => {
          // Update account balance
          const updatedAccounts = state.accounts.map(account => {
            if (account.id === transaction.account) {
              const balanceChange = transaction.type === 'income' 
                ? transaction.amount 
                : -transaction.amount;
              return { 
                ...account, 
                balance: account.balance + balanceChange,
                updatedAt: new Date().toISOString()
              };
            }
            return account;
          });
          
          return {
            transactions: [...state.transactions, transaction],
            accounts: updatedAccounts
          };
        });
      },
      
      updateTransaction: (id, updates) => set((state) => ({
        transactions: state.transactions.map(t => 
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        )
      })),
      
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),
      
      getTransactionsByAccount: (accountId) => {
        return get().transactions.filter(t => t.account === accountId);
      },
      
      getTransactionsByCategory: (categoryId) => {
        return get().transactions.filter(t => t.category === categoryId);
      },
      
      getFilteredTransactions: (filters) => {
        const { transactions } = get();
        return transactions.filter(transaction => {
          if (filters.dateFrom && transaction.date < filters.dateFrom) return false;
          if (filters.dateTo && transaction.date > filters.dateTo) return false;
          if (filters.type && filters.type !== 'all' && transaction.type !== filters.type) return false;
          if (filters.categories?.length && !filters.categories.includes(transaction.category)) return false;
          if (filters.accounts?.length && !filters.accounts.includes(transaction.account)) return false;
          if (filters.amountMin && transaction.amount < filters.amountMin) return false;
          if (filters.amountMax && transaction.amount > filters.amountMax) return false;
          if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
          return true;
        });
      },
      
      // Category actions
      addCategory: (categoryData) => {
        const category: Category = {
          ...categoryData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => ({ categories: [...state.categories, category] }));
      },
      
      updateCategory: (id, updates) => set((state) => ({
        categories: state.categories.map(c => 
          c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
        )
      })),
      
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
      })),
      
      // Account actions
      addAccount: (accountData) => {
        const account: Account = {
          ...accountData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => ({ accounts: [...state.accounts, account] }));
      },
      
      updateAccount: (id, updates) => set((state) => ({
        accounts: state.accounts.map(a => 
          a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
        )
      })),
      
      deleteAccount: (id) => set((state) => ({
        accounts: state.accounts.filter(a => a.id !== id)
      })),
      
      // Budget actions
      addBudget: (budgetData) => {
        const budget: Budget = {
          ...budgetData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => ({ budgets: [...state.budgets, budget] }));
      },
      
      updateBudget: (id, updates) => set((state) => ({
        budgets: state.budgets.map(b => 
          b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
        )
      })),
      
      deleteBudget: (id) => set((state) => ({
        budgets: state.budgets.filter(b => b.id !== id)
      })),
      
      // Goal actions
      addGoal: (goalData) => {
        const goal: Goal = {
          ...goalData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => ({ goals: [...state.goals, goal] }));
      },
      
      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map(g => 
          g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
        )
      })),
      
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
      })),
      
      // Alert actions
      addAlert: (alertData) => {
        const alert: Alert = {
          ...alertData,
          id: generateId(),
          createdAt: new Date().toISOString()
        };
        set((state) => ({ alerts: [...state.alerts, alert] }));
      },
      
      markAlertAsRead: (id) => set((state) => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, isRead: true } : a)
      })),
      
      clearAlerts: () => set({ alerts: [] }),
      
      // Filter actions
      setFilters: (filters) => set({ currentFilters: filters }),
      clearFilters: () => set({ currentFilters: {} }),
      
      // Utility functions
      getTotalBalance: () => {
        const { accounts } = get();
        return accounts.filter(a => a.isActive).reduce((total, account) => total + account.balance, 0);
      },
      
      getTotalIncome: (period) => {
        const { transactions } = get();
        const now = new Date();
        const periodStart = period === 'month' 
          ? new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
          : period === 'year'
          ? new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
          : '';
        
        return transactions
          .filter(t => t.type === 'income' && (!period || t.date >= periodStart))
          .reduce((total, t) => total + t.amount, 0);
      },
      
      getTotalExpenses: (period) => {
        const { transactions } = get();
        const now = new Date();
        const periodStart = period === 'month' 
          ? new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
          : period === 'year'
          ? new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
          : '';
        
        return transactions
          .filter(t => t.type === 'expense' && (!period || t.date >= periodStart))
          .reduce((total, t) => total + t.amount, 0);
      },
      
      getCategorySpending: (categoryId, period) => {
        const { transactions } = get();
        const now = new Date();
        const periodStart = period === 'month' 
          ? new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
          : '';
        
        return transactions
          .filter(t => t.category === categoryId && (!period || t.date >= periodStart))
          .reduce((total, t) => total + (t.type === 'expense' ? t.amount : 0), 0);
      },
      
      getAccountBalance: (accountId) => {
        const { accounts } = get();
        const account = accounts.find(a => a.id === accountId);
        return account?.balance || 0;
      }
    }),
    {
      name: 'expense-tracker-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        transactions: state.transactions,
        categories: state.categories,
        accounts: state.accounts,
        budgets: state.budgets,
        goals: state.goals
      })
    }
  )
);