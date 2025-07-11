# 🚀 One-Click Deployment Scripts

This directory contains automated deployment scripts for the Viral Video Clipper application. Choose the script that best fits your needs and deployment preferences.

## 📋 Available Scripts

### 1. `deploy.bat` - Full Featured Deployment (Windows Batch)
**Recommended for: Windows users who prefer batch files**

- Interactive menu with multiple deployment options
- Automatic prerequisite checking
- Support for Firebase, Docker, and local builds
- Error handling and user guidance

```bash
# Run from project root
deploy.bat
```

### 2. `deploy.ps1` - Full Featured Deployment (PowerShell)
**Recommended for: Windows users who prefer PowerShell**

- Same features as batch version but with better error handling
- Colored output for better readability
- Modern PowerShell syntax and functions

```powershell
# Run from project root (PowerShell)
.\deploy.ps1
```

### 3. `quick-deploy.bat` - Fast Firebase Deploy
**Recommended for: Quick Firebase deployments**

- No menu - goes straight to Firebase deployment
- Fastest option for regular deployments
- Minimal user interaction required

```bash
# Run from project root
quick-deploy.bat
```

## 🛠️ Prerequisites

Before using any deployment script, ensure you have:

### Required
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Optional (depending on deployment method)
- **Firebase CLI** (auto-installed by scripts if needed)
- **Docker Desktop** (for Docker deployments) - [Download here](https://www.docker.com/products/docker-desktop)

## 🔧 Setup Instructions

### First Time Setup

1. **Clone or navigate to your project directory**
2. **Set up environment variables** (if using Firebase):
   - Create a `.env` file in your project root
   - Add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **Initialize Firebase** (if not already done):
   ```bash
   firebase login
   firebase init
   ```

## 📱 Deployment Options Explained

### 1. Firebase Hosting (Recommended)
- **Best for**: Production deployments, easy scaling, global CDN
- **What it does**: Builds your app and deploys to Firebase Hosting
- **URL**: You'll get a URL like `https://your-project.web.app`
- **Cost**: Free tier available, pay-as-you-scale

### 2. Docker Deployment
- **Best for**: Server deployments, containerized environments
- **Options**:
  - **Single Container**: Runs just your app
  - **Docker Compose**: Runs app + nginx reverse proxy
- **URL**: `http://localhost:3000` (or your server IP)

### 3. Build Only
- **Best for**: Manual deployments, custom hosting
- **What it does**: Creates a `dist` folder with production-ready files
- **Next steps**: Upload the `dist` folder to any web server

### 4. Development Server
- **Best for**: Local testing, development
- **What it does**: Starts a local development server
- **URL**: `http://localhost:5173` (default Vite port)

## 🔍 Troubleshooting

### Common Issues

#### "Node.js not found"
```bash
# Install Node.js from https://nodejs.org/
# Restart your terminal after installation
node --version  # Should show version number
```

#### "Firebase CLI not found"
```bash
# Install globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

#### "Docker not found"
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
# Make sure Docker Desktop is running
docker --version  # Should show version number
```

#### "Permission denied" (PowerShell)
```powershell
# Run this command first to allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Firebase deployment fails
1. Make sure you're logged in: `firebase login`
2. Check if project is initialized: `firebase projects:list`
3. Verify your `firebase.json` configuration
4. Ensure your project has hosting enabled in Firebase Console

#### Build fails
1. Check your environment variables in `.env`
2. Make sure all dependencies are installed: `npm ci`
3. Try clearing node modules: `rm -rf node_modules && npm ci`

## 🎯 Quick Start Guide

### For Firebase Deployment (Most Common)
1. Double-click `quick-deploy.bat`
2. Follow the prompts
3. Your app will be deployed automatically

### For Full Options
1. Double-click `deploy.bat` or run `.\deploy.ps1`
2. Choose option 1 (Firebase) for production
3. Choose option 4 (Dev Server) for local testing

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your Firebase API keys secure
- Review the [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for security best practices
- Consider implementing the backend service mentioned in the production guide

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console output for specific error messages
3. Ensure all prerequisites are properly installed
4. Check your network connection for deployment steps

## 🔄 Regular Deployment Workflow

For regular updates after initial setup:
1. Make your code changes
2. Run `quick-deploy.bat` for fast Firebase deployment
3. Or use the full `deploy.bat` for more options

The scripts handle dependency installation, building, and deployment automatically! 