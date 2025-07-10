import { LLMProvider, LLMConfig, LLMResponse, AnalysisSettings, AudioAnalysis } from '../types';
import { analyzeWithGemini } from './providers/geminiProvider';
import { analyzeWithOpenAI } from './providers/openaiProvider';
import { analyzeWithAnthropic } from './providers/anthropicProvider';
import { analyzeLMStudio } from './providers/lmstudioProvider';

// LLM Provider Configurations with dynamic availability
export const getLLMProviders = (): Record<LLMProvider, LLMConfig> => ({
  gemini: {
    provider: 'gemini',
    name: 'Google Gemini',
    description: 'Fast and reliable AI analysis with strong vision capabilities',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    supportsVision: true,
    costPer1kTokens: 0.0025,
    isAvailable: true, // Always show in UI, check at runtime
  },
  openai: {
    provider: 'openai',
    name: 'OpenAI GPT-4',
    description: 'Advanced AI with excellent reasoning and analysis',
    model: 'gpt-4o',
    temperature: 0.7,
    supportsVision: true,
    costPer1kTokens: 0.005,
    isAvailable: true, // Always show in UI, check at runtime
  },
  anthropic: {
    provider: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Sophisticated AI with strong analytical capabilities',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    supportsVision: true,
    costPer1kTokens: 0.003,
    isAvailable: true, // Always show in UI, check at runtime
  },
  claude: {
    provider: 'claude',
    name: 'Claude (Legacy)',
    description: 'Reliable AI analysis with good performance',
    model: 'claude-3-haiku-20240307',
    temperature: 0.7,
    supportsVision: true,
    costPer1kTokens: 0.001,
    isAvailable: true, // Always show in UI, check at runtime
  },
  lmstudio: {
    provider: 'lmstudio',
    name: 'LM Studio (Local)',
    description: 'Run AI models locally on your machine - FREE!',
    model: 'local-model',
    temperature: 0.7,
    supportsVision: false, // Most local models don't support vision yet
    costPer1kTokens: 0, // Free - runs locally
    isAvailable: true, // Always show in UI, check at runtime
  },
});

// Provider function mapping
const PROVIDER_FUNCTIONS = {
  gemini: analyzeWithGemini,
  openai: analyzeWithOpenAI,
  anthropic: analyzeWithAnthropic,
  claude: analyzeWithAnthropic, // Uses same provider as anthropic
  lmstudio: analyzeLMStudio,
};

export const analyzeVideoWithLLM = async (
  frames: { imageData: string; timestamp: number }[],
  duration: number,
  provider: LLMProvider = 'gemini',
  settings?: AnalysisSettings,
  audioAnalysis?: AudioAnalysis,
  lmStudioUrl?: string,
  onProgress?: (message: string) => void
): Promise<LLMResponse> => {
  const providers = getLLMProviders();
  const config = providers[provider];
  
  const analyzeFunction = PROVIDER_FUNCTIONS[provider];
  if (!analyzeFunction) {
    throw new Error(`Provider ${provider} is not implemented.`);
  }

  onProgress?.(`🚀 Starting ${config.name} analysis...`);

  try {
    // Pass audio analysis and progress callback to providers
    let result: any;
    if (provider === 'lmstudio') {
      result = await (analyzeFunction as any)(frames, duration, config, settings, lmStudioUrl, audioAnalysis, onProgress);
    } else if (provider === 'gemini') {
      result = await (analyzeFunction as any)(frames, duration, config, settings, audioAnalysis, onProgress);
    } else if (provider === 'openai') {
      onProgress?.(`🔄 Processing with ${config.name}... (This may take 30-90 seconds)`);
      result = await (analyzeFunction as any)(frames, duration, config, settings, audioAnalysis);
    } else if (provider === 'anthropic' || provider === 'claude') {
      onProgress?.(`🔄 Processing with ${config.name}... (This may take 30-90 seconds)`);
      result = await (analyzeFunction as any)(frames, duration, config, settings, audioAnalysis);
    } else {
      // Fallback for any other providers
      onProgress?.(`🔄 Processing with ${config.name}... (This may take 30-90 seconds)`);
      result = await (analyzeFunction as any)(frames, duration, config, settings);
    }
    
    // Check if result is LLMAnalysisResult (has clips property)
    const clips = Array.isArray(result) ? result : result.clips;
    
    onProgress?.(`✅ ${config.name} analysis completed successfully!`);
    
    return {
      clips,
      provider,
      model: config.model,
    };
  } catch (error) {
    console.error(`Error with ${provider} provider:`, error);
    
    onProgress?.(`❌ ${config.name} analysis failed`);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('API_KEY') || error.message.includes('environment variable')) {
        throw new Error(`${config.name} requires an API key. Please set the required environment variable and restart the application.`);
      }
      if (error.message.includes('LMStudio') && error.message.includes('not running')) {
        throw new Error(`${config.name} is not running. Please start LMStudio and load a model, then try again.`);
      }
    }
    
    throw new Error(`Analysis failed with ${config.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getAvailableProviders = (): LLMConfig[] => {
  const providers = getLLMProviders();
  // Return all providers - API key validation happens at runtime
  return Object.values(providers);
};

export const validateProvider = (provider: string): provider is LLMProvider => {
  const providers = getLLMProviders();
  return Object.keys(providers).includes(provider);
}; 