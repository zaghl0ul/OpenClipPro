import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { DashboardStats, RecentActivity, Project } from '../types';

// Mock data - in real app, this would come from Firebase/API
const mockStats: DashboardStats = {
  totalProjects: 4,
  totalVideos: 15,
  totalClips: 42,
  completedAnalyses: 12,
  processingAnalyses: 3,
  creditsUsed: 78,
  creditsRemaining: 22,
  averageViralScore: 76
};

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'analysis_completed',
    title: 'Analysis completed for Summer Vlog #3',
    description: 'Found 4 viral moments with 89% average score',
    timestamp: new Date('2024-01-20T10:30:00') as any,
    projectId: '1'
  },
  {
    id: '2',
    type: 'video_uploaded',
    title: 'New video uploaded to Product Launch',
    description: 'Marketing_Video_Final.mp4 (45MB)',
    timestamp: new Date('2024-01-20T09:15:00') as any,
    projectId: '2'
  },
  {
    id: '3',
    type: 'project_created',
    title: 'Created new project: Brand Campaign',
    description: 'Multi-platform campaign for Q1',
    timestamp: new Date('2024-01-19T16:45:00') as any,
    projectId: '3'
  }
];

const mockRecentProjects: Project[] = [
  {
    id: '1',
    name: 'Summer Vlog Series',
    description: 'Weekly summer content for TikTok and YouTube Shorts',
    type: 'multi-platform',
    status: 'active',
    userId: 'user1',
    createdAt: new Date('2024-01-15') as any,
    updatedAt: new Date('2024-01-20') as any,
    settings: {
      defaultPlatform: 'tiktok',
      contentTypes: ['engagement', 'comedy'],
      analysisPreferences: {
        defaultDuration: { min: 15, max: 60 },
        preferredProviders: ['gemini'],
        autoQuickAnalysis: true
      }
    },
    stats: {
      totalVideos: 8,
      totalClips: 24,
      completedAnalyses: 6,
      processingAnalyses: 2,
      averageViralScore: 84,
      totalProcessingTime: 45,
      creditsUsed: 12
    },
    tags: ['summer', 'lifestyle']
  },
  {
    id: '2',
    name: 'Product Launch Campaign',
    description: 'Marketing content for new product announcement',
    type: 'instagram',
    status: 'processing',
    userId: 'user1',
    createdAt: new Date('2024-01-10') as any,
    updatedAt: new Date('2024-01-18') as any,
    settings: {
      defaultPlatform: 'instagram-reels',
      contentTypes: ['monetization', 'engagement'],
      analysisPreferences: {
        defaultDuration: { min: 30, max: 90 },
        preferredProviders: ['openai'],
        autoQuickAnalysis: false
      }
    },
    stats: {
      totalVideos: 5,
      totalClips: 12,
      completedAnalyses: 4,
      processingAnalyses: 1,
      averageViralScore: 72,
      totalProcessingTime: 35,
      creditsUsed: 8
    },
    tags: ['product', 'marketing']
  }
];

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, change, changeType, color }) => (
  <div className="card p-6 transition-all duration-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-${color}-500/20`}>
          <span className={`text-${color}-400 text-2xl`}>{icon}</span>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">{value}</div>
          <div className="text-sm text-secondary">{label}</div>
        </div>
      </div>
      {change && (
        <div className={`text-sm font-medium ${
          changeType === 'positive' ? 'text-green-400' :
          changeType === 'negative' ? 'text-red-400' : 'text-gray-400'
        }`}>
          {change}
        </div>
      )}
    </div>
  </div>
);

interface QuickActionProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  color?: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, title, description, onClick, color = 'primary' }) => (
  <button
    onClick={onClick}
    className="w-full p-4 card text-left group"
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-${color}-500/20 group-hover:bg-${color}-500/30 transition-colors`}>
        <span className={`text-${color}-400 text-xl`}>{icon}</span>
      </div>
      <div>
        <div className="font-medium text-primary group-hover:text-accent transition-colors">{title}</div>
        <div className="text-sm text-secondary">{description}</div>
      </div>
    </div>
  </button>
);

interface ActivityItemProps {
  activity: RecentActivity;
  onClick?: () => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onClick }) => {
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'project_created': return '📁';
      case 'video_uploaded': return '📹';
      case 'analysis_completed': return '✅';
      case 'clip_generated': return '🎬';
      default: return '📋';
    }
  };

  const formatTimestamp = (timestamp: any) => {
    const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div 
      onClick={onClick}
      className={`flex items-start gap-3 p-3 rounded-lg hover:bg-tertiary/30 transition-colors ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <span className="text-lg">{getActivityIcon(activity.type)}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-primary text-sm">{activity.title}</div>
        <div className="text-xs text-secondary mt-1">{activity.description}</div>
        <div className="text-xs text-tertiary mt-2">{formatTimestamp(activity.timestamp)}</div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {

  const navigate = useNavigate();
  const [stats] = useState<DashboardStats>(mockStats);
  const [recentActivity] = useState<RecentActivity[]>(mockRecentActivity);
  const [recentProjects] = useState<Project[]>(mockRecentProjects);

  const handleNewProject = () => {
    navigate('/projects/new');
  };

  const handleBrowseProjects = () => {
    navigate('/projects');
  };



  const handleUploadVideo = () => {
    // For now, navigate to projects to upload within a project
    navigate('/projects');
  };

  const handleViewAllClips = () => {
    navigate('/clips');
  };

  const handleAnalytics = () => {
    navigate('/analytics');
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleActivityClick = (activity: RecentActivity) => {
    if (activity.projectId) {
      navigate(`/projects/${activity.projectId}`);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-full bg-primary p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          {getGreeting()}, Creator!
        </h1>
        <p className="text-secondary">
          Welcome to OpenClip. Create, edit, and share your video clips with AI assistance.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={handleNewProject}
          className="btn-primary"
        >
          <span>+</span>
          New Project
        </button>
        <button
          onClick={handleBrowseProjects}
          className="btn-secondary"
        >
          <span>📁</span>
          Browse Projects
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="📁"
          label="Total Projects"
          value={stats.totalProjects}
          change="+2 this week"
          changeType="positive"
          color="blue"
        />
        <StatCard
          icon="🎬"
          label="Total Clips"
          value={stats.totalClips}
          change="+8 today"
          changeType="positive"
          color="green"
        />
        <StatCard
          icon="✅"
          label="Completed"
          value={stats.completedAnalyses}
          change="3 pending"
          changeType="neutral"
          color="purple"
        />
        <StatCard
          icon="⏳"
          label="Processing"
          value={stats.processingAnalyses}
          change="-1 from yesterday"
          changeType="positive"
          color="yellow"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-primary mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <QuickAction
              icon="📁"
              title="New Project"
              description="Start from scratch"
              onClick={handleNewProject}
              color="blue"
            />
            <QuickAction
              icon="📹"
              title="Upload Video"
              description="Import your video files"
              onClick={handleUploadVideo}
              color="green"
            />
            <QuickAction
              icon="🎬"
              title="View All Clips"
              description="Browse your content"
              onClick={handleViewAllClips}
              color="purple"
            />
            <QuickAction
              icon="📊"
              title="Analytics"
              description="View performance data"
              onClick={handleAnalytics}
              color="yellow"
            />
          </div>
        </div>

        {/* Recent Projects */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-primary">Recent Projects</h2>
            <Link 
              to="/projects"
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentProjects.slice(0, 4).map(project => (
              <div 
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-tertiary/30 cursor-pointer transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${
                  project.status === 'active' ? 'bg-green-500' :
                  project.status === 'processing' ? 'bg-yellow-500' :
                  project.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-primary text-sm truncate">{project.name}</div>
                  <div className="text-xs text-secondary">
                    {project.stats.totalVideos} clips • {project.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary-400">
                    {project.stats.averageViralScore}%
                  </div>
                  <div className="text-xs text-gray-500">score</div>
                </div>
              </div>
            ))}
          </div>

          {recentProjects.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📁</div>
              <div className="text-sm text-gray-400 mb-4">No projects yet</div>
              <button
                onClick={handleNewProject}
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Create your first project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="card p-6">
                      <h2 className="text-xl font-semibold text-primary mb-6">Recent Activity</h2>
          
          <div className="space-y-2">
            {recentActivity.slice(0, 5).map(activity => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onClick={() => handleActivityClick(activity)}
              />
            ))}
          </div>

          {recentActivity.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📋</div>
              <div className="text-sm text-gray-400">No recent activity</div>
            </div>
          )}
        </div>
      </div>

      {/* Credits Status */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-primary-900/50 to-purple-900/50 rounded-xl border border-primary-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Credits Remaining</h3>
              <p className="text-gray-300 text-sm">
                You have <span className="font-medium text-primary-400">{stats.creditsRemaining}</span> credits remaining this month
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-400">{stats.creditsRemaining}</div>
              <div className="text-sm text-gray-400">credits</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Usage this month</span>
              <span>{stats.creditsUsed} / {stats.creditsUsed + stats.creditsRemaining} used</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(stats.creditsUsed / (stats.creditsUsed + stats.creditsRemaining)) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;