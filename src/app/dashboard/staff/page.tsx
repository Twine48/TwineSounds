'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  UserCog,
  Mail,
  Phone,
  Shield,
  ToggleLeft,
  ToggleRight,
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
import { UserProfile, UserRole } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import { getInitials, formatDate } from '@/lib/utils';

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  manager: 'Manager',
  cashier: 'Cashier',
  loan_officer: 'Loan Officer',
  field_collector: 'Field Collector',
};

const roleColors: Record<UserRole, string> = {
  admin: 'from-red-500 to-rose-600',
  manager: 'from-purple-500 to-violet-600',
  cashier: 'from-blue-500 to-cyan-600',
  loan_officer: 'from-indigo-500 to-blue-600',
  field_collector: 'from-emerald-500 to-green-600',
};

export default function StaffPage() {
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    role: 'loan_officer' as UserRole,
  });

  const fetchStaff = useCallback(async () => {
    try {
      const snap = await getDocs(
        query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      );
      setStaff(snap.docs.map((d) => ({ ...d.data(), uid: d.id } as UserProfile)));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchStaff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    try {
      await addDoc(collection(db, 'users'), {
        ...form,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      setShowForm(false);
      setForm({ displayName: '', email: '', phone: '', role: 'loan_officer' });
      fetchStaff();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleActive = async (uid: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        isActive: !isActive,
        updatedAt: new Date().toISOString(),
      });
      fetchStaff();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filtered = staff.filter(
    (s) =>
      s.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.role?.includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Staff Management"
        description={`${staff.length} team members`}
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Add Staff
          </Button>
        }
      />

      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or role..."
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
          icon={UserCog}
          title="No staff found"
          description={search ? 'Try a different search' : 'Add your first team member'}
          action={
            !search && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4" />
                Add Staff
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member, i) => (
            <motion.div
              key={member.uid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-slate-800/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
                      roleColors[member.role] || 'from-slate-500 to-slate-600'
                    } flex items-center justify-center text-white text-sm font-bold`}
                  >
                    {getInitials(member.displayName || 'U')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{member.displayName}</p>
                    <p className="text-xs text-slate-400">
                      {roleLabels[member.role] || member.role}
                    </p>
                  </div>
                </div>
                <Badge status={member.isActive ? 'active' : 'inactive'} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{member.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Joined {formatDate(member.createdAt)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5">
                <button
                  onClick={() => toggleActive(member.uid, member.isActive)}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {member.isActive ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-emerald-400" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-slate-500" />
                      <span>Disabled</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add Staff Member"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            options={Object.entries(roleLabels).map(([v, l]) => ({
              value: v,
              label: l,
            }))}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Staff</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
