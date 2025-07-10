import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics"; // Commented out to avoid unused import

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAwpu49-tabLdLju6tEuttJaOX1Fa9jBcM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "viral-video-clipper.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://viral-video-clipper-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "viral-video-clipper",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "viral-video-clipper.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "566812069540",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:566812069540:web:3009f24c274b688ef12031",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BESTWZ1EZN"
};

// Validate required Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error('Missing Firebase configuration. Please check your environment variables.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Commented out to avoid unused variable

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Log successful initialization (only in development)
if (import.meta.env.MODE === 'development') {
  console.log('Firebase services initialized successfully');
}