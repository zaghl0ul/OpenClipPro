# =======================================================
# One-Click Deploy Script for Viral Video Clipper (PowerShell)
# =======================================================

# Function definitions
function Deploy-Firebase {
    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Cyan
    Write-Host "                     FIREBASE DEPLOYMENT" -ForegroundColor Cyan
    Write-Host "===================================================================" -ForegroundColor Cyan
    Write-Host ""

    # Check if Firebase CLI is installed
    try {
        $firebaseVersion = firebase --version 2>$null
        Write-Host "[INFO] Firebase CLI version: $firebaseVersion" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Firebase CLI is not installed" -ForegroundColor Red
        Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow
        npm install -g firebase-tools
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to install Firebase CLI" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    }

    # Check for environment variables
    Write-Host "[INFO] Checking environment variables..." -ForegroundColor Blue
    if (-not $env:VITE_FIREBASE_API_KEY) {
        Write-Host "[WARNING] Firebase environment variables not set" -ForegroundColor Yellow
        Write-Host "Please ensure you have configured your Firebase environment variables" -ForegroundColor Yellow
        Write-Host "You can create a .env file with the required variables" -ForegroundColor Yellow
        Write-Host ""
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne "y") { exit 0 }
    }

    # Install dependencies
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Blue
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] npm ci failed, trying npm install instead..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    }

    # Run tests (optional)
    Write-Host "[INFO] Running tests..." -ForegroundColor Blue
    npm run test -- --run
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] Tests failed, but continuing with deployment" -ForegroundColor Yellow
    }

    # Build for production
    Write-Host "[INFO] Building for production..." -ForegroundColor Blue
    npm run build:prod
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Production build failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }

    # Firebase login and deploy
    Write-Host "[INFO] Deploying to Firebase..." -ForegroundColor Blue
    firebase login
    firebase deploy

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "===================================================================" -ForegroundColor Green
        Write-Host "                    DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
        Write-Host "===================================================================" -ForegroundColor Green
        Write-Host "Your app has been deployed to Firebase Hosting" -ForegroundColor Green
        Write-Host "Check the console output above for the deployment URL" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Firebase deployment failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

function Deploy-Docker {
    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Cyan
    Write-Host "                     DOCKER DEPLOYMENT" -ForegroundColor Cyan
    Write-Host "===================================================================" -ForegroundColor Cyan
    Write-Host ""

    # Check if Docker is installed
    try {
        $dockerVersion = docker --version 2>$null
        Write-Host "[INFO] Docker version: $dockerVersion" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Docker is not installed or not running" -ForegroundColor Red
        Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host "Choose Docker deployment option:" -ForegroundColor Yellow
    Write-Host "1. Docker Build and Run (Single container)" -ForegroundColor White
    Write-Host "2. Docker Compose (Full stack with nginx)" -ForegroundColor White
    Write-Host ""
    $dockerChoice = Read-Host "Enter your choice (1-2)"

    if ($dockerChoice -eq "1") {
        Write-Host "[INFO] Building Docker image..." -ForegroundColor Blue
        npm run docker:build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Docker build failed" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }

        Write-Host "[INFO] Running Docker container..." -ForegroundColor Blue
        npm run docker:run
    } elseif ($dockerChoice -eq "2") {
        Write-Host "[INFO] Checking for environment file..." -ForegroundColor Blue
        if (-not (Test-Path ".env")) {
            Write-Host "[WARNING] .env file not found" -ForegroundColor Yellow
            Write-Host "Creating example .env file..." -ForegroundColor Yellow
            @"
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
"@ | Out-File -FilePath ".env" -Encoding UTF8
            Write-Host ""
            Write-Host "Please edit the .env file with your actual Firebase configuration" -ForegroundColor Yellow
            Read-Host "Press Enter to continue"
        }

        Write-Host "[INFO] Starting Docker Compose..." -ForegroundColor Blue
        docker-compose up -d --build
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "===================================================================" -ForegroundColor Green
            Write-Host "                    DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
            Write-Host "===================================================================" -ForegroundColor Green
            Write-Host "Your app is running at: http://localhost:3000" -ForegroundColor Green
            Write-Host "Nginx reverse proxy at: http://localhost:80" -ForegroundColor Green
            Write-Host ""
            Write-Host "To stop the containers, run: docker-compose down" -ForegroundColor Yellow
        } else {
            Write-Host "[ERROR] Docker Compose deployment failed" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
}

function Build-Only {
    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Cyan
    Write-Host "                      PRODUCTION BUILD" -ForegroundColor Cyan
    Write-Host "===================================================================" -ForegroundColor Cyan
    Write-Host ""

    # Install dependencies
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Blue
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] npm ci failed, trying npm install instead..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    }

    # Build for production
    Write-Host "[INFO] Building for production..." -ForegroundColor Blue
    npm run build:prod
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Production build failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Green
    Write-Host "                      BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "===================================================================" -ForegroundColor Green
    Write-Host "Production build created in 'dist' folder" -ForegroundColor Green
    Write-Host "You can now:" -ForegroundColor White
    Write-Host "- Upload the 'dist' folder to your web server" -ForegroundColor White
    Write-Host "- Serve it with: npm run preview" -ForegroundColor White
    Write-Host "- Deploy to any static hosting service" -ForegroundColor White
    Write-Host ""
}

function Start-DevServer {
    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Cyan
    Write-Host "                    DEVELOPMENT SERVER" -ForegroundColor Cyan
    Write-Host "===================================================================" -ForegroundColor Cyan
    Write-Host ""

    # Install dependencies
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Blue
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] npm ci failed, trying npm install instead..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    }

    Write-Host "[INFO] Starting development server..." -ForegroundColor Blue
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    npm run dev
}

# Main script execution
Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "                  VIRAL VIDEO CLIPPER - DEPLOY" -ForegroundColor Cyan  
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "[INFO] Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version 2>$null
    Write-Host "[INFO] npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Display deployment options
Write-Host "Choose deployment method:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Firebase Hosting (Recommended for production)" -ForegroundColor White
Write-Host "2. Docker Deployment (Local/Server)" -ForegroundColor White
Write-Host "3. Build Only (Generate dist folder)" -ForegroundColor White
Write-Host "4. Development Server (Local testing)" -ForegroundColor White
Write-Host "5. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" { Deploy-Firebase }
    "2" { Deploy-Docker }
    "3" { Build-Only }
    "4" { Start-DevServer }
    "5" { exit 0 }
    default {
        Write-Host "[ERROR] Invalid choice. Please select 1-5." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Deploy script completed." -ForegroundColor Green
Read-Host "Press Enter to exit" 