@echo off
echo ========================================
echo    FitGENIE AI Agent - Backend Server
echo ========================================
echo.
echo Starting FastAPI backend on http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.

cd /d %~dp0backend
call venv\Scripts\activate.bat
uvicorn main:app --reload --host 0.0.0.0 --port 8000
