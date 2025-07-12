const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '50mb' }));

// Initialize AI providers
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Authentication middleware
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7);
  // In production, validate the JWT token here
  // For now, we'll accept any token for demo purposes
  
  next();
};

// API Routes
app.post('/api/analyze', authenticateUser, async (req, res) => {
  try {
    const { frames, duration, provider, settings, audioAnalysis, model, temperature } = req.body;
    
    if (!frames || !duration || !provider) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let result;
    
    switch (provider) {
      case 'gemini':
        result = await analyzeWithGemini(frames, duration, settings, audioAnalysis, model, temperature);
        break;
      case 'openai':
        result = await analyzeWithOpenAI(frames, duration, settings, audioAnalysis, model, temperature);
        break;
      case 'anthropic':
        result = await analyzeWithAnthropic(frames, duration, settings, audioAnalysis, model, temperature);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported provider' });
    }

    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Analysis failed' 
    });
  }
});

app.post('/api/validate-key', authenticateUser, async (req, res) => {
  try {
    const { provider } = req.body;
    
    let isValid = false;
    
    switch (provider) {
      case 'gemini':
        isValid = !!process.env.GEMINI_API_KEY;
        break;
      case 'openai':
        isValid = !!process.env.OPENAI_API_KEY;
        break;
      case 'anthropic':
        isValid = !!process.env.ANTHROPIC_API_KEY;
        break;
      default:
        return res.status(400).json({ error: 'Unsupported provider' });
    }

    res.json({ valid: isValid });
    
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

app.get('/api/usage', authenticateUser, async (req, res) => {
  try {
    // In production, fetch from database
    res.json({
      totalAnalyses: 0,
      creditsUsed: 0,
      remainingCredits: 5
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage stats' });
  }
});

// AI Provider Functions
async function analyzeWithGemini(frames, duration, settings, audioAnalysis, model = 'gemini-2.5-flash', temperature = 0.7) {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = buildAnalysisPrompt(frames, duration, settings, audioAnalysis);
  
  const contents = [
    { text: prompt },
    ...frames.flatMap(frame => [
      { text: `Frame from ~${Math.round(frame.timestamp)} seconds:` },
      { inlineData: { mimeType: 'image/jpeg', data: frame.imageData } }
    ])
  ];

  const response = await genAI.models.generateContent({
    model,
    contents,
    config: { temperature }
  });

  const text = response.text?.trim() || '';
  const parsedResponse = parseAIResponse(text);
  
  return {
    clips: parsedResponse.clips,
    provider: 'gemini',
    model,
    usage: {
      promptTokens: 0, // Gemini doesn't provide token usage in this format
      completionTokens: 0,
      totalTokens: 0
    }
  };
}

async function analyzeWithOpenAI(frames, duration, settings, audioAnalysis, model = 'gpt-4o', temperature = 0.7) {
  const prompt = buildAnalysisPrompt(frames, duration, settings, audioAnalysis);
  
  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        ...frames.map(frame => ({
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${frame.imageData}`,
            detail: 'high'
          }
        }))
      ]
    }
  ];

  const response = await openai.chat.completions.create({
    model,
    messages,
    max_tokens: 2000,
    temperature
  });

  const content = response.choices[0]?.message?.content;
  const parsedResponse = parseAIResponse(content);
  
  return {
    clips: parsedResponse.clips,
    provider: 'openai',
    model,
    usage: response.usage
  };
}

async function analyzeWithAnthropic(frames, duration, settings, audioAnalysis, model = 'claude-3-5-sonnet-20241022', temperature = 0.7) {
  const prompt = buildAnalysisPrompt(frames, duration, settings, audioAnalysis);
  
  const response = await anthropic.messages.create({
    model,
    max_tokens: 2000,
    temperature,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...frames.map(frame => ({
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: frame.imageData
            }
          }))
        ]
      }
    ]
  });

  const content = response.content[0]?.text;
  const parsedResponse = parseAIResponse(content);
  
  return {
    clips: parsedResponse.clips,
    provider: 'anthropic',
    model,
    usage: {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens
    }
  };
}

function buildAnalysisPrompt(frames, duration, settings, audioAnalysis) {
  let contentTypeDescription = '';
  let platformDescription = '';
  let durationConstraints = 'Clip durations (endTime - startTime) should be between 5 and 60 seconds.';
  let audioDescription = '';

  if (settings) {
    const contentTypes = settings.contentTypes?.map(type => 
      `${type} content`
    ).join(', ') || 'viral content';
    contentTypeDescription = `Focus on finding clips that match these content types: ${contentTypes}.`;

    const platform = settings.platform || 'youtube-shorts';
    platformDescription = `The clips will be used for ${platform} platform.`;

    durationConstraints = `Each clip MUST be between ${settings.minDuration || 15} and ${settings.maxDuration || 60} seconds long.`;
  }

  if (audioAnalysis) {
    const musicInfo = audioAnalysis.hasMusic ? `Music detected (intensity: ${(audioAnalysis.musicIntensity * 100).toFixed(0)}%)` : 'No music detected';
    const speechInfo = `Speech coverage: ${(audioAnalysis.speechCoverage * 100).toFixed(0)}%`;
    audioDescription = `\n\nAUDIO ANALYSIS DATA:
${musicInfo}
${speechInfo}

Use this audio data to enhance your viral potential scoring.`;
  }

  return `You are a viral content strategist AI for a tool called "OpenClip Pro". Your audience is content creators. I have a video that is ${Math.round(duration)} seconds long. I have extracted ${frames.length} frames from this video.

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

Return your response as valid JSON with this exact structure:
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
}

function parseAIResponse(text) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Failed to parse AI response as JSON');
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 OpenClip Pro Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;