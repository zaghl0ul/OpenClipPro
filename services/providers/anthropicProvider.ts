import { Clip, LLMConfig, AnalysisSettings, AudioAnalysis } from '../../types';
import { CONTENT_TYPES, PLATFORMS } from '../../utils/analysisConfig';

type GeneratedClip = Omit<Clip, 'id'>;

export const analyzeWithAnthropic = async (
  frames: { imageData: string; timestamp: number }[],
  duration: number,
  config: LLMConfig,
  settings?: AnalysisSettings,
  audioAnalysis?: AudioAnalysis
): Promise<GeneratedClip[]> => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable not set. Please configure your Anthropic API key.");
  }

  // Build enhanced prompt based on settings
  let contentTypeDescription = '';
  let platformDescription = '';
  let durationConstraints = 'Clip durations (endTime - startTime) should be between 5 and 60 seconds.';
  let audioDescription = '';

  if (settings) {
    // Get content type descriptions
    const contentTypes = settings.contentTypes.map(type => 
      `${CONTENT_TYPES[type].name} (${CONTENT_TYPES[type].keywords.join(', ')})`
    ).join(', ');
    contentTypeDescription = `Focus on finding clips that match these content types: ${contentTypes}.`;

    // Get platform info
    const platform = PLATFORMS[settings.platform];
    platformDescription = `The clips will be used for ${platform.name} (${platform.aspectRatio} aspect ratio).`;

    // Duration constraints
    durationConstraints = `Each clip MUST be between ${settings.minDuration} and ${settings.maxDuration} seconds long.`;
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

    const prompt = `You are a viral content strategist AI for a tool called "OpenClip Pro". Your audience is content creators. I have a video that is ${Math.round(duration)} seconds long. I have extracted ${frames.length} frames from this video.

${contentTypeDescription}
${platformDescription}
${audioDescription}

Your task is to analyze these frames to identify up to 4 potentially viral clips. For each clip, provide:

1. A catchy, short title (e.g., "Unbelievable Plot Twist!")
2. A start time and end time in seconds. ${durationConstraints}
3. A compelling one-sentence reason for its viral potential
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
- Emotional impact and peaks
- Visual appeal and composition
- Audio energy and music sync
- Content uniqueness and surprise
- Platform-specific optimization
- Trend alignment and timing

Return your response as a JSON object with this exact structure:
{
  "clips": [
    {
      "title": "Short catchy title",
      "reason": "Compelling reason for viral potential",
      "startTime": 15,
      "endTime": 45,
      "viralScore": {
        "overall": 85,
        "engagement": 80,
        "shareability": 90,
        "retention": 75,
        "trend": 95
      },
      "scoreExplanation": "High shareability due to unexpected moment at 18s. Strong engagement from emotional peak. Excellent trend alignment with current viral patterns."
    }
  ]
}`;

  const messages = [
    {
      role: 'user' as const,
      content: [
        { type: 'text' as const, text: prompt },
        ...frames.map(frame => ({
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: 'image/jpeg' as const,
            data: frame.imageData
          }
        }))
      ]
    }
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error('No response from Anthropic');
    }

    // Parse the response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from the response if it's wrapped in text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse Anthropic response as JSON");
      }
    }

    if (parsedResponse.clips && Array.isArray(parsedResponse.clips)) {
      // Validate clip structure including viral scores
      let validClips = parsedResponse.clips.filter((clip: any) => 
        typeof clip.startTime === 'number' &&
        typeof clip.endTime === 'number' &&
        clip.endTime > clip.startTime &&
        clip.endTime <= duration &&
        clip.startTime >= 0 &&
        clip.viralScore &&
        typeof clip.viralScore.overall === 'number' &&
        typeof clip.scoreExplanation === 'string'
      );

      // Apply duration constraints from settings
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

      return validClips;
    } else {
      console.warn("Anthropic response did not match the expected format.", parsedResponse);
      return [];
    }

  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        throw new Error("Invalid Anthropic API Key. Please check your application configuration.");
      }
      if (error.message.includes('quota') || error.message.includes('billing')) {
        throw new Error("Anthropic API quota exceeded. Please check your billing settings.");
      }
    }
    throw new Error("Failed to get analysis from Anthropic. The model may be temporarily unavailable or returned an invalid response.");
  }
}; 