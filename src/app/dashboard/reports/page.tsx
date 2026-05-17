'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loan, Payment } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import StatsCard from '@/components/ui/StatsCard';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ReportsPage() {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [loansSnap, paymentsSnap] = await Promise.all([
          getDocs(collection(db, 'loans')),
          getDocs(collection(db, 'payments')),
        ]);
        setLoans(loansSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Loan)));
        setPayments(paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment)));
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalDisbursed = loans.reduce((s, l) => s + (l.principalAmount || 0), 0);
  const totalCollected = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const activeLoans = loans.filter((l) => l.status === 'active');
  const completedLoans = loans.filter((l) => l.status === 'completed');
  const defaultedLoans = loans.filter((l) => l.status === 'defaulted');
  const totalInterestEarned = loans.reduce(
    (s, l) => s + (l.totalPaid || 0) - (l.principalAmount || 0),
    0
  );

  const loanStatusData = [
    { name: 'Active', value: activeLoans.length },
    { name: 'Completed', value: completedLoans.length },
    { name: 'Defaulted', value: defaultedLoans.length },
    { name: 'Pending', value: loans.filter((l) => l.status === 'pending').length },
  ].filter((d) => d.value > 0);

  const repaymentTrend = [
    { name: 'Week 1', collected: 45000, expected: 52000 },
    { name: 'Week 2', collected: 48000, expected: 50000 },
    { name: 'Week 3', collected: 52000, expected: 55000 },
    { name: 'Week 4', collected: 42000, expected: 48000 },
  ];

  const collectorPerformance = [
    { name: 'John K.', collected: 85000, target: 100000 },
    { name: 'Mary W.', collected: 92000, target: 100000 },
    { name: 'Peter O.', collected: 78000, target: 100000 },
    { name: 'Jane M.', collected: 95000, target: 100000 },
    { name: 'David N.', collected: 70000, target: 100000 },
  ];

  const stats = [
    {
      title: 'Total Disbursed',
      value: formatCurrency(totalDisbursed),
      icon: DollarSign,
      color: 'purple' as const,
    },
    {
      title: 'Total Collected',
      value: formatCurrency(totalCollected),
      icon: TrendingUp,
      color: 'emerald' as const,
    },
    {
      title: 'Interest Earned',
      value: formatCurrency(Math.max(totalInterestEarned, 0)),
      icon: TrendingUp,
      color: 'blue' as const,
    },
    {
      title: 'Default Rate',
      value:
        loans.length > 0
          ? `${Math.round((defaultedLoans.length / loans.length) * 100)}%`
          : '0%',
      icon: TrendingDown,
      color: 'red' as const,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 bg-slate-800/50 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Business performance and insights"
        actions={
          <div className="flex items-center gap-3">
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={[
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' },
                { value: 'year', label: 'This Year' },
              ]}
              className="w-36"
            />
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatsCard key={s.title} {...s} index={i} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-slate-800/50 border border-white/5 rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Repayment Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={repaymentTrend}>
              <defs>
                <linearGradient id="rptCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rptExpected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                fill="url(#rptExpected)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="collected"
                stroke="#10b981"
                fill="url(#rptCollected)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 border border-white/5 rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Loan Status Distribution</h3>
          {loanStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={loanStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {loanStatusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
              No loan data yet
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {loanStatusData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-xs text-slate-400">
                  {entry.name} ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Collector Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-800/50 border border-white/5 rounded-2xl p-5"
      >
        <h3 className="text-sm font-semibold text-white mb-4">Collector Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={collectorPerformance} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
            <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={80} />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: 13,
              }}
            />
            <Bar dataKey="target" fill="rgba(99, 102, 241, 0.2)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="collected" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 border border-white/5 rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-white mb-3">Portfolio Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Loans</span>
              <span className="text-white font-medium">{loans.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Active Loans</span>
              <span className="text-white font-medium">{activeLoans.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Completed</span>
              <span className="text-emerald-400 font-medium">{completedLoans.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Defaulted</span>
              <span className="text-red-400 font-medium">{defaultedLoans.length}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-slate-800/50 border border-white/5 rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-white mb-3">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Disbursed</span>
              <span className="text-white font-medium">{formatCurrency(totalDisbursed)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Collected</span>
              <span className="text-emerald-400 font-medium">{formatCurrency(totalCollected)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Outstanding</span>
              <span className="text-amber-400 font-medium">
                {formatCurrency(
                  activeLoans.reduce((s, l) => s + (l.balance || 0), 0)
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Recovery Rate</span>
              <span className="text-white font-medium">
                {totalDisbursed > 0
                  ? `${Math.round((totalCollected / totalDisbursed) * 100)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800/50 border border-white/5 rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-white mb-3">Payment Methods</h3>
          <div className="space-y-3">
            {['cash', 'mobile_money', 'bank_transfer', 'cheque'].map((method) => {
              const count = payments.filter((p) => p.paymentMethod === method).length;
              const total = payments
                .filter((p) => p.paymentMethod === method)
                .reduce((s, p) => s + p.amount, 0);
              return (
                <div key={method} className="flex justify-between text-sm">
                  <span className="text-slate-400 capitalize">{method.replace('_', ' ')}</span>
                  <span className="text-white font-medium">
                    {count} ({formatCurrency(total)})
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
