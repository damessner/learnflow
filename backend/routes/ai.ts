import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { requireAuth, requireRole } from '../middleware/requireAuth'
import { z } from 'zod'
import {
  createSession,
  sendPromptStructured,
  sendPrompt,
  getModelConfig,
  isOpenCodeAvailable,
} from '../services/opencode'

const ZEN_API_URL = 'https://opencode.ai/zen/v1/chat/completions'

function getZenApiKey(): string | undefined {
  return process.env.OPENCODE_ZEN_API_KEY
}

function getZenModel(): string {
  return process.env.OPENCODE_ZEN_MODEL || 'deepseek-v4-flash-free'
}

async function callZenChat(prompt: string, system?: string, stream = false, extraBody: Record<string, unknown> = {}): Promise<Response> {
  const messages: { role: string; content: string }[] = []
  if (system) messages.push({ role: 'system', content: system })
  messages.push({ role: 'user', content: prompt })
  return fetch(ZEN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getZenApiKey()}`,
    },
    body: JSON.stringify({
      model: getZenModel(),
      messages,
      stream,
      ...extraBody,
    }),
  })
}

const router = Router()

export const SUBJECTS = [
  'Mathematics',
  'German',
  'English',
  'Science',
  'History',
  'Geography',
  'Art',
  'Music',
  'Physical Education',
] as const

export const GRADE_LEVELS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const

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
    'number_line',
    'equation_entry',
    'fraction_input',
    'arithmetic_grid',
    'graph_plot',
    'geometry_shape',
    'word_problem',
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
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  markers: z.array(z.number()).optional(),
  equation: z.string().optional(),
  numerator: z.number().optional(),
  denominator: z.number().optional(),
  operand1: z.number().optional(),
  operand2: z.number().optional(),
  operation: z.string().optional(),
  grid_size: z.number().optional(),
  points_to_plot: z.array(z.tuple([z.number(), z.number()])).optional(),
  shape_type: z.string().optional(),
  measurements: z.record(z.string(), z.number()).optional(),
  problem_text: z.string().optional(),
  steps: z.array(z.object({ description: z.string(), expected: z.string() })).optional(),
  final_answer: z.string().optional(),
})

const GenerationSchema = z.object({
  blocks: z.array(BlockSchema),
})

function buildWorksheetPrompt(userPrompt: string, difficulty?: string, length?: string, lernziele?: string): string {
  const parts: string[] = [userPrompt]

  parts.push(``)
  parts.push(`Difficulty: ${difficulty || 'medium'}. Length: ${length || 'medium'}.`)
  if (lernziele) parts.push(`Learning objectives (Lernziele): ${lernziele}`)

  parts.push(``)
  parts.push(`You MUST return ONLY a JSON object with a "blocks" array. Each block is one exercise. Here are ALL supported block types and their required fields:`)
  parts.push(``)
  parts.push(`BLOCK TYPES:`)
  parts.push(`- "text": { id, type: "text", points: 0, text: "content" }`)
  parts.push(`- "gap_fill": { id, type: "gap_fill", points: N, template: "sentence with ((answer)) gaps" }`)
  parts.push(`- "multiple_choice": { id, type: "multiple_choice", points: N, text: "question", options: ["a","b","c","d"], correct: [0,2] }`)
  parts.push(`- "single_choice": { id, type: "single_choice", points: N, text: "question", options: ["a","b","c"], correct: 0 }`)
  parts.push(`- "matching": { id, type: "matching", points: N, pairs: [["left1","right1"],["left2","right2"]] }`)
  parts.push(`- "word_scramble": { id, type: "word_scramble", points: N, words: [{word:"example"},{word:"another"}] }`)
  parts.push(`- "short_answer": { id, type: "short_answer", points: N, text: "question", keywords: ["key1","key2"] }`)
  parts.push(`- "number_line": { id, type: "number_line", points: N, min_value: 0, max_value: 100, markers: [25,50,75] }`)
  parts.push(`- "equation_entry": { id, type: "equation_entry", points: N, equation: "2x + 3 = 7", final_answer: "2" }`)
  parts.push(`- "fraction_input": { id, type: "fraction_input", points: N, numerator: 1, denominator: 2 }`)
  parts.push(`- "arithmetic_grid": { id, type: "arithmetic_grid", points: N, operand1: 12, operand2: 5, operation: "add" }`)
  parts.push(`- "graph_plot": { id, type: "graph_plot", points: N, points_to_plot: [[1,2],[3,4]] }`)
  parts.push(`- "geometry_shape": { id, type: "geometry_shape", points: N, shape_type: "triangle" }`)
  parts.push(`- "word_problem": { id, type: "word_problem", points: N, problem_text: "...", steps: [{description:"Step 1",expected:"val1"}], final_answer: "answer" }`)
  parts.push(`- "vocabulary": { id, type: "vocabulary", points: N, vocabulary: { pairs: [{l:"word",r:"translation"}], direction: "l2r" } }`)
  parts.push(`- "read_aloud": { id, type: "read_aloud", points: 0, text: "passage" }`)
  parts.push(``)
  parts.push(`RULES:`)
  parts.push(`- Every block MUST have a unique "id" field (uuid format)`)
  parts.push(`- "points" should be 10 for main exercises, 5 for mini exercises, 0 for text/reading blocks`)
  parts.push(`- For difficulty "easy": use simpler vocabulary, fewer options (2-3), lower point values`)
  parts.push(`- For difficulty "hard": use complex vocabulary, more options (4-5), multi-step problems`)
  parts.push(`- For length "short": generate 2-4 blocks`)
  parts.push(`- For length "medium": generate 4-7 blocks`)
  parts.push(`- For length "long": generate 7-12 blocks`)
  parts.push(`- For "multiple_choice" and "single_choice", include "correct" field with the index/indices of the correct option(s)`)

  return parts.join('\n')
}

router.post('/generate', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const { prompt, provider, difficulty, length, lernziele } = req.body
    const blocks: z.infer<typeof BlockSchema>[] = []

    if (provider === 'opencode' && getZenApiKey()) {
      try {
        const systemPrompt = buildWorksheetPrompt(prompt, difficulty, length, lernziele)
        const response = await callZenChat(prompt, systemPrompt, false, { response_format: { type: 'json_object' } })
        const data = await response.json()
        if (response.ok) {
          const text = data.choices?.[0]?.message?.content || '{}'
          const parsed = JSON.parse(text)
          const validated = GenerationSchema.parse(parsed)
          blocks.push(...validated.blocks)
        } else {
          console.error('OpenCode Zen error:', data)
        }
      } catch (e) {
        console.error('OpenCode Zen generation failed:', e)
      }
    } else if (provider === 'opencode' && (await isOpenCodeAvailable())) {
      try {
        const sessionId = await createSession('Worksheet Generation')
        const systemPrompt = buildWorksheetPrompt(prompt, difficulty, length, lernziele)
        const result = await sendPromptStructured(sessionId, prompt, GenerationSchema as unknown as Record<string, unknown>, {
          system: systemPrompt,
          model: await getModelConfig(),
        })
        const validated = GenerationSchema.parse(result)
        blocks.push(...validated.blocks)
      } catch (e) {
        console.error('OpenCode generation failed:', e)
      }
    } else if (provider === 'ollama' && process.env.OLLAMA_URL) {
      const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'llama3',
          prompt: buildWorksheetPrompt(prompt, difficulty, length, lernziele),
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: buildWorksheetPrompt(prompt, difficulty, length, lernziele),
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

    if (process.env.DEEPSEEK_API_KEY) {
      const deepseekRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
          ],
          stream: true,
        }),
      })

      const reader = deepseekRes.body?.getReader()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = new TextDecoder().decode(value)
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
          for (const line of lines) {
            const json = line.replace('data: ', '').trim()
            if (json === '[DONE]') continue
            try {
              const parsed = JSON.parse(json)
              const text = parsed.choices?.[0]?.delta?.content || ''
              if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`)
            } catch {}
          }
        }
      }
    } else if ((await isOpenCodeAvailable()) && !process.env.OLLAMA_URL && !process.env.GEMINI_API_KEY) {
      try {
        const sessionId = await createSession('Socratic Tutor')
        const text = await sendPrompt(sessionId, question, { system: systemPrompt, model: await getModelConfig() })
        res.write(`data: ${JSON.stringify({ text })}\n\n`)
      } catch (e) {
        console.error('OpenCode tutor error:', e)
        res.write(`data: ${JSON.stringify({ text: 'AI tutor encountered an error.' })}\n\n`)
      }
    } else if (process.env.OLLAMA_URL) {
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
          const lines = chunk.split('\n').filter((l) => l.trim())
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
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
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
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

    if (getZenApiKey()) {
      try {
        const zenRes = await callZenChat(message, systemPrompt, true)
        const reader = zenRes.body?.getReader()
        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
            for (const line of lines) {
              const json = line.replace('data: ', '').trim()
              if (json === '[DONE]') continue
              try {
                const parsed = JSON.parse(json)
                const text = parsed.choices?.[0]?.delta?.content || ''
                if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`)
              } catch {}
            }
          }
        }
      } catch (e) {
        console.error('OpenCode Zen tutor error:', e)
      }
    } else if ((await isOpenCodeAvailable()) && !process.env.OLLAMA_URL && !process.env.GEMINI_API_KEY) {
      try {
        const sessionId = await createSession('Protege Student')
        const text = await sendPrompt(sessionId, message, { system: systemPrompt, model: await getModelConfig() })
        res.write(`data: ${JSON.stringify({ text })}\n\n`)
      } catch (e) {
        console.error('OpenCode protege error:', e)
        res.write(`data: ${JSON.stringify({ text: 'Uh... I got confused. Can you try explaining again?' })}\n\n`)
      }
    } else if (process.env.OLLAMA_URL) {
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
          const lines = chunk.split('\n').filter((l) => l.trim())
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
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
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
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

router.post(
  '/generate-story',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const {
        topic,
        gradeLevel,
        grammarFocus,
        vocabulary,
        questionCount,
        includeVocab,
        includeGrammar,
        difficulty,
        length,
        lernziele,
      } = req.body
      const provider = req.body.provider

      if (!topic) {
        res.status(400).json({ error: 'Topic required' })
        return
      }

      const blocks: z.infer<typeof BlockSchema>[] = []

      const storyPrompt = `Generate a complete educational story worksheet for grade ${gradeLevel || '2'} in German.

Topic: "${topic}"
${grammarFocus ? `Grammar focus: ${grammarFocus}` : ''}
${vocabulary ? `Required vocabulary words: ${vocabulary}` : ''}
${questionCount ? `Generate ${questionCount} questions` : 'Generate 5-8 questions'}
${lernziele ? `Learning objectives (Lernziele): ${lernziele}` : ''}
Difficulty: ${difficulty || 'medium'}. Length: ${length || 'medium'}.
For "easy": simpler vocabulary, shorter sentences. For "hard": complex vocabulary, multi-step comprehension.
For "short": ~3-4 blocks. For "medium": ~5-8 blocks. For "long": ~8-14 blocks.

Return ONLY valid JSON with this structure:
{
  "story": {
    "title": "short engaging title",
    "text": "the full story text, 150-350 words, age-appropriate for grade ${gradeLevel || '2'}, in German"
  },
  "blocks": [
    {
      "id": "uuid-string",
      "type": "text",
      "points": 0,
      "text": "the story text (same as above)"
    },
    {
      "id": "uuid-string", 
      "type": "multiple_choice",
      "points": 10,
      "text": "A reading comprehension question in German",
      "options": ["correct answer", "wrong 1", "wrong 2", "wrong 3"],
      "correct": [0]
    }
    ${
      includeVocab
        ? `,
    {
      "id": "uuid-string",
      "type": "gap_fill",
      "points": 5,
      "template": "sentence with a ((vocabulary word)) to fill in German"
    },
    {
      "id": "uuid-string",
      "type": "vocabulary",
      "points": 10,
      "vocabulary": {
        "pairs": [{"l": "German word", "r": "definition or translation"}],
        "direction": "l2r"
      }
    }`
        : ''
    }
    ${
      includeGrammar
        ? `,
    {
      "id": "uuid-string", 
      "type": "gap_fill",
      "points": 5,
      "template": "sentence with grammar-based ((gap)) focused on ${grammarFocus || 'the grammar topic'}"
    }`
        : ''
    }
  ]
}

Mix reading comprehension, vocabulary, and grammar exercises. All content in German.`

      if (provider === 'opencode' && getZenApiKey()) {
        try {
          const zenRes = await callZenChat(storyPrompt, undefined, false, { response_format: { type: 'json_object' } })
          const data = await zenRes.json()
          if (zenRes.ok) {
            const text = data.choices?.[0]?.message?.content || '{}'
            const parsed = JSON.parse(text)
            if (parsed.blocks) {
              for (const b of parsed.blocks) {
                if (!b.id) b.id = uuidv4()
              }
              blocks.push(...parsed.blocks)
            }
          }
        } catch (e) {
          console.error('OpenCode Zen story generation failed:', e)
        }
      } else if (provider === 'opencode' && (await isOpenCodeAvailable())) {
        try {
          const sessionId = await createSession('Story Generation')
          const result = await sendPromptStructured(sessionId, storyPrompt, GenerationSchema as unknown as Record<string, unknown>, {
            model: await getModelConfig(),
          })
          const parsed = result as { blocks?: z.infer<typeof BlockSchema>[] }
          if (parsed.blocks) {
            for (const b of parsed.blocks) {
              if (!b.id) b.id = uuidv4()
            }
            blocks.push(...parsed.blocks)
          }
        } catch (e) {
          console.error('OpenCode story generation failed:', e)
        }
      } else if (process.env.OLLAMA_URL) {
        const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || 'llama3',
            prompt: storyPrompt,
            stream: false,
            format: 'json',
          }),
        })
        const data = await response.json()
        try {
          const parsed = JSON.parse(data.response)
          if (parsed.blocks) {
            for (const b of parsed.blocks) {
              if (!b.id) b.id = uuidv4()
            }
            blocks.push(...parsed.blocks)
          }
        } catch {
          blocks.push({
            id: uuidv4(),
            type: 'text',
            points: 0,
            text: 'Story generation failed to parse.',
          })
        }
      } else if (process.env.GEMINI_API_KEY) {
        const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: storyPrompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          },
        )
        const data = await response.json()
        try {
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
          const parsed = JSON.parse(text)
          if (parsed.blocks) {
            for (const b of parsed.blocks) {
              if (!b.id) b.id = uuidv4()
            }
            blocks.push(...parsed.blocks)
          }
        } catch {
          /* */
        }
      }

      if (blocks.length === 0) {
        blocks.push({
          id: uuidv4(),
          type: 'text',
          points: 0,
          text: `Story: "${topic}" — AI generation unavailable.`,
        })
      }

      res.json({ blocks })
    } catch (err) {
      next(err)
    }
  },
)

export default router
