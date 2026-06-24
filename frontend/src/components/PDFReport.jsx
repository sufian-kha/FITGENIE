/**
 * FitGENIE - PDF Report Generator
 * Downloads a professionally formatted PDF fitness report from the backend.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileDown, Loader2, CheckCircle, FileText, Star, Check } from 'lucide-react'
import useFitnessStore from '../store/fitnessStore'
import { generatePDFReport } from '../api/client'

export default function PDFReport() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)

  const { fitnessData, mlPredictions, aiAnalysis, workoutPlan, dietPlan, profile } = useFitnessStore()

  if (!fitnessData) return null

  const handleDownload = async () => {
    setIsGenerating(true)
    setIsSuccess(false)
    setError(null)

    try {
      const reportData = {
        profile: {
          ...profile,
          age: parseInt(profile.age),
          height: parseFloat(profile.height),
          weight: parseFloat(profile.weight),
        },
        bmi: fitnessData.bmi,
        bmr: fitnessData.bmr,
        calories: fitnessData.calories,
        fitness_score: fitnessData.fitness_score,
        ai_analysis: aiAnalysis,
        workout_plan: workoutPlan,
        diet_plan: dietPlan,
        ml_predictions: mlPredictions,
      }

      const response = await generatePDFReport(reportData)

      // Create blob and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'FitGENIE_Fitness_Report.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (err) {
      setError('PDF generation failed. Make sure the backend is running with ReportLab installed.')
    } finally {
      setIsGenerating(false)
    }
  }

  const reportSections = [
    '👤 Biometric Profile Details',
    '📊 BMI & Caloric Calculations',
    '⚡ Fitness Score Indexes',
    '🤖 AI Health Advisor Insights',
    '🏋️ Training Schedule Splits',
    '🥗 Diet Nutrition Targets',
    '💊 Supplement Strategies',
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card border-top-accent bg-[#1E293B] border border-slate-700/60"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg tracking-tight font-poppins">Report Generator</h3>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-poppins">Export Biometrics Analysis Dossier</p>
          </div>
        </div>
        <span className="badge badge-green">PDF Export</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Preview Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-[#1E293B]/40 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between hover:border-orange-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-5 border-b border-slate-700/60 pb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-white font-extrabold text-sm font-poppins leading-none">FitGENIE Fitness Dossier</p>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-poppins mt-1">Professional PDF • Generated instantly</p>
            </div>
          </div>

          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-3 font-poppins">Sections Summary Checklist:</p>
          <ul className="space-y-2">
            {reportSections.map((section, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-semibold leading-normal"
              >
                <Check size={12} className="text-orange-500 flex-shrink-0" />
                <span>{section}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Download Section */}
        <div className="flex flex-col items-center gap-5">
          <div className="text-center">
            <h4 className="text-white font-black text-sm uppercase tracking-wider font-poppins mb-2">Dossier Compilation Complete</h4>
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">Click compile below to assemble and download your personalized fitness, diet, and posture dossier report.</p>
          </div>

          {/* Download Button */}
          <div className={!isGenerating && !isSuccess ? 'relative w-full max-w-xs' : 'w-full max-w-xs'}>
            {!isGenerating && !isSuccess && (
              <div className="absolute inset-0 bg-orange-400 rounded-2xl blur-md opacity-35 pulse-ring" />
            )}
            <motion.button
              id="download-pdf-btn"
              onClick={handleDownload}
              disabled={isGenerating}
              whileHover={{ scale: isGenerating ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`btn-primary text-base px-8 py-4 w-full justify-center ${
                isSuccess ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : ''
              } disabled:opacity-60 disabled:cursor-not-allowed relative z-10`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating PDF...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle size={18} />
                  Downloaded!
                </>
              ) : (
                <>
                  <FileDown size={18} />
                  COMPILE PDF REPORT
                </>
              )}
            </motion.button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-xs text-center max-w-xs font-black uppercase tracking-wider"
            >
              ⚠️ {error}
            </motion.p>
          )}

          <p className="text-slate-500 text-[10px] text-center max-w-xs font-semibold leading-relaxed">
            * Generates a complete comprehensive diagnostic report including training routines, metabolic thresholds, and nutrition preferences.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
