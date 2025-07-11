import React, { useState } from 'react';
import { useTheme, ThemeInfo } from './ThemeProvider';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, themeInfo, availableThemes } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleThemeSelect = (selectedTheme: ThemeInfo) => {
    setTheme(selectedTheme.id);
    setIsExpanded(false);
  };

  const getCategoryColor = (category: ThemeInfo['category']) => {
    switch (category) {
      case 'modern': return 'border-purple-500/30 bg-purple-500/10';
      case 'professional': return 'border-blue-500/30 bg-blue-500/10';
      case 'accessible': return 'border-green-500/30 bg-green-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getCategoryIcon = (category: ThemeInfo['category']) => {
    switch (category) {
      case 'modern': return '🚀';
      case 'professional': return '💼';
      case 'accessible': return '♿';
      default: return '🎨';
    }
  };

  return (
    <div className="theme-switcher relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Choose Theme</h3>
          <p className="text-sm text-secondary">
            Personalize your OpenClip Pro experience
          </p>
        </div>
        
        {/* Current Theme Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
          <span className="text-lg">{themeInfo.icon}</span>
          <span className="text-sm font-medium text-accent">{themeInfo.name}</span>
        </div>
      </div>

      {/* Theme Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {availableThemes.map((themeOption) => (
          <button
            key={themeOption.id}
            onClick={() => handleThemeSelect(themeOption)}
            className={`theme-option group relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
              theme === themeOption.id
                ? 'border-accent/50 bg-accent/10 shadow-lg'
                : 'border-primary hover:border-accent/30 hover:bg-accent/5'
            }`}
          >
            {/* Theme Preview Icon & Title */}
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                theme === themeOption.id ? 'bg-accent/20' : 'bg-secondary'
              }`}>
                {themeOption.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-primary truncate">
                    {themeOption.name}
                  </h4>
                  
                  {/* Category Badge */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(themeOption.category)}`}>
                    <span className="text-xs">{getCategoryIcon(themeOption.category)}</span>
                    {themeOption.category}
                  </span>
                </div>
                
                <p className="text-xs text-secondary line-clamp-2">
                  {themeOption.description}
                </p>
              </div>
            </div>

            {/* Features List */}
            <div className="flex flex-wrap gap-1">
              {themeOption.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-0.5 text-xs rounded bg-tertiary text-secondary"
                >
                  {feature}
                </span>
              ))}
              {themeOption.features.length > 3 && (
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-tertiary text-tertiary">
                  +{themeOption.features.length - 3}
                </span>
              )}
            </div>

            {/* Active Theme Indicator */}
            {theme === themeOption.id && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            )}

            {/* Hover Effect */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />
          </button>
        ))}
      </div>

      {/* Theme Details Expandable Section */}
      <div className="border-t border-primary pt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <span className="text-sm font-medium">Current Theme Details</span>
          <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            ↓
          </span>
        </button>

        {isExpanded && (
          <div className="mt-4 p-4 rounded-lg bg-secondary/30 border border-primary animate-slide-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-2xl">
                {themeInfo.icon}
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-primary mb-1">{themeInfo.name}</h4>
                <p className="text-sm text-secondary mb-3">{themeInfo.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs">{getCategoryIcon(themeInfo.category)}</span>
                    <span className="text-secondary">Category:</span>
                    <span className="font-medium text-primary capitalize">{themeInfo.category}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-secondary">Features:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {themeInfo.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs rounded bg-tertiary text-primary font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-primary">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-secondary">
            <span>🎨</span>
            <span>Themes automatically adapt to your system preferences</span>
          </div>
          
          <button
            onClick={() => {
              // Reset to system default
              localStorage.removeItem('openclip-theme-manual');
              const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              setTheme(systemPrefersDark ? 'dark' : 'classic');
            }}
            className="px-3 py-1.5 text-xs rounded-md border border-primary hover:bg-secondary/50 transition-colors"
          >
            Reset to System
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;