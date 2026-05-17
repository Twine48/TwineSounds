import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBQA-Psfecz3tFPiGA-wmEf5Bk2iLkmzFE",
  authDomain: "loanpro-4b6d6.firebaseapp.com",
  projectId: "loanpro-4b6d6",
  storageBucket: "loanpro-4b6d6.firebasestorage.app",
  messagingSenderId: "277548263551",
  appId: "1:277548263551:web:90ac449ebd31388ceb374a",
  measurementId: "G-TTBPDC9VFM",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
export { analytics };

export default app;
