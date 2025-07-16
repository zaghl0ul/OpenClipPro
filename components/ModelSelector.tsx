import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LLMProvider } from '../types';
import { PROVIDER_MODELS } from '../services/llmService';

interface ModelSelectorProps {
  provider: LLMProvider;
  selectedModel?: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  provider, 
  selectedModel, 
  onModelChange, 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const availableModels = PROVIDER_MODELS[provider] || [];
  
  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = Math.min(300, availableModels.length * 70);
      
      // Position above if not enough space below
      const shouldPositionAbove = spaceBelow < dropdownHeight + 20;
      
      setDropdownPosition({
        top: shouldPositionAbove 
          ? rect.top + window.scrollY - dropdownHeight - 8
          : rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 320)
      });
    }
  }, [isOpen, availableModels.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't close if clicking on the button
      if (buttonRef.current && buttonRef.current.contains(target)) {
        return;
      }
      
      // Close if clicking outside
      setIsOpen(false);
    };

    // Use capture phase to ensure we get the event before any stopPropagation
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);
  
  // Don't show dropdown if provider has only one model
  if (availableModels.length <= 1) {
    return null;
  }
  
  const currentModel = availableModels.find(m => m.id === selectedModel) || availableModels[0];

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Portal the dropdown to document.body to escape any container constraints
  const dropdownContent = isOpen && !disabled && (
    <div 
      className="fixed z-ultra glass-dark rounded-lg shadow-2xl border border-gray-600/50 overflow-hidden backdrop-blur-xl animate-in slide-in-from-top-2 duration-150"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-h-72 overflow-y-auto custom-scrollbar">
        {availableModels.map((model) => (
          <button
            key={model.id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleModelSelect(model.id);
            }}
            className={`w-full px-4 py-3 text-left text-sm transition-all duration-100 hover:bg-gray-700/50 active:bg-gray-700/70 ${
              selectedModel === model.id 
                ? 'bg-primary-600/20 text-primary-300 border-l-2 border-primary-400' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {model.isRecommended && (
                  <span className="text-xs bg-gradient-to-r from-primary-400 to-primary-600 text-white px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                    ⭐
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{model.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                    {model.description}
                  </div>
                </div>
              </div>
              <div className="text-xs text-right flex-shrink-0">
                {model.costPer1kTokens ? (
                  <div className="text-green-400 font-medium">${model.costPer1kTokens}/1k</div>
                ) : (
                  <div className="text-green-400 font-bold">FREE</div>
                )}
                {!model.supportsVision && (
                  <div className="text-yellow-400 mt-0.5">⚠️ Text-only</div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="relative mt-3">
      <label className="block text-xs font-medium text-gray-400 mb-2">
        Model Selection
      </label>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleButtonClick}
          disabled={disabled}
          className="w-full px-3 py-2.5 text-sm glass-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between transition-all duration-150 hover:bg-gray-700/30 group"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {currentModel?.isRecommended && (
              <span className="text-xs bg-gradient-to-r from-primary-400 to-primary-600 text-white px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                ⭐
              </span>
            )}
            <div className="text-left min-w-0 flex-1">
              <div className="font-medium truncate">{currentModel?.name}</div>
              <div className="text-xs text-gray-400 truncate">
                {currentModel?.costPer1kTokens ? `$${currentModel.costPer1kTokens}/1k tokens` : 'Free'}
              </div>
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-150 flex-shrink-0 ml-2 ${
              isOpen ? 'rotate-180' : ''
            } group-hover:text-gray-300`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Portal dropdown to document.body */}
        {dropdownContent && createPortal(dropdownContent, document.body)}
      </div>
    </div>
  );
};

export default ModelSelector; 