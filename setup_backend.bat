@echo off
echo ========================================
echo    FitGENIE AI Agent - Backend Setup
echo ========================================
echo.

cd /d %~dp0backend

echo [1/4] Creating Python virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.10+
    pause
    exit /b 1
)

echo [2/4] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/4] Installing dependencies (this may take a few minutes)...
pip install -r requirements.txt

echo [4/4] Training ML models...
python -m ml.trainer

echo.
echo ========================================
echo  Backend setup complete!
echo  
echo  NEXT STEPS:
echo  1. Edit backend\.env and add your Gemini API key
echo  2. Run start_backend.bat to start the server
echo ========================================
pause
