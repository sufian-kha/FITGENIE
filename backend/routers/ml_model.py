"""
FitGENIE - ML Model Router
Exposes ML prediction endpoint for workout/diet/fitness level classification.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal
import sys
import os

# Add backend root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

router = APIRouter()


class MLPredictRequest(BaseModel):
    """Request body for ML prediction."""
    bmi: float = Field(..., ge=10, le=60)
    age: int = Field(..., ge=10, le=100)
    gender: Literal["male", "female"]
    activity_level: Literal["sedentary", "lightly_active", "moderately_active", "very_active", "athlete"]
    fitness_goal: Literal["weight_loss", "weight_gain", "muscle_building", "fat_loss", "general_fitness"]


@router.post("/predict")
async def predict_fitness_category(request: MLPredictRequest):
    """
    Run ML ensemble prediction (Random Forest + Decision Tree).
    Returns workout category, diet category, and fitness level.
    """
    try:
        from ml.predictor import predict
        result = predict(
            bmi=request.bmi,
            age=request.age,
            gender=request.gender,
            activity_level=request.activity_level,
            fitness_goal=request.fitness_goal
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"ML prediction error: {str(e)}"
        )


@router.get("/status")
async def model_status():
    """Check if ML models are trained and loaded."""
    from ml.predictor import _models_available
    trained = _models_available()
    return {
        "models_available": trained,
        "status": "ready" if trained else "not_trained",
        "message": "Models ready for inference" if trained else "Run trainer.py to train models"
    }


@router.post("/train")
async def trigger_training():
    """Trigger model training on demand."""
    try:
        from ml.trainer import train_models
        results = train_models()
        return {
            "status": "success",
            "message": "Models trained successfully",
            "metrics": results
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Training failed: {str(e)}"
        )
