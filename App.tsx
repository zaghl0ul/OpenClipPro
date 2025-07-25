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
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage'));
const ProjectCreatePage = React.lazy(() => import('./pages/ProjectCreatePage'));
const QuickAnalyzePage = React.lazy(() => import('./pages/QuickAnalyzePage'));
const AllClipsPage = React.lazy(() => import('./pages/AllClipsPage'));
const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const ProjectDetailPage = React.lazy(() => import('./pages/ProjectDetailPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const TrimClipsPage = React.lazy(() => import('./pages/TrimClipsPage'));
const ExportPage = React.lazy(() => import('./pages/ExportPage'));

// Loading component
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
      <p className="text-[var(--color-text-secondary)]">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Public routes */}
            <Route 
              path="/" 
              element={
                user ? (
                  <Navigate to="/app/dashboard" replace />
                ) : (
                  <Suspense fallback={<PageLoader />}>
                    <LandingPage />
                  </Suspense>
                )
              } 
            />
            <Route 
              path="/about" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <AboutPage />
                </Suspense>
              } 
            />
            <Route 
              path="/pricing" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <PricingPage />
                </Suspense>
              } 
            />

            {/* Protected app routes */}
            <Route
              path="/app/dashboard"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Dashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/projects"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ProjectsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/projects/:projectId"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ProjectDetailPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/projects/new"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ProjectCreatePage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/clips"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AllClipsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/analytics"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AnalyticsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/quick-analyze"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <QuickAnalyzePage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/trim-clips"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <TrimClipsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/export"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ExportPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/history"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <HistoryPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/settings"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <SettingsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Redirect routes */}
            <Route
              path="*"
              element={
                user ? (
                  <Navigate to="/app/dashboard" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
          
          {/* Animation debugger for development */}
          <AnimationDebugger />
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;