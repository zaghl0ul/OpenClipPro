import React from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useAnalyses } from '../hooks/useAnalyses';
import VideoInput from '../components/VideoInput';
import ClipCard from '../components/ClipCard';
import MultiLLMClipCard from '../components/MultiLLMClipCard';
import Loader from '../components/Loader';
import { AnalysisJob, LLMProvider, AnalysisSettings, AnalysisMode } from '../types';

const AnalysisResult: React.FC<{ job: AnalysisJob, progressMessage: string | null }> = ({ job, progressMessage }) => {
  switch (job.status) {
    case 'completed':
      if (job.clips.length === 0) {
        return (
          <div className="text-center text-gray-400 glass gradient-border p-8 animate-fade-in">
            <h3 className="font-bold text-xl mb-3">No Clips Found</h3>
            <p className="text-gray-500">The AI could not identify any viral clips from this video. Try another video!</p>
          </div>
        );
      }
      
      // Check if this is a multi-LLM analysis
      const isMultiLLM = job.multiLLMResults && job.llmProviders && job.llmProviders.length > 1;
      
      return (
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-white">Analysis Complete</h2>
            <p className="text-blue-300 font-semibold mb-2">{job.videoFileName}</p>
            {isMultiLLM ? (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">
                  Analyzed by {job.llmProviders?.length || 0} AI Advisors
                </p>
                {job.multiLLMResults && job.multiLLMResults.consensusScore > 0 && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-400 text-sm">Consensus Score:</span>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      job.multiLLMResults.consensusScore >= 70 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                        : job.multiLLMResults.consensusScore >= 40 
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                    }`}>
                      {job.multiLLMResults.consensusScore.toFixed(0)}%
                    </div>
                  </div>
                )}
              </div>
            ) : (
              job.llmProvider && (
                <p className="text-gray-400 text-sm">Analyzed with {job.llmProvider.toUpperCase()} AI</p>
              )
            )}
          </div>
          
          {isMultiLLM && job.multiLLMResults ? (
            <div className="space-y-6">
              {job.multiLLMResults.aggregatedClips.map((clip) => (
                <MultiLLMClipCard 
                  key={clip.id} 
                  clip={clip} 
                  sourceVideoUrl={job.videoUrl} 
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {job.clips.map((clip) => (
                <div key={clip.id} className="card-3d gradient-border hover-lift">
                  <ClipCard clip={clip} sourceVideoUrl={job.videoUrl} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    case 'processing':
      return <Loader message={progressMessage || `Processing "${job.videoFileName}"... This might take a few minutes.`} showProgress={true} />;
    case 'failed':
      return (
        <div className="text-center text-red-400 glass-dark gradient-border p-8 animate-fade-in">
          <h3 className="font-bold text-xl mb-3">Analysis Failed</h3>
          <p className="text-gray-500">{job.error || 'An error occurred during analysis.'}</p>
        </div>
      );
    default:
      return null;
  }
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { analyses, loading, isProcessing, createAnalysisJob, progressMessage } = useAnalyses();

  const handleAnalyze = async (file: File, providers: LLMProvider[], settings: AnalysisSettings, mode: AnalysisMode, lmStudioUrl?: string) => {
    if (!user) {
      toast.error('You must be logged in to perform an analysis.');
      return;
    }
    
    const requiredCredits = mode === 'board' ? providers.length : 1;
    if (user.credits < requiredCredits) {
      toast.error(`Insufficient credits. You need ${requiredCredits} credits for this analysis.`);
      return;
    }
    
    try {
      await createAnalysisJob(file, providers, settings, mode, lmStudioUrl);
      const modeText = mode === 'board' ? `${providers.length} AI advisors` : providers[0].toUpperCase();
      toast.success(`Started analysis for "${file.name}" with ${modeText}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start analysis.');
    }
  };

  const mostRecentJob = analyses.length > 0 ? analyses[0] : null;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="glass gradient-border p-6 md:p-10">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          <span className="holographic">Upload a Video</span> for Viral Clip Analysis
        </h1>
        <VideoInput
          onAnalyze={handleAnalyze}
          isProcessing={isProcessing}
          credits={user?.credits ?? 0}
        />
      </div>
      <div className="mt-12">
        {loading && <Loader message="Loading your analysis data..." />}
        {!loading && mostRecentJob && <AnalysisResult job={mostRecentJob} progressMessage={progressMessage} />}
        {!loading && !mostRecentJob && (
          <div className="text-center text-gray-400 glass gradient-border p-12 animate-fade-in mt-12">
            <h3 className="font-bold text-2xl mb-4 text-white neon-text">Welcome, {user?.email}!</h3>
            <p className="text-lg mb-2">Upload a video file to begin your first analysis.</p>
            <p className="text-gray-500">Your latest analysis results will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;