"""
FitGENIE - ML Model Trainer
Trains Random Forest and Decision Tree classifiers on fitness dataset.
Saves trained models for inference.
"""

import os
import sys
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Add parent dir to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.dataset_generator import generate_dataset

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# Label mappings for decoding predictions
WORKOUT_LABELS = {
    0: "Cardio",
    1: "Strength Training",
    2: "HIIT",
    3: "Yoga & Flexibility",
    4: "Mixed Training"
}

DIET_LABELS = {
    0: "Low Calorie",
    1: "High Protein",
    2: "Balanced",
    3: "High Carb",
    4: "Keto / Low Carb"
}

FITNESS_LEVEL_LABELS = {
    0: "Beginner",
    1: "Intermediate",
    2: "Advanced"
}


def train_models():
    """Train all ML models and save to disk."""
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)

    print("=" * 50)
    print("FitGENIE - ML Model Training")
    print("=" * 50)

    # Generate dataset
    print("\n📊 Generating training dataset...")
    df = generate_dataset()
    df.to_csv(os.path.join(DATA_DIR, "fitness_dataset.csv"), index=False)
    print(f"✅ Dataset: {len(df)} records")

    # Features and targets
    feature_cols = ["bmi", "age", "gender", "activity_level", "fitness_goal"]
    X = df[feature_cols].values

    targets = {
        "workout": df["workout_category"].values,
        "diet": df["diet_category"].values,
        "fitness_level": df["fitness_level"].values
    }

    # Train and save models for each target
    results = {}

    for target_name, y in targets.items():
        print(f"\n{'=' * 40}")
        print(f"Training models for: {target_name.upper()}")
        print(f"{'=' * 40}")

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # --- Random Forest (Primary Model) ---
        rf_pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", RandomForestClassifier(
                n_estimators=200,
                max_depth=12,
                min_samples_split=5,
                min_samples_leaf=2,
                class_weight="balanced",
                random_state=42,
                n_jobs=-1
            ))
        ])

        rf_pipeline.fit(X_train, y_train)
        rf_pred = rf_pipeline.predict(X_test)
        rf_accuracy = accuracy_score(y_test, rf_pred)

        # Cross-validation
        cv_scores = cross_val_score(rf_pipeline, X, y, cv=5, scoring="accuracy")

        print(f"\n🌲 Random Forest - {target_name}")
        print(f"   Test Accuracy:  {rf_accuracy:.4f} ({rf_accuracy*100:.1f}%)")
        print(f"   CV Mean:        {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

        # --- Decision Tree (Interpretable Model) ---
        dt_pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", DecisionTreeClassifier(
                max_depth=8,
                min_samples_split=10,
                min_samples_leaf=5,
                class_weight="balanced",
                random_state=42
            ))
        ])

        dt_pipeline.fit(X_train, y_train)
        dt_pred = dt_pipeline.predict(X_test)
        dt_accuracy = accuracy_score(y_test, dt_pred)

        print(f"\n🌳 Decision Tree - {target_name}")
        print(f"   Test Accuracy:  {dt_accuracy:.4f} ({dt_accuracy*100:.1f}%)")

        # Save models
        rf_path = os.path.join(MODELS_DIR, f"rf_{target_name}.pkl")
        dt_path = os.path.join(MODELS_DIR, f"dt_{target_name}.pkl")

        joblib.dump(rf_pipeline, rf_path)
        joblib.dump(dt_pipeline, dt_path)

        print(f"\n💾 Saved: {rf_path}")
        print(f"💾 Saved: {dt_path}")

        results[target_name] = {
            "rf_accuracy": rf_accuracy,
            "dt_accuracy": dt_accuracy,
            "cv_mean": cv_scores.mean()
        }

    # Save label mappings
    label_maps = {
        "workout": WORKOUT_LABELS,
        "diet": DIET_LABELS,
        "fitness_level": FITNESS_LEVEL_LABELS
    }
    joblib.dump(label_maps, os.path.join(MODELS_DIR, "label_maps.pkl"))

    # Save feature column names
    joblib.dump(feature_cols, os.path.join(MODELS_DIR, "feature_cols.pkl"))

    print("\n" + "=" * 50)
    print("✅ ALL MODELS TRAINED SUCCESSFULLY")
    print("=" * 50)
    for target, metrics in results.items():
        print(f"\n{target.upper()}")
        print(f"  RF Accuracy: {metrics['rf_accuracy']*100:.1f}%")
        print(f"  DT Accuracy: {metrics['dt_accuracy']*100:.1f}%")
        print(f"  CV Mean:     {metrics['cv_mean']*100:.1f}%")

    return results


if __name__ == "__main__":
    train_models()
