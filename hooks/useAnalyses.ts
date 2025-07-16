import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from './useAuth';
import { AnalysisJob, LLMProvider, AnalysisSettings, AnalysisMode } from '../types';
import { processVideoOptimized } from '../utils/videoProcessor';
import { analyzeVideoWithLLM } from '../services/llmService';
import { analyzeWithMultipleLLMs } from '../services/multiLLMService';

// Cache for processed video data to avoid re-processing
const videoCache = new Map<string, {
  frames: { imageData: string; timestamp: number }[];
  duration: number;
  audioAnalysis?: any;
  aspectRatios?: any;
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Generate cache key for video file
const getCacheKey = (file: File): string => {
  return `${file.name}-${file.size}-${file.lastModified}`;
};

// Check if cached data is still valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

export const useAnalyses = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      setAnalyses([]);
      setLoading(false);
      return;
    }

    const analysesRef = collection(db, 'analyses');
    const q = query(
      analysesRef,
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const analysisData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AnalysisJob[];

      const userAnalyses = analysisData.filter(analysis => analysis.userId === user.uid);
      setAnalyses(userAnalyses);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createAnalysisJob = useCallback(async (
    file: File, 
    providers: LLMProvider[], 
    settings: AnalysisSettings,
    mode: AnalysisMode = 'single',
    lmStudioUrl?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setIsProcessing(true);
      setProgressMessage('🚀 Starting optimized video analysis...');

      // Create initial job document
      const newJobData = {
        userId: user.uid,
        videoFileName: file.name,
        videoUrl: null,
        status: 'processing' as const,
        clips: [],
        createdAt: Timestamp.now(),
        llmProvider: providers[0],
        llmProviders: providers,
        settings,
        lmStudioUrl
      };

      const newJobDocRef = await addDoc(collection(db, 'analyses'), newJobData);

      try {
        // Check cache first
        const cacheKey = getCacheKey(file);
        let processedData = videoCache.get(cacheKey);

        if (processedData && isCacheValid(processedData.timestamp)) {
          setProgressMessage('⚡ Using cached video data for faster processing...');
        } else {
          // Process video with optimized pipeline
          setProgressMessage('� Processing video with optimized pipeline...');
          
          const rawProcessedData = await processVideoOptimized(
            file,
            {
              maxFrames: 15,
              quality: 0.85,
              enableAudioAnalysis: true,
              enableCropping: true,
              parallelProcessing: true
            },
            (message) => setProgressMessage(message)
          );
          
          processedData = {
            ...rawProcessedData,
            timestamp: Date.now()
          };

          // Cache the processed data
          videoCache.set(cacheKey, {
            ...processedData,
            timestamp: Date.now()
          } as any);
        }

        const { frames, duration, audioAnalysis, aspectRatios } = processedData || { frames: [], duration: 0 };

        // Upload video to Firebase Storage in background (non-blocking)
        setProgressMessage('☁️ Uploading video for secure storage...');
        const uploadPromise = (async () => {
          const storageRef = ref(storage, `videos/${user.uid}/${newJobDocRef.id}/${file.name}`);
          await uploadBytes(storageRef, file);
          const videoUrl = await getDownloadURL(storageRef);
          await updateDoc(newJobDocRef, { videoUrl });
        })();

        if (mode === 'board' && providers.length > 1) {
          // Multi-LLM analysis with optimized processing
          setProgressMessage(`🧠 Analyzing with ${providers.length} AI experts in parallel...`);
          
          const multiResults = await analyzeWithMultipleLLMs(
            frames,
            duration,
            providers,
            settings,
            audioAnalysis,
            lmStudioUrl,
            (provider, status) => {
              if (status === 'started') {
                setProgressMessage(`🔄 ${provider.toUpperCase()} AI is analyzing your video...`);
              } else if (status === 'completed') {
                setProgressMessage(`✅ ${provider.toUpperCase()} analysis completed successfully`);
              } else if (status === 'failed') {
                setProgressMessage(`❌ ${provider.toUpperCase()} analysis failed, continuing with others...`);
              }
            }
          );

          // Wait for upload to complete
          await uploadPromise;

          // Enhance aggregated clips with audio analysis and aspect ratios
          const enhancedClips = multiResults.aggregatedClips.map((clip, index) => ({
            id: `${newJobDocRef.id}-clip-${index}`,
            title: clip.title,
            reason: clip.reason,
            startTime: clip.startTime,
            endTime: clip.endTime,
            viralScore: clip.viralScore,
            scoreExplanation: clip.scoreExplanation,
            audioAnalysis,
            aspectRatios,
          }));

          setProgressMessage(`🎉 Found ${enhancedClips.length} high-confidence viral clips with AI consensus!`);

          // Update job document with enhanced results
          await updateDoc(newJobDocRef, {
            status: 'completed',
            clips: enhancedClips,
            multiLLMResults: multiResults,
          });
        } else {
          // Single LLM analysis with optimized processing
          const providerName = providers[0].toUpperCase();
          setProgressMessage(`🧠 Analyzing with ${providerName} AI + Enhanced Audio Analysis...`);
          
          const results = await analyzeVideoWithLLM(
            frames, 
            duration, 
            providers[0], 
            settings, 
            audioAnalysis,
            lmStudioUrl,
            (message) => setProgressMessage(message)
          );
          
          // Wait for upload to complete
          await uploadPromise;
          
          setProgressMessage(`✨ ${providerName} identified potential viral moments...`);
          
          // Enhance clips with audio analysis and aspect ratios
          const enhancedClips = results.clips.map((clip, index) => ({
            ...clip,
            id: `${newJobDocRef.id}-clip-${index}`,
            audioAnalysis,
            aspectRatios,
          }));

          setProgressMessage(`🎉 Analysis complete! Found ${enhancedClips.length} viral clips with enhanced scoring!`);

          // Update job document with enhanced results
          await updateDoc(newJobDocRef, {
            status: 'completed',
            clips: enhancedClips,
          });
        }

        // Clear progress message after a short delay
        setTimeout(() => setProgressMessage(null), 3000);

      } catch (error) {
        console.error('Analysis error:', error);
        await updateDoc(newJobDocRef, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
        setProgressMessage(`❌ Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setTimeout(() => setProgressMessage(null), 5000);
      } finally {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Failed to create analysis job:', error);
      setProgressMessage(`❌ Failed to start analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setProgressMessage(null), 5000);
      setIsProcessing(false);
    }
  }, [user]);

  const deleteAnalysis = useCallback(async (analysisId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    // For now, we'll just mark it as deleted in the client
    setAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
  }, [user]);

  const clearCache = useCallback(() => {
    videoCache.clear();
  }, []);

  const mostRecentJob = analyses.length > 0 ? analyses[0] : null;

  return {
    analyses,
    loading,
    isProcessing,
    createAnalysisJob,
    deleteAnalysis,
    clearCache,
    mostRecentJob,
    progressMessage
  };
};