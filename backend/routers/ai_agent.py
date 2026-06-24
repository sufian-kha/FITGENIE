"""
FitGENIE - AI Agent Router
Combines ML predictions with Gemini AI for comprehensive fitness analysis.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal, Optional
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

router = APIRouter()


class AgentAnalysisRequest(BaseModel):
    """Full user profile for AI agent analysis."""
    age: int = Field(..., ge=10, le=100)
    gender: Literal["male", "female"]
    height: float = Field(..., ge=100, le=250)
    weight: float = Field(..., ge=30, le=300)
    activity_level: Literal["sedentary", "lightly_active", "moderately_active", "very_active", "athlete"]
    fitness_goal: Literal["weight_loss", "weight_gain", "muscle_building", "fat_loss", "general_fitness"]
    diet_preference: Literal["vegetarian", "vegan", "non_vegetarian"]
    bmi: float
    bmi_category: str
    bmr: float
    tdee: float
    target_calories: float
    fitness_score: int
    ml_workout: Optional[str] = "Mixed Training"
    ml_diet: Optional[str] = "Balanced"
    ml_fitness_level: Optional[str] = "Intermediate"


@router.post("/analyze")
async def ai_agent_analyze(request: AgentAnalysisRequest):
    """
    Main AI Agent endpoint.
    Sends full user profile + ML predictions to Gemini for personalized analysis.
    """
    try:
        from services.gemini_service import generate_fitness_analysis
        
        user_data = {
            "age": request.age,
            "gender": request.gender,
            "height": request.height,
            "weight": request.weight,
            "activity_level": request.activity_level,
            "fitness_goal": request.fitness_goal,
            "diet_preference": request.diet_preference,
            "bmi": request.bmi,
            "bmi_category": request.bmi_category,
            "bmr": request.bmr,
            "tdee": request.tdee,
            "target_calories": request.target_calories,
            "fitness_score": request.fitness_score,
            "ml_workout": request.ml_workout,
            "ml_diet": request.ml_diet,
            "ml_fitness_level": request.ml_fitness_level
        }
        
        analysis = generate_fitness_analysis(user_data)
        return {
            "status": "success",
            "analysis": analysis,
            "powered_by": "FitGENIE AI Agent (Gemini)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Agent error: {str(e)}")
