import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Clip, 
  Platform, 
  ContentType, 
  ViralScoreBreakdown,
  ProjectType
} from '../types';

interface ExtendedClip extends Clip {
  projectId: string;
  projectName: string;
  projectType: ProjectType;
  videoName: string;
  createdAt: Date;
  thumbnail?: string;
  duration: number;
}

type SortOption = 'recent' | 'score' | 'duration' | 'alphabetical';
type ViewMode = 'grid' | 'list';

const AllClipsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [clips, setClips] = useState<ExtendedClip[]>([]);
  const [filteredClips, setFilteredClips] = useState<ExtendedClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Get unique projects for filter
  const projects = Array.from(new Set(clips.map(clip => ({ 
    id: clip.projectId, 
    name: clip.projectName,
    type: clip.projectType 
  }))));

  // Load clips from your data source (Firebase, API, etc.)
  useEffect(() => {
    const loadClips = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual data loading
        // const clipsData = await fetchAllClips(user?.uid);
        // setClips(clipsData);
        setClips([]);
      } catch (error) {
        console.error('Failed to load clips:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadClips();
    }
  }, [user]);

  // Filter and sort clips
  useEffect(() => {
    let filtered = clips.filter(clip => {
      const matchesSearch = 
        clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clip.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clip.videoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clip.projectName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProject = selectedProject === 'all' || clip.projectId === selectedProject;
      const matchesScore = clip.viralScore.overall >= minScore;
      
      return matchesSearch && matchesProject && matchesScore;
    });

    // Sort clips
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'score':
          return b.viralScore.overall - a.viralScore.overall;
        case 'duration':
          return b.duration - a.duration;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredClips(filtered);
  }, [clips, searchQuery, selectedProject, minScore, sortBy]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProjectTypeIcon = (type: ProjectType) => {
    switch (type) {
      case 'youtube': return '📺';
      case 'tiktok': return '🎵';
      case 'instagram': return '📸';
      case 'multi-platform': return '🌐';
      case 'custom': return '⚙️';
      default: return '📁';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleClipClick = (clip: ExtendedClip) => {
    navigate(`/app/projects/${clip.projectId}?clip=${clip.id}`);
  };

  const handleExportClip = (clip: ExtendedClip, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement clip export functionality
    console.log('Exporting clip:', clip.title);
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading clips...</p>
        </div>
      </div>
    );
  }

  const ClipCard: React.FC<{ clip: ExtendedClip }> = ({ clip }) => (
    <div 
      onClick={() => handleClipClick(clip)}
      className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 cursor-pointer transition-all duration-200 group hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-t-xl overflow-hidden">
        {clip.thumbnail ? (
          <img 
            src={clip.thumbnail}
            alt={clip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <span className="text-4xl">🎬</span>
          </div>
        )}
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
          {formatDuration(clip.duration)}
        </div>
        
        {/* Viral score badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded">
          <span className={`text-sm font-bold ${getScoreColor(clip.viralScore.overall)}`}>
            {clip.viralScore.overall}%
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors line-clamp-2">
            {clip.title}
          </h3>
          <button
            onClick={(e) => handleExportClip(clip, e)}
            className="p-1 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
            title="Export clip"
          >
            📤
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {clip.reason}
        </p>

        {/* Project info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getProjectTypeIcon(clip.projectType)}</span>
            <span className="text-gray-400">{clip.projectName}</span>
          </div>
          <span className="text-gray-500">
            {clip.createdAt.toLocaleDateString()}
          </span>
        </div>

        {/* Viral score breakdown */}
        <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="text-gray-400">Engage</div>
            <div className={getScoreColor(clip.viralScore.engagement)}>
              {clip.viralScore.engagement}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Share</div>
            <div className={getScoreColor(clip.viralScore.shareability)}>
              {clip.viralScore.shareability}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Retain</div>
            <div className={getScoreColor(clip.viralScore.retention)}>
              {clip.viralScore.retention}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Trend</div>
            <div className={getScoreColor(clip.viralScore.trend)}>
              {clip.viralScore.trend}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ClipListItem: React.FC<{ clip: ExtendedClip }> = ({ clip }) => (
    <div 
      onClick={() => handleClipClick(clip)}
      className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer transition-all duration-200 p-4"
    >
      <div className="flex items-center gap-4">
        {/* Thumbnail */}
        <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
          {clip.thumbnail ? (
            <img 
              src={clip.thumbnail}
              alt={clip.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <span className="text-2xl">🎬</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-white truncate pr-2">{clip.title}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-lg font-bold ${getScoreColor(clip.viralScore.overall)}`}>
                {clip.viralScore.overall}%
              </span>
              <button
                onClick={(e) => handleExportClip(clip, e)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Export clip"
              >
                📤
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-400 mb-2 line-clamp-1">{clip.reason}</p>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-lg">{getProjectTypeIcon(clip.projectType)}</span>
                <span className="text-gray-400">{clip.projectName}</span>
              </div>
              <span className="text-gray-500">{formatDuration(clip.duration)}</span>
              <span className="text-gray-500">{clip.createdAt.toLocaleDateString()}</span>
            </div>
            
            <div className="flex gap-3">
              <span className="text-gray-400">E: <span className={getScoreColor(clip.viralScore.engagement)}>{clip.viralScore.engagement}%</span></span>
              <span className="text-gray-400">S: <span className={getScoreColor(clip.viralScore.shareability)}>{clip.viralScore.shareability}%</span></span>
              <span className="text-gray-400">R: <span className={getScoreColor(clip.viralScore.retention)}>{clip.viralScore.retention}%</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">🎬 All Clips</h1>
          <p className="text-gray-300">
            Browse and manage clips across all your projects ({filteredClips.length} clips)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              ☰ List
            </button>
          </div>

          <button
            onClick={() => navigate('/app/quick-analyze')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            ⚡ Quick Analyze
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search clips, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Filter by project"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {getProjectTypeIcon(project.type)} {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Score Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Min Score: {minScore}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              aria-label={`Minimum viral score filter: ${minScore}%`}
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Sort clips by"
            >
              <option value="recent">Most Recent</option>
              <option value="score">Highest Score</option>
              <option value="duration">Longest Duration</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">{filteredClips.length}</div>
          <div className="text-sm text-gray-400">Total Clips</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-400">
            {filteredClips.filter(c => c.viralScore.overall >= 85).length}
          </div>
          <div className="text-sm text-gray-400">High Score (85+)</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-primary-400">
            {Math.round(filteredClips.reduce((sum, c) => sum + c.viralScore.overall, 0) / filteredClips.length || 0)}%
          </div>
          <div className="text-sm text-gray-400">Avg Score</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">
            {Math.round(filteredClips.reduce((sum, c) => sum + c.duration, 0) / 60)}m
          </div>
          <div className="text-sm text-gray-400">Total Duration</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">{projects.length}</div>
          <div className="text-sm text-gray-400">Projects</div>
        </div>
      </div>

      {/* Clips Display */}
      {filteredClips.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">No clips found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery || selectedProject !== 'all' || minScore > 0
              ? 'Try adjusting your filters'
              : 'Create your first project and analyze some videos to see clips here'
            }
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/app/projects/new')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              📁 New Project
            </button>
            <button
              onClick={() => navigate('/app/quick-analyze')}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              ⚡ Quick Analyze
            </button>
          </div>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredClips.map(clip => 
            viewMode === 'grid' ? (
              <ClipCard key={clip.id} clip={clip} />
            ) : (
              <ClipListItem key={clip.id} clip={clip} />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default AllClipsPage; 