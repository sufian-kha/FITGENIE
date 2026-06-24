"""
FitGENIE - Gemini AI Service
Wraps Google's Gemini API for fitness coaching responses.
Provides structured analysis, chat, and recommendation generation.
"""

import os
import json
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# System prompt that defines FitGENIE's AI persona
FITGENIE_SYSTEM_PROMPT = """You are FitGENIE, an elite AI fitness coach with expertise in:
- Exercise science and sports medicine
- Clinical nutrition and dietetics  
- Behavioral psychology for fitness motivation
- Injury prevention and rehabilitation
- Body composition and physiology

Your communication style:
- Professional yet encouraging and motivational
- Evidence-based recommendations
- Personalized to each user's specific metrics
- Clear, actionable advice
- Use emojis sparingly for emphasis

Always base your advice on the user's specific BMI, BMR, age, goals, and activity level.
Never recommend extreme diets or dangerous exercises.
Encourage gradual, sustainable progress.
"""

_gemini_client = None


def _get_client():
    """Lazy initialize Gemini client."""
    global _gemini_client
    if _gemini_client is None and GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            _gemini_client = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=FITGENIE_SYSTEM_PROMPT
            )
        except Exception as e:
            print(f"Warning: Gemini client init failed: {e}")
            _gemini_client = None
    return _gemini_client


def generate_fitness_analysis(user_data: dict) -> dict:
    """
    Generate comprehensive AI fitness analysis using Gemini.
    
    Args:
        user_data: Dict containing profile, bmi, bmr, calories, ml_predictions
    
    Returns:
        Structured analysis with sections for health, workout, diet, advice
    """
    client = _get_client()

    prompt = f"""
Analyze this user's fitness profile and provide a comprehensive health assessment.

USER PROFILE:
- Age: {user_data.get('age')} years
- Gender: {user_data.get('gender')}
- Height: {user_data.get('height')} cm
- Weight: {user_data.get('weight')} kg
- Activity Level: {user_data.get('activity_level')}
- Fitness Goal: {user_data.get('fitness_goal')}
- Diet Preference: {user_data.get('diet_preference')}

CALCULATED METRICS:
- BMI: {user_data.get('bmi')} ({user_data.get('bmi_category')})
- BMR: {user_data.get('bmr')} kcal/day
- TDEE: {user_data.get('tdee')} kcal/day
- Target Calories: {user_data.get('target_calories')} kcal/day
- Fitness Score: {user_data.get('fitness_score')}/100

ML MODEL PREDICTIONS:
- Recommended Workout Type: {user_data.get('ml_workout')}
- Recommended Diet Type: {user_data.get('ml_diet')}
- Current Fitness Level: {user_data.get('ml_fitness_level')}

Please provide a structured analysis in JSON format with these exact keys:
{{
  "health_analysis": "2-3 paragraph assessment of their current health status",
  "key_strengths": ["strength1", "strength2", "strength3"],
  "areas_for_improvement": ["area1", "area2", "area3"],
  "workout_recommendation": "Detailed workout strategy paragraph",
  "diet_recommendation": "Detailed nutrition strategy paragraph",
  "daily_habits": ["habit1", "habit2", "habit3", "habit4", "habit5"],
  "motivation_message": "Personal motivational message for this user",
  "weekly_focus": "One specific thing to focus on this week",
  "expected_results": "What results they can expect in 4-8 weeks with consistency"
}}

Return ONLY valid JSON, no markdown code blocks.
"""

    if client:
        try:
            response = client.generate_content(prompt)
            text = response.text.strip()
            # Clean potential markdown code blocks
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except json.JSONDecodeError:
            # Return text response as health_analysis if JSON parsing fails
            return {
                "health_analysis": response.text,
                "key_strengths": ["Consistency", "Goal clarity", "Seeking guidance"],
                "areas_for_improvement": ["Increase activity", "Optimize nutrition", "Track progress"],
                "workout_recommendation": "Follow your ML-recommended workout plan consistently.",
                "diet_recommendation": "Focus on whole foods and hit your daily protein target.",
                "daily_habits": ["Stay hydrated", "Sleep 7-8 hours", "Track meals", "Warm up before workouts", "Rest 1-2 days/week"],
                "motivation_message": "Every workout brings you closer to your goal. Stay consistent!",
                "weekly_focus": "Nail your nutrition targets this week.",
                "expected_results": "With 4-6 weeks of consistency, expect visible progress toward your goal."
            }
        except Exception as e:
            print(f"Gemini API error: {e}")

    # Fallback response when no API key
    return _generate_fallback_analysis(user_data)


def chat_with_fitgenie(message: str, conversation_history: list, user_context: dict = None) -> str:
    """
    Chat with FitGENIE AI assistant.
    
    Args:
        message: User's message
        conversation_history: List of {role, content} dicts
        user_context: Optional user profile for personalization
    
    Returns:
        AI response as string
    """
    client = _get_client()

    context_str = ""
    if user_context:
        context_str = f"""
User context: Age {user_context.get('age')}, {user_context.get('gender')}, 
BMI {user_context.get('bmi')}, Goal: {user_context.get('fitness_goal')}, 
Activity: {user_context.get('activity_level')}.
"""

    if client:
        try:
            chat_session = client.start_chat(history=[])
            
            # Add conversation history
            history_text = ""
            for msg in conversation_history[-6:]:  # Keep last 6 messages for context
                role = "User" if msg["role"] == "user" else "FitGENIE"
                history_text += f"{role}: {msg['content']}\n"
            
            full_prompt = f"{context_str}\nConversation so far:\n{history_text}\nUser: {message}\n\nRespond as FitGENIE:"
            response = chat_session.send_message(full_prompt)
            return response.text
        except Exception as e:
            print(f"Chat API error: {e}")

    return _generate_fallback_chat(message)


def _generate_fallback_analysis(user_data: dict) -> dict:
    """Generates a contextual fallback when Gemini API is unavailable."""
    bmi = user_data.get('bmi', 22)
    goal = user_data.get('fitness_goal', 'general_fitness')
    activity = user_data.get('activity_level', 'moderately_active')
    fitness_score = user_data.get('fitness_score', 60)

    bmi_comment = "Your BMI is in a healthy range." if 18.5 <= bmi <= 24.9 else \
                  "Your BMI indicates you have room to optimize your body composition."
    
    goal_advice = {
        "weight_loss": "Focus on creating a sustainable caloric deficit through diet and cardio.",
        "weight_gain": "Prioritize compound lifts and ensure caloric surplus with quality foods.",
        "muscle_building": "Progressive overload in strength training combined with high protein intake.",
        "fat_loss": "Combine HIIT cardio with strength training and clean eating.",
        "general_fitness": "Balance cardio, strength, and flexibility for overall wellness."
    }.get(goal, "Focus on building consistent healthy habits.")

    return {
        "health_analysis": f"{bmi_comment} Your fitness score of {fitness_score}/100 reflects your current profile. "
                          f"{goal_advice} Consistency and patience are key to achieving lasting results.",
        "key_strengths": ["Taking action on your health", "Clear fitness goal", "Using AI-powered guidance"],
        "areas_for_improvement": ["Increase daily activity", "Optimize sleep quality", "Monitor nutrition"],
        "workout_recommendation": f"Based on your goal of {goal.replace('_', ' ')}, focus on your ML-recommended training type. Start with 3-4 sessions per week and progressively increase intensity.",
        "diet_recommendation": "Prioritize whole foods, lean proteins, and complex carbohydrates. Track your macros and stay within your target calorie range.",
        "daily_habits": ["Drink 2-3L of water daily", "Sleep 7-9 hours per night", "Walk 8,000+ steps", "Prep meals in advance", "Track your progress weekly"],
        "motivation_message": "🔥 You've taken the first step by analyzing your fitness. Now let's build momentum — one day, one workout, one meal at a time!",
        "weekly_focus": f"This week, commit to hitting your target of {user_data.get('target_calories', 2000)} calories daily and completing at least 3 workouts.",
        "expected_results": "With 4-8 weeks of consistent effort following your personalized plan, you can expect meaningful progress toward your goal."
    }


def _generate_fallback_chat(message: str) -> str:
    """Simple keyword-based fallback for chat when Gemini is unavailable."""
    message_lower = message.lower()
    
    responses = {
        "protein": "For muscle building, aim for 1.6-2.2g of protein per kg of bodyweight. Great sources include chicken breast, eggs, Greek yogurt, and legumes.",
        "weight loss": "Sustainable weight loss comes from a moderate caloric deficit (300-500 calories below TDEE) combined with strength training to preserve muscle.",
        "chest": "For chest development: Bench Press (4x8), Incline DB Press (3x10), Cable Flyes (3x12), Push-ups (3x failure). Rest 60-90 seconds between sets.",
        "squat": "Perfect squat form: feet shoulder-width apart, toes slightly out, chest tall, knees tracking over toes, break parallel at the bottom.",
        "sleep": "Aim for 7-9 hours of quality sleep. Sleep is when muscle repair and growth hormone release peaks.",
        "water": "Drink at least 35ml per kg of bodyweight daily. More if you're exercising intensely.",
        "eat": "Focus on whole foods: lean proteins, complex carbs, healthy fats, and plenty of vegetables. Avoid ultra-processed foods.",
    }
    
    for keyword, response in responses.items():
        if keyword in message_lower:
            return f"💡 {response}\n\n*Note: Set your Gemini API key for personalized AI responses!*"
    
    return "I'm your FitGENIE AI coach! I can help with workout advice, nutrition guidance, and fitness planning. Please set your Gemini API key in the backend `.env` file for fully personalized AI responses. What fitness question can I help with?"
