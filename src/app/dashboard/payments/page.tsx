'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  CreditCard,
  Receipt,
  Download,
} from 'lucide-react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  where,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Payment, Loan, Installment } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import DataTable from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDateTime, generateReceiptNumber } from '@/lib/utils';

export default function PaymentsPage() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    loanId: '',
    installmentId: '',
    amount: '',
    paymentMethod: 'cash',
    reference: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [paymentsSnap, loansSnap] = await Promise.all([
        getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'loans'), where('status', 'in', ['active', 'approved']))),
      ]);
      setPayments(paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment)));
      setLoans(loansSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Loan)));
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchData]);

  const fetchInstallmentsForLoan = async (loanId: string) => {
    try {
      const snap = await getDocs(
        query(
          collection(db, 'installments'),
          where('loanId', '==', loanId),
          orderBy('installmentNumber', 'asc')
        )
      );
      setInstallments(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Installment))
      );
    } catch (error) {
      console.error('Error fetching installments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const loan = loans.find((l) => l.id === form.loanId);
      if (!loan) return;

      const amount = parseFloat(form.amount);
      const receiptNumber = generateReceiptNumber();
      const now = new Date().toISOString();

      const paymentData: Omit<Payment, 'id'> = {
        loanId: form.loanId,
        borrowerId: loan.borrowerId,
        borrowerName: loan.borrowerName,
        installmentId: form.installmentId || undefined,
        amount,
        paymentMethod: form.paymentMethod as Payment['paymentMethod'],
        reference: form.reference || undefined,
        collectedBy: profile?.uid || '',
        collectorName: profile?.displayName || '',
        notes: form.notes || undefined,
        receiptNumber,
        createdAt: now,
      };

      await addDoc(collection(db, 'payments'), paymentData);

      const newTotalPaid = loan.totalPaid + amount;
      const newBalance = loan.totalPayable - newTotalPaid;

      await updateDoc(doc(db, 'loans', form.loanId), {
        totalPaid: increment(amount),
        balance: newBalance,
        status: newBalance <= 0 ? 'completed' : loan.status,
        updatedAt: now,
      });

      if (form.installmentId) {
        const inst = installments.find((i) => i.id === form.installmentId);
        if (inst) {
          const newPaid = inst.paidAmount + amount;
          await updateDoc(doc(db, 'installments', form.installmentId), {
            paidAmount: newPaid,
            status: newPaid >= inst.amount ? 'paid' : 'partial',
            paidDate: now,
            collectedBy: profile?.uid,
          });
        }
      }

      setShowForm(false);
      setForm({
        loanId: '',
        installmentId: '',
        amount: '',
        paymentMethod: 'cash',
        reference: '',
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error recording payment:', error);
    } finally {
      setSaving(false);
    }
  };

  const filtered = payments.filter(
    (p) =>
      p.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'receiptNumber',
      label: 'Receipt',
      render: (p: Payment) => (
        <span className="font-mono text-xs text-indigo-400">{p.receiptNumber}</span>
      ),
    },
    {
      key: 'borrowerName',
      label: 'Borrower',
      render: (p: Payment) => <span className="font-medium text-white">{p.borrowerName}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (p: Payment) => (
        <span className="font-semibold text-emerald-400">{formatCurrency(p.amount)}</span>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (p: Payment) => <Badge status={p.paymentMethod.replace('_', ' ')} />,
    },
    {
      key: 'collectorName',
      label: 'Collected By',
      render: (p: Payment) => <span className="text-slate-400">{p.collectorName}</span>,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (p: Payment) => (
        <span className="text-slate-400 text-xs">{formatDateTime(p.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (p: Payment) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPayment(p);
            setShowReceipt(true);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Receipt className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const selectedLoan = loans.find((l) => l.id === form.loanId);

  return (
    <div>
      <PageHeader
        title="Payments"
        description={`${payments.length} total payments recorded`}
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Record Payment
          </Button>
        }
      />

      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by borrower or receipt..."
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
          icon={CreditCard}
          title="No payments found"
          description={search ? 'Try a different search term' : 'Record your first payment'}
          action={
            !search && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4" />
                Record Payment
              </Button>
            )
          }
        />
      ) : (
        <DataTable columns={columns} data={filtered} keyExtractor={(p) => p.id} />
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Record Payment"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Select Loan"
            value={form.loanId}
            onChange={(e) => {
              setForm({ ...form, loanId: e.target.value, installmentId: '' });
              if (e.target.value) fetchInstallmentsForLoan(e.target.value);
            }}
            options={[
              { value: '', label: 'Choose a loan...' },
              ...loans.map((l) => ({
                value: l.id,
                label: `${l.borrowerName} — Balance: ${formatCurrency(l.balance)}`,
              })),
            ]}
            required
          />

          {installments.length > 0 && (
            <Select
              label="Installment (Optional)"
              value={form.installmentId}
              onChange={(e) => setForm({ ...form, installmentId: e.target.value })}
              options={[
                { value: '', label: 'General payment...' },
                ...installments
                  .filter((i) => i.status !== 'paid')
                  .map((i) => ({
                    value: i.id,
                    label: `#${i.installmentNumber} — Due: ${formatCurrency(i.amount - i.paidAmount)}`,
                  })),
              ]}
            />
          )}

          {selectedLoan && (
            <div className="p-3 rounded-xl bg-slate-700/30 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Outstanding Balance</span>
                <span className="text-amber-400 font-semibold">
                  {formatCurrency(selectedLoan.balance)}
                </span>
              </div>
            </div>
          )}

          <Input
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            min="1"
          />

          <Select
            label="Payment Method"
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'mobile_money', label: 'Mobile Money' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'cheque', label: 'Cheque' },
            ]}
          />

          <Input
            label="Reference (Optional)"
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
            placeholder="Transaction ID or reference number"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        title="Payment Receipt"
        size="sm"
      >
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center py-4 border-b border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(selectedPayment.amount)}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {selectedPayment.receiptNumber}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Borrower</span>
                <span className="text-white">{selectedPayment.borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method</span>
                <span className="text-white capitalize">
                  {selectedPayment.paymentMethod.replace('_', ' ')}
                </span>
              </div>
              {selectedPayment.reference && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference</span>
                  <span className="text-white">{selectedPayment.reference}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Collected By</span>
                <span className="text-white">{selectedPayment.collectorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date</span>
                <span className="text-white">{formatDateTime(selectedPayment.createdAt)}</span>
              </div>
            </div>

            <Button variant="secondary" className="w-full">
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>
          </motion.div>
        )}
      </Modal>
    </div>
  );
}
