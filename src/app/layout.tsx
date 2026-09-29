import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'PennyTrack — Personal Expense Tracker & Budget Management System',
  description:
    'A personal finance web application to track income, record expenses, manage budgets, and visualize spending habits through interactive analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
