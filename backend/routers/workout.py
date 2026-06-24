"""
FitGENIE - Workout Plan Router
Generates personalized weekly workout plans based on user goal and ML predictions.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict
import random

router = APIRouter()


class WorkoutPlanRequest(BaseModel):
    fitness_goal: Literal["weight_loss", "weight_gain", "muscle_building", "fat_loss", "general_fitness"]
    fitness_level: Optional[str] = "Intermediate"
    workout_category: Optional[str] = "Mixed Training"
    activity_level: Literal["sedentary", "lightly_active", "moderately_active", "very_active", "athlete"]


# Comprehensive exercise database
EXERCISE_DATABASE = {
    "cardio": [
        {"name": "Treadmill Run", "category": "Cardio", "sets": 1, "reps": None, "duration": "30 min", "calories": 300, "equipment": "Treadmill", "muscles": "Full Body"},
        {"name": "Cycling", "category": "Cardio", "sets": 1, "reps": None, "duration": "35 min", "calories": 280, "equipment": "Bike", "muscles": "Legs, Cardio"},
        {"name": "Jump Rope", "category": "Cardio", "sets": 5, "reps": None, "duration": "3 min each", "calories": 200, "equipment": "Jump Rope", "muscles": "Full Body"},
        {"name": "Stair Climber", "category": "Cardio", "sets": 1, "reps": None, "duration": "25 min", "calories": 260, "equipment": "Machine", "muscles": "Legs, Glutes"},
        {"name": "Swimming", "category": "Cardio", "sets": 1, "reps": None, "duration": "40 min", "calories": 350, "equipment": "Pool", "muscles": "Full Body"},
        {"name": "Elliptical", "category": "Cardio", "sets": 1, "reps": None, "duration": "30 min", "calories": 270, "equipment": "Machine", "muscles": "Full Body"},
    ],
    "strength_upper": [
        {"name": "Bench Press", "category": "Strength", "sets": 4, "reps": "8-10", "duration": "20 min", "calories": 120, "equipment": "Barbell", "muscles": "Chest, Triceps, Shoulders"},
        {"name": "Pull-Ups", "category": "Strength", "sets": 4, "reps": "6-10", "duration": "15 min", "calories": 100, "equipment": "Bar", "muscles": "Back, Biceps"},
        {"name": "Overhead Press", "category": "Strength", "sets": 4, "reps": "8-10", "duration": "20 min", "calories": 110, "equipment": "Barbell", "muscles": "Shoulders, Triceps"},
        {"name": "Bent Over Row", "category": "Strength", "sets": 4, "reps": "8-12", "duration": "20 min", "calories": 115, "equipment": "Barbell", "muscles": "Back, Biceps"},
        {"name": "Dumbbell Curls", "category": "Strength", "sets": 3, "reps": "12-15", "duration": "12 min", "calories": 80, "equipment": "Dumbbells", "muscles": "Biceps"},
        {"name": "Tricep Dips", "category": "Strength", "sets": 3, "reps": "10-15", "duration": "12 min", "calories": 85, "equipment": "Bench", "muscles": "Triceps, Chest"},
        {"name": "Incline DB Press", "category": "Strength", "sets": 4, "reps": "10-12", "duration": "18 min", "calories": 110, "equipment": "Dumbbells", "muscles": "Upper Chest"},
        {"name": "Face Pulls", "category": "Strength", "sets": 3, "reps": "15-20", "duration": "10 min", "calories": 70, "equipment": "Cable", "muscles": "Rear Delts, Rotator Cuff"},
    ],
    "strength_lower": [
        {"name": "Back Squat", "category": "Strength", "sets": 5, "reps": "5-8", "duration": "25 min", "calories": 180, "equipment": "Barbell", "muscles": "Quads, Glutes, Hamstrings"},
        {"name": "Romanian Deadlift", "category": "Strength", "sets": 4, "reps": "8-10", "duration": "20 min", "calories": 160, "equipment": "Barbell", "muscles": "Hamstrings, Glutes"},
        {"name": "Leg Press", "category": "Strength", "sets": 4, "reps": "10-15", "duration": "18 min", "calories": 150, "equipment": "Machine", "muscles": "Quads, Glutes"},
        {"name": "Lunges", "category": "Strength", "sets": 3, "reps": "12 each leg", "duration": "15 min", "calories": 120, "equipment": "Bodyweight/Dumbbells", "muscles": "Quads, Glutes"},
        {"name": "Calf Raises", "category": "Strength", "sets": 4, "reps": "15-20", "duration": "10 min", "calories": 70, "equipment": "Machine/Bodyweight", "muscles": "Calves"},
        {"name": "Hip Thrust", "category": "Strength", "sets": 4, "reps": "10-12", "duration": "15 min", "calories": 130, "equipment": "Barbell/Bench", "muscles": "Glutes, Hamstrings"},
    ],
    "hiit": [
        {"name": "Burpees", "category": "HIIT", "sets": 5, "reps": "10", "duration": "20 min", "calories": 250, "equipment": "None", "muscles": "Full Body"},
        {"name": "Box Jumps", "category": "HIIT", "sets": 4, "reps": "10", "duration": "15 min", "calories": 180, "equipment": "Box", "muscles": "Legs, Core"},
        {"name": "Mountain Climbers", "category": "HIIT", "sets": 4, "reps": "30 sec", "duration": "15 min", "calories": 160, "equipment": "None", "muscles": "Core, Shoulders"},
        {"name": "Kettlebell Swings", "category": "HIIT", "sets": 5, "reps": "20", "duration": "20 min", "calories": 220, "equipment": "Kettlebell", "muscles": "Glutes, Back, Core"},
        {"name": "Sprint Intervals", "category": "HIIT", "sets": 8, "reps": None, "duration": "30s on/30s off", "calories": 300, "equipment": "None", "muscles": "Full Body, Cardio"},
        {"name": "Jump Squats", "category": "HIIT", "sets": 4, "reps": "15", "duration": "12 min", "calories": 150, "equipment": "None", "muscles": "Legs, Glutes"},
    ],
    "core": [
        {"name": "Plank", "category": "Core", "sets": 3, "reps": None, "duration": "60 sec each", "calories": 60, "equipment": "None", "muscles": "Core, Shoulders"},
        {"name": "Crunches", "category": "Core", "sets": 3, "reps": "20", "duration": "10 min", "calories": 50, "equipment": "None", "muscles": "Abs"},
        {"name": "Leg Raises", "category": "Core", "sets": 3, "reps": "15", "duration": "10 min", "calories": 55, "equipment": "None", "muscles": "Lower Abs"},
        {"name": "Russian Twists", "category": "Core", "sets": 3, "reps": "20 each side", "duration": "10 min", "calories": 60, "equipment": "None/Weight", "muscles": "Obliques"},
        {"name": "Dead Bug", "category": "Core", "sets": 3, "reps": "10 each side", "duration": "12 min", "calories": 50, "equipment": "None", "muscles": "Deep Core"},
    ],
    "flexibility": [
        {"name": "Yoga Flow", "category": "Flexibility", "sets": 1, "reps": None, "duration": "30 min", "calories": 120, "equipment": "Yoga Mat", "muscles": "Full Body"},
        {"name": "Hip Flexor Stretch", "category": "Flexibility", "sets": 2, "reps": None, "duration": "2 min each", "calories": 20, "equipment": "None", "muscles": "Hip Flexors"},
        {"name": "Hamstring Stretch", "category": "Flexibility", "sets": 2, "reps": None, "duration": "2 min each", "calories": 15, "equipment": "None", "muscles": "Hamstrings"},
        {"name": "Thoracic Rotation", "category": "Flexibility", "sets": 2, "reps": "10 each", "duration": "8 min", "calories": 20, "equipment": "None", "muscles": "Thoracic Spine"},
    ]
}


def generate_workout_plan(fitness_goal: str, fitness_level: str,
                          workout_category: str, activity_level: str) -> dict:
    """Generate a personalized 7-day workout plan."""
    
    # Determine training days based on activity level and goal
    training_days_map = {
        "sedentary": 3,
        "lightly_active": 4,
        "moderately_active": 5,
        "very_active": 5,
        "athlete": 6
    }
    training_days = training_days_map.get(activity_level, 4)

    # Build weekly schedule
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    # Define workout splits based on goal
    if fitness_goal in ["weight_loss", "fat_loss"]:
        schedule_template = ["cardio+core", "strength_upper", "hiit", "rest", "strength_lower+core", "cardio", "rest"]
    elif fitness_goal == "muscle_building":
        schedule_template = ["strength_upper", "strength_lower", "rest", "strength_upper", "strength_lower", "core+cardio", "rest"]
    elif fitness_goal == "weight_gain":
        schedule_template = ["strength_upper", "strength_lower", "core", "rest", "strength_upper", "strength_lower", "rest"]
    else:  # general fitness
        schedule_template = ["strength_upper", "cardio", "strength_lower", "hiit", "flexibility", "cardio+core", "rest"]

    weekly_plan = []
    for i, day in enumerate(days):
        session_type = schedule_template[i]
        
        if session_type == "rest":
            weekly_plan.append({
                "day": day,
                "type": "Rest / Active Recovery",
                "exercises": [],
                "total_duration": "0 min",
                "total_calories": 0,
                "focus": "Rest and Recovery",
                "is_rest": True
            })
            continue

        # Pick exercises based on session type
        exercises = []
        types = session_type.split("+")
        total_calories = 0

        for t in types:
            pool = EXERCISE_DATABASE.get(t, [])
            if pool:
                # Select 3-5 exercises depending on level
                count = 3 if fitness_level == "Beginner" else (4 if fitness_level == "Intermediate" else 5)
                selected = random.sample(pool, min(count, len(pool)))
                
                # Adjust for fitness level
                for ex in selected:
                    ex_copy = dict(ex)
                    if fitness_level == "Beginner":
                        ex_copy["sets"] = max(1, ex_copy["sets"] - 1) if ex_copy["sets"] else ex_copy["sets"]
                    elif fitness_level == "Advanced":
                        ex_copy["sets"] = ex_copy["sets"] + 1 if ex_copy["sets"] else ex_copy["sets"]
                    exercises.append(ex_copy)
                    total_calories += ex_copy.get("calories", 0)

        total_duration = sum(
            int(''.join(filter(str.isdigit, e.get("duration", "15 min").split()[0]))) 
            for e in exercises if e.get("duration")
        )

        focus_map = {
            "cardio": "Cardiovascular Endurance",
            "strength_upper": "Upper Body Strength",
            "strength_lower": "Lower Body Strength",
            "hiit": "High Intensity Fat Burn",
            "core": "Core Stability",
            "flexibility": "Mobility & Recovery"
        }
        focus = " + ".join([focus_map.get(t, t.title()) for t in types])

        weekly_plan.append({
            "day": day,
            "type": " + ".join([t.replace("_", " ").title() for t in types]),
            "exercises": exercises,
            "total_duration": f"{total_duration} min",
            "total_calories": total_calories,
            "focus": focus,
            "is_rest": False
        })

    total_weekly_calories = sum(d["total_calories"] for d in weekly_plan)

    return {
        "fitness_goal": fitness_goal,
        "fitness_level": fitness_level,
        "training_days_per_week": training_days,
        "weekly_plan": weekly_plan,
        "total_weekly_calories_burned": total_weekly_calories,
        "notes": [
            "Always warm up for 5-10 minutes before each session",
            "Cool down and stretch for 5-10 minutes after workouts",
            "Rest at least 48 hours between training the same muscle group",
            "Stay hydrated — drink water before, during, and after workouts",
            f"Adjust weights/intensity based on your {fitness_level.lower()} fitness level"
        ]
    }


@router.post("/plan")
async def get_workout_plan(request: WorkoutPlanRequest):
    """Generate a personalized weekly workout plan."""
    try:
        plan = generate_workout_plan(
            fitness_goal=request.fitness_goal,
            fitness_level=request.fitness_level or "Intermediate",
            workout_category=request.workout_category or "Mixed Training",
            activity_level=request.activity_level
        )
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workout plan error: {str(e)}")
