/**
 * FitGENIE - Workout Plan Component
 * Displays the weekly workout plan in modern card format.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Clock, Flame, ChevronDown, ChevronUp, CheckCircle2, Zap, BarChart } from 'lucide-react'
import useFitnessStore from '../store/fitnessStore'

const CATEGORY_COLORS = {
  'Cardio': { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', badge: 'badge-blue' },
  'Strength': { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', badge: 'badge-purple' },
  'HIIT': { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', badge: 'badge-red' },
  'Core': { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', badge: 'badge-blue' },
  'Flexibility': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'badge-green' },
}

function ExerciseRow({ exercise }) {
  const cat = CATEGORY_COLORS[exercise.category] || CATEGORY_COLORS['Cardio']
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-slate-700/60 last:border-0 gap-3"
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bg} border ${cat.border}`}>
          <Dumbbell size={16} className={cat.text} />
        </div>
        <div>
          <p className="text-white text-sm font-extrabold font-poppins">{exercise.name}</p>
          <p className="text-slate-400 text-xs font-semibold">{exercise.muscles}</p>
        </div>
      </div>
      <div className="flex items-center gap-6 justify-between sm:justify-end text-left sm:text-right">
        {exercise.sets && (
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-poppins">Sets × Reps</p>
            <p className="text-xs sm:text-sm font-black text-white font-poppins">{exercise.sets} × {exercise.reps || '—'}</p>
          </div>
        )}
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-poppins">Duration</p>
          <p className="text-xs sm:text-sm font-black text-emerald-400 font-poppins">{exercise.duration}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-poppins">Est. Burn</p>
          <p className="text-xs sm:text-sm font-black text-orange-400 font-poppins">{exercise.calories} kcal</p>
        </div>
      </div>
    </motion.div>
  )
}

function DayCard({ dayPlan, index }) {
  const [expanded, setExpanded] = useState(index === 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 bg-[#1E293B] ${
        dayPlan.is_rest ? 'opacity-70 bg-[#1E293B]/60' : 'hover:border-orange-500/30 hover:shadow-md'
      }`}
    >
      {/* Day Header */}
      <button
        className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-700/30 transition-colors"
        disabled={dayPlan.is_rest}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`text-3xl font-black font-poppins select-none ${dayPlan.is_rest ? 'text-slate-600' : 'text-orange-500 opacity-25'}`}>
            {String(index + 1).padStart(2, '0')}
          </div>
          <div>
            <p className="font-black text-sm sm:text-base font-poppins text-white">{dayPlan.day}</p>
            <p className={`text-xs sm:text-sm font-medium ${dayPlan.is_rest ? 'text-slate-400' : 'text-slate-300'}`}>
              {dayPlan.is_rest ? '🛌 Rest & Active Recovery' : dayPlan.type}
            </p>
          </div>
        </div>

        {!dayPlan.is_rest && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-bold tracking-wider font-poppins justify-end">
                <Clock size={11} />
                <span>{dayPlan.total_duration}</span>
              </div>
              <div className="flex items-center gap-1 text-orange-400 text-[10px] uppercase font-black font-poppins justify-end mt-0.5">
                <Flame size={11} className="text-orange-500" />
                <span>{dayPlan.total_calories} kcal</span>
              </div>
            </div>
            <div className="p-1.5 rounded-xl bg-[#334155] text-slate-400">
              {expanded ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </div>
          </div>
        )}
      </button>

      {/* Exercise List */}
      <AnimatePresence>
        {expanded && !dayPlan.is_rest && dayPlan.exercises?.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-slate-700/60 bg-[#1E293B]/30"
          >
            <div className="px-5 py-4">
              <div className="mb-4 flex items-center gap-2 bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full border border-orange-500/20 self-start w-fit">
                <BarChart size={12} className="text-orange-400" />
                <p className="text-orange-400 text-[10px] font-black uppercase font-poppins">Focus Group: {dayPlan.focus}</p>
              </div>
              <div className="space-y-1">
                {dayPlan.exercises.map((ex, i) => (
                  <ExerciseRow key={i} exercise={ex} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function WorkoutPlan() {
  const { workoutPlan } = useFitnessStore()
  if (!workoutPlan) return null

  const { weekly_plan, fitness_level, training_days_per_week, total_weekly_calories_burned, notes } = workoutPlan

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card border-top-accent bg-[#1E293B] border border-slate-700/60"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
            <Dumbbell size={20} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg tracking-tight font-poppins">Weekly Workout Split</h3>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-poppins">{fitness_level} Level • {training_days_per_week} Training Days / week</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-orange-500/10 text-orange-400 px-3.5 py-1.5 rounded-full border border-orange-500/20 font-poppins font-bold text-xs">
          <Flame size={14} className="text-orange-500" />
          <span>{total_weekly_calories_burned.toLocaleString()} kcal/week</span>
        </div>
      </div>

      {/* Day Cards */}
      <div className="space-y-4">
        {weekly_plan.map((day, index) => (
          <DayCard key={day.day} dayPlan={day} index={index} />
        ))}
      </div>

      {/* Notes */}
      {notes?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 border border-orange-500/20 bg-orange-500/5 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-orange-400" />
            <p className="text-orange-400 font-extrabold text-xs uppercase tracking-wider font-poppins">Important Training Directives</p>
          </div>
          <ul className="space-y-2">
            {notes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300 text-xs sm:text-sm font-semibold leading-relaxed">
                <CheckCircle2 size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  )
}
