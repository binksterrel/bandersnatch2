import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { theme } = await req.json()
    if (!theme) return NextResponse.json({ error: "Theme is required" }, { status: 400 })

    console.log("[v0] Starting story generation with theme:", theme)

    const prompt = `Tu es un assistant qui crée des histoires interactives. Crée un court synopsis pour un jeu d'aventure interactif basé sur le thème : "${theme}".
    
    Le synopsis doit inclure un résumé du monde, des personnages clés et un objectif principal pour le joueur.
    Propose exactement trois choix pour continuer l'histoire.
    
    Tu dois répondre uniquement avec un objet JSON valide dans ce format exact :
    {
      "story": "Le texte du synopsis en français",
      "choices": ["Choix 1", "Choix 2", "Choix 3"]
    }
    
    N'ajoute aucun texte avant ou après le JSON. Réponds uniquement avec le JSON.`

    console.log("[v0] Calling Groq API via AI SDK...")

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"), // Updated to use llama-3.1-8b-instant (current supported model)
      system:
        "Tu es un assistant qui répond uniquement en JSON valide. Ne réponds jamais avec du texte en dehors du JSON.",
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    console.log("[v0] Raw API response:", text)

    let data
    try {
      // Try to extract JSON from response if it contains extra text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : text
      console.log("[v0] Extracted JSON string:", jsonString)
      data = JSON.parse(jsonString)
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      console.error("[v0] Content that failed to parse:", text)
      throw new Error("Invalid JSON response from AI")
    }

    if (!data.story || !Array.isArray(data.choices) || data.choices.length !== 3) {
      console.error("[v0] Invalid data structure:", data)
      throw new Error("Invalid response structure")
    }

    console.log("[v0] Successfully parsed story data")
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error generating story:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate story"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
