import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LLMProvider } from '../types';
import { getAvailableProviders } from '../services/llmService';
import toast from 'react-hot-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(user?.preferredLLM || 'gemini');
  const [saving, setSaving] = useState(false);
  const availableProviders = getAvailableProviders();

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
        <h1 className="text-4xl font-bold mb-4">Settings</h1>
        <p className="text-lg text-gray-400">Manage your account preferences and AI provider settings</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Account Information */}
        <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-500">
          <h2 className="text-2xl font-bold mb-6">Account Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <p className="text-gray-100 text-lg">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Credits Remaining</label>
              <p className="text-purple-400 font-bold text-2xl">{user?.credits || 0}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">User ID</label>
              <p className="text-gray-400 text-sm font-mono bg-gray-700 p-2 rounded">{user?.uid}</p>
            </div>
          </div>
        </div>

        {/* AI Provider Preferences */}
        <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-500">
          <h2 className="text-2xl font-bold mb-6">AI Provider Preferences</h2>
          <div className="space-y-6">
            <p className="text-gray-400 text-sm">
              Choose your preferred AI provider for video analysis. This will be used as the default when analyzing videos.
            </p>
            
            <div className="space-y-4">
              {availableProviders.map((provider) => (
                <label key={provider.provider} className="flex items-center space-x-4 cursor-pointer transition-all duration-200 hover:scale-105 hover:text-purple-400 p-3 rounded-lg hover:bg-gray-700/50">
                  <input
                    type="radio"
                    name="llmProvider"
                    value={provider.provider}
                    checked={selectedProvider === provider.provider}
                    onChange={(e) => setSelectedProvider(e.target.value as LLMProvider)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-100 text-lg">{provider.name}</div>
                    <div className="text-sm text-gray-400 mt-1">{provider.description}</div>
                    {provider.costPer1kTokens && (
                      <div className="text-xs text-green-400 mt-2">
                        ~${provider.costPer1kTokens}/1k tokens
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:scale-105"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>

      {/* API Configuration Info */}
      <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-500">
        <h2 className="text-2xl font-bold mb-6">API Configuration</h2>
        <div className="space-y-6">
          <p className="text-gray-400 text-sm">
            To use different AI providers, you'll need to configure the following environment variables:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="font-medium text-gray-200 mb-2">Gemini (Google)</div>
              <code className="text-xs text-gray-400 bg-gray-800 p-2 rounded block">GEMINI_API_KEY</code>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="font-medium text-gray-200 mb-2">OpenAI</div>
              <code className="text-xs text-gray-400 bg-gray-800 p-2 rounded block">OPENAI_API_KEY</code>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="font-medium text-gray-200 mb-2">Anthropic</div>
              <code className="text-xs text-gray-400 bg-gray-800 p-2 rounded block">ANTHROPIC_API_KEY</code>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm">
            <strong>Note:</strong> Only providers with valid API keys will be available for selection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 