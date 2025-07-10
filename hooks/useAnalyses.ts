import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from './useAuth';
import { AnalysisJob, LLMProvider, AnalysisSettings, AnalysisMode } from '../types';
import { extractFrames, analyzeAudio, generateAutoCroppingCoordinates } from '../utils/videoProcessor';
import { analyzeVideoWithLLM } from '../services/llmService';
import { analyzeWithMultipleLLMs } from '../services/multiLLMService';

export const useAnalyses = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);

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
      setProgressMessage('🚀 Starting comprehensive video analysis...');

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
        // Step 1: Extract video frames
        setProgressMessage('🎬 Extracting high-quality frames from video...');
        const { frames, duration } = await extractFrames(
          file, 
          15, 
          (message) => setProgressMessage(message)
        );

        // Step 2: Analyze audio characteristics
        setProgressMessage('🎵 Analyzing audio for viral potential indicators...');
        const audioAnalysis = await analyzeAudio(
          file, 
          duration, 
          (message) => setProgressMessage(message)
        );

        // Step 3: Generate auto-cropping coordinates for different aspect ratios
        setProgressMessage('📐 Generating optimal cropping coordinates...');
        const aspectRatios = await generateAutoCroppingCoordinates(
          file, 
          frames, 
          (message) => setProgressMessage(message)
        );

        // Step 4: Upload video to Firebase Storage for later use
        setProgressMessage('☁️ Uploading video for secure storage...');
        const storageRef = ref(storage, `videos/${user.uid}/${newJobDocRef.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const videoUrl = await getDownloadURL(storageRef);

        await updateDoc(newJobDocRef, { videoUrl });

        if (mode === 'board' && providers.length > 1) {
          // Multi-LLM analysis
          setProgressMessage(`🧠 Analyzing with ${providers.length} AI experts...`);
          
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
          // Single LLM analysis (existing logic with enhancements)
          const providerName = providers[0].toUpperCase();
          setProgressMessage(`🧠 Analyzing with ${providerName} AI + Audio Analysis...`);
          
          const results = await analyzeVideoWithLLM(
            frames, 
            duration, 
            providers[0], 
            settings, 
            audioAnalysis,
            lmStudioUrl,
            (message) => setProgressMessage(message)
          );
          
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
      }
    } catch (error) {
      console.error('Failed to create analysis job:', error);
      setProgressMessage(`❌ Failed to start analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setProgressMessage(null), 5000);
    }
  }, [user]);

  const deleteAnalysis = useCallback(async (analysisId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    // For now, we'll just mark it as deleted in the client
    setAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
  }, [user]);

  const mostRecentJob = analyses.length > 0 ? analyses[0] : null;

  return {
    analyses,
    loading,
    createAnalysisJob,
    deleteAnalysis,
    mostRecentJob,
    progressMessage
  };
};