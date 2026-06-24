/**
 * FitGENIE - Workout Session Module
 * Real-time camera-based exercise tracking with MediaPipe via WebSocket.
 * IMPORTANT: Camera NEVER opens automatically. Only on START WORKOUT click.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, CameraOff, Play, StopCircle, RefreshCw,
  Activity, Target, Flame, Timer, Award, ChevronDown, Check, AlertTriangle
} from 'lucide-react'
import useFitnessStore from '../store/fitnessStore'

const EXERCISES = [
  { value: 'squat', label: '🏋️ Squats Splits', muscles: 'Quads, Glutes, Hamstrings' },
  { value: 'pushup', label: '💪 Push-Ups Form', muscles: 'Chest, Triceps, Shoulders' },
  { value: 'lunge', label: '🦵 Lunges Stride', muscles: 'Quads, Glutes, Hip Flexors' },
  { value: 'plank', label: '🧘 Core Plank', muscles: 'Core, Shoulders, Back' },
]

function StatCard({ icon: Icon, label, value, unit, borderClass = 'border-t-4 border-t-orange-500', iconBg = 'bg-orange-500/10 text-orange-400' }) {
  return (
    <div className={`bg-[#1E293B] border border-slate-700/60 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow ${borderClass} hover:border-orange-500/30`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={16} />
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-poppins mb-1">{label}</p>
        <p className="text-xl sm:text-2xl font-black text-white font-poppins">
          {value}
          {unit && <span className="text-xs font-semibold text-slate-400 ml-1 font-poppins uppercase">{unit}</span>}
        </p>
      </div>
    </div>
  )
}

function PostureDisplay({ postureData }) {
  if (!postureData) return null

  const score = postureData.posture_score
  const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const isHealthy = score >= 80

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border border-slate-700/60 rounded-2xl p-5 bg-[#1E293B] shadow-sm ${isHealthy ? 'border-t-4 border-t-emerald-500' : 'border-t-4 border-t-amber-500'}`}
    >
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3.5 mb-4">
        <h4 className="text-white font-extrabold text-xs uppercase tracking-wider font-poppins">Posture Evaluation</h4>
        <span
          className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase font-poppins tracking-wider"
          style={{ color: scoreColor, backgroundColor: `${scoreColor}10`, border: `1px solid ${scoreColor}25` }}
        >
          {postureData.status}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className="text-4xl font-black font-poppins"
          style={{ color: scoreColor }}
        >
          {Math.round(score)}
        </div>
        <div>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-poppins">Postural score / 100</p>
          <p className="text-slate-300 text-xs sm:text-sm font-semibold leading-relaxed mt-1">{postureData.overall_feedback}</p>
        </div>
      </div>

      {/* Issues */}
      {postureData.issues?.length > 0 && (
        <div className="mb-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
          <p className="text-amber-400 text-[10px] uppercase font-black tracking-wider font-poppins mb-2 flex items-center gap-1.5">
            <AlertTriangle size={12} />
            Issues Detected
          </p>
          <div className="space-y-1.5">
            {postureData.issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <p className="text-amber-300 text-xs font-semibold leading-snug">{issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {postureData.recommendations?.length > 0 && (
        <div className="border-t border-slate-700/60 pt-3.5">
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-poppins mb-2">Posture Corrections</p>
          <div className="space-y-1.5">
            {postureData.recommendations.slice(0, 2).map((rec, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check size={12} className="text-emerald-500 mt-1 flex-shrink-0" />
                <p className="text-slate-300 text-xs font-semibold leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function WorkoutSession() {
  const [isActive, setIsActive] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState('squat')
  const [exerciseStats, setExerciseStats] = useState(null)
  const [postureData, setPostureData] = useState(null)
  const [wsStatus, setWsStatus] = useState('disconnected')
  const [sessionTime, setSessionTime] = useState(0)
  const [error, setError] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const wsRef = useRef(null)
  const animFrameRef = useRef(null)
  const timerRef = useRef(null)
  const sessionIdRef = useRef(Date.now().toString())

  // ---- Start Workout Session ----
  const startWorkout = async () => {
    setError(null)
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Connect WebSocket
      const wsUrl = `ws://localhost:8000/api/posture/ws/${sessionIdRef.current}`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setWsStatus('connected')
        startSendingFrames()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.stats) setExerciseStats(data.stats)
          if (data.posture) setPostureData(data.posture)

          // Draw annotated frame on canvas
          if (data.annotated_frame && canvasRef.current) {
            const img = new Image()
            img.onload = () => {
              const ctx = canvasRef.current.getContext('2d')
              if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
                ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height)
              }
            }
            img.src = `data:image/jpeg;base64,${data.annotated_frame}`
          }
        } catch (e) { /* ignore parse errors */ }
      }

      ws.onerror = () => {
        setWsStatus('error')
        setError('WebSocket connection failed. Falling back to local camera view.')
      }

      ws.onclose = () => setWsStatus('disconnected')

      // Start session timer
      setSessionTime(0)
      timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000)

      setIsActive(true)

    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser.')
      } else {
        setError(`Camera error: ${err.message}`)
      }
    }
  }

  // ---- Send Frames to Backend via WebSocket ----
  const startSendingFrames = useCallback(() => {
    const captureAndSend = () => {
      if (!videoRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        animFrameRef.current = requestAnimationFrame(captureAndSend)
        return
      }

      // Capture frame from video
      const offscreen = document.createElement('canvas')
      offscreen.width = 640
      offscreen.height = 480
      const ctx = offscreen.getContext('2d')
      ctx.drawImage(videoRef.current, 0, 0, 640, 480)

      // Also render locally on canvas when WS has no annotated frame
      if (canvasRef.current && wsStatus !== 'connected') {
        const liveCtx = canvasRef.current.getContext('2d')
        liveCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
      }

      // Convert to JPEG base64 and send
      offscreen.toBlob((blob) => {
        if (!blob) return
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result.split(',')[1]
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              frame: base64,
              exercise: selectedExercise,
              mode: 'workout'
            }))
          }
        }
        reader.readAsDataURL(blob)
      }, 'image/jpeg', 0.7)

      animFrameRef.current = requestAnimationFrame(captureAndSend)
    }

    animFrameRef.current = requestAnimationFrame(captureAndSend)
  }, [selectedExercise, wsStatus])

  // ---- Stop Workout Session ----
  const stopWorkout = () => {
    // Stop animation frame
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Clear video
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }

    // Stop timer
    if (timerRef.current) clearInterval(timerRef.current)

    setIsActive(false)
    setWsStatus('disconnected')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => stopWorkout()
  }, [])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card border-top-accent bg-[#1E293B] border border-slate-700/60"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
            <Camera size={20} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg tracking-tight font-poppins">AI Posture Feedback</h3>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-poppins">Real-time Computer Vision Joint Tracking</p>
          </div>
        </div>
        <div className="ml-auto">
          <span className={`badge ${isActive ? 'badge-green' : 'badge-blue'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#22c55e] animate-pulse' : 'bg-blue-500'}`} />
            <span className="font-poppins font-bold text-[10px] tracking-wider uppercase ml-1">{isActive ? 'Session Live' : 'Camera Ready'}</span>
          </span>
        </div>
      </div>

      {/* Exercise Selector (only when not active) */}
      {!isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 bg-[#1E293B]/40 border border-slate-700/60 rounded-2xl p-5"
        >
          <p className="text-white text-xs uppercase font-extrabold tracking-wider font-poppins mb-3">Select Active Exercise Split:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {EXERCISES.map((ex) => (
              <button
                key={ex.value}
                onClick={() => setSelectedExercise(ex.value)}
                className={`rounded-2xl p-4 text-left transition-all duration-300 border ${
                  selectedExercise === ex.value
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400 font-bold shadow-sm scale-[1.02]'
                    : 'bg-[#1E293B] text-slate-300 border-slate-700/60 hover:border-orange-500/30 hover:bg-[#334155]'
                }`}
              >
                <p className="font-extrabold text-sm font-poppins text-white">{ex.label}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-bold font-poppins uppercase truncate">{ex.muscles}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs sm:text-sm font-semibold"
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* Camera Feed + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera / Canvas */}
        <div className="lg:col-span-2">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-800 shadow-premium aspect-[4/3] w-full">
            {/* Hidden video element (source) */}
            <video ref={videoRef} className="hidden" playsInline muted />

            {/* Canvas for annotated feed */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className={`w-full h-full object-cover ${isActive ? 'block' : 'hidden'}`}
            />

            {/* Placeholder when inactive */}
            {!isActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-4 border border-slate-700 shadow-md">
                  <CameraOff size={28} />
                </div>
                <p className="text-slate-200 font-extrabold text-base font-poppins uppercase tracking-wider">Video Feed Offline</p>
                <p className="text-slate-500 text-xs font-semibold mt-1">Select exercise split and click START WORKOUT below</p>
              </div>
            )}

            {/* Live overlay info */}
            {isActive && (
              <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
                <div className="glass-premium px-3.5 py-1.5 rounded-full flex items-center gap-2 border-slate-700/60 shadow-md">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-xs font-black font-poppins">{formatTime(sessionTime)}</span>
                </div>
                <div className={`glass-premium px-3.5 py-1.5 rounded-full text-xs font-black font-poppins shadow-md ${
                  wsStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {wsStatus === 'connected' ? '🧠 AI DETECT ACTIVE' : '📷 LOCAL STREAM'}
                </div>
              </div>
            )}

            {/* Current exercise label */}
            {isActive && (
              <div className="absolute bottom-3.5 left-3.5 glass-premium px-4 py-2 rounded-full border-slate-700/60 shadow-md">
                <span className="text-white text-xs font-black font-poppins uppercase tracking-widest">
                  Active: {EXERCISES.find(e => e.value === selectedExercise)?.label}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Panel */}
        <div className="space-y-4">
          {/* Exercise Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Activity}
              label="Reps Completed"
              value={exerciseStats?.rep_count ?? '—'}
              borderClass="border-t-4 border-t-slate-500"
              iconBg="bg-slate-700/50 text-slate-300"
            />
            <StatCard
              icon={Target}
              label="Form Accuracy"
              value={exerciseStats?.accuracy ? `${Math.round(exerciseStats.accuracy)}%` : '—'}
              borderClass="border-t-4 border-t-emerald-500"
              iconBg="bg-emerald-500/10 text-emerald-400"
            />
            <StatCard
              icon={Flame}
              label="Calories Burned"
              value={exerciseStats?.calories_burned ?? '—'}
              unit="kcal"
              borderClass="border-t-4 border-t-orange-500"
              iconBg="bg-orange-500/10 text-orange-400"
            />
            <StatCard
              icon={Timer}
              label="Active Duration"
              value={formatTime(sessionTime)}
              borderClass="border-t-4 border-t-slate-500"
              iconBg="bg-slate-700/50 text-slate-300"
            />
          </div>

          {/* Form Feedback */}
          {exerciseStats?.form_feedback && (
            <motion.div
              key={exerciseStats.form_feedback}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-2xl p-4.5 border text-xs sm:text-sm font-bold font-poppins shadow-sm ${
                exerciseStats.form_feedback.includes('✅') || exerciseStats.form_feedback.includes('Good') || exerciseStats.form_feedback.includes('Great')
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
              }`}
            >
              {exerciseStats.form_feedback}
            </motion.div>
          )}

          {/* Posture Data */}
          <PostureDisplay postureData={postureData} />

          {/* Average Accuracy */}
          {exerciseStats?.average_accuracy > 0 && (
            <div className="bg-[#1E293B]/40 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <Award size={20} className="text-orange-500" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-poppins">Session Avg Accuracy</p>
                <p className="text-white text-base font-black font-poppins mt-0.5">{exerciseStats.average_accuracy}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 justify-center mt-8 border-t border-slate-700/60 pt-6">
        {!isActive ? (
          <div className="relative">
            <div className="absolute inset-0 bg-orange-400 rounded-2xl blur-md opacity-35 pulse-ring" />
            <motion.button
              id="start-workout-btn"
              onClick={startWorkout}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary text-base px-10 py-4.5 relative z-10"
            >
              <Play size={20} />
              START WORKOUT STREAM
            </motion.button>
          </div>
        ) : (
          <motion.button
            id="stop-workout-btn"
            onClick={stopWorkout}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-danger text-base px-10 py-4.5"
          >
            <StopCircle size={20} />
            END ACTIVE SESSION
          </motion.button>
        )}
      </div>

      <p className="text-slate-500 text-[10px] text-center mt-4.5 font-bold uppercase tracking-wider leading-relaxed">
        🔒 Camera and video stream only trigger on start command • Joint pose analysis runs in local sandboxed environment
      </p>
    </motion.div>
  )
}
