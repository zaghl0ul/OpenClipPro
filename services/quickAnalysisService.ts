import { 
  QuickAnalysisResult, 
  QuickClip, 
  QuickMoment, 
  LLMProvider, 
  Platform,
  AnalysisSettings,
  ContentType,
  ProjectVideo
} from '../types';
import { Timestamp } from 'firebase/firestore';
import { analyzeVideoWithLLM } from './llmService';
import { extractFrames, analyzeAudio } from '../utils/videoProcessor';

interface QuickAnalysisOptions {
  provider?: LLMProvider;
  maxClips?: number;
  fastMode?: boolean;
  targetPlatform?: Platform;
}

/**
 * Quick Analysis Service for rapid viral moment detection
 * Optimized for speed with reduced frame sampling and streamlined AI prompts
 */
export class QuickAnalysisService {
  
  /**
   * Perform quick analysis on a video file
   */
  static async analyzeVideo(
    videoFile: File,
    projectVideo: ProjectVideo,
    options: QuickAnalysisOptions = {},
    onProgress?: (message: string, progress: number) => void
  ): Promise<QuickAnalysisResult> {
    const {
      provider = 'gemini',
      maxClips = 5,
      fastMode = true,
      targetPlatform = 'youtube-shorts'
    } = options;

    onProgress?.('🚀 Starting Quick Analysis...', 0);

    try {
      // Extract fewer frames for quick analysis (8-12 frames max)
      const maxFrames = fastMode ? 8 : 12;
      onProgress?.('📸 Extracting key frames...', 10);
      
      const { frames, duration } = await extractFrames(videoFile, {
        maxFrames,
        quality: 0.7, // Lower quality for speed
        parallelProcessing: true
      });

      onProgress?.('🎵 Quick audio scan...', 30);

      // Quick audio analysis (optional for speed)
      const audioAnalysis = await analyzeAudio(videoFile, duration, (msg) => {
        onProgress?.(msg, 40);
      });

      onProgress?.('🧠 AI Quick Scan...', 50);

      // Streamlined analysis settings for quick mode
      const quickSettings: AnalysisSettings = {
        contentTypes: ['engagement', 'action', 'emotional'] as ContentType[],
        platform: targetPlatform,
        minDuration: 5,
        maxDuration: 60,
        includeAudio: true
      };

      // Use streamlined LLM analysis
      const analysisResult = await analyzeVideoWithLLM(
        frames,
        duration,
        provider,
        quickSettings,
        audioAnalysis,
        undefined,
        (msg) => onProgress?.(msg, 70)
      );

      onProgress?.('⚡ Processing results...', 85);

      // Convert full analysis to quick analysis format
      const quickResult = this.convertToQuickAnalysis(
        analysisResult,
        projectVideo,
        provider,
        maxClips,
        targetPlatform,
        duration,
        audioAnalysis
      );

      onProgress?.('✅ Quick Analysis Complete!', 100);

      return quickResult;

    } catch (error) {
      console.error('Quick Analysis failed:', error);
      throw new Error(`Quick Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert full analysis result to quick analysis format
   */
  private static convertToQuickAnalysis(
    analysisResult: unknown,
    projectVideo: ProjectVideo,
    provider: LLMProvider,
    maxClips: number,
    targetPlatform: Platform,
    duration: number,
    audioAnalysis?: unknown
  ): QuickAnalysisResult {
    const clips = Array.isArray(analysisResult.clips) ? analysisResult.clips : [];
    
    // Convert to quick clips with platform optimization
    const quickClips: QuickClip[] = clips
      .slice(0, maxClips)
      .map((clip: unknown) => ({
        startTime: (clip as { startTime: number }).startTime,
        endTime: (clip as { endTime: number }).endTime,
        score: (clip as { viralScore?: { overall?: number } }).viralScore?.overall || 0,
        reason: this.summarizeReason((clip as { reason?: string }).reason),
        platform: this.determineBestPlatform(clip, targetPlatform),
        confidence: this.calculateConfidence((clip as { viralScore?: unknown }).viralScore)
      }));

    // Extract key moments from audio analysis and clips
    const keyMoments: QuickMoment[] = this.extractKeyMoments(clips, audioAnalysis);

    // Calculate overall score
    const overallScore = clips.length > 0 
      ? clips.reduce((sum: number, clip: unknown) => sum + ((clip as { viralScore?: { overall?: number } }).viralScore?.overall || 0), 0) / clips.length
      : 0;

    // Generate quick summary
    const summary = this.generateQuickSummary(clips, overallScore, duration);

    return {
      id: `quick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      videoId: projectVideo.id,
      provider,
      status: 'completed',
      completedAt: Timestamp.fromDate(new Date()),
      processingTime: Math.floor(Math.random() * 30) + 10, // Mock processing time
      topClips: quickClips,
      overallScore,
      summary,
      keyMoments,
      creditsUsed: 1 // Quick analysis uses 1 credit
    };
  }

  /**
   * Summarize reason for quick display
   */
  private static summarizeReason(reason: string): string {
    if (!reason) return 'High engagement potential';
    
    // Extract key phrases and shorten
    const keywords = reason.match(/\b(emotional|action|transition|music|speech|visual|hook|peak|intensity)\b/gi) || [];
    if (keywords.length > 0) {
      return `${keywords.slice(0, 2).join(' + ')} moment`;
    }
    
    return reason.length > 50 ? reason.substring(0, 47) + '...' : reason;
  }

  /**
   * Determine best platform for clip
   */
  private static determineBestPlatform(clip: unknown, defaultPlatform: Platform): Platform {
    const duration = ((clip as { endTime: number; startTime: number }).endTime - (clip as { endTime: number; startTime: number }).startTime);
    const viralScore = (clip as { viralScore?: unknown }).viralScore;
    
    // Platform-specific optimization
    if (duration <= 15 && viralScore?.engagement > 80) return 'tiktok';
    if (duration <= 30 && viralScore?.shareability > 75) return 'instagram-reels';
    if (duration <= 60 && viralScore?.retention > 70) return 'youtube-shorts';
    if (duration > 60) return 'youtube';
    
    return defaultPlatform;
  }

  /**
   * Calculate confidence score based on viral score breakdown
   */
  private static calculateConfidence(viralScore: unknown): number {
    if (!viralScore) return 0.5;
    
    const scores = [
      (viralScore as { overall?: number }).overall,
      (viralScore as { engagement?: number }).engagement,
      (viralScore as { shareability?: number }).shareability,
      (viralScore as { retention?: number }).retention
    ].filter(score => typeof score === 'number');
    
    if (scores.length === 0) return 0.5;
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.min(Math.max(average / 100, 0), 1);
  }

  /**
   * Extract key moments from analysis data
   */
  private static extractKeyMoments(clips: unknown[], audioAnalysis?: unknown): QuickMoment[] {
    const moments: QuickMoment[] = [];
    
    // Add moments from clips
    clips.forEach((clip: unknown) => {
      moments.push({
        timestamp: (clip as { startTime: number }).startTime,
        type: this.classifyMomentType(clip),
        intensity: ((clip as { viralScore?: { overall?: number } }).viralScore?.overall || 0) / 100,
        description: this.summarizeReason((clip as { reason?: string }).reason)
      });
    });

    // Add audio emotional peaks
    if (audioAnalysis?.emotionalPeaks) {
      (audioAnalysis as { emotionalPeaks?: number[] }).emotionalPeaks?.slice(0, 3).forEach((peak: number) => {
        moments.push({
          timestamp: peak,
          type: 'emotional-peak',
          intensity: 0.8,
          description: 'Audio emotional peak detected'
        });
      });
    }

    // Sort by timestamp and limit to top moments
    return moments
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, 8);
  }

  /**
   * Classify moment type based on clip content
   */
  private static classifyMomentType(clip: unknown): QuickMoment['type'] {
    const reason = ((clip as { reason?: string }).reason || '').toLowerCase();
    
    if (reason.includes('emotional') || reason.includes('emotion')) return 'emotional-peak';
    if (reason.includes('action') || reason.includes('movement')) return 'action';
    if (reason.includes('transition') || reason.includes('cut')) return 'transition';
    if (reason.includes('speech') || reason.includes('dialogue')) return 'speech';
    if (reason.includes('visual') || reason.includes('hook')) return 'visual-hook';
    
    return 'emotional-peak'; // Default
  }

  /**
   * Generate quick summary of analysis
   */
  private static generateQuickSummary(clips: unknown[], overallScore: number, duration: number): string {
    const clipCount = clips.length;
    const scoreText = overallScore >= 80 ? 'Excellent' : 
                     overallScore >= 60 ? 'Good' : 
                     overallScore >= 40 ? 'Moderate' : 'Limited';
    
    const durationText = duration < 60 ? 'short-form' : 'long-form';
    
    if (clipCount === 0) {
      return `This ${durationText} video has limited viral potential. Consider adding more engaging moments or visual hooks.`;
    }
    
    const topScore = Math.max(...clips.map((c: unknown) => (c as { viralScore?: { overall?: number } }).viralScore?.overall || 0));
    
    return `${scoreText} viral potential detected! Found ${clipCount} promising moments in this ${durationText} content. Top clip scored ${Math.round(topScore)}% - ready for ${clipCount > 3 ? 'multi-platform' : 'targeted'} distribution.`;
  }

  /**
   * Batch quick analysis for multiple videos
   */
  static async batchAnalyze(
    videos: { file: File; projectVideo: ProjectVideo }[],
    options: QuickAnalysisOptions = {},
    onProgress?: (videoIndex: number, message: string, progress: number) => void
  ): Promise<QuickAnalysisResult[]> {
    const results: QuickAnalysisResult[] = [];
    
    for (let i = 0; i < videos.length; i++) {
      const { file, projectVideo } = videos[i];
      
      try {
        onProgress?.(i, `Analyzing ${projectVideo.originalName}...`, 0);
        
        const result = await this.analyzeVideo(file, projectVideo, options, (msg, progress) => {
          onProgress?.(i, msg, progress);
        });
        
        results.push(result);
        
      } catch (error) {
        console.error(`Failed to analyze ${projectVideo.originalName}:`, error);
        // Continue with other videos even if one fails
      }
    }
    
    return results;
  }

  /**
   * Compare multiple quick analysis results
   */
  static compareResults(results: QuickAnalysisResult[]): {
    bestOverall: QuickAnalysisResult;
    bestClips: QuickClip[];
    averageScore: number;
    recommendations: string[];
  } {
    if (results.length === 0) {
      throw new Error('No results to compare');
    }

    const bestOverall = results.reduce((best, current) => 
      current.overallScore > best.overallScore ? current : best
    );

    const allClips = results.flatMap(result => result.topClips);
    const bestClips = allClips
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const averageScore = results.reduce((sum, result) => sum + result.overallScore, 0) / results.length;

    const recommendations = this.generateRecommendations(results, averageScore);

    return {
      bestOverall,
      bestClips,
      averageScore,
      recommendations
    };
  }

  /**
   * Generate recommendations based on analysis results
   */
  private static generateRecommendations(results: QuickAnalysisResult[], averageScore: number): string[] {
    const recommendations: string[] = [];
    
    if (averageScore >= 80) {
      recommendations.push('🔥 Excellent content! All videos show strong viral potential.');
      recommendations.push('📈 Consider A/B testing different hooks for maximum impact.');
    } else if (averageScore >= 60) {
      recommendations.push('👍 Good foundation! Focus on the highest-scoring clips first.');
      recommendations.push('⚡ Try shorter clips (15-30s) for better engagement.');
    } else {
      recommendations.push('💡 Consider adding more dynamic elements or emotional hooks.');
      recommendations.push('🎯 Focus on the best-performing segments and expand them.');
    }
    
    const platforms = results.flatMap(r => r.topClips.map(c => c.platform));
    const platformCounts = platforms.reduce((acc, platform) => {
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topPlatform = Object.entries(platformCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    recommendations.push(`🎯 Best platform fit: ${topPlatform.charAt(0).toUpperCase() + topPlatform.slice(1)}`);
    
    return recommendations;
  }
}

export default QuickAnalysisService; 