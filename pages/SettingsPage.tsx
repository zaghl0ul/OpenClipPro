import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LLMProvider } from '../types';
import { getAvailableProviders } from '../services/llmService';
import toast from 'react-hot-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../components/ThemeProvider';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(user?.preferredLLM || 'gemini');
  const [saving, setSaving] = useState(false);
  const availableProviders = getAvailableProviders();

  // API Key state management
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openai: '',
    anthropic: ''
  });
  const [showApiKeys, setShowApiKeys] = useState({
    gemini: false,
    openai: false,
    anthropic: false
  });
  const [savingApiKeys, setSavingApiKeys] = useState(false);

  // Use theme provider for Windows 98 theme detection
  const { theme } = useTheme();
  const isWindows98Theme = theme === 'win98';
  const [showAboutDialog, setShowAboutDialog] = useState(false);

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const loadApiKeys = () => {
      const geminiKey = localStorage.getItem('GEMINI_API_KEY') || '';
      const openaiKey = localStorage.getItem('OPENAI_API_KEY') || '';
      const anthropicKey = localStorage.getItem('ANTHROPIC_API_KEY') || '';
      
      setApiKeys({
        gemini: geminiKey,
        openai: openaiKey,
        anthropic: anthropicKey
      });
    };

    loadApiKeys();
  }, []);

  const handleApiKeyChange = (provider: keyof typeof apiKeys, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const toggleApiKeyVisibility = (provider: keyof typeof showApiKeys) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const handleSaveApiKeys = async () => {
    setSavingApiKeys(true);
    try {
      // Save to localStorage
      if (apiKeys.gemini) {
        localStorage.setItem('GEMINI_API_KEY', apiKeys.gemini);
      } else {
        localStorage.removeItem('GEMINI_API_KEY');
      }
      
      if (apiKeys.openai) {
        localStorage.setItem('OPENAI_API_KEY', apiKeys.openai);
      } else {
        localStorage.removeItem('OPENAI_API_KEY');
      }
      
      if (apiKeys.anthropic) {
        localStorage.setItem('ANTHROPIC_API_KEY', apiKeys.anthropic);
      } else {
        localStorage.removeItem('ANTHROPIC_API_KEY');
      }

      toast.success('API keys saved successfully!');
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast.error('Failed to save API keys. Please try again.');
    } finally {
      setSavingApiKeys(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        preferredLLM: selectedProvider
      });
      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4" style={{
          fontFamily: isWindows98Theme ? '"MS Sans Serif", "Microsoft Sans Serif", sans-serif' : undefined,
          fontSize: isWindows98Theme ? '18px' : undefined,
        }}>
          {isWindows98Theme ? '⚙️ OpenClip Pro - Settings' : 'Settings'}
        </h1>
        <p className="text-lg text-gray-400" style={{
          fontFamily: isWindows98Theme ? '"MS Sans Serif", "Microsoft Sans Serif", sans-serif' : undefined,
          fontSize: isWindows98Theme ? '12px' : undefined,
          color: isWindows98Theme ? 'black' : undefined,
        }}>
          {isWindows98Theme ? 'Configure your video analysis preferences' : 'Manage your account preferences and AI provider settings'}
        </p>
      </div>
      
      {/* Windows 98 About Dialog */}
      {showAboutDialog && isWindows98Theme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] max-w-md w-full mx-4" style={{
            borderStyle: 'outset',
            fontFamily: '"MS Sans Serif", "Microsoft Sans Serif", sans-serif',
            fontSize: '12px'
          }}>
            {/* Title Bar */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-1">
              <div className="flex justify-between items-center px-2">
                <span className="font-bold">About OpenClip Pro</span>
                <button 
                  onClick={() => setShowAboutDialog(false)}
                  className="w-4 h-4 bg-gray-400 border border-gray-600 text-xs hover:bg-gray-300" 
                  style={{borderStyle: 'outset'}}
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 text-black">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🖥️</div>
                <div className="font-bold text-lg">OpenClip Pro</div>
                <div className="text-sm">Version 1.0 (Build 1998.07.25)</div>
              </div>
              
              <div className="text-xs space-y-2">
                <div>💾 System Requirements:</div>
                <div className="ml-4">
                  <div>• Pentium II 233 MHz processor</div>
                  <div>• 64 MB RAM (128 MB recommended)</div>
                  <div>• 100 MB hard disk space</div>
                  <div>• Internet Explorer 4.0 or higher</div>
                  <div>• Sound Blaster compatible sound card</div>
                </div>
                
                <div className="mt-3">🎯 Features:</div>
                <div className="ml-4">
                  <div>• AI-powered video analysis</div>
                  <div>• Clip generation from viral content</div>
                  <div>• Multiple AI provider support</div>
                  <div>• Year 2000 compliant</div>
                </div>
                
                <div className="mt-3 text-center">
                  <div>© 1998 OpenClip Corporation</div>
                  <div>All rights reserved.</div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setShowAboutDialog(false)}
                  className="btn-primary px-4 py-1"
                  style={{
                    fontFamily: '"MS Sans Serif", "Microsoft Sans Serif", sans-serif',
                    fontSize: '12px'
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Account Information */}
        <div className={`card p-8 ${isWindows98Theme ? 'border-2 border-gray-600' : ''}`} style={{
          borderStyle: isWindows98Theme ? 'outset' : undefined,
          borderRadius: isWindows98Theme ? '0' : undefined,
          fontFamily: isWindows98Theme ? '"MS Sans Serif", "Microsoft Sans Serif", sans-serif' : undefined,
          background: isWindows98Theme ? 'var(--color-bg-secondary)' : undefined,
        }}>
          <h2 className="text-2xl font-bold mb-6" style={{
            fontSize: isWindows98Theme ? '14px' : undefined,
            color: isWindows98Theme ? 'black' : undefined,
          }}>
            {isWindows98Theme ? '👤 User Account Information' : 'Account Information'}
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{
                fontSize: isWindows98Theme ? '12px' : undefined,
                color: isWindows98Theme ? 'black' : undefined,
              }}>
                {isWindows98Theme ? '📧 Email Address:' : 'Email'}
              </label>
              <p className="text-lg" style={{
                fontSize: isWindows98Theme ? '12px' : undefined,
                color: isWindows98Theme ? 'black' : undefined,
              }}>{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{
                fontSize: isWindows98Theme ? '12px' : undefined,
                color: isWindows98Theme ? 'black' : undefined,
              }}>
                {isWindows98Theme ? '💰 Available Credits:' : 'Credits Remaining'}
              </label>
              <p className={`font-bold text-2xl ${isWindows98Theme ? 'text-blue-600' : 'text-[var(--color-accent)]'}`} style={{
                fontSize: isWindows98Theme ? '16px' : undefined,
              }}>
                {user?.credits || 0}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{
                fontSize: isWindows98Theme ? '12px' : undefined,
                color: isWindows98Theme ? 'black' : undefined,
              }}>
                {isWindows98Theme ? '🆔 User Identification:' : 'User ID'}
              </label>
              <p className={`text-sm font-mono p-2 rounded ${isWindows98Theme ? 'bg-white border border-gray-600 text-black' : 'bg-[var(--color-bg-tertiary)]'}`} style={{
                borderRadius: isWindows98Theme ? '0' : undefined,
                borderStyle: isWindows98Theme ? 'inset' : undefined,
                fontSize: isWindows98Theme ? '11px' : undefined,
                fontFamily: isWindows98Theme ? 'Courier, monospace' : undefined,
              }}>
                {user?.uid}
              </p>
            </div>
            
            {/* Windows 98 System Info */}
            {isWindows98Theme && (
              <div className="mt-4 p-2 bg-gray-100 border border-gray-600 text-black" style={{
                borderStyle: 'inset',
                fontSize: '11px'
              }}>
                <div className="font-bold mb-1">💻 System Information:</div>
                <div>• Browser: Internet Explorer 4.0</div>
                <div>• OS: Windows 98 Second Edition</div>
                <div>• Memory: 128 MB RAM</div>
                <div>• Connection: 56k Dial-up Modem</div>
              </div>
            )}
          </div>
        </div>

        {/* Theme Preferences */}
        <div className={`card p-8 ${isWindows98Theme ? 'border-2 border-gray-600' : ''}`} style={{
          borderStyle: isWindows98Theme ? 'outset' : undefined,
          borderRadius: isWindows98Theme ? '0' : undefined,
          fontFamily: isWindows98Theme ? '"MS Sans Serif", "Microsoft Sans Serif", sans-serif' : undefined,
          background: isWindows98Theme ? 'var(--color-bg-secondary)' : undefined,
        }}>
          <h2 className="text-2xl font-bold mb-6" style={{
            fontSize: isWindows98Theme ? '14px' : undefined,
            color: isWindows98Theme ? 'black' : undefined,
          }}>
            {isWindows98Theme ? '🎨 Display Properties' : 'Theme Preferences'}
          </h2>
          <ThemeSwitcher />
          
          {/* Windows 98 About Button */}
          {isWindows98Theme && (
            <div className="mt-4">
              <button
                onClick={() => setShowAboutDialog(true)}
                className="btn-primary px-4 py-2 w-full"
                style={{
                  fontFamily: '"MS Sans Serif", "Microsoft Sans Serif", sans-serif',
                  fontSize: '12px'
                }}
              >
                📖 About OpenClip Pro...
              </button>
            </div>
          )}
        </div>
      </div>

      {/* API Keys Configuration */}
      <div className="card p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">API Keys Configuration</h2>
        <div className="space-y-6">
          <p className="text-sm text-gray-400">
            Enter your API keys to enable different AI providers. Your keys are stored locally and never shared.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gemini API Key */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Google Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys.gemini ? 'text' : 'password'}
                  value={apiKeys.gemini}
                  onChange={(e) => handleApiKeyChange('gemini', e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full p-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('gemini')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showApiKeys.gemini ? '👁️' : '🙈'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Get your key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Google AI Studio</a>
              </p>
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys.openai ? 'text' : 'password'}
                  value={apiKeys.openai}
                  onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="w-full p-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('openai')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showApiKeys.openai ? '👁️' : '🙈'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">OpenAI Platform</a>
              </p>
            </div>

            {/* Anthropic API Key */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Anthropic Claude API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys.anthropic ? 'text' : 'password'}
                  value={apiKeys.anthropic}
                  onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                  placeholder="Enter your Anthropic API key"
                  className="w-full p-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('anthropic')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showApiKeys.anthropic ? '👁️' : '🙈'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Get your key from <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Anthropic Console</a>
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveApiKeys}
            disabled={savingApiKeys}
            className="btn-primary w-full mt-6 py-4 px-6 disabled:opacity-50"
          >
            {savingApiKeys ? 'Saving API Keys...' : 'Save API Keys'}
          </button>

          <div className="mt-4 p-4 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border)]">
            <h3 className="font-medium mb-2">📱 LM Studio (Local AI)</h3>
            <p className="text-sm text-gray-400">
              LM Studio runs AI models locally on your computer - no API key required! Download it from{' '}
              <a href="https://lmstudio.ai" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
                lmstudio.ai
              </a>{' '}
              to use free local AI models.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* AI Provider Preferences */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6">AI Provider Preferences</h2>
          <div className="space-y-6">
            <p className="text-sm">
              Choose your preferred AI provider for video analysis. This will be used as the default when analyzing videos.
            </p>
            
            <div className="space-y-4">
              {availableProviders.map((provider) => (
                <label key={provider.provider} className="flex items-center space-x-4 cursor-pointer transition-all duration-200 hover:scale-105 hover:text-[var(--color-accent)] p-3 rounded-lg hover:bg-[var(--color-bg-tertiary)]">
                  <input
                    type="radio"
                    name="llmProvider"
                    value={provider.provider}
                    checked={selectedProvider === provider.provider}
                    onChange={(e) => setSelectedProvider(e.target.value as LLMProvider)}
                    className="text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-lg">{provider.name}</div>
                    <div className="text-sm mt-1">{provider.description}</div>
                    {provider.models[0]?.costPer1kTokens && (
                      <div className="text-xs text-[var(--color-success)] mt-2">
                        ~${provider.models[0].costPer1kTokens}/1k tokens
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="btn-primary w-full mt-6 py-4 px-6 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 