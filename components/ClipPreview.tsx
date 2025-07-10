import React, { useState, useRef, useEffect } from 'react';
import { Clip } from '../types';
import { instantVideoService } from '../services/instantVideoService';
import { ffmpegService } from '../services/ffmpegService';

interface ClipPreviewProps {
  clip: Clip;
  sourceVideoFile: File;
  onDownload?: (clip: Clip) => void;
}

export const ClipPreview: React.FC<ClipPreviewProps> = ({ 
  clip, 
  sourceVideoFile, 
  onDownload 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate thumbnail when component mounts
  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        const thumbData = await instantVideoService.generateThumbnail(
          sourceVideoFile,
          clip.startTime,
          320,
          180
        );
        setThumbnail(thumbData);
      } catch (error) {
        console.warn('Failed to generate thumbnail:', error);
      }
    };
    
    generateThumbnail();
  }, [clip.startTime, sourceVideoFile]);

  // Setup video element when it loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= clip.endTime) {
        video.pause();
        setIsPlaying(false);
        video.currentTime = clip.startTime; // Reset to start
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [clip.startTime, clip.endTime, isLoaded]);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isPlaying) {
      video.currentTime = clip.startTime;
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoLoad = () => {
    setIsLoaded(true);
    const video = videoRef.current;
    if (video) {
      video.currentTime = clip.startTime;
    }
  };

  const handleDownload = async () => {
    if (!sourceVideoFile || isGenerating) return;

    setIsGenerating(true);
    setDownloadProgress(0);

    try {
      // Generate the actual video clip using FFmpeg
      const videoClip = await ffmpegService.generateClip(
        sourceVideoFile,
        clip.startTime,
        clip.endTime,
        {
          format: 'mp4',
          quality: 'high',
          aspectRatio: 'original'
        },
        undefined, // No cropping for now
        (progress) => {
          setDownloadProgress(progress);
        }
      );

      // Create download link
      if (videoClip.blob) {
        const url = URL.createObjectURL(videoClip.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${clip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      onDownload?.(clip);
    } catch (error) {
      console.error('Failed to generate clip:', error);
      alert('Failed to generate clip. Please try again.');
    } finally {
      setIsGenerating(false);
      setDownloadProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = () => {
    const duration = clip.endTime - clip.startTime;
    return `${duration.toFixed(1)}s`;
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      {/* Video Preview */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          src={URL.createObjectURL(sourceVideoFile)}
          onLoadedMetadata={handleVideoLoad}
          muted
          preload="metadata"
        />
        
        {/* Thumbnail overlay when not playing */}
        {!isPlaying && thumbnail && (
          <div 
            className="absolute inset-0 bg-cover bg-center cursor-pointer"
            style={{ backgroundImage: `url(${thumbnail})` }}
            onClick={handlePlay}
          >
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-0 h-0 border-l-8 border-r-0 border-t-6 border-b-6 border-transparent border-l-white ml-1"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Play/Pause Button */}
        <button
          onClick={handlePlay}
          className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-opacity-70 transition-all"
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
        
        {/* Time Info */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm">
          {formatTime(clip.startTime)} - {formatTime(clip.endTime)} ({formatDuration()})
        </div>
      </div>

      {/* Clip Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{clip.title}</h3>
        <p className="text-gray-300 mb-4">{clip.reason}</p>
        
        {/* Viral Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Viral Score</span>
            <span className="text-lg font-bold text-green-400">
              {clip.viralScore.overall}/100
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-green-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${clip.viralScore.overall}%` }}
            ></div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="text-center">
            <div className="text-blue-400 font-medium">{clip.viralScore.engagement}</div>
            <div className="text-gray-500">Engagement</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-medium">{clip.viralScore.shareability}</div>
            <div className="text-gray-500">Shareability</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-medium">{clip.viralScore.retention}</div>
            <div className="text-gray-500">Retention</div>
          </div>
          <div className="text-center">
            <div className="text-pink-400 font-medium">{clip.viralScore.trend}</div>
            <div className="text-gray-500">Trend</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {downloadProgress > 0 ? `${Math.round(downloadProgress)}%` : 'Processing...'}
              </div>
            ) : (
              '⬇️ Download MP4'
            )}
          </button>
          
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            📱 Share
          </button>
        </div>

        {/* Score Explanation */}
        {clip.scoreExplanation && (
          <details className="mt-4">
            <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
              📊 AI Score Explanation
            </summary>
            <p className="text-sm text-gray-300 mt-2 pl-4 border-l-2 border-gray-600">
              {clip.scoreExplanation}
            </p>
          </details>
        )}
      </div>
    </div>
  );
};

export default ClipPreview; 