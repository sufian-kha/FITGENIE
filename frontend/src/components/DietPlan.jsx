/**
 * FitGENIE - Diet Plan Component
 * Displays personalized meal plan cards with macro breakdowns.
 */

import { motion } from 'framer-motion'
import { Salad, Clock, Flame, Droplets, Pill, ChevronRight } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import useFitnessStore from '../store/fitnessStore'

const MEAL_CONFIG = {
  breakfast: { emoji: '🌅', label: 'Breakfast', color: 'text-amber-400', borderClass: 'border-t-4 border-t-amber-500', iconBg: 'bg-amber-500/10 text-amber-400' },
  morning_snack: { emoji: '🍎', label: 'Morning Snack', color: 'text-emerald-400', borderClass: 'border-t-4 border-t-emerald-500', iconBg: 'bg-emerald-500/10 text-emerald-400' },
  lunch: { emoji: '☀️', label: 'Lunch', color: 'text-orange-400', borderClass: 'border-t-4 border-t-orange-500', iconBg: 'bg-orange-500/10 text-orange-400' },
  evening_snack: { emoji: '🫐', label: 'Evening Snack', color: 'text-indigo-400', borderClass: 'border-t-4 border-t-indigo-500', iconBg: 'bg-indigo-500/10 text-indigo-400' },
  dinner: { emoji: '🌙', label: 'Dinner', color: 'text-blue-400', borderClass: 'border-t-4 border-t-blue-500', iconBg: 'bg-blue-500/10 text-blue-400' },
}

function MealCard({ mealKey, meal, index }) {
  const config = MEAL_CONFIG[mealKey] || MEAL_CONFIG.breakfast

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`p-5 border border-slate-700/60 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 ${config.borderClass} bg-[#1E293B] hover:translate-y-[-2px] hover:border-orange-500/30`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${config.iconBg}`}>
              <span className="text-base">{config.emoji}</span>
            </div>
            <div>
              <p className={`font-black text-xs uppercase tracking-wider font-poppins ${config.color}`}>{config.label}</p>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock size={11} />
                <span className="text-[10px] font-bold font-poppins">{meal.meal_time}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-lg font-black font-poppins ${config.color}`}>{meal.calories}</p>
            <p className="text-slate-400 text-[9px] uppercase font-bold tracking-wider font-poppins">kcal</p>
          </div>
        </div>

        {/* Meal Name */}
        <p className="text-white font-extrabold text-sm mb-4 leading-normal font-poppins">{meal.name}</p>

        {/* Macro Bars */}
        <div className="space-y-3 mb-5">
          {[
            { name: 'Protein', g: meal.protein, color: '#F97316', cal: meal.protein * 4 },
            { name: 'Carbohydrates', g: meal.carbs, color: '#22C55E', cal: meal.carbs * 4 },
            { name: 'Healthy Fats', g: meal.fats, color: '#94A3B8', cal: meal.fats * 9 },
          ].map((macro) => (
            <div key={macro.name}>
              <div className="flex justify-between text-[10px] mb-1 font-semibold">
                <span className="text-slate-400 font-poppins uppercase">{macro.name}</span>
                <span className="font-extrabold text-slate-300">{macro.g}g</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#334155] border border-slate-700/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: macro.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((macro.cal / meal.calories) * 100, 100)}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 + index * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        {/* Ingredients */}
        {meal.ingredients?.length > 0 && (
          <div className="border-t border-slate-700/60 pt-3">
            <p className="text-slate-400 text-[9px] font-bold mb-2 uppercase tracking-wider font-poppins">Recommended Ingredients</p>
            <div className="flex flex-wrap gap-1">
              {meal.ingredients.map((ing, i) => (
                <span key={i} className="bg-[#334155]/40 border border-slate-700/60 px-2 py-0.5 rounded-lg text-[10px] text-slate-200 font-bold font-poppins">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Prep Time */}
        {meal.prep && (
          <div className="mt-3 flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider font-poppins">
            <Clock size={11} className="text-slate-400" />
            <span>Prep Time: {meal.prep}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function MacroSummaryChart({ totals, targets }) {
  const data = [
    { name: 'Protein', consumed: totals.protein_g, target: targets.protein_g, fill: '#F97316' },
    { name: 'Carbs', consumed: totals.carbs_g, target: targets.carbs_g, fill: '#22C55E' },
    { name: 'Fats', consumed: totals.fats_g, target: targets.fats_g, fill: '#94A3B8' },
  ]

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#CBD5E1', fontSize: 10, fontFamily: 'Poppins', fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#CBD5E1', fontSize: 9 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, color: '#F8FAFC', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
          formatter={(value) => [`${value}g`]}
        />
        <Bar dataKey="target" name="Target g" opacity={0.15} radius={[6, 6, 0, 0]}>
          {data.map(d => <Cell key={d.name} fill={d.fill} />)}
        </Bar>
        <Bar dataKey="consumed" name="Today g" radius={[6, 6, 0, 0]}>
          {data.map(d => <Cell key={d.name} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function DietPlan() {
  const { dietPlan } = useFitnessStore()
  if (!dietPlan) return null

  const { meals, daily_targets, daily_totals, nutrition_tips, supplements } = dietPlan
  const mealOrder = ['breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner']

  const calorieProgress = Math.min((daily_totals.calories / daily_targets.calories) * 100, 100)

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
            <Salad size={20} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg tracking-tight font-poppins">Daily Diet Plan</h3>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-poppins">
              {dietPlan.diet_preference?.replace(/_/g, ' ')} • {dietPlan.fitness_goal?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-orange-500/10 text-orange-400 px-3.5 py-1.5 rounded-full border border-orange-500/20 font-poppins font-bold text-xs">
          <Flame size={14} className="text-orange-500" />
          <span>{daily_targets.calories.toLocaleString()} kcal target</span>
        </div>
      </div>

      {/* Calorie Progress */}
      <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-orange-400 font-extrabold text-xs uppercase tracking-wider font-poppins">Daily Calorie Balance Tracker</span>
          <span className="text-white font-black font-poppins text-sm">{daily_totals.calories} / {daily_targets.calories} kcal</span>
        </div>
        <div className="h-3 rounded-full bg-[#334155] border border-slate-700/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #F97316, #F59E0B)' }}
            initial={{ width: 0 }}
            animate={{ width: `${calorieProgress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between flex-wrap gap-2 mt-4.5 border-t border-slate-700/60 pt-3">
          <span className="text-xs text-slate-300 font-bold font-poppins">PROTEIN: {daily_totals.protein_g}g</span>
          <span className="text-xs text-slate-300 font-bold font-poppins">CARBS: {daily_totals.carbs_g}g</span>
          <span className="text-xs text-slate-300 font-bold font-poppins">FATS: {daily_totals.fats_g}g</span>
          <div className="flex items-center gap-1 text-xs text-slate-300 font-bold font-poppins">
            <Droplets size={12} className="text-blue-400" />
            <span>HYDRATION: {daily_targets.water_ml}ml</span>
          </div>
        </div>
      </div>

      {/* Meal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
        {mealOrder.map((key, i) => meals[key] && (
          <div key={key} className="sm:col-span-1">
            <MealCard mealKey={key} meal={meals[key]} index={i} />
          </div>
        ))}
      </div>

      {/* Macro Chart + Tips Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Macro Chart */}
        <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-5 shadow-sm">
          <p className="text-white font-extrabold mb-4 text-xs uppercase tracking-wider font-poppins">Daily Macros Comparison</p>
          <MacroSummaryChart totals={daily_totals} targets={daily_targets} />
        </div>

        {/* Nutrition Tips */}
        <div className="border border-emerald-500/10 bg-emerald-500/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-emerald-400 font-extrabold mb-4.5 text-xs uppercase tracking-wider font-poppins">💡 AI Nutrition Guidance</p>
            <ul className="space-y-3">
              {nutrition_tips?.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                  <ChevronRight size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Supplements */}
      {supplements?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 border border-slate-700/60 bg-[#1E293B] rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Pill size={16} className="text-indigo-400" />
            <p className="text-white font-extrabold text-xs uppercase tracking-wider font-poppins">AI Recommended Supplement Strategy</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {supplements.map((sup, i) => (
              <span key={i} className="badge badge-purple text-xs font-bold font-poppins px-3.5 py-1.5">{sup}</span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
