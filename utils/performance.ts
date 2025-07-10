interface PerformanceMetrics {
  componentRenderTime: number;
  networkRequests: number;
  errors: Error[];
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();

  startTimer(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      const existing = this.metrics.get(componentName) || {
        componentRenderTime: 0,
        networkRequests: 0,
        errors: []
      };
      
      this.metrics.set(componentName, {
        ...existing,
        componentRenderTime: (existing.componentRenderTime + renderTime) / 2 // Average
      });
    };
  }

  trackError(componentName: string, error: Error) {
    const existing = this.metrics.get(componentName) || {
      componentRenderTime: 0,
      networkRequests: 0,
      errors: []
    };
    
    this.metrics.set(componentName, {
      ...existing,
      errors: [...existing.errors, error]
    });
  }

  trackNetworkRequest(componentName: string) {
    const existing = this.metrics.get(componentName) || {
      componentRenderTime: 0,
      networkRequests: 0,
      errors: []
    };
    
    this.metrics.set(componentName, {
      ...existing,
      networkRequests: existing.networkRequests + 1
    });
  }

  getMetrics(componentName?: string): PerformanceMetrics | Map<string, PerformanceMetrics> {
    if (componentName) {
      return this.metrics.get(componentName) || {
        componentRenderTime: 0,
        networkRequests: 0,
        errors: []
      };
    }
    return this.metrics;
  }

  // Performance optimization helpers
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Memory management
  cleanup() {
    this.metrics.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for performance optimization
export const debounce = performanceMonitor.debounce.bind(performanceMonitor);
export const throttle = performanceMonitor.throttle.bind(performanceMonitor);