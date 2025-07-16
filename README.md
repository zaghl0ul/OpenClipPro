# Viral Video Clipper (OpenClip Pro)

## Overview
OpenClip Pro is a professional-grade AI video analysis tool for content creators. It helps identify viral moments in videos using advanced AI models and provides intelligent auto-cropping, scoring, and analytics.

## Features
- Multi-AI provider support (Gemini, OpenAI, Anthropic, LM Studio)
- Audio and visual analysis
- Viral scoring and engagement metrics
- Intelligent auto-cropping for all major platforms
- Modern, responsive UI with glassmorphism design
- Firebase integration for authentication and storage
- Docker and Firebase deployment support

## Getting Started

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd viral-cideo-clipper
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root with your Firebase and AI provider API keys:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# AI Provider API Keys
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
LMSTUDIO_URL=http://localhost:1234/v1 # (optional)
```

### 4. Run the App (Development)
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build:prod
```

### 6. Deploy
- **Firebase Hosting:**
  - Install Firebase CLI: `npm install -g firebase-tools`
  - Login: `firebase login`
  - Deploy: `firebase deploy`
- **Docker:**
  - Build: `npm run docker:build`
  - Run: `npm run docker:run`
  - Or use Docker Compose: `docker-compose up -d --build`

## Directory Structure
- `components/` - React UI components
- `pages/` - Main app pages
- `services/` - AI and video processing services
- `public/ffmpeg/` - FFmpeg WASM files (for video processing)
- `utils/` - Utility functions
- `hooks/` - Custom React hooks
- `themes.css` - Theme and style definitions

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

---

**Note:**
- All legacy deployment scripts and internal documentation have been removed for clarity and security.
- For advanced deployment, monitoring, and backend integration, see the comments in the codebase and Docker/nginx configs.
