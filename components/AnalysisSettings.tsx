import React, { useState, useCallback, useMemo } from 'react';
import { AnalysisSettings, ContentType, Platform } from '../types';
import { CONTENT_TYPES, PLATFORMS, getContentTypeNames, getPlatformConfig } from '../utils/analysisConfig';

interface AnalysisSettingsProps {
  settings: AnalysisSettings;
  onSettingsChange: (settings: AnalysisSettings) => void;
  disabled?: boolean;
}

const AnalysisSettingsComponent: React.FC<AnalysisSettingsProps> = React.memo(({
  settings,
  onSettingsChange,
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoize expensive computations
  const contentTypeEntries = useMemo(() => Object.entries(CONTENT_TYPES), []);
  const platformEntries = useMemo(() => Object.entries(PLATFORMS), []);
  const selectedContentTypeNames = useMemo(() => 
    getContentTypeNames(settings.contentTypes), 
    [settings.contentTypes]
  );
  const platformConfig = useMemo(() => 
    getPlatformConfig(settings.platform), 
    [settings.platform]
  );

  const handleContentTypeToggle = useCallback((contentType: ContentType) => {
    const newContentTypes = settings.contentTypes.includes(contentType)
      ? settings.contentTypes.filter(t => t !== contentType)
      : [...settings.contentTypes, contentType];
    
    onSettingsChange({
      ...settings,
      contentTypes: newContentTypes
    });
  }, [settings, onSettingsChange]);

  const handlePlatformChange = useCallback((platform: Platform) => {
    const config = getPlatformConfig(platform);
    onSettingsChange({
      ...settings,
      platform,
      minDuration: Math.max(settings.minDuration, config.minDuration),
      maxDuration: Math.min(settings.maxDuration, config.maxDuration)
    });
  }, [settings, onSettingsChange]);

  const handleDurationChange = useCallback((field: 'minDuration' | 'maxDuration', value: number) => {
    onSettingsChange({
      ...settings,
      [field]: value
    });
  }, [settings, onSettingsChange]);

  const toggleExpanded = useCallback(() => {
    if (!disabled) {
      setIsExpanded(!isExpanded);
    }
  }, [disabled, isExpanded]);

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={toggleExpanded}
        disabled={disabled}
        className="w-full flex items-center justify-between p-4 glass-dark gradient-border rounded-lg hover:animate-pulse-glow transition-all group"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚙️</span>
          <div className="text-left">
            <h3 className="font-semibold text-white">Advanced Settings</h3>
            <p className="text-sm text-gray-400">
              {settings.contentTypes.length} content types • {platformConfig.name} • {settings.minDuration}-{settings.maxDuration}s clips
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-6 animate-fade-in">
          {/* Content Type Selection */}
          <div>
            <h4 className="text-sm font-bold text-gray-300 mb-3">Content Type Focus</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {contentTypeEntries.map(([key, contentType]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleContentTypeToggle(key as ContentType)}
                  disabled={disabled}
                  className={`p-3 rounded-lg transition-all duration-200 hover-lift ${
                    settings.contentTypes.includes(key as ContentType)
                      ? 'glass gradient-border text-white'
                      : 'glass-dark text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">{contentType.icon}</span>
                    <span className="text-sm font-medium">{contentType.name}</span>
                  </div>
                  {settings.contentTypes.includes(key as ContentType) && (
                    <div className="mt-2 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
            {settings.contentTypes.length === 0 && (
              <p className="text-yellow-400 text-sm mt-2">⚠️ Please select at least one content type</p>
            )}
          </div>

          {/* Platform Selection */}
          <div>
            <h4 className="text-sm font-bold text-gray-300 mb-3">Target Platform</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platformEntries.map(([key, platform]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePlatformChange(key as Platform)}
                  disabled={disabled}
                  className={`p-3 rounded-lg transition-all duration-200 hover-lift ${
                    settings.platform === key
                      ? 'glass gradient-border text-white'
                      : 'glass-dark text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="text-sm font-medium">{platform.name}</span>
                    <span className="text-xs text-gray-500">{platform.aspectRatio}</span>
                  </div>
                  {settings.platform === key && (
                    <div className="mt-2 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Clip Duration */}
          <div>
            <h4 className="text-sm font-bold text-gray-300 mb-3">Clip Duration Range</h4>
            <div className="glass-dark rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Min Duration</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="5"
                      max={platformConfig.maxDuration}
                      value={settings.minDuration}
                      onChange={(e) => handleDurationChange('minDuration', parseInt(e.target.value))}
                      disabled={disabled}
                      className="flex-1"
                      aria-label="Minimum clip duration"
                      title={`Minimum duration: ${settings.minDuration} seconds`}
                    />
                    <span className="text-white font-mono w-12 text-right">{settings.minDuration}s</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max Duration</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="5"
                      max={platformConfig.maxDuration}
                      value={settings.maxDuration}
                      onChange={(e) => handleDurationChange('maxDuration', parseInt(e.target.value))}
                      disabled={disabled}
                      className="flex-1"
                      aria-label="Maximum clip duration"
                      title={`Maximum duration: ${settings.maxDuration} seconds`}
                    />
                    <span className="text-white font-mono w-12 text-right">{settings.maxDuration}s</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400 text-center">
                Platform limit: {platformConfig.maxDuration}s • Recommended: {platformConfig.typicalDuration}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AnalysisSettingsComponent; 