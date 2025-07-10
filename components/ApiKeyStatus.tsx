import React from 'react';
import { Link } from 'react-router-dom';

const ApiKeyStatus: React.FC = () => {
  // Check if any API keys are available
  const hasGemini = !!(localStorage.getItem('GEMINI_API_KEY') || (typeof window !== 'undefined' && (window as any).GEMINI_API_KEY));
  const hasOpenAI = !!(localStorage.getItem('OPENAI_API_KEY') || (typeof window !== 'undefined' && (window as any).OPENAI_API_KEY));
  const hasAnthropic = !!(localStorage.getItem('ANTHROPIC_API_KEY') || (typeof window !== 'undefined' && (window as any).ANTHROPIC_API_KEY));
  
  const hasAnyKeys = hasGemini || hasOpenAI || hasAnthropic;
  const availableProviders = [];
  
  if (hasGemini) availableProviders.push('Gemini');
  if (hasOpenAI) availableProviders.push('OpenAI');
  if (hasAnthropic) availableProviders.push('Anthropic');

  if (hasAnyKeys) {
    return (
      <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-green-400 text-xl">✅</div>
          <div>
            <h3 className="text-green-100 font-semibold">API Keys Configured</h3>
            <p className="text-green-200 text-sm">
              Available providers: {availableProviders.join(', ')}. You can now analyze videos!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="text-yellow-400 text-2xl">🔑</div>
        <div className="flex-1">
          <h3 className="text-yellow-100 font-semibold text-lg mb-2">API Keys Required</h3>
          <p className="text-yellow-200 text-sm mb-4">
            To analyze videos, you need to configure API keys for AI providers. Choose from:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-yellow-800/20 rounded-lg p-3">
              <h4 className="font-medium text-yellow-100">Google Gemini</h4>
              <p className="text-xs text-yellow-300">~$0.0025/1k tokens</p>
            </div>
            <div className="bg-yellow-800/20 rounded-lg p-3">
              <h4 className="font-medium text-yellow-100">OpenAI GPT-4</h4>
              <p className="text-xs text-yellow-300">~$0.005/1k tokens</p>
            </div>
            <div className="bg-yellow-800/20 rounded-lg p-3">
              <h4 className="font-medium text-yellow-100">Anthropic Claude</h4>
              <p className="text-xs text-yellow-300">~$0.003/1k tokens</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/settings"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              🔧 Configure API Keys
            </Link>
            <div className="text-xs text-yellow-300">
              <strong>💡 Free Alternative:</strong> Use LM Studio for local AI analysis (no API keys needed)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyStatus; 