import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DashboardStats } from '../types';
import ThemeSwitcher from './ThemeSwitcher';

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
    <div className={`nav-link ${isActive ? 'active' : ''}`}>
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
      {count !== undefined && (
        <span className="ml-auto badge badge-secondary">
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
    className="nav-link"
  >
    <span className="text-lg">{icon}</span>
    <div className="flex-1">
      <div className="font-medium text-sm">{label}</div>
      <div className="text-xs text-tertiary">{description}</div>
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
    active: 'badge-success',
    completed: 'badge-primary',
    processing: 'badge-warning'
  }[project.status];

  return (
    <div 
      onClick={onClick}
      className="nav-link"
    >
      <div className={`w-2 h-2 rounded-full ${statusColor.replace('badge-', 'bg-')}`} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-primary truncate">{project.name}</div>
        <div className="text-xs text-tertiary">
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
  const [stats] = useState<DashboardStats>({
    totalProjects: 0,
    totalVideos: 0,
    totalClips: 0,
    completedAnalyses: 0,
    processingAnalyses: 0,
    creditsUsed: 0,
    creditsRemaining: 0,
    averageViralScore: 0
  });

  const [recentProjects] = useState<{
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
            <div className="w-8 h-8 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OC</span>
            </div>
            <span className="font-bold text-lg text-primary">OpenClip</span>
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
              className="flex items-center justify-between mb-3 cursor-pointer"
              onClick={() => setQuickToolsExpanded(!quickToolsExpanded)}
            >
              <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide">
                Quick Tools
              </h3>
              <span className="text-secondary">
                {quickToolsExpanded ? Icons.ChevronUp : Icons.ChevronDown}
              </span>
            </div>
            
            {quickToolsExpanded && (
              <div className="space-y-1 mb-6">
                <QuickTool
                  icon={Icons.QuickAnalyze}
                  label="Quick Analyze"
                  description="Fast video analysis"
                  onClick={handleQuickAnalyze}
                />
                <QuickTool
                  icon={Icons.TrimClips}
                  label="Trim Clips"
                  description="Edit video clips"
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
          <div className="px-4">
            <div 
              className="flex items-center justify-between mb-3 cursor-pointer"
              onClick={() => setRecentProjectsExpanded(!recentProjectsExpanded)}
            >
              <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide">
                Recent Projects
              </h3>
              <span className="text-secondary">
                {recentProjectsExpanded ? Icons.ChevronUp : Icons.ChevronDown}
              </span>
            </div>
            
            {recentProjectsExpanded && (
              <div className="space-y-1 mb-6">
                {recentProjects.length > 0 ? (
                  recentProjects.map(project => (
                    <RecentProject
                      key={project.id}
                      project={project}
                      onClick={() => handleProjectClick(project.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-tertiary text-sm mb-2">No recent projects</p>
                    <button
                      onClick={handleNewProject}
                      className="btn btn-primary btn-sm"
                    >
                      {Icons.Plus} New Project
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-primary">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm">{Icons.User}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-primary truncate">
                {user?.email || 'User'}
              </div>
              <div className="text-xs text-tertiary">
                {stats.creditsRemaining} credits remaining
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleNewProject}
              className="btn btn-primary btn-sm flex-1"
            >
              {Icons.Plus} New Project
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              title="Logout"
            >
              {Icons.User}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-secondary border-b border-primary flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects, clips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-64"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tertiary">
                {Icons.Search}
              </span>
            </div>
            <ThemeSwitcher />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="btn btn-ghost" title="Notifications">
              {Icons.Notifications}
            </button>
            <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm">{Icons.User}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;