/**
 * FitGENIE - Health Insights Charts
 * Recharts visualizations for BMI, calories, macros, and goal progress.
 */

import { motion } from 'framer-motion'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, Area, AreaChart, ReferenceLine
} from 'recharts'
import { BarChart2, TrendingUp, Target } from 'lucide-react'
import useFitnessStore from '../store/fitnessStore'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1E293B] p-3 rounded-2xl text-xs sm:text-sm shadow-premium border border-slate-700/60">
        <p className="text-white font-extrabold mb-1 font-poppins">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: <span className="font-black font-poppins">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

function CalorieBreakdownChart({ bmr, tdee, target }) {
  const data = [
    { name: 'BMR (Rest)', value: Math.round(bmr), fill: '#F97316' },
    { name: 'TDEE (Active)', value: Math.round(tdee), fill: '#94A3B8' },
    { name: 'Target Intake', value: Math.round(target), fill: '#22C55E' },
  ]

  return (
    <div>
      <h4 className="text-white font-extrabold text-xs uppercase tracking-wider font-poppins mb-4">Caloric Ratios Breakdown</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#CBD5E1', fontSize: 10, fontFamily: 'Poppins', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#CBD5E1', fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" name="Calories" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function MacroRadarChart({ protein, carbs, fats, calories }) {
  const proteinPct = Math.round((protein * 4 / calories) * 100)
  const carbsPct = Math.round((carbs * 4 / calories) * 100)
  const fatsPct = Math.round((fats * 9 / calories) * 100)

  const data = [
    { subject: 'Protein', value: proteinPct, fullMark: 50 },
    { subject: 'Carbs', value: carbsPct, fullMark: 60 },
    { subject: 'Fats', value: fatsPct, fullMark: 40 },
    { subject: 'Hydration', value: 75, fullMark: 100 },
    { subject: 'Fiber', value: 60, fullMark: 100 },
  ]

  return (
    <div>
      <h4 className="text-white font-extrabold text-xs uppercase tracking-wider font-poppins mb-4">Nutritional Balance Radar</h4>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#CBD5E1', fontSize: 10, fontFamily: 'Poppins', fontWeight: 600 }} />
          <Radar
            name="Macro Profile %"
            dataKey="value"
            stroke="#F97316"
            fill="#F97316"
            fillOpacity={0.12}
            strokeWidth={2.5}
          />
          <Tooltip
            contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, color: '#F8FAFC', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

function BMIProgressLine({ currentBMI, goal }) {
  const idealBMI = 22.0
  const weeklyChange = goal === 'weight_loss' ? -0.3 : goal === 'weight_gain' ? 0.2 : -0.1

  const projectedData = Array.from({ length: 13 }, (_, week) => ({
    week: week === 0 ? 'Now' : `W${week}`,
    bmi: Math.max(15, Math.min(40, Number((currentBMI + weeklyChange * week).toFixed(1)))),
    ideal: idealBMI
  }))

  return (
    <div>
      <h4 className="text-white font-extrabold text-xs uppercase tracking-wider font-poppins mb-4">Projected BMI Trajectory (12 Weeks)</h4>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={projectedData}>
          <defs>
            <linearGradient id="bmiProjectedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="week" tick={{ fill: '#CBD5E1', fontSize: 9, fontFamily: 'Poppins', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis domain={['auto', 'auto']} tick={{ fill: '#CBD5E1', fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, color: '#F8FAFC', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
          />
          <ReferenceLine y={idealBMI} stroke="#22C55E" strokeDasharray="5 5" label={{ value: 'Ideal Range', fill: '#22C55E', fontSize: 10, fontFamily: 'Poppins', fontWeight: 600 }} />
          <Area
            type="monotone"
            dataKey="bmi"
            name="Projected BMI"
            stroke="#F97316"
            fill="url(#bmiProjectedGrad)"
            strokeWidth={2.5}
            dot={{ fill: '#F97316', r: 3.5, strokeWidth: 1.5, stroke: '#1E293B' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function GoalProgressBars({ score, breakdown }) {
  const items = [
    { name: 'BMI Optimization Status', value: breakdown?.bmi_score || 0, max: 40, color: '#F97316' },
    { name: 'Activity Level Quotient', value: breakdown?.activity_score || 0, max: 30, color: '#F59E0B' },
    { name: 'Age Advantage Multiplier', value: breakdown?.age_score || 0, max: 15, color: '#94A3B8' },
    { name: 'Goal Compliance Bonus', value: breakdown?.goal_bonus || 0, max: 15, color: '#22C55E' },
  ]

  return (
    <div>
      <h4 className="text-white font-extrabold text-xs uppercase tracking-wider font-poppins mb-4">Milestone Progress Analytics</h4>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-xs mb-1.5 font-semibold">
              <span className="text-slate-400 font-poppins text-[10px] uppercase">{item.name}</span>
              <span className="font-extrabold text-white" style={{ color: item.color }}>{item.value} <span className="text-slate-400 font-normal text-[10px]">/ {item.max}</span></span>
            </div>
            <div className="h-2 rounded-full bg-[#334155] border border-slate-700/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / item.max) * 100}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
        <div className="pt-3.5 border-t border-slate-700 mt-5">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-white font-extrabold uppercase text-xs tracking-wider font-poppins">Composite Target Score</span>
            <span className="font-black text-lg text-orange-400 font-poppins">{score} / 100</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HealthInsights() {
  const { fitnessData, profile } = useFitnessStore()
  if (!fitnessData) return null

  const { bmi, bmr, calories, fitness_score } = fitnessData

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card border-top-slate bg-[#1E293B] border border-slate-700/60"
    >
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
            <BarChart2 size={20} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg tracking-tight font-poppins">Interactive Analytics</h3>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-poppins">AI Generated Health Indices</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow hover:border-orange-500/30">
          <CalorieBreakdownChart bmr={bmr.bmr} tdee={bmr.tdee} target={calories.target} />
        </div>

        <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow hover:border-orange-500/30">
          <MacroRadarChart
            protein={calories.protein_g}
            carbs={calories.carbs_g}
            fats={calories.fats_g}
            calories={calories.target}
          />
        </div>

        <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow hover:border-orange-500/30">
          <BMIProgressLine
            currentBMI={bmi.bmi}
            goal={profile.fitness_goal}
          />
        </div>

        <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow hover:border-orange-500/30">
          <GoalProgressBars
            score={fitness_score.score}
            breakdown={fitness_score.breakdown}
          />
        </div>
      </div>
    </motion.div>
  )
}
