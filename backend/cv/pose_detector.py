"""
FitGENIE - Pose Detector
MediaPipe-based pose landmark detection with joint angle calculation.
"""

import cv2
import numpy as np
import math
from typing import Optional, Tuple, List, Dict

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils
    mp_drawing_styles = mp.solutions.drawing_styles
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    mp_pose = None
    mp_drawing = None


class PoseDetector:
    """
    Wraps MediaPipe Pose for real-time body pose detection.
    Provides joint angle calculation and landmark extraction.
    """

    # Key MediaPipe landmark indices
    LANDMARKS = {
        "nose": 0,
        "left_eye": 1, "right_eye": 2,
        "left_ear": 3, "right_ear": 4,
        "left_shoulder": 11, "right_shoulder": 12,
        "left_elbow": 13, "right_elbow": 14,
        "left_wrist": 15, "right_wrist": 16,
        "left_hip": 23, "right_hip": 24,
        "left_knee": 25, "right_knee": 26,
        "left_ankle": 27, "right_ankle": 28,
        "left_heel": 29, "right_heel": 30,
        "left_foot": 31, "right_foot": 32
    }

    def __init__(self, static_image_mode: bool = False,
                 model_complexity: int = 1,
                 min_detection_confidence: float = 0.5,
                 min_tracking_confidence: float = 0.5):
        self.available = MEDIAPIPE_AVAILABLE
        self.pose = None
        self.landmarks = None
        self.landmark_list = []

        if self.available:
            self.pose = mp_pose.Pose(
                static_image_mode=static_image_mode,
                model_complexity=model_complexity,
                enable_segmentation=False,
                min_detection_confidence=min_detection_confidence,
                min_tracking_confidence=min_tracking_confidence
            )

    def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, bool]:
        """
        Process a single video frame through MediaPipe Pose.
        Returns annotated frame and detection success flag.
        """
        if not self.available or self.pose is None:
            return frame, False

        # Convert BGR to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        rgb_frame.flags.writeable = False
        results = self.pose.process(rgb_frame)
        rgb_frame.flags.writeable = True

        if results.pose_landmarks:
            self.landmarks = results.pose_landmarks
            h, w, _ = frame.shape
            self.landmark_list = []
            for idx, lm in enumerate(results.pose_landmarks.landmark):
                cx, cy = int(lm.x * w), int(lm.y * h)
                self.landmark_list.append({
                    "id": idx, "x": cx, "y": cy,
                    "x_norm": lm.x, "y_norm": lm.y,
                    "z": lm.z, "visibility": lm.visibility
                })

            # Draw skeleton overlay
            mp_drawing.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp_drawing.DrawingSpec(
                    color=(0, 255, 255), thickness=2, circle_radius=3
                ),
                connection_drawing_spec=mp_drawing.DrawingSpec(
                    color=(0, 255, 128), thickness=2
                )
            )
            return frame, True

        self.landmarks = None
        self.landmark_list = []
        return frame, False

    def get_landmark(self, name: str) -> Optional[Dict]:
        """Get landmark coordinates by name."""
        idx = self.LANDMARKS.get(name)
        if idx is not None and idx < len(self.landmark_list):
            return self.landmark_list[idx]
        return None

    def get_landmark_by_id(self, idx: int) -> Optional[Dict]:
        """Get landmark by MediaPipe index."""
        if idx < len(self.landmark_list):
            return self.landmark_list[idx]
        return None

    def calculate_angle(self, point_a_name: str, point_b_name: str, point_c_name: str) -> Optional[float]:
        """
        Calculate the angle at point B formed by A-B-C.
        Uses the law of cosines / dot product method.
        
        Returns angle in degrees (0-180).
        """
        a = self.get_landmark(point_a_name)
        b = self.get_landmark(point_b_name)
        c = self.get_landmark(point_c_name)

        if not all([a, b, c]):
            return None

        return self._angle_between_points(
            (a["x"], a["y"]),
            (b["x"], b["y"]),
            (c["x"], c["y"])
        )

    def calculate_angle_by_id(self, id_a: int, id_b: int, id_c: int) -> Optional[float]:
        """Calculate angle between three landmarks by MediaPipe ID."""
        a = self.get_landmark_by_id(id_a)
        b = self.get_landmark_by_id(id_b)
        c = self.get_landmark_by_id(id_c)

        if not all([a, b, c]):
            return None

        return self._angle_between_points(
            (a["x"], a["y"]),
            (b["x"], b["y"]),
            (c["x"], c["y"])
        )

    @staticmethod
    def _angle_between_points(a: Tuple, b: Tuple, c: Tuple) -> float:
        """Calculate angle at vertex B between rays B->A and B->C."""
        a = np.array(a, dtype=float)
        b = np.array(b, dtype=float)
        c = np.array(c, dtype=float)

        ba = a - b
        bc = c - b

        cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
        angle = np.degrees(np.arccos(np.clip(cosine, -1.0, 1.0)))
        return round(float(angle), 1)

    def get_midpoint(self, name_a: str, name_b: str) -> Optional[Tuple[int, int]]:
        """Get midpoint between two landmarks."""
        a = self.get_landmark(name_a)
        b = self.get_landmark(name_b)
        if a and b:
            return (int((a["x"] + b["x"]) / 2), int((a["y"] + b["y"]) / 2))
        return None

    def draw_angle(self, frame: np.ndarray, landmark_name: str, angle: float):
        """Draw angle value on frame at landmark position."""
        lm = self.get_landmark(landmark_name)
        if lm:
            color = (0, 255, 0) if angle > 90 else (0, 165, 255)
            cv2.putText(frame, f"{angle:.0f}°", (lm["x"], lm["y"]),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2, cv2.LINE_AA)

    def close(self):
        """Release MediaPipe resources."""
        if self.pose:
            self.pose.close()
