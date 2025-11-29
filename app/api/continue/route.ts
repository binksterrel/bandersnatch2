import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { history, choice } = await req.json()
    if (!choice) return NextResponse.json({ error: "Choice is required" }, { status: 400 })

    const context = history ? history.join("\n\n") : ""

    const prompt = `Continue l'histoire basée sur le choix suivant : "${choice}".
    Voici l'histoire jusqu'à présent :
    ${context}
    
    Écris la suite de l'histoire (environ 100-150 mots) et propose exactement trois nouveaux choix.
    
    Réponds UNIQUEMENT au format JSON avec la structure suivante :
    {
      "story": "La suite de l'histoire...",
      "choices": ["Nouveau choix 1", "Nouveau choix 2", "Nouveau choix 3"]
    }`

    console.log("[v0] Continuing story with choice:", choice)

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system:
        "Tu es un assistant qui répond uniquement en JSON valide. Ne réponds jamais avec du texte en dehors du JSON.",
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    console.log("[v0] Raw continuation response:", text)

    let data
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : text
      data = JSON.parse(jsonString)
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      throw new Error("Invalid JSON response from AI")
    }

    if (!data.story || !Array.isArray(data.choices) || data.choices.length !== 3) {
      console.error("[v0] Invalid data structure:", data)
      throw new Error("Invalid response structure")
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error continuing story:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to continue story"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
