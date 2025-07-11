import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Project, ProjectType, ProjectStatus, DashboardStats } from '../types';

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ProjectType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name' | 'score'>('updated');

  // Load projects from your data source (Firebase, API, etc.)
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual data loading
        // const projectsData = await fetchUserProjects(user?.uid);
        // setProjects(projectsData);
        setProjects([]);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProjects();
    }
  }, [user]);

  // Calculate dashboard stats
  const dashboardStats: DashboardStats = {
    totalProjects: projects.length,
    totalVideos: projects.reduce((sum, p) => sum + p.stats.totalVideos, 0),
    totalClips: projects.reduce((sum, p) => sum + p.stats.totalClips, 0),
    completedAnalyses: projects.reduce((sum, p) => sum + p.stats.completedAnalyses, 0),
    processingAnalyses: projects.reduce((sum, p) => sum + p.stats.processingAnalyses, 0),
    creditsUsed: projects.reduce((sum, p) => sum + p.stats.creditsUsed, 0),
    creditsRemaining: 5, // From user profile
    averageViralScore: projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.stats.averageViralScore, 0) / projects.length)
      : 0
  };

  // Filter and sort projects
  useEffect(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesType = typeFilter === 'all' || project.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          const bUpdated = (b.updatedAt as any).seconds ? (b.updatedAt as any).seconds * 1000 : (b.updatedAt as any).getTime();
          const aUpdated = (a.updatedAt as any).seconds ? (a.updatedAt as any).seconds * 1000 : (a.updatedAt as any).getTime();
          return bUpdated - aUpdated;
        case 'created':
          const bCreated = (b.createdAt as any).seconds ? (b.createdAt as any).seconds * 1000 : (b.createdAt as any).getTime();
          const aCreated = (a.createdAt as any).seconds ? (a.createdAt as any).seconds * 1000 : (a.createdAt as any).getTime();
          return bCreated - aCreated;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'score':
          return b.stats.averageViralScore - a.stats.averageViralScore;
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  }, [projects, searchQuery, statusFilter, typeFilter, sortBy]);

  const handleProjectClick = (projectId: string) => {
    navigate(`/app/projects/${projectId}`);
  };

  const handleNewProject = () => {
    navigate('/app/projects/new');
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
    const getStatusColor = (status: ProjectStatus) => {
      switch (status) {
        case 'active': return 'bg-green-500';
        case 'processing': return 'bg-yellow-500';
        case 'completed': return 'bg-blue-500';
        case 'archived': return 'bg-gray-500';
        default: return 'bg-gray-500';
      }
    };

    const getTypeIcon = (type: ProjectType) => {
      switch (type) {
        case 'youtube': return '📺';
        case 'tiktok': return '🎵';
        case 'instagram': return '📸';
        case 'multi-platform': return '🌐';
        case 'custom': return '⚙️';
        default: return '📁';
      }
    };

    const formatDate = (date: any) => {
      return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString();
    };

    return (
      <div 
        onClick={onClick}
        className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-primary-500/10"
      >
        {/* Project Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getTypeIcon(project.type)}</span>
              <div>
                <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {project.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
              <span className="text-xs text-gray-400 capitalize">
                {project.status}
              </span>
            </div>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-md"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-700 text-gray-400 rounded-md">
                  +{project.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Project Stats */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {project.stats.totalVideos}
              </div>
              <div className="text-xs text-gray-400">Videos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">
                {project.stats.totalClips}
              </div>
              <div className="text-xs text-gray-400">Clips</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Score:</span>
              <span className={`font-medium ${
                project.stats.averageViralScore >= 80 ? 'text-green-400' :
                project.stats.averageViralScore >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {project.stats.averageViralScore}%
              </span>
            </div>
            <div className="text-gray-500 text-xs">
              {formatDate(project.updatedAt)}
            </div>
          </div>

          {/* Progress for processing projects */}
          {project.status === 'processing' && project.stats.processingAnalyses > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Processing</span>
                <span>{project.stats.processingAnalyses} remaining</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.max(10, 100 - (project.stats.processingAnalyses / project.stats.totalVideos) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Good evening, Creator!
              </h1>
              <p className="text-gray-300">
                Manage your projects and create viral content with AI assistance.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleNewProject}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                <span>+</span>
                New Project
              </button>
              <Link
                to="/app/projects"
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                <span>📁</span>
                Browse Projects
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <span className="text-blue-400 text-xl">📁</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {dashboardStats.totalProjects}
                  </div>
                  <div className="text-sm text-gray-400">Total Projects</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <span className="text-green-400 text-xl">🎬</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {dashboardStats.totalClips}
                  </div>
                  <div className="text-sm text-gray-400">Total Clips</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <span className="text-purple-400 text-xl">✅</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {dashboardStats.completedAnalyses}
                  </div>
                  <div className="text-sm text-gray-400">Completed</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <span className="text-yellow-400 text-xl">⏳</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {dashboardStats.processingAnalyses}
                  </div>
                  <div className="text-sm text-gray-400">Processing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-6 py-6 border-b border-gray-700">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Filter projects by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ProjectType | 'all')}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Filter projects by type"
            >
              <option value="all">All Types</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
              <option value="multi-platform">Multi-Platform</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Sort projects by"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Date Created</option>
              <option value="name">Name</option>
              <option value="score">Viral Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="px-6 py-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'No projects match your filters' 
                : 'No projects yet'
              }
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first project to start analyzing viral content'
              }
            </p>
            <button
              onClick={handleNewProject}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Create New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage; 