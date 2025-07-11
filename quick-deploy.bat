@echo off
echo.
echo ===================================================================
echo             QUICK FIREBASE DEPLOY - VIRAL VIDEO CLIPPER
echo ===================================================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install from https://nodejs.org/
    pause
    exit /b 1
)

:: Check Firebase CLI
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing Firebase CLI...
    npm install -g firebase-tools
)

echo [INFO] Installing dependencies...
npm ci
if %errorlevel% neq 0 (
    echo [WARNING] npm ci failed, trying npm install instead...
    npm install
)

echo [INFO] Building for production...
npm run build:prod

echo [INFO] Deploying to Firebase...
firebase deploy

if %errorlevel% equ 0 (
    echo.
    echo ===================================================================
    echo                     DEPLOYMENT SUCCESSFUL!
    echo ===================================================================
    echo Your app is now live on Firebase Hosting!
) else (
    echo [ERROR] Deployment failed
)

pause 