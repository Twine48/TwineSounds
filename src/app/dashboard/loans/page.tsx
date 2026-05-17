'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Landmark,
  Calendar,
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Loan, Borrower, Installment } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import DataTable from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, calculateLoan } from '@/lib/utils';
import { addDays, addWeeks, addMonths } from 'date-fns';

export default function LoansPage() {
  const { profile } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    borrowerId: '',
    principalAmount: '',
    interestRate: '',
    interestType: 'flat',
    repaymentFrequency: 'monthly',
    numberOfInstallments: '',
    disbursementDate: new Date().toISOString().split('T')[0],
    penaltyRate: '0',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [loansSnap, borrowersSnap] = await Promise.all([
        getDocs(query(collection(db, 'loans'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'borrowers')),
      ]);
      setLoans(loansSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Loan)));
      setBorrowers(borrowersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Borrower)));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchData]);

  const generateSchedule = (
    loanId: string,
    borrowerId: string,
    startDate: Date,
    installmentAmount: number,
    numInstallments: number,
    frequency: string
  ): Omit<Installment, 'id'>[] => {
    const schedule: Omit<Installment, 'id'>[] = [];
    let currentDate = startDate;

    for (let i = 1; i <= numInstallments; i++) {
      switch (frequency) {
        case 'daily':
          currentDate = i === 1 ? currentDate : addDays(currentDate, 1);
          break;
        case 'weekly':
          currentDate = i === 1 ? currentDate : addWeeks(currentDate, 1);
          break;
        case 'biweekly':
          currentDate = i === 1 ? currentDate : addWeeks(currentDate, 2);
          break;
        case 'monthly':
        default:
          currentDate = i === 1 ? currentDate : addMonths(currentDate, 1);
          break;
      }

      schedule.push({
        loanId,
        borrowerId,
        installmentNumber: i,
        dueDate: currentDate.toISOString(),
        amount: installmentAmount,
        paidAmount: 0,
        penalty: 0,
        status: 'pending',
      });
    }
    return schedule;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const borrower = borrowers.find((b) => b.id === form.borrowerId);
      if (!borrower) return;

      const principal = parseFloat(form.principalAmount);
      const rate = parseFloat(form.interestRate);
      const numInstallments = parseInt(form.numberOfInstallments);
      const interestType = form.interestType as 'flat' | 'reducing';

      const calc = calculateLoan(principal, rate, interestType, numInstallments);
      const startDate = new Date(form.disbursementDate);

      let endDate: Date;
      switch (form.repaymentFrequency) {
        case 'daily':
          endDate = addDays(startDate, numInstallments);
          break;
        case 'weekly':
          endDate = addWeeks(startDate, numInstallments);
          break;
        case 'biweekly':
          endDate = addWeeks(startDate, numInstallments * 2);
          break;
        default:
          endDate = addMonths(startDate, numInstallments);
      }

      const now = new Date().toISOString();
      const loanData: Omit<Loan, 'id'> = {
        borrowerId: form.borrowerId,
        borrowerName: `${borrower.firstName} ${borrower.lastName}`,
        principalAmount: principal,
        interestRate: rate,
        interestType,
        totalPayable: calc.totalPayable,
        totalPaid: 0,
        balance: calc.totalPayable,
        repaymentFrequency: form.repaymentFrequency as Loan['repaymentFrequency'],
        numberOfInstallments: numInstallments,
        installmentAmount: calc.installmentAmount,
        disbursementDate: form.disbursementDate,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'pending',
        penaltyRate: parseFloat(form.penaltyRate),
        totalPenalty: 0,
        collateralIds: [],
        loanOfficerId: profile?.uid || '',
        loanOfficerName: profile?.displayName || '',
        notes: form.notes,
        createdAt: now,
        updatedAt: now,
      };

      const loanRef = await addDoc(collection(db, 'loans'), loanData);

      const schedule = generateSchedule(
        loanRef.id,
        form.borrowerId,
        startDate,
        calc.installmentAmount,
        numInstallments,
        form.repaymentFrequency
      );

      for (const installment of schedule) {
        await addDoc(collection(db, 'installments'), installment);
      }

      setShowForm(false);
      setForm({
        borrowerId: '',
        principalAmount: '',
        interestRate: '',
        interestType: 'flat',
        repaymentFrequency: 'monthly',
        numberOfInstallments: '',
        disbursementDate: new Date().toISOString().split('T')[0],
        penaltyRate: '0',
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating loan:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (loanId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'loans', loanId), {
        status,
        updatedAt: new Date().toISOString(),
      });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const preview = (() => {
    const p = parseFloat(form.principalAmount);
    const r = parseFloat(form.interestRate);
    const n = parseInt(form.numberOfInstallments);
    if (!p || !r || !n) return null;
    return calculateLoan(p, r, form.interestType as 'flat' | 'reducing', n);
  })();

  const filtered = loans.filter((l) => {
    const matchSearch =
      l.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
      l.id.includes(search);
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      key: 'borrowerName',
      label: 'Borrower',
      render: (loan: Loan) => (
        <span className="font-medium text-white">{loan.borrowerName}</span>
      ),
    },
    {
      key: 'principalAmount',
      label: 'Principal',
      render: (loan: Loan) => (
        <span className="text-slate-300">{formatCurrency(loan.principalAmount)}</span>
      ),
    },
    {
      key: 'totalPayable',
      label: 'Total Payable',
      render: (loan: Loan) => (
        <span className="text-slate-300">{formatCurrency(loan.totalPayable)}</span>
      ),
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (loan: Loan) => (
        <span className="font-medium text-amber-400">{formatCurrency(loan.balance)}</span>
      ),
    },
    {
      key: 'frequency',
      label: 'Frequency',
      render: (loan: Loan) => (
        <span className="text-slate-400 capitalize">{loan.repaymentFrequency}</span>
      ),
    },
    {
      key: 'endDate',
      label: 'Due Date',
      render: (loan: Loan) => (
        <span className="text-slate-400">{formatDate(loan.endDate)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (loan: Loan) => <Badge status={loan.status} />,
    },
    {
      key: 'actions',
      label: '',
      render: (loan: Loan) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLoan(loan);
              setShowDetail(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {loan.status === 'pending' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(loan.id, 'approved');
                }}
                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(loan.id, 'rejected');
                }}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {loan.status === 'approved' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(loan.id, 'active');
              }}
              className="px-2 py-1 rounded-lg text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
            >
              Disburse
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Loans"
        description={`${loans.length} total loans`}
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            New Loan
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by borrower or loan ID..."
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'defaulted', label: 'Defaulted' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          className="w-40"
        />
      </div>

      {loading ? (
        <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No loans found"
          description={search ? 'Try different search criteria' : 'Create your first loan to get started'}
          action={
            !search && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4" />
                New Loan
              </Button>
            )
          }
        />
      ) : (
        <DataTable columns={columns} data={filtered} keyExtractor={(l) => l.id} />
      )}

      {/* Create Loan Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Create New Loan"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Borrower"
            value={form.borrowerId}
            onChange={(e) => setForm({ ...form, borrowerId: e.target.value })}
            options={[
              { value: '', label: 'Select a borrower...' },
              ...borrowers.map((b) => ({
                value: b.id,
                label: `${b.firstName} ${b.lastName} (${b.nationalId})`,
              })),
            ]}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Principal Amount"
              type="number"
              value={form.principalAmount}
              onChange={(e) => setForm({ ...form, principalAmount: e.target.value })}
              required
              min="1"
            />
            <Input
              label="Interest Rate (%)"
              type="number"
              value={form.interestRate}
              onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
              required
              min="0"
              step="0.1"
            />
            <Select
              label="Interest Type"
              value={form.interestType}
              onChange={(e) => setForm({ ...form, interestType: e.target.value })}
              options={[
                { value: 'flat', label: 'Flat Rate' },
                { value: 'reducing', label: 'Reducing Balance' },
              ]}
            />
            <Select
              label="Repayment Frequency"
              value={form.repaymentFrequency}
              onChange={(e) => setForm({ ...form, repaymentFrequency: e.target.value })}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'biweekly', label: 'Bi-Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />
            <Input
              label="Number of Installments"
              type="number"
              value={form.numberOfInstallments}
              onChange={(e) => setForm({ ...form, numberOfInstallments: e.target.value })}
              required
              min="1"
            />
            <Input
              label="Disbursement Date"
              type="date"
              value={form.disbursementDate}
              onChange={(e) => setForm({ ...form, disbursementDate: e.target.value })}
              required
            />
            <Input
              label="Penalty Rate (%)"
              type="number"
              value={form.penaltyRate}
              onChange={(e) => setForm({ ...form, penaltyRate: e.target.value })}
              min="0"
              step="0.1"
            />
          </div>

          {preview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10"
            >
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">
                Loan Preview
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Total Interest</p>
                  <p className="text-white font-semibold">
                    {formatCurrency(preview.totalInterest)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Total Payable</p>
                  <p className="text-white font-semibold">
                    {formatCurrency(preview.totalPayable)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Installment</p>
                  <p className="text-white font-semibold">
                    {formatCurrency(preview.installmentAmount)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create Loan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Loan Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title="Loan Details"
        size="lg"
      >
        {selectedLoan && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedLoan.borrowerName}
                </h3>
                <p className="text-sm text-slate-400">
                  Loan Officer: {selectedLoan.loanOfficerName}
                </p>
              </div>
              <Badge status={selectedLoan.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-slate-700/30">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Principal</span>
                </div>
                <p className="text-white font-semibold">
                  {formatCurrency(selectedLoan.principalAmount)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-700/30">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Total Payable</span>
                </div>
                <p className="text-white font-semibold">
                  {formatCurrency(selectedLoan.totalPayable)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-700/30">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Balance</span>
                </div>
                <p className="text-amber-400 font-semibold">
                  {formatCurrency(selectedLoan.balance)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-700/30">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Start Date</span>
                </div>
                <p className="text-white">{formatDate(selectedLoan.startDate)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-700/30">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>End Date</span>
                </div>
                <p className="text-white">{formatDate(selectedLoan.endDate)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-700/30">
                <p className="text-slate-400 text-xs mb-1">Interest</p>
                <p className="text-white">
                  {selectedLoan.interestRate}% ({selectedLoan.interestType})
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-700/30">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Repayment Progress</span>
                <span className="text-white font-medium">
                  {Math.round(
                    (selectedLoan.totalPaid / selectedLoan.totalPayable) * 100
                  )}
                  %
                </span>
              </div>
              <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      (selectedLoan.totalPaid / selectedLoan.totalPayable) * 100,
                      100
                    )}%`,
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Paid: {formatCurrency(selectedLoan.totalPaid)}</span>
                <span>Total: {formatCurrency(selectedLoan.totalPayable)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
