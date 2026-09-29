'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/lib/types';
import { formatCurrency as formatCurrencyUtil } from '@/lib/currencies';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (token: string, userData: UserProfile) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  formatMoney: (amount: number | null | undefined, includeSymbol?: boolean) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = (token: string, userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem('pennytrack_user', JSON.stringify(userData));
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      localStorage.removeItem('pennytrack_user');
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const formatMoney = (amount: number | null | undefined, includeSymbol: boolean = true) => {
    return formatCurrencyUtil(amount, user?.currency || 'PHP', includeSymbol);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, formatMoney }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
