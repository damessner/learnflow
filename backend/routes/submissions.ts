import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'
import { scoreAnswers } from './scoring'
import { reviewKnowledgeComponent } from '../services/srs'
import { addXp, updateStreak, awardActivityBadges } from '../services/gamification'
import { Rating } from 'ts-fsrs'
import { z } from 'zod'
import {
  createSession,
  sendPromptStructured,
  getModelConfig,
  isOpenCodeAvailable,
} from '../services/opencode'

const router = Router()

const MAX_REMEDIATION_ROUNDS = 3
const REMEDIATION_TIMEOUT_MS = 60_000

const RemediationExerciseSchema = z
  .object({
    title: z.string(),
    type: z.string(),
    id: z.string().optional(),
    points: z.number().optional(),
    kc_ids: z.array(z.string()).optional(),
    template: z.string().optional(),
    pairs: z.array(z.tuple([z.string(), z.string()])).optional(),
    options: z.array(z.string()).optional(),
    correct: z.union([z.array(z.number()), z.number()]).optional(),
    keywords: z.array(z.string()).optional(),
    sampleAnswer: z.string().optional(),
    words: z.array(z.object({ word: z.string() })).optional(),
    markers: z.array(z.number()).optional(),
    range: z.tuple([z.number(), z.number()]).optional(),
    equation: z.string().optional(),
    final_answer: z.string().optional(),
    numerator: z.number().optional(),
    denominator: z.number().optional(),
    operand1: z.number().optional(),
    operand2: z.number().optional(),
    operation: z.string().optional(),
    points_to_plot: z.array(z.tuple([z.number(), z.number()])).optional(),
    shape_type: z.string().optional(),
    problem_text: z.string().optional(),
    steps: z.array(z.object({ description: z.string(), expected: z.string() })).optional(),
    statement: z.string().optional(),
    items: z.array(z.string()).optional(),
    correct_order: z.array(z.number()).optional(),
    value: z.number().optional(),
    total: z.number().optional(),
    from_value: z.number().optional(),
    from_unit: z.string().optional(),
    to_unit: z.string().optional(),
    angle_value: z.number().optional(),
    angle_type: z.string().optional(),
    columns: z.array(z.string()).optional(),
    rows: z.array(z.string()).optional(),
    sentence: z.string().optional(),
    audioText: z.string().optional(),
    voice: z.string().optional(),
    audioUrl: z.string().optional(),
    reason: z.string().optional(),
  })
  .passthrough()

const RemediationResultSchema = z.object({
  summary: z.string(),
  misconceptions: z.array(z.string()).default([]),
  custom_instructions: z.array(z.string()).default([]),
  mermaid: z.string().optional(),
  exercises: z.array(RemediationExerciseSchema).default([]),
})

type BlockScore = { blockId: string; score: number; maxScore: number }

function normalizeBlockText(block: Record<string, unknown>): string {
  return String(
    block.text || block.problem_text || block.template || block.title || block.type || '',
  )
}

const SUPPORTED_EXERCISE_TYPES = new Set([
  'gap_fill',
  'matching',
  'multiple_choice',
  'single_choice',
  'short_answer',
  'word_scramble',
  'true_false',
  'ordering',
  'info',
  'text',
  'read_aloud',
  'drawing',
  'vocabulary',
  'semantic_sorter',
  'flashcards',
  'drag_words',
  'correct_words',
  'question_table',
  'crossword',
  'audio_match',
  'dictation',
  'word_search',
  'sentence_builder',
  'odd_one_out',
])

const FREE_TEXT_EXERCISE_TYPES = new Set(['short_answer', 'dictation', 'odd_one_out'])

function inferExercisePoints(exercise: Record<string, unknown>): number {
  const type = String(exercise.type || '')
  const explicitPoints = Number(exercise.points)
  if (Number.isFinite(explicitPoints) && explicitPoints > 0) return Math.round(explicitPoints)

  switch (type) {
    case 'gap_fill':
    case 'drag_words':
    case 'correct_words': {
      const template = String(exercise.template || '')
      return Math.max(1, (template.match(/\(\(.*?\)\)/g) || []).length * 2)
    }
    case 'matching':
    case 'audio_match': {
      const pairs = (exercise.pairs || []) as unknown[]
      return Math.max(1, pairs.length * 2)
    }
    case 'word_scramble': {
      const words = (exercise.words || []) as unknown[]
      return Math.max(1, words.length * 2)
    }
    case 'ordering': {
      const items = (exercise.items || []) as unknown[]
      return Math.max(1, items.length * 2)
    }
    case 'vocabulary': {
      const pairs = ((exercise.vocabulary as Record<string, unknown>)?.pairs || []) as unknown[]
      return Math.max(1, pairs.length * 2)
    }
    case 'semantic_sorter': {
      const categories = (exercise.categories || []) as Array<{ words?: unknown[] }>
      let totalItems = 0
      for (const cat of categories) {
        totalItems += (cat.words || []).length
      }
      return Math.max(1, totalItems * 2)
    }
    case 'question_table': {
      const rows = (exercise.rows || []) as unknown[]
      return Math.max(1, rows.length * 2)
    }
    case 'crossword': {
      const words = (exercise.words || []) as unknown[]
      return Math.max(1, words.length * 2)
    }
    case 'word_search': {
      const words = (exercise.words || []) as unknown[]
      return Math.max(1, words.length * 2)
    }
    case 'dictation':
      return 8
    case 'sentence_builder':
      return 6
    case 'odd_one_out':
      return 6
    case 'multiple_choice': {
      const opts = (exercise.options || []) as unknown[]
      return Math.max(1, opts.length > 4 ? 2 : 1)
    }
    case 'single_choice':
      return 1
    case 'true_false':
      return 1
    default:
      return 1
  }
}

function normalizeRemediationExercises(
  rawExercises: Record<string, unknown>[],
): Record<string, unknown>[] {
  const valid: Record<string, unknown>[] = []
  for (const ex of rawExercises) {
    if (!ex || typeof ex !== 'object') continue
    const type = String(ex.type || '')
    if (!SUPPORTED_EXERCISE_TYPES.has(type)) continue
    if (typeof ex.title !== 'string' || !ex.title.trim()) continue
    // Assign id if missing
    const normalized = { ...ex }
    if (!normalized.id || typeof normalized.id !== 'string') {
      normalized.id = uuidv4()
    }
    // Infer points
    normalized.points = inferExercisePoints(normalized)
    valid.push(normalized)
  }
  return valid
}

function getRemediationPromptVariant(): 'A' | 'B' {
  return Math.random() < 0.5 ? 'A' : 'B'
}

function getVariantInstruction(variant: 'A' | 'B'): string {
  if (variant === 'A') {
    return [
      'INSTRUCTION STYLE: DIRECT CORRECTIVE',
      '- Clearly state the correct answer for each exercise.',
      "- Explain step-by-step why the student's original answer was incorrect.",
      '- Provide the correct method or rule explicitly.',
      '- Use direct, clear language without rhetorical questions.',
      '- Example: "The correct answer is X because Y. Your answer was Z because you forgot to..."',
    ].join('\n')
  }
  return [
    'INSTRUCTION STYLE: SOCRATIC GUIDED',
    '- Do NOT give away answers directly.',
    '- Ask guiding questions that help the student discover the correct answer.',
    '- Use phrases like "What would happen if..." and "How could we check this?"',
    '- Encourage self-correction through targeted prompts.',
    '- Praise partial understanding and build on it with further questions.',
    '- Example: "Think about what happens when we multiply both sides by 2..."',
  ].join('\n')
}

function buildPriorRoundsContext(rounds: Record<string, unknown>[]): string {
  if (rounds.length === 0) return ''
  const lines: string[] = ['PRIOR REMEDIATION ROUNDS:']
  for (const r of rounds) {
    const roundNum = r.round_number || '?'
    const analysis = JSON.parse(String(r.analysis_json || '{}'))
    const summary = analysis.summary || ''
    const exes = JSON.parse(String(r.exercises_json || '[]'))
    const titles = (Array.isArray(exes) ? exes : [])
      .map(
        (e: Record<string, unknown>) => `  - "${e.title || 'Untitled'}" (${e.type || 'unknown'})`,
      )
      .join('\n')
    lines.push(`Round ${roundNum}: ${summary}`)
    if (titles) lines.push(`Exercises already given:\n${titles}`)
  }
  lines.push('')
  lines.push(
    'CRITICAL: Do NOT repeat or closely paraphrase any of the above exercises. Create entirely new exercises that target the same concepts from a different angle.',
  )
  return lines.join('\n')
}

function buildDifficultyCalibration(
  wrongDetails: { blockText: string; blockType: string; score: number; maxScore: number }[],
): string {
  if (wrongDetails.length === 0) return ''
  const lines: string[] = ['DIFFICULTY CALIBRATION PER MISTAKE:']
  for (const w of wrongDetails) {
    const ratio = w.maxScore > 0 ? w.score / w.maxScore : 0
    let level = 'prerequisite'
    if (ratio >= 0.7) level = 'hint'
    else if (ratio >= 0.3) level = 'scaffold'
    lines.push(
      `- "${w.blockText}" (${w.blockType}): score=${w.score}/${w.maxScore} (ratio=${ratio.toFixed(2)}) -> difficulty=${level}`,
    )
  }
  lines.push('')
  lines.push('Calibration rules for generated exercises:')
  lines.push(
    '- "hint" difficulty: Student nearly got it. Generate exercises with subtle hints that nudge them to the correct answer.',
  )
  lines.push(
    '- "scaffold" difficulty: Student has partial understanding. Break the concept into smaller steps or sub-skills.',
  )
  lines.push(
    '- "prerequisite" difficulty: Student lacks foundational knowledge. Generate exercises on prerequisite concepts first, then build up.',
  )
  return lines.join('\n')
}

function validateResponseTextLength(type: string, value: unknown): boolean {
  if (value === null || value === undefined) return false
  const str = String(value).trim()
  if (str.length === 0) return false
  if (FREE_TEXT_EXERCISE_TYPES.has(type)) {
    return str.length >= 10
  }
  return true
}

async function generateRemediationWithOpenCode(
  prompt: string,
): Promise<z.infer<typeof RemediationResultSchema> | null> {
  if (!(await isOpenCodeAvailable())) return null
  try {
    const sessionId = await createSession('Submission Remediation')
    const structured = await sendPromptStructured(
      sessionId,
      prompt,
      RemediationResultSchema as unknown as Record<string, unknown>,
      {
        model: await getModelConfig(),
      },
    )
    return RemediationResultSchema.parse(structured)
  } catch {
    return null
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = REMEDIATION_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function generateRemediationWithGemini(
  prompt: string,
): Promise<z.infer<typeof RemediationResultSchema> | null> {
  if (!process.env.GEMINI_API_KEY) return null
  try {
    const response = await fetchWithTimeout(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    )

    const data = await response.json()
    if (!response.ok) return null
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    return RemediationResultSchema.parse(JSON.parse(text))
  } catch {
    return null
  }
}

async function generateRemediation(
  prompt: string,
): Promise<z.infer<typeof RemediationResultSchema> | null> {
  const gemini = await generateRemediationWithGemini(prompt)
  if (gemini) return gemini
  return generateRemediationWithOpenCode(prompt)
}

router.get('/assignment/:id', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const assignment = await knex('assignments').where({ id: req.params.id }).first()
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' })
      return
    }

    if (req.user!.role === 'student' && assignment.class_id) {
      const enrolled = await knex('class_students')
        .where({ class_id: assignment.class_id, student_id: req.user!.userId })
        .first()
      if (!enrolled) {
        res.status(403).json({ error: 'You are not enrolled in this class' })
        return
      }
    }

    let submission = await knex('submissions')
      .where({ assignment_id: assignment.id, user_id: req.user!.userId })
      .first()

    if (!submission) {
      const id = uuidv4()
      await knex('submissions').insert({
        id,
        assignment_id: assignment.id,
        user_id: req.user!.userId,
        answers: '{}',
        score: null,
        max_score: null,
      })
      submission = await knex('submissions').where({ id }).first()
    }

    const worksheet = await knex('worksheets').where({ id: assignment.worksheet_id }).first()

    if (req.user!.role === 'student' && worksheet) {
      try {
        const content = JSON.parse(worksheet.content)
        if (content.blocks) {
          content.blocks = content.blocks.map((b: Record<string, unknown>) => {
            const stripped = { ...b }
            delete stripped.correct
            delete stripped.answers
            if (b.type === 'multiple_choice' && b.options) {
              stripped.options = [...(b.options as unknown[])].sort(() => Math.random() - 0.5)
            }
            return stripped
          })
        }
        worksheet.content = JSON.stringify(content)
      } catch {
        /* keep original */
      }
    }

    let peerReviews: unknown[] = []
    if (assignment.peer_review_enabled) {
      peerReviews = await knex('peer_reviews').where({ assignment_id: assignment.id })
    }

    res.json({
      submission,
      assignment,
      worksheet,
      peerReviews,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/assignment/:id/save', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const answers = JSON.stringify(req.body.answers || {})

    await knex('submissions')
      .where({ assignment_id: req.params.id, user_id: req.user!.userId })
      .update({ answers, updated_at: knex.fn.now() })

    res.json({ message: 'Progress saved' })
  } catch (err) {
    next(err)
  }
})

router.get('/assignment/:id/remediation', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const submission = await knex('submissions')
      .where({ assignment_id: req.params.id, user_id: req.user!.userId })
      .first()

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' })
      return
    }

    const assignment = await knex('assignments').where({ id: req.params.id }).first()
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' })
      return
    }

    const worksheet = await knex('worksheets').where({ id: assignment.worksheet_id }).first()
    if (!worksheet) {
      res.status(404).json({ error: 'Worksheet not found' })
      return
    }

    let blocks: Record<string, unknown>[] = []
    try {
      const content = JSON.parse(worksheet.content || '{}')
      blocks = Array.isArray(content.blocks) ? content.blocks : []
    } catch {
      blocks = []
    }

    const answers = submission.answers ? JSON.parse(submission.answers) : {}
    const score = scoreAnswers(
      blocks as Array<{ id: string; type: string; points: number }>,
      answers,
    )
    const wrong = score.blockScores.filter((b) => b.maxScore > 0 && b.score < b.maxScore)

    const rounds = await knex('submission_remediation_rounds')
      .where({ submission_id: submission.id })
      .orderBy('round_number', 'asc')

    res.json({
      submissionId: submission.id,
      assignmentId: assignment.id,
      worksheetId: worksheet.id,
      worksheetTitle: worksheet.title,
      score: submission.score,
      maxScore: submission.max_score,
      roundsUsed: rounds.length,
      roundsLeft: Math.max(0, MAX_REMEDIATION_ROUNDS - rounds.length),
      canGenerateRound:
        !!submission.submitted_at && wrong.length > 0 && rounds.length < MAX_REMEDIATION_ROUNDS,
      wrongBlocks: wrong.map((w) => {
        const block = blocks.find((b) => String(b.id) === w.blockId) || {
          id: w.blockId,
          type: 'unknown',
        }
        return {
          blockId: w.blockId,
          blockType: String(block.type || 'unknown'),
          blockText: normalizeBlockText(block),
          score: w.score,
          maxScore: w.maxScore,
          userAnswer: answers[w.blockId],
        }
      }),
      rounds: rounds.map((r: Record<string, unknown>) => ({
        id: r.id,
        round_number: r.round_number,
        created_at: r.created_at,
        analysis: JSON.parse(String(r.analysis_json || '{}')),
        exercises: JSON.parse(String(r.exercises_json || '[]')),
      })),
    })
  } catch (err) {
    next(err)
  }
})

router.post('/assignment/:id/remediation/generate', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const submission = await knex('submissions')
      .where({ assignment_id: req.params.id, user_id: req.user!.userId })
      .first()

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' })
      return
    }

    if (!submission.submitted_at) {
      res.status(400).json({ error: 'Submit the assignment first' })
      return
    }

    const assignment = await knex('assignments').where({ id: req.params.id }).first()
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' })
      return
    }

    const worksheet = await knex('worksheets').where({ id: assignment.worksheet_id }).first()
    if (!worksheet) {
      res.status(404).json({ error: 'Worksheet not found' })
      return
    }

    const rounds = await knex('submission_remediation_rounds')
      .where({ submission_id: submission.id })
      .orderBy('round_number', 'asc')

    if (rounds.length >= MAX_REMEDIATION_ROUNDS) {
      res
        .status(400)
        .json({ error: `Maximum ${MAX_REMEDIATION_ROUNDS} remediation rounds reached` })
      return
    }

    let blocks: Record<string, unknown>[] = []
    try {
      const content = JSON.parse(worksheet.content || '{}')
      blocks = Array.isArray(content.blocks) ? content.blocks : []
    } catch {
      blocks = []
    }

    const answers = submission.answers ? JSON.parse(submission.answers) : {}
    const score = scoreAnswers(
      blocks as Array<{ id: string; type: string; points: number }>,
      answers,
    )
    const wrong = score.blockScores.filter((b) => b.maxScore > 0 && b.score < b.maxScore)

    if (wrong.length === 0) {
      res.status(400).json({ error: 'No mistakes found for remediation' })
      return
    }

    const wrongDetails = wrong.map((w: BlockScore) => {
      const block = blocks.find((b) => String(b.id) === w.blockId) || {
        id: w.blockId,
        type: 'unknown',
      }
      return {
        blockId: w.blockId,
        blockType: String(block.type || 'unknown'),
        blockText: normalizeBlockText(block),
        score: w.score,
        maxScore: w.maxScore,
        userAnswer: answers[w.blockId],
      }
    })

    const variant = getRemediationPromptVariant()
    const priorContext = buildPriorRoundsContext(rounds)
    const difficultyCal = buildDifficultyCalibration(wrongDetails)
    const variantInst = getVariantInstruction(variant)

    const prompt = [
      'You are an expert teacher remediation assistant.',
      `Worksheet: ${worksheet.title}`,
      worksheet.subject ? `Subject: ${worksheet.subject}` : '',
      worksheet.grade_level ? `Grade: ${worksheet.grade_level}` : '',
      `Student score: ${submission.score ?? 0}/${submission.max_score ?? 0}`,
      '',
      priorContext,
      '',
      'The following mistakes were made:',
      JSON.stringify(wrongDetails, null, 2),
      '',
      difficultyCal,
      '',
      variantInst,
      '',
      'Return remediation JSON with this exact schema:',
      JSON.stringify(
        {
          summary: 'Brief summary of student issues and mistakes, explaining the errors clearly.',
          misconceptions: ['list of misconceptions found'],
          custom_instructions: ['practical next steps for this student'],
          mermaid: 'optional mermaid diagram code',
          exercises: [
            {
              title: 'Exercise title',
              type: 'gap_fill|matching|multiple_choice|single_choice|short_answer|word_scramble|true_false|ordering|vocabulary|semantic_sorter|flashcards|drag_words|correct_words|question_table|crossword|audio_match|dictation|word_search|sentence_builder|odd_one_out',
              // Type-specific fields (see rules below):
              template: 'Text with ((gap)) placeholders or ((wrong/correct)) placeholders', // for gap_fill, drag_words, correct_words
              pairs: [['left', 'right']], // for matching, audio_match
              options: ['A', 'B', 'C', 'D'], // for multiple_choice / single_choice
              correct: 0, // for single_choice (index), true_false (0/1), odd_one_out (index)
              keywords: ['kw1', 'kw2'], // for short_answer
              sampleAnswer: 'expected answer', // for short_answer
              words: [{ word: 'scrambled' }], // for word_scramble, word_search (list of words), crossword (with description field below)
              // For crossword: words should be [{ word: 'HELLO', description: 'A greeting' }]
              columns: ['True', 'False'], // for question_table (possible answer columns)
              rows: ['The sun is a star##True'], // for question_table (statements with ##Answer suffix)
              sentence: 'The sky is blue.', // for sentence_builder
              audioText: 'Sentence to be spoken', // for dictation, audio_match
              voice: 'de-DE-KatjaNeural|en-US-JennyNeural', // for dictation, audio_match (German/English voice selection)
              items: ['first', 'second', 'third'], // for ordering, odd_one_out
              reason: 'reason why this item is odd', // for odd_one_out
              kc_ids: ['kc-id-1'], // optional knowledge component IDs
            },
          ],
        },
        null,
        2,
      ),
      '',
      'RULES:',
      '- Keep language age-appropriate and encouraging.',
      '- custom_instructions must be practical next steps for THIS student.',
      '- Create 2 to 4 targeted exercises based on these mistakes.',
      '- Each exercise MUST have a valid type from the list above.',
      '- Include type-specific fields matching the chosen type (see schema).',
      `- CRITICAL: The student is now on remediation round ${rounds.length + 1}. Carefully analyze their previous mistakes and prior explanations. Provide a new, comprehensive and detailed explanation of their mistakes and misconceptions in the 'summary' field, explaining the errors clearly, and generate a new set of worksheets to address these.`,
      '- Each exercise can optionally include a kc_ids array of knowledge component IDs.',
      '- Mermaid diagram should be present when useful (flow/steps/concept map).',
      '- Return only valid JSON, no markdown, no code fences.',
    ]
      .filter(Boolean)
      .join('\n')

    const remediation = await generateRemediation(prompt)

    if (!remediation) {
      res.status(503).json({ error: 'AI remediation unavailable right now' })
      return
    }

    // Normalize exercises to block-based format
    const normalizedExercises = normalizeRemediationExercises(remediation.exercises || [])

    if (normalizedExercises.length === 0) {
      res.status(503).json({ error: 'AI returned no valid exercises. Try again.' })
      return
    }

    const roundNumber = rounds.length + 1
    const row = {
      id: uuidv4(),
      submission_id: submission.id,
      assignment_id: assignment.id,
      user_id: req.user!.userId,
      round_number: roundNumber,
      remediation_prompt_variant: variant,
      mistakes_json: JSON.stringify(wrongDetails),
      analysis_json: JSON.stringify({
        summary: remediation.summary,
        misconceptions: remediation.misconceptions,
        custom_instructions: remediation.custom_instructions,
        mermaid: remediation.mermaid,
      }),
      exercises_json: JSON.stringify(normalizedExercises),
    }

    await knex('submission_remediation_rounds').insert(row)

    res.json({
      round_number: roundNumber,
      roundsLeft: Math.max(0, MAX_REMEDIATION_ROUNDS - roundNumber),
      remediation: {
        summary: remediation.summary,
        misconceptions: remediation.misconceptions,
        custom_instructions: remediation.custom_instructions,
        mermaid: remediation.mermaid,
        exercises: normalizedExercises,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ─── Submit remediation exercise responses ───────────────────────────────
router.post('/remediation/round/:roundId/responses', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const round = await knex('submission_remediation_rounds')
      .where({ id: req.params.roundId })
      .first()

    if (!round) {
      res.status(404).json({ error: 'Remediation round not found' })
      return
    }

    if (round.user_id !== req.user!.userId) {
      res.status(403).json({ error: 'You can only respond to your own remediation rounds' })
      return
    }

    // Parse exercises
    const exercises: Record<string, unknown>[] = JSON.parse(String(round.exercises_json || '[]'))
    if (!Array.isArray(exercises) || exercises.length === 0) {
      res.status(400).json({ error: 'No exercises in this round' })
      return
    }

    const { responses, time_spent_seconds } = req.body as {
      responses: Record<string, unknown>
      time_spent_seconds?: number
    }

    if (!responses || typeof responses !== 'object') {
      res.status(400).json({ error: 'responses object is required' })
      return
    }

    // Validate free-text responses
    for (const ex of exercises) {
      const exId = String(ex.id || '')
      const type = String(ex.type || '')
      const answer = responses[exId]
      if (!validateResponseTextLength(type, answer)) {
        res.status(400).json({
          error: `Invalid response for exercise "${ex.title || exId}". Free-text answers require at least 10 characters.`,
        })
        return
      }
    }

    // Score responses using the shared scoring engine
    const scoringResult = scoreAnswers(
      exercises as Array<{ id: string; type: string; points: number }>,
      responses,
    )

    const attempted = exercises.filter(
      (ex) => String(responses[String(ex.id || '')] ?? '') !== '',
    ).length
    const correctCount = scoringResult.blockScores.filter(
      (bs) => bs.maxScore > 0 && bs.score >= bs.maxScore,
    ).length

    // Build exercise_responses_json with submitted_at per item
    const exerciseResponses: Record<string, unknown> = {}
    const now = new Date().toISOString()
    for (const ex of exercises) {
      const exId = String(ex.id || '')
      exerciseResponses[exId] = {
        response: responses[exId] ?? null,
        score: scoringResult.blockScores.find((bs) => bs.blockId === exId)?.score ?? 0,
        maxScore: scoringResult.blockScores.find((bs) => bs.blockId === exId)?.maxScore ?? 0,
        submitted_at: now,
      }
    }

    // Get worksheet info for mastery topic
    let worksheetTitle = 'General'
    let worksheetSubject = ''
    if (round.assignment_id) {
      const assign = await knex('assignments').where({ id: round.assignment_id }).first()
      if (assign) {
        const w = await knex('worksheets').where({ id: assign.worksheet_id }).first()
        if (w) {
          worksheetTitle = w.title || 'General'
          worksheetSubject = w.subject || ''
        }
      }
    }
    const topic = worksheetSubject || worksheetTitle || 'General'

    // Update SRS for exercises with kc_ids
    for (const blockScore of scoringResult.blockScores) {
      const exercise = exercises.find((e) => String(e.id || '') === blockScore.blockId)
      if (exercise && Array.isArray(exercise.kc_ids)) {
        const ratio = blockScore.maxScore > 0 ? blockScore.score / blockScore.maxScore : 0
        let rating = Rating.Again
        if (ratio >= 1.0) rating = Rating.Easy
        else if (ratio >= 0.8) rating = Rating.Good
        else if (ratio >= 0.5) rating = Rating.Hard
        else rating = Rating.Again

        for (const kcId of exercise.kc_ids as string[]) {
          await reviewKnowledgeComponent(req.user!.userId, kcId, rating)
        }
      }
    }

    // Update mastery (once per submission)
    const ratio = scoringResult.maxScore > 0 ? scoringResult.score / scoringResult.maxScore : 0
    const pass = ratio >= 0.6

    const existingMastery = await knex('learning_mastery')
      .where({ user_id: req.user!.userId, topic })
      .first()

    let masteryBefore = 50
    let masteryAfter = 50

    if (existingMastery) {
      masteryBefore = existingMastery.mastery_level
      masteryAfter = pass ? Math.min(100, masteryBefore + 5) : Math.max(0, masteryBefore - 3)
      await knex('learning_mastery')
        .where({ id: existingMastery.id })
        .update({ mastery_level: masteryAfter, last_practiced_at: knex.fn.now() })
    } else {
      masteryBefore = 50
      masteryAfter = pass ? 55 : 47
      await knex('learning_mastery').insert({
        id: uuidv4(),
        user_id: req.user!.userId,
        topic,
        mastery_level: masteryAfter,
        last_practiced_at: knex.fn.now(),
      })
    }

    // Persist all data in the round row
    const updateData: Record<string, unknown> = {
      exercise_responses_json: JSON.stringify(exerciseResponses),
      exercises_attempted: attempted,
      exercises_correct: correctCount,
      mastery_before: masteryBefore,
      mastery_after: masteryAfter,
    }
    if (typeof time_spent_seconds === 'number' && time_spent_seconds > 0) {
      updateData.time_spent_seconds = time_spent_seconds
    }

    await knex('submission_remediation_rounds').where({ id: round.id }).update(updateData)

    res.json({
      score: scoringResult.score,
      maxScore: scoringResult.maxScore,
      exercises_attempted: attempted,
      exercises_correct: correctCount,
      mastery_before: masteryBefore,
      mastery_after: masteryAfter,
      feedback: scoringResult.feedback,
    })
  } catch (err) {
    next(err)
  }
})

// ─── Self-assessment endpoint ──────────────────────────────────────────
router.post('/remediation/round/:roundId/self-assessment', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const round = await knex('submission_remediation_rounds')
      .where({ id: req.params.roundId })
      .first()

    if (!round) {
      res.status(404).json({ error: 'Remediation round not found' })
      return
    }

    if (round.user_id !== req.user!.userId) {
      res.status(403).json({ error: 'You can only assess your own remediation rounds' })
      return
    }

    const { self_assessment } = req.body as { self_assessment?: string }
    if (
      !self_assessment ||
      typeof self_assessment !== 'string' ||
      self_assessment.trim().length < 10
    ) {
      res.status(400).json({ error: 'self_assessment must be at least 10 characters' })
      return
    }

    await knex('submission_remediation_rounds')
      .where({ id: round.id })
      .update({ self_assessment: self_assessment.trim() })

    res.json({ message: 'Self-assessment saved' })
  } catch (err) {
    next(err)
  }
})

// ─── A/B prompt variant metrics (teacher/admin) ────────────────────────
router.get(
  '/remediation/ab-metrics',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const rounds = await knex('submission_remediation_rounds').select('*')

      const byVariant: Record<string, Record<string, unknown>[]> = { A: [], B: [] }
      for (const r of rounds as Record<string, unknown>[]) {
        const v = String(r.remediation_prompt_variant || 'A')
        if (!byVariant[v]) byVariant[v] = []
        byVariant[v].push(r)
      }

      const result: Record<string, unknown> = {}
      for (const [variant, variantRounds] of Object.entries(byVariant)) {
        const n = variantRounds.length
        const totalAttempted = variantRounds.reduce(
          (s, r) => s + (Number(r.exercises_attempted) || 0),
          0,
        )
        const totalCorrect = variantRounds.reduce(
          (s, r) => s + (Number(r.exercises_correct) || 0),
          0,
        )
        const totalTime = variantRounds.reduce((s, r) => s + (Number(r.time_spent_seconds) || 0), 0)

        result[variant] = {
          rounds: n,
          avg_exercises_attempted: n > 0 ? Math.round((totalAttempted / n) * 100) / 100 : 0,
          avg_exercises_correct: n > 0 ? Math.round((totalCorrect / n) * 100) / 100 : 0,
          avg_time_spent_seconds: n > 0 ? Math.round((totalTime / n) * 100) / 100 : 0,
        }
      }

      // round2_rate: fraction of submissions with >=2 rounds
      const subCounts = await knex('submission_remediation_rounds')
        .select('submission_id')
        .count({ count: '*' })
        .groupBy('submission_id')
        .havingRaw('count(*) >= 2')

      const totalSubmissions = await knex('submission_remediation_rounds')
        .distinct('submission_id')
        .count({ count: '*' })
        .first()

      const totalSubCount = Number((totalSubmissions as Record<string, unknown>)?.count || 0)
      const multiRoundCount = subCounts.length

      result.round2_rate = totalSubCount > 0 ? multiRoundCount / totalSubCount : 0

      res.json(result)
    } catch (err) {
      next(err)
    }
  },
)

// ─── Student remediation history ───────────────────────────────────────
router.get('/student/remediation-history', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const userId = req.user!.userId

    const rows = await knex('submission_remediation_rounds')
      .join('assignments', 'submission_remediation_rounds.assignment_id', 'assignments.id')
      .join('worksheets', 'assignments.worksheet_id', 'worksheets.id')
      .where('submission_remediation_rounds.user_id', userId)
      .select(
        'submission_remediation_rounds.id as round_id',
        'submission_remediation_rounds.round_number',
        'submission_remediation_rounds.created_at',
        'submission_remediation_rounds.analysis_json',
        'submission_remediation_rounds.exercises_attempted',
        'submission_remediation_rounds.exercises_correct',
        'submission_remediation_rounds.time_spent_seconds',
        'submission_remediation_rounds.remediation_prompt_variant',
        'assignments.id as assignment_id',
        'worksheets.id as worksheet_id',
        'worksheets.title as worksheet_title',
        'worksheets.subject',
      )
      .orderBy('worksheets.title', 'asc')
      .orderBy('submission_remediation_rounds.round_number', 'asc')

    // Group by assignment
    const grouped: Record<
      string,
      {
        assignment_id: string
        worksheet_id: string
        worksheet_title: string
        subject: string
        rounds: Record<string, unknown>[]
        round_count: number
        attempted: number
        correct: number
      }
    > = {}

    for (const row of rows as Record<string, unknown>[]) {
      const assId = String(row.assignment_id || '')
      if (!grouped[assId]) {
        grouped[assId] = {
          assignment_id: assId,
          worksheet_id: String(row.worksheet_id || ''),
          worksheet_title: String(row.worksheet_title || ''),
          subject: String(row.subject || ''),
          rounds: [],
          round_count: 0,
          attempted: 0,
          correct: 0,
        }
      }

      const analysis = JSON.parse(String(row.analysis_json || '{}'))
      grouped[assId].rounds.push({
        id: row.round_id,
        round_number: row.round_number,
        created_at: row.created_at,
        summary: analysis.summary || null,
        exercises_attempted: row.exercises_attempted || 0,
        exercises_correct: row.exercises_correct || 0,
        time_spent_seconds: row.time_spent_seconds || 0,
        remediation_prompt_variant: row.remediation_prompt_variant || null,
      })
      grouped[assId].round_count = grouped[assId].rounds.length
      grouped[assId].attempted += Number(row.exercises_attempted || 0)
      grouped[assId].correct += Number(row.exercises_correct || 0)
    }

    res.json({ assignments: Object.values(grouped) })
  } catch (err) {
    next(err)
  }
})

router.post('/assignment/:id/submit', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const answers = req.body.answers || {}

    const submission = await knex('submissions')
      .where({ assignment_id: req.params.id, user_id: req.user!.userId })
      .first()

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' })
      return
    }

    const prevScore = submission.score
    const prevMaxScore = submission.max_score
    const prevRatio = prevScore !== null && prevMaxScore > 0 ? prevScore / prevMaxScore : 0

    const assignment = await knex('assignments').where({ id: req.params.id }).first()
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' })
      return
    }
    const worksheet = await knex('worksheets').where({ id: assignment.worksheet_id }).first()
    if (!worksheet) {
      res.status(404).json({ error: 'Worksheet not found' })
      return
    }

    let blocks: unknown[] = []
    try {
      const content = JSON.parse(worksheet.content)
      blocks = content.blocks || []
    } catch {
      /* */
    }

    const result = scoreAnswers(
      blocks as Array<{ id: string; type: string; points: number }>,
      answers,
    )

    const attemptNumber = (await knex('submission_attempts')
      .where({ assignment_id: req.params.id, user_id: req.user!.userId })
      .count({ count: '*' })
      .first()) as { count: number }

    await knex('submission_attempts').insert({
      id: uuidv4(),
      submission_id: submission.id,
      assignment_id: req.params.id,
      user_id: req.user!.userId,
      attempt_number: (attemptNumber?.count || 0) + 1,
      answers: JSON.stringify(answers),
      score: result.score,
      max_score: result.maxScore,
    })

    await knex('submissions')
      .where({ id: submission.id })
      .update({
        answers: JSON.stringify(answers),
        score: result.score,
        max_score: result.maxScore,
        submitted_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      })

    const gam = await knex('learning_gamification').where({ user_id: req.user!.userId }).first()
    if (!gam) {
      await knex('learning_gamification').insert({
        id: uuidv4(),
        user_id: req.user!.userId,
        xp: 0,
        level: 1,
        badges: '[]',
        streak_days: 0,
      })
    }

    const wagers = (req.body.wagers || {}) as Record<string, number>
    const perBlockConfidence = (req.body.per_block_confidence || {}) as Record<string, number>
    let totalXpEarned = 0
    let totalXpLost = 0
    const wageringResults: Record<string, unknown>[] = []

    for (const blockScore of result.blockScores) {
      const wagerAmount = wagers[blockScore.blockId]
      if (!wagerAmount || wagerAmount <= 0) continue

      const confidenceLevel = perBlockConfidence[blockScore.blockId] || 3
      const confidenceNorm = Math.max(0.2, Math.min(1.0, confidenceLevel / 5))
      const ratio = blockScore.maxScore > 0 ? blockScore.score / blockScore.maxScore : 0
      const isCorrect = ratio >= 0.6

      let xpDelta = 0
      if (isCorrect) {
        const multiplier = 1.0 + confidenceNorm * 2.0
        xpDelta = Math.round(wagerAmount * multiplier)
        totalXpEarned += xpDelta
      } else {
        xpDelta = -Math.round(wagerAmount * confidenceNorm * 0.8)
        totalXpLost += Math.abs(xpDelta)
      }

      wageringResults.push({
        blockId: blockScore.blockId,
        wagered: wagerAmount,
        confidence: confidenceLevel,
        correct: isCorrect,
        earned: xpDelta,
      })
    }

    if (wageringResults.length === 0) {
      const flatXp = Math.round(result.score * 10)
      totalXpEarned = flatXp
    }

    const newRatio = result.maxScore > 0 ? result.score / result.maxScore : 0
    let gritBonusAwarded = false
    if (prevScore !== null && newRatio - prevRatio >= 0.3) {
      gritBonusAwarded = true
    }

    let netXp = totalXpEarned - totalXpLost
    if (gritBonusAwarded) {
      netXp += 150
    }

    const { newXp, newLevel, leveledUp, newBadges } = await addXp(req.user!.userId, netXp)
    await updateStreak(req.user!.userId)
    if (wageringResults.length > 0) {
      await awardActivityBadges(req.user!.userId, 'wagers_won')
    }
    await awardActivityBadges(req.user!.userId, 'submissions_completed')
    await awardActivityBadges(req.user!.userId, 'perfect_score')

    // Update SRS and Mastery if confidence was provided
    const confidence = parseInt(req.body.confidence || '3')
    const pass = result.score / (result.maxScore || 1) >= 0.6

    // Attempt to extract a generic topic if the worksheet has one, otherwise use the worksheet subject or title
    const topic = worksheet.subject || worksheet.title || 'General'

    // Update Mastery
    const existingMastery = await knex('learning_mastery')
      .where({ user_id: req.user!.userId, topic })
      .first()
    let newMasteryLevel = 50
    if (existingMastery) {
      newMasteryLevel = pass
        ? Math.min(100, existingMastery.mastery_level + 10)
        : Math.max(0, existingMastery.mastery_level - 15)
      await knex('learning_mastery')
        .where({ id: existingMastery.id })
        .update({ mastery_level: newMasteryLevel, last_practiced_at: knex.fn.now() })
    } else {
      newMasteryLevel = pass ? 60 : 40
      await knex('learning_mastery').insert({
        id: uuidv4(),
        user_id: req.user!.userId,
        topic,
        mastery_level: newMasteryLevel,
        last_practiced_at: knex.fn.now(),
      })
    }

    // Update Spaced Repetition Queue based on confidence
    const daysToAdd = pass ? confidence * 2 : 1
    const nextDue = new Date()
    nextDue.setDate(nextDue.getDate() + daysToAdd)

    const existingQueue = await knex('learning_queue')
      .where({ user_id: req.user!.userId, topic })
      .first()
    if (existingQueue) {
      await knex('learning_queue')
        .where({ id: existingQueue.id })
        .update({ due_at: nextDue.toISOString() })
    } else {
      await knex('learning_queue').insert({
        id: uuidv4(),
        user_id: req.user!.userId,
        worksheet_id: worksheet.id,
        topic,
        due_at: nextDue.toISOString(),
      })
    }

    // Process Spaced Repetition (FSRS) for all blocks with kc_ids
    for (const blockScore of result.blockScores) {
      const block = blocks.find(
        (b: unknown) => (b as Record<string, unknown>).id === blockScore.blockId,
      ) as Record<string, unknown> | undefined
      if (block && block.kc_ids && Array.isArray(block.kc_ids)) {
        // Map the score ratio to FSRS Rating (1=Again, 2=Hard, 3=Good, 4=Easy)
        const ratio = blockScore.maxScore > 0 ? blockScore.score / blockScore.maxScore : 0
        let rating = Rating.Again
        if (ratio >= 1.0) rating = Rating.Easy
        else if (ratio >= 0.8) rating = Rating.Good
        else if (ratio >= 0.5) rating = Rating.Hard
        else rating = Rating.Again

        for (const kc_id of block.kc_ids) {
          await reviewKnowledgeComponent(req.user!.userId, kc_id, rating)
        }
      }
    }

    res.json({
      score: result.score,
      maxScore: result.maxScore,
      feedback: result.feedback,
      submitted_at: new Date().toISOString(),
      xpEarned: totalXpEarned + (gritBonusAwarded ? 150 : 0),
      xpLost: totalXpLost,
      newXp,
      newLevel,
      leveledUp,
      newBadges,
      wageringResults,
      gritBonusAwarded,
    })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/:id/feedback',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      await knex('submissions').where({ id: req.params.id }).update({
        feedback: req.body.feedback,
        graded_by: req.user!.userId,
        updated_at: knex.fn.now(),
      })
      res.json({ message: 'Feedback saved' })
    } catch (err) {
      next(err)
    }
  },
)

router.get('/student/summary', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const submissions = await knex('submissions')
      .join('assignments', 'submissions.assignment_id', 'assignments.id')
      .join('worksheets', 'assignments.worksheet_id', 'worksheets.id')
      .where('submissions.user_id', req.user!.userId)
      .select(
        'submissions.*',
        'worksheets.title as worksheet_title',
        'worksheets.subject',
        'assignments.due_date',
      )
      .orderBy('submissions.updated_at', 'desc')

    res.json({ submissions })
  } catch (err) {
    next(err)
  }
})

export default router
