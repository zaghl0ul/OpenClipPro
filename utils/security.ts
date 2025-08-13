// Security utilities for API key management and data validation
import { z } from 'zod';
import CryptoJS from 'crypto-js';

// Environment validation schema
const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  VITE_FIREBASE_APP_ID: z.string().min(1),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  VITE_ENCRYPTION_KEY: z.string().min(32).optional(),
});

// Validate environment variables
export const validateEnv = () => {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw new Error('Missing required environment variables. Please check your .env file.');
  }
};

// API Key encryption/decryption
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

export const encryptApiKey = (apiKey: string): string => {
  if (!apiKey) return '';
  try {
    return CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Failed to encrypt API key:', error);
    throw new Error('Failed to encrypt API key');
  }
};

export const decryptApiKey = (encryptedKey: string): string => {
  if (!encryptedKey) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    throw new Error('Failed to decrypt API key');
  }
};

// Secure API key storage
export class SecureApiKeyManager {
  private static instance: SecureApiKeyManager;
  private keys: Map<string, string> = new Map();
  
  private constructor() {}
  
  static getInstance(): SecureApiKeyManager {
    if (!SecureApiKeyManager.instance) {
      SecureApiKeyManager.instance = new SecureApiKeyManager();
    }
    return SecureApiKeyManager.instance;
  }
  
  setApiKey(provider: string, apiKey: string): void {
    if (!provider || !apiKey) {
      throw new Error('Provider and API key are required');
    }
    
    // Store encrypted key in memory
    const encryptedKey = encryptApiKey(apiKey);
    this.keys.set(provider, encryptedKey);
    
    // Store in sessionStorage instead of localStorage for better security
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(`${provider}_API_KEY`, encryptedKey);
    }
  }
  
  getApiKey(provider: string): string | null {
    // First check memory
    const memoryKey = this.keys.get(provider);
    if (memoryKey) {
      return decryptApiKey(memoryKey);
    }
    
    // Then check sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const storedKey = window.sessionStorage.getItem(`${provider}_API_KEY`);
      if (storedKey) {
        this.keys.set(provider, storedKey); // Cache in memory
        return decryptApiKey(storedKey);
      }
    }
    
    return null;
  }
  
  removeApiKey(provider: string): void {
    this.keys.delete(provider);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(`${provider}_API_KEY`);
    }
  }
  
  clearAllKeys(): void {
    this.keys.clear();
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const providers = ['GEMINI', 'OPENAI', 'ANTHROPIC', 'LMSTUDIO'];
      providers.forEach(provider => {
        window.sessionStorage.removeItem(`${provider}_API_KEY`);
      });
    }
  }
}

// Input validation schemas
export const videoFileSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().min(1).max(5 * 1024 * 1024 * 1024), // Max 5GB
  type: z.string().regex(/^video\//),
});

export const analysisSettingsSchema = z.object({
  contentTypes: z.array(z.string()).min(1),
  platform: z.enum(['youtube', 'tiktok', 'instagram', 'twitter']),
  minDuration: z.number().min(5).max(300),
  maxDuration: z.number().min(5).max(300),
  includeAudioAnalysis: z.boolean(),
});

export const clipSchema = z.object({
  title: z.string().min(1).max(100),
  startTime: z.number().min(0),
  endTime: z.number().min(0),
  reason: z.string().min(1).max(500),
  viralScore: z.object({
    overall: z.number().min(0).max(100),
    engagement: z.number().min(0).max(100),
    shareability: z.number().min(0).max(100),
    retention: z.number().min(0).max(100),
    trend: z.number().min(0).max(100),
  }),
  scoreExplanation: z.string().min(1).max(500),
});

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove any potential script tags or HTML
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

// Validate and sanitize file paths
export const sanitizeFilePath = (path: string): string => {
  if (!path) return '';
  
  // Remove any directory traversal attempts
  return path
    .replace(/\.\./g, '')
    .replace(/[<>:"|?*]/g, '')
    .replace(/\/+/g, '/')
    .trim();
};

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Create rate limiters for different operations
export const apiRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
export const authRateLimiter = new RateLimiter(5, 300000); // 5 attempts per 5 minutes
export const uploadRateLimiter = new RateLimiter(5, 600000); // 5 uploads per 10 minutes

// Security headers middleware
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebase.com https://*.firebaseio.com wss://*.firebaseio.com https://*.anthropic.com https://*.openai.com;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Export types
export type ValidatedEnv = z.infer<typeof envSchema>;
export type VideoFile = z.infer<typeof videoFileSchema>;
export type AnalysisSettings = z.infer<typeof analysisSettingsSchema>;
export type ValidatedClip = z.infer<typeof clipSchema>;