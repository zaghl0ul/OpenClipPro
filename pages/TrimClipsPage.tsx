import React, { useState, useRef, useEffect } from 'react';
import { 
  Scissors, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Download, 
  Save,
  Settings,
  Volume2,
  VolumeX,
  Maximize,
  Minimize
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAnalyses } from '../hooks/useAnalyses';
import { Clip, VideoClip } from '../types';

interface TrimClipsPageProps {}

const TrimClipsPage: React.FC<TrimClipsPageProps> = () => {
  const { analyses } = useAnalyses();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedClips, setSelectedClips] = useState<Clip[]>([]);

  // Get all clips from analyses
  const allClips = analyses.flatMap(analysis => analysis.clips);

  useEffect(() => {
    if (selectedClip && videoRef.current) {
      const video = videoRef.current;
      
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };
      
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setTrimEnd(video.duration);
      };
      
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [selectedClip]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTrimStart = (time: number) => {
    setTrimStart(Math.min(time, trimEnd - 1));
  };

  const handleTrimEnd = (time: number) => {
    setTrimEnd(Math.max(time, trimStart + 1));
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleFullscreenToggle = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleExportClip = async () => {
    if (!selectedClip) return;
    
    try {
      // Simulate clip export
      toast.success('Clip exported successfully!');
    } catch (error) {
      toast.error('Failed to export clip');
    }
  };

  const handleSaveEdits = () => {
    if (!selectedClip) return;
    
    // Update clip with new trim points
    const updatedClip = {
      ...selectedClip,
      startTime: trimStart,
      endTime: trimEnd
    };
    
    toast.success('Edits saved successfully!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimelinePosition = (time: number) => {
    return (time / duration) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Scissors className="text-primary-400" size={24} />
              <h1 className="text-xl font-semibold text-white">Trim Clips</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveEdits}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Save size={16} />
                <span>Save Edits</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Editor */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                {selectedClip ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    src={selectedClip.generatedClips?.['mp4-high']?.cloudUrl || ''}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Scissors size={48} className="text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Select a clip to start editing</p>
                    </div>
                  </div>
                )}
                
                {/* Video Controls Overlay */}
                {selectedClip && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handlePlayPause}
                          className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                        >
                          {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleMuteToggle}
                            className="p-1 text-white hover:text-gray-300 transition-colors"
                          >
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                            className="w-20"
                          />
                        </div>
                        
                        <span className="text-white text-sm">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                      
                      <button
                        onClick={handleFullscreenToggle}
                        className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                      >
                        {isFullscreen ? <Minimize size={20} className="text-white" /> : <Maximize size={20} className="text-white" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              {selectedClip && showTimeline && (
                <div className="p-4">
                  <div className="relative h-16 bg-gray-700 rounded-lg p-2">
                    {/* Timeline Track */}
                    <div className="relative h-full bg-gray-600 rounded overflow-hidden">
                      {/* Playhead */}
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                        style={{ left: `${getTimelinePosition(currentTime)}%` }}
                      />
                      
                      {/* Trim Handles */}
                      <div 
                        className="absolute top-0 bottom-0 bg-blue-500 bg-opacity-50"
                        style={{ 
                          left: `${getTimelinePosition(trimStart)}%`,
                          width: `${getTimelinePosition(trimEnd) - getTimelinePosition(trimStart)}%`
                        }}
                      />
                      
                      {/* Start Handle */}
                      <div 
                        className="absolute top-0 bottom-0 w-2 bg-blue-500 cursor-ew-resize"
                        style={{ left: `${getTimelinePosition(trimStart)}%` }}
                        onMouseDown={(e) => {
                          // Handle drag for trim start
                        }}
                      />
                      
                      {/* End Handle */}
                      <div 
                        className="absolute top-0 bottom-0 w-2 bg-blue-500 cursor-ew-resize"
                        style={{ left: `${getTimelinePosition(trimEnd)}%` }}
                        onMouseDown={(e) => {
                          // Handle drag for trim end
                        }}
                      />
                    </div>
                    
                    {/* Time Markers */}
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{formatTime(trimStart)}</span>
                      <span>{formatTime(trimEnd)}</span>
                    </div>
                  </div>
                  
                  {/* Trim Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleSeek(trimStart)}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                      >
                        Go to Start
                      </button>
                      <button
                        onClick={() => handleSeek(trimEnd)}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                      >
                        Go to End
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Duration:</span>
                      <span className="text-sm text-white font-medium">
                        {formatTime(trimEnd - trimStart)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Export Options */}
            {selectedClip && (
              <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Format</label>
                      <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="mp4">MP4</option>
                        <option value="webm">WebM</option>
                        <option value="mov">MOV</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Quality</label>
                      <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Aspect Ratio</label>
                      <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                        <option value="1:1">1:1 (Square)</option>
                        <option value="original">Original</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={handleExportClip}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    >
                      <Download size={16} />
                      <span>Export Clip</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clips Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Available Clips</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allClips.map((clip) => (
                  <div
                    key={clip.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedClip?.id === clip.id
                        ? 'border-primary-500 bg-primary-500 bg-opacity-10'
                        : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedClip(clip)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium text-sm truncate">{clip.title}</h4>
                      <span className="text-primary-400 font-medium text-sm">{clip.viralScore.overall}</span>
                    </div>
                    
                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">{clip.reason}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatTime(clip.startTime)} - {formatTime(clip.endTime)}</span>
                      <span>{formatTime(clip.endTime - clip.startTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {allClips.length === 0 && (
                <div className="text-center py-8">
                  <Scissors size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No clips available</p>
                  <p className="text-gray-500 text-sm">Upload and analyze videos to create clips</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrimClipsPage;