import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { UserProfile } from '../types';

const INITIAL_FREE_CREDITS = 5;

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Check if Firebase Auth is properly initialized
    if (!auth) {
      console.error("Firebase Auth is not initialized");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      try {
        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUser(userDocSnap.data() as UserProfile);
          } else {
            // Create a new user profile in Firestore if it doesn't exist
            const newUserProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              credits: INITIAL_FREE_CREDITS,
            };
            await setDoc(userDocRef, newUserProfile);
            setUser(newUserProfile);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setUser(null);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    }, (error) => {
      console.error("Auth state change error:", error);
      setLoading(false);
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const signUp = (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized");
    }
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized");
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized");
    }
    return signOut(auth);
  };

  const addCredits = async (amount: number) => {
    if (!user || !db) {
      throw new Error("User not authenticated or Firestore not initialized");
    }
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { credits: increment(amount) });
    setUser((prevUser) => prevUser ? { ...prevUser, credits: prevUser.credits + amount } : null);
  };

  return { user, loading: loading || !authInitialized, signUp, login, logout, addCredits };
};