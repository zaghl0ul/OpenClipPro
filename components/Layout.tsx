import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Project, DashboardStats } from '../types';

// Icons (simplified as text for now, can be replaced with proper icon library)
const Icons = {
  Dashboard: '🏠',
  Projects: '📁',
  AllClips: '🎬',
  Analytics: '📊',
  Settings: '⚙️',
  QuickAnalyze: '⚡',
  TrimClips: '✂️',
  Export: '📤',
  Search: '🔍',
  Notifications: '🔔',
  User: '👤',
  Plus: '+',
  ChevronDown: '▼',
  ChevronUp: '▲',
  Dot: '•'
};

interface SidebarItemProps {
  icon: string;
  label: string;
  to?: string;
  onClick?: () => void;
  isActive?: boolean;
  count?: number;
  children?: React.ReactNode;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  to, 
  onClick, 
  isActive = false, 
  count,
  children 
}) => {
  const content = (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
      isActive 
        ? 'bg-primary-600/20 text-primary-300 border-l-2 border-primary-400' 
        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
    }`}>
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
      {count !== undefined && (
        <span className="ml-auto text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
      {children}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
};

interface QuickToolProps {
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
}

const QuickTool: React.FC<QuickToolProps> = ({ icon, label, description, onClick }) => (
  <div 
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg cursor-pointer transition-all duration-200"
  >
    <span className="text-lg">{icon}</span>
    <div className="flex-1">
      <div className="font-medium text-sm">{label}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  </div>
);

interface RecentProjectProps {
  project: {
    id: string;
    name: string;
    clipCount: number;
    status: 'active' | 'completed' | 'processing';
  };
  onClick: () => void;
}

const RecentProject: React.FC<RecentProjectProps> = ({ project, onClick }) => {
  const statusColor = {
    active: 'bg-green-500',
    completed: 'bg-blue-500',
    processing: 'bg-yellow-500'
  }[project.status];

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg cursor-pointer transition-all duration-200"
    >
      <div className={`w-2 h-2 rounded-full ${statusColor}`} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-white truncate">{project.name}</div>
        <div className="text-xs text-gray-500">
          {project.clipCount} clips • {project.status}
        </div>
      </div>
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [quickToolsExpanded, setQuickToolsExpanded] = useState(false);
  const [recentProjectsExpanded, setRecentProjectsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load stats from your data source (Firebase, API, etc.)
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

  const [recentProjects, setRecentProjects] = useState<{
    id: string;
    name: string;
    clipCount: number;
    status: 'active' | 'completed' | 'processing';
  }[]>([]);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        // TODO: Replace with actual data loading
        // const userStats = await fetchUserStats(user.uid);
        // const userRecentProjects = await fetchRecentProjects(user.uid, 5);
        // setStats(userStats);
        // setRecentProjects(userRecentProjects);
      }
    };

    loadUserData();
  }, [user]);

  const handleQuickAnalyze = () => {
    navigate('/app/quick-analyze');
  };

  const handleTrimClips = () => {
    navigate('/app/trim-clips');
  };

  const handleExport = () => {
    navigate('/app/export');
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/app/projects/${projectId}`);
  };

  const handleNewProject = () => {
    navigate('/app/projects/new');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="h-screen flex bg-primary text-primary">
      {/* Sidebar */}
      <div className="w-64 bg-secondary border-r border-primary flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-primary">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OC</span>
            </div>
            <span className="font-bold text-lg">OpenClip</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-1">
            {/* Main Navigation */}
            <SidebarItem 
              icon={Icons.Dashboard} 
              label="Dashboard" 
              to="/app/dashboard"
              isActive={isActiveRoute('/app/dashboard')}
            />
            <SidebarItem 
              icon={Icons.Projects} 
              label="Projects" 
              to="/app/projects"
              isActive={isActiveRoute('/app/projects')}
              count={stats.totalProjects}
            />
            <SidebarItem 
              icon={Icons.AllClips} 
              label="All Clips" 
              to="/app/clips"
              isActive={isActiveRoute('/app/clips')}
              count={stats.totalClips}
            />
            <SidebarItem 
              icon={Icons.Analytics} 
              label="Analytics" 
              to="/app/analytics"
              isActive={isActiveRoute('/app/analytics')}
            />
            <SidebarItem 
              icon={Icons.Settings} 
              label="Settings" 
              to="/app/settings"
              isActive={isActiveRoute('/app/settings')}
            />
          </div>

          {/* Quick Tools Section */}
          <div className="px-4 mt-6">
            <div 
              className="flex items-center justify-between cursor-pointer mb-3"
              onClick={() => setQuickToolsExpanded(!quickToolsExpanded)}
            >
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Tools
              </span>
              <span className="text-gray-500">
                {quickToolsExpanded ? Icons.ChevronUp : Icons.ChevronDown}
              </span>
            </div>
            
            {quickToolsExpanded && (
              <div className="space-y-1 ml-2">
                <QuickTool 
                  icon={Icons.QuickAnalyze}
                  label="Quick Analyze"
                  description="Fast viral scan"
                  onClick={handleQuickAnalyze}
                />
                <QuickTool 
                  icon={Icons.TrimClips}
                  label="Trim Clips"
                  description="Cut and edit clips"
                  onClick={handleTrimClips}
                />
                <QuickTool 
                  icon={Icons.Export}
                  label="Export"
                  description="Download clips"
                  onClick={handleExport}
                />
              </div>
            )}
          </div>

          {/* Recent Projects Section */}
          <div className="px-4 mt-6">
            <div 
              className="flex items-center justify-between cursor-pointer mb-3"
              onClick={() => setRecentProjectsExpanded(!recentProjectsExpanded)}
            >
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recent Projects
              </span>
              <span className="text-gray-500">
                {recentProjectsExpanded ? Icons.ChevronUp : Icons.ChevronDown}
              </span>
            </div>
            
            {recentProjectsExpanded && (
              <div className="space-y-1 ml-2">
                {recentProjects.slice(0, 5).map(project => (
                  <RecentProject 
                    key={project.id}
                    project={project}
                    onClick={() => handleProjectClick(project.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="px-4 mt-6">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Stats
            </div>
            <div className="space-y-2 ml-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Credits</span>
                <span className="text-white">{stats.creditsRemaining}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Processing</span>
                <span className="text-yellow-400">{stats.processingAnalyses}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Avg Score</span>
                <span className="text-green-400">{stats.averageViralScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-sm">{Icons.User}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Creator</div>
              <div className="text-xs text-gray-400">Free Plan</div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors"
              title="Logout"
            >
              ↗
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="h-16 bg-secondary border-b border-primary flex items-center justify-between px-6">
          {/* Navigation Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <Link to="/app/dashboard" className="text-gray-400 hover:text-white">
              {Icons.Dashboard} Dashboard
            </Link>
            {location.pathname !== '/app/dashboard' && (
              <>
                <span className="text-gray-600">/</span>
                <span className="text-white capitalize">
                  {location.pathname.split('/')[2] || 'Page'}
                </span>
              </>
            )}
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                {Icons.Search}
              </span>
            </div>

            {/* New Project Button */}
            <button
              onClick={handleNewProject}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              <span>{Icons.Plus}</span>
              New Project
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              {Icons.Notifications}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <Link 
              to="/app/settings"
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {Icons.Settings}
            </Link>

            {/* User Avatar */}
            <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;