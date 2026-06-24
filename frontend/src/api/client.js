/**
 * FitGENIE - API Client
 * Axios-based API client with interceptors for all backend endpoints.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance with defaults
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'Request failed'
    console.error('API Error:', message)
    return Promise.reject(new Error(message))
  }
)

// ============================================================
// FITNESS ANALYSIS
// ============================================================

/** Analyze full fitness profile (BMI, BMR, score) */
export const analyzeFitness = (profile) =>
  api.post('/api/fitness/analyze', profile)

// ============================================================
// ML PREDICTIONS
// ============================================================

/** Run ML model prediction for workout/diet/fitness level */
export const getMLPrediction = (data) =>
  api.post('/api/ml/predict', data)

/** Check ML model status */
export const getMLStatus = () =>
  api.get('/api/ml/status')

/** Trigger model training */
export const trainModels = () =>
  api.post('/api/ml/train')

// ============================================================
// AI AGENT
// ============================================================

/** Get AI Agent comprehensive analysis */
export const getAIAnalysis = (data) =>
  api.post('/api/agent/analyze', data)

// ============================================================
// CHAT
// ============================================================

/** Send a chat message */
export const sendChatMessage = (message, history = [], userContext = null) =>
  api.post('/api/chat/message', {
    message,
    conversation_history: history,
    user_context: userContext
  })

// ============================================================
// WORKOUT PLAN
// ============================================================

/** Generate weekly workout plan */
export const getWorkoutPlan = (data) =>
  api.post('/api/workout/plan', data)

// ============================================================
// DIET PLAN
// ============================================================

/** Generate daily diet plan */
export const getDietPlan = (data) =>
  api.post('/api/diet/plan', data)

// ============================================================
// PDF REPORT
// ============================================================

/** Generate and download PDF report */
export const generatePDFReport = async (reportData) => {
  const response = await axios.post(`${BASE_URL}/api/report/generate`, reportData, {
    responseType: 'blob',
    timeout: 30000,
  })
  return response
}

// ============================================================
// HEALTH CHECK
// ============================================================

/** Check if backend is running */
export const healthCheck = () =>
  api.get('/health')

export default api
