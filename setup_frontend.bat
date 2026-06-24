@echo off
echo ========================================
echo   FitGENIE AI Agent - Frontend Setup
echo ========================================
echo.

cd /d %~dp0frontend

:: Check if Node.js is installed
node -v >nul 2>nul
if errorlevel 1 goto NoNode

echo Installing npm packages...
call npm install
if errorlevel 1 goto InstallFailed

echo.
echo ========================================
echo  Frontend setup complete!
echo  Run start_frontend.bat to start the app
echo ========================================
pause
exit /b 0

:NoNode
echo ERROR: Node.js is not installed or not in your system PATH.
echo Please install Node.js (LTS version recommended) from https://nodejs.org/
echo.
pause
exit /b 1

:InstallFailed
echo.
echo ERROR: npm install failed.
pause
exit /b 1
