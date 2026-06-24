"""
FitGENIE - Exercise Tracker
Tracks exercise repetitions, analyzes form, and provides real-time feedback.
Supports: Pushups, Squats, Lunges, Plank
"""

import time
import numpy as np
from typing import Dict, Optional, List
from cv.pose_detector import PoseDetector


class ExerciseTracker:
    """
    State machine-based exercise rep counter with form analysis.
    
    State transitions:
    - UP → DOWN: joint angle decreases past threshold
    - DOWN → UP: joint angle increases past threshold
    - Each UP→DOWN→UP cycle = 1 repetition
    """

    # Exercise configuration: [up_angle, down_angle, primary_joint, secondary_joints]
    EXERCISE_CONFIG = {
        "pushup": {
            "display_name": "Push-Up",
            "primary_joint": ("left_shoulder", "left_elbow", "left_wrist"),
            "secondary_joint": ("right_shoulder", "right_elbow", "right_wrist"),
            "up_threshold": 160,      # Arms extended
            "down_threshold": 90,     # Arms at 90°
            "min_angle": 60,
            "max_angle": 180,
            "muscles": "Chest, Triceps, Shoulders",
            "calories_per_rep": 0.5,
        },
        "squat": {
            "display_name": "Squat",
            "primary_joint": ("left_hip", "left_knee", "left_ankle"),
            "secondary_joint": ("right_hip", "right_knee", "right_ankle"),
            "up_threshold": 160,      # Standing
            "down_threshold": 95,     # Deep squat
            "min_angle": 70,
            "max_angle": 180,
            "muscles": "Quads, Glutes, Hamstrings",
            "calories_per_rep": 0.8,
        },
        "lunge": {
            "display_name": "Lunge",
            "primary_joint": ("left_hip", "left_knee", "left_ankle"),
            "secondary_joint": ("right_hip", "right_knee", "right_ankle"),
            "up_threshold": 155,
            "down_threshold": 90,
            "min_angle": 60,
            "max_angle": 180,
            "muscles": "Quads, Glutes, Hip Flexors",
            "calories_per_rep": 0.7,
        },
        "plank": {
            "display_name": "Plank",
            "primary_joint": ("left_shoulder", "left_hip", "left_knee"),
            "secondary_joint": ("right_shoulder", "right_hip", "right_knee"),
            "up_threshold": 155,      # Body straight
            "down_threshold": 120,    # Hips dropping
            "min_angle": 100,
            "max_angle": 180,
            "muscles": "Core, Shoulders, Back",
            "calories_per_rep": 0.3,   # Per second for plank
            "is_timed": True
        }
    }

    def __init__(self, pose_detector: PoseDetector):
        self.detector = pose_detector
        self.exercise = "squat"
        self.rep_count = 0
        self.state = "up"           # "up" or "down"
        self.current_angle = 0.0
        self.accuracy_scores = []
        self.form_feedback = "Get ready!"
        self.start_time = None
        self.plank_duration = 0.0
        self.angle_history = []

    def set_exercise(self, exercise_name: str):
        """Switch to a different exercise and reset counters."""
        exercise_key = exercise_name.lower().replace(" ", "_").replace("-", "")
        if exercise_key in self.EXERCISE_CONFIG:
            self.exercise = exercise_key
            self.reset()
        else:
            # Default to squat
            self.exercise = "squat"
            self.reset()

    def reset(self):
        """Reset all tracking state."""
        self.rep_count = 0
        self.state = "up"
        self.current_angle = 0.0
        self.accuracy_scores = []
        self.form_feedback = "Get ready!"
        self.start_time = time.time()
        self.plank_duration = 0.0
        self.angle_history = []

    def update(self) -> Dict:
        """
        Process current frame landmarks and update tracking state.
        Returns current exercise statistics.
        """
        config = self.EXERCISE_CONFIG.get(self.exercise, self.EXERCISE_CONFIG["squat"])

        if not self.start_time:
            self.start_time = time.time()

        if not self.detector.landmark_list:
            return self._get_stats(config, detected=False)

        # Calculate primary joint angle
        primary = config["primary_joint"]
        angle = self.detector.calculate_angle(*primary)

        if angle is None:
            return self._get_stats(config, detected=False)

        self.current_angle = angle

        # Smooth angle with rolling average
        self.angle_history.append(angle)
        if len(self.angle_history) > 5:
            self.angle_history.pop(0)
        smoothed_angle = sum(self.angle_history) / len(self.angle_history)

        # Handle plank differently (timed exercise)
        if config.get("is_timed"):
            return self._update_plank(smoothed_angle, config)

        # Rep counting state machine
        up_thresh = config["up_threshold"]
        down_thresh = config["down_threshold"]
        accuracy, feedback = self._analyze_form(smoothed_angle, config)

        if self.state == "up" and smoothed_angle <= down_thresh:
            self.state = "down"
            self.form_feedback = feedback

        elif self.state == "down" and smoothed_angle >= up_thresh:
            self.state = "up"
            self.rep_count += 1
            self.accuracy_scores.append(accuracy)
            self.form_feedback = feedback

        return self._get_stats(config, detected=True, accuracy=accuracy, feedback=feedback)

    def _update_plank(self, angle: float, config: dict) -> Dict:
        """Update plank hold timer."""
        if angle >= config["up_threshold"]:
            self.plank_duration = time.time() - (self.start_time or time.time())
            feedback = "Great plank! Hold steady."
            accuracy = 90.0
        else:
            feedback = "Hips dropping — tighten your core!"
            accuracy = 50.0

        elapsed = time.time() - (self.start_time or time.time())

        return {
            "exercise": config["display_name"],
            "rep_count": int(self.plank_duration),  # Show seconds held
            "state": "holding" if angle >= config["up_threshold"] else "breaking",
            "current_angle": round(angle, 1),
            "accuracy": accuracy,
            "form_feedback": feedback,
            "muscles": config["muscles"],
            "calories_burned": round(self.plank_duration * config["calories_per_rep"] / 60, 1),
            "duration_seconds": round(elapsed, 0),
            "detected": True,
            "is_timed": True
        }

    def _analyze_form(self, angle: float, config: dict) -> tuple:
        """
        Analyze exercise form based on joint angle.
        Returns (accuracy_percentage, feedback_string)
        """
        display_name = config["display_name"]
        up_thresh = config["up_threshold"]
        down_thresh = config["down_threshold"]
        min_angle = config.get("min_angle", 60)

        # Calculate how close the movement is to ideal range
        range_size = up_thresh - down_thresh
        if self.state == "down":
            # How deep did they go?
            ideal_bottom = down_thresh - 10
            deviation = abs(angle - ideal_bottom)
            accuracy = max(0, 100 - (deviation / range_size) * 100)

            if angle < min_angle:
                feedback = f"Too deep — ease up on the {display_name}"
                accuracy = max(accuracy - 20, 40)
            elif angle > down_thresh + 20:
                feedback = f"Go deeper — aim for {down_thresh}° on your {display_name}"
                accuracy = max(accuracy - 10, 50)
            else:
                feedback = "✅ Correct Form — Great depth!"

        else:  # UP phase
            if angle < up_thresh - 20:
                feedback = f"Extend fully at the top of {display_name}"
                accuracy = 70.0
            else:
                feedback = "✅ Good lockout!"
                accuracy = 90.0

        # Exercise-specific form checks
        feedback = self._exercise_specific_checks(display_name, angle, feedback)

        return round(accuracy, 1), feedback

    def _exercise_specific_checks(self, exercise: str, angle: float, default_feedback: str) -> str:
        """Add exercise-specific form cues."""
        if exercise == "Squat":
            # Check knee tracking (use hip-knee-ankle angle)
            left_knee = self.detector.get_landmark("left_knee")
            left_hip = self.detector.get_landmark("left_hip")
            left_ankle = self.detector.get_landmark("left_ankle")
            if left_knee and left_hip and left_ankle:
                knee_forward = left_knee["x"] - left_ankle["x"]
                if abs(knee_forward) > 40:
                    return "Knees caving — push knees out!"
            if angle < 85:
                return "Adjust Knee Position — Don't let knees pass toes"

        elif exercise == "Push-Up":
            # Check elbow flare with shoulder position
            left_shoulder = self.detector.get_landmark("left_shoulder")
            left_elbow = self.detector.get_landmark("left_elbow")
            if left_shoulder and left_elbow:
                elbow_flare = abs(left_elbow["x"] - left_shoulder["x"])
                if elbow_flare > 60:
                    return "Tuck elbows — avoid flaring"

        elif exercise == "Lunge":
            if angle < 70:
                return "Straighten Back — Keep torso upright"

        return default_feedback

    def _get_stats(self, config: dict, detected: bool,
                   accuracy: float = 0.0, feedback: str = "") -> Dict:
        """Compile current exercise statistics."""
        avg_accuracy = round(sum(self.accuracy_scores) / max(len(self.accuracy_scores), 1), 1)
        elapsed = round(time.time() - (self.start_time or time.time()), 0)
        calories = round(self.rep_count * config.get("calories_per_rep", 0.5), 1)

        return {
            "exercise": config["display_name"],
            "rep_count": self.rep_count,
            "state": self.state,
            "current_angle": round(self.current_angle, 1),
            "accuracy": accuracy if detected else avg_accuracy,
            "average_accuracy": avg_accuracy,
            "form_feedback": feedback or self.form_feedback,
            "muscles": config["muscles"],
            "calories_burned": calories,
            "duration_seconds": elapsed,
            "detected": detected,
            "is_timed": config.get("is_timed", False)
        }
