# OpenClip Pro

A powerful AI-powered tool that analyzes videos and automatically identifies the most viral-worthy clips using multiple AI providers.

## Features

- 🎬 Automatic viral clip detection from any video
- 🤖 Multiple AI provider support (Gemini, OpenAI, Anthropic, LM Studio)
- ✨ Beautiful, modern UI with glassmorphism effects
- 🎯 Smart clip extraction with timestamps
- 📊 Analysis history tracking
- 🔐 Secure authentication with Firebase
- 🎵 Advanced audio analysis with music and speech detection
- 🏆 AI-powered viral scoring (0-100) with detailed explanations
- 📐 Intelligent auto-cropping for multiple aspect ratios (16:9, 9:16, 1:1)
- 🤖 Multi-AI consensus analysis for higher confidence results

## Supported AI Providers

### 1. **Google Gemini** ✨
- Fast and reliable with excellent vision capabilities
- Cost: ~$0.0025/1k tokens
- [Get API Key](https://makersuite.google.com/app/apikey)

### 2. **OpenAI GPT-4** 🤖
- Advanced reasoning and analysis
- Cost: ~$0.005/1k tokens
- [Get API Key](https://platform.openai.com/api-keys)

### 3. **Anthropic Claude** 🧠
- Sophisticated analytical capabilities
- Cost: ~$0.003/1k tokens
- [Get API Key](https://console.anthropic.com/)

### 4. **LM Studio (Local)** 💻
- **FREE** - Run AI models locally on your machine
- No API key required
- Note: Text-only analysis (no vision support yet)

## Setup Instructions

### 1. Clone the repository
   ```bash
   git clone <repository-url>
   cd openclip-pro
   ```

### 2. Install dependencies
   ```bash
   npm install
   ```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

   ```env
# AI Provider API Keys (add the ones you want to use)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# LM Studio Configuration (optional)
LMSTUDIO_URL=http://localhost:1234/v1

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Setting up LM Studio (Optional - for free local AI)

1. **Download LM Studio** from [lmstudio.ai](https://lmstudio.ai/)
2. **Download a model** (recommended: Llama 3, Mistral, or Phi-3)
3. **Load the model** in LM Studio
4. **Start the local server** (usually on port 1234)
5. The app will automatically detect when LM Studio is running

### 5. Run the development server
   ```bash
   npm run dev
   ```

## How It Works

1. **Upload a video** - Support for common video formats
2. **Choose AI provider** - Select from available providers or use multi-AI analysis
3. **AI analyzes the video** - Extracts frames, analyzes audio, and identifies viral moments
4. **Get viral clips** - Download clips with viral scores, explanations, and auto-cropping coordinates

## Revolutionary Features

### 🎵 Advanced Audio Analysis
- Music detection and intensity analysis (0-100% scale)
- Speech coverage mapping across timeline  
- Emotional peak detection using frequency analysis
- Volume dynamics and range analysis
- Tempo detection (BPM) for music synchronization

### 🏆 AI Viral Scoring System
- Overall viral score (0-100 master rating)
- Engagement potential (comments, likes, reactions)
- Shareability index (repost and viral spread likelihood)
- Retention score (viewer attention and watch time)
- Trend alignment (current viral pattern matching)
- Detailed AI explanations for each score

### 📐 Intelligent Auto-Cropping
- 16:9 Landscape (YouTube, traditional platforms)
- 9:16 Portrait (TikTok, YouTube Shorts, Instagram Reels)
- 1:1 Square (Instagram posts, Twitter)
- Focal point detection (faces, action, text)
- Rule of thirds composition analysis

### 🤖 Multi-AI Board of Advisors
- Combine insights from multiple AI models
- Intelligent score aggregation with weighted averaging
- Confidence scoring based on AI agreement
- Consensus-driven explanations

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with custom glassmorphism effects
- **AI**: Multiple LLM providers (Gemini, OpenAI, Anthropic, LM Studio)
- **Backend**: Firebase (Auth + Firestore + Storage)
- **Video Processing**: Browser-based video frame extraction + WebAudio API
- **Audio Analysis**: Custom frequency analysis algorithms

## Visual Features

- 🌈 Animated gradient backgrounds
- 🪟 Glassmorphism UI elements
- ✨ Neon text effects and holographic styling
- 🎯 3D hover animations and magnetic buttons
- 💫 Particle cursor effects
- 🌟 Interactive progress bars and score visualizations

## Competitive Advantages

- **Industry First**: Audio + visual analysis for viral prediction
- **Multi-AI Consensus**: 4 AI models working together
- **Predictive Scoring**: Detailed 0-100 viral scores with explanations
- **Auto-Cropping**: Saves 2-3 hours of manual work per video
- **Platform Optimization**: Tailored for TikTok, YouTube, Instagram

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
