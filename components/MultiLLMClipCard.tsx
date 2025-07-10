import React, { useState, useCallback, useMemo } from 'react';
import { AggregatedClip, LLMProvider } from '../types';
import CopyIcon from './icons/CopyIcon';
import GeminiIcon from './icons/GeminiIcon';
import OpenAIIcon from './icons/OpenAIIcon';
import AnthropicIcon from './icons/AnthropicIcon';
import LMStudioIcon from './icons/LMStudioIcon';

interface MultiLLMClipCardProps {
  clip: AggregatedClip;
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

// Score bar component with AI consensus indicator
const ScoreBar: React.FC<{ 
  label: string; 
  score: number; 
  confidence?: number;
  showConfidence?: boolean;
}> = ({ label, score, confidence, showConfidence = false }) => (
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
      {showConfidence && confidence && (
        <span className="text-xs text-gray-400">
          ({confidence}% consensus)
        </span>
      )}
    </div>
  </div>
);

const getProviderIcon = (provider: LLMProvider, size: number = 24, className?: string) => {
  switch (provider) {
    case 'gemini': 
      return <GeminiIcon size={size} className={className} />;
    case 'openai': 
      return <OpenAIIcon size={size} className={className} />;
    case 'anthropic':
    case 'claude': 
      return <AnthropicIcon size={size} className={className} />;
    case 'lmstudio': 
      return <LMStudioIcon size={size} className={className} />;
    default: 
      return <div className={`w-${size/4} h-${size/4} bg-gray-500 rounded`} />;
  }
};

const getProviderName = (provider: LLMProvider) => {
  switch (provider) {
    case 'gemini': return 'Gemini';
    case 'openai': return 'OpenAI';
    case 'anthropic': return 'Anthropic';
    case 'claude': return 'Claude';
    case 'lmstudio': return 'LM Studio';
    default: return provider;
  }
};

const MultiLLMClipCard: React.FC<MultiLLMClipCardProps> = React.memo(({ clip, sourceVideoUrl }) => {
  const [copied, setCopied] = useState(false);
  const [showVariations, setShowVariations] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleCopyDetails = useCallback(() => {
    const details = `Title: ${clip.title}
Reason: ${clip.reason}
Time: ${formatTime(clip.startTime)} - ${formatTime(clip.endTime)}
Recommended by: ${clip.recommendedBy.join(', ')}
Confidence: ${clip.confidenceScore.toFixed(0)}%
Aggregated Viral Score: ${clip.aggregatedViralScore.overall}/100
Score Explanation: ${clip.scoreExplanation}`;
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [clip.title, clip.reason, clip.startTime, clip.endTime, clip.recommendedBy, clip.confidenceScore, clip.aggregatedViralScore.overall, clip.scoreExplanation, formatTime]);

  const toggleVariations = useCallback(() => {
    setShowVariations(!showVariations);
  }, [showVariations]);

  // Memoize expensive computations
  const duration = useMemo(() => clip.endTime - clip.startTime, [clip.startTime, clip.endTime]);
  const hasVariations = useMemo(() => Object.keys(clip.variations).length > 1, [clip.variations]);
  const variationEntries = useMemo(() => Object.entries(clip.variations), [clip.variations]);

  const confidenceColor = useMemo(() => {
    if (clip.confidenceScore >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
    if (clip.confidenceScore >= 50) return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white';
    return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  }, [clip.confidenceScore]);

  return (
    <div className="glass gradient-border p-6 space-y-4 hover-lift">
      {/* Header with confidence badge and viral score */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${confidenceColor}`}>
            {clip.confidenceScore.toFixed(0)}% Confidence
          </div>
          {clip.recommendedBy.length > 1 && (
            <div className="text-xs text-gray-400">
              {clip.recommendedBy.length} AIs agree
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(clip.aggregatedViralScore.overall)}`}>
              {clip.aggregatedViralScore.overall}
            </div>
            <div className="text-xs text-gray-400">VIRAL SCORE</div>
          </div>
          <button
            onClick={handleCopyDetails}
            className="p-2 glass-dark rounded-lg hover:bg-gray-700 transition-colors group"
            title="Copy clip details"
          >
            <CopyIcon className={`w-4 h-4 ${copied ? 'text-green-400' : 'text-gray-400 group-hover:text-white'}`} />
          </button>
        </div>
      </div>

      {/* Title and Reason */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{clip.title}</h3>
        <p className="text-gray-300">{clip.reason}</p>
      </div>

      {/* Score explanation */}
      <div className="p-3 bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-purple-400">AI Consensus:</span> {clip.scoreExplanation}
        </p>
      </div>

      {/* Aggregated Score breakdown */}
      <div>
        <button
          onClick={() => setShowScoreDetails(!showScoreDetails)}
          className="flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors w-full text-left"
        >
          <span>Aggregated Score Breakdown</span>
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
            <ScoreBar 
              label="Engagement" 
              score={clip.aggregatedViralScore.engagement} 
              confidence={clip.confidenceScore}
              showConfidence={true}
            />
            <ScoreBar 
              label="Shareability" 
              score={clip.aggregatedViralScore.shareability}
              confidence={clip.confidenceScore}
              showConfidence={true}
            />
            <ScoreBar 
              label="Retention" 
              score={clip.aggregatedViralScore.retention}
              confidence={clip.confidenceScore}
              showConfidence={true}
            />
            <ScoreBar 
              label="Trend Alignment" 
              score={clip.aggregatedViralScore.trend}
              confidence={clip.confidenceScore}
              showConfidence={true}
            />
          </div>
        )}
      </div>

      {/* Time and Duration */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">⏱️</span>
          <span className="text-white font-mono">
            {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">⏳</span>
          <span className="text-white">{duration}s</span>
        </div>
      </div>

      {/* AI Advisors */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-gray-300">Recommended by:</h4>
          {hasVariations && (
            <button
              onClick={toggleVariations}
              className="text-xs text-primary-400 hover:text-primary-300"
            >
              {showVariations ? 'Hide' : 'Show'} individual AI opinions
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {clip.recommendedBy.map(provider => (
            <div
              key={provider}
              className="flex items-center gap-2 px-3 py-1 glass-dark rounded-full"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {getProviderIcon(provider, 16, 'text-white')}
              </div>
              <span className="text-sm text-white">{getProviderName(provider)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Variations (if different) */}
      {showVariations && hasVariations && (
        <div className="mt-4 space-y-3 animate-fade-in">
          <h4 className="text-sm font-bold text-gray-300">Individual AI Opinions:</h4>
          {variationEntries.map(([provider, variation]) => (
            <div key={provider} className="glass-dark rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  {getProviderIcon(provider as LLMProvider, 16, 'text-white')}
                </div>
                <span className="text-sm font-semibold text-white">{getProviderName(provider as LLMProvider)}</span>
                <div className={`text-sm font-bold ${getScoreColor(variation.viralScore.overall)}`}>
                  {variation.viralScore.overall}/100
                </div>
              </div>
              <p className="text-sm text-gray-300 font-semibold mb-1">{variation.title}</p>
              <p className="text-xs text-gray-400 mb-2">{variation.reason}</p>
              <p className="text-xs text-gray-300">{variation.scoreExplanation}</p>
              
              {/* Individual score breakdown */}
              <div className="mt-2 space-y-1">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Engagement:</span>
                    <span className={getScoreColor(variation.viralScore.engagement)}>{variation.viralScore.engagement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shareability:</span>
                    <span className={getScoreColor(variation.viralScore.shareability)}>{variation.viralScore.shareability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retention:</span>
                    <span className={getScoreColor(variation.viralScore.retention)}>{variation.viralScore.retention}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trend:</span>
                    <span className={getScoreColor(variation.viralScore.trend)}>{variation.viralScore.trend}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Download Button (if video URL available) */}
      {sourceVideoUrl && (
        <button className="w-full py-3 px-4 glass bg-gradient-to-r from-primary-600 to-blue-600 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-blue-700 transition-all hover-lift">
          Download Clip
        </button>
      )}
    </div>
  );
});

export default MultiLLMClipCard; 