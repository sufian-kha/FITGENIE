"""
FitGENIE AI Agent - FastAPI Backend
Main application entry point with CORS middleware and router mounting.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from routers import fitness, ml_model, ai_agent, chat, workout, diet, posture, report

# Initialize FastAPI application
app = FastAPI(
    title="FitGENIE AI Agent API",
    description="Your Personal AI Fitness, Nutrition & Posture Coach - Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all feature routers
app.include_router(fitness.router, prefix="/api/fitness", tags=["Fitness Analysis"])
app.include_router(ml_model.router, prefix="/api/ml", tags=["ML Predictions"])
app.include_router(ai_agent.router, prefix="/api/agent", tags=["AI Agent"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat"])
app.include_router(workout.router, prefix="/api/workout", tags=["Workout Plans"])
app.include_router(diet.router, prefix="/api/diet", tags=["Diet Plans"])
app.include_router(posture.router, prefix="/api/posture", tags=["Posture & CV"])
app.include_router(report.router, prefix="/api/report", tags=["PDF Reports"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": "FitGENIE AI Agent",
        "version": "1.0.0",
        "message": "Your Personal AI Fitness, Nutrition & Posture Coach"
    }


@app.get("/health")
async def health_check():
    """Detailed health check for monitoring."""
    return JSONResponse(content={"status": "ok", "service": "fitgenie-backend"})


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
