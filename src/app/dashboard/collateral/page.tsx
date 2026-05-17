'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Shield,
  Image as ImageIcon,
  Edit,
  Eye,
  Trash2,
  MapPin,
  Tag,
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
import { Collateral, Borrower, CollateralType } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';

const collateralTypeLabels: Record<CollateralType, string> = {
  land_title: 'Land Title',
  motorcycle: 'Motorcycle',
  phone: 'Phone',
  electronics: 'Electronics',
  vehicle: 'Vehicle',
  jewelry: 'Jewelry',
  other: 'Other',
};

export default function CollateralPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Collateral[]>([]);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Collateral | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    borrowerId: '',
    type: 'phone' as CollateralType,
    description: '',
    serialNumber: '',
    estimatedValue: '',
    storageLocation: '',
    notes: '',
    status: 'held',
  });

  const resetForm = () => {
    setForm({
      borrowerId: '',
      type: 'phone',
      description: '',
      serialNumber: '',
      estimatedValue: '',
      storageLocation: '',
      notes: '',
      status: 'held',
    });
    setEditMode(false);
    setSelectedItem(null);
  };

  const fetchData = useCallback(async () => {
    try {
      const [itemsSnap, borrowersSnap] = await Promise.all([
        getDocs(query(collection(db, 'collateral'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'borrowers')),
      ]);
      setItems(itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Collateral)));
      setBorrowers(borrowersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Borrower)));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const borrower = borrowers.find((b) => b.id === form.borrowerId);
    const now = new Date().toISOString();
    const data = {
      borrowerId: form.borrowerId,
      borrowerName: borrower ? `${borrower.firstName} ${borrower.lastName}` : '',
      type: form.type,
      description: form.description,
      serialNumber: form.serialNumber || undefined,
      estimatedValue: parseFloat(form.estimatedValue) || 0,
      photos: [],
      storageLocation: form.storageLocation || undefined,
      status: form.status as Collateral['status'],
      receivedDate: now,
      receivedBy: profile?.uid || '',
      notes: form.notes || undefined,
      updatedAt: now,
    };

    try {
      if (editMode && selectedItem) {
        await updateDoc(doc(db, 'collateral', selectedItem.id), data);
      } else {
        await addDoc(collection(db, 'collateral'), { ...data, createdAt: now });
      }
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving collateral:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collateral record?')) return;
    try {
      await deleteDoc(doc(db, 'collateral', id));
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleEdit = (item: Collateral) => {
    setSelectedItem(item);
    setForm({
      borrowerId: item.borrowerId,
      type: item.type,
      description: item.description,
      serialNumber: item.serialNumber || '',
      estimatedValue: item.estimatedValue.toString(),
      storageLocation: item.storageLocation || '',
      notes: item.notes || '',
      status: item.status,
    });
    setEditMode(true);
    setShowForm(true);
  };

  const filtered = items.filter((item) => {
    const matchSearch =
      item.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const typeIcon = (type: CollateralType) => {
    const icons: Record<CollateralType, string> = {
      land_title: '🏠',
      motorcycle: '🏍️',
      phone: '📱',
      electronics: '💻',
      vehicle: '🚗',
      jewelry: '💍',
      other: '📦',
    };
    return icons[type];
  };

  return (
    <div>
      <PageHeader
        title="Collateral"
        description={`${items.length} items tracked`}
        actions={
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Collateral
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by owner, description, or serial..."
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'held', label: 'Held' },
            { value: 'released', label: 'Released' },
            { value: 'forfeited', label: 'Forfeited' },
          ]}
          className="w-36"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No collateral found"
          description={search ? 'Try a different search' : 'Add your first collateral item'}
          action={
            !search && (
              <Button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Add Collateral
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-slate-800/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-lg">
                    {typeIcon(item.type)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.description}</p>
                    <p className="text-xs text-slate-400">
                      {collateralTypeLabels[item.type]}
                    </p>
                  </div>
                </div>
                <Badge status={item.status} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Value: {formatCurrency(item.estimatedValue)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Owner: {item.borrowerName}</span>
                </div>
                {item.storageLocation && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{item.storageLocation}</span>
                  </div>
                )}
                {item.serialNumber && (
                  <p className="text-xs text-slate-500 font-mono">S/N: {item.serialNumber}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowDetail(true);
                  }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-300 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          resetForm();
        }}
        title={editMode ? 'Edit Collateral' : 'Add Collateral'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Borrower"
            value={form.borrowerId}
            onChange={(e) => setForm({ ...form, borrowerId: e.target.value })}
            options={[
              { value: '', label: 'Select borrower...' },
              ...borrowers.map((b) => ({
                value: b.id,
                label: `${b.firstName} ${b.lastName}`,
              })),
            ]}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Type"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as CollateralType })
              }
              options={Object.entries(collateralTypeLabels).map(([v, l]) => ({
                value: v,
                label: l,
              }))}
            />
            <Input
              label="Estimated Value"
              type="number"
              value={form.estimatedValue}
              onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })}
              required
            />
          </div>

          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            placeholder="e.g. Samsung Galaxy S24, Toyota Corolla 2020..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Serial Number"
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              placeholder="IMEI, VIN, etc."
            />
            <Input
              label="Storage Location"
              value={form.storageLocation}
              onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
              placeholder="Office safe, Warehouse B..."
            />
          </div>

          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: 'held', label: 'Held' },
              { value: 'released', label: 'Released' },
              { value: 'forfeited', label: 'Forfeited' },
            ]}
          />

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
            <Button type="submit">{editMode ? 'Update' : 'Add'} Collateral</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title="Collateral Details"
        size="md"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center text-2xl">
                {typeIcon(selectedItem.type)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedItem.description}
                </h3>
                <p className="text-sm text-slate-400">
                  {collateralTypeLabels[selectedItem.type]}
                </p>
              </div>
              <Badge status={selectedItem.status} className="ml-auto" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Owner</p>
                <p className="text-white">{selectedItem.borrowerName}</p>
              </div>
              <div>
                <p className="text-slate-400">Estimated Value</p>
                <p className="text-white">{formatCurrency(selectedItem.estimatedValue)}</p>
              </div>
              {selectedItem.serialNumber && (
                <div>
                  <p className="text-slate-400">Serial Number</p>
                  <p className="text-white font-mono">{selectedItem.serialNumber}</p>
                </div>
              )}
              {selectedItem.storageLocation && (
                <div>
                  <p className="text-slate-400">Storage Location</p>
                  <p className="text-white">{selectedItem.storageLocation}</p>
                </div>
              )}
              <div>
                <p className="text-slate-400">Received Date</p>
                <p className="text-white">{formatDate(selectedItem.receivedDate)}</p>
              </div>
              {selectedItem.releasedDate && (
                <div>
                  <p className="text-slate-400">Released Date</p>
                  <p className="text-white">{formatDate(selectedItem.releasedDate)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
