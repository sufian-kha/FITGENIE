@echo off
echo ========================================
echo   FitGENIE AI Agent - Frontend Server
echo ========================================
echo.

cd /d %~dp0frontend

:: Check if Node.js is installed
node -v >nul 2>nul
if errorlevel 1 goto NoNode

:: Check if node_modules folder exists
if exist node_modules goto RunServer

echo node_modules not found. Automatically running frontend setup...
echo.
call npm install
if errorlevel 1 goto InstallFailed
echo.
echo Setup complete! Starting server...
echo.

:RunServer
echo Starting React frontend on http://localhost:5173...
echo.
call npm run dev
if errorlevel 1 goto RunFailed
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

:RunFailed
echo.
echo ERROR: Failed to start frontend server.
pause
exit /b 1
