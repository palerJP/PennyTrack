export type TransactionType = 'INCOME' | 'EXPENSE';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: string;
  avatar?: string | null;
  theme: 'light' | 'dark' | 'system';
  emailAlerts: boolean;
  budgetAlerts: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault?: boolean;
  userId?: string | null;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  category: Category;
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
  notes?: string | null;
  tags?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  category?: Category | null;
  amountLimit: number;
  month: string; // "YYYY-MM"
  spent?: number;
  remaining?: number;
  percentage?: number;
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  categoryId: string;
  category: Category;
  amount: number;
  type: TransactionType;
  frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  nextDate: string;
  description: string;
  isActive: boolean;
  lastProcessed?: string | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'BUDGET_ALERT' | 'RECURRING_DUE' | 'INSIGHT' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  totalBudgetLimit: number;
  totalBudgetSpent: number;
  budgetPercentage: number;
  recentTransactions: Transaction[];
  upcomingRecurring: RecurringTransaction[];
  monthlyComparison: {
    month: string;
    income: number;
    expense: number;
    savings: number;
  }[];
  categoryBreakdown: {
    name: string;
    amount: number;
    color: string;
    percentage: number;
    count: number;
  }[];
  insights: string[];
}
