/**
 * FitGENIE - Redesigned Hero Header Component
 * Premium 2-column SaaS-style landing hero featuring interactive floating dark biometric cards on the right.
 */

import { motion } from 'framer-motion'
import { Activity, Camera, Zap, LayoutDashboard, UserCheck, Flame, Heart, TrendingUp, Check, Award } from 'lucide-react'

// Simple Floating Card wrapper that uses framer-motion for smooth drift animations
const FloatingWidget = ({ children, className, delay = 0, yOffset = 10 }) => (
  <motion.div
    className={`glass-premium p-4.5 rounded-2xl shadow-premium border border-white/5 absolute ${className}`}
    animate={{
      y: [-yOffset, yOffset, -yOffset],
    }}
    transition={{
      duration: 5 + Math.random() * 2,
      delay,
      repeat: Infinity,
      ease: 'easeInOut'
    }}
    whileHover={{ 
      scale: 1.04, 
      y: 0,
      borderColor: 'rgba(249, 115, 22, 0.4)',
      boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)'
    }}
  >
    {children}
  </motion.div>
)

export default function HeroHeader() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div id="hero" className="relative overflow-hidden min-h-[75vh] lg:min-h-[85vh] flex items-center bg-[#0F172A] bg-grid-pattern border-b border-slate-800/80 py-10 lg:py-0">
      
      {/* Background radial orange glow highlights */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-orange-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Headline and Call-to-actions */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 rounded-full px-4 py-1.5 border border-orange-500/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider font-poppins">FitGenie Premium Dark v3.0</span>
          </motion.div>

          {/* Main Titles */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-poppins leading-[1.1]"
            >
              Train Harder. <br />
              <span className="gradient-text-orange">Evolve Smart.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-300 text-sm sm:text-base md:text-lg max-w-lg font-medium leading-relaxed"
            >
              Elevate your performance. FitGenie analyzes your biometrics to generate personalized training regimens, diet metrics, and corrects your form instantly via computer vision posture feedback.
            </motion.p>
          </div>

          {/* Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500 rounded-2xl blur-md opacity-35 pulse-ring" />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => scrollToSection('assessment')}
                className="btn-primary text-sm px-8 py-4 font-bold justify-center w-full sm:w-auto relative z-10"
              >
                <UserCheck size={18} />
                START AI ASSESSMENT
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToSection('workout')}
              className="btn-secondary text-sm px-8 py-4 font-bold justify-center hover:border-orange-500 hover:text-orange-400"
            >
              <Camera size={18} />
              POSTURE WORKOUT
            </motion.button>
          </motion.div>

          {/* Client Logos / Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
            className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-semibold uppercase tracking-wider"
          >
            <span>⚡ Joint Pose CV Tracking</span>
            <span>🍊 Target Calorie Macro Splitting</span>
            <span>📈 Athletic Trendlines</span>
          </motion.div>
        </div>

        {/* Right Column: Premium Visual Showcase containing Floating Biometric Widgets */}
        <div className="lg:col-span-6 relative h-[360px] sm:h-[450px] lg:h-[500px] flex items-center justify-center">
          
          {/* Subtle Orange Radial Backdrop Light */}
          <div className="absolute w-[250px] sm:w-[380px] h-[250px] sm:h-[380px] bg-gradient-to-r from-orange-500/10 via-orange-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Core Hub Circular Graphics */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute border border-orange-500/5 w-[240px] sm:w-[320px] h-[240px] sm:h-[320px] rounded-full flex items-center justify-center"
          >
            <div className="w-[180px] h-[180px] border border-dashed border-orange-500/10 rounded-full" />
          </motion.div>

          {/* Floating Card 1: BMI Tracker */}
          <FloatingWidget className="w-[160px] sm:w-[190px] top-6 left-6 sm:left-12" delay={0} yOffset={8}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-poppins">BMI Index</span>
              <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">Optimal</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white font-poppins">22.4</span>
              <span className="text-[10px] text-slate-400 font-medium">kg/m²</span>
            </div>
            {/* Range indicator slider */}
            <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden relative">
              <div className="absolute left-[38%] top-0 h-full w-[25%] bg-orange-500 rounded-full" />
              <div className="absolute left-[45%] -top-0.5 w-2 h-2 rounded-full bg-white border border-slate-900" />
            </div>
          </FloatingWidget>

          {/* Floating Card 2: Calories Progress Ring */}
          <FloatingWidget className="w-[170px] sm:w-[200px] bottom-6 left-2 sm:left-6" delay={1.5} yOffset={10}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/25">
                <Flame size={14} />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-poppins block">Active Energy</span>
                <span className="text-xs font-bold text-white font-poppins">Calorie Target</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-12 h-12">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="#334155" strokeWidth="4" fill="transparent" />
                  <circle 
                    cx="24" 
                    cy="24" 
                    r="20" 
                    stroke="#F97316" 
                    strokeWidth="4" 
                    fill="transparent" 
                    strokeDasharray={125.6} 
                    strokeDashoffset={125.6 * (1 - 0.8)} 
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white font-poppins">
                  80%
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-white font-poppins block">640 kcal</span>
                <span className="text-[10px] text-slate-400 font-semibold block">/ 800 target</span>
              </div>
            </div>
          </FloatingWidget>

          {/* Floating Card 3: Workout Streak Calendar */}
          <FloatingWidget className="w-[190px] sm:w-[220px] top-12 right-2 sm:right-6" delay={0.7} yOffset={12}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Award size={14} className="text-orange-500" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-poppins">Active Streak</span>
              </div>
              <span className="text-xs font-black text-orange-400 font-poppins">5 Days</span>
            </div>
            {/* Days bubble checkboxes */}
            <div className="flex justify-between items-center gap-1.5">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                const checked = idx < 5
                return (
                  <div 
                    key={day} 
                    className={`w-6 h-6 rounded-lg text-[9px] font-bold flex items-center justify-center border transition-all ${
                      checked 
                        ? 'bg-orange-500 text-white border-orange-400 shadow-sm' 
                        : 'bg-slate-700/60 text-slate-400 border-slate-600'
                    }`}
                  >
                    {checked ? <Check size={10} strokeWidth={3} /> : day}
                  </div>
                )
              })}
            </div>
          </FloatingWidget>

          {/* Floating Card 4: Fitness Score Progression Line Chart */}
          <FloatingWidget className="w-[180px] sm:w-[210px] bottom-10 right-4 sm:right-12" delay={2.2} yOffset={7}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-orange-500" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-poppins">Optimization</span>
              </div>
              <span className="text-xs font-bold text-orange-400 font-poppins">+12%</span>
            </div>
            <div className="h-10 w-full mt-2">
              {/* Premium Mini SVG Line Chart */}
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,28 Q15,22 30,24 T60,14 T90,5 L100,2" 
                  fill="none" 
                  stroke="#f97316" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M0,28 Q15,22 30,24 T60,14 T90,5 L100,2 L100,30 L0,30 Z" 
                  fill="url(#chartGradOrange)" 
                />
                <circle cx="100" cy="2" r="3" fill="#f97316" />
              </svg>
            </div>
          </FloatingWidget>

        </div>

      </div>

      {/* Micro scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1 pointer-events-none opacity-40">
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-poppins">Scroll to assessment</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-1.5 h-3 rounded-full bg-slate-400"
        />
      </div>

    </div>
  )
}
