@echo off
REM Docker deployment script for Questioner App (Windows)
REM This script builds and runs the application in Docker containers

echo =========================================
echo   Questioner App - Docker Deployment
echo =========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed
    echo Please install Docker Desktop from: https://docs.docker.com/desktop/windows/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not installed
    echo Please install Docker Compose from: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo Docker version:
docker --version
echo.

echo Docker Compose version:
docker-compose --version
echo.

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Stop any existing containers
echo Stopping existing containers...
docker-compose down --remove-orphans

REM Build and start the application
echo Building and starting the application...
docker-compose up --build -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start containers
    pause
    exit /b 1
)

REM Wait for the application to be ready
echo Waiting for application to start...
timeout /t 10 /nobreak >nul

REM Check if the application is running
docker-compose ps | findstr "questioner-app" | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo.
    echo =========================================
    echo   Application started successfully!
    echo =========================================
    echo.
    echo Access the application at:
    echo   http://localhost:3000
    echo.
    echo To view logs:
    echo   docker-compose logs -f questioner-app
    echo.
    echo To stop the application:
    echo   docker-compose down
    echo.
) else (
    echo ERROR: Application failed to start
    echo Check logs with: docker-compose logs questioner-app
    pause
    exit /b 1
)

pause
