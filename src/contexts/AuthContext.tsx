'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  Auth,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
import { UserProfile, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadFirebase(): Promise<{ auth: Auth; db: Firestore }> {
  const mod = await import('@/lib/firebase');
  return { auth: mod.auth, db: mod.db };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseRef = useRef<{ auth: Auth; db: Firestore } | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;

    loadFirebase().then(({ auth, db }) => {
      if (cancelled) return;
      firebaseRef.current = { auth, db };
      unsub = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
        if (cancelled) return;
        setUser(firebaseUser);
        if (firebaseUser) {
          try {
            const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (!cancelled && snap.exists()) {
              setProfile(snap.data() as UserProfile);
            }
          } catch {
            // Firebase may be unconfigured
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const fb = firebaseRef.current ?? await loadFirebase();
    firebaseRef.current = fb;
    const cred = await signInWithEmailAndPassword(fb.auth, email, password);
    const snap = await getDoc(doc(fb.db, 'users', cred.user.uid));
    if (snap.exists()) {
      setProfile(snap.data() as UserProfile);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, role: UserRole) => {
    const fb = firebaseRef.current ?? await loadFirebase();
    firebaseRef.current = fb;
    const cred = await createUserWithEmailAndPassword(fb.auth, email, password);
    const now = new Date().toISOString();
    const userProfile: UserProfile = {
      uid: cred.user.uid,
      email,
      displayName: name,
      role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(fb.db, 'users', cred.user.uid), userProfile);
    setProfile(userProfile);
  }, []);

  const signOut = useCallback(async () => {
    const fb = firebaseRef.current ?? await loadFirebase();
    firebaseRef.current = fb;
    await firebaseSignOut(fb.auth);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
