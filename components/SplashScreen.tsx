"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface SplashScreenProps {
  onContinue: () => void
}

export function SplashScreen({ onContinue }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 h-screen w-screen overflow-hidden flex items-center justify-center p-6 md:p-12"
    >
      <div className="max-w-3xl w-full space-y-12 text-center">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="hero-text font-bold tracking-tight text-white mb-">BANDERSNATCH</h1>
          <div className="h-px w-24 mx-auto bg-white/20" />
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="space-y-6"
        >
          <p className="text-lg md:text-xl text-white/70 leading-relaxed">Seconde version d'un projet universitaire</p>

          <div className="glass-card p-8 md:p-10 rounded-2xl">
            <p className="text-base md:text-lg text-white/80 leading-relaxed mb-6">
              Projet original créé par <span className="text-white font-medium">Terrel NUENTSA</span>,{" "}
              <span className="text-white font-medium">Daniel BADOYAN</span> et{" "}
              <span className="text-white font-medium">Romain THIERRY</span>
            </p>

            <div className="h-px w-full bg-white/10 my-6" />

            <p className="text-sm md:text-base text-white/60 leading-relaxed">
              Refonte complète propulsée par l'intelligence artificielle, offrant une interface modernisée et une
              intégration API pour une expérience narrative interactive optimale.
            </p>
          </div>
        </motion.div>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <Button
            onClick={onContinue}
            size="lg"
            className="px-12 py-6 text-lg bg-white text-black hover:bg-white/90 transition-all duration-300 rounded-full"
          >
            Commencer l'aventure
          </Button>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-xs md:text-sm text-white/40 tracking-wide"
        >
          V2.0 
        </motion.p>
      </div>
    </motion.div>
  )
}
