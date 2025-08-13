// Monitoring and analytics utilities
import { AppError } from './errorHandling';

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  private constructor() {
    this.initializeWebVitals();
  }
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  // Initialize Web Vitals monitoring
  private initializeWebVitals(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('lcp', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Monitor First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('fid', entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });
      
      // Monitor Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordMetric('cls', clsValue);
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }
  
  // Record a metric
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
    
    // Send to analytics in batches
    if (this.metrics.get(name)!.length >= 10) {
      this.sendMetrics(name);
    }
  }
  
  // Send metrics to analytics service
  private sendMetrics(name: string): void {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return;
    
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    Analytics.track('performance_metric', {
      metric: name,
      average,
      max,
      min,
      count: values.length,
    });
    
    // Clear sent metrics
    this.metrics.set(name, []);
  }
  
  // Measure function execution time
  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    return fn().finally(() => {
      const duration = performance.now() - start;
      this.recordMetric(`function_${name}`, duration);
    });
  }
  
  // Measure sync function execution time
  measureSync<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(`function_${name}`, duration);
    }
  }
}

// Analytics tracking
export class Analytics {
  private static initialized = false;
  private static queue: Array<{event: string; data: any}> = [];
  
  // Initialize analytics
  static initialize(): void {
    if (Analytics.initialized) return;
    
    Analytics.initialized = true;
    
    // Process queued events
    Analytics.queue.forEach(({event, data}) => {
      Analytics.sendEvent(event, data);
    });
    Analytics.queue = [];
  }
  
  // Track an event
  static track(event: string, data?: Record<string, any>): void {
    const enrichedData = {
      ...data,
      timestamp: new Date().toISOString(),
      sessionId: Analytics.getSessionId(),
      userId: Analytics.getUserId(),
      ...Analytics.getDeviceInfo(),
    };
    
    if (!Analytics.initialized) {
      Analytics.queue.push({event, data: enrichedData});
      return;
    }
    
    Analytics.sendEvent(event, enrichedData);
  }
  
  // Send event to analytics service
  private static sendEvent(event: string, data: any): void {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, data);
    }
    
    // Custom analytics endpoint
    if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
      fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data }),
      }).catch(() => {
        // Fail silently
      });
    }
    
    // Console log in development
    if (import.meta.env.MODE === 'development') {
      console.log('Analytics Event:', event, data);
    }
  }
  
  // Get or create session ID
  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
  
  // Get user ID (anonymous)
  private static getUserId(): string | null {
    return localStorage.getItem('analytics_user_id');
  }
  
  // Get device information
  private static getDeviceInfo(): Record<string, any> {
    if (typeof window === 'undefined') return {};
    
    return {
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      user_agent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      connection_type: (navigator as any).connection?.effectiveType,
    };
  }
}

// Logger utility
export class Logger {
  private static logLevel: 'debug' | 'info' | 'warn' | 'error' = 
    import.meta.env.MODE === 'development' ? 'debug' : 'info';
  
  private static levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };
  
  static debug(message: string, data?: any): void {
    if (Logger.levels[Logger.logLevel] <= Logger.levels.debug) {
      console.debug(`[DEBUG] ${message}`, data);
      Logger.sendLog('debug', message, data);
    }
  }
  
  static info(message: string, data?: any): void {
    if (Logger.levels[Logger.logLevel] <= Logger.levels.info) {
      console.info(`[INFO] ${message}`, data);
      Logger.sendLog('info', message, data);
    }
  }
  
  static warn(message: string, data?: any): void {
    if (Logger.levels[Logger.logLevel] <= Logger.levels.warn) {
      console.warn(`[WARN] ${message}`, data);
      Logger.sendLog('warn', message, data);
    }
  }
  
  static error(message: string, error?: Error | any): void {
    console.error(`[ERROR] ${message}`, error);
    Logger.sendLog('error', message, {
      error: error?.message || error,
      stack: error?.stack,
    });
  }
  
  private static sendLog(level: string, message: string, data?: any): void {
    if (import.meta.env.MODE === 'production' && import.meta.env.VITE_LOGGING_ENDPOINT) {
      const logData = {
        level,
        message,
        data,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      };
      
      fetch(import.meta.env.VITE_LOGGING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      }).catch(() => {
        // Fail silently
      });
    }
  }
}

// Resource usage monitoring
export class ResourceMonitor {
  private static instance: ResourceMonitor;
  private intervalId?: number;
  
  private constructor() {}
  
  static getInstance(): ResourceMonitor {
    if (!ResourceMonitor.instance) {
      ResourceMonitor.instance = new ResourceMonitor();
    }
    return ResourceMonitor.instance;
  }
  
  // Start monitoring resources
  startMonitoring(intervalMs: number = 30000): void {
    if (this.intervalId) return;
    
    this.intervalId = window.setInterval(() => {
      this.collectResourceMetrics();
    }, intervalMs);
    
    // Collect initial metrics
    this.collectResourceMetrics();
  }
  
  // Stop monitoring
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
  
  // Collect resource metrics
  private collectResourceMetrics(): void {
    const metrics: Record<string, any> = {};
    
    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memory = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    
    // Navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    if (navigation) {
      metrics.navigation = {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstByte: navigation.responseStart - navigation.fetchStart,
      };
    }
    
    // Resource timing (top 10 slowest resources)
    const resources = performance.getEntriesByType('resource')
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(r => ({
        name: r.name.split('/').pop(),
        duration: r.duration,
        size: (r as any).transferSize || 0,
      }));
    
    metrics.slowestResources = resources;
    
    // Send metrics
    Analytics.track('resource_metrics', metrics);
  }
}

// Error tracking
export const sendToMonitoring = (error: Error | AppError): void => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
    ...(error instanceof AppError && {
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
    }),
  };
  
  // Send to monitoring service
  if (import.meta.env.VITE_ERROR_TRACKING_ENDPOINT) {
    fetch(import.meta.env.VITE_ERROR_TRACKING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData),
    }).catch(() => {
      // Fail silently
    });
  }
  
  // Track in analytics
  Analytics.track('error', errorData);
  
  // Log error
  Logger.error(error.message, error);
};

// Export singleton instances
export const performanceMonitor = PerformanceMonitor.getInstance();
export const resourceMonitor = ResourceMonitor.getInstance();