/**
 * FitGENIE AI Agent - Main Application Dashboard
 * Premium single-page scrolling interface with a sticky navbar, 
 * scroll-spy active state highlighting, scroll-reveal anims, 
 * and dynamic glassmorphism lock overlays for pending profiles.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, User, Camera, LayoutDashboard, BarChart2, 
  MessageSquare, ChevronRight, Lock, EyeOff 
} from 'lucide-react'

// Components
import HeroHeader from './components/HeroHeader'
import UserAssessment from './components/UserAssessment'
import { BMIAnalysis, BMRAnalysis } from './components/BMIBMRSection'
import { FitnessScore, MLPredictions } from './components/FitnessScoreML'
import AIAgentPanel from './components/AIAgentPanel'
import WorkoutPlan from './components/WorkoutPlan'
import DietPlan from './components/DietPlan'
import HealthInsights from './components/HealthInsights'
import FitnessChat from './components/FitnessChat'
import WorkoutSession from './components/WorkoutSession'
import PDFReport from './components/PDFReport'
import ProgressDashboard from './components/ProgressDashboard'

// Store
import useFitnessStore from './store/fitnessStore'

// Scroll Reveal Section wrapper
function ScrollRevealSection({ id, children }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full"
    >
      {children}
    </motion.section>
  )
}

// Glassmorphism Lock Overlay for Assessment-gated features
function GatedSectionOverlay({ onAction }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0F172A]/85 backdrop-blur-md rounded-3xl p-8 text-center border border-slate-800 shadow-premium">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="max-w-md space-y-5"
      >
        <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto border border-orange-500/20 shadow-sm pulse-ring">
          <Lock size={22} />
        </div>
        <div>
          <h3 className="text-white font-extrabold text-xl mb-2 font-poppins">AI Assessment Required</h3>
          <p className="text-slate-300 text-sm leading-relaxed font-medium">
            Please complete the personal assessment form above to unlock your athletic training recommendations, diet metrics, progress trends, and advisor panels.
          </p>
        </div>
        <button
          onClick={onAction}
          className="btn-primary px-8 py-3.5 font-bold text-xs tracking-wider uppercase flex items-center gap-2 mx-auto"
        >
          Go to Assessment Form
          <ChevronRight size={14} />
        </button>
      </motion.div>
    </div>
  )
}

function SystemStatus({ isConnected }) {
  return (
    <div className={`fixed bottom-6 left-6 z-50 glass-premium px-4 py-2.5 rounded-full flex items-center gap-2 text-xs transition-all shadow-premium border ${
      isConnected ? 'border-orange-500/20 bg-slate-800/95 text-orange-400' : 'border-red-500/20 bg-slate-800/95 text-red-400'
    }`}>
      <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-orange-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
      <span className="font-bold font-poppins">
        {isConnected ? 'FitGenie AI Connected' : 'Offline Mode'}
      </span>
    </div>
  )
}

export default function App() {
  const { isAnalyzed } = useFitnessStore()
  const [backendOnline, setBackendOnline] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [chatOpen, setChatOpen] = useState(false)

  // Verify backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:8000/health')
        setBackendOnline(res.ok)
      } catch {
        setBackendOnline(false)
      }
    }
    checkBackend()
    const interval = setInterval(checkBackend, 12000)
    return () => clearInterval(interval)
  }, [])

  // Scrollspy logic: Highlight active section during scroll
  useEffect(() => {
    const sections = ['hero', 'assessment', 'recommendations', 'workout', 'progress', 'insights']
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-30% 0px -40% 0px', // Trigger when section is in the middle of screen
      threshold: 0
    })

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [isAnalyzed])

  const navTabs = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'assessment', label: 'Assessment', icon: User },
    { id: 'workout', label: 'Posture Coach', icon: Camera },
    { id: 'progress', label: 'Progress', icon: LayoutDashboard },
    { id: 'insights', label: 'AI Insights', icon: BarChart2 }
  ]

  const handleNavClick = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(id)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pb-12 select-none">
      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800/80 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick('hero')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-premium">G</div>
            <span className="text-2xl font-black tracking-tight text-white font-poppins">Fit<span className="text-orange-500">Genie</span></span>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
            {navTabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeSection === tab.id || (tab.id === 'insights' && activeSection === 'recommendations')
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavClick(tab.id)}
                  className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 border ${
                    isActive 
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-sm font-bold scale-[1.02]' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-transparent'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Sections Container with Full-Width Alternating Background Sections */}
      <div className="space-y-0">
        
        {/* Section 1: Hero Area */}
        <HeroHeader />

        {/* Section 2: Profile Assessment (Slate 800 Surface) */}
        <div id="assessment" className="w-full bg-[#1E293B] border-b border-slate-800/80 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollRevealSection id="assessment-reveal">
              <UserAssessment />
            </ScrollRevealSection>
          </div>
        </div>

        {/* Section 3: AI Recommendations (Slate 900 Background) */}
        <div id="recommendations" className="w-full bg-[#0F172A] border-b border-slate-800/80 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollRevealSection id="recommendations-reveal">
              <div className="relative min-h-[400px] rounded-3xl p-1">
                {!isAnalyzed && (
                  <GatedSectionOverlay 
                    onAction={() => handleNavClick('assessment')} 
                  />
                )}
                
                <div className={`space-y-8 ${!isAnalyzed ? 'blur-lg pointer-events-none select-none' : ''}`}>
                  <div className="section-header border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-3xl font-black text-white font-poppins">AI Plan Splits</h2>
                      <p className="text-slate-400 text-sm mt-1 font-medium font-poppins">Calculated macro ratios, training split templates, and workout profiles</p>
                    </div>
                    {isAnalyzed && (
                      <span className="badge badge-green self-start md:self-center">Profile Calculated</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BMIAnalysis />
                    <BMRAnalysis />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FitnessScore />
                    <MLPredictions />
                  </div>
                  
                  <WorkoutPlan />
                  <DietPlan />
                </div>
              </div>
            </ScrollRevealSection>
          </div>
        </div>

        {/* Section 4: Workout Center - Posture Feedback (Slate 800 Surface) */}
        <div id="workout" className="w-full bg-[#1E293B] border-b border-slate-800/80 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollRevealSection id="workout-reveal">
              <WorkoutSession />
            </ScrollRevealSection>
          </div>
        </div>

        {/* Section 5: Progress Dashboard (Slate 900 Background) */}
        <div id="progress" className="w-full bg-[#0F172A] border-b border-slate-800/80 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollRevealSection id="progress-reveal">
              <div className="relative min-h-[450px] rounded-3xl p-1">
                {!isAnalyzed && (
                  <GatedSectionOverlay 
                    onAction={() => handleNavClick('assessment')} 
                  />
                )}
                
                <div className={`space-y-6 ${!isAnalyzed ? 'blur-lg pointer-events-none select-none' : ''}`}>
                  <div className="section-header border-b border-slate-800 pb-4">
                    <h2 className="text-3xl font-black text-white font-poppins">Progress Dashboard</h2>
                    <p className="text-slate-400 text-sm mt-1 font-medium font-poppins">Biometric weight progression charts, weekly activity logs, and goals</p>
                  </div>
                  <ProgressDashboard />
                </div>
              </div>
            </ScrollRevealSection>
          </div>
        </div>

        {/* Section 6: Health Insights & Analytics (Slate 800 Surface) */}
        <div id="insights" className="w-full bg-[#1E293B] border-b border-slate-800/80 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollRevealSection id="insights-reveal">
              <div className="relative min-h-[450px] rounded-3xl p-1">
                {!isAnalyzed && (
                  <GatedSectionOverlay 
                    onAction={() => handleNavClick('assessment')} 
                  />
                )}
                
                <div className={`space-y-8 ${!isAnalyzed ? 'blur-lg pointer-events-none select-none' : ''}`}>
                  <div className="section-header border-b border-slate-800 pb-4">
                    <h2 className="text-3xl font-black text-white font-poppins">Health Insights & Analysis</h2>
                    <p className="text-slate-400 text-sm mt-1 font-medium font-poppins">AI-generated improvement advice, success habits, and analytics report</p>
                  </div>
                  <AIAgentPanel />
                  <HealthInsights />
                  <PDFReport />
                </div>
              </div>
            </ScrollRevealSection>
          </div>
        </div>
      </div>

      {/* Floating AI Coach Chat Trigger (SaaS Pop-up Widget) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="mb-4 w-[340px] sm:w-[420px] shadow-2xl rounded-3xl overflow-hidden border border-slate-800 bg-[#1E293B]"
            >
              <FitnessChat onClose={() => setChatOpen(false)} isFloating={true} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setChatOpen(!chatOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-500 text-white shadow-premium hover:bg-orange-600 transition-all border border-orange-400/20"
          title="Chat with AI Coach"
        >
          <MessageSquare size={22} className={chatOpen ? "rotate-90 transition-transform duration-300" : "transition-transform duration-300"} />
        </motion.button>
      </div>

      {/* Footer */}
      <footer className="text-center py-10 mt-10 border-t border-slate-800/80 max-w-7xl mx-auto px-6">
        <p className="text-white font-extrabold text-xl mb-1.5 font-poppins">Fit<span className="text-orange-500">Genie</span> AI</p>
        <p className="text-slate-400 text-sm font-medium">
          Your Personal AI Fitness, Nutrition &amp; Posture Coach
        </p>
        <p className="text-slate-500 text-xs mt-2">
          Providing dynamic assessments and interactive posture suggestions.
        </p>
        <p className="text-slate-400 text-xs mt-5 max-w-md mx-auto">
          ⚠️ Consult a healthcare professional before starting any fitness program.
        </p>
      </footer>

      {/* Persistent System Status */}
      <SystemStatus isConnected={backendOnline} />
    </div>
  )
}
