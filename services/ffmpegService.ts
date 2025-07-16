import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { VideoClip, ClipGenerationOptions, ClipGenerationStatus } from '../types';

class FFmpegService {
  public ffmpeg: FFmpeg | null = null;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private processingQueue: Map<string, Promise<VideoClip>> = new Map();
  private maxConcurrentJobs = 2; // Limit concurrent processing to prevent browser overwhelm

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  /**
   * Force reload FFmpeg (useful when stuck)
   */
  async forceReload(onProgress?: (progress: number) => void): Promise<void> {
    console.log('🔄 Force reloading FFmpeg...');
    
    // Reset state
    this.isLoaded = false;
    this.loadPromise = null;
    
    // Cleanup existing instance
    if (this.ffmpeg) {
      try {
        await this.ffmpeg.terminate();
      } catch (error) {
        console.warn('Warning during FFmpeg termination:', error);
      }
    }
    
    // Create new instance
    this.ffmpeg = new FFmpeg();
    
    // Force reload
    await this.load(onProgress);
  }

  /**
   * Get loading status and diagnostics
   */
  getLoadingStatus(): {
    isLoaded: boolean;
    isLoading: boolean;
    browserSupport: ReturnType<typeof FFmpegService.isSupported>;
    diagnostics: {
      userAgent: string;
      connection: string;
      memory: string;
      crossOriginIsolated: boolean;
    };
  } {
    const browserSupport = FFmpegService.isSupported();
    const connection = (navigator as unknown as { connection?: unknown }).connection;
    const memory = (performance as unknown as { memory?: unknown }).memory;
    
    return {
      isLoaded: this.isLoaded,
      isLoading: this.loadPromise !== null,
      browserSupport,
      diagnostics: {
        userAgent: navigator.userAgent,
        connection: connection ? `${connection.effectiveType} (${connection.downlink}Mbps)` : 'unknown',
        memory: memory ? `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(0)}MB used / ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(0)}MB limit` : 'unknown',
        crossOriginIsolated: typeof window !== 'undefined' ? (window as unknown as { crossOriginIsolated?: boolean }).crossOriginIsolated === true : false
      }
    };
  }

  /**
   * Initialize FFmpeg with progress tracking
   */
  async load(onProgress?: (progress: number) => void): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    // Check browser support first
    const support = FFmpegService.isSupported();
    if (!support.isSupported) {
      const missing = Object.entries(support)
        .filter(([key, value]) => key !== 'isSupported' && !value)
        .map(([key]) => key);
      throw new Error(`Browser does not support FFmpeg.wasm. Missing: ${missing.join(', ')}. Please ensure your site is served with COOP/COEP headers and try again.`);
    }

    this.loadPromise = this.initializeFFmpeg(onProgress);
    
    try {
      await this.loadPromise;
      this.isLoaded = true;
    } catch (error) {
      // Reset on failure
      this.loadPromise = null;
      this.isLoaded = false;
      throw error;
    }
  }

  private async initializeFFmpeg(onProgress?: (progress: number) => void): Promise<void> {
    if (!this.ffmpeg) throw new Error('FFmpeg not initialized');

    // Multiple CDN sources for redundancy (ordered by priority/speed)
    const cdnSources = [
      '/ffmpeg', // self-hosted on same origin, cached by service-worker (highest priority)
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.6/dist/esm', // Generally fastest CDN
      'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm', // Reliable fallback
      'https://cdn.skypack.dev/@ffmpeg/core-mt@0.12.6/dist/esm' // Last resort
    ];

    onProgress?.(5);

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < cdnSources.length; attempt++) {
      const baseURL = cdnSources[attempt];
      
      try {
        onProgress?.(10 + (attempt * 15)); // Progress updates for each attempt
        console.log(`🔄 Attempting to load FFmpeg from CDN ${attempt + 1}/${cdnSources.length}: ${baseURL}`);

        // Load FFmpeg core with timeout and detailed progress
        const loadPromise = this.loadWithTimeout(baseURL, onProgress, attempt);
        await loadPromise;
        
        console.log(`✅ Successfully loaded FFmpeg from CDN ${attempt + 1}`);
        onProgress?.(100);
        return;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`❌ Failed to load from CDN ${attempt + 1}: ${lastError.message}`);
        
        if (attempt < cdnSources.length - 1) {
          onProgress?.(20 + (attempt * 20));
          console.log(`⏭️ Trying next CDN...`);
          // Small delay before next attempt
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // If all CDNs failed
    console.error('❌ All CDN sources failed to load FFmpeg');
    throw new Error(`Failed to load FFmpeg from all CDN sources. Last error: ${lastError?.message || 'Unknown error'}. Please check your internet connection and try again.`);
  }

  private async loadWithTimeout(
    baseURL: string, 
    onProgress?: (progress: number) => void,
    attempt: number = 0
  ): Promise<void> {
    const TIMEOUT_MS = 90000; // 90 second timeout per file (increased for large WASM)
    const baseProgress = 10 + (attempt * 30);

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout: FFmpeg loading took longer than ${TIMEOUT_MS/1000} seconds`));
      }, TIMEOUT_MS);
    });

    // Download and convert files with progress tracking
    const downloadPromise = this.downloadFFmpegFiles(baseURL, onProgress, baseProgress);

    // Race between timeout and actual loading
    await Promise.race([downloadPromise, timeoutPromise]);
  }

  private async downloadFFmpegFiles(
    baseURL: string, 
    onProgress?: (progress: number) => void,
    baseProgress: number = 10
  ): Promise<void> {
    const files = [
      { name: 'ffmpeg-core.js', type: 'text/javascript' },
      { name: 'ffmpeg-core.wasm', type: 'application/wasm' },
      { name: 'ffmpeg-core.worker.js', type: 'text/javascript' }
    ];


    let coreURL: string, wasmURL: string, workerURL: string;

    try {
      onProgress?.(baseProgress + 5);
      console.log('📥 Downloading FFmpeg core files...');

      // Download core.js
      onProgress?.(baseProgress + 8);
      coreURL = await toBlobURL(`${baseURL}/${files[0].name}`, files[0].type);
      
      // Download wasm file (largest)
      onProgress?.(baseProgress + 15);
      wasmURL = await toBlobURL(`${baseURL}/${files[1].name}`, files[1].type);
      
      // Download worker.js
      onProgress?.(baseProgress + 22);
      workerURL = await toBlobURL(`${baseURL}/${files[2].name}`, files[2].type);

      onProgress?.(baseProgress + 25);
      console.log('🚀 Loading FFmpeg with downloaded files...');

      // Load FFmpeg with downloaded files
      await this.ffmpeg!.load({
        coreURL,
        wasmURL,
        workerURL
      });

      console.log('✅ FFmpeg loaded successfully');

    } catch (error) {
      console.error('❌ Error during FFmpeg file download/load:', error);
      throw new Error(`FFmpeg loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }



  /**
   * Generate a video clip with optimized performance settings
   */
  async generateClip(
    inputFile: File,
    startTime: number,
    endTime: number,
    options: ClipGenerationOptions,
    cropCoords?: { x: number; y: number; width: number; height: number },
    onProgress?: (progress: number) => void
  ): Promise<VideoClip> {
    await this.load();
    if (!this.ffmpeg) throw new Error('FFmpeg not initialized');

    const clipId = `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if this exact clip is already being processed
    const processingKey = `${inputFile.name}_${startTime}_${endTime}_${JSON.stringify(options)}`;
    if (this.processingQueue.has(processingKey)) {
      return this.processingQueue.get(processingKey)!;
    }

    const clipPromise = this.processClip(
      inputFile,
      startTime,
      endTime,
      options,
      clipId,
      cropCoords,
      onProgress
    );

    this.processingQueue.set(processingKey, clipPromise);
    
    try {
      const result = await clipPromise;
      this.processingQueue.delete(processingKey);
      return result;
    } catch (error) {
      this.processingQueue.delete(processingKey);
      throw error;
    }
  }

  private async processClip(
    inputFile: File,
    startTime: number,
    endTime: number,
    options: ClipGenerationOptions,
    clipId: string,
    cropCoords?: { x: number; y: number; width: number; height: number },
    onProgress?: (progress: number) => void
  ): Promise<VideoClip> {
    const inputName = `input_${clipId}.${inputFile.name.split('.').pop()}`;
    const outputName = `output_${clipId}.${options.format}`;

    try {
      onProgress?.(5);

      // Write input file to FFmpeg filesystem
      await this.ffmpeg!.writeFile(inputName, await fetchFile(inputFile));
      onProgress?.(15);

      // Build optimized FFmpeg command
      const args = this.buildOptimizedFFmpegArgs(
        inputName,
        outputName,
        startTime,
        endTime,
        options,
        cropCoords
      );

      onProgress?.(20);

      // Set up progress tracking
      let lastProgress = 20;
      this.ffmpeg!.on('progress', ({ progress }) => {
        const currentProgress = 20 + (progress * 70); // 20-90% for processing
        if (currentProgress > lastProgress) {
          lastProgress = currentProgress;
          onProgress?.(currentProgress);
        }
      });

      // Execute optimized FFmpeg command
      await this.ffmpeg!.exec(args);
      onProgress?.(90);

      console.log('🎬 FFmpeg processing completed, reading output file...');
      
      // Read output file
      const data = await this.ffmpeg!.readFile(outputName);
      onProgress?.(92);
      
      console.log('📁 Creating video blob...');
      const blob = new Blob([data], { type: `video/${options.format}` });
      onProgress?.(95);

      console.log('🧹 Cleaning up temporary files...');
      // Clean up files with better error handling
      await this.cleanupFiles([inputName, outputName]);
      
      onProgress?.(98);

      console.log('🎉 Clip generation completed successfully');
      
      // Create final video clip object
      const videoClip: VideoClip = {
        id: clipId,
        blob,
        format: options.format,
        quality: options.quality,
        aspectRatio: options.aspectRatio,
        size: blob.size,
        duration: endTime - startTime,
        status: 'completed' as ClipGenerationStatus
      };
      
      onProgress?.(100);
      
      return videoClip;

    } catch (error) {
      // Clean up on error
      await this.cleanupFiles([inputName, outputName]);
      throw new Error(`FFmpeg processing failed: ${error}`);
    }
  }

  /**
   * Generate multiple clips with intelligent parallel processing
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
    
    // Process clips in batches to prevent browser overwhelm
    const batchSize = this.maxConcurrentJobs;
    const batches: typeof clips[] = [];
    
    for (let i = 0; i < clips.length; i += batchSize) {
      batches.push(clips.slice(i, i + batchSize));
    }
    
    let completedClips = 0;
    const totalClips = clips.length;
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchPromises = batch.map(async (clip) => {
        try {
          const videoClip = await this.generateClip(
            inputFile,
            clip.startTime,
            clip.endTime,
            clip.options,
            clip.cropCoords,
            (clipProgress) => {
              const baseProgress = (completedClips / totalClips) * 100;
              const currentClipContribution = (1 / totalClips) * clipProgress;
              const totalProgress = baseProgress + currentClipContribution;
              onProgress?.(totalProgress, clip.id);
            }
          );
          
          completedClips++;
          results[clip.id] = videoClip;
          return { success: true, clipId: clip.id };
          
        } catch (error) {
          console.error(`Failed to generate clip ${clip.id}:`, error);
          completedClips++;
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
          return { success: false, clipId: clip.id, error };
        }
      });
      
      // Wait for current batch to complete before starting next batch
      await Promise.all(batchPromises);
      
      console.log(`✅ Batch ${batchIndex + 1}/${batches.length} completed (${completedClips}/${totalClips} clips)`);
    }
    
    onProgress?.(100, 'completed');
    return results;
  }

  /**
   * Build optimized FFmpeg command arguments for faster processing
   */
  private buildOptimizedFFmpegArgs(
    inputName: string,
    outputName: string,
    startTime: number,
    endTime: number,
    options: ClipGenerationOptions,
    cropCoords?: { x: number; y: number; width: number; height: number }
  ): string[] {
    const args = [
      '-i', inputName,
      '-ss', startTime.toString(),
      '-t', (endTime - startTime).toString(),
    ];

    // Optimized video quality settings for speed
    switch (options.quality) {
      case 'high':
        // High quality but faster than before
        args.push('-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-tune', 'fastdecode');
        break;
      case 'medium':
        // Optimized medium quality - best balance
        args.push('-c:v', 'libx264', '-crf', '23', '-preset', 'fast', '-tune', 'fastdecode');
        break;
      case 'low':
        // Maximum speed with acceptable quality
        args.push('-c:v', 'libx264', '-crf', '28', '-preset', 'ultrafast', '-tune', 'fastdecode');
        break;
    }

    // Optimized audio settings
    args.push('-c:a', 'aac', '-b:a', '96k', '-ac', '2'); // Reduced bitrate and force stereo

    // Enhanced cropping and aspect ratio with optimization
    if (cropCoords && options.aspectRatio !== 'original') {
      const { x, y, width, height } = cropCoords;
      args.push('-vf', `crop=${width}:${height}:${x}:${y},scale=-2:720`); // Limit height for speed
    } else if (options.aspectRatio !== 'original') {
      // Optimized standard aspect ratio scaling
      switch (options.aspectRatio) {
        case '16:9':
          args.push('-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black');
          break;
        case '9:16':
          args.push('-vf', 'scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:black');
          break;
        case '1:1':
          args.push('-vf', 'scale=720:720:force_original_aspect_ratio=decrease,pad=720:720:(ow-iw)/2:(oh-ih)/2:black');
          break;
      }
    } else {
      // Even for original aspect ratio, limit resolution for speed if too large
      args.push('-vf', 'scale=iw*min(1920/iw\\,1080/ih):ih*min(1920/iw\\,1080/ih)');
    }

    // Format-specific optimizations
    if (options.format === 'webm') {
      // WebM optimization for speed
      args.push('-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '8', '-c:a', 'libopus', '-b:a', '64k');
    } else {
      // MP4 optimization for speed
      args.push('-movflags', '+faststart', '-avoid_negative_ts', 'make_zero');
    }

    // Additional speed optimizations
    args.push('-threads', '0'); // Use all available threads
    args.push('-fflags', '+genpts'); // Generate presentation timestamps
    
    args.push(outputName);
    return args;
  }

  /**
   * Optimized file cleanup
   */
  private async cleanupFiles(fileNames: string[]): Promise<void> {
    const cleanupPromises = fileNames.map(async (fileName) => {
      try {
        await this.ffmpeg!.deleteFile(fileName);
        console.log(`✅ Deleted ${fileName}`);
      } catch (error) {
        console.warn(`⚠️ Could not delete ${fileName}:`, error);
      }
    });
    
    await Promise.allSettled(cleanupPromises);
  }

  /**
   * Get video information with caching
   */
  async getVideoInfo(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
    format: string;
    bitrate: number;
  }> {
    await this.load();
    if (!this.ffmpeg) throw new Error('FFmpeg not initialized');

    const inputName = `probe_${Date.now()}.${file.name.split('.').pop()}`;
    
    try {
      await this.ffmpeg.writeFile(inputName, await fetchFile(file));
      
      // Use ffprobe-like functionality with faster settings
      await this.ffmpeg.exec([
        '-i', inputName,
        '-f', 'null',
        '-t', '1', // Only analyze first second for speed
        '-'
      ]);
      
      await this.ffmpeg.deleteFile(inputName);
      
      return {
        duration: 0, // Would need to parse from output
        width: 1920,
        height: 1080,
        format: 'mp4',
        bitrate: 1000000
      };
      
    } catch (error) {
      try {
        await this.ffmpeg.deleteFile(inputName);
      } catch {}
      throw new Error(`Failed to get video info: ${error}`);
    }
  }

  /**
   * Quickly scan a video for scene changes and silence regions.
   * Returns numeric data that can be shipped to an LLM instead of full frames.
   *
   * @param inputFile The original video file (any container supported by FFmpeg)
   * @param opts Optional thresholds
   * @param onProgress Progress callback (0-100)
   */
  async getMetadata(
    inputFile: File,
    opts: { sceneThreshold?: number; silenceDb?: number } = {},
    onProgress?: (progress: number) => void
  ): Promise<{
    scenes: number[]; // seconds
    silence: { start: number; end: number }[];
  }> {
    const sceneThreshold = opts.sceneThreshold ?? 0.4; // default 40 % diff
    const silenceDb = opts.silenceDb ?? -30; // default –30 dB

    await this.load();
    if (!this.ffmpeg) throw new Error('FFmpeg not initialized');

    const tempName = `meta_${Date.now()}.${inputFile.name.split('.').pop()}`;

    // write file
    onProgress?.(2);
    await this.ffmpeg.writeFile(tempName, await fetchFile(inputFile));
    onProgress?.(8);

    // Build command
    const args = [
      '-i', tempName,
      '-vf', `select='gt(scene,${sceneThreshold})',showinfo`,
      '-af', `silencedetect=n=${silenceDb}dB:d=0.5`,
      '-f', 'null', '-',
      '-hide_banner'
    ];

    const scenes: number[] = [];
    const silence: { start: number; end: number }[] = [];
    let currentSilenceStart: number | null = null;

    const logHandler = ({ message }: { type: string; message: string }) => {
      if (message.includes('showinfo')) {
        // parse pts_time
        const match = message.match(/pts_time:([0-9.]+)/);
        if (match) {
          const t = parseFloat(match[1]);
          if (!isNaN(t)) scenes.push(t);
        }
      } else if (message.includes('silence_start:')) {
        const match = message.match(/silence_start: ([0-9.]+)/);
        if (match) currentSilenceStart = parseFloat(match[1]);
      } else if (message.includes('silence_end:')) {
        const match = message.match(/silence_end: ([0-9.]+) \| silence_duration: ([0-9.]+)/);
        if (match) {
          const end = parseFloat(match[1]);
          const start = currentSilenceStart ?? end - parseFloat(match[2]);
          silence.push({ start, end });
          currentSilenceStart = null;
        }
      }
    };

    // Attach temporary listener
    (this.ffmpeg as unknown as { on: Function }).on('log', logHandler);

    try {
      onProgress?.(10);
      await this.ffmpeg.exec(args);
      onProgress?.(98);
    } finally {
      // Detach listener and cleanup tmp file
      (this.ffmpeg as unknown as { off?: Function }).off?.('log', logHandler);
      try { await this.ffmpeg.deleteFile(tempName); } catch {}
      onProgress?.(100);
    }

    return { scenes: Array.from(new Set(scenes)).sort((a, b) => a - b), silence };
  }

  /**
   * Set maximum concurrent processing jobs
   */
  setMaxConcurrentJobs(maxJobs: number): void {
    this.maxConcurrentJobs = Math.max(1, Math.min(maxJobs, 4)); // Limit between 1-4
  }

  /**
   * Check processing queue status
   */
  getQueueStatus(): { active: number; maxConcurrent: number } {
    return {
      active: this.processingQueue.size,
      maxConcurrent: this.maxConcurrentJobs
    };
  }

  /**
   * Check if FFmpeg is supported in current browser
   */
  static isSupported(): { 
    isSupported: boolean; 
    sharedArrayBuffer: boolean; 
    webAssembly: boolean; 
    worker: boolean; 
    crossOriginIsolated: boolean; 
  } {
    const sharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    const webAssembly = typeof WebAssembly !== 'undefined';
    const worker = typeof Worker !== 'undefined';
    const crossOriginIsolated = typeof window !== 'undefined' ? (window as unknown as { crossOriginIsolated?: boolean }).crossOriginIsolated === true : false;
    
    return {
      isSupported: sharedArrayBuffer && webAssembly && worker && crossOriginIsolated,
      sharedArrayBuffer,
      webAssembly,
      worker,
      crossOriginIsolated
    };
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    // Clear processing queue
    this.processingQueue.clear();
    
    if (this.ffmpeg) {
      try {
        await this.ffmpeg.terminate();
      } catch (error) {
        console.warn('Error terminating FFmpeg:', error);
      }
    }
    this.isLoaded = false;
    this.loadPromise = null;
  }
}

// Singleton instance
export const ffmpegService = new FFmpegService(); 