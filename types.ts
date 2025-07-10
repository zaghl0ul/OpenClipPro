import { Timestamp } from 'firebase/firestore';

export type { Timestamp };

// Audio Analysis Types
export interface AudioAnalysis {
  hasMusic: boolean;
  musicIntensity: number; // 0-1 scale
  speechCoverage: number; // 0-1 scale (how much of the clip has speech)
  emotionalPeaks: number[]; // Timestamps of emotional peaks in audio
  volume: {
    average: number;
    peak: number;
    dynamic: number; // Volume variation
  };
  tempo?: number; // BPM if music detected
}

// Viral Score Breakdown
export interface ViralScoreBreakdown {
  overall: number; // 0-100 overall viral potential score
  engagement: number; // 0-100 engagement potential
  shareability: number; // 0-100 shareability score
  retention: number; // 0-100 audience retention potential
  trend: number; // 0-100 trend alignment score
}

export interface Clip {
  id: string;
  title: string;
  reason: string;
  startTime: number;
  endTime: number;
  viralScore: ViralScoreBreakdown;
  scoreExplanation: string; // LLM's explanation of why it gave this score
  audioAnalysis?: AudioAnalysis; // Optional audio analysis data
  aspectRatios?: {
    '16:9': { x: number; y: number; width: number; height: number };
    '9:16': { x: number; y: number; width: number; height: number };
    '1:1': { x: number; y: number; width: number; height: number };
  }; // Cropping coordinates for different aspect ratios
}

export interface UserProfile {
  uid: string;
  email: string | null;
  credits: number;
  preferredLLM?: LLMProvider; // User's preferred LLM provider
}

export type AnalysisStatus = 'processing' | 'completed' | 'failed';

// Content Analysis Types
export type ContentType = 'monetization' | 'engagement' | 'action' | 'comedy' | 'emotional' | 'educational';

export interface ContentTypeConfig {
  type: ContentType;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
}

// Platform Types
export type Platform = 'tiktok' | 'youtube-shorts' | 'instagram-reels' | 'youtube' | 'twitter' | 'custom';

export interface PlatformConfig {
  platform: Platform;
  name: string;
  maxDuration: number; // in seconds
  recommendedDuration: number;
  aspectRatio: string;
  icon: string;
}

// Analysis Settings
export interface AnalysisSettings {
  contentTypes: ContentType[];
  platform: Platform;
  minDuration: number;
  maxDuration: number;
  customPrompt?: string;
}

// Update AnalysisJob to include settings
export interface AnalysisJob {
  id: string;
  userId: string;
  videoFileName: string;
  videoUrl: string | null; // Firebase Storage URL (null when processing locally)
  status: AnalysisStatus;
  clips: Clip[];
  createdAt: Timestamp;
  error?: string;
  llmProvider?: LLMProvider; // Which LLM was used for this analysis
  llmProviders?: LLMProvider[]; // Multiple providers for board mode
  settings?: AnalysisSettings; // Analysis settings used
  multiLLMResults?: MultiLLMAnalysis; // Results from board of advisors
  lmStudioUrl?: string; // Custom LMStudio server URL
}

// LLM Provider Types
export type LLMProvider = 'gemini' | 'openai' | 'anthropic' | 'claude' | 'lmstudio';

export interface LLMConfig {
  provider: LLMProvider;
  name: string;
  description: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  supportsVision: boolean;
  costPer1kTokens?: number;
  isAvailable: boolean;
}

export interface LLMResponse {
  clips: Omit<Clip, 'id'>[];
  provider: LLMProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// LLM Analysis Result
export interface LLMAnalysisResult {
  clips: Clip[];
  rawResponse?: string;
}

// Multi-LLM Analysis Types
export interface MultiLLMAnalysis {
  providers: LLMProvider[];
  aggregatedClips: AggregatedClip[];
  individualResults: Record<string, Clip[]>; // Changed from Map to plain object for Firestore
  consensusScore: number; // 0-100 representing agreement between AIs
}

export interface AggregatedClip extends Clip {
  recommendedBy: LLMProvider[];
  confidenceScore: number; // Based on how many AIs agreed
  variations: Record<string, { 
    title: string; 
    reason: string; 
    viralScore: ViralScoreBreakdown;
    scoreExplanation: string;
  }>; // Changed from Map to plain object
  aggregatedViralScore: ViralScoreBreakdown; // Combined scores from all AIs
}

// Analysis Mode
export type AnalysisMode = 'single' | 'board';

export interface AnalysisRequest {
  mode: AnalysisMode;
  providers: LLMProvider[];
  settings: AnalysisSettings;
}