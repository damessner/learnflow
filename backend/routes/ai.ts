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
  correctIndices: z.array(z.number()).optional(),
  correctIndex: z.number().optional(),
  pairs: z.array(z.tuple([z.string(), z.string()])).optional(),
  words: z.array(z.object({ word: z.string() })).optional(),
  expected: z.array(z.string()).optional(),
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
          prompt: `Create an educational worksheet with interactive exercise blocks from this prompt: "${prompt}". Return ONLY valid JSON with a "blocks" array. Each block has id, type, points, and type-specific fields matching this schema.`,
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
                    text: `Generate a JSON array of interactive worksheet blocks for an educational platform. Prompt: "${prompt}". Each block has id (uuid string), type (one of: gap_fill, multiple_choice, single_choice, matching, short_answer, text), points (number), and type-specific fields. Return ONLY valid JSON with {"blocks": [...]}.`,
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

    // Ensure IDs
    blocks.forEach((b) => {
      if (!b.id) b.id = uuidv4()
    })

    res.json({ blocks })
  } catch (err) {
    next(err)
  }
})

router.post('/tutor', requireAuth, async (req, res, next) => {
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

export default router
