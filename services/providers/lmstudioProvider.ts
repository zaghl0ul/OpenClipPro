import { Clip, LLMConfig, AnalysisSettings, AudioAnalysis } from '../../types';
import { CONTENT_TYPES, PLATFORMS } from '../../utils/analysisConfig';

export const analyzeLMStudio = async (
  frames: { imageData: string; timestamp: number }[],
  duration: number,
  config: LLMConfig,
  settings?: AnalysisSettings,
  lmStudioUrl?: string,
  audioAnalysis?: AudioAnalysis,
  onProgress?: (message: string) => void
): Promise<Omit<Clip, 'id'>[]> => {
  const apiUrl = lmStudioUrl || process.env.LMSTUDIO_URL || 'http://localhost:1234/v1/chat/completions';
  
  onProgress?.(`🔌 Connecting to LM Studio at ${apiUrl}...`);
  
  // Test connection first
  try {
    const testResponse = await fetch(apiUrl.replace('/chat/completions', '/models'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!testResponse.ok) {
      throw new Error(`LM Studio connection failed: ${testResponse.status}`);
    }
    
    onProgress?.(`✅ Connected to LM Studio successfully`);
  } catch (error) {
    throw new Error(`LM Studio is not running or not accessible at ${apiUrl}. Please start LM Studio and load a model.`);
  }

  // Build enhanced prompt based on settings and audio analysis
  let contentTypeDescription = '';
  let platformDescription = '';
  let audioDescription = '';
  let analysisSettings = settings || {
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

    onProgress?.(`🧠 Sending analysis request to local AI model...`);
    onProgress?.(`⏳ Local AI is processing your video... (This may take 1-3 minutes)`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.temperature || 0.7,
        max_tokens: 2000,
        stream: false
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LMStudio API error: ${error}`);
    }

    onProgress?.(`📥 Received response from local AI model...`);

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from LMStudio');
    }

    onProgress?.(`🔍 Processing AI analysis results...`);

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
    let validClips = clips.filter((clip: any) => 
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
      validClips = validClips.filter((clip: any) => {
        const clipDuration = clip.endTime - clip.startTime;
        return clipDuration >= settings.minDuration && clipDuration <= settings.maxDuration;
      });
    }

    // Ensure viral scores are within valid range (0-100)
    validClips = validClips.map((clip: any) => ({
      ...clip,
      viralScore: {
        overall: Math.max(0, Math.min(100, clip.viralScore.overall || 0)),
        engagement: Math.max(0, Math.min(100, clip.viralScore.engagement || 0)),
        shareability: Math.max(0, Math.min(100, clip.viralScore.shareability || 0)),
        retention: Math.max(0, Math.min(100, clip.viralScore.retention || 0)),
        trend: Math.max(0, Math.min(100, clip.viralScore.trend || 0))
      }
    }));

    onProgress?.(`✅ LM Studio analysis complete! Found ${validClips.length} viral-scored clips`);
    
    return validClips;
}; 