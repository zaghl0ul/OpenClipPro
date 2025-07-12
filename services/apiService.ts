import { LLMProvider, AnalysisSettings, AudioAnalysis } from '../types';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface AnalysisRequest {
  frames: { imageData: string; timestamp: number }[];
  duration: number;
  provider: LLMProvider;
  settings?: AnalysisSettings;
  audioAnalysis?: AudioAnalysis;
  model?: string;
  temperature?: number;
}

interface AnalysisResponse {
  clips: Array<{
    title: string;
    reason: string;
    startTime: number;
    endTime: number;
    viralScore: {
      overall: number;
      engagement: number;
      shareability: number;
      retention: number;
      trend: number;
    };
    scoreExplanation: string;
  }>;
  provider: LLMProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class APIService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    // In production, this would point to your backend API
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async analyzeVideo(request: AnalysisRequest): Promise<AnalysisResponse> {
    const response = await this.request<AnalysisResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.success) {
      throw new Error(response.error || 'Analysis failed');
    }

    return response.data!;
  }

  async validateAPIKey(provider: LLMProvider): Promise<boolean> {
    const response = await this.request<{ valid: boolean }>('/validate-key', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });

    return response.success && response.data?.valid === true;
  }

  async getUsageStats(): Promise<{
    totalAnalyses: number;
    creditsUsed: number;
    remainingCredits: number;
  }> {
    const response = await this.request<{
      totalAnalyses: number;
      creditsUsed: number;
      remainingCredits: number;
    }>('/usage');

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch usage stats');
    }

    return response.data!;
  }
}

// Export singleton instance
export const apiService = new APIService();

// Fallback to direct provider calls if backend is not available
export const fallbackToDirectProviders = true;