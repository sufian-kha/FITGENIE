/**
 * FitGENIE - Fitness Score + ML Predictions
 * Circular score gauge and ML model prediction cards.
 */

import { motion } from 'framer-motion'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { Brain, Dumbbell, Salad, TrendingUp, CheckCircle, Award } from 'lucide-react'
import useFitnessStore from '../store/fitnessStore'

function CircularScore({ score, rating, ratingColor }) {
  // Use Orange 500 for rating color highlight in dark mode
  const activeColor = ratingColor === '#10b981' ? '#F97316' : ratingColor

  const data = [{ value: score, fill: activeColor }]

  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="75%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            background={{ fill: '#334155' }}
            dataKey="value"
            cornerRadius={12}
            max={100}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.3, damping: 10 }}
          className="text-center"
        >
          <motion.p
            className="text-5xl font-black font-poppins text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.p>
          <p className="text-slate-400 text-xs font-bold font-poppins mt-1">/ 100</p>
        </motion.div>
      </div>
    </div>
  )
}

function ScoreBreakdownBar({ label, value, max, color }) {
  const pct = (value / max) * 100
  // Adjust green to success green
  const barColor = color === '#10B981' ? '#F97316' : color === '#84CC16' ? '#22C55E' : color

  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5 font-semibold">
        <span className="text-slate-300 font-extrabold font-poppins uppercase tracking-wider text-[10px]">{label}</span>
        <span className="font-black text-sm text-white">{value} <span className="text-slate-400 font-normal text-[10px]">/ {max}</span></span>
      </div>
      <div className="h-2 rounded-full bg-[#334155] border border-slate-700/20 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
        />
      </div>
    </div>
  )
}

export function FitnessScore() {
  const { fitnessData } = useFitnessStore()
  if (!fitnessData) return null

  const { fitness_score } = fitnessData
  const { score, rating, rating_color, breakdown } = fitness_score

  const breakdownItems = [
    { label: 'BMI Optimization Factor', value: breakdown.bmi_score, max: 40, color: '#F97316' },
    { label: 'Exercise Activity Rating', value: breakdown.activity_score, max: 30, color: '#22C55E' },
    { label: 'Age Coefficient', value: breakdown.age_score, max: 15, color: '#CBD5E1' },
    { label: 'Goal Compliance Bonus', value: breakdown.goal_bonus, max: 15, color: '#EA580C' },
  ]

  const ratingColorResolved = rating_color === '#10b981' ? '#22c55e' : rating_color

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="premium-card border-top-accent bg-[#1E293B] border border-slate-700/60 flex flex-col justify-between h-full"
    >
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
            <Award size={20} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg tracking-tight font-poppins">Fitness Score</h3>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-poppins">AI Biometric Analysis</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Circular Score */}
        <div className="flex flex-col items-center">
          <CircularScore score={score} rating={rating} ratingColor={ratingColorResolved} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-center"
          >
            <span
              className="px-4.5 py-1.5 rounded-full text-xs font-black font-poppins uppercase tracking-wider"
              style={{ backgroundColor: `${ratingColorResolved}15`, color: ratingColorResolved, border: `1px solid ${ratingColorResolved}30` }}
            >
              {rating}
            </span>
            <p className="text-slate-400 text-xs mt-3.5 font-semibold">Overall Fitness Level</p>
          </motion.div>
        </div>

        {/* Score Breakdown */}
        <div className="flex-1 space-y-4 w-full">
          <h4 className="text-slate-300 font-extrabold text-xs uppercase tracking-widest font-poppins mb-4">Breakdown Indexes</h4>
          {breakdownItems.map((item) => (
            <ScoreBreakdownBar key={item.label} {...item} />
          ))}
          <div className="bg-[#334155]/20 border border-slate-700/60 rounded-2xl p-4 mt-6">
            <div className="flex items-start gap-2.5">
              <CheckCircle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 text-xs sm:text-sm font-semibold leading-relaxed">
                Your score is <span className="font-extrabold text-white font-poppins">{score} / 100</span>. Increase training frequency and optimize macro logs to cross the 85+ score mark.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================
// ML PREDICTIONS SECTION
// ============================================================
export function MLPredictions() {
  const { mlPredictions } = useFitnessStore()
  if (!mlPredictions) return null

  const { workout_category, diet_category, fitness_level } = mlPredictions

  const predCards = [
    {
      icon: Dumbbell,
      label: 'Suggested Workout Split',
      prediction: workout_category?.label || 'Mixed Training',
      confidence: workout_category?.confidence || 0,
      borderClass: 'border-t-4 border-t-slate-500',
      iconBg: 'bg-slate-700 text-slate-300',
      color: 'slate'
    },
    {
      icon: Salad,
      label: 'Macro Nutrition Category',
      prediction: diet_category?.label || 'Balanced',
      confidence: diet_category?.confidence || 0,
      borderClass: 'border-t-4 border-t-orange-500',
      iconBg: 'bg-orange-500/10 text-orange-500',
      color: 'orange'
    },
    {
      icon: TrendingUp,
      label: 'Calculated Experience',
      prediction: fitness_level?.label || 'Intermediate',
      confidence: fitness_level?.confidence || 0,
      borderClass: 'border-t-4 border-t-green-500',
      iconBg: 'bg-green-500/10 text-green-400',
      color: 'green'
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="premium-card border-top-slate bg-[#1E293B] border border-slate-700/60 flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700 text-slate-300 flex items-center justify-center font-bold">
              <Brain size={20} />
            </div>
            <div>
              <h3 className="text-white font-extrabold text-lg tracking-tight font-poppins">ML Model Classifications</h3>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-poppins">Neural Classifier Predictions</p>
            </div>
          </div>
          <span className="badge badge-green">Classifier Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {predCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className={`p-5 border border-slate-700/80 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 ${card.borderClass} bg-[#1E293B]`}
            >
              <div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg} mb-3.5`}>
                  <card.icon size={18} />
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-poppins mb-1">{card.label}</p>
                <h4 className="text-base font-black text-white font-poppins leading-tight mb-4">{card.prediction}</h4>
              </div>

              {/* Confidence Bar */}
              <div className="border-t border-slate-700/60 pt-3">
                <div className="flex justify-between text-[10px] mb-1 font-semibold">
                  <span className="text-slate-400 font-poppins uppercase">Match Confidence</span>
                  <span className="text-slate-300 font-poppins">{card.confidence.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#334155] overflow-hidden border border-slate-700/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${card.confidence}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 + i * 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
