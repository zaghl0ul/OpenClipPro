import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        setStatus('Testing Firebase connection...');
        
        // Test 1: Check if we can read from Firestore
        setStatus('Testing Firestore read...');
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        setStatus('✅ Firestore read successful');
        
        // Test 2: Check if we can write to Firestore
        setStatus('Testing Firestore write...');
        await addDoc(testCollection, {
          test: true,
          timestamp: new Date()
        });
        setStatus('✅ Firestore write successful');
        
        // Test 3: Test authentication
        setStatus('Testing authentication...');
        const userCredential = await signInAnonymously(auth);
        setStatus(`✅ Authentication successful: ${userCredential.user.uid}`);
        
        setStatus('✅ All Firebase tests passed!');
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setStatus('❌ Firebase test failed');
        console.error('Firebase test error:', err);
      }
    };

    testFirebase();
  }, []);

  return (
    <div className="p-6 bg-gray-800 rounded-lg max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Firebase Connection Test</h2>
      <div className="mb-4">
        <p className="text-sm text-gray-300">{status}</p>
      </div>
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded p-3">
          <p className="text-red-300 text-sm">Error: {error}</p>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-400">
                  <p>Project ID: openclip-pro</p>
          <p>Auth Domain: openclip-pro.firebaseapp.com</p>
      </div>
    </div>
  );
};

export default FirebaseTest; 