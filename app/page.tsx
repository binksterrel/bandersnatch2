"use client"

import { useState } from "react"
import { AdventureSetup } from "@/components/AdventureSetup"
import { GameInterface } from "@/components/GameInterface"
import { SplashScreen } from "@/components/SplashScreen"
import { AnimatePresence, motion } from "framer-motion"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [gameState, setGameState] = useState<"setup" | "playing">("setup")
  const [isLoading, setIsLoading] = useState(false)
  const [story, setStory] = useState("")
  const [choices, setChoices] = useState<string[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [progression, setProgression] = useState(0)

  const startAdventure = async (theme: string) => {
    setIsLoading(true)
    try {
      console.log("[Bandersnatch] Starting adventure with theme:", theme)
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to start adventure")
      }

      const data = await res.json()
      console.log("[Bandersnatch] Received adventure data:", data)

      if (data.story && data.choices) {
        setStory(data.story)
        setChoices(data.choices)
        setHistory([])
        setProgression(1)
        setGameState("playing")
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("[Bandersnatch] Failed to start adventure:", error)
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue"
      alert(`Failed to start adventure: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChoice = async (choice: string) => {
    setIsLoading(true)
    // Add current story and choice to history
    const newHistory = [...history, story, `> ${choice}`]
    setHistory(newHistory)

    try {
      const res = await fetch("/api/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          history: newHistory, 
          choice,
          progression 
        }),
      })
      const data = await res.json()

      if (data.story && Array.isArray(data.choices)) {
        setStory(data.story)
        setChoices(data.choices)
        if (data.progression) {
          setProgression(data.progression)
        }
      }
    } catch (error) {
      console.error("Failed to continue adventure:", error)
      alert("Une erreur est survenue lors de la suite de l'aventure.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndStory = async () => {
    if (!confirm("Voulez-vous vraiment terminer l'histoire maintenant ?")) return

    setIsLoading(true)
    const choice = "Je décide de mettre fin à l'aventure maintenant."
    const newHistory = [...history, story, `> ${choice}`]
    setHistory(newHistory)

    try {
      const res = await fetch("/api/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          history: newHistory, 
          choice,
          progression: 10 // Force end by exceeding max progression
        }),
      })
      const data = await res.json()

      if (data.story) {
        setStory(data.story)
        setChoices([]) // Clear choices to end game
        setProgression(10)
      }
    } catch (error) {
      console.error("Failed to end adventure:", error)
      alert("Impossible de terminer l'histoire.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (confirm("Êtes-vous sûr de vouloir quitter ? Votre progression sera perdue.")) {
      window.speechSynthesis.cancel()
      setGameState("setup")
      setStory("")
      setChoices([])
      setHistory([])
      setProgression(0)
    }
  }

  if (showSplash) {
    return <SplashScreen onContinue={() => setShowSplash(false)} />
  }

  return (
    <AnimatePresence mode="wait">
      {gameState === "setup" ? (
        <motion.div
          key="setup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full"
        >
          <AdventureSetup onStart={startAdventure} isLoading={isLoading} />
        </motion.div>
      ) : (
        <motion.div
          key="game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full"
        >
          <GameInterface
            story={story}
            choices={choices}
            history={history}
            onChoice={handleChoice}
            onEnd={handleEndStory}
            onBack={handleBack}
            isLoading={isLoading}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
