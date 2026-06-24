/**
 * FitGENIE - User Assessment Form
 * Collects user profile data and triggers the full fitness analysis pipeline.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Ruler, Scale, Activity, Target, Leaf, Loader2, Zap, ChevronDown, Check } from 'lucide-react'
import useFitnessStore from '../store/fitnessStore'
import {
  analyzeFitness, getMLPrediction, getAIAnalysis,
  getWorkoutPlan, getDietPlan
} from '../api/client'

const FormSection = ({ title, icon: Icon, borderClass = 'border-top-accent', iconColorClass = 'bg-orange-500/10 text-orange-500', children }) => (
  <div className={`premium-card ${borderClass} bg-[#1E293B] border border-slate-700/60 flex flex-col justify-between h-full`}>
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${iconColorClass}`}>
          <Icon size={20} />
        </div>
        <h3 className="text-white font-extrabold text-base tracking-tight font-poppins">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  </div>
)

const SelectField = ({ label, id, value, onChange, options }) => (
  <div>
    <label className="form-label" htmlFor={id}>{label}</label>
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select w-full pr-10 bg-[#334155] text-white border border-slate-600/40"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#1E293B] text-white">{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
)

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: '🪑 Sedentary (desk job, no exercise)' },
  { value: 'lightly_active', label: '🚶 Lightly Active (1-3 days/week)' },
  { value: 'moderately_active', label: '🏃 Moderately Active (3-5 days/week)' },
  { value: 'very_active', label: '💪 Very Active (6-7 days/week)' },
  { value: 'athlete', label: '🏆 Athlete (2x/day training)' },
]

const GOAL_OPTIONS = [
  { value: 'weight_loss', label: '⬇️ Weight Loss' },
  { value: 'weight_gain', label: '⬆️ Weight Gain' },
  { value: 'muscle_building', label: '💪 Muscle Building' },
  { value: 'fat_loss', label: '🔥 Fat Loss' },
  { value: 'general_fitness', label: '✨ General Fitness' },
]

const DIET_OPTIONS = [
  { value: 'non_vegetarian', label: '🥩 Non-Vegetarian' },
  { value: 'vegetarian', label: '🥗 Vegetarian' },
  { value: 'vegan', label: '🌱 Vegan' },
]

const GENDER_OPTIONS = [
  { value: 'male', label: '♂️ Male' },
  { value: 'female', label: '♀️ Female' },
]

export default function UserAssessment() {
  const {
    profile, setProfile,
    setFitnessData, setMlPredictions, setAiAnalysis,
    setWorkoutPlan, setDietPlan,
    setLoading, setError, setIsAnalyzed,
    isLoading, loadingStep, error
  } = useFitnessStore()

  const [localErrors, setLocalErrors] = useState({})

  const validate = () => {
    const errors = {}
    if (!profile.age || profile.age < 10 || profile.age > 100)
      errors.age = 'Age must be 10-100'
    if (!profile.height || profile.height < 100 || profile.height > 250)
      errors.height = 'Height must be 100-250 cm'
    if (!profile.weight || profile.weight < 30 || profile.weight > 300)
      errors.weight = 'Weight must be 30-300 kg'
    setLocalErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAnalyze = async () => {
    if (!validate()) return

    setError(null)
    setLoading(true, 'Calculating BMI, BMR & Fitness Score...')

    try {
      // Step 1: Core fitness analysis
      const profilePayload = {
        age: parseInt(profile.age),
        gender: profile.gender,
        height: parseFloat(profile.height),
        weight: parseFloat(profile.weight),
        activity_level: profile.activity_level,
        fitness_goal: profile.fitness_goal,
        diet_preference: profile.diet_preference,
      }

      const fitnessResult = await analyzeFitness(profilePayload)
      setFitnessData(fitnessResult)

      // Step 2: ML Predictions
      setLoading(true, 'Running Machine Learning Models...')
      const mlPayload = {
        bmi: fitnessResult.bmi.bmi,
        age: parseInt(profile.age),
        gender: profile.gender,
        activity_level: profile.activity_level,
        fitness_goal: profile.fitness_goal,
      }
      const mlResult = await getMLPrediction(mlPayload)
      setMlPredictions(mlResult)

      // Step 3: AI Agent Analysis
      setLoading(true, 'Activating FitGENIE AI Agent...')
      const aiPayload = {
        ...profilePayload,
        bmi: fitnessResult.bmi.bmi,
        bmi_category: fitnessResult.bmi.category,
        bmr: fitnessResult.bmr.bmr,
        tdee: fitnessResult.bmr.tdee,
        target_calories: fitnessResult.calories.target,
        fitness_score: fitnessResult.fitness_score.score,
        ml_workout: mlResult.workout_category?.label || 'Mixed Training',
        ml_diet: mlResult.diet_category?.label || 'Balanced',
        ml_fitness_level: mlResult.fitness_level?.label || 'Intermediate',
      }
      const aiResult = await getAIAnalysis(aiPayload)
      setAiAnalysis(aiResult.analysis)

      // Step 4: Workout Plan
      setLoading(true, 'Generating Personalized Workout Plan...')
      const workoutResult = await getWorkoutPlan({
        fitness_goal: profile.fitness_goal,
        fitness_level: mlResult.fitness_level?.label || 'Intermediate',
        workout_category: mlResult.workout_category?.label || 'Mixed Training',
        activity_level: profile.activity_level,
      })
      setWorkoutPlan(workoutResult)

      // Step 5: Diet Plan
      setLoading(true, 'Creating Your Nutrition Plan...')
      const dietResult = await getDietPlan({
        fitness_goal: profile.fitness_goal,
        diet_preference: profile.diet_preference,
        target_calories: fitnessResult.calories.target,
        protein_g: fitnessResult.calories.protein_g,
        carbs_g: fitnessResult.calories.carbs_g,
        fats_g: fitnessResult.calories.fats_g,
      })
      setDietPlan(dietResult)

      setIsAnalyzed(true)
      setLoading(false)

      // Scroll to recommendations
      setTimeout(() => {
        document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' })
      }, 300)

    } catch (err) {
      setError(err.message || 'Analysis failed. Is the backend running?')
      setLoading(false)
    }
  }

  return (
    <section className="py-2">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 px-4 py-1.5 rounded-full mb-3 border border-orange-500/20">
          <User size={16} className="text-orange-500" />
          <span className="text-orange-400 text-xs font-bold font-poppins uppercase tracking-wider">Step 1: Your Profile</span>
        </div>
        <h2 className="text-3xl font-black text-white mb-2 font-poppins">Personal Assessment</h2>
        <p className="text-slate-300 text-sm font-medium">Enter your details to receive a fully personalized AI fitness analysis</p>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* Basic Info */}
        <FormSection 
          title="Basic Information" 
          icon={User} 
          borderClass="border-top-accent" 
          iconColorClass="bg-orange-500/10 text-orange-500"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label" htmlFor="age">Age (years)</label>
              <input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ age: e.target.value })}
                placeholder="25"
                min="10" max="100"
                className={`form-input bg-[#334155] border-slate-600/40 text-white ${localErrors.age ? 'border-red-500' : ''}`}
              />
              {localErrors.age && <p className="text-red-400 text-xs mt-1 font-bold">{localErrors.age}</p>}
            </div>
            <SelectField
              label="Gender"
              id="gender"
              value={profile.gender}
              onChange={(v) => setProfile({ gender: v })}
              options={GENDER_OPTIONS}
            />
          </div>
        </FormSection>

        {/* Physical Stats */}
        <FormSection 
          title="Physical Statistics" 
          icon={Ruler} 
          borderClass="border-top-slate" 
          iconColorClass="bg-slate-700/50 text-slate-300"
        >
          <div className="space-y-4">
            <div>
              <label className="form-label" htmlFor="height">Height (cm)</label>
              <input
                id="height"
                type="number"
                value={profile.height}
                onChange={(e) => setProfile({ height: e.target.value })}
                placeholder="175"
                min="100" max="250"
                className={`form-input bg-[#334155] border-slate-600/40 text-white ${localErrors.height ? 'border-red-500' : ''}`}
              />
              {localErrors.height && <p className="text-red-400 text-xs mt-1 font-bold">{localErrors.height}</p>}
            </div>
            <div>
              <label className="form-label" htmlFor="weight">Weight (kg)</label>
              <input
                id="weight"
                type="number"
                value={profile.weight}
                onChange={(e) => setProfile({ weight: e.target.value })}
                placeholder="70"
                min="30" max="300"
                className={`form-input bg-[#334155] border-slate-600/40 text-white ${localErrors.weight ? 'border-red-500' : ''}`}
              />
              {localErrors.weight && <p className="text-red-400 text-xs mt-1 font-bold">{localErrors.weight}</p>}
            </div>
          </div>
        </FormSection>

        {/* Fitness Profile */}
        <FormSection 
          title="Fitness Preferences" 
          icon={Target} 
          borderClass="border-top-lime" 
          iconColorClass="bg-green-500/10 text-green-400"
        >
          <div className="space-y-4">
            <SelectField
              label="Activity Level"
              id="activity_level"
              value={profile.activity_level}
              onChange={(v) => setProfile({ activity_level: v })}
              options={ACTIVITY_OPTIONS}
            />
            <SelectField
              label="Fitness Goal"
              id="fitness_goal"
              value={profile.fitness_goal}
              onChange={(v) => setProfile({ fitness_goal: v })}
              options={GOAL_OPTIONS}
            />
            <SelectField
              label="Diet Preference"
              id="diet_preference"
              value={profile.diet_preference}
              onChange={(v) => setProfile({ diet_preference: v })}
              options={DIET_OPTIONS}
            />
          </div>
        </FormSection>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-semibold flex items-center gap-2 max-w-xl mx-auto"
        >
          <span>⚠️ {error}</span>
        </motion.div>
      )}

      {/* Analyze Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-10 flex flex-col items-center gap-4"
      >
        <div className={!isLoading ? 'relative' : ''}>
          {!isLoading && (
            <div className="absolute inset-0 bg-orange-500 rounded-2xl blur-md opacity-35 pulse-ring" />
          )}
          <motion.button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className="btn-primary text-base px-10 py-4.5 disabled:opacity-60 disabled:cursor-not-allowed relative z-10"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {loadingStep || 'Analyzing...'}
              </>
            ) : (
              <>
                <Zap size={18} />
                ANALYZE PROFILE
              </>
            )}
          </motion.button>
        </div>

        {isLoading && (
          <div className="w-full max-w-sm mt-2">
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #f97316, #f59e0b)' }}
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 15, ease: 'easeInOut' }}
              />
            </div>
            <p className="text-slate-400 text-xs text-center mt-2.5 font-bold font-poppins">{loadingStep}</p>
          </div>
        )}

        <p className="text-slate-500 text-[10px] text-center max-w-xs font-bold uppercase tracking-wider leading-relaxed mt-1">
          🔒 Your data is processed instantly and never stored on remote servers.
        </p>
      </motion.div>
    </section>
  )
}
