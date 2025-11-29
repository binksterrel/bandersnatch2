"use client"

import { useState } from "react"
import { AdventureSetup } from "@/components/AdventureSetup"
import { GameInterface } from "@/components/GameInterface"
import { AnimatePresence, motion } from "framer-motion"

export default function Home() {
  const [gameState, setGameState] = useState<"setup" | "playing">("setup")
  const [isLoading, setIsLoading] = useState(false)
  const [story, setStory] = useState("")
  const [choices, setChoices] = useState<string[]>([])
  const [history, setHistory] = useState<string[]>([])

  const startAdventure = async (theme: string) => {
    setIsLoading(true)
    try {
      console.log("[v0] Starting adventure with theme:", theme)
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
      console.log("[v0] Received adventure data:", data)

      if (data.story && data.choices) {
        setStory(data.story)
        setChoices(data.choices)
        setGameState("playing")
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("[v0] Failed to start adventure:", error)
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
        body: JSON.stringify({ history: newHistory, choice }),
      })
      const data = await res.json()

      if (data.story && data.choices) {
        setStory(data.story)
        setChoices(data.choices)
      }
    } catch (error) {
      console.error("Failed to continue adventure:", error)
      alert("Une erreur est survenue lors de la suite de l'aventure.")
    } finally {
      setIsLoading(false)
    }
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
            isLoading={isLoading}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
