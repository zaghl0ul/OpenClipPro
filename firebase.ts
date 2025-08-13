import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { validateEnv } from './utils/security';

// Validate environment variables before initializing Firebase
const env = validateEnv();

// Firebase configuration from validated environment variables
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: `https://${env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with error handling
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  throw new Error('Firebase initialization failed. Please check your configuration.');
}

// Initialize and export Firebase services with error handling
export let auth;
export let db;
export let storage;

try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Log successful initialization (only in development)
  if (import.meta.env.MODE === 'development') {
    console.log('Firebase services initialized successfully');
  }
} catch (error) {
  console.error('Failed to initialize Firebase services:', error);
  throw new Error('Failed to initialize Firebase services');
}