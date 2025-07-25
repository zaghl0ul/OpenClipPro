import React, { useState, useCallback } from 'react';
import { Clip, ClipGenerationOptions, VideoClip } from '../types';
import { generateSingleClip, downloadVideoClip, checkFFmpegSupport } from '../utils/videoProcessor';
import CopyIcon from './icons/CopyIcon';

interface ClipCardProps {
  clip: Clip;
  sourceVideoUrl: string | null;
  sourceVideoFile?: File; // Add original file for clip generation
}

// Helper function to get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 70) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  if (score >= 30) return 'text-orange-400';
  return 'text-red-400';
};

// Helper function to get background color for score bars
const getScoreBarColor = (score: number): string => {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 70) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  if (score >= 30) return 'bg-orange-500';
  return 'bg-red-500';
};

// Score bar component
const ScoreBar: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-300 min-w-0 flex-1">{label}</span>
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <div className="progress-bg rounded-full h-2 flex-1 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`font-bold text-xs min-w-[2rem] text-right ${getScoreColor(score)}`}>
        {score}
      </span>
    </div>
  </div>
);

const ClipCard: React.FC<ClipCardProps> = React.memo(({ clip, sourceVideoUrl, sourceVideoFile }) => {
  const [copied, setCopied] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [isGeneratingClip, setIsGeneratingClip] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedClip, setGeneratedClip] = useState<VideoClip | null>(null);
  const [showGenerationOptions, setShowGenerationOptions] = useState(false);
  const [generationOptions, setGenerationOptions] = useState<ClipGenerationOptions>({
    format: 'mp4',
    quality: 'medium',
    aspectRatio: '16:9',
    useCloud: false
  });

  // Check if clips were auto-generated during analysis
  const autoGeneratedClip = clip.generatedClips?.['default'];
  const hasAutoGeneratedClip = autoGeneratedClip && autoGeneratedClip.status === 'completed';

  const handleCopyDetails = useCallback(() => {
    const details = `Title: ${clip.title}
Reason: ${clip.reason}
Time: ${formatTime(clip.startTime)} - ${formatTime(clip.endTime)}
Viral Score: ${clip.viralScore.overall}/100
Score Explanation: ${clip.scoreExplanation}`;
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [clip.title, clip.reason, clip.startTime, clip.endTime, clip.viralScore.overall, clip.scoreExplanation]);

  const handleGenerateClip = useCallback(async () => {
    if (!sourceVideoFile) {
      alert('Original video file not available for clip generation');
      return;
    }

    const support = checkFFmpegSupport();
    if (!support.isSupported) {
      alert(`Cannot generate clips: FFmpeg is not supported in this browser. Required features: SharedArrayBuffer, WebAssembly, Workers, and Cross-Origin Isolation.`);
      return;
    }

    setIsGeneratingClip(true);
    setGenerationProgress(0);

    try {
      const videoClip = await generateSingleClip(
        sourceVideoFile,
        clip.startTime,
        clip.endTime,
        generationOptions,
        (progress: number) => setGenerationProgress(progress)
      );

      setGeneratedClip(videoClip);
      setShowGenerationOptions(false);
    } catch (error) {
      console.error('Failed to generate clip:', error);
      alert(`Failed to generate clip: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingClip(false);
    }
  }, [sourceVideoFile, clip, generationOptions, formatTime]);

  const handleDownloadClip = useCallback(() => {
    if (generatedClip) {
      downloadVideoClip(generatedClip, `${clip.title.replace(/[^a-zA-Z0-9]/g, '_')}_viral_clip.${generatedClip.format}`);
    }
  }, [generatedClip, clip.title]);

  const handleDownloadAutoClip = useCallback(() => {
    if (autoGeneratedClip && autoGeneratedClip.blob) {
      downloadVideoClip(autoGeneratedClip, `${clip.title.replace(/[^a-zA-Z0-9]/g, '_')}_viral_clip.${autoGeneratedClip.format}`);
    }
  }, [autoGeneratedClip, clip.title]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const duration = clip.endTime - clip.startTime;
  const videoSrc = sourceVideoUrl ? `${sourceVideoUrl}#t=${clip.startTime},${clip.endTime}` : null;
  const formattedStartTime = formatTime(clip.startTime);
  const formattedEndTime = formatTime(clip.endTime);

  return (
    <div className="analysis-card rounded-xl overflow-hidden shadow-lg flex flex-col transition-all duration-300 hover:shadow-purple-500/20 hover:border-purple-500/50 hover:scale-[1.02]">
      <div className="aspect-video bg-black relative">
        {videoSrc ? (
          <video 
            controls 
            key={`${sourceVideoUrl}-${clip.id}`} 
            className="w-full h-full object-cover" 
            preload="metadata"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%231f2937'/%3E%3C/svg%3E"
          >
            <source src={videoSrc} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 analysis-card">
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm">Video not available</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        {/* Header with title and viral score */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-xl text-gray-100 flex-1">{clip.title}</h3>
          <div className="ml-3 text-center">
            <div className={`text-2xl font-bold ${getScoreColor(clip.viralScore.overall)}`}>
              {clip.viralScore.overall}
            </div>
            <div className="text-xs text-gray-400">VIRAL SCORE</div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="mb-4">
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-purple-400">AI Analysis:</span> {clip.reason}
          </p>
        </div>

        {/* Auto-generated clip status */}
        {hasAutoGeneratedClip && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-green-400">Video Clip Ready!</span>
              <span className="text-xs text-gray-400">
                • {autoGeneratedClip?.format?.toUpperCase()} • {autoGeneratedClip?.quality} quality 
                • {autoGeneratedClip?.size ? (autoGeneratedClip.size / 1024 / 1024).toFixed(1) + 'MB' : ''}
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Automatically generated during analysis - click "Download Clip" below to save
            </p>
          </div>
        )}

        {/* Clip generation failed status */}
        {clip.generatedClips?.['default']?.status === 'failed' && (
          <div className="mb-4 p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-orange-400">⚠️ Auto-generation failed</span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Use manual generation below to create this clip
            </p>
          </div>
        )}

        {/* Score breakdown */}
        <div className="mb-4">
          <button
            onClick={() => setShowScoreDetails(!showScoreDetails)}
            className="flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors w-full text-left"
          >
            <span>Score Breakdown</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showScoreDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showScoreDetails && (
            <div className="mt-3 space-y-2 animate-fade-in">
              <ScoreBar label="Engagement" score={clip.viralScore.engagement} />
              <ScoreBar label="Shareability" score={clip.viralScore.shareability} />
              <ScoreBar label="Retention" score={clip.viralScore.retention} />
              <ScoreBar label="Trend Alignment" score={clip.viralScore.trend} />
              
              <div className="mt-3 p-3 debug-section rounded-lg">
                <p className="text-xs text-gray-300">
                  <span className="font-semibold text-purple-400">Score Explanation:</span> {clip.scoreExplanation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Time and actions */}
        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-400">
              <p><strong>Time:</strong> {formattedStartTime} - {formattedEndTime}</p>
              <p><strong>Duration:</strong> {Math.round(duration)}s</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyDetails}
                className={`flex items-center gap-2 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 ${copied ? 'bg-green-600 scale-105' : 'bg-pink-600 hover:bg-pink-700 hover:scale-105'}`}
              >
                <CopyIcon className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Info'}
              </button>
              
              {/* Auto-generated clip download button (priority) */}
              {hasAutoGeneratedClip && (
                <button
                  onClick={handleDownloadAutoClip}
                  className="flex items-center gap-2 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 bg-green-600 hover:bg-green-700 hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Clip
                  <span className="text-xs bg-green-500 px-1 rounded-full">Ready!</span>
                </button>
              )}
              
              {/* Manual generation button (fallback when no auto-generated clip) */}
              {!hasAutoGeneratedClip && sourceVideoFile && (
                <button
                  onClick={() => setShowGenerationOptions(!showGenerationOptions)}
                  disabled={isGeneratingClip}
                  className="flex items-center gap-2 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 bg-purple-600 hover:bg-purple-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M9 10v8m6-8v8" />
                  </svg>
                  Generate Clip
                </button>
              )}
            </div>
          </div>

          {/* Clip Generation Options */}
          {showGenerationOptions && sourceVideoFile && (
            <div className="mt-4 p-4 video-analysis rounded-lg">
              <h4 className="text-sm font-semibold text-purple-400 mb-3">Clip Generation Options</h4>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Format</label>
                  <select
                    value={generationOptions.format}
                    onChange={(e) => setGenerationOptions(prev => ({ ...prev, format: e.target.value as 'mp4' | 'webm' }))}
                    className="w-full analysis-input rounded px-2 py-1 text-sm"
                    aria-label="Video format"
                  >
                    <option value="mp4">MP4</option>
                    <option value="webm">WebM</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Quality</label>
                  <select
                    value={generationOptions.quality}
                    onChange={(e) => setGenerationOptions(prev => ({ ...prev, quality: e.target.value as 'high' | 'medium' | 'low' }))}
                    className="w-full analysis-input rounded px-2 py-1 text-sm"
                    aria-label="Video quality"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Aspect Ratio</label>
                  <select
                    value={generationOptions.aspectRatio}
                    onChange={(e) => setGenerationOptions(prev => ({ ...prev, aspectRatio: e.target.value as '16:9' | '9:16' | '1:1' | 'original' }))}
                    className="w-full analysis-input rounded px-2 py-1 text-sm"
                    aria-label="Video aspect ratio"
                  >
                    <option value="original">Original</option>
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateClip}
                  disabled={isGeneratingClip}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingClip ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating... {Math.round(generationProgress)}%
                    </div>
                  ) : (
                    'Start Generation'
                  )}
                </button>
                
                <button
                  onClick={() => setShowGenerationOptions(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              {/* Progress Bar */}
              {isGeneratingClip && (
                <div className="mt-3">
                  <div className="progress-bg rounded-full h-2 overflow-hidden">
                    <div 
                      className="progress-fill h-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generated Clip Download */}
          {generatedClip && (
            <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-green-400">Clip Generated Successfully!</h4>
                  <p className="text-xs text-gray-400">
                    {generatedClip.format.toUpperCase()} • {generatedClip.quality} quality • {(generatedClip.size / 1024 / 1024).toFixed(1)}MB
                  </p>
                </div>
                <button
                  onClick={handleDownloadClip}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ClipCard;