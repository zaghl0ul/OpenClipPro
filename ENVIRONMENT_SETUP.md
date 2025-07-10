# Environment Variables Setup Guide

## 🔐 Create your .env file

Create a file named `.env` (no extension) in your project root with these values:

```env
# Firebase Configuration (from your Firebase console)
VITE_FIREBASE_API_KEY=AIzaSyAwpu49-tabLdLju6tEuttJaOX1Fa9jBcM
VITE_FIREBASE_AUTH_DOMAIN=viral-video-clipper.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://viral-video-clipper-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=viral-video-clipper
VITE_FIREBASE_STORAGE_BUCKET=viral-video-clipper.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=566812069540
VITE_FIREBASE_APP_ID=1:566812069540:web:3009f24c274b688ef12031
VITE_FIREBASE_MEASUREMENT_ID=G-BESTWZ1EZN

# AI Provider API Keys (get your actual keys)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# LM Studio (optional - for local AI)
LMSTUDIO_URL=http://localhost:1234/v1
```

## 🔑 Where to get AI API Keys

### Google Gemini
- Go to: https://makersuite.google.com/app/apikey
- Create new API key
- Cost: ~$0.0025/1k tokens

### OpenAI GPT-4
- Go to: https://platform.openai.com/api-keys
- Create new secret key
- Cost: ~$0.005/1k tokens

### Anthropic Claude
- Go to: https://console.anthropic.com/
- Create API key
- Cost: ~$0.003/1k tokens

### LM Studio (FREE Local AI)
- Download from: https://lmstudio.ai/
- Run locally on your machine
- No API key needed

## ⚠️ Security Important Notes

1. **Never commit .env to git** - It's already in .gitignore
2. **Keep your API keys secret** - Don't share them
3. **The Firebase config above is already filled** with your project details
4. **Only replace the AI API key placeholders** with real keys

## ✅ Your Firebase is Ready

Your Firebase configuration from the console has been properly set up to use environment variables. The app will automatically use your .env values when you run it.

## 🚀 Next Steps

1. Create the `.env` file with the content above
2. Get your AI provider API keys
3. Replace the placeholders with real keys
4. Run `npm run dev` to start development

Your OpenClip Pro will then have full AI analysis capabilities! 