// Performance optimization utilities
import { performanceMonitor } from './monitoring';

// Cache manager for application data
export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, { data: any; expiry: number }> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  
  private constructor() {
    // Clean up expired entries periodically
    setInterval(() => this.cleanupExpired(), 60000); // Every minute
  }
  
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }
  
  // Get from cache
  get<T>(key: string): T | null {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }
  
  // Set in cache
  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.DEFAULT_TTL);
    this.memoryCache.set(key, { data, expiry });
  }
  
  // Remove from cache
  delete(key: string): void {
    this.memoryCache.delete(key);
  }
  
  // Clear all cache
  clear(): void {
    this.memoryCache.clear();
  }
  
  // Clean up expired entries
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (now > value.expiry) {
        this.memoryCache.delete(key);
      }
    }
  }
  
  // Get cache size
  getSize(): number {
    return this.memoryCache.size;
  }
}

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy loading utility
export class LazyLoader {
  private static observers: Map<string, IntersectionObserver> = new Map();
  
  // Create intersection observer for lazy loading
  static createObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    const observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '50px',
      threshold: 0.01,
      ...options,
    });
    
    const id = `observer_${Date.now()}_${Math.random()}`;
    LazyLoader.observers.set(id, observer);
    
    return observer;
  }
  
  // Lazy load images
  static lazyLoadImages(container?: HTMLElement): void {
    const images = (container || document).querySelectorAll('img[data-src]');
    
    const imageObserver = LazyLoader.createObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
  
  // Lazy load components
  static lazyLoadComponent(
    element: HTMLElement,
    loadCallback: () => void,
    options?: IntersectionObserverInit
  ): void {
    const observer = LazyLoader.createObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadCallback();
          observer.unobserve(element);
        }
      });
    }, options);
    
    observer.observe(element);
  }
  
  // Clean up observers
  static cleanup(): void {
    LazyLoader.observers.forEach(observer => observer.disconnect());
    LazyLoader.observers.clear();
  }
}

// Request queue for API calls
export class RequestQueue {
  private static instance: RequestQueue;
  private queue: Array<{
    request: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private processing = false;
  private concurrency = 3;
  
  private constructor() {}
  
  static getInstance(): RequestQueue {
    if (!RequestQueue.instance) {
      RequestQueue.instance = new RequestQueue();
    }
    return RequestQueue.instance;
  }
  
  // Add request to queue
  enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.process();
    });
  }
  
  // Process queue
  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const batch = this.queue.splice(0, this.concurrency);
    
    try {
      const promises = batch.map(async ({ request, resolve, reject }) => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      await Promise.all(promises);
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        this.process();
      }
    }
  }
  
  // Set concurrency limit
  setConcurrency(limit: number): void {
    this.concurrency = Math.max(1, limit);
  }
  
  // Get queue size
  getQueueSize(): number {
    return this.queue.length;
  }
}

// Virtual scrolling helper
export class VirtualScroller {
  private items: any[] = [];
  private itemHeight: number;
  private containerHeight: number;
  private scrollTop = 0;
  private visibleStart = 0;
  private visibleEnd = 0;
  
  constructor(
    items: any[],
    itemHeight: number,
    containerHeight: number
  ) {
    this.items = items;
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
    this.updateVisibleRange();
  }
  
  // Update scroll position
  updateScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop;
    this.updateVisibleRange();
  }
  
  // Calculate visible range
  private updateVisibleRange(): void {
    this.visibleStart = Math.floor(this.scrollTop / this.itemHeight);
    this.visibleEnd = Math.ceil(
      (this.scrollTop + this.containerHeight) / this.itemHeight
    );
  }
  
  // Get visible items
  getVisibleItems(): { items: any[]; offset: number } {
    const items = this.items.slice(this.visibleStart, this.visibleEnd);
    const offset = this.visibleStart * this.itemHeight;
    return { items, offset };
  }
  
  // Get total height
  getTotalHeight(): number {
    return this.items.length * this.itemHeight;
  }
}

// Memoization decorator
export function memoize<T extends (...args: any[]) => any>(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;
  const cache = new Map<string, any>();
  
  descriptor.value = function (...args: Parameters<T>) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = originalMethod.apply(this, args);
    cache.set(key, result);
    
    // Clear cache if it gets too large
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
  
  return descriptor;
}

// Web Worker manager
export class WorkerManager {
  private static workers: Map<string, Worker> = new Map();
  
  // Create worker
  static createWorker(name: string, scriptUrl: string): Worker {
    const worker = new Worker(scriptUrl);
    WorkerManager.workers.set(name, worker);
    return worker;
  }
  
  // Get worker
  static getWorker(name: string): Worker | undefined {
    return WorkerManager.workers.get(name);
  }
  
  // Terminate worker
  static terminateWorker(name: string): void {
    const worker = WorkerManager.workers.get(name);
    if (worker) {
      worker.terminate();
      WorkerManager.workers.delete(name);
    }
  }
  
  // Terminate all workers
  static terminateAll(): void {
    WorkerManager.workers.forEach(worker => worker.terminate());
    WorkerManager.workers.clear();
  }
}

// Performance-optimized batch processor
export class BatchProcessor<T> {
  private items: T[] = [];
  private batchSize: number;
  private processCallback: (batch: T[]) => Promise<void>;
  private processing = false;
  
  constructor(
    batchSize: number,
    processCallback: (batch: T[]) => Promise<void>
  ) {
    this.batchSize = batchSize;
    this.processCallback = processCallback;
  }
  
  // Add items to process
  add(items: T | T[]): void {
    if (Array.isArray(items)) {
      this.items.push(...items);
    } else {
      this.items.push(items);
    }
    
    if (this.items.length >= this.batchSize && !this.processing) {
      this.process();
    }
  }
  
  // Process batches
  private async process(): Promise<void> {
    if (this.processing || this.items.length === 0) return;
    
    this.processing = true;
    
    try {
      while (this.items.length > 0) {
        const batch = this.items.splice(0, this.batchSize);
        await performanceMonitor.measureAsync('batch_processing', async () => {
          await this.processCallback(batch);
        });
      }
    } finally {
      this.processing = false;
    }
  }
  
  // Force process remaining items
  async flush(): Promise<void> {
    await this.process();
  }
}

// Export singleton instances
export const cacheManager = CacheManager.getInstance();
export const requestQueue = RequestQueue.getInstance();