# Testing Setup Guide - API Key Management

## 🎯 Options for Test Group API Keys

### **Option 1: Simple Backend Proxy** ⭐ **(RECOMMENDED)**

Create a lightweight Express.js backend to handle API keys securely.

#### **Backend Setup (5 minutes)**
```javascript
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Environment variables (your keys)
const API_KEYS = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
};

// Rate limiting per user
const usage = new Map();
const DAILY_LIMIT = 50; // analyses per day per user

app.post('/api/analyze', async (req, res) => {
  const { provider, payload, userId } = req.body;
  
  // Basic rate limiting
  const userUsage = usage.get(userId) || 0;
  if (userUsage >= DAILY_LIMIT) {
    return res.status(429).json({ error: 'Daily limit reached' });
  }
  
  try {
    let response;
    const headers = { 'Content-Type': 'application/json' };
    
    switch (provider) {
      case 'gemini':
        headers['Authorization'] = `Bearer ${API_KEYS.GEMINI_API_KEY}`;
        response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        break;
        
      case 'openai':
        headers['Authorization'] = `Bearer ${API_KEYS.OPENAI_API_KEY}`;
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        break;
        
      case 'anthropic':
        headers['x-api-key'] = API_KEYS.ANTHROPIC_API_KEY;
        headers['anthropic-version'] = '2023-06-01';
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid provider' });
    }
    
    const data = await response.json();
    
    // Track usage
    usage.set(userId, userUsage + 1);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('API proxy running on port 3001'));
```

#### **Deploy Backend**
```bash
# Option A: Local hosting
npm init -y
npm install express cors dotenv
node server.js

# Option B: Deploy to Railway/Render/Vercel
# Just upload the server.js file
```

#### **Frontend Changes**
Update your providers to use the proxy:
```typescript
// In services/providers/geminiProvider.ts
const response = await fetch(`${BACKEND_URL}/api/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'gemini',
    payload: geminiPayload,
    userId: user.uid
  })
});
```

**Benefits:**
- ✅ Complete security - keys never exposed
- ✅ Usage tracking and rate limiting
- ✅ Cost control per user
- ✅ Single setup for all testers

---

### **Option 2: Pre-configured Docker Container** 🐳

Package everything including API keys into a Docker container.

```dockerfile
# Dockerfile.testing
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Embed API keys for testing (TESTING ONLY!)
ENV GEMINI_API_KEY=your_actual_gemini_key
ENV OPENAI_API_KEY=your_actual_openai_key
ENV ANTHROPIC_API_KEY=your_actual_anthropic_key

# Add usage limits
ENV TESTING_MODE=true
ENV MAX_ANALYSES_PER_DAY=10

RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

**Tester Instructions:**
```bash
# Pull and run the testing container
docker pull your-registry/openclip-pro:testing
docker run -p 3000:3000 your-registry/openclip-pro:testing

# Access at http://localhost:3000
```

**Benefits:**
- ✅ Zero setup for testers
- ✅ Controlled environment
- ✅ Built-in usage limits
- ⚠️ Requires Docker knowledge

---

### **Option 3: Shared .env Template** 📝

Provide a pre-filled .env file to testers.

#### **Create .env.testing**
```env
# OpenClip Pro - Testing Configuration
# 🚨 FOR TESTING ONLY - DO NOT SHARE PUBLICLY

# Firebase Configuration (your project)
VITE_FIREBASE_API_KEY=AIzaSyAwpu49-tabLdLju6tEuttJaOX1Fa9jBcM
VITE_FIREBASE_AUTH_DOMAIN=viral-video-clipper.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://viral-video-clipper-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=viral-video-clipper
VITE_FIREBASE_STORAGE_BUCKET=viral-video-clipper.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=566812069540
VITE_FIREBASE_APP_ID=1:566812069540:web:3009f24c274b688ef12031
VITE_FIREBASE_MEASUREMENT_ID=G-BESTWZ1EZN

# AI Provider Keys (shared for testing)
GEMINI_API_KEY=your_actual_gemini_key_here
OPENAI_API_KEY=your_actual_openai_key_here
ANTHROPIC_API_KEY=your_actual_anthropic_key_here

# LM Studio (local - no key needed)
LMSTUDIO_URL=http://localhost:1234/v1

# Testing Configuration
TESTING_MODE=true
```

**Tester Instructions:**
```bash
# 1. Clone the repository
git clone your-repo-url
cd openclip-pro

# 2. Copy testing environment
cp .env.testing .env

# 3. Install and run
npm install
npm run dev
```

**Benefits:**
- ✅ Simple setup
- ✅ Uses existing architecture
- ⚠️ Keys exposed to testers
- ⚠️ No usage control

---

### **Option 4: Cloud Function Proxy** ☁️

Use serverless functions to proxy API calls.

#### **Vercel Function Example**
```typescript
// api/analyze.ts
import { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEYS = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider, payload, userId } = req.body;

  // Add authentication check here
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    let apiResponse;
    
    switch (provider) {
      case 'gemini':
        apiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEYS.GEMINI_API_KEY}`
          },
          body: JSON.stringify(payload)
        });
        break;
        
      // ... other providers
    }

    const data = await apiResponse.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**Deploy:**
```bash
# Deploy to Vercel
npx vercel --prod

# Your API endpoint: https://your-app.vercel.app/api/analyze
```

---

### **Option 5: Local LM Studio Focus** 💻 **(ZERO COST)**

Emphasize the free local option for testing.

#### **LM Studio Setup Guide for Testers**
```markdown
# LM Studio Setup - FREE AI Testing

## 1. Download LM Studio
- Go to: https://lmstudio.ai/
- Download for your OS (Windows/Mac/Linux)

## 2. Download a Model
- Open LM Studio
- Go to "Search" tab
- Download: "Llama 3.2 3B" (good performance, small size)
- Or: "Phi-3-mini" (faster, lighter)

## 3. Start Local Server
- Go to "Local Server" tab
- Load your downloaded model
- Click "Start Server"
- Default URL: http://localhost:1234

## 4. Use in OpenClip Pro
- Clone the repository
- Only add Firebase config to .env (no AI keys needed!)
- Select "LM Studio (Local)" as your AI provider
- Enjoy unlimited FREE analysis!
```

**Benefits:**
- ✅ Completely free for testers
- ✅ No API key management needed
- ✅ Privacy-focused (local processing)
- ⚠️ Requires technical setup

---

## **🎯 Final Recommendation**

**For your test group, I recommend Option 1 (Simple Backend Proxy):**

### **Why?**
1. **Security** - Your API keys stay protected
2. **Control** - You can monitor and limit usage
3. **Cost Management** - Set daily limits per tester
4. **Professional** - Shows production-ready architecture
5. **Simple** - 15 minutes to set up, zero setup for testers

### **Quick Implementation**
1. **Deploy the backend** (I can help you set this up in 10 minutes)
2. **Update your frontend** to use the proxy
3. **Give testers just the frontend URL**

### **Alternative for Zero Setup**
- **Option 5 (LM Studio)** - Recommend this for testers who want immediate access
- **No API keys needed** - Just download and run locally

Would you like me to help you implement the backend proxy? It's the most professional approach and only takes about 15 minutes to set up! 🚀 