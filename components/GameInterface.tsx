"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface GameInterfaceProps {
  story: string
  choices: string[]
  history: string[]
  onChoice: (choice: string) => void
  isLoading: boolean
}

export function GameInterface({ story, choices, history, onChoice, isLoading }: GameInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentSegmentRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showChoicesMobile, setShowChoicesMobile] = useState(false)

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

  return (
    <div className="w-full min-h-screen flex flex-col">
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
          <div className={`${showChoicesMobile ? 'block' : 'hidden'} md:block grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6`}>
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
                    className="glass-card p-6 md:p-8 rounded-lg text-left group"
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
