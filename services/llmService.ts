import { LLMProvider, LLMConfig, LLMResponse, AnalysisSettings, AudioAnalysis, LLMModel } from '../types';
import { analyzeWithGemini } from './providers/geminiProvider';
import { analyzeWithOpenAI } from './providers/openaiProvider';
import { analyzeWithAnthropic } from './providers/anthropicProvider';
import { analyzeLMStudio } from './providers/lmstudioProvider';
import { apiService, fallbackToDirectProviders } from './apiService';

// LLM Provider Configurations with dynamic availability
export const getLLMProviders = (): Record<LLMProvider, LLMConfig> => ({
  gemini: {
    provider: 'gemini',
    name: 'Google Gemini',
    description: 'Fast and reliable AI analysis with strong vision capabilities',
    models: PROVIDER_MODELS.gemini,
    defaultModel: 'gemini-2.5-flash',
    temperature: 0.7,
    isAvailable: true, // Always show in UI, check at runtime
  },
  openai: {
    provider: 'openai',
    name: 'OpenAI GPT-4',
    description: 'Advanced AI with excellent reasoning and analysis',
    models: PROVIDER_MODELS.openai,
    defaultModel: 'gpt-4o',
    temperature: 0.7,
    isAvailable: true, // Always show in UI, check at runtime
  },
  anthropic: {
    provider: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Sophisticated AI with strong analytical capabilities',
    models: PROVIDER_MODELS.anthropic,
    defaultModel: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    isAvailable: true, // Always show in UI, check at runtime
  },
  claude: {
    provider: 'claude',
    name: 'Claude (Legacy)',
    description: 'Reliable AI analysis with good performance',
    models: PROVIDER_MODELS.claude,
    defaultModel: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    isAvailable: true, // Always show in UI, check at runtime
  },
  lmstudio: {
    provider: 'lmstudio',
    name: 'LM Studio (Local)',
    description: 'Run AI models locally on your machine - FREE!',
    models: PROVIDER_MODELS.lmstudio,
    defaultModel: 'local-model',
    temperature: 0.7,
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

// Provider models configuration
export const PROVIDER_MODELS: Record<LLMProvider, LLMModel[]> = {
  gemini: [
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      description: 'Fast and efficient for most use cases',
      costPer1kTokens: 0.0025,
      supportsVision: true,
      isRecommended: true
    },
    {
      id: 'gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash (Experimental)',
      description: 'Latest experimental model with enhanced capabilities',
      costPer1kTokens: 0.0025,
      supportsVision: true,
      isRecommended: false
    }
  ],
  openai: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: 'Most capable model for complex reasoning',
      costPer1kTokens: 0.005,
      supportsVision: true,
      isRecommended: true
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Faster and more cost-effective',
      costPer1kTokens: 0.00015,
      supportsVision: true,
      isRecommended: false
    }
  ],
  anthropic: [
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      description: 'Balanced performance and cost',
      costPer1kTokens: 0.003,
      supportsVision: true,
      isRecommended: true
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      description: 'Fast and cost-effective',
      costPer1kTokens: 0.001,
      supportsVision: true,
      isRecommended: false
    }
  ],
  claude: [
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      description: 'Balanced performance and cost',
      costPer1kTokens: 0.003,
      supportsVision: true,
      isRecommended: true
    }
  ],
  lmstudio: [
    {
      id: 'local-model',
      name: 'Local Model',
      description: 'Run AI models locally on your machine',
      costPer1kTokens: 0,
      supportsVision: false,
      isRecommended: true
    }
  ]
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
  
  onProgress?.(`🚀 Starting ${config.name} analysis...`);

  try {
    // Try to use secure API service first
    if (fallbackToDirectProviders) {
      try {
        onProgress?.(`🔐 Attempting secure API analysis...`);
        const result = await apiService.analyzeVideo({
          frames,
          duration,
          provider,
          settings,
          audioAnalysis,
          model: config.defaultModel,
          temperature: config.temperature,
        });
        
        onProgress?.(`✅ ${config.name} analysis completed via secure API!`);
        
        return {
          clips: result.clips,
          provider: result.provider,
          model: result.model,
          usage: result.usage,
        };
      } catch (apiError) {
        console.log('Secure API not available, falling back to direct provider calls');
        onProgress?.(`⚠️ Secure API unavailable, using direct provider...`);
      }
    }

    // Fallback to direct provider calls
    const analyzeFunction = PROVIDER_FUNCTIONS[provider];
    if (!analyzeFunction) {
      throw new Error(`Provider ${provider} is not implemented.`);
    }

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
              model: config.defaultModel,
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