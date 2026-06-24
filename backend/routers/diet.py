"""
FitGENIE - Diet Plan Router
Generates personalized meal plans with macronutrient breakdowns.
Adapts to fitness goal, diet preference, and calorie targets.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal, Optional
import random

router = APIRouter()


class DietPlanRequest(BaseModel):
    fitness_goal: Literal["weight_loss", "weight_gain", "muscle_building", "fat_loss", "general_fitness"]
    diet_preference: Literal["vegetarian", "vegan", "non_vegetarian"]
    target_calories: float = Field(..., ge=1000, le=5000)
    protein_g: float
    carbs_g: float
    fats_g: float
    diet_category: Optional[str] = "Balanced"


# Food database organized by diet preference and meal type
FOOD_DATABASE = {
    "non_vegetarian": {
        "breakfast": [
            {"name": "Scrambled Eggs & Toast", "calories": 350, "protein": 24, "carbs": 28, "fats": 14, "prep": "10 min", "ingredients": ["3 eggs", "2 whole wheat toast", "1 tbsp butter"]},
            {"name": "Greek Yogurt Parfait", "calories": 320, "protein": 20, "carbs": 42, "fats": 8, "prep": "5 min", "ingredients": ["200g Greek yogurt", "50g granola", "mixed berries", "1 tsp honey"]},
            {"name": "Chicken & Egg Omelette", "calories": 400, "protein": 38, "carbs": 5, "fats": 26, "prep": "15 min", "ingredients": ["3 eggs", "80g chicken breast", "spinach", "cheese"]},
            {"name": "Protein Pancakes", "calories": 380, "protein": 28, "carbs": 45, "fats": 10, "prep": "15 min", "ingredients": ["1 scoop protein powder", "1 banana", "2 eggs", "oats"]},
            {"name": "Overnight Oats with Whey", "calories": 420, "protein": 32, "carbs": 52, "fats": 8, "prep": "5 min + overnight", "ingredients": ["80g oats", "1 scoop whey", "almond milk", "chia seeds"]},
        ],
        "lunch": [
            {"name": "Grilled Chicken Breast & Rice", "calories": 520, "protein": 45, "carbs": 55, "fats": 10, "prep": "25 min", "ingredients": ["200g chicken breast", "150g brown rice", "steamed broccoli", "olive oil"]},
            {"name": "Tuna Salad Bowl", "calories": 420, "protein": 40, "carbs": 35, "fats": 12, "prep": "10 min", "ingredients": ["1 can tuna", "quinoa", "cucumber", "tomatoes", "olive oil"]},
            {"name": "Turkey Wrap", "calories": 480, "protein": 38, "carbs": 42, "fats": 14, "prep": "10 min", "ingredients": ["150g turkey breast", "whole wheat wrap", "lettuce", "avocado", "mustard"]},
            {"name": "Salmon & Quinoa Bowl", "calories": 560, "protein": 42, "carbs": 48, "fats": 16, "prep": "25 min", "ingredients": ["180g salmon fillet", "150g quinoa", "asparagus", "lemon"]},
        ],
        "dinner": [
            {"name": "Beef Stir-Fry & Veggies", "calories": 580, "protein": 48, "carbs": 40, "fats": 20, "prep": "20 min", "ingredients": ["200g lean beef", "mixed vegetables", "soy sauce", "brown rice"]},
            {"name": "Baked Cod & Sweet Potato", "calories": 460, "protein": 42, "carbs": 45, "fats": 8, "prep": "30 min", "ingredients": ["200g cod fillet", "1 large sweet potato", "green beans", "herbs"]},
            {"name": "Chicken Stew", "calories": 520, "protein": 50, "carbs": 30, "fats": 18, "prep": "35 min", "ingredients": ["200g chicken", "potatoes", "carrots", "celery", "broth"]},
            {"name": "Grilled Shrimp Tacos", "calories": 440, "protein": 36, "carbs": 42, "fats": 12, "prep": "20 min", "ingredients": ["200g shrimp", "corn tortillas", "cabbage slaw", "salsa", "lime"]},
        ],
        "snacks": [
            {"name": "Protein Shake", "calories": 150, "protein": 25, "carbs": 8, "fats": 3, "prep": "2 min", "ingredients": ["1 scoop whey protein", "250ml milk"]},
            {"name": "Hard Boiled Eggs", "calories": 140, "protein": 12, "carbs": 1, "fats": 10, "prep": "10 min", "ingredients": ["2 eggs"]},
            {"name": "Chicken Jerky", "calories": 120, "protein": 20, "carbs": 5, "fats": 2, "prep": "0 min", "ingredients": ["40g chicken jerky"]},
            {"name": "Greek Yogurt", "calories": 130, "protein": 15, "carbs": 10, "fats": 4, "prep": "0 min", "ingredients": ["150g plain Greek yogurt"]},
        ]
    },
    "vegetarian": {
        "breakfast": [
            {"name": "Egg & Veggie Scramble", "calories": 340, "protein": 22, "carbs": 25, "fats": 16, "prep": "12 min", "ingredients": ["3 eggs", "spinach", "bell peppers", "cheese", "2 toast"]},
            {"name": "Greek Yogurt Bowl", "calories": 320, "protein": 18, "carbs": 42, "fats": 8, "prep": "5 min", "ingredients": ["200g Greek yogurt", "mixed nuts", "berries", "honey"]},
            {"name": "Paneer Bhurji Toast", "calories": 380, "protein": 22, "carbs": 30, "fats": 18, "prep": "15 min", "ingredients": ["100g paneer", "onion", "tomato", "spices", "whole wheat toast"]},
            {"name": "Protein Smoothie Bowl", "calories": 400, "protein": 28, "carbs": 52, "fats": 10, "prep": "8 min", "ingredients": ["whey protein", "banana", "berries", "granola", "almond milk"]},
        ],
        "lunch": [
            {"name": "Paneer & Rice Bowl", "calories": 520, "protein": 30, "carbs": 55, "fats": 18, "prep": "25 min", "ingredients": ["150g paneer", "brown rice", "mixed dal", "vegetables"]},
            {"name": "Lentil Soup & Bread", "calories": 420, "protein": 22, "carbs": 58, "fats": 8, "prep": "30 min", "ingredients": ["100g red lentils", "vegetables", "spices", "whole wheat bread"]},
            {"name": "Chickpea Salad", "calories": 400, "protein": 20, "carbs": 50, "fats": 12, "prep": "10 min", "ingredients": ["200g chickpeas", "cucumber", "tomatoes", "feta", "olive oil"]},
            {"name": "Tofu Stir-Fry & Quinoa", "calories": 480, "protein": 28, "carbs": 48, "fats": 16, "prep": "20 min", "ingredients": ["150g firm tofu", "quinoa", "broccoli", "soy sauce"]},
        ],
        "dinner": [
            {"name": "Dal Makhani & Roti", "calories": 500, "protein": 24, "carbs": 62, "fats": 14, "prep": "40 min", "ingredients": ["black lentils", "cream", "butter", "2 whole wheat roti"]},
            {"name": "Vegetable Curry & Rice", "calories": 460, "protein": 16, "carbs": 65, "fats": 14, "prep": "30 min", "ingredients": ["mixed vegetables", "coconut milk", "curry paste", "basmati rice"]},
            {"name": "Mushroom & Egg Fried Rice", "calories": 480, "protein": 20, "carbs": 58, "fats": 16, "prep": "20 min", "ingredients": ["2 eggs", "mushrooms", "brown rice", "soy sauce", "vegetables"]},
        ],
        "snacks": [
            {"name": "Paneer Cubes", "calories": 150, "protein": 12, "carbs": 3, "fats": 10, "prep": "0 min", "ingredients": ["60g paneer"]},
            {"name": "Roasted Chickpeas", "calories": 130, "protein": 7, "carbs": 18, "fats": 4, "prep": "0 min", "ingredients": ["40g roasted chickpeas"]},
            {"name": "Mixed Nuts", "calories": 180, "protein": 5, "carbs": 8, "fats": 16, "prep": "0 min", "ingredients": ["30g mixed nuts"]},
            {"name": "Fruit & Cheese Plate", "calories": 160, "protein": 8, "carbs": 15, "fats": 8, "prep": "3 min", "ingredients": ["apple", "30g cheese"]},
        ]
    },
    "vegan": {
        "breakfast": [
            {"name": "Tofu Scramble", "calories": 320, "protein": 22, "carbs": 25, "fats": 16, "prep": "15 min", "ingredients": ["150g silken tofu", "turmeric", "nutritional yeast", "vegetables"]},
            {"name": "Smoothie Bowl", "calories": 380, "protein": 18, "carbs": 55, "fats": 10, "prep": "8 min", "ingredients": ["plant protein powder", "frozen berries", "banana", "almond milk", "granola"]},
            {"name": "Overnight Oats", "calories": 360, "protein": 14, "carbs": 58, "fats": 8, "prep": "5 min + overnight", "ingredients": ["80g oats", "chia seeds", "almond milk", "berries", "maple syrup"]},
            {"name": "Avocado Toast", "calories": 350, "protein": 10, "carbs": 38, "fats": 18, "prep": "5 min", "ingredients": ["2 slices sourdough", "1 avocado", "cherry tomatoes", "hemp seeds"]},
        ],
        "lunch": [
            {"name": "Tempeh Buddha Bowl", "calories": 520, "protein": 32, "carbs": 52, "fats": 18, "prep": "25 min", "ingredients": ["150g tempeh", "quinoa", "roasted vegetables", "tahini dressing"]},
            {"name": "Lentil & Chickpea Curry", "calories": 480, "protein": 24, "carbs": 65, "fats": 12, "prep": "30 min", "ingredients": ["lentils", "chickpeas", "coconut milk", "spices", "rice"]},
            {"name": "Edamame Grain Bowl", "calories": 450, "protein": 26, "carbs": 55, "fats": 14, "prep": "20 min", "ingredients": ["edamame", "brown rice", "cucumber", "avocado", "soy sauce"]},
        ],
        "dinner": [
            {"name": "Black Bean Tacos", "calories": 440, "protein": 20, "carbs": 58, "fats": 14, "prep": "20 min", "ingredients": ["black beans", "corn tortillas", "salsa", "guacamole", "cabbage"]},
            {"name": "Seitan Stir-Fry", "calories": 480, "protein": 38, "carbs": 42, "fats": 14, "prep": "20 min", "ingredients": ["seitan", "mixed vegetables", "soy sauce", "brown rice"]},
            {"name": "Chickpea Tikka Masala", "calories": 460, "protein": 22, "carbs": 60, "fats": 16, "prep": "35 min", "ingredients": ["chickpeas", "tomato sauce", "coconut cream", "spices", "naan"]},
        ],
        "snacks": [
            {"name": "Hummus & Veggies", "calories": 140, "protein": 6, "carbs": 16, "fats": 6, "prep": "2 min", "ingredients": ["50g hummus", "carrot sticks", "cucumber"]},
            {"name": "Mixed Nuts & Seeds", "calories": 180, "protein": 6, "carbs": 8, "fats": 16, "prep": "0 min", "ingredients": ["30g mixed nuts and seeds"]},
            {"name": "Apple & Almond Butter", "calories": 190, "protein": 5, "carbs": 28, "fats": 10, "prep": "2 min", "ingredients": ["1 medium apple", "2 tbsp almond butter"]},
            {"name": "Protein Smoothie", "calories": 200, "protein": 20, "carbs": 22, "fats": 4, "prep": "3 min", "ingredients": ["1 scoop plant protein", "almond milk", "banana"]},
        ]
    }
}


def generate_diet_plan(fitness_goal: str, diet_preference: str, target_calories: float,
                       protein_g: float, carbs_g: float, fats_g: float) -> dict:
    """Generate a personalized daily meal plan."""
    food_db = FOOD_DATABASE.get(diet_preference, FOOD_DATABASE["non_vegetarian"])

    # Select meals
    breakfast = random.choice(food_db["breakfast"])
    lunch = random.choice(food_db["lunch"])
    dinner = random.choice(food_db["dinner"])
    snack1 = random.choice(food_db["snacks"])
    snack2 = random.choice([s for s in food_db["snacks"] if s["name"] != snack1["name"]])

    meals = {
        "breakfast": {**breakfast, "meal_time": "7:00 - 8:00 AM"},
        "morning_snack": {**snack1, "meal_time": "10:00 - 10:30 AM"},
        "lunch": {**lunch, "meal_time": "1:00 - 2:00 PM"},
        "evening_snack": {**snack2, "meal_time": "4:00 - 4:30 PM"},
        "dinner": {**dinner, "meal_time": "7:00 - 8:00 PM"}
    }

    total_calories = sum(m["calories"] for m in meals.values())
    total_protein = sum(m["protein"] for m in meals.values())
    total_carbs = sum(m["carbs"] for m in meals.values())
    total_fats = sum(m["fats"] for m in meals.values())

    # Hydration recommendation
    water_ml = max(2000, int(target_calories * 0.8))

    # Tips based on goal
    tips = {
        "weight_loss": ["Eat slowly and mindfully", "Don't skip breakfast", "Avoid liquid calories", "Fill half your plate with vegetables"],
        "weight_gain": ["Eat every 3 hours", "Add healthy calorie-dense foods", "Don't skip post-workout nutrition", "Liquid calories count too!"],
        "muscle_building": ["Prioritize post-workout protein", "Eat protein with every meal", "Time carbs around workouts", "Don't fear healthy fats"],
        "fat_loss": ["Track your macros carefully", "Meal prep on Sundays", "Prioritize protein to preserve muscle", "Avoid processed snacks"],
        "general_fitness": ["Eat the rainbow of vegetables", "Stay consistent with meal timing", "Balance all macronutrients", "Hydrate throughout the day"]
    }

    return {
        "diet_preference": diet_preference,
        "fitness_goal": fitness_goal,
        "daily_targets": {
            "calories": target_calories,
            "protein_g": protein_g,
            "carbs_g": carbs_g,
            "fats_g": fats_g,
            "water_ml": water_ml
        },
        "meals": meals,
        "daily_totals": {
            "calories": total_calories,
            "protein_g": total_protein,
            "carbs_g": total_carbs,
            "fats_g": total_fats
        },
        "nutrition_tips": tips.get(fitness_goal, tips["general_fitness"]),
        "supplements": _get_supplement_recommendations(fitness_goal, diet_preference)
    }


def _get_supplement_recommendations(goal: str, diet_pref: str) -> list:
    """Get supplement recommendations based on goal and diet."""
    base = ["Multivitamin", "Vitamin D3", "Omega-3"]
    
    if goal in ["muscle_building", "weight_gain"]:
        base.extend(["Creatine Monohydrate", "Whey Protein"])
    elif goal in ["weight_loss", "fat_loss"]:
        base.extend(["L-Carnitine", "Green Tea Extract"])
    
    if diet_pref in ["vegan", "vegetarian"]:
        base.extend(["Vitamin B12", "Iron", "Zinc"])
    
    return base


@router.post("/plan")
async def get_diet_plan(request: DietPlanRequest):
    """Generate a personalized daily meal plan with macros."""
    try:
        plan = generate_diet_plan(
            fitness_goal=request.fitness_goal,
            diet_preference=request.diet_preference,
            target_calories=request.target_calories,
            protein_g=request.protein_g,
            carbs_g=request.carbs_g,
            fats_g=request.fats_g
        )
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diet plan error: {str(e)}")
