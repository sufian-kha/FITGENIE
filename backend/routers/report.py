"""
FitGENIE - PDF Report Router
Generates and serves downloadable PDF fitness reports.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional, Dict, Any
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

router = APIRouter()


class ReportRequest(BaseModel):
    """Full data needed to generate PDF report."""
    profile: Dict[str, Any]
    bmi: Dict[str, Any]
    bmr: Dict[str, Any]
    calories: Dict[str, Any]
    fitness_score: Dict[str, Any]
    ai_analysis: Optional[Dict[str, Any]] = None
    workout_plan: Optional[Dict[str, Any]] = None
    diet_plan: Optional[Dict[str, Any]] = None
    ml_predictions: Optional[Dict[str, Any]] = None


@router.post("/generate")
async def generate_report(request: ReportRequest):
    """
    Generate a downloadable PDF fitness report.
    Returns the PDF file as a binary response.
    """
    try:
        from services.pdf_service import generate_fitness_pdf
        
        report_data = {
            "profile": request.profile,
            "bmi": request.bmi,
            "bmr": request.bmr,
            "calories": request.calories,
            "fitness_score": request.fitness_score,
            "ai_analysis": request.ai_analysis,
            "workout_plan": request.workout_plan,
            "diet_plan": request.diet_plan,
            "ml_predictions": request.ml_predictions
        }
        
        pdf_bytes = generate_fitness_pdf(report_data)
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": 'attachment; filename="FitGENIE_Fitness_Report.pdf"',
                "Content-Length": str(len(pdf_bytes))
            }
        )
    except ImportError as e:
        raise HTTPException(
            status_code=503,
            detail=f"PDF service unavailable: {str(e)}. Install: pip install reportlab"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")
