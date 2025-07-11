@echo off
setlocal enabledelayedexpansion

:: =======================================================
:: One-Click Deploy Script for Viral Video Clipper
:: =======================================================

echo.
echo ===================================================================
echo                   VIRAL VIDEO CLIPPER - DEPLOY
echo ===================================================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in PATH
    pause
    exit /b 1
)

echo [INFO] Node.js and npm are available
echo.

:: Display deployment options
echo Choose deployment method:
echo.
echo 1. Firebase Hosting (Recommended for production)
echo 2. Docker Deployment (Local/Server)
echo 3. Build Only (Generate dist folder)
echo 4. Development Server (Local testing)
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto firebase_deploy
if "%choice%"=="2" goto docker_deploy
if "%choice%"=="3" goto build_only
if "%choice%"=="4" goto dev_server
if "%choice%"=="5" goto end
goto invalid_choice

:firebase_deploy
echo.
echo ===================================================================
echo                     FIREBASE DEPLOYMENT
echo ===================================================================
echo.

:: Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Firebase CLI is not installed
    echo Installing Firebase CLI...
    npm install -g firebase-tools
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install Firebase CLI
        pause
        exit /b 1
    )
)

:: Check for environment variables
echo [INFO] Checking environment variables...
if "%VITE_FIREBASE_API_KEY%"=="" (
    echo [WARNING] Firebase environment variables not set
    echo Please ensure you have configured your Firebase environment variables
    echo You can create a .env file with the required variables
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i "!continue!" neq "y" goto end
)

:: Install dependencies
echo [INFO] Installing dependencies...
npm ci
if %errorlevel% neq 0 (
    echo [WARNING] npm ci failed, trying npm install instead...
    npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Run tests (optional)
echo [INFO] Running tests...
npm run test -- --run
if %errorlevel% neq 0 (
    echo [WARNING] Tests failed, but continuing with deployment
)

:: Build for production
echo [INFO] Building for production...
npm run build:prod
if %errorlevel% neq 0 (
    echo [ERROR] Production build failed
    pause
    exit /b 1
)

:: Firebase login and deploy
echo [INFO] Deploying to Firebase...
firebase login
firebase deploy

if %errorlevel% equ 0 (
    echo.
    echo ===================================================================
    echo                    DEPLOYMENT SUCCESSFUL!
    echo ===================================================================
    echo Your app has been deployed to Firebase Hosting
    echo Check the console output above for the deployment URL
) else (
    echo [ERROR] Firebase deployment failed
    pause
    exit /b 1
)

goto end

:docker_deploy
echo.
echo ===================================================================
echo                     DOCKER DEPLOYMENT
echo ===================================================================
echo.

:: Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not running
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Choose Docker deployment option:
echo 1. Docker Build and Run (Single container)
echo 2. Docker Compose (Full stack with nginx)
echo.
set /p docker_choice="Enter your choice (1-2): "

if "%docker_choice%"=="1" goto docker_simple
if "%docker_choice%"=="2" goto docker_compose

:docker_simple
echo [INFO] Building Docker image...
npm run docker:build
if %errorlevel% neq 0 (
    echo [ERROR] Docker build failed
    pause
    exit /b 1
)

echo [INFO] Running Docker container...
npm run docker:run
goto end

:docker_compose
echo [INFO] Checking for environment file...
if not exist ".env" (
    echo [WARNING] .env file not found
    echo Creating example .env file...
    echo # Firebase Configuration > .env
    echo VITE_FIREBASE_API_KEY=your_firebase_api_key >> .env
    echo VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com >> .env
    echo VITE_FIREBASE_PROJECT_ID=your_project_id >> .env
    echo VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com >> .env
    echo VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id >> .env
    echo VITE_FIREBASE_APP_ID=your_app_id >> .env
    echo VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id >> .env
    echo.
    echo Please edit the .env file with your actual Firebase configuration
    pause
)

echo [INFO] Starting Docker Compose...
docker-compose up -d --build
if %errorlevel% equ 0 (
    echo.
    echo ===================================================================
    echo                    DEPLOYMENT SUCCESSFUL!
    echo ===================================================================
    echo Your app is running at: http://localhost:3000
    echo Nginx reverse proxy at: http://localhost:80
    echo.
    echo To stop the containers, run: docker-compose down
) else (
    echo [ERROR] Docker Compose deployment failed
    pause
    exit /b 1
)
goto end

:build_only
echo.
echo ===================================================================
echo                      PRODUCTION BUILD
echo ===================================================================
echo.

:: Install dependencies
echo [INFO] Installing dependencies...
npm ci
if %errorlevel% neq 0 (
    echo [WARNING] npm ci failed, trying npm install instead...
    npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Build for production
echo [INFO] Building for production...
npm run build:prod
if %errorlevel% neq 0 (
    echo [ERROR] Production build failed
    pause
    exit /b 1
)

echo.
echo ===================================================================
echo                      BUILD SUCCESSFUL!
echo ===================================================================
echo Production build created in 'dist' folder
echo You can now:
echo - Upload the 'dist' folder to your web server
echo - Serve it with: npm run preview
echo - Deploy to any static hosting service
echo.
goto end

:dev_server
echo.
echo ===================================================================
echo                    DEVELOPMENT SERVER
echo ===================================================================
echo.

:: Install dependencies
echo [INFO] Installing dependencies...
npm ci
if %errorlevel% neq 0 (
    echo [WARNING] npm ci failed, trying npm install instead...
    npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

echo [INFO] Starting development server...
echo Press Ctrl+C to stop the server
npm run dev
goto end

:invalid_choice
echo [ERROR] Invalid choice. Please select 1-5.
echo.
goto firebase_deploy

:end
echo.
echo Deploy script completed.
pause 