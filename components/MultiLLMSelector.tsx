import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { LLMProvider, AnalysisMode } from '../types';
import { getAvailableProviders, PROVIDER_MODELS } from '../services/llmService';
import GeminiIcon from './icons/GeminiIcon';
import OpenAIIcon from './icons/OpenAIIcon';
import AnthropicIcon from './icons/AnthropicIcon';
import LMStudioIcon from './icons/LMStudioIcon';
import ModelSelector from './ModelSelector';

interface MultiLLMSelectorProps {
  selectedProviders: LLMProvider[];
  onProvidersChange: (providers: LLMProvider[]) => void;
  selectedModels: Record<LLMProvider, string>;
  onModelsChange: (models: Record<LLMProvider, string>) => void;
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
    case 'gemini': return 'from-blue-500 to-purple-600';
    case 'openai': return 'from-green-500 to-teal-600';
    case 'anthropic':
    case 'claude': return 'from-orange-500 to-red-600';
    case 'lmstudio': return 'from-gray-500 to-gray-600';
    default: return 'from-gray-500 to-gray-600';
  }
};

const MultiLLMSelector: React.FC<MultiLLMSelectorProps> = React.memo(({
  selectedProviders,
  onProvidersChange,
  selectedModels,
  onModelsChange,
  mode,
  onModeChange,
  lmStudioUrl = 'http://localhost:1234',
  onLmStudioUrlChange,
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  
  // Memoize expensive computations
  const availableProviders = useMemo(() => getAvailableProviders(), []);
  const selectedCount = useMemo(() => selectedProviders.length, [selectedProviders]);
  const totalCost = useMemo(() => {
    return selectedProviders.reduce((sum, provider) => {
      const modelId = selectedModels[provider];
      const models = PROVIDER_MODELS[provider];
      const model = models?.find(m => m.id === modelId) || models?.[0];
      return sum + (model?.costPer1kTokens || 0);
    }, 0);
  }, [selectedProviders, selectedModels]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isExpanded]);

  const handleLmStudioUrlChange = useCallback((url: string) => {
    onLmStudioUrlChange?.(url);
  }, [onLmStudioUrlChange]);

  const handleProviderToggle = useCallback((provider: LLMProvider) => {
    if (mode === 'single') {
      onProvidersChange([provider]);
      setIsExpanded(false);
    } else {
      if (selectedProviders.includes(provider)) {
        onProvidersChange(selectedProviders.filter(p => p !== provider));
      } else {
        onProvidersChange([...selectedProviders, provider]);
        // Initialize model selection for new provider
        if (!selectedModels[provider]) {
          const providerConfig = availableProviders.find(p => p.provider === provider);
          if (providerConfig) {
            onModelsChange({
              ...selectedModels,
              [provider]: providerConfig.defaultModel
            });
          }
        }
      }
      // Auto-close after a brief delay to show selection feedback
      setTimeout(() => setIsExpanded(false), 200);
    }
  }, [mode, selectedProviders, onProvidersChange, selectedModels, onModelsChange, availableProviders]);

  const handleModelChange = useCallback((provider: LLMProvider, modelId: string) => {
    onModelsChange({
      ...selectedModels,
      [provider]: modelId
    });
  }, [selectedModels, onModelsChange]);

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
    <div ref={selectorRef}>
      <label className="block text-sm font-bold text-gray-300 mb-3">
        AI Analysis Mode
      </label>
      
      {/* Mode Toggle */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={() => handleModeChange('single')}
          disabled={disabled}
          className={`p-3 rounded-lg transition-all duration-150 btn-interactive ${
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
          className={`p-3 rounded-lg transition-all duration-150 btn-interactive ${
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
        className="w-full flex items-center justify-between p-4 glass-dark gradient-border rounded-lg hover:animate-pulse-glow transition-all duration-150 group btn-interactive"
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {selectedProviders.length > 0 ? (
              selectedProviders.slice(0, 3).map((provider, index) => (
                <div
                  key={provider}
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${getProviderColor(provider)} flex items-center justify-center shadow-lg border-2 border-gray-800 p-1 transition-transform duration-150 group-hover:scale-105`}
                  style={{ zIndex: 3 - index }}
                >
                  {getProviderIcon(provider, 20, 'text-white')}
                </div>
              ))
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl transition-all duration-150 group-hover:bg-gray-500">
                ?
              </div>
            )}
            {selectedProviders.length > 3 && (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold border-2 border-gray-800 transition-all duration-150 group-hover:bg-gray-600">
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
          className={`w-5 h-5 text-gray-400 transition-all duration-150 group-hover:text-gray-300 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <>
          {/* Provider Selection Panel */}
          <div className="relative z-ultra mt-4 glass-dark rounded-lg p-4 animate-in slide-in-from-top-2 duration-150 border border-gray-600/50 backdrop-blur-xl">
            <div className="grid grid-cols-1 gap-4">
              {availableProviders.map((provider) => {
                const isSelected = selectedProviders.includes(provider.provider);
                const currentModel = selectedModels[provider.provider];
                
                return (
                  <div
                    key={provider.provider}
                    className={`p-4 rounded-lg transition-all duration-150 btn-interactive ${
                      isSelected
                        ? 'glass gradient-border text-white'
                        : 'glass-dark text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Provider Header - Separate from model selection */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleProviderToggle(provider.provider);
                        }}
                        disabled={disabled}
                        className="w-full flex items-center gap-3 text-left hover:bg-gray-700/20 rounded-lg p-2 -m-2 transition-all duration-150"
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center animate-in slide-in-from-top-2 duration-150">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        )}
                        
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getProviderColor(provider.provider)} flex items-center justify-center shadow-lg p-2 transition-all duration-150 ${
                          isSelected ? 'animate-pulse-glow scale-105' : 'hover:scale-105'
                        }`}>
                          {getProviderIcon(provider.provider, 24, 'text-white')}
                        </div>
                        <div className="flex-1">
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
                            {provider.provider !== 'lmstudio' && (
                              <span className="text-blue-400">🔑 API key required</span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Model Selection Dropdown - Completely isolated */}
                      {isSelected && (
                        <div 
                          className="animate-in slide-in-from-top-2 duration-200 relative"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ModelSelector
                            provider={provider.provider}
                            selectedModel={currentModel}
                            onModelChange={(modelId) => handleModelChange(provider.provider, modelId)}
                            disabled={disabled}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {mode === 'board' && (
              <div className="mt-4 p-3 glass rounded-lg animate-in slide-in-from-top-2 duration-200" style={{ animationDelay: '50ms' }}>
                <h4 className="text-sm font-bold text-white mb-2">Board of Advisors Benefits:</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Multiple AI perspectives on the same content</li>
                  <li>• Higher confidence in clip selection</li>
                  <li>• Consensus scoring shows agreement between AIs</li>
                  <li>• Compare different titles and reasons</li>
                  <li>• Model-specific optimizations for each provider</li>
                </ul>
                <div className="mt-3 text-xs text-blue-400">
                  💡 Each provider can use different models for specialized analysis
                </div>
              </div>
            )}

            {selectedCount === 0 && (
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500 rounded text-yellow-300 text-sm text-center animate-in slide-in-from-top-2 duration-200">
                ⚠️ Please select at least one AI provider
              </div>
            )}
          </div>
        </>
      )}

      {/* LMStudio Custom Server URL */}
      {selectedProviders.includes('lmstudio') && (
        <div className="mt-4 glass rounded-lg p-4 animate-in slide-in-from-top-2 duration-200 border border-gray-600/50">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            🖥️ LM Studio Configuration
          </h4>
          <label className="block text-xs text-gray-400 mb-2">
            Server URL
          </label>
          <input
            type="url"
            value={lmStudioUrl}
            onChange={(e) => handleLmStudioUrlChange(e.target.value)}
            placeholder="http://localhost:1234"
            className="w-full p-2.5 text-sm glass-dark rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all duration-150 focus-enhanced"
            disabled={disabled}
          />
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <span className="text-yellow-400">⚠️</span>
            Make sure LM Studio is running with a model loaded
          </p>
        </div>
      )}
    </div>
  );
});

export default MultiLLMSelector; 