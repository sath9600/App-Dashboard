@echo off
echo ========================================
echo  Starting Questioner App Server
echo ========================================
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ERROR: Backend directory not found
    echo Please run deploy-windows.bat first
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "backend\node_modules" (
    echo ERROR: Dependencies not installed
    echo Please run deploy-windows.bat first
    pause
    exit /b 1
)

REM Check if database exists
if not exist "database\questioner.db" (
    echo ERROR: Database not found
    echo Please run deploy-windows.bat first
    pause
    exit /b 1
)

echo Starting server...
echo Server will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

cd backend
npm start
