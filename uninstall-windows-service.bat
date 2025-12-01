@echo off
echo ========================================
echo  Uninstalling Questioner App Windows Service
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

REM Create service uninstallation script
echo Creating service uninstallation script...
(
echo var Service = require('node-windows'^).Service;
echo.
echo // Create a new service object
echo var svc = new Service^({
echo   name: 'Questioner App',
echo   script: require('path'^).join(__dirname, 'backend', 'server.js'^)
echo }^);
echo.
echo // Listen for the "uninstall" event so we know when it's done.
echo svc.on('uninstall', function^(^){
echo   console.log('Service uninstalled successfully!'^);
echo   console.log('Questioner App service has been removed.'^);
echo }^);
echo.
echo svc.on('error', function^(err^){
echo   console.error('Service error:', err^);
echo }^);
echo.
echo // Uninstall the service.
echo svc.uninstall^(^);
) > uninstall-service.js

echo Uninstalling service...
node uninstall-service.js

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  Service uninstalled successfully!
    echo ========================================
    echo.
    echo The Questioner App service has been removed from Windows services.
) else (
    echo ERROR: Failed to uninstall service
)

echo.
pause

REM Clean up temporary file
if exist uninstall-service.js del uninstall-service.js
