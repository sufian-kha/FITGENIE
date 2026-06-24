/**
 * FitGENIE - BMI & BMR Display Components
 * Animated gauge chart for BMI, cards for BMR and calorie targets.
 */

import { motion } from 'framer-motion'
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Activity, Flame, Scale, TrendingUp, Zap, Target, Award } from 'lucide-react'
import useFitnessStore from '../store/fitnessStore'

// ============================================================
// BMI GAUGE
// ============================================================

const BMI_ZONES = [
  { name: 'Underweight', min: 0, max: 18.5, color: '#f59e0b' },
  { name: 'Normal', min: 18.5, max: 25, color: '#22c55e' },
  { name: 'Overweight', min: 25, max: 30, color: '#f97316' },
  { name: 'Obese', min: 30, max: 40, color: '#ef4444' },
]

function BMIGauge({ bmi, category, status, color }) {
  // Convert BMI to gauge percentage (scale 15-40 → 0-100)
  const gaugeValue = Math.min(Math.max(((bmi - 15) / 25) * 100, 0), 100)

  // Use orange accents for active highlights in dark mode
  const gaugeColor = color === '#10b981' ? '#22c55e' : color

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-52 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="75%"
            outerRadius="100%"
            data={[{ value: gaugeValue, fill: gaugeColor }]}
            startAngle={210}
            endAngle={-30}
          >
            <RadialBar
              background={{ fill: '#334155' }}
              dataKey="value"
              cornerRadius={12}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="text-center"
          >
            <p className="text-4xl font-black text-white font-poppins">{bmi}</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-poppins mt-1">BMI Score</p>
          </motion.div>
        </div>
      </div>

      {/* Category Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-2 text-center"
      >
        <span
          className="px-4.5 py-1.5 rounded-full text-xs font-bold font-poppins uppercase tracking-wider"
          style={{ backgroundColor: `${gaugeColor}15`, color: gaugeColor, border: `1px solid ${gaugeColor}30` }}
        >
          {category}
        </span>
        <p className="text-slate-300 text-xs mt-3.5 max-w-[200px] leading-relaxed font-semibold">{status}</p>
      </motion.div>

      {/* BMI Scale Legend */}
      <div className="mt-6 flex gap-3 flex-wrap justify-center border-t border-slate-700/60 pt-4 w-full">
        {BMI_ZONES.map(zone => (
          <div key={zone.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border border-slate-900 shadow-sm" style={{ backgroundColor: zone.color }} />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-poppins">{zone.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// CALORIE MACRO CHART
// ============================================================
function MacroDonutChart({ protein, carbs, fats }) {
  const data = [
    { name: 'Protein', value: protein * 4, g: protein, color: '#F97316' },     /* Orange 500 */
    { name: 'Carbohydrates', value: carbs * 4, g: carbs, color: '#22C55E' },  /* Green 500 */
    { name: 'Healthy Fats', value: fats * 9, g: fats, color: '#94A3B8' },     /* Slate 400 */
  ]
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      <div className="w-32 h-32 flex-shrink-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={4}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [`${props.payload.g}g (${Math.round(props.payload.value / total * 100)}%)`, props.payload.name]}
              contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, color: '#F8FAFC', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-black text-white font-poppins">Macros</span>
        </div>
      </div>
      <div className="space-y-4.5 flex-1 w-full">
        {data.map(d => (
          <div key={d.name}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-extrabold font-poppins text-[11px] uppercase tracking-wider">{d.name}</span>
              <span className="font-black text-sm" style={{ color: d.color }}>{d.g}g <span className="text-[10px] text-slate-400 font-normal">({Math.round((d.value / total) * 100)}%)</span></span>
            </div>
            <div className="h-2 rounded-full bg-[#334155] border border-slate-700/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: d.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(d.value / total) * 100}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// MAIN BMI ANALYSIS SECTION
// ============================================================
export function BMIAnalysis() {
  const { fitnessData } = useFitnessStore()
  if (!fitnessData) return null

  const { bmi } = fitnessData

  // Match colors to success green
  const statusColor = bmi.color === '#10b981' ? '#22c55e' : bmi.color

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card border-top-accent bg-[#1E293B] border border-slate-700/60 flex flex-col justify-between h-full"
    >
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
            <Scale size={20} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg tracking-tight font-poppins">BMI Assessment</h3>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-poppins">Body Mass Index</p>
          </div>
        </div>
        <span className="badge badge-green">Target: 18.5 - 24.9</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <BMIGauge
          bmi={bmi.bmi}
          category={bmi.category}
          status={bmi.status}
          color={statusColor}
        />

        <div className="space-y-4 w-full">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4 flex flex-col justify-between">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-poppins mb-1">Your BMI</p>
              <p className="text-2xl lg:text-3xl font-black text-orange-500 font-poppins">{bmi.bmi}</p>
            </div>
            <div className="bg-slate-700/30 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-poppins mb-1">Category</p>
              <p className="text-sm lg:text-base font-bold text-white font-poppins truncate" style={{ color: statusColor }}>{bmi.category}</p>
            </div>
          </div>

          <div className="bg-slate-700/30 border border-slate-700/60 rounded-2xl p-4">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-poppins mb-1.5">Health Summary</p>
            <p className="text-slate-300 text-xs sm:text-sm font-semibold leading-relaxed">{bmi.status}</p>
          </div>

          <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-poppins mb-0.5">Ideal Target Range</p>
              <p className="text-orange-400 text-xs sm:text-sm font-black font-poppins">{bmi.healthy_range}</p>
            </div>
            <div className="p-2 rounded-lg bg-orange-500 text-white shadow-sm">
              <Award size={16} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================
// BMR & CALORIE SECTION
// ============================================================
export function BMRAnalysis() {
  const { fitnessData } = useFitnessStore()
  if (!fitnessData) return null

  const { bmr, calories } = fitnessData

  const metricCards = [
    {
      icon: Flame,
      label: 'BMR (Resting energy)',
      value: `${bmr?.bmr?.toLocaleString() ?? '0'}`,
      unit: 'kcal',
      desc: 'Energy spent at complete rest',
      borderClass: 'border-t-4 border-t-orange-500',
      color: 'text-orange-500',
      iconBg: 'bg-orange-500/10 text-orange-500',
      bg: 'bg-[#1E293B]'
    },
    {
      icon: Activity,
      label: 'TDEE (Daily expenditure)',
      value: `${bmr?.tdee?.toLocaleString() ?? '0'}`,
      unit: 'kcal',
      desc: 'Energy spent with exercise activities',
      borderClass: 'border-t-4 border-t-slate-500',
      color: 'text-slate-300',
      iconBg: 'bg-slate-700 text-slate-300',
      bg: 'bg-[#1E293B]'
    },
    {
      icon: Target,
      label: 'Target Daily Calories',
      value: `${calories?.target?.toLocaleString() ?? '0'}`,
      unit: 'kcal',
      desc: `Goal adjustment: ${calories?.adjustment > 0 ? '+' : ''}${calories?.adjustment ?? 0} kcal`,
      borderClass: 'border-t-4 border-t-green-500',
      color: 'text-orange-500 font-extrabold',
      iconBg: 'bg-green-500/10 text-green-400',
      bg: 'bg-[#1E293B]'
    },
    {
      icon: TrendingUp,
      label: 'Multiplier Index',
      value: `×${bmr?.activity_multiplier ?? '1.0'}`,
      unit: '',
      desc: 'Based on exercise levels',
      borderClass: 'border-t-4 border-t-orange-500',
      color: 'text-slate-300',
      iconBg: 'bg-orange-500/10 text-orange-500',
      bg: 'bg-[#1E293B]'
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="premium-card border-top-slate bg-[#1E293B] border border-slate-700/60 flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700 text-slate-300 flex items-center justify-center font-bold">
              <Flame size={20} />
            </div>
            <div>
              <h3 className="text-white font-extrabold text-lg tracking-tight font-poppins">BMR & Energy Targets</h3>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-poppins">Mifflin-St Jeor Formula</p>
            </div>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metricCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`p-4 border border-slate-700 rounded-2xl shadow-sm flex flex-col justify-between ${card.borderClass} ${card.bg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <card.icon size={16} />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-poppins mb-1.5">{card.label}</p>
                <div className="flex items-baseline flex-wrap gap-0.5">
                  <span className={`text-xl font-black ${card.color} font-poppins`}>{card.value}</span>
                  {card.unit && <span className="text-[10px] text-slate-400 font-bold ml-0.5">{card.unit}</span>}
                </div>
                <p className="text-[9px] text-slate-400 mt-2 font-semibold leading-normal">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Macro Breakdown */}
        <div className="bg-[#334155]/20 border border-slate-700/60 rounded-2xl p-5.5 shadow-sm">
          <div className="flex items-center gap-2 mb-4.5">
            <Zap size={18} className="text-orange-500" />
            <h3 className="text-white font-extrabold text-sm font-poppins">Daily Nutrition Plan Targets</h3>
          </div>
          <MacroDonutChart
            protein={calories.protein_g}
            carbs={calories.carbs_g}
            fats={calories.fats_g}
          />
        </div>
      </div>
    </motion.div>
  )
}
