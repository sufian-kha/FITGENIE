/**
 * FitGENIE - Progress Dashboard Component
 * Contains Fitness Score circular gauge, weight and BMI trends charts, 
 * daily goal completion indicators, recent workout history, and achievement badges.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, RadialBarChart, RadialBar,
  BarChart, Bar, LineChart, Line, Legend
} from 'recharts'
import { 
  Award, Flame, Droplets, Timer, History, 
  TrendingUp, Check, Target, Dumbbell, Calendar
} from 'lucide-react'
import useFitnessStore from '../store/fitnessStore'

function CircularFitnessScore({ score, rating, color }) {
  const resolvedColor = color === '#10b981' ? '#22c55e' : color
  const data = [{ value: score, fill: resolvedColor || '#F97316' }]

  return (
    <div className="relative w-40 h-40 mx-auto">
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

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <span className="text-4xl font-black font-poppins" style={{ color: resolvedColor }}>
            {score}
          </span>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-poppins mt-1">Score</p>
        </motion.div>
      </div>
    </div>
  )
}

export default function ProgressDashboard() {
  const { fitnessData, profile } = useFitnessStore()

  if (!fitnessData) return null

  const { fitness_score, calories, bmi } = fitnessData
  const { score, rating, rating_color } = fitness_score

  const resolvedRatingColor = rating_color === '#10b981' ? '#22c55e' : rating_color

  // Weight and BMI history trends (representing 6 weeks of user progress)
  const currentWeight = parseFloat(profile.weight) || 70
  const goal = profile?.fitness_goal || 'general_fitness'
  const isLoss = goal.includes('loss') || goal.includes('fat')
  const isGain = goal.includes('gain') || goal.includes('building')
  
  const weightTrendData = Array.from({ length: 6 }, (_, i) => {
    const change = isLoss ? -0.8 * i : isGain ? 0.5 * i : -0.1 * i
    const wt = currentWeight + change + (Math.random() * 0.4 - 0.2) // add minor noise
    const htM = (parseFloat(profile.height) || 175) / 100
    const calculatedBmi = wt / (htM * htM)
    return {
      week: `Wk ${i + 1}`,
      Weight: parseFloat(wt.toFixed(1)),
      BMI: parseFloat(calculatedBmi.toFixed(1))
    }
  })

  // Mock Workout Minutes Weekly (representing active workout minutes Monday to Sunday)
  const weeklyWorkoutMinutes = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 30 },
    { day: 'Wed', minutes: 60 },
    { day: 'Thu', minutes: 0 },
    { day: 'Fri', minutes: 50 },
    { day: 'Sat', minutes: 75 },
    { day: 'Sun', minutes: 20 },
  ]

  // Mock Calorie Intake vs Target Progression (7 days)
  const calorieTrackingData = [
    { day: 'Day 1', consumed: 2100, target: calories.target },
    { day: 'Day 2', consumed: 2250, target: calories.target },
    { day: 'Day 3', consumed: 1950, target: calories.target },
    { day: 'Day 4', consumed: 2050, target: calories.target },
    { day: 'Day 5', consumed: 2300, target: calories.target },
    { day: 'Day 6', consumed: 1850, target: calories.target },
    { day: 'Day 7', consumed: 2150, target: calories.target },
  ]

  // Mock Workout History
  const recentWorkouts = [
    { id: 1, name: '🏋️ Squats Session', date: 'Yesterday', reps: 42, accuracy: 92, calories: 120 },
    { id: 2, name: '💪 Push-Ups Session', date: '3 days ago', reps: 30, accuracy: 88, calories: 95 },
    { id: 3, name: '🧘 Core Plank Challenge', date: '5 days ago', duration: '180s', accuracy: 90, calories: 60 },
  ]

  // Mock Achievements
  const achievements = [
    { title: 'First Steps', desc: 'Complete physical fitness assessment', unlocked: true, date: 'Today' },
    { title: 'Form Master', desc: 'Reach over 90% posture accuracy', unlocked: true, date: 'Yesterday' },
    { title: 'Calorie Shredder', desc: 'Burn 500+ total calories in workouts', unlocked: true, date: '3 days ago' },
    { title: 'Plank Veteran', desc: 'Hold a solid plank for 2+ minutes', unlocked: false },
    { title: 'Perfect Streak', desc: 'Complete 5 consecutive workout days', unlocked: false },
  ]

  // Daily goals status
  const dailyGoals = [
    { label: 'Daily Calories', current: Math.round(calories.target * 0.8), target: calories.target, unit: 'kcal', icon: Flame, color: 'text-orange-400', iconBg: 'bg-orange-500/10', progressColor: '#f97316' },
    { label: 'Water Hydration', current: 1750, target: calories.water_ml || 2500, unit: 'ml', icon: Droplets, color: 'text-blue-400', iconBg: 'bg-blue-500/10', progressColor: '#3b82f6' },
    { label: 'Active Workout', current: 35, target: 45, unit: 'min', icon: Timer, color: 'text-emerald-400', iconBg: 'bg-emerald-500/10', progressColor: '#22c55e' }
  ]

  return (
    <div className="space-y-8">
      {/* Overview Cards (Row 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Fitness Score Widget */}
        <div className="premium-card border-top-accent lg:col-span-4 flex flex-col justify-between items-center text-center bg-[#1E293B] border border-slate-700/60">
          <div className="w-full flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
            <span className="text-white font-extrabold text-xs uppercase tracking-wider font-poppins">Fitness Score Index</span>
            <span 
              className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-poppins"
              style={{ color: resolvedRatingColor, backgroundColor: `${resolvedRatingColor}12`, border: `1px solid ${resolvedRatingColor}25` }}
            >
              {rating}
            </span>
          </div>

          <CircularFitnessScore score={score} rating={rating} color={resolvedRatingColor} />
          
          <div className="mt-4 text-xs text-slate-300 leading-relaxed font-semibold max-w-[220px]">
            Your rating is <span className="font-black" style={{ color: resolvedRatingColor }}>{rating}</span>. Train consistently to boost your biometrics score!
          </div>
        </div>

        {/* Daily Goal Trackers */}
        <div className="premium-card border-top-slate lg:col-span-8 space-y-6 bg-[#1E293B] border border-slate-700/60">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider font-poppins">Daily Targets Progress</h3>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-poppins">Resets Daily</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {dailyGoals.map((goal) => {
              const Icon = goal.icon
              const pct = Math.min(100, Math.round((goal.current / goal.target) * 100))
              return (
                <div key={goal.label} className="bg-[#1E293B]/40 border border-slate-700/60 rounded-2xl p-4.5 flex flex-col justify-between shadow-sm hover:border-orange-500/30 hover:translate-y-[-2px] transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${goal.iconBg}`}>
                      <Icon size={16} className={goal.color} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-black tracking-wider font-poppins">{goal.label}</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white font-poppins">{goal.current}</span>
                    <span className="text-slate-400 text-xs ml-1 font-semibold">/ {goal.target} {goal.unit}</span>
                  </div>
                  {/* Progress Line */}
                  <div className="mt-4">
                    <div className="h-1.5 rounded-full bg-[#334155] overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: goal.progressColor }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1.5 block text-right font-black font-poppins">{pct}% completed</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Analytics Charts (Row 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weight Trend Chart */}
        <div className="premium-card border-top-accent bg-[#1E293B] border border-slate-700/60">
          <div className="flex items-center justify-between mb-6 border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="text-orange-500" size={18} />
              <h3 className="text-white font-extrabold text-sm uppercase tracking-wider font-poppins">Weight Progression</h3>
            </div>
            <span className="badge badge-green">Target: {isLoss ? 'Loss' : isGain ? 'Gain' : 'Maintain'}</span>
          </div>
          
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightTrendData}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: '#CBD5E1', fontSize: 10, fontFamily: 'Poppins', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#CBD5E1', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '16px', color: '#F8FAFC', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Weight" 
                  name="Weight (kg)"
                  stroke="#F97316" 
                  fillOpacity={1} 
                  fill="url(#weightGrad)" 
                  strokeWidth={2.5}
                  dot={{ r: 4, stroke: '#F97316', strokeWidth: 1.5, fill: '#1E293B' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BMI Trend Chart */}
        <div className="premium-card border-top-slate bg-[#1E293B] border border-slate-700/60">
          <div className="flex items-center justify-between mb-6 border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2.5">
              <Target className="text-orange-500" size={18} />
              <h3 className="text-white font-extrabold text-sm uppercase tracking-wider font-poppins">BMI Optimization Index</h3>
            </div>
            <span className="badge badge-purple">Current: {bmi.bmi}</span>
          </div>
          
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightTrendData}>
                <defs>
                  <linearGradient id="bmiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: '#CBD5E1', fontSize: 10, fontFamily: 'Poppins', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#CBD5E1', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '16px', color: '#F8FAFC', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="BMI" 
                  stroke="#F59E0B" 
                  fillOpacity={1} 
                  fill="url(#bmiGrad)" 
                  strokeWidth={2.5}
                  dot={{ r: 4, stroke: '#F59E0B', strokeWidth: 1.5, fill: '#1E293B' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* NEW: Weekly Workouts Bar Chart & Calorie Intake Line Chart (Row 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Workout minutes Bar Chart */}
        <div className="premium-card border-top-lime bg-[#1E293B] border border-slate-700/60">
          <div className="flex items-center justify-between mb-6 border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2.5">
              <Dumbbell className="text-orange-500" size={18} />
              <h3 className="text-white font-extrabold text-sm uppercase tracking-wider font-poppins">Weekly Active Workout Minutes</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-black uppercase font-poppins">Goal: 150+ Min</span>
          </div>
          
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyWorkoutMinutes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#CBD5E1', fontSize: 10, fontFamily: 'Poppins', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#CBD5E1', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '16px', color: '#F8FAFC', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                  formatter={(value) => [`${value} minutes`]}
                />
                <Bar dataKey="minutes" fill="#F97316" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calorie Intake vs Target Line Chart */}
        <div className="premium-card border-top-accent bg-[#1E293B] border border-slate-700/60">
          <div className="flex items-center justify-between mb-6 border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2.5">
              <Calendar className="text-orange-500" size={18} />
              <h3 className="text-white font-extrabold text-sm uppercase tracking-wider font-poppins">Daily Calories Consumed vs Target</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-black uppercase font-poppins">7-Day History</span>
          </div>
          
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calorieTrackingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#CBD5E1', fontSize: 10, fontFamily: 'Poppins', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#CBD5E1', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '16px', color: '#F8FAFC', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'Poppins', fontWeight: 600, color: '#F8FAFC' }} />
                <Line type="monotone" dataKey="consumed" name="Consumed kcal" stroke="#F97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="target" name="Target kcal" stroke="#475569" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* History & Badges (Row 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Workout Logs */}
        <div className="premium-card border-top-slate bg-[#1E293B] border border-slate-700/60">
          <div className="flex items-center gap-2.5 mb-5 border-b border-slate-700/60 pb-3">
            <History className="text-slate-400" size={18} />
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider font-poppins">Recent Workout Logs</h3>
          </div>
          
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-4 bg-[#1E293B]/40 border border-slate-700/60 rounded-2xl hover:border-orange-500/30 hover:translate-y-[-2px] transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center flex-shrink-0">
                    <Dumbbell size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-white font-poppins">{workout.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-poppins mt-0.5">{workout.date} • {workout.reps || workout.duration} completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="badge badge-green">
                    {workout.accuracy}% Acc
                  </span>
                  <p className="text-xs text-slate-300 font-extrabold font-poppins mt-2">+{workout.calories} kcal</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="premium-card border-top-accent bg-[#1E293B] border border-slate-700/60">
          <div className="flex items-center gap-2.5 mb-5 border-b border-slate-700/60 pb-3">
            <Award className="text-orange-500" size={18} />
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider font-poppins">Milestones & Achievements</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {achievements.map((item, i) => (
              <div 
                key={i} 
                className={`p-4 border rounded-2xl flex items-start gap-3.5 transition-all shadow-sm ${
                  item.unlocked 
                    ? 'bg-orange-500/5 border-orange-500/20' 
                    : 'bg-[#1E293B]/40 border border-slate-700/40 opacity-50'
                }`}
              >
                <div className={`p-2 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  item.unlocked ? 'bg-orange-500 text-white border border-orange-400 shadow-sm' : 'bg-[#334155] text-slate-500'
                }`}>
                  {item.unlocked ? <Check size={14} strokeWidth={3} /> : <Award size={14} />}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white font-poppins">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">{item.desc}</p>
                  {item.unlocked && <span className="text-[9px] text-orange-400 font-black uppercase font-poppins block mt-1.5">Unlocked</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
