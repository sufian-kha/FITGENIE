"""
FitGENIE - Chat Router
Handles conversational AI fitness coaching via Gemini.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

router = APIRouter()


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    user_context: Optional[Dict] = None


@router.post("/message")
async def chat_message(request: ChatRequest):
    """
    Send a message to FitGENIE AI chat.
    Uses the trained local NLP service for quick, offline replies.
    """
    try:
        from services.local_chat_service import match_local_coach_response
        
        result = match_local_coach_response(
            message=request.message,
            user_context=request.user_context
        )
        
        return {
            "response": result["response"],
            "role": "assistant",
            "suggested_questions": result.get("suggested_questions", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

