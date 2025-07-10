import { ContentType, Platform, AnalysisSettings } from '../types';

export interface ContentTypeConfig {
  name: string;
  icon: string;
  keywords: string[];
  description: string;
}

export interface PlatformConfig {
  name: string;
  icon: string;
  aspectRatio: string;
  maxDuration: number;
  minDuration: number;
  typicalDuration: string;
}

export const CONTENT_TYPES: Record<ContentType, ContentTypeConfig> = {
  monetization: {
    name: 'High Monetization',
    description: 'Ad-friendly, brand-safe content for maximum revenue',
    icon: '💰',
    keywords: ['brand-safe', 'advertiser-friendly', 'monetizable', 'clean content', 'professional']
  },
  engagement: {
    name: 'User Engagement',
    description: 'Content that drives comments, shares, and reactions',
    icon: '👥',
    keywords: ['shareable', 'discussion-worthy', 'controversial', 'relatable', 'interactive']
  },
  action: {
    name: 'Action & Energy',
    description: 'High-energy scenes with movement and excitement',
    icon: '🎬',
    keywords: ['action-packed', 'dynamic', 'fast-paced', 'exciting', 'intense']
  },
  comedy: {
    name: 'Comedy & Humor',
    description: 'Funny moments, memes, and comedic timing',
    icon: '😂',
    keywords: ['funny', 'hilarious', 'meme-worthy', 'comedic', 'entertaining']
  },
  emotional: {
    name: 'Emotional Moments',
    description: 'Heartwarming, inspiring, or touching content',
    icon: '😢',
    keywords: ['emotional', 'heartwarming', 'inspiring', 'touching', 'meaningful']
  },
  educational: {
    name: 'Educational',
    description: 'Informative content, tutorials, and how-tos',
    icon: '📚',
    keywords: ['educational', 'informative', 'tutorial', 'how-to', 'learning']
  }
};

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  'tiktok': {
    name: 'TikTok',
    icon: '📱',
    aspectRatio: '9:16',
    maxDuration: 60,
    minDuration: 5,
    typicalDuration: '15-30s'
  },
  'youtube-shorts': {
    name: 'YouTube Shorts',
    icon: '📺',
    aspectRatio: '9:16',
    maxDuration: 60,
    minDuration: 5,
    typicalDuration: '30-45s'
  },
  'instagram-reels': {
    name: 'Instagram Reels',
    icon: '📸',
    aspectRatio: '9:16',
    maxDuration: 90,
    minDuration: 5,
    typicalDuration: '15-30s'
  },
  'youtube': {
    name: 'YouTube',
    icon: '🎥',
    aspectRatio: '16:9',
    maxDuration: 600, // 10 minutes
    minDuration: 30,
    typicalDuration: '2-5 minutes'
  },
  'twitter': {
    name: 'Twitter/X',
    icon: '🐦',
    aspectRatio: '16:9',
    maxDuration: 140,
    minDuration: 5,
    typicalDuration: '30-45s'
  },
  'custom': {
    name: 'Custom',
    icon: '⚙️',
    aspectRatio: 'any',
    maxDuration: 300,
    minDuration: 5,
    typicalDuration: 'varies'
  }
};

export const getContentTypeNames = (types: ContentType[]): string[] => {
  return types.map(type => CONTENT_TYPES[type].name);
};

export const getPlatformConfig = (platform: Platform): PlatformConfig => {
  return PLATFORMS[platform];
};

// Helper function to generate LLM prompts based on settings
export const generatePromptFromSettings = (settings: AnalysisSettings): string => {
  const contentTypes = settings.contentTypes
    .map((type: ContentType) => {
      const config = CONTENT_TYPES[type];
      return `${config.name} (${config.keywords.join(', ')})`;
    })
    .join(', ');

  const platform = PLATFORMS[settings.platform];
  
  return `You are an expert viral content strategist specializing in ${platform.name} content.

Your task is to identify the most viral-worthy clips from a video, focusing on:
- Content types: ${contentTypes}
- Platform: ${platform.name} (${platform.aspectRatio}, typical length: ${platform.typicalDuration})
- Duration: Each clip must be ${settings.minDuration}-${settings.maxDuration} seconds

Key criteria for ${settings.contentTypes.map((type: ContentType) => CONTENT_TYPES[type].name).join('/')} content:
${settings.contentTypes.map((type: ContentType) => `- ${CONTENT_TYPES[type].name}: ${CONTENT_TYPES[type].keywords.join(', ')}`).join('\n')}

Platform-specific considerations for ${platform.name}:
- Aspect ratio: ${platform.aspectRatio}
- Typical duration: ${platform.typicalDuration}
- Best practices: Hook viewers in first 3 seconds, maintain high energy, clear value proposition`;
}; 