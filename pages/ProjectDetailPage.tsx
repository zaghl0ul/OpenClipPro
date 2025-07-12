import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Plus, 
  Upload, 
  Settings, 
  BarChart3, 
  Download, 
  Edit3, 
  Trash2,
  Play,
  Pause,
  Clock,
  FileVideo,
  TrendingUp,
  Users,
  Calendar,
  Tag
} from 'lucide-react';
import { Project, ProjectVideo, QuickAnalysisResult, Clip } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useAnalyses } from '../hooks/useAnalyses';
import ClipCard from '../components/ClipCard';
import VideoInput from '../components/VideoInput';
import AnalysisSettings from '../components/AnalysisSettings';

interface ProjectDetailPageProps {}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { analyses, isProcessing } = useAnalyses();
  
  const [project, setProject] = useState<Project | null>(null);
  const [videos, setVideos] = useState<ProjectVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<ProjectVideo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    if (projectId) {
      // Simulate loading project data
      setTimeout(() => {
        setProject({
          id: projectId,
          name: "My Viral Content Project",
          description: "A collection of viral-worthy clips from my content library",
          type: "multi-platform",
          status: "active",
          userId: user?.uid || "",
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
          settings: {
            defaultPlatform: "tiktok",
            contentTypes: ["engagement", "comedy"],
            analysisPreferences: {
              defaultDuration: { min: 15, max: 60 },
              preferredProviders: ["gemini"],
              autoQuickAnalysis: true
            }
          },
          stats: {
            totalVideos: 12,
            totalClips: 45,
            completedAnalyses: 8,
            processingAnalyses: 2,
            averageViralScore: 78,
            totalProcessingTime: 120,
            creditsUsed: 150
          },
          tags: ["comedy", "viral", "trending"]
        });

        setVideos([
          {
            id: "1",
            projectId: projectId,
            fileName: "funny_moment.mp4",
            originalName: "funny_moment.mp4",
            size: 25000000,
            duration: 120,
            uploadedAt: new Date() as any,
            status: "analyzed",
            metadata: {
              width: 1920,
              height: 1080,
              fps: 30,
              codec: "h264",
              bitrate: 5000000,
              aspectRatio: "16:9",
              hasAudio: true
            },
            analysisJobs: ["job1", "job2"],
            tags: ["comedy", "viral"]
          },
          {
            id: "2",
            projectId: projectId,
            fileName: "dance_challenge.mp4",
            originalName: "dance_challenge.mp4",
            size: 35000000,
            duration: 180,
            uploadedAt: new Date() as any,
            status: "processing",
            metadata: {
              width: 1920,
              height: 1080,
              fps: 30,
              codec: "h264",
              bitrate: 6000000,
              aspectRatio: "16:9",
              hasAudio: true
            },
            analysisJobs: ["job3"],
            tags: ["dance", "challenge"]
          }
        ]);

        setLoading(false);
      }, 1000);
    }
  }, [projectId, user]);

  const handleVideoUpload = async (file: File) => {
    try {
      // Simulate video upload
      const newVideo: ProjectVideo = {
        id: Date.now().toString(),
        projectId: projectId!,
        fileName: file.name,
        originalName: file.name,
        size: file.size,
        duration: 0, // Would be extracted from video
        uploadedAt: new Date() as any,
        status: "uploading",
        metadata: {
          width: 1920,
          height: 1080,
          fps: 30,
          codec: "h264",
          bitrate: 5000000,
          aspectRatio: "16:9",
          hasAudio: true
        },
        analysisJobs: []
      };

      setVideos(prev => [...prev, newVideo]);
      setShowUploadModal(false);
      toast.success("Video uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload video");
    }
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    toast.success("Video deleted");
  };

  const handleQuickAnalysis = (videoId: string) => {
    // Navigate to quick analyze page with video pre-selected
    navigate(`/app/quick-analyze?videoId=${videoId}&projectId=${projectId}`);
  };

  const getProjectClips = () => {
    // Get clips from analyses that belong to this project
    return analyses.flatMap(analysis => 
      analysis.clips.map(clip => ({
        ...clip,
        projectId,
        videoId: analysis.videoFileName
      }))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Project Not Found</h2>
          <p className="text-gray-400 mb-6">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/app/projects')}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const clips = getProjectClips();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/app/projects')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">{project.name}</h1>
                <p className="text-sm text-gray-400">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Project Settings"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Upload size={16} />
                <span>Upload Video</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Videos</p>
                <p className="text-2xl font-bold text-white">{project.stats.totalVideos}</p>
              </div>
              <FileVideo className="text-primary-400" size={24} />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Clips</p>
                <p className="text-2xl font-bold text-white">{project.stats.totalClips}</p>
              </div>
              <TrendingUp className="text-primary-400" size={24} />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg Viral Score</p>
                <p className="text-2xl font-bold text-white">{project.stats.averageViralScore}</p>
              </div>
              <BarChart3 className="text-primary-400" size={24} />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Credits Used</p>
                <p className="text-2xl font-bold text-white">{project.stats.creditsUsed}</p>
              </div>
              <Users className="text-primary-400" size={24} />
            </div>
          </div>
        </div>

        {/* Project Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Tag size={20} className="mr-2" />
              Project Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-600 text-primary-100 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Videos Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Videos</h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>Add Video</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="aspect-video bg-gray-700 flex items-center justify-center">
                  <Play size={48} className="text-gray-500" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-white truncate">{video.originalName}</h3>
                      <p className="text-sm text-gray-400">
                        {Math.round(video.size / 1024 / 1024)}MB • {Math.round(video.duration)}s
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuickAnalysis(video.id)}
                        className="p-2 text-gray-400 hover:text-primary-400 transition-colors"
                        title="Quick Analysis"
                      >
                        <BarChart3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete Video"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        video.status === 'analyzed' ? 'bg-green-400' :
                        video.status === 'processing' ? 'bg-yellow-400' :
                        'bg-gray-400'
                      }`} />
                      <span className="text-sm text-gray-400 capitalize">{video.status}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <Calendar size={14} />
                      <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {video.tags && video.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {video.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clips Section */}
        {clips.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Generated Clips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clips.map((clip) => (
                <ClipCard key={clip.id} clip={clip} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Upload Video</h3>
            <VideoInput onVideoSelect={handleVideoUpload} />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Project Settings</h3>
            <AnalysisSettings />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save settings
                  setShowSettingsModal(false);
                  toast.success("Settings saved!");
                }}
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

export default ProjectDetailPage;