import { useEffect } from 'react';
import { SecureApiKeyManager } from '../utils/security';

// Component to load API keys securely
const ApiKeyLoader: React.FC = () => {
  useEffect(() => {
    const keyManager = SecureApiKeyManager.getInstance();
    const providers = ['GEMINI', 'OPENAI', 'ANTHROPIC'];
    
    // Clear API keys from window object on component mount for security
    providers.forEach(provider => {
      if ((window as unknown as Record<string, string>)[`${provider}_API_KEY`]) {
        delete (window as unknown as Record<string, string>)[`${provider}_API_KEY`];
      }
    });
    
    // Note: API keys should be loaded through the settings page
    // This component now just ensures clean initialization
  }, []);

  // This component doesn't render anything
  return null;
};

export default ApiKeyLoader; 