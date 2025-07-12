import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Award,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAnalyses } from '../hooks/useAnalyses';
import { Project, DashboardStats, RecentActivity } from '../types';

interface AnalyticsPageProps {}

const AnalyticsPage: React.FC<AnalyticsPageProps> = () => {
  const { user } = useAuth();
  const { analyses } = useAnalyses();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalVideos: 0,
    totalClips: 0,
    completedAnalyses: 0,
    processingAnalyses: 0,
    creditsUsed: 0,
    creditsRemaining: 1000,
    averageViralScore: 0
  });
  
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calculate analytics from analyses data
    const calculateStats = () => {
      const completedAnalyses = analyses.filter(a => a.status === 'completed');
      const processingAnalyses = analyses.filter(a => a.status === 'processing');
      
      const totalClips = completedAnalyses.reduce((sum, analysis) => 
        sum + analysis.clips.length, 0
      );
      
      const totalViralScore = completedAnalyses.reduce((sum, analysis) => 
        sum + analysis.clips.reduce((clipSum, clip) => 
          clipSum + clip.viralScore.overall, 0
        ), 0
      );
      
      const averageViralScore = totalClips > 0 ? totalViralScore / totalClips : 0;
      
      setStats({
        totalProjects: 5, // Mock data
        totalVideos: analyses.length,
        totalClips,
        completedAnalyses: completedAnalyses.length,
        processingAnalyses: processingAnalyses.length,
        creditsUsed: analyses.length * 10, // Mock calculation
        creditsRemaining: 1000 - (analyses.length * 10),
        averageViralScore: Math.round(averageViralScore)
      });
      
      setLoading(false);
    };

    calculateStats();
  }, [analyses]);

  const getTopPerformingClips = () => {
    return analyses
      .flatMap(analysis => analysis.clips)
      .sort((a, b) => b.viralScore.overall - a.viralScore.overall)
      .slice(0, 5);
  };

  const getPlatformBreakdown = () => {
    const platforms = ['tiktok', 'youtube-shorts', 'instagram-reels'];
    return platforms.map(platform => ({
      platform,
      count: Math.floor(Math.random() * 20) + 5, // Mock data
      averageScore: Math.floor(Math.random() * 30) + 60
    }));
  };

  const getContentTypeBreakdown = () => {
    const types = ['comedy', 'engagement', 'action', 'emotional', 'educational'];
    return types.map(type => ({
      type,
      count: Math.floor(Math.random() * 15) + 3,
      averageScore: Math.floor(Math.random() * 30) + 60
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BarChart3 className="text-primary-400" size={24} />
              <h1 className="text-xl font-semibold text-white">Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Projects</p>
                <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
                <p className="text-xs text-green-400">+12% from last month</p>
              </div>
              <BarChart3 className="text-primary-400" size={24} />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Videos</p>
                <p className="text-2xl font-bold text-white">{stats.totalVideos}</p>
                <p className="text-xs text-green-400">+8% from last month</p>
              </div>
              <TrendingUp className="text-primary-400" size={24} />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Clips</p>
                <p className="text-2xl font-bold text-white">{stats.totalClips}</p>
                <p className="text-xs text-green-400">+15% from last month</p>
              </div>
              <Target className="text-primary-400" size={24} />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg Viral Score</p>
                <p className="text-2xl font-bold text-white">{stats.averageViralScore}</p>
                <p className="text-xs text-green-400">+5% from last month</p>
              </div>
              <Award className="text-primary-400" size={24} />
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Metrics */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Completed Analyses</span>
                <span className="text-white font-medium">{stats.completedAnalyses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Processing Analyses</span>
                <span className="text-white font-medium">{stats.processingAnalyses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Credits Used</span>
                <span className="text-white font-medium">{stats.creditsUsed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Credits Remaining</span>
                <span className="text-white font-medium">{stats.creditsRemaining}</span>
              </div>
            </div>
          </div>

          {/* Platform Performance */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Platform Performance</h3>
            <div className="space-y-4">
              {getPlatformBreakdown().map((platform) => (
                <div key={platform.platform} className="flex items-center justify-between">
                  <span className="text-gray-400 capitalize">{platform.platform.replace('-', ' ')}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-medium">{platform.count} clips</span>
                    <span className="text-primary-400 font-medium">{platform.averageScore} avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Type Analysis */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Content Type Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {getContentTypeBreakdown().map((contentType) => (
              <div key={contentType.type} className="text-center p-4 bg-gray-700 rounded-lg">
                <h4 className="text-white font-medium capitalize mb-2">{contentType.type}</h4>
                <p className="text-2xl font-bold text-primary-400">{contentType.count}</p>
                <p className="text-sm text-gray-400">{contentType.averageScore} avg score</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Clips */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Top Performing Clips</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
          <div className="space-y-4">
            {getTopPerformingClips().map((clip, index) => (
              <div key={clip.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{clip.title}</h4>
                    <p className="text-sm text-gray-400">{clip.reason}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-white font-medium">{clip.viralScore.overall} viral score</p>
                    <p className="text-sm text-gray-400">
                      {Math.floor(clip.startTime / 60)}:{String(Math.floor(clip.startTime % 60)).padStart(2, '0')} - 
                      {Math.floor(clip.endTime / 60)}:{String(Math.floor(clip.endTime % 60)).padStart(2, '0')}
                    </p>
                  </div>
                  <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-400 rounded-full"
                      style={{ width: `${clip.viralScore.overall}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Viral Score Trend */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Viral Score Trend</h3>
            <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Chart visualization would go here</p>
            </div>
          </div>

          {/* Content Performance */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Content Performance</h3>
            <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Chart visualization would go here</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {analyses.slice(0, 5).map((analysis) => (
              <div key={analysis.id} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Analysis completed for {analysis.videoFileName}</p>
                  <p className="text-sm text-gray-400">
                    {analysis.clips.length} clips generated • {analysis.clips.length > 0 ? 
                      Math.round(analysis.clips.reduce((sum, clip) => sum + clip.viralScore.overall, 0) / analysis.clips.length) : 0} avg score
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;