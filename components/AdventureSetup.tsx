"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface AdventureSetupProps {
  onStart: (theme: string) => void
  isLoading: boolean
}

export function AdventureSetup({ onStart, isLoading }: AdventureSetupProps) {
  const [theme, setTheme] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (theme.trim()) {
      onStart(theme)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="w-full min-h-screen flex flex-col items-center justify-center px-6 md:px-12"
    >
      <div className="text-center space-y-4 md:space-y-8 mb-12 md:mb-20 max-w-5xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-text font-bold tracking-tight text-white"
        >
          BANDERSNATCH
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-white/60 tracking-wide"
        >
          L'histoire dont vous êtes le héros
        </motion.p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="w-full max-w-3xl"
      >
        <div className="relative group">
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Quel univers voulez-vous explorer ?"
            className="w-full bg-transparent text-center text-xl md:text-3xl text-white placeholder:text-white/30 py-6 md:py-8 border-b border-white/20 focus:border-white/60 outline-none transition-all duration-500"
            disabled={isLoading}
            autoFocus
          />

          {theme.trim() && (
            <motion.button
              type="submit"
              disabled={isLoading}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 px-6 md:px-8 py-3 md:py-4 text-sm md:text-base text-white border border-white/20 hover:border-white/60 hover:bg-white/5 rounded-full transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : "Commencer"}
            </motion.button>
          )}
        </div>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="text-white/40 text-xs md:text-sm mt-8 text-center"
      >
        Tapez votre thème et appuyez sur Entrée
      </motion.p>
    </motion.div>
  )
}
