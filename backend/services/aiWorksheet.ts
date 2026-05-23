import { v4 as uuidv4 } from 'uuid'
import { getKnex } from '../db/knex'

async function getSettingsValue(key: string): Promise<string | null> {
  try {
    const knex = getKnex()
    const row = await knex('settings').where({ key }).first()
    return row?.value || null
  } catch {
    return null
  }
}

async function getOllamaSettings(): Promise<{ url: string; model: string }> {
  return {
    url: (await getSettingsValue('ollama_url')) || process.env.OLLAMA_URL || 'http://localhost:11434',
    model: (await getSettingsValue('ollama_model')) || process.env.OLLAMA_MODEL || 'llama3',
  }
}

async function getGeminiSettings(): Promise<{ apiKey: string }> {
  return {
    apiKey: (await getSettingsValue('gemini_api_key')) || process.env.GEMINI_API_KEY || '',
  }
}

interface AIRequest {
  provider: 'gemini' | 'ollama'
  prompt: string
}

interface Block {
  id: string
  type: string
  points: number
  [key: string]: unknown
}

export async function generateWorksheetFromAI(req: AIRequest): Promise<Block[]> {
  const blocks: Block[] = []

  if (req.provider === 'ollama') {
    const settings = await getOllamaSettings()
    try {
      const response = await fetch(`${settings.url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.model,
          prompt: `Create an educational worksheet with interactive exercise blocks from this prompt: "${req.prompt}". Return valid JSON with a "blocks" array. Each block has id (uuid), type, points, and type-specific fields.`,
          stream: false,
        }),
      })
      const data = await response.json()
      try {
        const parsed = JSON.parse(data.response)
        blocks.push(...((parsed.blocks || []) as Block[]))
      } catch {
        blocks.push({ id: uuidv4(), type: 'text', points: 0, text: 'AI generated: raw response received.' })
      }
    } catch { /* offline, return placeholder */ }
  } else if (req.provider === 'gemini') {
    const settings = await getGeminiSettings()
    if (!settings.apiKey) return blocks

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${settings.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate a JSON array of interactive worksheet blocks from: "${req.prompt}". Each has: id(uuid), type(gap_fill|multiple_choice|single_choice|matching|drag_drop|short_answer|text), points(number), and type-specific fields. Return ONLY JSON.`,
              }],
            }],
          }),
        },
      )
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) blocks.push(...(JSON.parse(jsonMatch[0]) as Block[]))
    } catch { /* */ }
  }

  if (blocks.length === 0) {
    blocks.push({
      id: uuidv4(),
      type: 'gap_fill',
      points: 10,
      template: `${req.prompt}: The answer is ((example)). Complete ((sentence)).`,
    })
  }

  return blocks
}

export async function generateNeuroVocabCourse(rawList: string): Promise<Block[]> {
  const words = rawList.split(/[\n,]+/).filter(Boolean).map((w) => w.trim())

  return [{
    id: uuidv4(),
    type: 'vocabulary',
    points: words.length * 2,
    vocabulary: {
      pairs: words.map((w) => ({ l: w, r: `[${w}]` })),
      direction: 'l2r',
    },
    rawText: rawList,
  }]
}
