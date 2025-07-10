import React, { useState, useCallback, useMemo } from 'react';
import { LLMProvider, AnalysisMode } from '../types';
import { getAvailableProviders } from '../services/llmService';
import GeminiIcon from './icons/GeminiIcon';
import OpenAIIcon from './icons/OpenAIIcon';
import AnthropicIcon from './icons/AnthropicIcon';
import LMStudioIcon from './icons/LMStudioIcon';

interface MultiLLMSelectorProps {
  selectedProviders: LLMProvider[];
  onProvidersChange: (providers: LLMProvider[]) => void;
  mode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  lmStudioUrl?: string;
  onLmStudioUrlChange?: (url: string) => void;
  disabled?: boolean;
}

const getProviderIcon = (provider: LLMProvider, size: number = 24, className?: string) => {
  switch (provider) {
    case 'gemini': 
      return <GeminiIcon size={size} className={className} />;
    case 'openai': 
      return <OpenAIIcon size={size} className={className} />;
    case 'anthropic':
    case 'claude': 
      return <AnthropicIcon size={size} className={className} />;
    case 'lmstudio': 
      return <LMStudioIcon size={size} className={className} />;
    default: 
      return <div className={`w-${size/4} h-${size/4} bg-gray-500 rounded`} />;
  }
};

const getProviderColor = (provider: LLMProvider) => {
  switch (provider) {
    case 'gemini': return 'from-blue-500 to-cyan-500';
    case 'openai': return 'from-green-500 to-emerald-500';
    case 'anthropic':
    case 'claude': return 'from-orange-500 to-amber-500';
    case 'lmstudio': return 'from-purple-500 to-pink-500';
    default: return 'from-gray-500 to-gray-600';
  }
};

const MultiLLMSelector: React.FC<MultiLLMSelectorProps> = React.memo(({
  selectedProviders,
  onProvidersChange,
  mode,
  onModeChange,
  lmStudioUrl = 'http://localhost:1234',
  onLmStudioUrlChange,
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Memoize expensive computations
  const availableProviders = useMemo(() => getAvailableProviders(), []);
  const selectedCount = useMemo(() => selectedProviders.length, [selectedProviders]);
  const totalCost = useMemo(() => {
    return selectedProviders.reduce((sum, provider) => {
      const config = availableProviders.find(p => p.provider === provider);
      return sum + (config?.costPer1kTokens || 0);
    }, 0);
  }, [selectedProviders, availableProviders]);

  const handleLmStudioUrlChange = useCallback((url: string) => {
    onLmStudioUrlChange?.(url);
  }, [onLmStudioUrlChange]);

  const handleProviderToggle = useCallback((provider: LLMProvider) => {
    if (mode === 'single') {
      onProvidersChange([provider]);
      setIsExpanded(false); // Close dropdown after selection
    } else {
      if (selectedProviders.includes(provider)) {
        onProvidersChange(selectedProviders.filter(p => p !== provider));
      } else {
        onProvidersChange([...selectedProviders, provider]);
      }
      // In board mode, close dropdown after a short delay to show the selection feedback
      setTimeout(() => setIsExpanded(false), 300);
    }
  }, [mode, selectedProviders, onProvidersChange]);

  const handleModeChange = useCallback((newMode: AnalysisMode) => {
    onModeChange(newMode);
    if (newMode === 'single' && selectedProviders.length > 1) {
      onProvidersChange([selectedProviders[0]]);
    }
  }, [onModeChange, selectedProviders, onProvidersChange]);

  const toggleExpanded = useCallback(() => {
    if (!disabled) {
      setIsExpanded(!isExpanded);
    }
  }, [disabled, isExpanded]);

  return (
    <div>
      <label className="block text-sm font-bold text-gray-300 mb-3">
        AI Analysis Mode
      </label>
      
      {/* Mode Toggle */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={() => handleModeChange('single')}
          disabled={disabled}
          className={`p-3 rounded-lg transition-all duration-200 hover-lift ${
            mode === 'single'
              ? 'glass gradient-border text-white'
              : 'glass-dark text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-sm font-medium">Single AI</span>
            <span className="text-xs text-gray-500">Fast & Focused</span>
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => handleModeChange('board')}
          disabled={disabled}
          className={`p-3 rounded-lg transition-all duration-200 hover-lift ${
            mode === 'board'
              ? 'glass gradient-border text-white'
              : 'glass-dark text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">🤝</span>
            <span className="text-sm font-medium">Board of Advisors</span>
            <span className="text-xs text-gray-500">Multiple Perspectives</span>
          </div>
        </button>
      </div>

      {/* Provider Selection */}
      <button
        type="button"
        onClick={toggleExpanded}
        disabled={disabled}
        className="w-full flex items-center justify-between p-4 glass-dark gradient-border rounded-lg hover:animate-pulse-glow transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {selectedProviders.length > 0 ? (
              selectedProviders.slice(0, 3).map((provider, index) => (
                <div
                  key={provider}
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${getProviderColor(provider)} flex items-center justify-center shadow-lg border-2 border-gray-800 p-1`}
                  style={{ zIndex: 3 - index }}
                >
                  {getProviderIcon(provider, 20, 'text-white')}
                </div>
              ))
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl">
                ?
              </div>
            )}
            {selectedProviders.length > 3 && (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold border-2 border-gray-800">
                +{selectedProviders.length - 3}
              </div>
            )}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">
              {mode === 'board' ? `${selectedCount} AI Advisors Selected` : 'Select AI Provider'}
            </h3>
            <p className="text-sm text-gray-400">
              {selectedCount === 0 ? 'Choose your AI providers' : 
               mode === 'board' ? `Est. cost: ~$${totalCost.toFixed(3)}/1k tokens` :
               `Using ${availableProviders.find(p => p.provider === selectedProviders[0])?.name}`}
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
        <div className="mt-4 glass-dark rounded-lg p-4 animate-fade-in">
          <div className="grid grid-cols-1 gap-3">
            {availableProviders.map((provider) => {
              const isSelected = selectedProviders.includes(provider.provider);
              return (
                <button
                  key={provider.provider}
                  type="button"
                  onClick={() => handleProviderToggle(provider.provider)}
                  disabled={disabled}
                  className={`p-4 rounded-lg transition-all duration-200 hover-lift relative ${
                    isSelected
                      ? 'glass gradient-border text-white'
                      : 'glass-dark text-gray-400 hover:text-white'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getProviderColor(provider.provider)} flex items-center justify-center shadow-lg p-2 ${
                      isSelected ? 'animate-pulse-glow' : ''
                    }`}>
                      {getProviderIcon(provider.provider, 24, 'text-white')}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-lg flex items-center gap-2">
                        {provider.name}
                        {provider.provider === 'lmstudio' && (
                          <span className="text-xs bg-gradient-to-r from-green-400 to-green-600 text-black px-2 py-0.5 rounded-full font-bold">
                            FREE
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">{provider.description}</div>
                      <div className="text-xs mt-1 flex items-center gap-2">
                        {provider.costPer1kTokens !== undefined && provider.costPer1kTokens > 0 ? (
                          <span className="text-green-400">~${provider.costPer1kTokens}/1k tokens</span>
                        ) : (
                          <span className="text-green-400 font-bold">No cost</span>
                        )}
                        {!provider.supportsVision && (
                          <span className="text-yellow-400">⚠️ Text-only</span>
                        )}
                        {provider.provider !== 'lmstudio' && (
                          <span className="text-blue-400">🔑 API key required</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {mode === 'board' && selectedCount > 0 && (
            <div className="mt-4 p-3 glass rounded-lg">
              <h4 className="text-sm font-bold text-white mb-2">Board of Advisors Benefits:</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Multiple AI perspectives on the same content</li>
                <li>• Higher confidence in clip selection</li>
                <li>• Consensus scoring shows agreement between AIs</li>
                <li>• Compare different titles and reasons</li>
              </ul>
              <div className="mt-3 text-xs text-blue-400">
                💡 Note: Most providers require API keys to be set as environment variables
              </div>
            </div>
          )}

          {selectedCount === 0 && (
            <p className="text-yellow-400 text-sm mt-3 text-center">
              ⚠️ Please select at least one AI provider
            </p>
          )}
        </div>
      )}

      {/* LMStudio Custom Server URL - Always visible when LMStudio is selected */}
      {selectedProviders.includes('lmstudio') && (
        <div className="mt-4 p-4 glass gradient-border rounded-lg animate-fade-in">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-lg">💻</span>
            LMStudio Server Configuration
          </h4>
          <div className="space-y-2">
            <label className="text-xs text-gray-300 font-semibold">Server URL:</label>
            <input
              type="text"
              value={lmStudioUrl}
              onChange={(e) => handleLmStudioUrlChange(e.target.value)}
              placeholder="http://localhost:1234"
              disabled={disabled}
              className="w-full p-3 glass-dark rounded border border-gray-600 text-white text-sm focus:border-primary-400 focus:outline-none transition-all hover:border-gray-500 disabled:opacity-50"
            />
            <p className="text-xs text-gray-400">
              💡 Default: http://localhost:1234 - Change if your LMStudio runs on a different port or IP
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default MultiLLMSelector; 