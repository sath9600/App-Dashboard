@echo off
echo ========================================
echo  Installing Questioner App as Windows Service
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install node-windows globally if not already installed
echo Installing node-windows service manager...
npm install -g node-windows
if %errorlevel% neq 0 (
    echo ERROR: Failed to install node-windows
    pause
    exit /b 1
)

REM Create service installation script
echo Creating service installation script...
(
echo var Service = require('node-windows'^).Service;
echo.
echo // Create a new service object
echo var svc = new Service^({
echo   name: 'Questioner App',
echo   description: 'Questioner - Security Questions Database Application',
echo   script: require('path'^).join(__dirname, 'backend', 'server.js'^),
echo   nodeOptions: [
echo     '--harmony',
echo     '--max_old_space_size=4096'
echo   ],
echo   env: [
echo     {
echo       name: "PORT",
echo       value: "3000"
echo     },
echo     {
echo       name: "NODE_ENV",
echo       value: "production"
echo     }
echo   ]
echo }^);
echo.
echo // Listen for the "install" event, which indicates the
echo // process is available as a service.
echo svc.on('install', function^(^){
echo   console.log('Service installed successfully!'^);
echo   console.log('Starting service...'^);
echo   svc.start^(^);
echo }^);
echo.
echo svc.on('start', function^(^){
echo   console.log('Service started successfully!'^);
echo   console.log('Questioner App is now running as a Windows service.'^);
echo   console.log('Access the application at: http://localhost:3000'^);
echo }^);
echo.
echo svc.on('error', function^(err^){
echo   console.error('Service error:', err^);
echo }^);
echo.
echo svc.install^(^);
) > install-service.js

echo Installing service...
node install-service.js

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  Service installed successfully!
    echo ========================================
    echo.
    echo The Questioner App is now running as a Windows service.
    echo.
    echo Service Name: Questioner App
    echo Access URL: http://localhost:3000
    echo.
    echo To manage the service:
    echo - Open Services.msc
    echo - Look for "Questioner App"
    echo - Right-click to Start/Stop/Restart
    echo.
    echo To uninstall the service, run: uninstall-windows-service.bat
) else (
    echo ERROR: Failed to install service
)

echo.
pause

REM Clean up temporary file
if exist install-service.js del install-service.js
