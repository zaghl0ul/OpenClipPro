import { Clip, LLMProvider, AnalysisSettings, AudioAnalysis } from '../../types';
import { CONTENT_TYPES, PLATFORMS } from '../../utils/analysisConfig';

// Legacy config interface for backward compatibility
interface LegacyLLMConfig {
  provider: LLMProvider;
  name: string;
  description: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  supportsVision: boolean;
  costPer1kTokens: number;
  isAvailable: boolean;
}

export const analyzeLMStudio = async (
  frames: { imageData: string; timestamp: number }[],
  duration: number,
  config: LegacyLLMConfig,
  settings?: AnalysisSettings,
  audioAnalysis?: AudioAnalysis,
  customUrl?: string,
  signal?: AbortSignal
): Promise<Omit<Clip, 'id'>[]> => {
  // Check if already cancelled
  if (signal?.aborted) {
    throw new Error('Analysis was cancelled');
  }

  // Construct the full API URL
  const baseUrl = customUrl || process.env.LMSTUDIO_URL || 'http://localhost:1234/v1';
  
  // Smart URL construction - handle different LM Studio configurations
  let apiUrl: string;
  let testUrl: string;
  
  if (baseUrl.includes('/chat/completions')) {
    // Full endpoint URL provided
    apiUrl = baseUrl;
    testUrl = baseUrl.replace('/chat/completions', '/models');
  } else if (baseUrl.includes('/v1')) {
    // OpenAI-compatible base URL with /v1
    apiUrl = `${baseUrl}/chat/completions`;
    testUrl = `${baseUrl}/models`;
  } else {
    // Simple server URL - try both with and without /v1
    // First try with /v1 (standard LM Studio)
    apiUrl = `${baseUrl}/v1/chat/completions`;
    testUrl = `${baseUrl}/v1/models`;
  }
  
  console.log('LMStudio URL construction:', { 
    customUrl, 
    envUrl: process.env.LMSTUDIO_URL, 
    baseUrl, 
    apiUrl,
    testUrl
  });
  
  // Test connection first - try with fallback URLs if needed
  let connectionTested = false;
  let lastError: Error | null = null;
  
  const urlsToTry = [];
  
  // Add the primary URLs
  urlsToTry.push({ api: apiUrl, test: testUrl, label: 'primary' });
  
  // Add fallback URLs if we're using the simple base URL format
  if (!baseUrl.includes('/v1') && !baseUrl.includes('/chat/completions')) {
    // Try without /v1 prefix (some LM Studio configurations)
    urlsToTry.push({ 
      api: `${baseUrl}/chat/completions`, 
      test: `${baseUrl}/models`, 
      label: 'without /v1' 
    });
  }
  
  for (const { api, test, label } of urlsToTry) {
    try {
      if (signal?.aborted) {
        throw new Error('Analysis was cancelled');
      }

      console.log(`Testing LM Studio connection (${label}):`, test);
      const testResponse = await fetch(test, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal
      });
      
      if (testResponse.ok) {
        // Connection successful, update URLs to use this working set
        apiUrl = api;
        testUrl = test;
        connectionTested = true;
        console.log(`✅ LM Studio connection successful (${label}):`, api);
        break;
      } else {
        lastError = new Error(`LM Studio connection failed (${label}): ${testResponse.status}`);
        console.warn(`❌ Connection failed (${label}):`, lastError.message);
      }
    } catch (error) {
      if (error instanceof Error && (error.message === 'Analysis was cancelled' || error.name === 'AbortError')) {
        throw new Error('Analysis was cancelled');
      }
      lastError = error as Error;
      console.warn(`❌ Connection error (${label}):`, lastError.message);
    }
  }
  
  if (!connectionTested) {
    throw new Error(`LM Studio is not running or not accessible. Tried URLs: ${urlsToTry.map(u => u.api).join(', ')}. Last error: ${lastError?.message}. Please start LM Studio and load a model.`);
  }

  if (signal?.aborted) {
    throw new Error('Analysis was cancelled');
  }

  // Build enhanced prompt based on settings and audio analysis
  let contentTypeDescription = '';
  let platformDescription = '';
  let audioDescription = '';
  const analysisSettings = settings || {
    contentTypes: ['engagement'],
    platform: 'youtube-shorts',
    minDuration: 15,
    maxDuration: 60
  };

  if (settings) {
    const contentTypes = settings.contentTypes.map(type => 
      `${CONTENT_TYPES[type].name} (${CONTENT_TYPES[type].keywords.join(', ')})`
    ).join(', ');
    contentTypeDescription = `Focus on finding clips that match these content types: ${contentTypes}.`;

    const platform = PLATFORMS[settings.platform];
    platformDescription = `The clips will be used for ${platform.name} (${platform.aspectRatio} aspect ratio).`;
  }

  // Add audio analysis context if available
  if (audioAnalysis) {
    const musicInfo = audioAnalysis.hasMusic ? `Music detected (intensity: ${(audioAnalysis.musicIntensity * 100).toFixed(0)}%, ${audioAnalysis.tempo ? `tempo: ${audioAnalysis.tempo.toFixed(0)} BPM` : 'tempo unknown'})` : 'No music detected';
    const speechInfo = `Speech coverage: ${(audioAnalysis.speechCoverage * 100).toFixed(0)}%`;
    const emotionalInfo = audioAnalysis.emotionalPeaks.length > 0 ? `Emotional peaks at: ${audioAnalysis.emotionalPeaks.map(t => `${t.toFixed(1)}s`).join(', ')}` : 'No emotional peaks detected';
    const volumeInfo = `Volume: avg ${(audioAnalysis.volume.average * 100).toFixed(0)}%, peak ${(audioAnalysis.volume.peak * 100).toFixed(0)}%, dynamic range ${(audioAnalysis.volume.dynamic * 100).toFixed(0)}%`;
    
    audioDescription = `\n\nAUDIO ANALYSIS DATA:
${musicInfo}
${speechInfo}
${emotionalInfo}
${volumeInfo}

Use this audio data to enhance your viral potential scoring. Consider:
- Music presence and energy for engagement scoring
- Speech coverage for educational/informational content
- Emotional peaks for shareability scoring
- Volume dynamics for retention scoring`;
  }

  // Create a basic transcript from frame timestamps for LM Studio (since it can't see images)
  const transcript = frames.map((frame, index) => 
    `${frame.timestamp.toFixed(1)}s: Frame ${index + 1} (timestamp reference)`
  ).join('\n');

      const systemPrompt = `You are a viral content strategist AI for "OpenClip Pro". You help content creators identify viral-worthy clips from their videos.

${contentTypeDescription}
${platformDescription}
${audioDescription}

Since you cannot see video frames, you'll work with timing data and audio analysis to suggest optimal clip segments.

Your task is to analyze the provided information and suggest up to 4 potentially viral clips with:
1. A catchy, short title
2. Start and end timestamps
3. A compelling reason for viral potential
4. VIRAL SCORE BREAKDOWN (0-100 for each category):
   - Overall: Master viral potential score
   - Engagement: Comments, likes, reactions potential
   - Shareability: How likely to be shared/reposted
   - Retention: How well it holds viewer attention
   - Trend: Alignment with current viral trends
5. Score Explanation: 2-3 sentence explanation of why you gave these specific scores

SCORING GUIDELINES:
- 90-100: Extremely viral potential, likely to go viral
- 70-89: High viral potential, very good chance
- 50-69: Moderate viral potential, decent chance
- 30-49: Low viral potential, needs optimization
- 0-29: Poor viral potential, major issues

Consider these viral factors:
- Hook strength (first 3 seconds)
- Emotional peaks from audio analysis
- Music sync and energy
- Content pacing and structure
- Platform-specific optimization`;

    const prompt = `${systemPrompt}

Video Information:
- Duration: ${duration} seconds
- Frame count: ${frames.length}
- Frame timestamps and descriptions:
${transcript}

Based on the video timestamps above, identify the best clips that match the criteria. Since this is a local model without vision capabilities, focus on identifying good time ranges based on the video structure and pacing.

For each clip, provide:
1. Start and end timestamps
2. A catchy, platform-optimized title
3. Why this clip would perform well
4. Detailed viral score breakdown
5. Score explanation

Remember to:
- Keep clips between ${analysisSettings.minDuration}-${analysisSettings.maxDuration} seconds
- Optimize for ${analysisSettings.platform}
- Focus on ${analysisSettings.contentTypes.join(', ')} content

Respond with a JSON array of clips in this exact format:
[
  {
    "startTime": <number>,
    "endTime": <number>,
    "title": "<string>",
    "reason": "<string>",
    "viralScore": {
      "overall": <number 0-100>,
      "engagement": <number 0-100>,
      "shareability": <number 0-100>,
      "retention": <number 0-100>,
      "trend": <number 0-100>
    },
    "scoreExplanation": "<string>"
  }
]`;

    const requestBody = {
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: config.temperature || 0.7,
      max_tokens: 2000,
      stream: false
    };

    console.log('LMStudio request:', { url: apiUrl, body: requestBody });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal // Pass abort signal to fetch
    });

    if (signal?.aborted) {
      throw new Error('Analysis was cancelled');
    }

    if (!response.ok) {
      const error = await response.text();
      console.error('LMStudio API error response:', { status: response.status, error });
      throw new Error(`LMStudio API error (${response.status}): ${error}`);
    }

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('LMStudio response data:', data);
    } catch (parseError) {
      console.error('Failed to parse LMStudio response as JSON:', responseText);
      throw new Error('LMStudio returned invalid JSON response');
    }
    
    if (signal?.aborted) {
      throw new Error('Analysis was cancelled');
    }

    // Check if response has expected structure
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('LMStudio response structure:', data);
      throw new Error('Invalid response structure from LMStudio. Expected response with choices array.');
    }

    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in LMStudio response');
    }

    // Parse the response
    let clips;
    try {
      clips = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        clips = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse LMStudio response as JSON');
      }
    }

    if (!Array.isArray(clips)) {
      throw new Error('LMStudio response is not an array of clips');
    }

    // Validate and filter clips
    let validClips = clips.filter((clip: unknown) => 
      typeof clip.startTime === 'number' &&
      typeof clip.endTime === 'number' &&
      clip.endTime > clip.startTime &&
      clip.endTime <= duration &&
      clip.startTime >= 0 &&
      clip.viralScore &&
      typeof clip.viralScore.overall === 'number' &&
      typeof clip.scoreExplanation === 'string'
    );

    // Apply duration constraints
    if (settings) {
      validClips = validClips.filter((clip: unknown) => {
        const clipDuration = (clip as { endTime: number; startTime: number }).endTime - (clip as { endTime: number; startTime: number }).startTime;
        return clipDuration >= settings.minDuration && clipDuration <= settings.maxDuration;
      });
    }

    // Ensure viral scores are within valid range (0-100)
    validClips = validClips.map((clip: unknown) => ({
      ...(clip as Record<string, unknown>),
      viralScore: {
        overall: Math.max(0, Math.min(100, (clip as { viralScore: { overall?: number } }).viralScore.overall || 0)),
        engagement: Math.max(0, Math.min(100, (clip as { viralScore: { engagement?: number } }).viralScore.engagement || 0)),
        shareability: Math.max(0, Math.min(100, (clip as { viralScore: { shareability?: number } }).viralScore.shareability || 0)),
        retention: Math.max(0, Math.min(100, (clip as { viralScore: { retention?: number } }).viralScore.retention || 0)),
        trend: Math.max(0, Math.min(100, (clip as { viralScore: { trend?: number } }).viralScore.trend || 0))
      }
    }));
    
    return validClips;
}; 