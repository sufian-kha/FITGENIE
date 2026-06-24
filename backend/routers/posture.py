"""
FitGENIE - Posture & Computer Vision Router
WebSocket endpoint for real-time pose detection, posture analysis, and exercise tracking.
Processes video frames from the browser and returns annotated frames + stats.
"""

import cv2
import base64
import json
import numpy as np
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

router = APIRouter()

# Track active WebSocket sessions
active_sessions = {}


class SessionConfig(BaseModel):
    exercise: str = "squat"


@router.websocket("/ws/{session_id}")
async def posture_websocket(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time CV processing.
    
    Protocol:
    - Client sends JSON: {"frame": "<base64_jpg>", "exercise": "squat", "mode": "workout|posture"}
    - Server responds JSON: {"annotated_frame": "<base64_jpg>", "stats": {...}, "posture": {...}}
    """
    await websocket.accept()

    # Initialize CV components for this session
    try:
        from cv.pose_detector import PoseDetector
        from cv.posture_analyzer import PostureAnalyzer
        from cv.exercise_tracker import ExerciseTracker

        detector = PoseDetector(
            static_image_mode=False,
            model_complexity=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        posture_analyzer = PostureAnalyzer(detector)
        exercise_tracker = ExerciseTracker(detector)
        cv_available = True
    except Exception as e:
        cv_available = False
        print(f"CV initialization error: {e}")

    active_sessions[session_id] = {"websocket": websocket, "active": True}

    try:
        while True:
            # Receive frame from client
            raw = await websocket.receive_text()
            data = json.loads(raw)

            frame_b64 = data.get("frame", "")
            exercise = data.get("exercise", "squat")
            mode = data.get("mode", "workout")  # "workout" or "posture"

            if not frame_b64:
                continue

            if not cv_available:
                # Return mock data if MediaPipe not available
                await websocket.send_json({
                    "annotated_frame": frame_b64,
                    "stats": _mock_exercise_stats(exercise),
                    "posture": _mock_posture_stats(),
                    "cv_available": False
                })
                continue

            # Decode base64 frame
            try:
                frame_bytes = base64.b64decode(frame_b64)
                np_arr = np.frombuffer(frame_bytes, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                if frame is None:
                    continue

                # Set exercise type
                exercise_tracker.set_exercise(exercise)

                # Run pose detection
                annotated_frame, detected = detector.process_frame(frame)

                # Run posture analysis
                posture_data = posture_analyzer.analyze()

                # Run exercise tracking (workout mode)
                exercise_stats = exercise_tracker.update()

                # Draw HUD overlay on frame
                annotated_frame = _draw_hud(
                    annotated_frame, exercise_stats, posture_data, mode
                )

                # Encode annotated frame back to base64
                _, buffer = cv2.imencode(".jpg", annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
                annotated_b64 = base64.b64encode(buffer).decode("utf-8")

                await websocket.send_json({
                    "annotated_frame": annotated_b64,
                    "stats": exercise_stats,
                    "posture": posture_data,
                    "cv_available": True,
                    "pose_detected": detected
                })

            except Exception as e:
                await websocket.send_json({
                    "error": str(e),
                    "annotated_frame": frame_b64,
                    "stats": _mock_exercise_stats(exercise),
                    "posture": _mock_posture_stats(),
                    "cv_available": cv_available
                })

    except WebSocketDisconnect:
        pass
    finally:
        # Cleanup
        if session_id in active_sessions:
            del active_sessions[session_id]
        if cv_available and detector:
            detector.close()


def _draw_hud(frame: np.ndarray, stats: dict, posture: dict, mode: str) -> np.ndarray:
    """Draw heads-up display overlay on the video frame."""
    h, w = frame.shape[:2]

    # Semi-transparent overlay panel
    overlay = frame.copy()
    cv2.rectangle(overlay, (10, 10), (280, 200), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.5, frame, 0.5, 0, frame)

    # Header
    cv2.putText(frame, "FitGENIE AI", (20, 35),
               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2, cv2.LINE_AA)

    y = 60
    line_h = 25

    if mode == "workout":
        # Exercise info
        cv2.putText(frame, f"Exercise: {stats.get('exercise', 'Unknown')}", (20, y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv2.LINE_AA)
        y += line_h

        # Rep count (large)
        rep_text = f"Reps: {stats.get('rep_count', 0)}"
        cv2.putText(frame, rep_text, (20, y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 128), 2, cv2.LINE_AA)
        y += line_h

        # State indicator
        state = stats.get("state", "up").upper()
        state_color = (0, 255, 0) if state == "UP" else (0, 165, 255)
        cv2.putText(frame, f"Phase: {state}", (20, y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.55, state_color, 1, cv2.LINE_AA)
        y += line_h

        # Accuracy
        acc = stats.get("accuracy", 0)
        acc_color = (0, 255, 0) if acc >= 80 else (0, 165, 255) if acc >= 60 else (0, 0, 255)
        cv2.putText(frame, f"Accuracy: {acc:.0f}%", (20, y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.55, acc_color, 1, cv2.LINE_AA)
        y += line_h

    # Posture score (always shown)
    posture_score = posture.get("posture_score", 0)
    p_color = (0, 255, 128) if posture_score >= 80 else (0, 165, 255) if posture_score >= 60 else (0, 0, 255)
    cv2.putText(frame, f"Posture: {posture_score:.0f}/100", (20, y),
               cv2.FONT_HERSHEY_SIMPLEX, 0.55, p_color, 1, cv2.LINE_AA)
    y += line_h

    # Form feedback at bottom
    feedback = stats.get("form_feedback", "")
    if feedback:
        fb_color = (0, 255, 0) if "✅" in feedback or "Good" in feedback or "Great" in feedback else (0, 165, 255)
        cv2.putText(frame, feedback[:40], (10, h - 20),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, fb_color, 2, cv2.LINE_AA)

    return frame


def _mock_exercise_stats(exercise: str) -> dict:
    """Mock stats when MediaPipe is unavailable."""
    import random
    return {
        "exercise": exercise.title(),
        "rep_count": random.randint(0, 15),
        "state": "up",
        "current_angle": round(random.uniform(90, 170), 1),
        "accuracy": round(random.uniform(75, 95), 1),
        "average_accuracy": 85.0,
        "form_feedback": "Active tracking ready. Stand in camera frame.",
        "muscles": "Full Body",
        "calories_burned": round(random.uniform(0, 10), 1),
        "duration_seconds": 30.0,
        "detected": False,
        "is_timed": False
    }


def _mock_posture_stats() -> dict:
    """Mock posture stats when MediaPipe is unavailable."""
    return {
        "posture_score": 75.0,
        "status": "DEMO MODE",
        "status_color": "#f59e0b",
        "overall_feedback": "Webcam standby. Align yourself to check posture.",
        "issues": [],
        "recommendations": [
            "Ensure your full body is visible in the camera frame",
            "Adjust room lighting for optimal detection accuracy"
        ],
        "angles": {}
    }

