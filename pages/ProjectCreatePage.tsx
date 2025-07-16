import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  ProjectType, 
  ProjectSettings, 
  Platform, 
  ContentType, 
  LLMProvider 
} from '../types';

interface ProjectTemplate {
  id: ProjectType;
  name: string;
  description: string;
  icon: string;
  defaultSettings: Partial<ProjectSettings>;
  features: string[];
  platforms: Platform[];
}

const projectTemplates: ProjectTemplate[] = [
  {
    id: 'youtube',
    name: 'YouTube Content',
    description: 'Perfect for long-form content, tutorials, and educational videos',
    icon: '📺',
    defaultSettings: {
      defaultPlatform: 'youtube',
      contentTypes: ['educational', 'engagement'],
      analysisPreferences: {
        defaultDuration: { min: 60, max: 600 },
        preferredProviders: ['gemini', 'anthropic'],
        autoQuickAnalysis: false
      }
    },
    features: ['Long-form optimization', 'Chapter detection', 'Retention analysis'],
    platforms: ['youtube', 'youtube-shorts']
  },
  {
    id: 'tiktok',
    name: 'TikTok Viral',
    description: 'Optimized for short-form viral content and trending moments',
    icon: '🎵',
    defaultSettings: {
      defaultPlatform: 'tiktok',
      contentTypes: ['engagement', 'comedy', 'action'],
      analysisPreferences: {
        defaultDuration: { min: 5, max: 60 },
        preferredProviders: ['gemini', 'openai'],
        autoQuickAnalysis: true
      }
    },
    features: ['Viral hooks detection', 'Trend analysis', 'Music sync'],
    platforms: ['tiktok']
  },
  {
    id: 'instagram',
    name: 'Instagram Reels',
    description: 'Aesthetic content for Instagram Reels and Stories',
    icon: '📸',
    defaultSettings: {
      defaultPlatform: 'instagram-reels',
      contentTypes: ['engagement', 'emotional'],
      analysisPreferences: {
        defaultDuration: { min: 15, max: 90 },
        preferredProviders: ['openai', 'anthropic'],
        autoQuickAnalysis: true
      }
    },
    features: ['Visual appeal scoring', 'Aesthetic analysis', 'Story optimization'],
    platforms: ['instagram-reels']
  },
  {
    id: 'multi-platform',
    name: 'Multi-Platform',
    description: 'Content optimized for multiple social media platforms',
    icon: '🌐',
    defaultSettings: {
      defaultPlatform: 'youtube-shorts',
      contentTypes: ['engagement', 'action', 'emotional'],
      analysisPreferences: {
        defaultDuration: { min: 15, max: 120 },
        preferredProviders: ['gemini', 'openai', 'anthropic'],
        autoQuickAnalysis: true
      }
    },
    features: ['Cross-platform optimization', 'Format adaptation', 'Audience targeting'],
    platforms: ['youtube-shorts', 'tiktok', 'instagram-reels', 'twitter']
  },
  {
    id: 'custom',
    name: 'Custom Project',
    description: 'Full control over settings and analysis preferences',
    icon: '⚙️',
    defaultSettings: {
      defaultPlatform: 'youtube-shorts',
      contentTypes: ['engagement'],
      analysisPreferences: {
        defaultDuration: { min: 30, max: 180 },
        preferredProviders: ['gemini'],
        autoQuickAnalysis: false
      }
    },
    features: ['Custom settings', 'Advanced configuration', 'Flexible workflows'],
    platforms: ['youtube', 'youtube-shorts', 'tiktok', 'instagram-reels', 'twitter']
  }
];

const contentTypeOptions: { type: ContentType; name: string; description: string; icon: string }[] = [
  { type: 'engagement', name: 'Engagement', description: 'High interaction potential', icon: '💬' },
  { type: 'action', name: 'Action', description: 'Dynamic and energetic moments', icon: '⚡' },
  { type: 'comedy', name: 'Comedy', description: 'Funny and entertaining content', icon: '😂' },
  { type: 'emotional', name: 'Emotional', description: 'Heart-touching moments', icon: '❤️' },
  { type: 'educational', name: 'Educational', description: 'Informative and learning content', icon: '🎓' },
  { type: 'monetization', name: 'Monetization', description: 'Commercial and sales potential', icon: '💰' }
];

const ProjectCreatePage: React.FC = () => {

  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [customSettings, setCustomSettings] = useState<Partial<ProjectSettings>>({});
  const [isCreating, setIsCreating] = useState(false);

  const totalSteps = 4;

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setCustomSettings(template.defaultSettings);
    setStep(2);
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreateProject = async () => {
    if (!selectedTemplate || !projectName.trim()) return;

    setIsCreating(true);
    
    try {
      // In a real app, this would create the project in Firebase
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // For now, navigate to projects page
      navigate('/app/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const updateCustomSettings = (field: keyof ProjectSettings, value: unknown) => {
    setCustomSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            i + 1 <= step 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-700 text-gray-400'
          }`}>
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-12 h-0.5 mx-2 ${
              i + 1 < step ? 'bg-primary-600' : 'bg-gray-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Choose a Project Template</h2>
        <p className="text-gray-400">Select a template that best fits your content goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectTemplates.map(template => (
          <div
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-primary-500 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/10"
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">{template.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
              <p className="text-sm text-gray-400">{template.description}</p>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Features</span>
                <div className="mt-1 space-y-1">
                  {template.features.map(feature => (
                    <div key={feature} className="text-xs text-gray-300 flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Platforms</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {template.platforms.map(platform => (
                    <span 
                      key={platform}
                      className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Project Details</h2>
        <p className="text-gray-400">Give your project a name and description</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-3xl">{selectedTemplate?.icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-white">{selectedTemplate?.name}</h3>
              <p className="text-sm text-gray-400">{selectedTemplate?.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter your project name..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe your project goals and content strategy..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Content & Analysis Settings</h2>
        <p className="text-gray-400">Customize how your content will be analyzed</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Content Types */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Content Types</h3>
          <p className="text-sm text-gray-400 mb-4">Select the types of content you'll be creating</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {contentTypeOptions.map(option => (
              <label
                key={option.type}
                className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={customSettings.contentTypes?.includes(option.type) || false}
                  onChange={(e) => {
                    const currentTypes = customSettings.contentTypes || [];
                    const newTypes = e.target.checked
                      ? [...currentTypes, option.type]
                      : currentTypes.filter(t => t !== option.type);
                    updateCustomSettings('contentTypes', newTypes);
                  }}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center ${
                  customSettings.contentTypes?.includes(option.type)
                    ? 'bg-primary-600 border-primary-600'
                    : 'border-gray-500'
                }`}>
                  {customSettings.contentTypes?.includes(option.type) && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{option.name}</div>
                    <div className="text-xs text-gray-400">{option.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Analysis Preferences */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Analysis Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default Platform
              </label>
              <select
                value={customSettings.defaultPlatform || 'youtube-shorts'}
                onChange={(e) => updateCustomSettings('defaultPlatform', e.target.value as Platform)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Select default platform"
              >
                <option value="youtube">📺 YouTube</option>
                <option value="youtube-shorts">🩳 YouTube Shorts</option>
                <option value="tiktok">🎵 TikTok</option>
                <option value="instagram-reels">📸 Instagram Reels</option>
                <option value="twitter">🐦 Twitter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preferred AI Providers
              </label>
              <div className="space-y-2">
                {(['gemini', 'openai', 'anthropic', 'lmstudio'] as LLMProvider[]).map(provider => (
                  <label key={provider} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={customSettings.analysisPreferences?.preferredProviders?.includes(provider) || false}
                      onChange={(e) => {
                        const current = customSettings.analysisPreferences?.preferredProviders || [];
                        const updated = e.target.checked
                          ? [...current, provider]
                          : current.filter(p => p !== provider);
                        updateCustomSettings('analysisPreferences', {
                          ...customSettings.analysisPreferences,
                          preferredProviders: updated
                        });
                      }}
                      className="mr-3 text-primary-600"
                    />
                    <span className="text-sm text-gray-300 capitalize">{provider}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={customSettings.analysisPreferences?.autoQuickAnalysis || false}
                onChange={(e) => updateCustomSettings('analysisPreferences', {
                  ...customSettings.analysisPreferences,
                  autoQuickAnalysis: e.target.checked
                })}
                className="mr-3 text-primary-600"
              />
              <span className="text-sm text-gray-300">
                ⚡ Enable automatic quick analysis for uploaded videos
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Review & Create</h2>
        <p className="text-gray-400">Review your project settings before creating</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-3xl">{selectedTemplate?.icon}</div>
            <div>
              <h3 className="text-xl font-semibold text-white">{projectName}</h3>
              <p className="text-sm text-gray-400">{selectedTemplate?.name} Project</p>
            </div>
          </div>

          {projectDescription && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Description</h4>
              <p className="text-sm text-gray-400">{projectDescription}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Content Types</h4>
              <div className="flex flex-wrap gap-2">
                {customSettings.contentTypes?.map(type => (
                  <span key={type} className="px-3 py-1 text-xs bg-primary-600/20 text-primary-300 rounded-full">
                    {contentTypeOptions.find(c => c.type === type)?.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Default Platform</h4>
              <span className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                {customSettings.defaultPlatform ? customSettings.defaultPlatform.charAt(0).toUpperCase() + customSettings.defaultPlatform.slice(1) : 'TikTok'}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">AI Providers</h4>
              <div className="flex flex-wrap gap-2">
                {customSettings.analysisPreferences?.preferredProviders?.map(provider => (
                  <span key={provider} className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded capitalize">
                    {provider}
                  </span>
                ))}
              </div>
            </div>

            {customSettings.analysisPreferences?.autoQuickAnalysis && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <span>✓</span>
                <span>Auto quick analysis enabled</span>
              </div>
            )}
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
          <h1 className="text-3xl font-bold text-white mb-2">Create New Project</h1>
          <p className="text-gray-300">Set up a new project to organize and analyze your content</p>
        </div>
        
        <button
          onClick={() => navigate('/app/projects')}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          ← Back to Projects
        </button>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <div className="mb-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>

      {/* Navigation Buttons */}
      {step > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            ← Previous
          </button>

          <div className="flex gap-3">
            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={step === 2 && !projectName.trim()}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  step === 2 && !projectName.trim()
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleCreateProject}
                disabled={isCreating || !projectName.trim()}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  isCreating || !projectName.trim()
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isCreating ? '⏳ Creating Project...' : '🎉 Create Project'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCreatePage; 