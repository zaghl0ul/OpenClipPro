import { GoogleGenAI, Type } from "@google/genai";
import { Clip } from '../types';

// Check for API key in multiple locations
const getGeminiApiKey = () => {
  return process.env.GEMINI_API_KEY || 
         (typeof window !== 'undefined' && (window as any).GEMINI_API_KEY) ||
         (typeof localStorage !== 'undefined' && localStorage.getItem('GEMINI_API_KEY'));
};

const apiKey = getGeminiApiKey();
if (!apiKey) {
    console.error("GEMINI_API_KEY not found. Please add your API key in Settings.");
    throw new Error("GEMINI_API_KEY not found. Please add your API key in Settings.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// This interface matches the AI's expected output structure
type GeneratedClip = Omit<Clip, 'id'>;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    clips: {
      type: Type.ARRAY,
      description: "An array of potential viral clips based on the visual frames provided.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A short, catchy title for the clip (max 5-7 words).",
          },
          reason: {
            type: Type.STRING,
            description: "A compelling one-sentence reason explaining its viral potential, based on the visuals in the frames.",
          },
          startTime: {
            type: Type.NUMBER,
            description: "The start time of the clip in seconds from the beginning of the video.",
          },
          endTime: {
            type: Type.NUMBER,
            description: "The end time of the clip in seconds. Must be after startTime.",
          },
        },
        required: ["title", "reason", "startTime", "endTime"],
      },
    },
  },
  required: ["clips"],
};

export const analyzeVideoForViralClips = async (
  frames: { imageData: string; timestamp: number }[],
  duration: number
): Promise<GeneratedClip[]> => {
    const prompt = `You are a viral content strategist AI for a tool called "OpenClip Pro". Your audience is content creators. I have a video that is ${Math.round(duration)} seconds long. I have extracted ${frames.length} frames from this video.

Your task is to analyze these frames to identify up to 4 potentially viral clips. For each clip, provide:
1.  A catchy, short title (e.g., "Unbelievable Plot Twist!").
2.  A start time and end time in seconds. These times must be within the video's total duration and logically correspond to the visual information in the frames.
3.  A compelling one-sentence reason for its viral potential, based *specifically* on the visuals in the frames (e.g., "The sequence of frames starting at 15s captures a peak emotional reaction that is highly shareable.").

Return your response as a JSON object adhering to the provided schema. Clip durations (endTime - startTime) should be between 5 and 60 seconds. Do not create clips that are too short or too long. The frames are provided below, interleaved with their timestamps.`;

  const contents = [
      { text: prompt },
      ...frames.flatMap(frame => [
          { text: `Frame from ~${Math.round(frame.timestamp)} seconds:` },
          { inlineData: { mimeType: 'image/jpeg', data: frame.imageData } }
      ])
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const jsonText = (response.text ?? '').trim();
    const parsedJson = JSON.parse(jsonText);

    if (parsedJson && parsedJson.clips && Array.isArray(parsedJson.clips)) {
        // Additional validation to ensure data quality from the AI
        return parsedJson.clips.filter((clip: any) => 
            typeof clip.startTime === 'number' &&
            typeof clip.endTime === 'number' &&
            clip.endTime > clip.startTime &&
            clip.endTime <= duration &&
            clip.startTime >= 0
        );
    } else {
        console.warn("AI response did not match the expected format or was empty.", parsedJson);
        return [];
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes('400') || error.message.includes('block')) {
            throw new Error("Analysis blocked. The video content may have violated safety policies. Please try a different video.");
        }
        if (error.message.includes('API_KEY')) {
             throw new Error("Invalid API Key. Please check your application configuration.");
        }
    }
    throw new Error("Failed to get analysis from AI. The model may be temporarily unavailable or returned an invalid response.");
  }
};