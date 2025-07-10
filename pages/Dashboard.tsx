import React from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useAnalyses } from '../hooks/useAnalyses';
import VideoInput from '../components/VideoInput';
import ClipCard from '../components/ClipCard';
import ClipPreview from '../components/ClipPreview';
import MultiLLMClipCard from '../components/MultiLLMClipCard';
import Loader from '../components/Loader';
import ApiKeyStatus from '../components/ApiKeyStatus';
import { AnalysisJob, LLMProvider, AnalysisSettings } from '../types';
import { downloadVideoClip } from '../utils/videoProcessor';

const AnalysisResult: React.FC<{ job: AnalysisJob, progressMessage: string | null, onCancel?: () => void, onForceReset?: () => void, currentVideoFile?: File | null }> = ({ job, progressMessage, onCancel, onForceReset, currentVideoFile }) => {
  
  // Helper function to download all auto-generated clips
  const handleBulkDownload = () => {
    const availableClips = job.clips.filter(clip => 
      clip.generatedClips?.['default']?.status === 'completed' && 
      clip.generatedClips['default'].blob
    );
    
    if (availableClips.length === 0) {
      toast.error('No ready clips available for download');
      return;
    }
    
    availableClips.forEach((clip, index) => {
      const generatedClip = clip.generatedClips!['default'];
      setTimeout(() => {
        downloadVideoClip(
          generatedClip, 
          `${index + 1}_${clip.title.replace(/[^a-zA-Z0-9]/g, '_')}_viral_clip.${generatedClip.format}`
        );
      }, index * 500); // Stagger downloads by 500ms
    });
    
    toast.success(`Downloading ${availableClips.length} viral clips!`);
  };
  
  switch (job.status) {
    case 'completed':
      if (job.clips.length === 0) {
        return (
          <div className="text-center text-gray-400 video-analysis p-8 animate-fade-in">
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
          
          {/* Bulk download section for auto-generated clips */}
          {(() => {
            const readyClips = job.clips.filter(clip => 
              clip.generatedClips?.['default']?.status === 'completed' && 
              clip.generatedClips['default'].blob
            );
            
            if (readyClips.length > 0) {
              return (
                <div className="mb-8 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        All Clips Ready!
                      </h3>
                      <p className="text-sm text-gray-300">
                        {readyClips.length} video clips were automatically generated and are ready to download
                      </p>
                    </div>
                    <button
                      onClick={handleBulkDownload}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download All ({readyClips.length})
                    </button>
                  </div>
                </div>
              );
            }
            return null;
          })()}
          
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
                  <ClipPreview clip={clip} sourceVideoFile={currentVideoFile!} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    case 'processing':
      return (
        <div>
          <Loader 
            message={progressMessage || `Processing "${job.videoFileName}"... This might take a few minutes.`} 
            showProgress={true} 
            onCancel={onCancel}
            showCancel={!!onCancel}
          />
          {/* Emergency force reset for stuck analyses */}
          {onForceReset && (
            <div className="mt-4 text-center">
              <button
                onClick={onForceReset}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
              >
                🔧 Force Reset (if stuck)
              </button>
            </div>
          )}
        </div>
      );
    case 'failed':
      return (
        <div className="text-center text-red-400 video-analysis p-8 animate-fade-in">
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
  const { analyses, loading, isProcessing, createAnalysisJob, cancelAnalysis, forceResetAnalysis, progressMessage, currentVideoFile } = useAnalyses();

  const handleAnalyze = async (providers: LLMProvider[], file: File, settings: AnalysisSettings, selectedModels: Record<LLMProvider, string>, lmStudioUrl?: string) => {
    if (!user) {
      toast.error('You must be logged in to perform an analysis.');
      return;
    }
    
    const requiredCredits = providers.length;
    if (user.credits < requiredCredits) {
      toast.error(`Insufficient credits. You need ${requiredCredits} credits for this analysis.`);
      return;
    }
    
    try {
      await createAnalysisJob(file, providers, settings, selectedModels, lmStudioUrl);
      const providerNames = providers.map(p => {
        const modelId = selectedModels[p];
        return `${p.toUpperCase()}${modelId ? ` (${modelId})` : ''}`;
      }).join(', ');
      toast.success(`Started analysis for "${file.name}" with ${providerNames}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start analysis.');
    }
  };

  const mostRecentJob = analyses.length > 0 ? analyses[0] : null;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <ApiKeyStatus />
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
        {!loading && mostRecentJob && <AnalysisResult 
          job={mostRecentJob} 
          progressMessage={progressMessage} 
          onCancel={isProcessing ? cancelAnalysis : undefined}
          onForceReset={forceResetAnalysis}
          currentVideoFile={currentVideoFile}
        />}
        {!loading && !mostRecentJob && (
          <div className="text-center text-gray-400 video-analysis p-12 animate-fade-in mt-12">
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