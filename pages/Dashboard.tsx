import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { DashboardStats, RecentActivity, Project } from '../types';

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

  const formatTimestamp = (timestamp: unknown) => {
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
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalVideos: 0,
    totalClips: 0,
    completedAnalyses: 0,
    processingAnalyses: 0,
    creditsUsed: 0,
    creditsRemaining: 0,
    averageViralScore: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API calls
        // const dashboardStats = await fetchDashboardStats();
        // const activities = await fetchRecentActivity();
        // const projects = await fetchRecentProjects();
        // setStats(dashboardStats);
        // setRecentActivity(activities);
        // setRecentProjects(projects);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleNewProject = () => {
    navigate('/app/projects/new');
  };

  const handleBrowseProjects = () => {
    navigate('/app/projects');
  };

  const handleUploadVideo = () => {
    // For now, navigate to projects to upload within a project
    navigate('/app/projects');
  };

  const handleViewAllClips = () => {
    navigate('/app/clips');
  };

  const handleAnalytics = () => {
    navigate('/app/analytics');
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/app/projects/${projectId}`);
  };

  const handleActivityClick = (activity: RecentActivity) => {
    if (activity.projectId) {
      navigate(`/app/projects/${activity.projectId}`);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {getGreeting()}, welcome back!
          </h1>
          <p className="text-secondary">
            Here's what's happening with your video projects today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="📁"
            label="Total Projects"
            value={stats.totalProjects}
            color="blue"
          />
          <StatCard
            icon="📹"
            label="Total Videos"
            value={stats.totalVideos}
            color="purple"
          />
          <StatCard
            icon="🎬"
            label="Total Clips"
            value={stats.totalClips}
            color="green"
          />
          <StatCard
            icon="📊"
            label="Avg Viral Score"
            value={`${stats.averageViralScore}%`}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-primary mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <QuickAction
                icon="📁"
                title="Create New Project"
                description="Start a new video project"
                onClick={handleNewProject}
                color="blue"
              />
              <QuickAction
                icon="📹"
                title="Upload Video"
                description="Add a new video to analyze"
                onClick={handleUploadVideo}
                color="purple"
              />
              <QuickAction
                icon="🎬"
                title="View All Clips"
                description="Browse all generated clips"
                onClick={handleViewAllClips}
                color="green"
              />
              <QuickAction
                icon="📊"
                title="View Analytics"
                description="Check your performance metrics"
                onClick={handleAnalytics}
                color="orange"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-primary mb-4">Recent Activity</h2>
            <div className="space-y-2">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onClick={() => handleActivityClick(activity)}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-secondary">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary">Recent Projects</h2>
              <button
                onClick={handleBrowseProjects}
                className="text-accent hover:text-primary transition-colors"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className="card p-4 cursor-pointer hover:border-accent transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-primary">{project.name}</h3>
                      <span className={`badge ${
                        project.status === 'active' ? 'badge-success' :
                        project.status === 'processing' ? 'badge-warning' :
                        'badge-secondary'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-secondary mb-2 line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-tertiary">
                      <span>{project.stats.totalVideos} videos</span>
                      <span>{project.stats.totalClips} clips</span>
                      <span>{project.stats.averageViralScore}% avg score</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-secondary mb-4">No projects yet</p>
                  <button
                    onClick={handleNewProject}
                    className="btn btn-primary"
                  >
                    Create Your First Project
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Processing Status */}
        {stats.processingAnalyses > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-primary mb-4">Currently Processing</h2>
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="loading-spinner"></div>
                <div>
                  <p className="text-primary font-medium">
                    {stats.processingAnalyses} analysis{stats.processingAnalyses > 1 ? 'es' : ''} in progress
                  </p>
                  <p className="text-secondary text-sm">
                    This may take a few minutes to complete
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Credits Status */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-primary mb-4">Credits</h2>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary font-medium">Credits Remaining</p>
                <p className="text-secondary text-sm">
                  {stats.creditsUsed} used • {stats.creditsRemaining} remaining
                </p>
              </div>
              <div className="progress w-32">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${Math.max(0, Math.min(100, (stats.creditsRemaining / (stats.creditsUsed + stats.creditsRemaining)) * 100))}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;