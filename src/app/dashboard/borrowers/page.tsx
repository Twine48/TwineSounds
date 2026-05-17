'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Users,
  Phone,
  MapPin,
  Edit,
  Eye,
  Trash2,
} from 'lucide-react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Borrower } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import { getInitials } from '@/lib/utils';

export default function BorrowersPage() {
  const { profile } = useAuth();
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    altPhone: '',
    nationalId: '',
    address: '',
    city: '',
    guarantorName: '',
    guarantorPhone: '',
    guarantorRelation: '',
    employerName: '',
    employerAddress: '',
    monthlyIncome: '',
    notes: '',
    status: 'active',
  });

  const resetForm = () => {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      altPhone: '',
      nationalId: '',
      address: '',
      city: '',
      guarantorName: '',
      guarantorPhone: '',
      guarantorRelation: '',
      employerName: '',
      employerAddress: '',
      monthlyIncome: '',
      notes: '',
      status: 'active',
    });
    setEditMode(false);
    setSelectedBorrower(null);
  };

  const fetchBorrowers = useCallback(async () => {
    try {
      const snap = await getDocs(
        query(collection(db, 'borrowers'), orderBy('createdAt', 'desc'))
      );
      setBorrowers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Borrower)));
    } catch (error) {
      console.error('Error fetching borrowers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBorrowers(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchBorrowers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const data = {
      ...form,
      monthlyIncome: form.monthlyIncome ? parseFloat(form.monthlyIncome) : 0,
      totalLoans: 0,
      activeLoans: 0,
      createdBy: profile?.uid || '',
      updatedAt: now,
    };

    try {
      if (editMode && selectedBorrower) {
        await updateDoc(doc(db, 'borrowers', selectedBorrower.id), data);
      } else {
        await addDoc(collection(db, 'borrowers'), { ...data, createdAt: now });
      }
      setShowForm(false);
      resetForm();
      fetchBorrowers();
    } catch (error) {
      console.error('Error saving borrower:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this borrower?')) return;
    try {
      await deleteDoc(doc(db, 'borrowers', id));
      fetchBorrowers();
    } catch (error) {
      console.error('Error deleting borrower:', error);
    }
  };

  const handleEdit = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setForm({
      firstName: borrower.firstName,
      lastName: borrower.lastName,
      email: borrower.email || '',
      phone: borrower.phone,
      altPhone: borrower.altPhone || '',
      nationalId: borrower.nationalId,
      address: borrower.address,
      city: borrower.city || '',
      guarantorName: borrower.guarantorName || '',
      guarantorPhone: borrower.guarantorPhone || '',
      guarantorRelation: borrower.guarantorRelation || '',
      employerName: borrower.employerName || '',
      employerAddress: borrower.employerAddress || '',
      monthlyIncome: borrower.monthlyIncome?.toString() || '',
      notes: borrower.notes || '',
      status: borrower.status,
    });
    setEditMode(true);
    setShowForm(true);
  };

  const filtered = borrowers.filter(
    (b) =>
      `${b.firstName} ${b.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search) ||
      b.nationalId.includes(search)
  );

  return (
    <div>
      <PageHeader
        title="Borrowers"
        description={`${borrowers.length} total borrowers`}
        actions={
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Borrower
          </Button>
        }
      />

      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, phone, or ID..."
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No borrowers found"
          description={search ? 'Try a different search term' : 'Add your first borrower to get started'}
          action={
            !search && (
              <Button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Add Borrower
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((borrower, i) => (
            <motion.div
              key={borrower.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-slate-800/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {getInitials(`${borrower.firstName} ${borrower.lastName}`)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {borrower.firstName} {borrower.lastName}
                    </p>
                    <p className="text-xs text-slate-400">ID: {borrower.nationalId}</p>
                  </div>
                </div>
                <Badge status={borrower.status} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{borrower.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{borrower.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedBorrower(borrower);
                    setShowDetail(true);
                  }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(borrower)}>
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(borrower.id)}
                  className="text-red-400 hover:text-red-300 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          resetForm();
        }}
        title={editMode ? 'Edit Borrower' : 'New Borrower'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <Input
              label="Alt Phone"
              type="tel"
              value={form.altPhone}
              onChange={(e) => setForm({ ...form, altPhone: e.target.value })}
            />
            <Input
              label="National ID"
              value={form.nationalId}
              onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>

          <div className="border-t border-white/5 pt-4 mt-4">
            <p className="text-sm font-medium text-slate-300 mb-3">Guarantor Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Guarantor Name"
                value={form.guarantorName}
                onChange={(e) => setForm({ ...form, guarantorName: e.target.value })}
              />
              <Input
                label="Guarantor Phone"
                type="tel"
                value={form.guarantorPhone}
                onChange={(e) => setForm({ ...form, guarantorPhone: e.target.value })}
              />
              <Input
                label="Relationship"
                value={form.guarantorRelation}
                onChange={(e) => setForm({ ...form, guarantorRelation: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-4">
            <p className="text-sm font-medium text-slate-300 mb-3">Employment Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Employer Name"
                value={form.employerName}
                onChange={(e) => setForm({ ...form, employerName: e.target.value })}
              />
              <Input
                label="Employer Address"
                value={form.employerAddress}
                onChange={(e) => setForm({ ...form, employerAddress: e.target.value })}
              />
              <Input
                label="Monthly Income"
                type="number"
                value={form.monthlyIncome}
                onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'blacklisted', label: 'Blacklisted' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{editMode ? 'Update' : 'Add'} Borrower</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title="Borrower Details"
        size="lg"
      >
        {selectedBorrower && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                {getInitials(
                  `${selectedBorrower.firstName} ${selectedBorrower.lastName}`
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedBorrower.firstName} {selectedBorrower.lastName}
                </h3>
                <p className="text-sm text-slate-400">ID: {selectedBorrower.nationalId}</p>
              </div>
              <Badge status={selectedBorrower.status} className="ml-auto" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Phone</p>
                <p className="text-white">{selectedBorrower.phone}</p>
              </div>
              {selectedBorrower.email && (
                <div>
                  <p className="text-slate-400">Email</p>
                  <p className="text-white">{selectedBorrower.email}</p>
                </div>
              )}
              <div>
                <p className="text-slate-400">Address</p>
                <p className="text-white">{selectedBorrower.address}</p>
              </div>
              {selectedBorrower.city && (
                <div>
                  <p className="text-slate-400">City</p>
                  <p className="text-white">{selectedBorrower.city}</p>
                </div>
              )}
              {selectedBorrower.guarantorName && (
                <div>
                  <p className="text-slate-400">Guarantor</p>
                  <p className="text-white">{selectedBorrower.guarantorName}</p>
                </div>
              )}
              {selectedBorrower.employerName && (
                <div>
                  <p className="text-slate-400">Employer</p>
                  <p className="text-white">{selectedBorrower.employerName}</p>
                </div>
              )}
              {selectedBorrower.monthlyIncome && (
                <div>
                  <p className="text-slate-400">Monthly Income</p>
                  <p className="text-white">
                    ${selectedBorrower.monthlyIncome.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
