import React, { useState, useRef, useCallback, useMemo } from 'react';
import UploadIcon from './icons/UploadIcon';
import MultiLLMSelector from './MultiLLMSelector';
import AnalysisSettingsComponent from './AnalysisSettings';
import { LLMProvider, AnalysisSettings, AnalysisMode } from '../types';
import { useDebounce } from '../hooks/useDebounce';

interface VideoInputProps {
  onAnalyze: (file: File, providers: LLMProvider[], settings: AnalysisSettings, mode: AnalysisMode, lmStudioUrl?: string) => void;
  isProcessing: boolean;
  credits: number;
}

const VideoInput: React.FC<VideoInputProps> = React.memo(({ onAnalyze, isProcessing, credits }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<LLMProvider[]>(['gemini']);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('single');
  const [lmStudioUrl, setLmStudioUrl] = useState<string>('http://localhost:1234');
  const [analysisSettings, setAnalysisSettings] = useState<AnalysisSettings>({
    contentTypes: ['engagement'], // Default to engagement
    platform: 'youtube-shorts', // Default to YouTube Shorts
    minDuration: 15,
    maxDuration: 60
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const buttonText = useMemo(() => {
    if (isProcessing) {
      return 'Processing...';
    } else if (credits < requiredCredits) {
      return `Insufficient Credits (Need ${requiredCredits})`;
    } else if (analysisSettings.contentTypes.length === 0) {
      return 'Select Content Type';
    } else if (selectedProviders.length === 0) {
      return 'Select AI Provider';
    } else if (analysisMode === 'board') {
      return `✨ Analyze with ${selectedProviders.length} AIs (${requiredCredits} Credits)`;
    } else {
      return '✨ Analyze Video (1 Credit)';
    }
  }, [isProcessing, credits, requiredCredits, analysisSettings.contentTypes.length, selectedProviders.length, analysisMode]);

  const handleAnalyzeClick = useCallback(() => {
    if (isAnalyzeDisabled) return;
    
    if (credits < requiredCredits) {
      setError(`Insufficient credits. You need ${requiredCredits} credits for this analysis.`);
      return;
    }
    
    onAnalyze(file!, selectedProviders, analysisSettings, analysisMode, debouncedLmStudioUrl);
    setFile(null); // Clear file after starting analysis
  }, [isAnalyzeDisabled, credits, requiredCredits, file, selectedProviders, analysisSettings, analysisMode, debouncedLmStudioUrl, onAnalyze]);

  const processAndSetFile = useCallback((selectedFile: File | undefined | null) => {
    if (selectedFile) {
        if (selectedFile.type.startsWith('video/')) {
            if (selectedFile.size > 100 * 1024 * 1024) { // 100 MB limit
                 setError("File is too large. Please upload a video under 100MB.");
                 setFile(null);
            } else {
                setFile(selectedFile);
                setError(null);
            }
        } else {
            setError("Invalid file type. Please upload a video file.");
            setFile(null);
        }
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    processAndSetFile(selectedFile);
  };

  const handleUploadAreaClick = () => {
    if (!isProcessing) {
        fileInputRef.current?.click();
    }
  };
  
  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isProcessing) return;

    const droppedFile = event.dataTransfer.files?.[0];
    processAndSetFile(droppedFile);
  }, [isProcessing, processAndSetFile]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg">
      <div
        onClick={handleUploadAreaClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-all duration-300 ${isProcessing ? 'border-gray-600 bg-gray-800 cursor-not-allowed' : 'border-gray-600 hover:border-purple-500 hover:bg-gray-700/50 cursor-pointer hover:scale-[1.02]'}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="video/*"
          disabled={isProcessing}
          aria-label="Upload video file"
        />
        <UploadIcon className="w-12 h-12 text-gray-500 mb-4"/>
        {file ? (
          <div className="text-center">
            <p className="text-gray-300 font-semibold text-lg">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-300 font-semibold text-lg">Drag & drop or click to upload</p>
            <p className="text-gray-500 text-sm mt-1">Supports MP4, MOV, AVI, and more</p>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-3">Max file size: 100MB</p>
        {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
      </div>

      <div className="mt-6">
        <MultiLLMSelector
          selectedProviders={selectedProviders}
          onProvidersChange={setSelectedProviders}
          mode={analysisMode}
          onModeChange={setAnalysisMode}
          lmStudioUrl={lmStudioUrl}
          onLmStudioUrlChange={setLmStudioUrl}
          disabled={isProcessing}
        />
      </div>

      <AnalysisSettingsComponent
        settings={analysisSettings}
        onSettingsChange={setAnalysisSettings}
        disabled={isProcessing}
      />

      <button
        onClick={handleAnalyzeClick}
        disabled={isAnalyzeDisabled}
        className="w-full mt-6 py-4 px-6 font-bold text-white rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:hover:scale-100 transform hover:scale-105 shadow-lg"
      >
        {buttonText}
      </button>
    </div>
  );
});

export default VideoInput;