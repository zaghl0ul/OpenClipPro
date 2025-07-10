import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ToastProvider';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';
import Loader from './components/Loader';
import ErrorBoundary from './components/ErrorBoundary';
import ProductionWarning from './components/ProductionWarning';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader message="Loading..." />
  </div>
);

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <Layout>
            <ProductionWarning />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route 
                  path="/" 
                  element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
                />
                <Route 
                  path="/about" 
                  element={<AboutPage />} 
                />
                <Route 
                  path="/dashboard" 
                  element={user ? <Dashboard /> : <Navigate to="/" replace />} 
                />
                <Route 
                  path="/history" 
                  element={user ? <HistoryPage /> : <Navigate to="/" replace />} 
                />
                <Route 
                  path="/settings" 
                  element={user ? <SettingsPage /> : <Navigate to="/" replace />} 
                />
                <Route 
                  path="/pricing" 
                  element={<PricingPage />} 
                />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;