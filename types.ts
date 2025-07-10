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

// Video Clip Generation Types
export type ClipGenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface VideoClip {
  id: string;
  format: 'mp4' | 'webm';
  quality: 'high' | 'medium' | 'low';
  aspectRatio: '16:9' | '9:16' | '1:1' | 'original';
  blob?: Blob; // For browser-generated clips
  cloudUrl?: string; // For cloud-generated clips
  size: number; // File size in bytes
  duration: number; // Actual clip duration
  status: ClipGenerationStatus;
  error?: string;
  progress?: number; // 0-100 for generation progress
}

export interface ClipGenerationOptions {
  format: 'mp4' | 'webm';
  quality: 'high' | 'medium' | 'low';
  aspectRatio: '16:9' | '9:16' | '1:1' | 'original';
  useCloud?: boolean; // Whether to use cloud processing
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
  generatedClips?: Record<string, VideoClip>; // Generated video clips for different formats/ratios
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
  includeAudio: boolean; // Whether to include audio analysis
  customPrompt?: string;
}

// Update AnalysisJob to include settings
export interface AnalysisJob {
  id: string;
  userId: string;
  videoFileName: string;
  videoUrl: string | null; // Firebase Storage URL (null when processing locally)
  localVideoUrl?: string; // Local blob URL for instant preview
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

// LLM Model Types
export interface LLMModel {
  id: string;
  name: string;
  description: string;
  costPer1kTokens: number;
  maxTokens?: number;
  supportsVision: boolean;
  isRecommended?: boolean;
}

export interface LLMConfig {
  provider: LLMProvider;
  name: string;
  description: string;
  models: LLMModel[];
  defaultModel: string;
  temperature?: number;
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