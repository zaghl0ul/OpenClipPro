import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastProvider';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import AnimationDebugger from './components/AnimationDebugger';

// Lazy load pages for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));

const PageLoader = () => (
<div className="min-h-screen flex items-center justify-center">
  <div className="text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
    <p className="text-gray-400">Loading...</p>
  </div>
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
          <AnimationDebugger />
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;