import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { QuickAnalysisService } from '../services/quickAnalysisService';
import { 
  QuickAnalysisResult, 
 
  LLMProvider, 
  Platform, 
  ProjectVideo,
  VideoMetadata 
} from '../types';

interface UploadedVideo {
  file: File;
  projectVideo: ProjectVideo;
  preview: string;
  id: string;
}

interface AnalysisProgress {
  videoId: string;
  message: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: QuickAnalysisResult;
  error?: string;
}

const QuickAnalyzePage: React.FC = () => {

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState<Record<string, AnalysisProgress>>({});
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('gemini');
  const [targetPlatform, setTargetPlatform] = useState<Platform>('youtube-shorts');
  const [fastMode, setFastMode] = useState(true);
  const [maxClips, setMaxClips] = useState(5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Helper function to create mock ProjectVideo from File
  const createProjectVideo = (file: File): ProjectVideo => {
    const mockMetadata: VideoMetadata = {
      width: 1920,
      height: 1080,
      fps: 30,
      codec: 'h264',
      bitrate: 5000,
      aspectRatio: '16:9',
      hasAudio: true
    };

    return {
      id: `quick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: 'quick_analysis',
      fileName: file.name,
      originalName: file.name,
      size: file.size,
      duration: 0, // Will be determined during analysis
      uploadedAt: new Date() as unknown as Date,
      status: 'processing',
      metadata: mockMetadata,
      analysisJobs: [],
      tags: ['quick-analysis']
    };
  };

  // Drag and drop handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('video/')
    );
    
    handleFiles(files);
  }, [handleFiles]);

  const handleFiles = useCallback((files: File[]) => {
    const newVideos: UploadedVideo[] = files.map(file => {
      const projectVideo = createProjectVideo(file);
      return {
        file,
        projectVideo,
        preview: URL.createObjectURL(file),
        id: projectVideo.id
      };
    });

    setUploadedVideos(prev => [...prev, ...newVideos]);

    // Initialize progress tracking
    newVideos.forEach(video => {
      setAnalysisProgress(prev => ({
        ...prev,
        [video.id]: {
          videoId: video.id,
          message: 'Ready for analysis',
          progress: 0,
          status: 'pending'
        }
      }));
    });
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, [handleFiles]);

  const analyzeVideo = async (video: UploadedVideo) => {
    try {
      setAnalysisProgress(prev => ({
        ...prev,
        [video.id]: {
          ...prev[video.id],
          status: 'processing',
          message: 'Starting analysis...',
          progress: 0
        }
      }));

      const result = await QuickAnalysisService.analyzeVideo(
        video.file,
        video.projectVideo,
        {
          provider: selectedProvider,
          maxClips,
          fastMode,
          targetPlatform
        },
        (message, progress) => {
          setAnalysisProgress(prev => ({
            ...prev,
            [video.id]: {
              ...prev[video.id],
              message,
              progress,
              status: 'processing'
            }
          }));
        }
      );

      setAnalysisProgress(prev => ({
        ...prev,
        [video.id]: {
          ...prev[video.id],
          status: 'completed',
          message: 'Analysis complete!',
          progress: 100,
          result
        }
      }));

    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisProgress(prev => ({
        ...prev,
        [video.id]: {
          ...prev[video.id],
          status: 'failed',
          message: 'Analysis failed',
          progress: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  };

  const analyzeAllVideos = async () => {
    setIsAnalyzing(true);
    
    for (const video of uploadedVideos) {
      if (analysisProgress[video.id]?.status === 'pending') {
        await analyzeVideo(video);
      }
    }
    
    setIsAnalyzing(false);
  };

  const removeVideo = (videoId: string) => {
    setUploadedVideos(prev => prev.filter(v => v.id !== videoId));
    setAnalysisProgress(prev => {
      const updated = { ...prev };
      delete updated[videoId];
      return updated;
    });
  };

  const clearAll = () => {
    setUploadedVideos([]);
    setAnalysisProgress({});
  };

  const getStatusColor = (status: AnalysisProgress['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'processing': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'tiktok': return '🎵';
      case 'youtube-shorts': return '🩳';
      case 'instagram-reels': return '📸';
      case 'youtube': return '📺';
      case 'twitter': return '🐦';
      default: return '🌐';
    }
  };

  return (
    <div className="min-h-full bg-[var(--color-bg-primary)] p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">⚡ Quick Analyze</h1>
            <p className="text-gray-300">
              Fast viral moment detection for your videos. Drop files to get started!
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app/projects')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              📁 Back to Projects
            </button>
            
            {uploadedVideos.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                🗑️ Clear All
              </button>
            )}
          </div>
        </div>

        {/* Analysis Settings */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Analysis Settings</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                AI Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as LLMProvider)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Select AI provider"
              >
                <option value="gemini">🔹 Gemini (Fast)</option>
                <option value="openai">🟢 OpenAI (Balanced)</option>
                <option value="anthropic">🟣 Claude (Detailed)</option>
                <option value="lmstudio">🏠 LMStudio (Local)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Platform
              </label>
              <select
                value={targetPlatform}
                onChange={(e) => setTargetPlatform(e.target.value as Platform)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Select target platform"
              >
                <option value="youtube-shorts">🩳 YouTube Shorts</option>
                <option value="tiktok">🎵 TikTok</option>
                <option value="instagram-reels">📸 Instagram Reels</option>
                <option value="youtube">📺 YouTube</option>
                <option value="twitter">🐦 Twitter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Clips
              </label>
              <select
                value={maxClips}
                onChange={(e) => setMaxClips(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Select maximum clips"
              >
                <option value={3}>3 clips</option>
                <option value={5}>5 clips</option>
                <option value={8}>8 clips</option>
                <option value={10}>10 clips</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={fastMode}
                  onChange={(e) => setFastMode(e.target.checked)}
                  className="sr-only"
                  aria-label="Enable fast mode analysis"
                />
                <div className={`relative w-10 h-6 rounded-full transition-colors ${
                  fastMode ? 'bg-primary-600' : 'bg-gray-600'
                }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    fastMode ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
                <span className="ml-3 text-sm text-gray-300">
                  ⚡ Fast Mode
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          dragOver
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Drop video files here or click to select
        </h3>
        <p className="text-gray-400 mb-6">
          Supports MP4, MOV, AVI, and other video formats
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            📁 Select Files
          </button>
          
          {uploadedVideos.length > 0 && (
            <button
              onClick={analyzeAllVideos}
              disabled={isAnalyzing}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isAnalyzing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isAnalyzing ? '⏳ Analyzing...' : '⚡ Analyze All'}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*"
          onChange={handleFileInput}
          className="hidden"
          aria-label="Select video files for analysis"
        />
      </div>

      {/* Video List */}
      {uploadedVideos.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            Uploaded Videos ({uploadedVideos.length})
          </h3>
          
          <div className="space-y-4">
            {uploadedVideos.map(video => {
              const progress = analysisProgress[video.id];
              
              return (
                <div key={video.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-start gap-4">
                    {/* Video Preview */}
                    <div className="w-24 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      <video
                        src={video.preview}
                        className="w-full h-full object-cover"
                        muted
                      />
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-white truncate">
                            {video.file.name}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {(video.file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(progress?.status || 'pending')}`} />
                          <span className="text-sm text-gray-400 capitalize">
                            {progress?.status || 'pending'}
                          </span>
                          <button
                            onClick={() => removeVideo(video.id)}
                            className="ml-2 p-1 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Progress */}
                      {progress && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">{progress.message}</span>
                            <span className="text-gray-400">{progress.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                progress.status === 'completed' ? 'bg-green-500' :
                                progress.status === 'failed' ? 'bg-red-500' : 'bg-primary-500'
                              }`}
                              style={{ width: `${progress.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Results */}
                      {progress?.result && (
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-white">Quick Analysis Results</h5>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-green-400">
                                {Math.round(progress.result.overallScore)}%
                              </span>
                              <span className="text-sm text-gray-400">viral score</span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-300 mb-4">{progress.result.summary}</p>

                          {/* Top Clips */}
                          <div className="space-y-2">
                            <h6 className="text-sm font-medium text-gray-300">
                              Top Clips ({progress.result.topClips.length})
                            </h6>
                            {progress.result.topClips.map((clip, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono text-gray-400">
                                    {Math.floor(clip.startTime)}s - {Math.floor(clip.endTime)}s
                                  </span>
                                  <span className="text-sm text-white">{clip.reason}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{getPlatformIcon(clip.platform)}</span>
                                  <span className="text-sm font-medium text-primary-400">
                                    {Math.round(clip.score)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Error */}
                      {progress?.error && (
                        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                          <p className="text-red-400 text-sm">{progress.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAnalyzePage; 