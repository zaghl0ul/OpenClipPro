import { AudioAnalysis } from '../types';

/**
 * Analyzes audio characteristics from a video file
 * @param file The video file to analyze
 * @param duration Video duration in seconds
 * @returns Audio analysis data
 */
export const analyzeAudio = async (
  file: File,
  duration: number,
  onProgress?: (message: string) => void
): Promise<AudioAnalysis> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    let audioContext: AudioContext | null = null;
    let isCancelled = false;
    
    video.preload = 'metadata';
    video.muted = false; // Need audio for analysis
    
    const cleanup = () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
      if (video.src) {
        URL.revokeObjectURL(video.src);
      }
    };
    
    video.onloadedmetadata = async () => {
      try {
        onProgress?.(`🎵 Initializing audio analysis...`);
        
        // Create audio source from video
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaElementSource(video);
        const analyser = audioContext.createAnalyser();
        
        // Configure analyser for detailed analysis
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
        
        source.connect(analyser);
        // Don't connect to destination to avoid playback
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const timeDataArray = new Uint8Array(bufferLength);
        
        // Analysis data collectors
        const volumeData: number[] = [];
        const frequencyData: number[][] = [];
        const speechIndicators: number[] = [];
        const musicIndicators: number[] = [];
        
        let analysisStartTime = 0;
        const analysisInterval = 0.1; // Analyze every 100ms
        const totalSamples = Math.floor(duration / analysisInterval);
        
        onProgress?.(`🔍 Analyzing audio characteristics... (${totalSamples} samples)`);
        
        const analyzeAudioFrame = () => {
          if (isCancelled) {
            cleanup();
            reject(new Error('Audio analysis was cancelled'));
            return;
          }
          
          if (analysisStartTime >= duration) {
            // Process collected data
            processAudioAnalysis();
            return;
          }
          
          video.currentTime = analysisStartTime;
        };
        
        video.onseeked = () => {
          if (isCancelled) return;
          
          if (video.paused) {
            video.play().then(() => {
              // Short delay to let audio stabilize
              setTimeout(() => {
                if (isCancelled) return;
                
                analyser.getByteFrequencyData(dataArray);
                analyser.getByteTimeDomainData(timeDataArray);
                
                // Calculate volume (RMS)
                let sum = 0;
                for (let i = 0; i < timeDataArray.length; i++) {
                  const amplitude = (timeDataArray[i] - 128) / 128;
                  sum += amplitude * amplitude;
                }
                const rms = Math.sqrt(sum / timeDataArray.length);
                volumeData.push(rms);
                
                // Store frequency data
                frequencyData.push([...dataArray]);
                
                // Detect speech characteristics (mid-frequency range)
                const speechFreqRange = dataArray.slice(20, 80); // Roughly 500Hz-2kHz
                const speechIntensity = speechFreqRange.reduce((a, b) => a + b, 0) / speechFreqRange.length;
                speechIndicators.push(speechIntensity);
                
                // Detect music characteristics (broader frequency spectrum)
                const musicFreqRange = dataArray.slice(10, 200); // Broader range
                const musicIntensity = musicFreqRange.reduce((a, b) => a + b, 0) / musicFreqRange.length;
                musicIndicators.push(musicIntensity);
                
                video.pause();
                analysisStartTime += analysisInterval;
                
                if (analysisStartTime % 1 === 0) {
                  onProgress?.(`🎵 Audio analysis progress: ${Math.round((analysisStartTime / duration) * 100)}%`);
                }
                
                analyzeAudioFrame();
              }, 50);
            }).catch((error) => {
              cleanup();
              reject(new Error(`Audio analysis failed: ${error}`));
            });
          }
        };
        
        const processAudioAnalysis = () => {
          if (isCancelled) {
            cleanup();
            reject(new Error('Audio analysis was cancelled'));
            return;
          }
          
          onProgress?.(`📊 Processing audio analysis results...`);
          
          // Calculate volume statistics
          const volumes = volumeData.filter(v => v > 0);
          const averageVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
          const peakVolume = Math.max(...volumes);
          const volumeVariation = Math.sqrt(
            volumes.reduce((sum, v) => sum + Math.pow(v - averageVolume, 2), 0) / volumes.length
          );
          
          // Detect emotional peaks (sudden volume or frequency changes)
          const emotionalPeaks: number[] = [];
          for (let i = 1; i < volumes.length - 1; i++) {
            const prev = volumes[i - 1];
            const current = volumes[i];
            const next = volumes[i + 1];
            
            // Peak detection: significant increase followed by decrease
            if (current > prev * 1.5 && current > next * 1.2 && current > averageVolume * 1.3) {
              emotionalPeaks.push(i * analysisInterval);
            }
          }
          
          // Calculate speech coverage
          const speechThreshold = speechIndicators.reduce((a, b) => a + b, 0) / speechIndicators.length * 0.7;
          const speechSamples = speechIndicators.filter(s => s > speechThreshold).length;
          const speechCoverage = speechSamples / speechIndicators.length;
          
          // Calculate music characteristics
          const musicThreshold = musicIndicators.reduce((a, b) => a + b, 0) / musicIndicators.length * 0.8;
          const musicSamples = musicIndicators.filter(m => m > musicThreshold).length;
          const hasMusic = musicSamples / musicIndicators.length > 0.3; // 30% threshold
          const musicIntensity = musicIndicators.reduce((a, b) => a + b, 0) / musicIndicators.length / 255;
          
          // Simple tempo detection (very basic)
          let tempo: number | undefined;
          if (hasMusic) {
            // Look for repeating patterns in the music data
            const correlations: number[] = [];
            for (let lag = 10; lag < 100; lag++) { // 1-10 second patterns
              let correlation = 0;
              for (let i = 0; i < musicIndicators.length - lag; i++) {
                correlation += musicIndicators[i] * musicIndicators[i + lag];
              }
              correlations.push(correlation);
            }
            const maxCorrelationIndex = correlations.indexOf(Math.max(...correlations));
            if (maxCorrelationIndex > 0) {
              tempo = 60 / ((maxCorrelationIndex + 10) * analysisInterval); // Convert to BPM
            }
          }
          
          const audioAnalysis: AudioAnalysis = {
            hasMusic,
            musicIntensity,
            speechCoverage,
            emotionalPeaks,
            volume: {
              average: averageVolume,
              peak: peakVolume,
              dynamic: volumeVariation
            },
            tempo
          };
          
          onProgress?.(`✅ Audio analysis complete! Found ${emotionalPeaks.length} emotional peaks`);
          cleanup();
          resolve(audioAnalysis);
        };
        
        // Start analysis
        analyzeAudioFrame();
        
      } catch (error) {
        cleanup();
        reject(new Error(`Audio analysis failed: ${error}`));
      }
    };
    
    video.onerror = () => {
      cleanup();
      reject(new Error('Video loading failed during audio analysis'));
    };
    
    video.src = URL.createObjectURL(file);
    
    // Return cleanup function for cancellation
    return () => {
      isCancelled = true;
      cleanup();
    };
  });
};

/**
 * Extracts a specified number of frames from a video file by drawing them onto a canvas.
 *
 * @param file The video file to process.
 * @param frameCount The number of frames to extract, distributed evenly throughout the video.
 * @param onProgress A callback function to report progress messages.
 * @returns A promise that resolves to an object containing the frames and the video duration.
 */
export const extractFrames = async (
  file: File,
  maxFrames: number = 15, // Back to 15 for better accuracy
  onProgress?: (message: string) => void
): Promise<{ frames: { imageData: string; timestamp: number }[], duration: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    // Higher quality canvas for better accuracy
    const targetWidth = 1280; // Increased for better quality
    const targetHeight = 720;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    video.preload = 'metadata';
    video.muted = true;
    
    video.onloadedmetadata = () => {
      const duration = video.duration;
      const frames: { imageData: string; timestamp: number }[] = [];
      
      // Better frame distribution for accuracy
      const frameInterval = duration / (maxFrames + 1); // Even distribution
      let currentTime = frameInterval; // Start after first interval
      let frameCount = 0;

      onProgress?.(`🎬 Analyzing video structure... (${duration.toFixed(1)}s duration)`);

      const extractNextFrame = () => {
        if (frameCount >= maxFrames || currentTime >= duration - frameInterval) {
          onProgress?.(`✅ Extracted ${frames.length} high-quality frames for analysis`);
          resolve({ frames, duration });
          return;
        }

        video.currentTime = currentTime;
      };

      video.onseeked = () => {
        try {
          // Higher quality settings for accuracy
          ctx.imageSmoothingEnabled = true; // Enable for better quality
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
          
          // Higher quality JPEG for better AI analysis
          const imageData = canvas.toDataURL('image/jpeg', 0.9).split(',')[1]; // 90% quality
          
          frames.push({
            imageData,
            timestamp: currentTime
          });

          frameCount++;
          currentTime += frameInterval;
          
          onProgress?.(`📸 Captured frame ${frameCount}/${maxFrames} at ${currentTime.toFixed(1)}s...`);
          
          // Small delay to prevent overwhelming the browser
          setTimeout(extractNextFrame, 50);
        } catch (error) {
          reject(new Error(`Failed to extract frame at ${currentTime}s: ${error}`));
        }
      };

      video.onerror = () => {
        reject(new Error('Video loading failed'));
      };

      // Start extraction
      extractNextFrame();
    };

    video.src = URL.createObjectURL(file);
  });
};

/**
 * Analyzes video and generates intelligent cropping coordinates for different aspect ratios
 * @param file The video file to analyze
 * @param frames Already extracted frames for analysis
 * @returns Cropping coordinates for different aspect ratios
 */
export const generateAutoCroppingCoordinates = async (
  file: File,
  frames: { imageData: string; timestamp: number }[],
  onProgress?: (message: string) => void
): Promise<{
  '16:9': { x: number; y: number; width: number; height: number };
  '9:16': { x: number; y: number; width: number; height: number };
  '1:1': { x: number; y: number; width: number; height: number };
}> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available for auto-cropping'));
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    
    video.onloadedmetadata = () => {
      onProgress?.(`📐 Analyzing video composition for optimal cropping...`);
      
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const aspectRatio = videoWidth / videoHeight;
      
      // Set canvas to video dimensions for analysis
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      // Analyze center of action across multiple frames
      video.currentTime = frames[Math.floor(frames.length / 2)].timestamp; // Use middle frame
      
      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
          
          // Simple center-weighted cropping logic
          // In a real implementation, you'd use computer vision to detect:
          // - Faces, objects, movement
          // - Rule of thirds composition
          // - Text/subtitle positions
          
          const centerX = videoWidth / 2;
          const centerY = videoHeight / 2;
          
          // 16:9 aspect ratio cropping
          let crop16_9;
          if (aspectRatio > 16/9) {
            // Video is wider than 16:9, crop horizontally
            const cropWidth = videoHeight * (16/9);
            crop16_9 = {
              x: centerX - cropWidth / 2,
              y: 0,
              width: cropWidth,
              height: videoHeight
            };
          } else {
            // Video is taller than 16:9, crop vertically
            const cropHeight = videoWidth * (9/16);
            crop16_9 = {
              x: 0,
              y: centerY - cropHeight / 2,
              width: videoWidth,
              height: cropHeight
            };
          }
          
          // 9:16 aspect ratio cropping (vertical/portrait)
          let crop9_16;
          if (aspectRatio > 9/16) {
            // Video is wider than 9:16, crop horizontally
            const cropWidth = videoHeight * (9/16);
            crop9_16 = {
              x: centerX - cropWidth / 2,
              y: 0,
              width: cropWidth,
              height: videoHeight
            };
          } else {
            // Video is already taller than 9:16, use full width
            const cropHeight = videoWidth * (16/9);
            crop9_16 = {
              x: 0,
              y: Math.max(0, centerY - cropHeight / 2),
              width: videoWidth,
              height: Math.min(videoHeight, cropHeight)
            };
          }
          
          // 1:1 aspect ratio cropping (square)
          const squareSize = Math.min(videoWidth, videoHeight);
          const crop1_1 = {
            x: centerX - squareSize / 2,
            y: centerY - squareSize / 2,
            width: squareSize,
            height: squareSize
          };
          
          onProgress?.(`✅ Generated optimal cropping coordinates for all aspect ratios`);
          
          resolve({
            '16:9': crop16_9,
            '9:16': crop9_16,
            '1:1': crop1_1
          });
          
        } catch (error) {
          reject(new Error(`Failed to generate cropping coordinates: ${error}`));
        }
      };
      
      video.onerror = () => {
        reject(new Error('Video loading failed during cropping analysis'));
      };
    };

    video.src = URL.createObjectURL(file);
  });
};
