import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { history, choice, progression } = await req.json()

    if (!choice) {
      return NextResponse.json(
        { error: "Choice is required" },
        { status: 400 }
      )
    }

    // progression = nombre de décisions faites par le joueur
    const currentProgression = progression ?? 1
    const progressionMax = 5 // <-- tu peux changer ici pour une histoire plus longue ou plus courte

    const context = history ? history.join("\n\n") : ""

    // --- 🔥 Nouveau prompt optimisé avec FIN D’HISTOIRE ---
    const prompt = `
Tu es le moteur narratif de l'application Bandersnatch.

🎯 Mission :
Continuer l’histoire de manière cohérente en fonction du choix du joueur : « ${choice} ».

📚 Contexte complet :
${context}

📌 Informations sur la progression :
Le joueur a fait ${currentProgression} décisions jusqu'ici.
La fin doit obligatoirement arriver si progression ≥ ${progressionMax}.

🧱 Règles de continuité :
- 100 à 160 mots
- Ton immersif, narratif, cinématographique
- Le choix du joueur doit influencer directement la scène
- Pas de contenu sensible, violent ou NSFW

🎮 Règles de FIN :
Tu dois TERMINER l’histoire dans ces cas :
- si la progression du joueur est ≥ ${progressionMax}
- OU si l’intrigue arrive naturellement à une conclusion satisfaisante

Si tu décides que c’est la fin :
- Écris une conclusion claire et complète
- NE génère AUCUN nouveau choix
- Renvoie un JSON avec : "choices": []

🎮 Règles de CONTINUATION :
Si ce n’est PAS la fin :
- Crée une nouvelle scène immersive
- Propose EXACTEMENT 3 choix
- Chaque choix doit être court (max 10 mots) et orienté action

📌 Format OBLIGATOIRE (STRICT) :
La réponse doit être UNIQUEMENT ce JSON :

{
  "story": "La suite ou la fin...",
  "choices": [
    "Choix 1",
    "Choix 2",
    "Choix 3"
  ]
}

ou, en cas de fin :

{
  "story": "La conclusion finale...",
  "choices": []
}

Aucun texte avant ou après n’est autorisé.
`

    console.log("[Bandersnatch] Continuing story with choice:", choice)

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: "Tu es un assistant qui répond uniquement en JSON valide.",
      prompt,
      temperature: 0.7,
      maxTokens: 1200,
    })

    console.log("[Bandersnatch] Raw continuation response:", text)

    // --- 🧩 Extraction du JSON ---
    let data
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : text
      data = JSON.parse(jsonString)
    } catch (parseError) {
      console.error("[Bandersnatch] JSON parse error:", parseError)
      throw new Error("Invalid JSON response from AI")
    }

    // --- 🔍 Validation ---
    if (!data.story || !Array.isArray(data.choices)) {
      console.error("[Bandersnatch] Invalid structure:", data)
      throw new Error("Invalid response structure")
    }

    return NextResponse.json({
      ...data,
      progression: currentProgression + 1
    })
  } catch (error) {
    console.error("[Bandersnatch] Error continuing story:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Failed to continue story"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}