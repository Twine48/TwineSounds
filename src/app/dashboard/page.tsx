'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Landmark,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Shield,
  UserCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import StatsCard from '@/components/ui/StatsCard';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loan, Payment, DashboardStats } from '@/types';

const collectionChartData = [
  { name: 'Mon', expected: 45000, collected: 42000 },
  { name: 'Tue', expected: 38000, collected: 35000 },
  { name: 'Wed', expected: 52000, collected: 48000 },
  { name: 'Thu', expected: 41000, collected: 39000 },
  { name: 'Fri', expected: 47000, collected: 44000 },
  { name: 'Sat', expected: 33000, collected: 31000 },
  { name: 'Sun', expected: 28000, collected: 25000 },
];

const monthlyData = [
  { name: 'Jan', disbursed: 120000, collected: 95000 },
  { name: 'Feb', disbursed: 150000, collected: 110000 },
  { name: 'Mar', disbursed: 180000, collected: 140000 },
  { name: 'Apr', disbursed: 160000, collected: 130000 },
  { name: 'May', disbursed: 200000, collected: 170000 },
  { name: 'Jun', disbursed: 190000, collected: 165000 },
];

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBorrowers: 0,
    activeLoans: 0,
    totalDisbursed: 0,
    totalCollected: 0,
    overdueLoans: 0,
    overdueAmount: 0,
    todayCollections: 0,
    expectedToday: 0,
    collateralHeld: 0,
    activeStaff: 0,
  });
  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const empty = { docs: [] as never[], size: 0 };
        const [borrowersSnap, loansSnap, paymentsSnap, collateralSnap, staffSnap] =
          await Promise.all([
            getDocs(collection(db, 'borrowers')).catch(() => empty),
            getDocs(collection(db, 'loans')).catch(() => empty),
            getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc'), limit(5))).catch(() => empty),
            getDocs(query(collection(db, 'collateral'), where('status', '==', 'held'))).catch(() => empty),
            getDocs(query(collection(db, 'users'), where('isActive', '==', true))).catch(() => empty),
          ]);

        const loans = loansSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Loan));
        const activeLoans = loans.filter((l) => l.status === 'active');
        const overdueLoans = loans.filter((l) => l.status === 'active' && new Date(l.endDate) < new Date());
        const totalDisbursed = loans.reduce((sum, l) => sum + (l.principalAmount || 0), 0);
        const totalCollected = loans.reduce((sum, l) => sum + (l.totalPaid || 0), 0);

        setStats({
          totalBorrowers: borrowersSnap.size,
          activeLoans: activeLoans.length,
          totalDisbursed,
          totalCollected,
          overdueLoans: overdueLoans.length,
          overdueAmount: overdueLoans.reduce((sum, l) => sum + (l.balance || 0), 0),
          todayCollections: 0,
          expectedToday: 0,
          collateralHeld: collateralSnap.size,
          activeStaff: staffSnap.size,
        });

        setRecentLoans(loans.slice(0, 5));
        setRecentPayments(
          paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment))
        );
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Borrowers',
      value: stats.totalBorrowers.toLocaleString(),
      icon: Users,
      color: 'indigo' as const,
      change: '+12% this month',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Loans',
      value: stats.activeLoans.toLocaleString(),
      icon: Landmark,
      color: 'blue' as const,
      change: `${stats.overdueLoans} overdue`,
      changeType: stats.overdueLoans > 0 ? ('negative' as const) : ('neutral' as const),
    },
    {
      title: 'Total Disbursed',
      value: formatCurrency(stats.totalDisbursed),
      icon: DollarSign,
      color: 'purple' as const,
    },
    {
      title: 'Total Collected',
      value: formatCurrency(stats.totalCollected),
      icon: CreditCard,
      color: 'emerald' as const,
      change: '+8% this week',
      changeType: 'positive' as const,
    },
    {
      title: 'Overdue Amount',
      value: formatCurrency(stats.overdueAmount),
      icon: AlertTriangle,
      color: 'red' as const,
      change: `${stats.overdueLoans} loans`,
      changeType: stats.overdueLoans > 0 ? ('negative' as const) : ('neutral' as const),
    },
    {
      title: 'Collateral Held',
      value: stats.collateralHeld.toLocaleString(),
      icon: Shield,
      color: 'amber' as const,
    },
    {
      title: 'Active Staff',
      value: stats.activeStaff.toLocaleString(),
      icon: UserCheck,
      color: 'blue' as const,
    },
    {
      title: 'Recovery Rate',
      value:
        stats.totalDisbursed > 0
          ? `${Math.round((stats.totalCollected / stats.totalDisbursed) * 100)}%`
          : '0%',
      icon: TrendingUp,
      color: 'emerald' as const,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 bg-slate-800/50 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${profile?.displayName?.split(' ')[0] || 'User'}`}
        description="Here's what's happening with your lending business today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatsCard key={card.title} {...card} index={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 border border-white/5 rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Weekly Collections</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={collectionChartData}>
              <defs>
                <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: 13,
                }}
              />
              <Area
                type="monotone"
                dataKey="expected"
                stroke="#6366f1"
                fill="url(#colorExpected)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="collected"
                stroke="#10b981"
                fill="url(#colorCollected)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 border border-white/5 rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Monthly Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: 13,
                }}
              />
              <Bar dataKey="disbursed" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collected" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Loans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 border border-white/5 rounded-2xl"
        >
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Recent Loans</h3>
          </div>
          <div className="divide-y divide-white/5">
            {recentLoans.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No loans yet</div>
            ) : (
              recentLoans.map((loan) => (
                <div key={loan.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{loan.borrowerName}</p>
                    <p className="text-xs text-slate-400">
                      {formatCurrency(loan.principalAmount)} &middot;{' '}
                      {formatDate(loan.createdAt)}
                    </p>
                  </div>
                  <Badge status={loan.status} />
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800/50 border border-white/5 rounded-2xl"
        >
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Recent Payments</h3>
          </div>
          <div className="divide-y divide-white/5">
            {recentPayments.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No payments yet</div>
            ) : (
              recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="px-5 py-3.5 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{payment.borrowerName}</p>
                    <p className="text-xs text-slate-400">
                      {payment.receiptNumber} &middot; {payment.paymentMethod.replace('_', ' ')}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">
                    +{formatCurrency(payment.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
