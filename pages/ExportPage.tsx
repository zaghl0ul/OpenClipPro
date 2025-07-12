import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Check, 
  X, 
  Settings, 
  FolderOpen,
  FileVideo,
  Clock,
  HardDrive,
  Globe,
  Share2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAnalyses } from '../hooks/useAnalyses';
import { Clip, VideoClip, ClipGenerationOptions } from '../types';

interface ExportPageProps {}

interface ExportJob {
  id: string;
  clipId: string;
  clipTitle: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  format: string;
  quality: string;
  aspectRatio: string;
  size?: number;
  url?: string;
  error?: string;
}

const ExportPage: React.FC<ExportPageProps> = () => {
  const { analyses } = useAnalyses();
  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [exportSettings, setExportSettings] = useState<ClipGenerationOptions>({
    format: 'mp4',
    quality: 'high',
    aspectRatio: '16:9',
    useCloud: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Get all clips from analyses
  const allClips = analyses.flatMap(analysis => analysis.clips);

  const handleClipSelection = (clipId: string) => {
    setSelectedClips(prev => 
      prev.includes(clipId) 
        ? prev.filter(id => id !== clipId)
        : [...prev, clipId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClips.length === allClips.length) {
      setSelectedClips([]);
    } else {
      setSelectedClips(allClips.map(clip => clip.id));
    }
  };

  const handleExportClips = async () => {
    if (selectedClips.length === 0) {
      toast.error('Please select at least one clip to export');
      return;
    }

    setIsExporting(true);
    
    // Create export jobs for selected clips
    const newJobs: ExportJob[] = selectedClips.map(clipId => {
      const clip = allClips.find(c => c.id === clipId);
      return {
        id: `export-${Date.now()}-${clipId}`,
        clipId,
        clipTitle: clip?.title || 'Unknown Clip',
        status: 'pending',
        progress: 0,
        format: exportSettings.format,
        quality: exportSettings.quality,
        aspectRatio: exportSettings.aspectRatio
      };
    });

    setExportJobs(prev => [...prev, ...newJobs]);

    // Simulate export process
    for (const job of newJobs) {
      try {
        // Update job status to processing
        setExportJobs(prev => 
          prev.map(j => j.id === job.id ? { ...j, status: 'processing' } : j)
        );

        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setExportJobs(prev => 
            prev.map(j => j.id === job.id ? { ...j, progress } : j)
          );
        }

        // Mark as completed
        setExportJobs(prev => 
          prev.map(j => j.id === job.id ? { 
            ...j, 
            status: 'completed',
            progress: 100,
            size: Math.floor(Math.random() * 50000000) + 10000000, // Mock file size
            url: `https://example.com/exports/${job.id}.${exportSettings.format}`
          } : j)
        );

        toast.success(`Exported: ${job.clipTitle}`);
      } catch (error) {
        setExportJobs(prev => 
          prev.map(j => j.id === job.id ? { 
            ...j, 
            status: 'failed',
            error: 'Export failed'
          } : j)
        );
        toast.error(`Failed to export: ${job.clipTitle}`);
      }
    }

    setIsExporting(false);
    setSelectedClips([]);
  };

  const handleDownloadJob = (job: ExportJob) => {
    if (job.url) {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = job.url;
      link.download = `${job.clipTitle}.${job.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    }
  };

  const handleDeleteJob = (jobId: string) => {
    setExportJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed': return <Check size={16} />;
      case 'processing': return <Clock size={16} />;
      case 'failed': return <X size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Download className="text-primary-400" size={24} />
              <h1 className="text-xl font-semibold text-white">Export Clips</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Export Settings"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleExportClips}
                disabled={selectedClips.length === 0 || isExporting}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Download size={16} />
                <span>{isExporting ? 'Exporting...' : 'Export Selected'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Clips Selection */}
          <div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Select Clips to Export</h2>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  {selectedClips.length === allClips.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allClips.map((clip) => (
                  <div
                    key={clip.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedClips.includes(clip.id)
                        ? 'border-primary-500 bg-primary-500 bg-opacity-10'
                        : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => handleClipSelection(clip.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium text-sm truncate">{clip.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-primary-400 font-medium text-sm">{clip.viralScore.overall}</span>
                        {selectedClips.includes(clip.id) && (
                          <Check size={16} className="text-primary-400" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">{clip.reason}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{Math.floor(clip.startTime / 60)}:{String(Math.floor(clip.startTime % 60)).padStart(2, '0')} - {Math.floor(clip.endTime / 60)}:{String(Math.floor(clip.endTime % 60)).padStart(2, '0')}</span>
                      <span>{Math.floor((clip.endTime - clip.startTime) / 60)}:{String(Math.floor((clip.endTime - clip.startTime) % 60)).padStart(2, '0')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {allClips.length === 0 && (
                <div className="text-center py-8">
                  <FileVideo size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No clips available</p>
                  <p className="text-gray-500 text-sm">Upload and analyze videos to create clips</p>
                </div>
              )}
            </div>

            {/* Export Settings Summary */}
            <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Export Settings</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Format:</span>
                  <span className="text-white ml-2 capitalize">{exportSettings.format}</span>
                </div>
                <div>
                  <span className="text-gray-400">Quality:</span>
                  <span className="text-white ml-2 capitalize">{exportSettings.quality}</span>
                </div>
                <div>
                  <span className="text-gray-400">Aspect Ratio:</span>
                  <span className="text-white ml-2">{exportSettings.aspectRatio}</span>
                </div>
                <div>
                  <span className="text-gray-400">Processing:</span>
                  <span className="text-white ml-2">{exportSettings.useCloud ? 'Cloud' : 'Local'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Jobs */}
          <div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Export Jobs</h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {exportJobs.map((job) => (
                  <div key={job.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm truncate">{job.clipTitle}</h4>
                        <p className="text-xs text-gray-400">
                          {job.format.toUpperCase()} • {job.quality} • {job.aspectRatio}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center space-x-1 ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)}
                          <span className="text-xs capitalize">{job.status}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {job.status === 'processing' && (
                      <div className="mb-3">
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-primary-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{job.progress}% complete</p>
                      </div>
                    )}

                    {job.status === 'completed' && job.size && (
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <HardDrive size={12} />
                          <span>{formatFileSize(job.size)}</span>
                        </div>
                        <button
                          onClick={() => handleDownloadJob(job)}
                          className="flex items-center space-x-1 px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs transition-colors"
                        >
                          <Download size={12} />
                          <span>Download</span>
                        </button>
                      </div>
                    )}

                    {job.status === 'failed' && job.error && (
                      <p className="text-xs text-red-400">{job.error}</p>
                    )}
                  </div>
                ))}
              </div>

              {exportJobs.length === 0 && (
                <div className="text-center py-8">
                  <Download size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No export jobs</p>
                  <p className="text-gray-500 text-sm">Select clips and start exporting</p>
                </div>
              )}
            </div>

            {/* Export Statistics */}
            {exportJobs.length > 0 && (
              <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Export Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Total Jobs:</span>
                    <span className="text-white ml-2">{exportJobs.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Completed:</span>
                    <span className="text-white ml-2">{exportJobs.filter(j => j.status === 'completed').length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Processing:</span>
                    <span className="text-white ml-2">{exportJobs.filter(j => j.status === 'processing').length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Failed:</span>
                    <span className="text-white ml-2">{exportJobs.filter(j => j.status === 'failed').length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Export Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Format</label>
                <select
                  value={exportSettings.format}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="mp4">MP4</option>
                  <option value="webm">WebM</option>
                  <option value="mov">MOV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Quality</label>
                <select
                  value={exportSettings.quality}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, quality: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Aspect Ratio</label>
                <select
                  value={exportSettings.aspectRatio}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, aspectRatio: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="original">Original</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useCloud"
                  checked={exportSettings.useCloud}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, useCloud: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="useCloud" className="text-sm text-gray-400">
                  Use cloud processing (faster, uses credits)
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPage;