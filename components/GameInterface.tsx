"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface GameInterfaceProps {
  story: string
  choices: string[]
  history: string[]
  onChoice: (choice: string) => void
  onEnd: () => void
  onBack: () => void
  isLoading: boolean
}

export function GameInterface({ story, choices, history, onChoice, onEnd, onBack, isLoading }: GameInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentSegmentRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showChoicesMobile, setShowChoicesMobile] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  // TTS Effect
  useEffect(() => {
    if (!story || isMuted) {
      window.speechSynthesis.cancel()
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(story)
    utterance.lang = "fr-FR"
    utterance.rate = playbackRate
    utterance.pitch = 1.0

    // Optional: Select a specific voice if available
    // const voices = window.speechSynthesis.getVoices()
    // const frenchVoice = voices.find(v => v.lang.includes('fr'))
    // if (frenchVoice) utterance.voice = frenchVoice

    window.speechSynthesis.speak(utterance)

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [story, isMuted, playbackRate])

  useEffect(() => {
    setIsTyping(true)
    setDisplayedText("")
    setShowChoicesMobile(false) // Reset mobile choices visibility on new segment
    let currentIndex = 0
    
    // Scroll to the start of the new segment when story changes
    if (currentSegmentRef.current) {
      currentSegmentRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    const typingInterval = setInterval(() => {
      if (currentIndex <= story.length) {
        setDisplayedText(story.slice(0, currentIndex))
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(typingInterval)
      }
    }, 30)

    return () => clearInterval(typingInterval)
  }, [story])

  // Auto-scroll to keep cursor in view while typing
  useEffect(() => {
    if (isTyping && cursorRef.current) {
      cursorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [displayedText, isTyping])

  const togglePlaybackRate = () => {
    setPlaybackRate(prev => {
      if (prev === 1) return 1.5
      if (prev === 1.5) return 2
      return 1
    })
  }

  return (
    <div className="w-full min-h-screen flex flex-col relative">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="fixed top-6 left-6 z-50 p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
        title="Retour au menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </button>

      {/* Audio Controls */}
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        {/* Speed Toggle */}
        <button
          onClick={togglePlaybackRate}
          className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all font-mono text-xs font-bold w-12 h-12 flex items-center justify-center"
          title="Vitesse de lecture"
        >
          {playbackRate}x
        </button>

        {/* Mute Button */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
          title={isMuted ? "Activer le son" : "Couper le son"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v6a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          )}
        </button>

        {/* Finish Button */}
        {choices.length > 0 && (
          <button
            onClick={onEnd}
            className="p-3 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-full text-red-200 hover:text-white hover:bg-red-500/40 transition-all"
            title="Terminer l'histoire maintenant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 lg:px-24 py-12 md:py-20" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-12 md:space-y-16 pb-64">
          {history.map((segment, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="story-text text-white/40 leading-relaxed"
            >
              {segment}
            </motion.p>
          ))}

          <motion.div
            ref={currentSegmentRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="story-text text-white leading-relaxed"
          >
            {displayedText}
            {isTyping && (
              <span 
                ref={cursorRef}
                className="inline-block w-1 h-6 md:h-8 bg-white ml-1 animate-pulse align-middle" 
              />
            )}
          </motion.div>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center gap-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </motion.div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black to-transparent pt-32 pb-8 md:pb-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Toggle Button */}
          {!isLoading && !isTyping && (
            <div className="md:hidden mb-4 flex justify-center">
              <button
                onClick={() => setShowChoicesMobile(!showChoicesMobile)}
                className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-medium hover:bg-white/20 transition-all"
              >
                {showChoicesMobile ? "Masquer les choix" : "Voir les choix"}
              </button>
            </div>
          )}

          {/* Choices Container */}
          <div className={`${showChoicesMobile ? 'block' : 'hidden'} md:block grid grid-cols-1 md:flex md:flex-row gap-4 md:gap-6`}>
            <AnimatePresence>
              {!isLoading &&
                !isTyping &&
                choices.map((choice, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    onClick={() => onChoice(choice)}
                    className="glass-card p-6 md:p-8 rounded-lg text-left group md:flex-1"
                  >
                    <span className="block text-xs uppercase tracking-widest text-white/40 mb-3 group-hover:text-white/60 transition-colors">
                      {index + 1}
                    </span>
                    <span className="block text-base md:text-lg text-white/80 group-hover:text-white leading-relaxed">
                      {choice}
                    </span>
                  </motion.button>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
