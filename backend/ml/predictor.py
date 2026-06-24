"""
FitGENIE - ML Predictor
Loads trained models and provides prediction interface.
Combines Random Forest and Decision Tree for ensemble prediction.
"""

import os
import sys
import numpy as np
import joblib
from typing import Optional

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

# Activity level encoding
ACTIVITY_ENCODING = {
    "sedentary": 0,
    "lightly_active": 1,
    "moderately_active": 2,
    "very_active": 3,
    "athlete": 4
}

# Goal encoding
GOAL_ENCODING = {
    "weight_loss": 0,
    "weight_gain": 1,
    "muscle_building": 2,
    "fat_loss": 3,
    "general_fitness": 4
}

GENDER_ENCODING = {"male": 1, "female": 0}

# Models cache (lazy loading)
_models_cache = {}
_label_maps = None
_is_trained = None


def _models_available() -> bool:
    """Check if trained models exist on disk."""
    global _is_trained
    if _is_trained is None:
        required = ["rf_workout.pkl", "rf_diet.pkl", "rf_fitness_level.pkl", "label_maps.pkl"]
        _is_trained = all(os.path.exists(os.path.join(MODELS_DIR, f)) for f in required)
    return _is_trained


def _load_model(name: str):
    """Lazy-load a model from disk and cache it."""
    if name not in _models_cache:
        path = os.path.join(MODELS_DIR, name)
        if os.path.exists(path):
            _models_cache[name] = joblib.load(path)
        else:
            return None
    return _models_cache[name]


def _get_label_maps():
    """Load label mappings from disk."""
    global _label_maps
    if _label_maps is None:
        path = os.path.join(MODELS_DIR, "label_maps.pkl")
        if os.path.exists(path):
            _label_maps = joblib.load(path)
        else:
            _label_maps = {
                "workout": {0: "Cardio", 1: "Strength Training", 2: "HIIT",
                            3: "Yoga & Flexibility", 4: "Mixed Training"},
                "diet": {0: "Low Calorie", 1: "High Protein", 2: "Balanced",
                         3: "High Carb", 4: "Keto / Low Carb"},
                "fitness_level": {0: "Beginner", 1: "Intermediate", 2: "Advanced"}
            }
    return _label_maps


def encode_features(bmi: float, age: int, gender: str,
                    activity_level: str, fitness_goal: str) -> np.ndarray:
    """Encode user profile features into ML feature vector."""
    gender_enc = GENDER_ENCODING.get(gender.lower(), 0)
    activity_enc = ACTIVITY_ENCODING.get(activity_level.lower(), 2)
    goal_enc = GOAL_ENCODING.get(fitness_goal.lower(), 4)
    return np.array([[bmi, age, gender_enc, activity_enc, goal_enc]], dtype=float)


def predict(bmi: float, age: int, gender: str,
            activity_level: str, fitness_goal: str) -> dict:
    """
    Run ML prediction using Random Forest (primary) and Decision Tree (secondary).
    Returns workout category, diet category, fitness level, and confidence scores.
    """
    features = encode_features(bmi, age, gender, activity_level, fitness_goal)
    label_maps = _get_label_maps()

    if not _models_available():
        # Models not trained yet — train them now
        try:
            from ml.trainer import train_models
            train_models()
            # Reset cache
            global _is_trained
            _is_trained = True
            _models_cache.clear()
        except Exception as e:
            # Return rule-based fallback if training fails
            return _rule_based_fallback(bmi, age, gender, activity_level, fitness_goal)

    predictions = {}
    for target in ["workout", "diet", "fitness_level"]:
        rf_model = _load_model(f"rf_{target}.pkl")
        dt_model = _load_model(f"dt_{target}.pkl")

        if rf_model is None:
            continue

        # Primary: Random Forest prediction + probabilities
        rf_pred = rf_model.predict(features)[0]
        rf_proba = rf_model.predict_proba(features)[0]
        rf_confidence = float(rf_proba[rf_pred]) * 100

        # Secondary: Decision Tree prediction
        dt_pred = dt_model.predict(features)[0] if dt_model else rf_pred

        # Ensemble: weight RF 70%, DT 30%
        rf_proba_weighted = rf_proba * 0.7
        dt_proba = dt_model.predict_proba(features)[0] if dt_model else rf_proba
        ensemble_proba = rf_proba_weighted + dt_proba * 0.3
        ensemble_pred = int(np.argmax(ensemble_proba))
        ensemble_confidence = float(ensemble_proba[ensemble_pred]) * 100

        label = label_maps.get(target, {}).get(ensemble_pred, f"Category {ensemble_pred}")

        predictions[target] = {
            "label": label,
            "code": ensemble_pred,
            "confidence": round(ensemble_confidence, 1),
            "rf_prediction": label_maps.get(target, {}).get(int(rf_pred), "Unknown"),
            "dt_prediction": label_maps.get(target, {}).get(int(dt_pred), "Unknown")
        }

    return {
        "workout_category": predictions.get("workout", {}),
        "diet_category": predictions.get("diet", {}),
        "fitness_level": predictions.get("fitness_level", {}),
        "model_used": "Random Forest + Decision Tree Ensemble",
        "features_used": ["BMI", "Age", "Gender", "Activity Level", "Fitness Goal"]
    }


def _rule_based_fallback(bmi, age, gender, activity_level, fitness_goal) -> dict:
    """
    Fallback rule-based prediction when models are unavailable.
    Uses simplified logic derived from fitness science principles.
    """
    # Workout
    if fitness_goal in ["weight_loss", "fat_loss"]:
        workout = "HIIT" if activity_level in ["very_active", "athlete"] else "Cardio"
    elif fitness_goal in ["muscle_building", "weight_gain"]:
        workout = "Strength Training"
    else:
        workout = "Mixed Training"

    # Diet
    if fitness_goal in ["weight_loss", "fat_loss"]:
        diet = "Low Calorie"
    elif fitness_goal == "muscle_building":
        diet = "High Protein"
    elif fitness_goal == "weight_gain":
        diet = "High Carb"
    else:
        diet = "Balanced"

    # Fitness level
    if activity_level in ["athlete", "very_active"]:
        level = "Advanced"
    elif activity_level in ["moderately_active", "lightly_active"]:
        level = "Intermediate"
    else:
        level = "Beginner"

    return {
        "workout_category": {"label": workout, "code": 0, "confidence": 75.0},
        "diet_category": {"label": diet, "code": 0, "confidence": 75.0},
        "fitness_level": {"label": level, "code": 0, "confidence": 75.0},
        "model_used": "Rule-based fallback",
        "features_used": ["BMI", "Age", "Gender", "Activity Level", "Fitness Goal"]
    }
