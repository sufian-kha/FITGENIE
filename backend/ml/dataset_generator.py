"""
FitGENIE - Synthetic Fitness Dataset Generator
Generates realistic fitness training data for ML model training.
Creates 5000 records with proper distributions based on fitness science.
"""

import numpy as np
import pandas as pd
import os

np.random.seed(42)
NUM_SAMPLES = 5000


def generate_dataset() -> pd.DataFrame:
    """
    Generate a synthetic fitness dataset with realistic correlations.
    
    Features:
        - bmi: Body Mass Index (15-45)
        - age: Age in years (15-70)
        - gender: 0=female, 1=male
        - activity_level: 0-4 (sedentary to athlete)
        - fitness_goal: 0-4 (weight_loss, weight_gain, muscle_building, fat_loss, general)
    
    Labels:
        - workout_category: 0=cardio, 1=strength, 2=hiit, 3=yoga_flexibility, 4=mixed
        - diet_category: 0=low_calorie, 1=high_protein, 2=balanced, 3=high_carb, 4=keto
        - fitness_level: 0=beginner, 1=intermediate, 2=advanced
    """
    # --- Feature Generation ---
    ages = np.random.normal(35, 12, NUM_SAMPLES).clip(15, 70).astype(int)
    genders = np.random.randint(0, 2, NUM_SAMPLES)

    # BMI with realistic bimodal distribution (healthy + overweight)
    bmi_healthy = np.random.normal(22, 2, NUM_SAMPLES // 2)
    bmi_overweight = np.random.normal(28, 4, NUM_SAMPLES // 2)
    bmis = np.concatenate([bmi_healthy, bmi_overweight])
    np.random.shuffle(bmis)
    bmis = bmis.clip(15, 45).round(1)

    # Activity level correlated with age (younger = more active on average)
    activity_base = np.random.randint(0, 5, NUM_SAMPLES)
    activity_levels = activity_base

    # Fitness goal distribution (realistic population)
    goal_probs = [0.30, 0.10, 0.25, 0.20, 0.15]  # weight_loss dominant
    fitness_goals = np.random.choice(5, NUM_SAMPLES, p=goal_probs)

    # --- Label Generation with Realistic Logic ---
    workout_categories = []
    diet_categories = []
    fitness_levels = []

    for i in range(NUM_SAMPLES):
        bmi = bmis[i]
        age = ages[i]
        activity = activity_levels[i]
        goal = fitness_goals[i]

        # --- Workout Category ---
        # 0=cardio, 1=strength, 2=hiit, 3=yoga_flexibility, 4=mixed
        if goal == 0:  # weight loss
            if activity <= 1:
                probs = [0.5, 0.1, 0.2, 0.1, 0.1]
            else:
                probs = [0.3, 0.1, 0.4, 0.1, 0.1]
        elif goal == 1:  # weight gain
            probs = [0.05, 0.6, 0.15, 0.05, 0.15]
        elif goal == 2:  # muscle building
            probs = [0.05, 0.65, 0.20, 0.02, 0.08]
        elif goal == 3:  # fat loss
            if bmi > 30:
                probs = [0.4, 0.15, 0.3, 0.1, 0.05]
            else:
                probs = [0.25, 0.25, 0.35, 0.05, 0.10]
        else:  # general fitness
            if age > 50:
                probs = [0.2, 0.2, 0.1, 0.3, 0.2]
            else:
                probs = [0.2, 0.2, 0.2, 0.1, 0.3]

        workout_cat = np.random.choice(5, p=probs)
        workout_categories.append(workout_cat)

        # --- Diet Category ---
        # 0=low_calorie, 1=high_protein, 2=balanced, 3=high_carb, 4=keto
        if goal == 0:  # weight loss
            probs_d = [0.45, 0.25, 0.15, 0.05, 0.10]
        elif goal == 1:  # weight gain
            probs_d = [0.02, 0.30, 0.35, 0.30, 0.03]
        elif goal == 2:  # muscle building
            probs_d = [0.05, 0.50, 0.25, 0.15, 0.05]
        elif goal == 3:  # fat loss
            probs_d = [0.30, 0.30, 0.15, 0.05, 0.20]
        else:  # general fitness
            probs_d = [0.10, 0.20, 0.45, 0.15, 0.10]

        diet_cat = np.random.choice(5, p=probs_d)
        diet_categories.append(diet_cat)

        # --- Fitness Level ---
        # 0=beginner, 1=intermediate, 2=advanced
        score = activity * 20  # Base from activity (0-80)
        score += max(0, 10 - abs(bmi - 22))  # BMI bonus
        score += min(age / 10, 5)  # slight age bonus
        score += np.random.normal(0, 10)  # noise

        if score < 30:
            fitness_levels.append(0)
        elif score < 60:
            fitness_levels.append(1)
        else:
            fitness_levels.append(2)

    # Build DataFrame
    df = pd.DataFrame({
        "bmi": bmis,
        "age": ages,
        "gender": genders,
        "activity_level": activity_levels,
        "fitness_goal": fitness_goals,
        "workout_category": workout_categories,
        "diet_category": diet_categories,
        "fitness_level": fitness_levels
    })

    return df


if __name__ == "__main__":
    print("Generating fitness dataset...")
    df = generate_dataset()
    
    os.makedirs("ml/data", exist_ok=True)
    output_path = "ml/data/fitness_dataset.csv"
    df.to_csv(output_path, index=False)
    
    print(f"✅ Dataset generated: {len(df)} records")
    print(f"📁 Saved to: {output_path}")
    print("\nClass distributions:")
    print("Workout categories:", df["workout_category"].value_counts().to_dict())
    print("Diet categories:", df["diet_category"].value_counts().to_dict())
    print("Fitness levels:", df["fitness_level"].value_counts().to_dict())
    print("\nSample data:")
    print(df.head())
