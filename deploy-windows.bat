@echo off
echo ========================================
echo  Questioner App - Windows Deployment
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo npm version:
npm --version
echo.

REM Navigate to backend directory and install dependencies
echo Installing backend dependencies...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Rebuilding SQLite3 for Windows...
npm rebuild sqlite3
if %errorlevel% neq 0 (
    echo WARNING: SQLite3 rebuild failed, trying alternative installation...
    npm uninstall sqlite3
    npm install sqlite3 --build-from-source
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install SQLite3
        echo Please ensure you have Visual Studio Build Tools installed
        echo Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
        pause
        exit /b 1
    )
)

echo.
echo Dependencies installed successfully!
echo.

REM Initialize database if it doesn't exist
if not exist "..\database\questioner.db" (
    echo Initializing database...
    npm run init-db
    if %errorlevel% neq 0 (
        echo ERROR: Failed to initialize database
        pause
        exit /b 1
    )
    echo Database initialized successfully!
) else (
    echo Database already exists, skipping initialization.
)

echo.
echo ========================================
echo  Deployment completed successfully!
echo ========================================
echo.
echo To start the application:
echo   1. Run: start-server.bat
echo   2. Open browser to: http://localhost:3000
echo.
pause
