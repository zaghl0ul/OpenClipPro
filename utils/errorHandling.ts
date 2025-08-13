// Comprehensive error handling utilities
import { toast } from 'react-hot-toast';

// Custom error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, true, context);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AUTHENTICATION_ERROR', 401, true, context);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AUTHORIZATION_ERROR', 403, true, context);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'NOT_FOUND_ERROR', 404, true, context);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'RATE_LIMIT_ERROR', 429, true, context);
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, service: string, originalError?: Error) {
    super(message, 'EXTERNAL_SERVICE_ERROR', 503, true, {
      service,
      originalError: originalError?.message
    });
    this.name = 'ExternalServiceError';
  }
}

// Error handler for async functions
export const asyncHandler = <T extends (...args: any[]) => Promise<any>>(fn: T): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }) as T;
};

// Global error handler
export const handleError = (error: unknown): void => {
  if (error instanceof AppError) {
    // Handle operational errors
    logError(error);
    
    if (error.isOperational) {
      showUserError(error);
    } else {
      showGenericError();
    }
  } else if (error instanceof Error) {
    // Handle unexpected errors
    logError(error);
    showGenericError();
  } else {
    // Handle unknown errors
    logError(new Error(String(error)));
    showGenericError();
  }
};

// User-friendly error messages
const errorMessages: Record<string, string> = {
  'VALIDATION_ERROR': 'Please check your input and try again.',
  'AUTHENTICATION_ERROR': 'Please sign in to continue.',
  'AUTHORIZATION_ERROR': 'You don\'t have permission to perform this action.',
  'NOT_FOUND_ERROR': 'The requested resource was not found.',
  'RATE_LIMIT_ERROR': 'Too many requests. Please try again later.',
  'EXTERNAL_SERVICE_ERROR': 'External service is temporarily unavailable.',
  'NETWORK_ERROR': 'Network connection error. Please check your internet connection.',
  'TIMEOUT_ERROR': 'Request timed out. Please try again.',
  'FILE_TOO_LARGE': 'File size exceeds the maximum allowed limit.',
  'INVALID_FILE_TYPE': 'Invalid file type. Please upload a supported file format.',
  'QUOTA_EXCEEDED': 'Storage quota exceeded. Please free up some space.',
};

// Show error to user
const showUserError = (error: AppError): void => {
  const message = errorMessages[error.code] || error.message;
  
  switch (error.code) {
    case 'AUTHENTICATION_ERROR':
      toast.error(message, {
        duration: 4000,
        icon: '🔐',
      });
      // Redirect to login if needed
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
      break;
    
    case 'RATE_LIMIT_ERROR':
      toast.error(message, {
        duration: 6000,
        icon: '⏰',
      });
      break;
    
    case 'VALIDATION_ERROR':
      toast.error(message, {
        duration: 4000,
        icon: '⚠️',
      });
      break;
    
    default:
      toast.error(message, {
        duration: 4000,
      });
  }
};

// Show generic error message
const showGenericError = (): void => {
  toast.error('Something went wrong. Please try again later.', {
    duration: 4000,
    icon: '❌',
  });
};

// Log error (in production, send to monitoring service)
const logError = (error: Error): void => {
  if (import.meta.env.MODE === 'development') {
    console.error('Error:', error);
  } else {
    // Send to monitoring service
    sendToMonitoring(error);
  }
};

// Send error to monitoring service
const sendToMonitoring = (error: Error): void => {
  // In production, integrate with services like Sentry, LogRocket, etc.
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
    ...(error instanceof AppError && { context: error.context }),
  };
  
  // Example: Send to monitoring endpoint
  if (import.meta.env.VITE_MONITORING_ENDPOINT) {
    fetch(import.meta.env.VITE_MONITORING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData),
    }).catch(() => {
      // Fail silently to avoid error loops
    });
  }
};

// Retry mechanism for transient failures
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry for non-transient errors
      if (error instanceof AppError && !isTransientError(error)) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
};

// Check if error is transient (can be retried)
const isTransientError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return ['EXTERNAL_SERVICE_ERROR', 'NETWORK_ERROR', 'TIMEOUT_ERROR'].includes(error.code);
  }
  
  // Check for common network error messages
  const message = error.message.toLowerCase();
  return message.includes('network') || 
         message.includes('timeout') || 
         message.includes('fetch');
};

// Error recovery strategies
export const errorRecovery = {
  // Clear corrupted cache
  clearCache: async (): Promise<void> => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    localStorage.clear();
    sessionStorage.clear();
  },
  
  // Reload with clean state
  reloadClean: (): void => {
    errorRecovery.clearCache().then(() => {
      window.location.reload();
    });
  },
  
  // Report bug
  reportBug: (error: Error): void => {
    const bugReport = {
      error: error.message,
      stack: error.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
    
    // Open email client with bug report
    const subject = encodeURIComponent('Bug Report: OpenClip Pro');
    const body = encodeURIComponent(JSON.stringify(bugReport, null, 2));
    window.open(`mailto:support@openclip.pro?subject=${subject}&body=${body}`);
  },
};

// Export error boundary props type
export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}