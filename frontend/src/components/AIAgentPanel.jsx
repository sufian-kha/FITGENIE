/**
 * FitGENIE - AI Agent Analysis Panel
 * Displays Gemini AI's comprehensive fitness analysis with typed reveal effect.
 */

import { motion } from 'framer-motion'
import { Bot, Star, AlertTriangle, Heart, Lightbulb, Target, Calendar, TrendingUp } from 'lucide-react'
import useFitnessStore from '../store/fitnessStore'

function AnalysisCard({ icon: Icon, title, content, color, delay = 0 }) {
  const colorMap = {
    green: { bg: 'bg-[#1E293B]', border: 'border-t-4 border-t-green-500', iconBg: 'bg-green-500/10 text-green-400', icon: 'text-green-400', title: 'text-white' },
    yellow: { bg: 'bg-[#1E293B]', border: 'border-t-4 border-t-orange-500', iconBg: 'bg-orange-500/10 text-orange-400', icon: 'text-orange-400', title: 'text-white' },
    cyan: { bg: 'bg-[#1E293B]', border: 'border-t-4 border-t-blue-500', iconBg: 'bg-blue-500/10 text-blue-400', icon: 'text-blue-400', title: 'text-white' },
    orange: { bg: 'bg-[#1E293B]', border: 'border-t-4 border-t-orange-600', iconBg: 'bg-orange-500/10 text-orange-500', icon: 'text-orange-500', title: 'text-white' },
  }
  const c = colorMap[color] || colorMap.green

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-6 border border-slate-700/60 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 ${c.bg} ${c.border}`}
    >
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${c.iconBg}`}>
            <Icon size={18} />
          </div>
          <h4 className={`font-black text-sm uppercase tracking-wider font-poppins ${c.title}`}>{title}</h4>
        </div>
        {typeof content === 'string' ? (
          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">{content}</p>
        ) : (
          <ul className="space-y-2">
            {content.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-300 leading-normal">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-current ${c.icon}`} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  )
}

function MotivationBanner({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl p-5 text-center shadow-sm relative overflow-hidden bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-orange-500/10 border border-orange-500/20"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none" />
      <p className="text-base sm:text-lg font-black text-orange-400 font-poppins italic">“{message}”</p>
    </motion.div>
  )
}

export default function AIAgentPanel() {
  const { aiAnalysis } = useFitnessStore()

  if (!aiAnalysis) return null

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
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg tracking-tight font-poppins">AI Fitness Advisor</h3>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-poppins">Gemini Expert Biometric Synthesis</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full border border-orange-500/20">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-wider font-poppins">Coaching Active</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Motivation Banner */}
        {aiAnalysis.motivation_message && (
          <MotivationBanner message={aiAnalysis.motivation_message} />
        )}

        {/* Health Analysis Overview */}
        {aiAnalysis.health_analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#334155]/20 border border-slate-700/60 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <Heart size={18} className="text-red-500" />
              <h4 className="text-white font-extrabold text-sm font-poppins uppercase tracking-wider">Health Analysis Overview</h4>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">{aiAnalysis.health_analysis}</p>
          </motion.div>
        )}

        {/* Grid of Analysis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiAnalysis.key_strengths?.length > 0 && (
            <AnalysisCard
              icon={Star}
              title="Key Strengths"
              content={aiAnalysis.key_strengths}
              color="green"
              delay={0.2}
            />
          )}

          {aiAnalysis.areas_for_improvement?.length > 0 && (
            <AnalysisCard
              icon={AlertTriangle}
              title="Focus Improvements"
              content={aiAnalysis.areas_for_improvement}
              color="yellow"
              delay={0.25}
            />
          )}

          {aiAnalysis.workout_recommendation && (
            <AnalysisCard
              icon={Target}
              title="AI Workout Strategy"
              content={aiAnalysis.workout_recommendation}
              color="cyan"
              delay={0.3}
            />
          )}

          {aiAnalysis.diet_recommendation && (
            <AnalysisCard
              icon={Lightbulb}
              title="AI Nutrition Strategy"
              content={aiAnalysis.diet_recommendation}
              color="orange"
              delay={0.35}
            />
          )}
        </div>

        {/* Daily Habits */}
        {aiAnalysis.daily_habits?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="border-t border-slate-700/60 pt-6"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <Calendar size={18} className="text-orange-500" />
              <h4 className="text-white font-extrabold text-sm font-poppins uppercase tracking-wider">Daily Success Habits Checklist</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {aiAnalysis.daily_habits.map((habit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 hover:border-orange-500/40 transition-colors shadow-sm"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-xs flex-shrink-0 font-poppins border border-orange-500/20">
                    {i + 1}
                  </div>
                  <p className="text-slate-300 text-xs font-semibold leading-snug">{habit}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Weekly Focus & Expected Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-700/60 pt-6">
          {aiAnalysis.weekly_focus && (
            <div className="border border-blue-500/10 bg-blue-500/5 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2.5">
                <Target size={16} className="text-blue-400" />
                <h4 className="text-blue-400 font-black text-sm uppercase tracking-wider font-poppins">This Week's Focal Point</h4>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">{aiAnalysis.weekly_focus}</p>
            </div>
          )}
          {aiAnalysis.expected_results && (
            <div className="border border-green-500/10 bg-green-500/5 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2.5">
                <TrendingUp size={16} className="text-green-400" />
                <h4 className="text-green-400 font-black text-sm uppercase tracking-wider font-poppins">Anticipated Biometric Results</h4>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">{aiAnalysis.expected_results}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
