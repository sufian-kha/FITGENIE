/**
 * FitGENIE - AI Fitness Chat
 * Conversational AI expert chatbot with fitness coaching context.
 * Supports standard page-bound layout and compact floating modal layout.
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, User, Loader2, Trash2, MessageSquare, X } from 'lucide-react'
import useFitnessStore from '../store/fitnessStore'
import { sendChatMessage } from '../api/client'

const DEFAULT_PROMPTS = [
  "🍎 What should I eat today?",
  "🏋️ Give me a chest workout",
  "🥩 How much protein do I need?",
  "🔥 How can I lose weight faster?",
  "🍌 What's the best pre-workout meal?",
  "🧘 How do I improve my posture?",
]

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-2.5 mb-4.5 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${
        isUser ? 'bg-orange-500 text-white border-orange-400/20' : 'bg-slate-800 text-white border-slate-700'
      }`}>
        {isUser ? (
          <User size={13} className="text-white" />
        ) : (
          <Bot size={13} className="text-white" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl p-3.5 shadow-sm text-xs sm:text-sm font-semibold leading-relaxed ${
        isUser 
          ? 'bg-orange-500 text-white rounded-tr-none' 
          : 'bg-[#334155] border border-slate-700/60 text-white rounded-tl-none'
      }`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={`text-[9px] mt-2 block text-right font-bold uppercase tracking-wider ${isUser ? 'text-orange-100' : 'text-slate-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 mb-4.5">
      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
        <Bot size={13} className="text-white" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-tl-none p-3.5 bg-[#334155] border border-slate-700/60 flex items-center gap-2.5 shadow-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-orange-500"
              animate={{ y: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <span className="text-slate-300 text-[10px] font-black uppercase tracking-wider font-poppins">Coach is typing...</span>
      </div>
    </div>
  )
}

export default function FitnessChat({ onClose, isFloating = false }) {
  const { chatMessages, addChatMessage, clearChatMessages, profile, fitnessData } = useFitnessStore()
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState(DEFAULT_PROMPTS)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isTyping])

  const handleSend = async (message = inputValue) => {
    if (!message.trim() || isTyping) return

    const userMsg = message.trim()
    setInputValue('')
    setIsTyping(true)

    addChatMessage({ role: 'user', content: userMsg })

    try {
      const history = chatMessages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      const userContext = fitnessData ? {
        age: parseInt(profile.age),
        gender: profile.gender,
        bmi: fitnessData.bmi?.bmi,
        weight: parseFloat(profile.weight),
        fitness_goal: profile.fitness_goal,
        activity_level: profile.activity_level,
        target_calories: fitnessData.calories?.target
      } : null

      const response = await sendChatMessage(userMsg, history, userContext)
      addChatMessage({ role: 'assistant', content: response.response })

      // Update follow-up suggested questions from backend if available
      if (response.suggested_questions && response.suggested_questions.length > 0) {
        setSuggestedQuestions(response.suggested_questions)
      } else {
        setSuggestedQuestions(DEFAULT_PROMPTS)
      }
    } catch (err) {
      addChatMessage({
        role: 'assistant',
        content: '⚠️ I encountered an issue connecting to the AI Coach. Please check if the backend is running.'
      })
      setSuggestedQuestions(DEFAULT_PROMPTS)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    clearChatMessages()
    setSuggestedQuestions(DEFAULT_PROMPTS)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: isFloating ? 30 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`premium-card border-top-accent flex flex-col justify-between bg-[#1E293B] border border-slate-700/60 ${
        isFloating ? 'shadow-2xl p-5 border-t-orange-500' : 'p-6 sm:p-8'
      }`}
      style={{ minHeight: isFloating ? '450px' : '520px' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
              <MessageSquare size={16} />
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm tracking-tight font-poppins">AI Coach Chat</h4>
              {!isFloating && <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider font-poppins mt-0.5">Instant Nutrition &amp; Workout Support</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-orange-400 text-[9px] font-black uppercase tracking-wider font-poppins">Active</span>
            </div>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-xl border border-slate-700 hover:bg-red-500/10 hover:border-red-500/20 transition-colors group shadow-sm bg-[#1E293B]"
              title="Clear chat log"
            >
              <Trash2 size={12} className="text-slate-400 group-hover:text-red-500" />
            </button>
            {isFloating && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl border border-slate-700 hover:bg-slate-700/60 transition-colors text-slate-400 hover:text-white shadow-sm bg-[#1E293B]"
                title="Minimize chat"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Suggested Follow-up Questions */}
        <div className="mb-4">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-2 font-poppins">Suggested Prompts Checklist</p>
          <div className="flex flex-wrap gap-1.5 max-h-[75px] overflow-y-auto pr-1">
            {suggestedQuestions.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                disabled={isTyping}
                className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-xl text-[10px] font-bold font-poppins transition-all disabled:opacity-50 hover:-translate-y-0.5"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        className="flex-1 overflow-y-auto border border-slate-700/60 rounded-2xl p-4 bg-[#1E293B]/30 mb-4"
        style={{ height: isFloating ? '220px' : '280px' }}
      >
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Bot size={28} className="text-slate-500 mb-2" />
            <p className="text-xs font-bold text-slate-300 font-poppins">Welcome to FitGenie Chat</p>
            <p className="text-[10px] text-slate-400 max-w-[180px] leading-relaxed mt-1 font-semibold">Select a suggested prompt or type your training query below.</p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        {isTyping && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about daily calories, squat form posture..."
              disabled={isTyping}
              rows={1}
              className="form-input resize-none pr-3 py-3 text-xs sm:text-sm font-semibold bg-[#334155] border-slate-700 text-white"
              style={{ minHeight: '42px', maxHeight: '80px' }}
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'
              }}
            />
          </div>
          <div className="relative self-end">
            {!inputValue.trim() || isTyping ? null : (
              <div className="absolute inset-0 bg-orange-400 rounded-xl blur-md opacity-35 pulse-ring" />
            )}
            <button
              id="chat-send-btn"
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              className="btn-primary px-4 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 relative z-10"
            >
              {isTyping ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>

        {!isFloating && (
          <p className="text-slate-500 text-[10px] text-center mt-3.5 font-bold uppercase tracking-wider">
            Press Enter to send message • Shift+Enter for new paragraph
          </p>
        )}
      </div>
    </motion.div>
  )
}
