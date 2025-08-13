import React from 'react';
import { errorRecovery, sendToMonitoring } from '../utils/errorHandling';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState(prevState => ({ 
      error, 
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Log error to monitoring service in production
    if (import.meta.env.MODE === 'production') {
      console.error('Error caught by boundary:', error, errorInfo);
      // In production, you'd send this to your error tracking service
      // e.g., Sentry, LogRocket, etc.
    }
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      const maxRetries = this.props.maxRetries || 3;
      const canRetry = this.state.errorCount < maxRetries;

      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">😵</div>
              <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
              <p className="text-white/70 mb-6">
                {canRetry 
                  ? "We're sorry, but something unexpected happened. You can try again or refresh the page."
                  : "We're sorry, but something unexpected happened. Please refresh the page."
                }
              </p>
              
              <div className="space-y-3">
                {canRetry && (
                  <button
                    onClick={this.resetError}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Try Again ({this.state.errorCount}/{maxRetries})
                  </button>
                )}
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 border border-white/20"
                >
                  Refresh Page
                </button>
              </div>
              
              {import.meta.env.MODE === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-white/70 hover:text-white">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-3 text-xs text-red-300 bg-red-900/20 p-3 rounded border border-red-500/30 overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 