/**
 * Instant Video Analysis Service
 * Uses browser-native APIs for fast video analysis without FFmpeg
 * Only generates clips when explicitly requested by user
 */

import { AudioAnalysis } from '../types';

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  frameRate?: number;
  hasAudio: boolean;
}

export interface VideoSegment {
  startTime: number;
  endTime: number;
  thumbnail: string; // Base64 image data
  confidence: number; // 0-1 confidence score
}

export interface InstantAnalysisResult {
  metadata: VideoMetadata;
  keyFrames: { timestamp: number; imageData: string }[];
  audioAnalysis?: AudioAnalysis;
  sceneChanges: number[]; // Timestamps of detected scene changes
  silentSegments: { start: number; end: number }[];
}

class InstantVideoService {
  private static instance: InstantVideoService;
  
  static getInstance(): InstantVideoService {
    if (!this.instance) {
      this.instance = new InstantVideoService();
    }
    return this.instance;
  }

  /**
   * Analyze video instantly using browser APIs
   */
  async analyzeVideo(
    file: File,
    options: {
      maxFrames?: number;
      includeAudio?: boolean;
      sceneDetection?: boolean;
    } = {},
    onProgress?: (progress: number, message: string) => void,
    signal?: AbortSignal
  ): Promise<InstantAnalysisResult> {
    const {
      maxFrames = 20,
      includeAudio = true,
      sceneDetection = true
    } = options;

    onProgress?.(5, '🎬 Loading video...');
    
    // Create video element and load file
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'metadata';
    
    const videoUrl = URL.createObjectURL(file);
    
    try {
      // Load video metadata
      await new Promise<void>((resolve, reject) => {
        if (signal?.aborted) reject(new Error('Analysis cancelled'));
        
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Failed to load video'));
        video.src = videoUrl;
      });

      if (signal?.aborted) throw new Error('Analysis cancelled');

      onProgress?.(15, '📊 Extracting video metadata...');
      
      const metadata: VideoMetadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        frameRate: undefined, // Browser doesn't expose frame rate easily
        hasAudio: includeAudio // We'll detect this during audio analysis
      };

      onProgress?.(25, '🖼️ Extracting key frames...');
      
      // Extract frames for AI analysis
      const keyFrames = await this.extractKeyFrames(
        video, 
        maxFrames, 
        (progress) => onProgress?.(25 + (progress * 0.4), '🖼️ Extracting frames...'),
        signal
      );

      if (signal?.aborted) throw new Error('Analysis cancelled');

      let audioAnalysis: AudioAnalysis | undefined;
      let sceneChanges: number[] = [];
      let silentSegments: { start: number; end: number }[] = [];

      if (includeAudio) {
        onProgress?.(65, '🎵 Analyzing audio...');
        audioAnalysis = await this.analyzeAudio(file, onProgress, signal);
        
        // Extract silent segments from audio analysis
        if (audioAnalysis) {
          silentSegments = this.detectSilentSegments(audioAnalysis, metadata.duration);
        }
      }

      if (sceneDetection && keyFrames.length > 1) {
        onProgress?.(85, '🎬 Detecting scene changes...');
        sceneChanges = await this.detectSceneChanges(keyFrames, signal);
      }

      onProgress?.(100, '✅ Analysis complete!');

      return {
        metadata,
        keyFrames,
        audioAnalysis,
        sceneChanges,
        silentSegments
      };

    } finally {
      URL.revokeObjectURL(videoUrl);
    }
  }

  /**
   * Extract key frames from video for AI analysis
   */
  private async extractKeyFrames(
    video: HTMLVideoElement,
    maxFrames: number,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<{ timestamp: number; imageData: string }[]> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size (optimize for AI analysis)
    const maxDimension = 800;
    const aspectRatio = video.videoWidth / video.videoHeight;
    
    if (video.videoWidth > video.videoHeight) {
      canvas.width = Math.min(maxDimension, video.videoWidth);
      canvas.height = canvas.width / aspectRatio;
    } else {
      canvas.height = Math.min(maxDimension, video.videoHeight);
      canvas.width = canvas.height * aspectRatio;
    }

    const frames: { timestamp: number; imageData: string }[] = [];
    const duration = video.duration;
    
    // Smart frame selection: more frames at beginning/end, distributed through middle
    const frameTimestamps = this.generateSmartFrameTimestamps(duration, maxFrames);

    for (let i = 0; i < frameTimestamps.length; i++) {
      if (signal?.aborted) throw new Error('Analysis cancelled');
      
      const timestamp = frameTimestamps[i];
      
      // Seek to timestamp
      await new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error('Seek failed'));
        video.currentTime = timestamp;
      });

      // Draw frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      frames.push({ timestamp, imageData });
      onProgress?.((i + 1) / frameTimestamps.length);
    }

    return frames;
  }

  /**
   * Generate smart frame timestamps for better analysis coverage
   */
  private generateSmartFrameTimestamps(duration: number, maxFrames: number): number[] {
    const timestamps: number[] = [];
    
    if (duration <= 60) {
      // Short videos: even distribution
      for (let i = 0; i < maxFrames; i++) {
        timestamps.push((i / (maxFrames - 1)) * duration);
      }
    } else {
      // Long videos: front-heavy distribution with key moments
      const frontFrames = Math.ceil(maxFrames * 0.4);
      const middleFrames = Math.ceil(maxFrames * 0.4);
      const endFrames = maxFrames - frontFrames - middleFrames;
      
      // First 10% of video (higher density)
      for (let i = 0; i < frontFrames; i++) {
        timestamps.push((i / frontFrames) * (duration * 0.1));
      }
      
      // Middle sections (sparse sampling)
      for (let i = 0; i < middleFrames; i++) {
        timestamps.push(duration * 0.1 + ((i / middleFrames) * (duration * 0.8)));
      }
      
      // Last 10% of video
      for (let i = 0; i < endFrames; i++) {
        timestamps.push(duration * 0.9 + ((i / endFrames) * (duration * 0.1)));
      }
    }
    
    return timestamps.sort((a, b) => a - b);
  }

  /**
   * Fast audio analysis using Web Audio API
   */
  private async analyzeAudio(
    file: File,
    onProgress?: (progress: number, message: string) => void,
    signal?: AbortSignal
  ): Promise<AudioAnalysis> {
    onProgress?.(70, '🎵 Loading audio data...');
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      if (signal?.aborted) throw new Error('Analysis cancelled');
      
      onProgress?.(75, '🎵 Decoding audio...');
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      if (signal?.aborted) throw new Error('Analysis cancelled');
      
      onProgress?.(80, '🎵 Analyzing audio characteristics...');
      
      // Fast audio analysis
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      const duration = audioBuffer.duration;
      
      // Volume analysis
      const volumeData = this.analyzeVolume(channelData, sampleRate);
      
      // Simple frequency analysis
      const frequencyAnalysis = this.analyzeFrequency(audioBuffer);
      
      // Detect peaks and patterns
      const emotionalPeaks = this.detectEmotionalPeaks(volumeData, duration);
      
      return {
        hasMusic: frequencyAnalysis.hasMusic,
        musicIntensity: frequencyAnalysis.musicIntensity,
        speechCoverage: frequencyAnalysis.speechCoverage,
        emotionalPeaks,
        volume: {
          average: volumeData.average,
          peak: volumeData.peak,
          dynamic: volumeData.dynamic
        },
        tempo: frequencyAnalysis.tempo
      };
      
    } finally {
      audioContext.close();
    }
  }

  /**
   * Analyze volume characteristics
   */
  private analyzeVolume(channelData: Float32Array, sampleRate: number) {
    const windowSize = sampleRate * 0.1; // 100ms windows
    const windows = Math.floor(channelData.length / windowSize);
    const volumeLevels: number[] = [];
    
    for (let i = 0; i < windows; i++) {
      const start = i * windowSize;
      const end = start + windowSize;
      
      let sum = 0;
      for (let j = start; j < end && j < channelData.length; j++) {
        sum += channelData[j] * channelData[j];
      }
      
      const rms = Math.sqrt(sum / windowSize);
      volumeLevels.push(rms);
    }
    
    const average = volumeLevels.reduce((a, b) => a + b, 0) / volumeLevels.length;
    const peak = Math.max(...volumeLevels);
    const variance = volumeLevels.reduce((sum, vol) => sum + Math.pow(vol - average, 2), 0) / volumeLevels.length;
    const dynamic = Math.sqrt(variance);
    
    return { average, peak, dynamic, levels: volumeLevels };
  }

  /**
   * Simple frequency analysis
   */
  private analyzeFrequency(audioBuffer: AudioBuffer) {
    // Simplified frequency analysis - in a real implementation you'd use FFT
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // Basic heuristics for music/speech detection
    let highFreqEnergy = 0;
    let midFreqEnergy = 0;
    let lowFreqEnergy = 0;
    
    // Simplified analysis by examining amplitude patterns
    const windowSize = 1024;
    const windows = Math.floor(channelData.length / windowSize);
    
    for (let i = 0; i < windows; i++) {
      const start = i * windowSize;
      const window = channelData.slice(start, start + windowSize);
      
      // Simple energy calculation in different "frequency" bands
      // This is a rough approximation
      lowFreqEnergy += this.calculateEnergy(window.slice(0, windowSize / 4));
      midFreqEnergy += this.calculateEnergy(window.slice(windowSize / 4, windowSize * 3 / 4));
      highFreqEnergy += this.calculateEnergy(window.slice(windowSize * 3 / 4));
    }
    
    const totalEnergy = lowFreqEnergy + midFreqEnergy + highFreqEnergy;
    
    if (totalEnergy === 0) {
      return { hasMusic: false, musicIntensity: 0, speechCoverage: 0, tempo: undefined };
    }
    
    const midRatio = midFreqEnergy / totalEnergy;
    const highRatio = highFreqEnergy / totalEnergy;
    
    // Heuristics: speech has more mid-frequency energy, music more spread out
    const speechCoverage = midRatio > 0.4 ? Math.min(1, midRatio * 1.5) : 0.2;
    const hasMusic = highRatio > 0.2 && lowFreqEnergy > midFreqEnergy * 0.5;
    const musicIntensity = hasMusic ? Math.min(1, (highRatio + lowFreqEnergy / totalEnergy)) : 0;
    
    return {
      hasMusic,
      musicIntensity,
      speechCoverage,
      tempo: undefined // Tempo detection is complex, skip for now
    };
  }

  private calculateEnergy(samples: Float32Array): number {
    return samples.reduce((sum, sample) => sum + sample * sample, 0);
  }

  /**
   * Detect emotional peaks in audio
   */
  private detectEmotionalPeaks(volumeData: { levels: number[], average: number }, duration: number): number[] {
    const peaks: number[] = [];
    const threshold = volumeData.average * 2;
    const timePerLevel = duration / volumeData.levels.length;
    
    for (let i = 1; i < volumeData.levels.length - 1; i++) {
      const prev = volumeData.levels[i - 1];
      const current = volumeData.levels[i];
      const next = volumeData.levels[i + 1];
      
      // Peak detection: current > neighbors and above threshold
      if (current > prev && current > next && current > threshold) {
        peaks.push(i * timePerLevel);
      }
    }
    
    return peaks;
  }

  /**
   * Detect scene changes using frame comparison
   */
  private async detectSceneChanges(
    frames: { timestamp: number; imageData: string }[],
    signal?: AbortSignal
  ): Promise<number[]> {
    const sceneChanges: number[] = [];
    
    for (let i = 1; i < frames.length; i++) {
      if (signal?.aborted) throw new Error('Analysis cancelled');
      
      const similarity = await this.compareFrames(frames[i - 1].imageData, frames[i].imageData);
      
      // If similarity is low, it's likely a scene change
      if (similarity < 0.7) {
        sceneChanges.push(frames[i].timestamp);
      }
    }
    
    return sceneChanges;
  }

  /**
   * Compare two frames for similarity
   */
  private async compareFrames(imageData1: string, imageData2: string): Promise<number> {
    // This is a simplified comparison - in practice you'd use more sophisticated algorithms
    // For now, we'll do a basic pixel comparison
    
    const canvas1 = document.createElement('canvas');
    const canvas2 = document.createElement('canvas');
    const ctx1 = canvas1.getContext('2d')!;
    const ctx2 = canvas2.getContext('2d')!;
    
    const img1 = new Image();
    const img2 = new Image();
    
    await Promise.all([
      new Promise<void>(resolve => { img1.onload = () => resolve(); img1.src = imageData1; }),
      new Promise<void>(resolve => { img2.onload = () => resolve(); img2.src = imageData2; })
    ]);
    
    // Resize to small size for quick comparison
    const size = 64;
    canvas1.width = canvas2.width = size;
    canvas1.height = canvas2.height = size;
    
    ctx1.drawImage(img1, 0, 0, size, size);
    ctx2.drawImage(img2, 0, 0, size, size);
    
    const data1 = ctx1.getImageData(0, 0, size, size).data;
    const data2 = ctx2.getImageData(0, 0, size, size).data;
    
    let diff = 0;
    for (let i = 0; i < data1.length; i += 4) {
      const r1 = data1[i], g1 = data1[i + 1], b1 = data1[i + 2];
      const r2 = data2[i], g2 = data2[i + 1], b2 = data2[i + 2];
      
      diff += Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
    }
    
    const maxDiff = data1.length * 255 * 3 / 4; // Max possible difference
    return 1 - (diff / maxDiff); // Return similarity (0-1)
  }

  /**
   * Extract silent segments from audio analysis
   */
  private detectSilentSegments(audioAnalysis: AudioAnalysis, duration: number): { start: number; end: number }[] {
    // This would typically be done during audio analysis
    // For now, return empty array - could be enhanced based on volume levels
    return [];
  }

  /**
   * Generate thumbnail for a specific time in video
   */
  async generateThumbnail(
    file: File,
    timestamp: number,
    width: number = 320,
    height: number = 180
  ): Promise<string> {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'metadata';
    
    const videoUrl = URL.createObjectURL(file);
    
    try {
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Failed to load video'));
        video.src = videoUrl;
      });

      // Seek to timestamp
      await new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error('Seek failed'));
        video.currentTime = timestamp;
      });

      // Create canvas and draw frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(video, 0, 0, width, height);
      
      return canvas.toDataURL('image/jpeg', 0.8);
      
    } finally {
      URL.revokeObjectURL(videoUrl);
    }
  }
}

export const instantVideoService = InstantVideoService.getInstance(); 