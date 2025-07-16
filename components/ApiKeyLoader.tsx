import { useEffect } from 'react';

// Component to load API keys from localStorage and make them globally available
const ApiKeyLoader: React.FC = () => {
  useEffect(() => {
    // Load API keys from localStorage and set them globally
    const providers = ['GEMINI', 'OPENAI', 'ANTHROPIC'];
    
    providers.forEach(provider => {
      const key = localStorage.getItem(`${provider}_API_KEY`);
      if (key && key.trim()) {
        (window as unknown as Record<string, string>)[`${provider}_API_KEY`] = key.trim();
        console.log(`Loaded ${provider} API key from localStorage`);
      }
    });
  }, []);

  // This component doesn't render anything
  return null;
};

export default ApiKeyLoader; 