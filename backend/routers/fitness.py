"""
FitGENIE - Fitness Analysis Router
Handles BMI, BMR, TDEE, and Fitness Score calculations.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Literal

router = APIRouter()


class UserProfile(BaseModel):
    """User input profile for fitness analysis."""
    age: int = Field(..., ge=10, le=100, description="Age in years")
    gender: Literal["male", "female"] = Field(..., description="Biological gender")
    height: float = Field(..., ge=100, le=250, description="Height in centimeters")
    weight: float = Field(..., ge=30, le=300, description="Weight in kilograms")
    activity_level: Literal["sedentary", "lightly_active", "moderately_active", "very_active", "athlete"]
    fitness_goal: Literal["weight_loss", "weight_gain", "muscle_building", "fat_loss", "general_fitness"]
    diet_preference: Literal["vegetarian", "vegan", "non_vegetarian"]


# Activity level multipliers for TDEE calculation (Harris-Benedict / Mifflin-St Jeor)
ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "lightly_active": 1.375,
    "moderately_active": 1.55,
    "very_active": 1.725,
    "athlete": 1.9
}

# BMI category thresholds
BMI_CATEGORIES = [
    (0, 18.5, "Underweight", "⚠️ Below healthy range", "#f59e0b"),
    (18.5, 25.0, "Normal Weight", "✅ Healthy range", "#10b981"),
    (25.0, 30.0, "Overweight", "⚠️ Above healthy range", "#f97316"),
    (30.0, float("inf"), "Obese", "🚨 High health risk", "#ef4444"),
]


def calculate_bmi(weight: float, height: float) -> dict:
    """Calculate BMI and return category info."""
    height_m = height / 100
    bmi = weight / (height_m ** 2)
    bmi = round(bmi, 2)

    category = "Unknown"
    status = ""
    color = "#ffffff"

    for low, high, cat, stat, col in BMI_CATEGORIES:
        if low <= bmi < high:
            category = cat
            status = stat
            color = col
            break

    # BMI percentile (0–100 scale for gauge display)
    bmi_gauge = min(max((bmi / 40) * 100, 0), 100)

    return {
        "bmi": bmi,
        "category": category,
        "status": status,
        "color": color,
        "gauge_value": round(bmi_gauge, 1),
        "healthy_range": "18.5 - 24.9"
    }


def calculate_bmr(age: int, gender: str, height: float, weight: float) -> dict:
    """
    Calculate Basal Metabolic Rate using Mifflin-St Jeor formula.
    Male:   BMR = 10*weight + 6.25*height - 5*age + 5
    Female: BMR = 10*weight + 6.25*height - 5*age - 161
    """
    if gender == "male":
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
    else:
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161

    return {"bmr": round(bmr, 0)}


def calculate_tdee(bmr: float, activity_level: str) -> float:
    """Calculate Total Daily Energy Expenditure."""
    multiplier = ACTIVITY_MULTIPLIERS.get(activity_level, 1.2)
    return round(bmr * multiplier, 0)


def calculate_fitness_score(bmi: float, activity_level: str, fitness_goal: str, age: int) -> dict:
    """
    Generate a composite fitness score (0–100) based on:
    - BMI proximity to ideal range (0–40 pts)
    - Activity level (0–30 pts)
    - Age-adjusted factor (0–15 pts)
    - Goal alignment bonus (0–15 pts)
    """
    # BMI score: highest at BMI 22, drops off on either side
    ideal_bmi = 22.0
    bmi_diff = abs(bmi - ideal_bmi)
    bmi_score = max(0, 40 - (bmi_diff * 5))

    # Activity score
    activity_scores = {
        "sedentary": 5,
        "lightly_active": 15,
        "moderately_active": 22,
        "very_active": 28,
        "athlete": 30
    }
    activity_score = activity_scores.get(activity_level, 10)

    # Age-adjusted score (younger gets slight bonus, middle age peak)
    if 18 <= age <= 35:
        age_score = 15
    elif 36 <= age <= 50:
        age_score = 12
    elif 51 <= age <= 65:
        age_score = 8
    else:
        age_score = 5

    # Goal alignment bonus
    goal_bonus = 15

    total_score = min(100, round(bmi_score + activity_score + age_score + goal_bonus))

    # Health rating
    if total_score >= 80:
        rating = "Excellent"
        rating_color = "#10b981"
    elif total_score >= 60:
        rating = "Good"
        rating_color = "#3b82f6"
    elif total_score >= 40:
        rating = "Fair"
        rating_color = "#f59e0b"
    else:
        rating = "Needs Work"
        rating_color = "#ef4444"

    return {
        "score": total_score,
        "rating": rating,
        "rating_color": rating_color,
        "breakdown": {
            "bmi_score": round(bmi_score),
            "activity_score": activity_score,
            "age_score": age_score,
            "goal_bonus": goal_bonus
        }
    }


@router.post("/analyze")
async def analyze_fitness(profile: UserProfile):
    """
    Main fitness analysis endpoint.
    Returns BMI, BMR, TDEE, calorie targets, and fitness score.
    """
    # Calculate core metrics
    bmi_data = calculate_bmi(profile.weight, profile.height)
    bmr_data = calculate_bmr(profile.age, profile.gender, profile.height, profile.weight)
    tdee = calculate_tdee(bmr_data["bmr"], profile.activity_level)

    # Adjust calories based on goal
    calorie_adjustments = {
        "weight_loss": -500,
        "fat_loss": -400,
        "weight_gain": +500,
        "muscle_building": +300,
        "general_fitness": 0
    }
    calorie_adjustment = calorie_adjustments.get(profile.fitness_goal, 0)
    target_calories = round(tdee + calorie_adjustment)

    # Calculate macronutrient targets (grams)
    if profile.fitness_goal in ["muscle_building", "weight_gain"]:
        protein_ratio, carb_ratio, fat_ratio = 0.35, 0.45, 0.20
    elif profile.fitness_goal in ["weight_loss", "fat_loss"]:
        protein_ratio, carb_ratio, fat_ratio = 0.40, 0.35, 0.25
    else:
        protein_ratio, carb_ratio, fat_ratio = 0.30, 0.45, 0.25

    protein_g = round((target_calories * protein_ratio) / 4)
    carbs_g = round((target_calories * carb_ratio) / 4)
    fats_g = round((target_calories * fat_ratio) / 9)

    fitness_score_data = calculate_fitness_score(
        bmi_data["bmi"], profile.activity_level, profile.fitness_goal, profile.age
    )

    return {
        "profile": {
            "age": profile.age,
            "gender": profile.gender,
            "height": profile.height,
            "weight": profile.weight,
            "activity_level": profile.activity_level,
            "fitness_goal": profile.fitness_goal,
            "diet_preference": profile.diet_preference
        },
        "bmi": bmi_data,
        "bmr": {
            "bmr": bmr_data["bmr"],
            "tdee": tdee,
            "activity_multiplier": ACTIVITY_MULTIPLIERS[profile.activity_level]
        },
        "calories": {
            "maintenance": tdee,
            "target": target_calories,
            "adjustment": calorie_adjustment,
            "protein_g": protein_g,
            "carbs_g": carbs_g,
            "fats_g": fats_g
        },
        "fitness_score": fitness_score_data
    }
