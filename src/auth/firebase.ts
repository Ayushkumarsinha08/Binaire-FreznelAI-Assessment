import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth';

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  missingKeys: string[];
}

const requiredEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

function cleanEnvVal(val: unknown): string {
  if (!val || typeof val !== 'string') return '';
  return val.trim().replace(/^["']|["']$/g, '').replace(/,$/, '').trim();
}

/**
 * Validates whether real environment variables have been set.
 */
export function checkFirebaseConfiguration(): FirebaseConfigStatus {
  const missingKeys: string[] = [];

  for (const key of requiredEnvKeys) {
    const raw = import.meta.env[key];
    const val = cleanEnvVal(raw);
    if (!val || val.length === 0 || val.includes('your_')) {
      missingKeys.push(key);
    }
  }

  return {
    isConfigured: missingKeys.length === 0,
    missingKeys,
  };
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

const configStatus = checkFirebaseConfiguration();

if (configStatus.isConfigured) {
  const firebaseConfig = {
    apiKey: cleanEnvVal(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: cleanEnvVal(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: cleanEnvVal(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: cleanEnvVal(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: cleanEnvVal(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: cleanEnvVal(import.meta.env.VITE_FIREBASE_APP_ID),
  };

  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  firebaseAuth = getAuth(firebaseApp);

  // Standard persistent browser session
  setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {
    // Non-fatal if browser blocks third-party cookies or storage
  });
}

export { firebaseApp, firebaseAuth };
