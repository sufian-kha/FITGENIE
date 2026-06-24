"""
FitGENIE - Posture Analyzer
Analyzes neck, back, and shoulder posture from MediaPipe pose landmarks.
Auto-detects front vs. side orientation and calculates specific posture recommendations.
"""

import numpy as np
import math
from typing import Dict, List, Optional, Tuple
from cv.pose_detector import PoseDetector


class PostureAnalyzer:
    """
    Analyzes human posture from pose landmarks.
    Detects user orientation (front vs. side view) and applies specific biomechanical rules.
    """

    def __init__(self, pose_detector: PoseDetector):
        self.detector = pose_detector
        self.history = []
        self.HISTORY_SIZE = 15  # Smooth over 15 frames

    def analyze(self) -> Dict:
        """
        Run full posture analysis on current frame landmarks.
        Detects orientation and applies correct checks.
        """
        if not self.detector.landmark_list:
            return self._empty_result()

        # Retrieve core landmarks
        left_shoulder = self.detector.get_landmark("left_shoulder")
        right_shoulder = self.detector.get_landmark("right_shoulder")
        left_hip = self.detector.get_landmark("left_hip")
        right_hip = self.detector.get_landmark("right_hip")
        left_ear = self.detector.get_landmark("left_ear")
        right_ear = self.detector.get_landmark("right_ear")
        nose = self.detector.get_landmark("nose")

        if not all([left_shoulder, right_shoulder, left_hip, right_hip, left_ear, right_ear, nose]):
            return self._empty_result()

        # 1. Classify Orientation (Front View vs. Side View)
        # Calculate horizontal shoulder width and vertical torso height
        shoulder_span = abs(left_shoulder["x"] - right_shoulder["x"])
        torso_height = abs((left_shoulder["y"] + right_shoulder["y"]) / 2 - (left_hip["y"] + right_hip["y"]) / 2) + 1
        
        # Ratio of shoulder width to torso height
        orientation_ratio = shoulder_span / torso_height
        
        issues = []
        scores = []
        angles = {}

        if orientation_ratio > 0.45:
            # --- FRONT / BACK VIEW ---
            view_status = "FRONT VIEW"
            
            # A. Shoulder Levelness (Symmetry)
            y_diff = abs(left_shoulder["y"] - right_shoulder["y"])
            level_ratio = y_diff / (shoulder_span + 1)
            shoulder_score = max(0, 100 - level_ratio * 350)
            scores.append(shoulder_score)
            angles["shoulder_tilt_pct"] = round(level_ratio * 100, 1)
            if level_ratio > 0.08:
                issues.append("Uneven shoulders — Align your shoulders horizontally")
            
            # B. Neck Lateral Tilt (Head Side Tilt)
            ear_y_diff = abs(left_ear["y"] - right_ear["y"])
            tilt_ratio = ear_y_diff / (shoulder_span + 1)
            tilt_score = max(0, 100 - tilt_ratio * 400)
            scores.append(tilt_score)
            if tilt_ratio > 0.06:
                issues.append("Head tilt — Keep your head centered and level")

            # C. Front-View Slouching (Head sinking relative to shoulders)
            ear_y = (left_ear["y"] + right_ear["y"]) / 2
            shoulder_y = (left_shoulder["y"] + right_shoulder["y"]) / 2
            head_height_ratio = abs(ear_y - shoulder_y) / (shoulder_span + 1)
            
            if head_height_ratio < 0.30:
                slouch_score = max(0, 100 - (0.30 - head_height_ratio) * 500)
                issues.append("Slouching — Lift your chest and stand tall")
            else:
                slouch_score = 100.0
            scores.append(slouch_score)
            angles["neck_height_ratio"] = round(head_height_ratio, 2)

            # D. Side Leaning (Torso Shift)
            shoulder_mid_x = (left_shoulder["x"] + right_shoulder["x"]) / 2
            hip_mid_x = (left_hip["x"] + right_hip["x"]) / 2
            lean_ratio = abs(shoulder_mid_x - hip_mid_x) / (shoulder_span + 1)
            lean_score = max(0, 100 - lean_ratio * 300)
            scores.append(lean_score)
            if lean_ratio > 0.12:
                issues.append("Torso leaning — Distribute your weight evenly")

        else:
            # --- SIDE VIEW ---
            view_status = "SIDE VIEW"

            # Determine visible side based on MediaPipe landmark visibility
            left_vis = left_ear["visibility"] + left_shoulder["visibility"]
            right_vis = right_ear["visibility"] + right_shoulder["visibility"]
            
            if left_vis > right_vis:
                ear = left_ear
                shoulder = left_shoulder
                hip = left_hip
            else:
                ear = right_ear
                shoulder = right_shoulder
                hip = right_hip

            # A. Head Forward Posture (Ear horizontal offset relative to shoulder)
            horizontal_offset = abs(ear["x"] - shoulder["x"])
            vertical_dist = abs(ear["y"] - shoulder["y"]) + 1
            lean_ratio = horizontal_offset / vertical_dist
            
            # Ideal ear is directly above shoulder (lean_ratio < 0.15)
            neck_angle = round(math.degrees(math.atan2(horizontal_offset, vertical_dist)), 1)
            angles["neck_angle"] = neck_angle
            
            if lean_ratio > 0.28:
                neck_score = max(0, 100 - (lean_ratio - 0.1) * 200)
                issues.append("Head Forward Posture — Pull your chin back & align ears over shoulders")
            else:
                neck_score = 100.0
            scores.append(neck_score)

            # B. Spine Slouching (Ear-Shoulder-Hip angle)
            # A straight spine aligns ear, shoulder, and hip near 180 degrees.
            # Rounded shoulders / slouching drops this angle.
            spine_angle = self.detector._angle_between_points(
                (ear["x"], ear["y"]),
                (shoulder["x"], shoulder["y"]),
                (hip["x"], hip["y"])
            )
            angles["spine_angle"] = spine_angle
            
            if spine_angle < 155:
                spine_score = max(0, 100 - (165 - spine_angle) * 3)
                issues.append("Rounded Back / Slouching — Roll your shoulders back and sit straight")
            else:
                spine_score = 100.0
            scores.append(spine_score)

        # Compute average posture score
        if scores:
            raw_score = sum(scores) / len(scores)
        else:
            raw_score = 50.0

        # Smooth score with historical buffer
        self.history.append(raw_score)
        if len(self.history) > self.HISTORY_SIZE:
            self.history.pop(0)
        smoothed_score = sum(self.history) / len(self.history)
        final_score = round(smoothed_score, 1)

        # Determine overall rating
        if final_score >= 80:
            status = "GOOD POSTURE"
            status_color = "#10b981"
            overall_feedback = f"Excellent posture ({view_status})! Keep it up."
        elif final_score >= 60:
            status = "FAIR POSTURE"
            status_color = "#f59e0b"
            overall_feedback = f"Posture is acceptable ({view_status}) but can be improved."
        else:
            status = "POOR POSTURE"
            status_color = "#ef4444"
            overall_feedback = f"Posture needs adjustment ({view_status}). Check suggestions below."

        # Generate actionable advice
        recommendations = self._get_recommendations(issues, view_status)

        return {
            "posture_score": final_score,
            "status": status,
            "status_color": status_color,
            "overall_feedback": overall_feedback,
            "issues": issues,
            "recommendations": recommendations,
            "angles": angles
        }

    def _get_recommendations(self, issues: List[str], view_status: str) -> List[str]:
        """Generate targeted exercises based on specific posture issues."""
        recommendations = []
        issue_text = " ".join(issues).lower()

        if "head forward" in issue_text:
            recommendations.append("Chin tucks: 3 sets × 10 reps (strengthens deep neck flexors)")
            recommendations.append("Chest stretch: hold 30s (opens up tight anterior chest)")

        if "rounded back" in issue_text or "slouching" in issue_text:
            recommendations.append("Plank holds: 3 sets × 45s (activates core stabilizers)")
            recommendations.append("Pec stretches and shoulder wall slides daily")

        if "uneven shoulders" in issue_text or "tilt" in issue_text:
            recommendations.append("Dumbbell shrugs & face pulls: 3 sets × 15 reps")
            recommendations.append("Check monitor height — should be straight ahead at eye level")

        if "torso leaning" in issue_text:
            recommendations.append("Side planks: 2 sets × 30s per side (balances obliques)")
            recommendations.append("Ensure equal weight distribution on both feet when standing")

        # Fallback default general recommendations
        if not recommendations:
            if view_status == "FRONT VIEW":
                recommendations = [
                    "Keep your weight balanced evenly on both hips/feet",
                    "Keep shoulders level and head upright",
                    "Strengthen core muscles to prevent mid-day fatigue"
                ]
            else:
                recommendations = [
                    "Keep your shoulders rolled back and relaxed",
                    "Adjust monitor/screen to be directly at eye level",
                    "Perform chin tucks to prevent neck strain"
                ]

        return recommendations

    def _empty_result(self) -> Dict:
        """Return empty state result when pose detection is missing."""
        return {
            "posture_score": 0,
            "status": "NO DETECTION",
            "status_color": "#6b7280",
            "overall_feedback": "Please step back and position yourself in front of the camera.",
            "issues": [],
            "recommendations": [
                "Ensure your full body is visible in the frame",
                "Ensure the room is well lit"
            ],
            "angles": {}
        }
