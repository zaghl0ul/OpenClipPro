import React, { useState } from 'react';
import { Upload, Link, Camera, FolderOpen } from 'lucide-react';

interface InputTabsProps {
  onVideoSelect: (file: File) => void;
  onUrlSubmit?: (url: string) => void;
  onCameraCapture?: (blob: Blob) => void;
}

const InputTabs: React.FC<InputTabsProps> = ({ 
  onVideoSelect, 
  onUrlSubmit, 
  onCameraCapture 
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'camera'>('upload');
  const [url, setUrl] = useState('');

  const tabs = [
    {
      id: 'upload',
      label: 'Upload File',
      icon: Upload,
      description: 'Upload a video file from your device'
    },
    {
      id: 'url',
      label: 'Video URL',
      icon: Link,
      description: 'Enter a video URL to analyze'
    },
    {
      id: 'camera',
      label: 'Camera',
      icon: Camera,
      description: 'Record a video using your camera'
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onVideoSelect(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && onUrlSubmit) {
      onUrlSubmit(url.trim());
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Implementation for camera capture would go here
      // For now, just show a placeholder
      console.log('Camera capture not implemented yet');
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
            }`}
          >
            <tab.icon size={18} />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'upload' && (
          <div className="text-center">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 hover:border-primary-500 transition-colors">
              <Upload size={48} className="text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Upload Video File</h3>
              <p className="text-gray-400 mb-6">
                Drag and drop your video file here, or click to browse
              </p>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg cursor-pointer transition-colors"
              >
                <FolderOpen size={18} />
                <span>Choose File</span>
              </label>
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: MP4, WebM, MOV, AVI (Max 500MB)
              </p>
            </div>
          </div>
        )}

        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Video URL</h3>
              <p className="text-gray-400 mb-4">
                Enter a direct link to a video file or YouTube URL
              </p>
            </div>
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                disabled={!url.trim()}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Link size={18} />
                <span>Analyze Video</span>
              </button>
            </form>
            <p className="text-xs text-gray-500">
              Supported: Direct video links, YouTube URLs, Vimeo URLs
            </p>
          </div>
        )}

        {activeTab === 'camera' && (
          <div className="text-center">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8">
              <Camera size={48} className="text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Camera Recording</h3>
              <p className="text-gray-400 mb-6">
                Record a video using your device's camera
              </p>
              <button
                onClick={handleCameraCapture}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Camera size={18} />
                <span>Start Recording</span>
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Camera access required • Recording time limit: 5 minutes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputTabs;