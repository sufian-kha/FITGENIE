/**
 * FitGENIE - Global State Store (Zustand)
 * Manages user profile, fitness analysis results, and app state.
 */

import { create } from 'zustand'

const useFitnessStore = create((set, get) => ({
  // --- User Profile ---
  profile: {
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    activity_level: 'moderately_active',
    fitness_goal: 'general_fitness',
    diet_preference: 'non_vegetarian',
  },

  // --- Analysis Results ---
  fitnessData: null,        // BMI, BMR, calories, fitness score
  mlPredictions: null,      // ML model predictions
  aiAnalysis: null,         // Gemini AI insights
  workoutPlan: null,        // Weekly workout plan
  dietPlan: null,           // Daily meal plan

  // --- App State ---
  isAnalyzed: false,
  isLoading: false,
  loadingStep: '',
  error: null,

  // --- Chat State ---
  chatMessages: [
    {
      id: 1,
      role: 'assistant',
      content: '👋 Hi! I\'m FitGENIE, your personal AI fitness coach. Fill in your profile above and click "Analyze My Fitness" to get started, or ask me any fitness question right now!',
      timestamp: new Date().toISOString()
    }
  ],

  // --- Workout Session State ---
  isWorkoutActive: false,
  workoutStats: null,
  postureData: null,
  selectedExercise: 'squat',

  // --- Actions ---
  setProfile: (updates) => set((state) => ({
    profile: { ...state.profile, ...updates }
  })),

  setFitnessData: (data) => set({ fitnessData: data }),
  setMlPredictions: (data) => set({ mlPredictions: data }),
  setAiAnalysis: (data) => set({ aiAnalysis: data }),
  setWorkoutPlan: (data) => set({ workoutPlan: data }),
  setDietPlan: (data) => set({ dietPlan: data }),

  setLoading: (isLoading, step = '') => set({ isLoading, loadingStep: step }),
  setError: (error) => set({ error }),
  setIsAnalyzed: (val) => set({ isAnalyzed: val }),

  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...message
    }]
  })),

  clearChatMessages: () => set({
    chatMessages: [{
      id: 1,
      role: 'assistant',
      content: '👋 Chat cleared! Ask me anything about fitness, nutrition, or workouts.',
      timestamp: new Date().toISOString()
    }]
  }),

  setWorkoutActive: (active) => set({ isWorkoutActive: active }),
  setWorkoutStats: (stats) => set({ workoutStats: stats }),
  setPostureData: (data) => set({ postureData: data }),
  setSelectedExercise: (exercise) => set({ selectedExercise: exercise }),

  resetAll: () => set({
    fitnessData: null,
    mlPredictions: null,
    aiAnalysis: null,
    workoutPlan: null,
    dietPlan: null,
    isAnalyzed: false,
    error: null,
  }),
}))

export default useFitnessStore
