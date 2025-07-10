import React, { useState, useCallback } from 'react';
import { Clip } from '../types';
import CopyIcon from './icons/CopyIcon';

interface ClipCardProps {
  clip: Clip;
  sourceVideoUrl: string | null;
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
      <div className="bg-gray-700 rounded-full h-2 flex-1 overflow-hidden">
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

const ClipCard: React.FC<ClipCardProps> = React.memo(({ clip, sourceVideoUrl }) => {
  const [copied, setCopied] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);

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
    <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 shadow-lg flex flex-col transition-all duration-300 hover:shadow-purple-500/20 hover:border-purple-500/50 hover:scale-[1.02]">
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
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-900">
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
              
              <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
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
            <button
              onClick={handleCopyDetails}
              className={`flex items-center gap-2 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 ${copied ? 'bg-green-600 scale-105' : 'bg-pink-600 hover:bg-pink-700 hover:scale-105'}`}
            >
              <CopyIcon className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Info'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ClipCard;