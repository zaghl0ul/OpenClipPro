import React, { useState, useRef, useMemo, useEffect } from 'react';
import { LLMProvider, AnalysisMode, AnalysisSettings } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { toast } from 'react-hot-toast';
import MultiLLMSelector from './MultiLLMSelector';
import AnalysisSettingsComponent from './AnalysisSettings';
import { getLLMProviders, getAvailableProviders } from '../services/llmService';

interface VideoInputProps {
  onAnalyze: (providers: LLMProvider[], file: File, settings: AnalysisSettings, selectedModels: Record<LLMProvider, string>, lmStudioUrl?: string) => void;
  isProcessing: boolean;
  credits: number;
}

const VideoInput: React.FC<VideoInputProps> = React.memo(({ onAnalyze, isProcessing, credits }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<LLMProvider[]>(['gemini']);
  const [selectedModels, setSelectedModels] = useState<Record<LLMProvider, string>>(() => {
    // Initialize with default models for each provider
    const providers = getLLMProviders();
    const initialModels: Record<LLMProvider, string> = {} as Record<LLMProvider, string>;
    Object.values(providers).forEach(provider => {
      initialModels[provider.provider] = provider.defaultModel;
    });
    return initialModels;
  });
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('single');
  const [lmStudioUrl, setLmStudioUrl] = useState<string>('http://localhost:1234');
  const [analysisSettings, setAnalysisSettings] = useState<AnalysisSettings>({
    contentTypes: ['engagement'], // Default to engagement
    platform: 'youtube-shorts', // Default to YouTube Shorts
    minDuration: 15,
    maxDuration: 60,
    includeAudio: true // Default to including audio analysis
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refresh available providers when component mounts or API keys change
  useEffect(() => {
    const availableProviders = getAvailableProviders();
    const availableProviderIds = availableProviders.map(p => p.provider);
    
    // If currently selected providers are not available, reset to first available
    const validSelectedProviders = selectedProviders.filter(p => availableProviderIds.includes(p));
    if (validSelectedProviders.length === 0 && availableProviderIds.length > 0) {
      setSelectedProviders([availableProviderIds[0]]);
    } else if (validSelectedProviders.length !== selectedProviders.length) {
      setSelectedProviders(validSelectedProviders);
    }
  }, [selectedProviders]);

  // Refresh available providers when selectedProviders change
  useEffect(() => {
    const availableProviders = getAvailableProviders();
    const availableProviderIds = availableProviders.map(p => p.provider);
    
    // If currently selected providers are not available, reset to first available
    const validSelectedProviders = selectedProviders.filter(p => availableProviderIds.includes(p));
    if (validSelectedProviders.length === 0 && availableProviderIds.length > 0) {
      setSelectedProviders([availableProviderIds[0]]);
    } else if (validSelectedProviders.length !== selectedProviders.length) {
      setSelectedProviders(validSelectedProviders);
    }
  }, [selectedProviders]);

  // Debounce LMStudio URL to prevent excessive updates
  const debouncedLmStudioUrl = useDebounce(lmStudioUrl, 500);

  // Memoize expensive computations
  const requiredCredits = useMemo(() => 
    analysisMode === 'board' ? selectedProviders.length : 1
  , [analysisMode, selectedProviders.length]);

  const isAnalyzeDisabled = useMemo(() => 
    isProcessing || !file || credits < requiredCredits || 
    analysisSettings.contentTypes.length === 0 || selectedProviders.length === 0
  , [isProcessing, file, credits, requiredCredits, analysisSettings.contentTypes.length, selectedProviders.length]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    console.log('🔍 handleAnalyze called');
    console.log('File:', file);
    console.log('Selected providers:', selectedProviders);
    console.log('Credits:', credits, 'Required:', requiredCredits);
    console.log('Content types:', analysisSettings.contentTypes);
    
    if (!file || selectedProviders.length === 0) {
      console.log('❌ Missing file or providers');
      toast.error('Please select a video file and at least one AI provider');
      return;
    }

    if (credits < requiredCredits) {
      console.log('❌ Insufficient credits');
      toast.error(`You need ${requiredCredits} credits to run this analysis`);
      return;
    }

    if (analysisSettings.contentTypes.length === 0) {
      console.log('❌ No content types selected');
      toast.error('Please select at least one content type');
      return;
    }

    console.log('✅ Starting analysis...');
    try {
      await onAnalyze(selectedProviders, file, analysisSettings, selectedModels, debouncedLmStudioUrl);
      console.log('✅ Analysis completed successfully');
    } catch (error) {
      console.error('❌ Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile?.type.startsWith('video/')) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please drop a valid video file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };



  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Upload Video</h2>
        
        <div
          className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors cursor-pointer relative"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-label="Upload video file"
          />
          
          {file ? (
            <div className="space-y-2">
              <div className="text-green-400 text-4xl mb-2">✓</div>
              <p className="text-white font-semibold">{file.name}</p>
              <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="text-red-400 hover:text-red-300 text-sm mt-2"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-gray-400 text-4xl mb-2">📹</div>
              <p className="text-white font-semibold">Drop your video here or click to select</p>
              <p className="text-gray-400 text-sm">Supports MP4, AVI, MOV, and other common formats</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Analysis Settings */}
      <AnalysisSettingsComponent
        settings={analysisSettings}
        onSettingsChange={setAnalysisSettings}
        disabled={isProcessing}
      />

      {/* AI Provider Selection */}
      <MultiLLMSelector
        selectedProviders={selectedProviders}
        onProvidersChange={setSelectedProviders}
        selectedModels={selectedModels}
        onModelsChange={setSelectedModels}
        mode={analysisMode}
        onModeChange={setAnalysisMode}
        lmStudioUrl={lmStudioUrl}
        onLmStudioUrlChange={setLmStudioUrl}
        disabled={isProcessing}
      />

      {/* Credits Info */}
      <div className="glass rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Analysis Credits</h3>
            <p className="text-sm text-gray-400">
              {analysisMode === 'board' 
                ? `This analysis will use ${requiredCredits} credits (${selectedProviders.length} providers)`
                : 'This analysis will use 1 credit'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{credits}</div>
            <div className="text-sm text-gray-400">credits available</div>
          </div>
        </div>
        
        {credits < requiredCredits && (
          <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-500 rounded text-yellow-300 text-sm">
            ⚠️ You need {requiredCredits - credits} more credits to run this analysis
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <div className="relative">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzeDisabled}
          style={{ 
            position: 'relative',
            zIndex: 100
          }}
          className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 text-lg"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : isAnalyzeDisabled ? (
            // Show specific reason why button is disabled
            !file ? '📹 Select a video file first' :
            credits < requiredCredits ? `💳 Need ${requiredCredits - credits} more credits` :
            analysisSettings.contentTypes.length === 0 ? '📝 Select content types' :
            selectedProviders.length === 0 ? '🤖 Select AI providers' :
            'Cannot analyze (check requirements above)'
          ) : (
            `Analyze Video (${requiredCredits} credit${requiredCredits > 1 ? 's' : ''})`
          )}
        </button>
      </div>
    </div>
  );
});

export default VideoInput;