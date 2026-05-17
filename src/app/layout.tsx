import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import PWARegister from '@/components/PWARegister';
import FirebaseStatus from '@/components/FirebaseStatus';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'LoanPro - Loan Management System',
  description: 'Modern loan management system for money lending businesses. Manage borrowers, loans, collections, collateral, and staff with real-time reporting.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LoanPro',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0f1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.svg" />
      </head>
      <body className="h-full antialiased">
        <AuthProvider>
          <FirebaseStatus />
          {children}
          <PWARegister />
        </AuthProvider>
      </body>
    </html>
  );
}
