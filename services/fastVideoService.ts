import { VideoClip, ClipGenerationOptions, ClipGenerationStatus } from '../types';
import { ffmpegService } from './ffmpegService';

/**
 * Fast Video Processing Service using WebCodecs API
 * Falls back to FFmpeg.wasm when WebCodecs is not available
 */
class FastVideoService {
  private supportsWebCodecs: boolean;
  private processingQueue: Map<string, Promise<VideoClip>> = new Map();

  constructor() {
    this.supportsWebCodecs = this.checkWebCodecsSupport();
    console.log(`🚀 Fast Video Service initialized - WebCodecs: ${this.supportsWebCodecs ? '✅' : '❌'}`);
  }

  /**
   * Check if WebCodecs API is supported
   */
  private checkWebCodecsSupport(): boolean {
    return typeof VideoDecoder !== 'undefined' && 
           typeof VideoEncoder !== 'undefined' &&
           typeof VideoFrame !== 'undefined';
  }

  /**
   * Generate video clip using the fastest available method
   */
  async generateClip(
    inputFile: File,
    startTime: number,
    endTime: number,
    options: ClipGenerationOptions,
    cropCoords?: { x: number; y: number; width: number; height: number },
    onProgress?: (progress: number) => void
  ): Promise<VideoClip> {
    const clipId = `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if this exact clip is already being processed
    const processingKey = `${inputFile.name}_${startTime}_${endTime}_${JSON.stringify(options)}`;
    if (this.processingQueue.has(processingKey)) {
      return this.processingQueue.get(processingKey)!;
    }

    // Choose processing method based on availability and file size
    const useWebCodecs = this.supportsWebCodecs && inputFile.size < 500 * 1024 * 1024; // Use WebCodecs for files < 500MB
    
    const clipPromise = useWebCodecs 
      ? this.generateClipWithWebCodecs(inputFile, startTime, endTime, options, clipId, cropCoords, onProgress)
              : this.generateClipWithFFmpeg(inputFile, startTime, endTime, options, cropCoords, onProgress);

    this.processingQueue.set(processingKey, clipPromise);
    
    try {
      const result = await clipPromise;
      this.processingQueue.delete(processingKey);
      return result;
    } catch (error) {
      this.processingQueue.delete(processingKey);
      
      // If WebCodecs failed, try FFmpeg as fallback
      if (useWebCodecs && error instanceof Error && !error.message.includes('cancelled')) {
        console.warn('🔄 WebCodecs failed, falling back to FFmpeg:', error.message);
        return this.generateClipWithFFmpeg(inputFile, startTime, endTime, options, cropCoords, onProgress);
      }
      
      throw error;
    }
  }

  /**
   * Generate clip using WebCodecs API (fastest method)
   */
  private async generateClipWithWebCodecs(
    inputFile: File,
    startTime: number,
    endTime: number,
    options: ClipGenerationOptions,
    clipId: string,
    cropCoords?: { x: number; y: number; width: number; height: number },
    onProgress?: (progress: number) => void
  ): Promise<VideoClip> {
    console.log('🚀 Using WebCodecs for ultra-fast processing...');
    onProgress?.(5);

    const video = document.createElement('video');
    video.src = URL.createObjectURL(inputFile);
    video.muted = true;

    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
    });

    onProgress?.(15);

    // Set up video dimensions
    const sourceWidth = video.videoWidth;
    const sourceHeight = video.videoHeight;
    const duration = endTime - startTime;

    // Calculate output dimensions
    const { width, height } = this.calculateOutputDimensions(
      sourceWidth, 
      sourceHeight, 
      options.aspectRatio, 
      cropCoords
    );

    onProgress?.(25);

    // Configure encoder settings based on quality
    const encoderConfig = this.getEncoderConfig(width, height, options.quality);

    const chunks: Uint8Array[] = [];
    let encoder: VideoEncoder;

    try {
      // Create encoder
      encoder = new VideoEncoder({
        output: (chunk) => {
          const chunkData = new Uint8Array(chunk.byteLength);
          chunk.copyTo(chunkData);
          chunks.push(chunkData);
        },
        error: (error) => {
          console.error('❌ WebCodecs encoder error:', error);
          throw error;
        }
      });

      encoder.configure(encoderConfig);
      onProgress?.(35);

      // Process video frames
      const frameRate = 30; // Target frame rate
      const totalFrames = Math.ceil(duration * frameRate);
      let processedFrames = 0;

      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        const currentTime = startTime + (frameIndex / frameRate);
        
        // Seek to frame
        video.currentTime = currentTime;
        await new Promise(resolve => {
          video.onseeked = resolve;
        });

        // Create canvas for frame processing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        // Apply cropping if needed
        if (cropCoords) {
          ctx.drawImage(
            video,
            cropCoords.x, cropCoords.y, cropCoords.width, cropCoords.height,
            0, 0, width, height
          );
        } else {
          ctx.drawImage(video, 0, 0, width, height);
        }

        // Create VideoFrame from canvas
        const frame = new VideoFrame(canvas, {
          timestamp: frameIndex * (1000000 / frameRate), // microseconds
          duration: 1000000 / frameRate
        });

        // Encode frame
        encoder.encode(frame, { keyFrame: frameIndex % 30 === 0 });
        frame.close();

        processedFrames++;
        const progress = 35 + (processedFrames / totalFrames) * 55; // 35-90%
        onProgress?.(progress);
      }

      // Finalize encoding
      await encoder.flush();
      encoder.close();
      onProgress?.(95);

      // Combine chunks into blob
      const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const combined = new Uint8Array(totalSize);
      let offset = 0;
      
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      const blob = new Blob([combined], { type: `video/${options.format}` });
      onProgress?.(100);

      console.log(`✅ WebCodecs processing completed in record time! Size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);

      return {
        id: clipId,
        blob,
        format: options.format,
        quality: options.quality,
        aspectRatio: options.aspectRatio,
        size: blob.size,
        duration,
        status: 'completed' as ClipGenerationStatus
      };

    } catch (error) {
      console.error('❌ WebCodecs processing failed:', error);
      throw new Error(`WebCodecs processing failed: ${error}`);
    } finally {
      URL.revokeObjectURL(video.src);
    }
  }

  /**
   * Generate clip using FFmpeg.wasm (fallback method)
   */
  private async generateClipWithFFmpeg(
    inputFile: File,
    startTime: number,
    endTime: number,
    options: ClipGenerationOptions,
    cropCoords?: { x: number; y: number; width: number; height: number },
    onProgress?: (progress: number) => void
  ): Promise<VideoClip> {
    console.log('🔧 Using FFmpeg.wasm for processing...');
    return ffmpegService.generateClip(
      inputFile,
      startTime,
      endTime,
      options,
      cropCoords,
      onProgress
    );
  }

  /**
   * Calculate optimal output dimensions
   */
  private calculateOutputDimensions(
    sourceWidth: number,
    sourceHeight: number,
    aspectRatio: string,
    cropCoords?: { x: number; y: number; width: number; height: number }
  ): { width: number; height: number } {
    if (cropCoords) {
      return { width: cropCoords.width, height: cropCoords.height };
    }

    switch (aspectRatio) {
      case '16:9':
        return { width: 1280, height: 720 };
      case '9:16':
        return { width: 720, height: 1280 };
      case '1:1':
        return { width: 720, height: 720 };
      default:
        // Keep original aspect ratio but limit size for performance
        const maxDimension = 1280;
        const scale = Math.min(maxDimension / sourceWidth, maxDimension / sourceHeight);
        return {
          width: Math.round(sourceWidth * scale),
          height: Math.round(sourceHeight * scale)
        };
    }
  }

  /**
   * Get encoder configuration based on quality setting
   */
  private getEncoderConfig(width: number, height: number, quality: string): VideoEncoderConfig {
    const baseConfig: VideoEncoderConfig = {
      codec: 'avc1.42E01E', // H.264 baseline profile
      width,
      height,
      framerate: 30,
    };

    switch (quality) {
      case 'high':
        return {
          ...baseConfig,
          bitrate: Math.min(width * height * 0.2, 8000000), // Max 8Mbps
          bitrateMode: 'variable' as VideoEncoderBitrateMode
        };
      case 'medium':
        return {
          ...baseConfig,
          bitrate: Math.min(width * height * 0.1, 4000000), // Max 4Mbps
          bitrateMode: 'variable' as VideoEncoderBitrateMode
        };
      case 'low':
        return {
          ...baseConfig,
          bitrate: Math.min(width * height * 0.05, 2000000), // Max 2Mbps
          bitrateMode: 'constant' as VideoEncoderBitrateMode
        };
      default:
        return {
          ...baseConfig,
          bitrate: Math.min(width * height * 0.1, 4000000),
          bitrateMode: 'variable' as VideoEncoderBitrateMode
        };
    }
  }

  /**
   * Generate multiple clips with intelligent processing
   */
  async generateMultipleClips(
    inputFile: File,
    clips: Array<{
      id: string;
      startTime: number;
      endTime: number;
      options: ClipGenerationOptions;
      cropCoords?: { x: number; y: number; width: number; height: number };
    }>,
    onProgress?: (overallProgress: number, currentClip: string) => void
  ): Promise<Record<string, VideoClip>> {
    const results: Record<string, VideoClip> = {};
    
    // Sort clips by duration for better perceived performance
    const sortedClips = [...clips].sort((a, b) => 
      (a.endTime - a.startTime) - (b.endTime - b.startTime)
    );

    // Process shorter clips with WebCodecs, longer ones with FFmpeg
    const webCodecsClips = sortedClips.filter(clip => 
      this.supportsWebCodecs && (clip.endTime - clip.startTime) <= 30
    );
    const ffmpegClips = sortedClips.filter(clip => 
      !this.supportsWebCodecs || (clip.endTime - clip.startTime) > 30
    );

    console.log(`📊 Processing plan: ${webCodecsClips.length} with WebCodecs, ${ffmpegClips.length} with FFmpeg`);

    let completedClips = 0;
    const totalClips = clips.length;

    // Process WebCodecs clips first (faster)
    for (const clip of webCodecsClips) {
      try {
        onProgress?.((completedClips / totalClips) * 100, clip.id);
        
        const videoClip = await this.generateClip(
          inputFile,
          clip.startTime,
          clip.endTime,
          clip.options,
          clip.cropCoords,
          (clipProgress) => {
            const totalProgress = (completedClips / totalClips) * 100 + (clipProgress / totalClips);
            onProgress?.(totalProgress, clip.id);
          }
        );
        
        results[clip.id] = videoClip;
        completedClips++;
        
      } catch (error) {
        console.error(`Failed to generate clip ${clip.id}:`, error);
        results[clip.id] = {
          id: clip.id,
          format: clip.options.format,
          quality: clip.options.quality,
          aspectRatio: clip.options.aspectRatio,
          size: 0,
          duration: clip.endTime - clip.startTime,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        completedClips++;
      }
    }

    // Process FFmpeg clips
    for (const clip of ffmpegClips) {
      try {
        onProgress?.((completedClips / totalClips) * 100, clip.id);
        
        const videoClip = await this.generateClip(
          inputFile,
          clip.startTime,
          clip.endTime,
          clip.options,
          clip.cropCoords,
          (clipProgress) => {
            const totalProgress = (completedClips / totalClips) * 100 + (clipProgress / totalClips);
            onProgress?.(totalProgress, clip.id);
          }
        );
        
        results[clip.id] = videoClip;
        completedClips++;
        
      } catch (error) {
        console.error(`Failed to generate clip ${clip.id}:`, error);
        results[clip.id] = {
          id: clip.id,
          format: clip.options.format,
          quality: clip.options.quality,
          aspectRatio: clip.options.aspectRatio,
          size: 0,
          duration: clip.endTime - clip.startTime,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        completedClips++;
      }
    }

    onProgress?.(100, 'completed');
    return results;
  }

  /**
   * Get service capabilities and performance info
   */
  getCapabilities(): {
    webCodecsSupported: boolean;
    ffmpegSupported: boolean;
    recommendedMethod: 'webcodecs' | 'ffmpeg';
    estimatedSpeedImprovement: string;
  } {
    const ffmpegSupported = typeof SharedArrayBuffer !== 'undefined';
    
    return {
      webCodecsSupported: this.supportsWebCodecs,
      ffmpegSupported,
      recommendedMethod: this.supportsWebCodecs ? 'webcodecs' : 'ffmpeg',
      estimatedSpeedImprovement: this.supportsWebCodecs ? '5-10x faster' : 'Standard speed'
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.processingQueue.clear();
    console.log('🧹 Fast Video Service cleanup completed');
  }
}

// Singleton instance
export const fastVideoService = new FastVideoService(); 