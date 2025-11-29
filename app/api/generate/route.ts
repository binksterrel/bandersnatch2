import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { theme } = await req.json()
    if (!theme) {
      return NextResponse.json(
        { error: "Theme is required" },
        { status: 400 }
      )
    }

    console.log("[Bandersnatch] Starting story generation with theme:", theme)

    // --- 🔥 Nouveau prompt optimisé ---
    const prompt = `
Tu es un générateur d’histoires interactives conçu pour une application appelée “Bandersnatch”.

🎯 Objectif :
Créer un synopsis immersif, dynamique, parfaitement adapté au thème suivant : « ${theme} ».

🧱 Structure obligatoire du synopsis :
- Présentation rapide de l’univers (1 à 3 phrases)
- Introduction du protagoniste (1 phrase)
- Mise en place d’un objectif clair ou d’un conflit (1 à 2 phrases)
- Ton : narratif, immersif, cinématographique

🧭 Contraintes :
- L’histoire doit être en français.
- Style fluide, clair, cinématographique.
- Pas de violence extrême, pas de contenu sensible, pas de NSFW.
- Longueur entre 80 et 160 mots.
- Le texte doit être directement utilisable dans une application de narration interactive.

🎮 Choix interactifs :
Proposer exactement 3 choix, chacun :
- court (max 10 mots)
- orienté vers une action
- donnant une direction narrative différente

📌 Format imposé :
Réponds UNIQUEMENT avec un JSON strictement valide au format exact :

{
  "story": "Le synopsis ici...",
  "choices": [
    "Choix 1",
    "Choix 2",
    "Choix 3"
  ]
}

Aucun autre texte n’est autorisé avant ou après.
Interdiction d’ajouter commentaires ou explications.
`

    console.log("[Bandersnatch] Calling Groq API...")

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: "Tu es un assistant qui répond uniquement en JSON valide.",
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    console.log("[Bandersnatch] Raw API response:", text)

    // --- 🧩 Extraction du JSON ---
    let data
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : text

      console.log("[Bandersnatch] Extracted JSON string:", jsonString)

      data = JSON.parse(jsonString)
    } catch (error) {
      console.error("[Bandersnatch] JSON parse error:", error)
      console.error("[Bandersnatch] Raw content:", text)
      throw new Error("Invalid JSON response from AI")
    }

    // --- 🔍 Validation du format ---
    if (!data.story || !Array.isArray(data.choices) || data.choices.length !== 3) {
      console.error("[Bandersnatch] Invalid structure:", data)
      throw new Error("Invalid story structure from AI")
    }

    console.log("[Bandersnatch] Story successfully generated")

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Bandersnatch] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}