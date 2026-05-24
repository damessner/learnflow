import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { requireAuth, requireRole } from '../middleware/requireAuth'
import { z } from 'zod'

const router = Router()

const BlockSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum([
    'text',
    'read_aloud',
    'gap_fill',
    'multiple_choice',
    'single_choice',
    'matching',
    'word_scramble',
    'short_answer',
  ]),
  points: z.number().optional().default(1),
  text: z.string().optional(),
  template: z.string().optional(),
  options: z.array(z.string()).optional(),
  correct: z.union([z.number(), z.array(z.number())]).optional(),
  correctIndices: z.array(z.number()).optional(),
  correctIndex: z.number().optional(),
  pairs: z.array(z.tuple([z.string(), z.string()])).optional(),
  words: z.array(z.object({ word: z.string() })).optional(),
  expected: z.array(z.string()).optional(),
  kc_ids: z.array(z.string().uuid()).optional(),
  mermaid: z.string().optional(),
  alt_text: z.string().optional(),
})

const GenerationSchema = z.object({
  blocks: z.array(BlockSchema),
})

router.post('/generate', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const { prompt, provider } = req.body
    const blocks: z.infer<typeof BlockSchema>[] = []

    if (provider === 'ollama' && process.env.OLLAMA_URL) {
      const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'llama3',
          prompt: `Create an educational worksheet with interactive exercise blocks from this prompt: "${prompt}". Return ONLY valid JSON with a "blocks" array. Each block has id, type, points, and type-specific fields matching this schema. For "single_choice", include a "correct" field (integer index of correct option, 0-indexed). For "multiple_choice", include a "correct" field (array of integer indices of correct options, 0-indexed). For concepts involving processes, hierarchies, or relationships, include a "mermaid" field with valid Mermaid.js syntax (graph TD/LR, flowchart, sequenceDiagram) and an "alt_text" field describing the diagram.`,
          stream: false,
          format: 'json',
        }),
      })
      const data = await response.json()
      try {
        const parsed = JSON.parse(data.response)
        const validated = GenerationSchema.parse(parsed)
        blocks.push(...validated.blocks)
      } catch (e) {
        console.error('Validation failed for Ollama:', e)
        blocks.push({
          id: uuidv4(),
          type: 'text',
          points: 0,
          text: 'AI generation responded, but format was invalid.',
        })
      }
    } else if (process.env.GEMINI_API_KEY) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate a JSON array of interactive worksheet blocks for an educational platform. Prompt: "${prompt}". Each block has id (uuid string), type (one of: gap_fill, multiple_choice, single_choice, matching, short_answer, text), points (number), and type-specific fields. For "single_choice", include a "correct" field (integer index of correct option, 0-indexed). For "multiple_choice", include a "correct" field (array of integer indices of correct options, 0-indexed). For abstract concepts, include a "mermaid" field with Mermaid.js syntax (graph TD/LR, flowchart, or sequenceDiagram) and an "alt_text" accessibility description. Return ONLY valid JSON with {"blocks": [...]}.`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        },
      )
      const data = await response.json()
      try {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
        const parsed = JSON.parse(text)
        const validated = GenerationSchema.parse(parsed)
        blocks.push(...validated.blocks)
      } catch (e) {
        console.error('Validation failed for Gemini:', e)
      }
    }

    if (blocks.length === 0) {
      blocks.push({
        id: uuidv4(),
        type: 'text',
        points: 0,
        text: 'AI failed to generate valid blocks. Please try a different prompt.',
      })
    }

    // Ensure IDs and map correct formats
    blocks.forEach((b) => {
      if (!b.id) b.id = uuidv4()
      if (b.correct === undefined) {
        if (b.correctIndex !== undefined) {
          b.correct = b.correctIndex
        } else if (b.correctIndices !== undefined) {
          b.correct = b.correctIndices
        }
      }
    })

    res.json({ blocks })
  } catch (err) {
    next(err)
  }
})

router.post('/tutor', requireAuth, async (req, res, _next) => {
  try {
    const { question, context } = req.body

    // Server-Sent Events (SSE) setup
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const systemPrompt = `You are an AI Socratic Tutor for a student. 
Context of what they are working on: ${context}
Student asks: ${question}

Rules based on Neurological Research (Active Recall / Cognitive Load Theory):
1. DO NOT give the direct answer.
2. Ask a guiding question to help the student realize the answer themselves.
3. Keep it brief (1-3 sentences).
4. Be encouraging.`

    if (process.env.OLLAMA_URL) {
      const ollamaRes = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'llama3',
          prompt: systemPrompt,
          stream: true,
        }),
      })

      const reader = ollamaRes.body?.getReader()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = new TextDecoder().decode(value)
          const lines = chunk.split('\\n').filter((l) => l.trim())
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line)
              res.write(`data: ${JSON.stringify({ text: parsed.response })}\n\n`)
            } catch {}
          }
        }
      }
    } else if (process.env.GEMINI_API_KEY) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
          }),
        },
      )

      const reader = geminiRes.body?.getReader()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = new TextDecoder().decode(value)
          // Gemini SSE sends `data: {"candidates": ...}`
          const lines = chunk.split('\\n').filter((l) => l.startsWith('data: '))
          for (const line of lines) {
            try {
              const json = line.replace('data: ', '')
              const parsed = JSON.parse(json)
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
              if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`)
            } catch {}
          }
        }
      }
    } else {
      res.write(`data: ${JSON.stringify({ text: 'AI is not configured. Ask your teacher!' })}\n\n`)
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    console.error('Tutor error:', err)
    res.write('data: [DONE]\n\n')
    res.end()
  }
})

router.post('/protege', requireAuth, async (req, res, _next) => {
  try {
    const { kcName, kcDescription, message } = req.body

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const misconceptions = getMisconceptions(kcName)

    const systemPrompt = `You are a confused student trying to learn about: "${kcName}".
Description: ${kcDescription}

You currently believe these misconceptions (use 1-2):
${misconceptions.map((m: string) => `- ${m}`).join('\n')}

The user is your peer/teacher who will try to explain this to you.

Rules (Protégé Effect / Feynman Technique):
1. You are genuinely confused and need the user to teach you.
2. Make ONE specific mistake or ask ONE focused clarifying question at a time.
3. When the user explains well, gradually realize your error. Say things like "Oh! So you mean..." or "Wait, I think I get it now..."
4. If the user explains correctly, celebrate: "That makes so much more sense now!"
5. Keep responses to 2-4 sentences.
6. NEVER act like a tutor - you are the student.

Student asks/explains: ${message}`

    if (process.env.OLLAMA_URL) {
      const ollamaRes = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'llama3',
          prompt: systemPrompt,
          stream: true,
        }),
      })

      const reader = ollamaRes.body?.getReader()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = new TextDecoder().decode(value)
          const lines = chunk.split('\\n').filter((l) => l.trim())
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line)
              res.write(`data: ${JSON.stringify({ text: parsed.response })}\n\n`)
            } catch {}
          }
        }
      }
    } else if (process.env.GEMINI_API_KEY) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
          }),
        },
      )

      const reader = geminiRes.body?.getReader()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = new TextDecoder().decode(value)
          const lines = chunk.split('\\n').filter((l) => l.startsWith('data: '))
          for (const line of lines) {
            try {
              const json = line.replace('data: ', '')
              const parsed = JSON.parse(json)
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
              if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`)
            } catch {}
          }
        }
      }
    } else {
      res.write(
        `data: ${JSON.stringify({ text: 'Uh... I am confused about this too, but the AI tutor is not configured. Maybe you can write a short explanation for me?' })}\n\n`,
      )
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    console.error('Protege error:', err)
    res.write('data: [DONE]\n\n')
    res.end()
  }
})

function getMisconceptions(kcName: string): string[] {
  const lower = kcName.toLowerCase()
  if (lower.includes('fraction'))
    return [
      'I think 1/2 is bigger than 3/4 because 2 is smaller than 4',
      'I add fractions by adding tops and bottoms: 1/2 + 1/3 = 2/5',
    ]
  if (lower.includes('algebra') || lower.includes('variable'))
    return [
      'I think x + 3 = 7 means x = 4 because I subtract 3 from 7',
      'I get confused when there are variables on both sides of the equation',
    ]
  if (lower.includes('decimal'))
    return [
      'I think 0.5 is smaller than 0.35 because 5 is smaller than 35',
      "I'm not sure where to put the decimal point when multiplying",
    ]
  if (lower.includes('percent') || lower.includes('percentage'))
    return [
      'I think 50% of 200 is 100, but 25% of 200 is also 100 because 25 > 50',
      'I confuse percentage increase with percentage points',
    ]
  if (lower.includes('geometry') || lower.includes('angle'))
    return [
      'I think all triangles have angles that add up to 180, but squares add up to 360 so they must be the same',
      'I get acute and obtuse angles confused',
    ]
  if (lower.includes('grammar') || lower.includes('verb') || lower.includes('tense'))
    return [
      'I keep mixing up past tense and past participle',
      "I'm not sure when to use 'who' vs 'whom'",
    ]
  return [
    `I'm not sure I understand ${kcName} at all. Can you explain it from the beginning?`,
    `I keep mixing up the steps. Is it step A first, then B, or B first then A?`,
  ]
}

export default router
