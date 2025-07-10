import React, { useState, useEffect } from 'react';
import GeminiIcon from './icons/GeminiIcon';
import OpenAIIcon from './icons/OpenAIIcon';
import AnthropicIcon from './icons/AnthropicIcon';
import LMStudioIcon from './icons/LMStudioIcon';

interface LoaderProps {
  message?: string;
  showProgress?: boolean;
}

const getProviderIcon = (providerName: string, size: number = 48) => {
  const name = providerName.toLowerCase();
  if (name.includes('gemini')) {
    return <GeminiIcon size={size} className="text-white" />;
  } else if (name.includes('openai') || name.includes('gpt')) {
    return <OpenAIIcon size={size} className="text-white" />;
  } else if (name.includes('anthropic') || name.includes('claude')) {
    return <AnthropicIcon size={size} className="text-white" />;
  } else if (name.includes('lmstudio') || name.includes('local')) {
    return <LMStudioIcon size={size} className="text-white" />;
  }
  return null;
};

const Loader: React.FC<LoaderProps> = ({ message = 'Loading...', showProgress = false }) => {
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    let progressInterval: NodeJS.Timeout;
    if (showProgress) {
      progressInterval = setInterval(() => {
        setProgress(prev => prev >= 95 ? 95 : prev + 1);
      }, 200);
    }

    return () => {
      clearInterval(dotsInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [showProgress]);

  // Extract emoji and text from message
  const emojiMatch = message.match(/^([🎬🔍🎯🤝🧠✅❌🔄🎉⏳📸⚙️📝🖼️📥🔧🚀💻🔌📋✨🔮⭐]+)\s*/);
  const emoji = emojiMatch ? emojiMatch[1] : '🔄';
  const text = emojiMatch ? message.replace(emojiMatch[0], '') : message;

  // Check if message mentions a specific provider
  const providerIcon = getProviderIcon(text);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="text-center p-8 glass gradient-border rounded-xl max-w-md mx-4">
        {/* Animated Icon */}
        <div className="mb-6 relative">
          <div className="text-6xl mb-4 animate-bounce">
            {providerIcon || emoji}
          </div>
          <div className="absolute inset-0 animate-ping">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 mx-auto"></div>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="mb-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 rounded-full mx-auto"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 border-4 border-transparent border-t-purple-500 border-r-pink-500 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="mb-4">
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-1">{progress}% complete</div>
          </div>
        )}

        {/* Message */}
        <div className="text-white">
          <h3 className="text-xl font-bold mb-2">
            {text.split('(')[0].trim()}{dots}
          </h3>
          {text.includes('(') && (
            <p className="text-sm text-gray-300">
              {text.substring(text.indexOf('('))}
            </p>
          )}
        </div>

        {/* Tip for long processes */}
        {text.includes('30-90 seconds') || text.includes('may take') && (
          <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
            <p className="text-xs text-blue-300">
              💡 Tip: Higher quality analysis takes longer but provides better results!
            </p>
          </div>
        )}

        {/* Visual Elements */}
        <div className="mt-6 flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loader;