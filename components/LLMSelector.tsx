import React, { useState } from 'react';
import { LLMProvider } from '../types';
import { getAvailableProviders } from '../services/llmService';
import GeminiIcon from './icons/GeminiIcon';
import OpenAIIcon from './icons/OpenAIIcon';
import AnthropicIcon from './icons/AnthropicIcon';
import LMStudioIcon from './icons/LMStudioIcon';

interface LLMSelectorProps {
  selectedProvider: LLMProvider;
  onProviderChange: (provider: LLMProvider) => void;
  disabled?: boolean;
}

// Provider icons/indicators
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
    case 'gemini':
      return 'from-blue-500 to-cyan-500';
    case 'openai':
      return 'from-green-500 to-emerald-500';
    case 'anthropic':
    case 'claude':
      return 'from-orange-500 to-amber-500';
    case 'lmstudio':
      return 'from-purple-500 to-pink-500';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

const LLMSelector: React.FC<LLMSelectorProps> = ({ 
  selectedProvider, 
  onProviderChange, 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const availableProviders = getAvailableProviders();

  const selectedConfig = availableProviders.find(p => p.provider === selectedProvider);

  return (
    <div className="relative">
      <label className="block text-sm font-bold text-gray-300 mb-3">
        AI Provider
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full px-4 py-4 glass-dark gradient-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between transition-all duration-200 hover:animate-pulse-glow group"
        >
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedConfig ? getProviderColor(selectedConfig.provider) : 'from-gray-500 to-gray-600'} flex items-center justify-center p-2 mr-3 shadow-lg group-hover:scale-110 transition-transform`}>
              {selectedConfig && getProviderIcon(selectedConfig.provider, 20, 'text-white')}
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg">{selectedConfig?.name || 'Select Provider'}</div>
              <div className="text-sm text-gray-400">{selectedConfig?.description}</div>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-2 glass-dark rounded-lg shadow-2xl overflow-hidden animate-fade-in">
            {availableProviders.map((provider) => (
              <button
                key={provider.provider}
                onClick={() => {
                  onProviderChange(provider.provider);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-4 text-left hover:bg-gray-700/50 transition-all duration-200 group relative ${
                  selectedProvider === provider.provider ? 'bg-primary-600/20 text-primary-300' : 'text-gray-300'
                }`}
              >
                {selectedProvider === provider.provider && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 to-primary-600 animate-pulse"></div>
                )}
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getProviderColor(provider.provider)} flex items-center justify-center p-2 mr-3 shadow-lg group-hover:scale-110 transition-transform ${
                    selectedProvider === provider.provider ? 'animate-pulse-glow' : ''
                  }`}>
                    {getProviderIcon(provider.provider, 20, 'text-white')}
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
                    <div className="text-sm text-gray-400 mt-1">{provider.description}</div>
                    {(() => {
                      const defaultModel = provider.models.find(m => m.id === provider.defaultModel);
                      if (defaultModel) {
                        return (
                          <div className="text-xs mt-2 flex items-center gap-2">
                            {defaultModel.costPer1kTokens > 0 ? (
                              <span className="text-green-400">
                                ~${defaultModel.costPer1kTokens}/1k tokens
                              </span>
                            ) : (
                              <span className="text-green-400 font-bold">
                                No cost - runs locally!
                              </span>
                            )}
                            {!defaultModel.supportsVision && (
                              <span className="text-yellow-400">
                                ⚠️ Text-only
                              </span>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </button>
            ))}
            
            {availableProviders.length === 0 && (
              <div className="p-4 text-center text-gray-400">
                <p>No AI providers available</p>
                <p className="text-sm mt-2">Please configure API keys in your environment</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {selectedConfig?.provider === 'lmstudio' && (
        <div className="mt-3 p-3 glass-dark rounded-lg text-sm">
          <p className="text-yellow-400 font-semibold mb-1">⚠️ LM Studio Setup Required:</p>
          <ol className="text-gray-300 space-y-1 ml-4">
            <li>1. Download & install LM Studio</li>
            <li>2. Load a model (e.g., Llama, Mistral)</li>
            <li>3. Start the local server (port 1234)</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default LLMSelector; 