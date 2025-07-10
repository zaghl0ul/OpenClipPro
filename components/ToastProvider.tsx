import React from 'react';
import { Toaster } from 'react-hot-toast';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#2d3748', // gray-800
            color: '#e2e8f0', // gray-200
            border: '1px solid #4a5568', // gray-600
          },
          success: {
            iconTheme: {
              primary: '#8b5cf6', // purple-500
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ec4899', // pink-500
              secondary: 'white',
            },
          },
        }}
      />
    </>
  );
};
