'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function FirebaseStatus() {
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const { db } = await import('@/lib/firebase');
        const { collection, getDocs, limit, query } = await import('firebase/firestore');
        await getDocs(query(collection(db, '__health__'), limit(1)));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('NOT_FOUND') || msg.includes('not found')) {
          setError(
            'Firestore database not found. Please create a Firestore database in your Firebase Console (Build > Firestore Database > Create Database).'
          );
        } else if (msg.includes('permission-denied')) {
          // Permissions work, database exists — this is fine
          setError(null);
        }
      }
    }
    check();
  }, []);

  if (!error || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4"
      >
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-300">Firebase Setup Required</p>
            <p className="text-xs text-amber-400/80 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
