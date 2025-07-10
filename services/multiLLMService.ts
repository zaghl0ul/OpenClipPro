import { LLMProvider, AnalysisSettings, MultiLLMAnalysis, Clip, AggregatedClip, LLMResponse, ViralScoreBreakdown, AudioAnalysis } from '../types';
import { analyzeVideoWithLLM } from './llmService';

interface ClipSimilarity {
  clip1: Clip;
  clip2: Clip;
  provider1: LLMProvider;
  provider2: LLMProvider;
  overlapPercentage: number;
}

// Calculate time overlap between two clips
const calculateOverlap = (clip1: Clip, clip2: Clip): number => {
  const start = Math.max(clip1.startTime, clip2.startTime);
  const end = Math.min(clip1.endTime, clip2.endTime);
  const overlap = Math.max(0, end - start);
  const clip1Duration = clip1.endTime - clip1.startTime;
  const clip2Duration = clip2.endTime - clip2.startTime;
  const minDuration = Math.min(clip1Duration, clip2Duration);
  return minDuration > 0 ? (overlap / minDuration) * 100 : 0;
};

// Aggregate viral scores from multiple clips with weighted averaging
const aggregateViralScores = (clips: Array<{ clip: Clip; provider: LLMProvider }>): ViralScoreBreakdown => {
  if (clips.length === 0) {
    return { overall: 0, engagement: 0, shareability: 0, retention: 0, trend: 0 };
  }

  // Calculate weighted average (more weight to providers with higher individual scores)
  const weightedScores = clips.map(({ clip }) => {
    const weight = clip.viralScore.overall / 100; // Weight by overall score
    return {
      overall: clip.viralScore.overall * weight,
      engagement: clip.viralScore.engagement * weight,
      shareability: clip.viralScore.shareability * weight,
      retention: clip.viralScore.retention * weight,
      trend: clip.viralScore.trend * weight,
      weight
    };
  });

  const totalWeight = weightedScores.reduce((sum, score) => sum + score.weight, 0);
  
  if (totalWeight === 0) {
    // Fallback to simple average if all weights are 0
    const simpleAverage = clips.reduce((sum, { clip }) => ({
      overall: sum.overall + clip.viralScore.overall,
      engagement: sum.engagement + clip.viralScore.engagement,
      shareability: sum.shareability + clip.viralScore.shareability,
      retention: sum.retention + clip.viralScore.retention,
      trend: sum.trend + clip.viralScore.trend
    }), { overall: 0, engagement: 0, shareability: 0, retention: 0, trend: 0 });

    return {
      overall: Math.round(simpleAverage.overall / clips.length),
      engagement: Math.round(simpleAverage.engagement / clips.length),
      shareability: Math.round(simpleAverage.shareability / clips.length),
      retention: Math.round(simpleAverage.retention / clips.length),
      trend: Math.round(simpleAverage.trend / clips.length)
    };
  }

  // Calculate weighted average
  const aggregated = weightedScores.reduce((sum, score) => ({
    overall: sum.overall + score.overall,
    engagement: sum.engagement + score.engagement,
    shareability: sum.shareability + score.shareability,
    retention: sum.retention + score.retention,
    trend: sum.trend + score.trend
  }), { overall: 0, engagement: 0, shareability: 0, retention: 0, trend: 0 });

  return {
    overall: Math.round(aggregated.overall / totalWeight),
    engagement: Math.round(aggregated.engagement / totalWeight),
    shareability: Math.round(aggregated.shareability / totalWeight),
    retention: Math.round(aggregated.retention / totalWeight),
    trend: Math.round(aggregated.trend / totalWeight)
  };
};

// Generate aggregated score explanation from multiple AI explanations
const aggregateScoreExplanations = (clips: Array<{ clip: Clip; provider: LLMProvider }>): string => {
  if (clips.length === 0) return "No explanations available.";
  if (clips.length === 1) return clips[0].clip.scoreExplanation;

  // Extract key themes from explanations
  const explanations = clips.map(({ clip }) => clip.scoreExplanation);
  const commonThemes = new Set<string>();
  
  // Simple keyword extraction for common themes
  const keywords = ['engagement', 'shareability', 'retention', 'trend', 'viral', 'hook', 'emotional', 'peak', 'music', 'visual', 'surprise', 'timing'];
  
  keywords.forEach(keyword => {
    const count = explanations.filter(exp => exp.toLowerCase().includes(keyword)).length;
    if (count >= clips.length / 2) { // If mentioned by at least half the AIs
      commonThemes.add(keyword);
    }
  });

  const highestScoreClip = clips.reduce((max, current) => 
    current.clip.viralScore.overall > max.clip.viralScore.overall ? current : max
  );

  if (commonThemes.size > 0) {
    return `AI consensus highlights: ${Array.from(commonThemes).join(', ')}. ${highestScoreClip.clip.scoreExplanation}`;
  } else {
    return `Multiple AIs analyzed this clip. Leading assessment: ${highestScoreClip.clip.scoreExplanation}`;
  }
};

// Find similar clips across providers
const findSimilarClips = (
  allClips: Map<LLMProvider, Clip[]>, 
  threshold: number = 50
): ClipSimilarity[] => {
  const similarities: ClipSimilarity[] = [];
  const providers = Array.from(allClips.keys());

  for (let i = 0; i < providers.length; i++) {
    for (let j = i + 1; j < providers.length; j++) {
      const provider1 = providers[i];
      const provider2 = providers[j];
      const clips1 = allClips.get(provider1) || [];
      const clips2 = allClips.get(provider2) || [];

      for (const clip1 of clips1) {
        for (const clip2 of clips2) {
          const overlap = calculateOverlap(clip1, clip2);
          if (overlap >= threshold) {
            similarities.push({
              clip1,
              clip2,
              provider1,
              provider2,
              overlapPercentage: overlap
            });
          }
        }
      }
    }
  }

  return similarities;
};

// Aggregate clips from multiple providers with viral score aggregation
const aggregateClips = (
  allClips: Map<LLMProvider, Clip[]>,
  similarities: ClipSimilarity[]
): AggregatedClip[] => {
  const aggregated: AggregatedClip[] = [];
  const processedClips = new Set<string>();

  // Group similar clips together
  const clipGroups = new Map<string, {
    clips: Array<{ clip: Clip; provider: LLMProvider }>;
    startTime: number;
    endTime: number;
  }>();

  // First, add all clips to groups based on similarity
  allClips.forEach((clips, provider) => {
    clips.forEach(clip => {
      const clipId = `${provider}-${clip.id}`;
      
      // Find if this clip is similar to any existing group
      let addedToGroup = false;
      for (const similarity of similarities) {
        if ((similarity.clip1.id === clip.id && similarity.provider1 === provider) ||
            (similarity.clip2.id === clip.id && similarity.provider2 === provider)) {
          
          // Find or create group
          const groupKey = similarity.clip1.id < similarity.clip2.id ? 
            `${similarity.provider1}-${similarity.clip1.id}` : 
            `${similarity.provider2}-${similarity.clip2.id}`;
          
          if (!clipGroups.has(groupKey)) {
            clipGroups.set(groupKey, {
              clips: [],
              startTime: Math.min(similarity.clip1.startTime, similarity.clip2.startTime),
              endTime: Math.max(similarity.clip1.endTime, similarity.clip2.endTime)
            });
          }
          
          const group = clipGroups.get(groupKey)!;
          if (!group.clips.some(c => c.clip.id === clip.id && c.provider === provider)) {
            group.clips.push({ clip, provider });
            group.startTime = Math.min(group.startTime, clip.startTime);
            group.endTime = Math.max(group.endTime, clip.endTime);
          }
          
          processedClips.add(clipId);
          addedToGroup = true;
          break;
        }
      }
      
      // If not similar to any group, create its own group
      if (!addedToGroup && !processedClips.has(clipId)) {
        clipGroups.set(clipId, {
          clips: [{ clip, provider }],
          startTime: clip.startTime,
          endTime: clip.endTime
        });
        processedClips.add(clipId);
      }
    });
  });

  // Convert groups to aggregated clips
  let aggregatedId = 0;
  clipGroups.forEach(group => {
    const recommendedBy = group.clips.map(c => c.provider);
    const confidenceScore = (recommendedBy.length / allClips.size) * 100;
    
    // Use the most common title/reason or the highest scoring one
    const titleCounts = new Map<string, number>();
    const reasonCounts = new Map<string, number>();
    
    group.clips.forEach(({ clip }) => {
      titleCounts.set(clip.title, (titleCounts.get(clip.title) || 0) + 1);
      reasonCounts.set(clip.reason, (reasonCounts.get(clip.reason) || 0) + 1);
    });
    
    // Get the highest scoring clip's title and reason as fallback
    const highestScoringClip = group.clips.reduce((max, current) => 
      current.clip.viralScore.overall > max.clip.viralScore.overall ? current : max
    );
    
    const mostCommonTitle = Array.from(titleCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || highestScoringClip.clip.title;
    const mostCommonReason = Array.from(reasonCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || highestScoringClip.clip.reason;
    
    // Aggregate viral scores
    const aggregatedViralScore = aggregateViralScores(group.clips);
    const aggregatedExplanation = aggregateScoreExplanations(group.clips);
    
    // Create variations map with viral scores
    const variations: Record<string, { 
      title: string; 
      reason: string; 
      viralScore: ViralScoreBreakdown;
      scoreExplanation: string;
    }> = {};
    
    group.clips.forEach(({ clip, provider }) => {
      variations[provider] = { 
        title: clip.title, 
        reason: clip.reason,
        viralScore: clip.viralScore,
        scoreExplanation: clip.scoreExplanation
      };
    });
    
    aggregated.push({
      id: `agg-${aggregatedId++}`,
      title: mostCommonTitle,
      reason: mostCommonReason,
      startTime: group.startTime,
      endTime: group.endTime,
      viralScore: aggregatedViralScore,
      scoreExplanation: aggregatedExplanation,
      recommendedBy,
      confidenceScore,
      variations,
      aggregatedViralScore: aggregatedViralScore,
      // Add placeholder values for other required fields
      audioAnalysis: group.clips[0]?.clip.audioAnalysis,
      aspectRatios: group.clips[0]?.clip.aspectRatios
    });
  });

  // Sort by aggregated viral score (higher first) and then by confidence
  return aggregated.sort((a, b) => {
    if (b.aggregatedViralScore.overall !== a.aggregatedViralScore.overall) {
      return b.aggregatedViralScore.overall - a.aggregatedViralScore.overall;
    }
    return b.confidenceScore - a.confidenceScore;
  });
};

// Main function to analyze with multiple LLMs
export const analyzeWithMultipleLLMs = async (
  frames: { imageData: string; timestamp: number }[],
  duration: number,
  providers: LLMProvider[],
  settings: AnalysisSettings,
  audioAnalysis?: AudioAnalysis,
  lmStudioUrl?: string,
  onProgress?: (provider: LLMProvider, status: 'started' | 'completed' | 'failed') => void
): Promise<MultiLLMAnalysis> => {
  if (providers.length === 0) {
    throw new Error('No providers selected for analysis');
  }

  const individualResults = new Map<LLMProvider, Clip[]>();
  const errors: Array<{ provider: LLMProvider; error: string }> = [];

  // Run all analyses in parallel
  const analysisPromises = providers.map(async (provider) => {
    try {
      onProgress?.(provider, 'started');
      
      const result: LLMResponse = await analyzeVideoWithLLM(
        frames, 
        duration, 
        provider, 
        settings, 
        audioAnalysis,
        lmStudioUrl
        // Note: Individual progress updates aren't shown in multi-LLM mode to avoid UI spam
      );
      
      individualResults.set(provider, result.clips.map((clip, index) => ({
        ...clip,
        id: `${provider}-${index}`
      })));
      onProgress?.(provider, 'completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ provider, error: errorMessage });
      individualResults.set(provider, []); // Empty results for failed provider
      onProgress?.(provider, 'failed');
      console.error(`Failed to analyze with ${provider}:`, error);
    }
  });

  await Promise.all(analysisPromises);

  // If all providers failed, throw an error
  if (errors.length === providers.length) {
    throw new Error(`All providers failed: ${errors.map(e => `${e.provider}: ${e.error}`).join(', ')}`);
  }

  // Find similar clips across providers
  const similarities = findSimilarClips(individualResults);

  // Aggregate the results
  const aggregatedClips = aggregateClips(individualResults, similarities);

  // Calculate consensus score based on agreement and score consistency
  const totalClips = Array.from(individualResults.values())
    .reduce((sum, clips) => sum + clips.length, 0);
  const avgClipsPerProvider = totalClips / providers.length;
  
  // Enhanced consensus score calculation
  let consensusScore = 0;
  if (similarities.length > 0 && aggregatedClips.length > 0) {
    const agreementScore = Math.min(100, (similarities.length / avgClipsPerProvider) * 50);
    const scoreConsistencyScore = aggregatedClips.reduce((sum, clip) => {
      const scores = Object.values(clip.variations).map(v => v.viralScore.overall);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
      const consistency = Math.max(0, 100 - Math.sqrt(variance));
      return sum + consistency;
    }, 0) / aggregatedClips.length;
    
    consensusScore = (agreementScore + scoreConsistencyScore) / 2;
  }

  // Convert Map to plain object for Firestore compatibility
  const individualResultsObj: Record<string, Clip[]> = {};
  individualResults.forEach((clips, provider) => {
    individualResultsObj[provider] = clips;
  });

  return {
    providers,
    aggregatedClips,
    individualResults: individualResultsObj,
    consensusScore
  };
}; 