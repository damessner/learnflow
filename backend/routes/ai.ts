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
    'info_box',
    'true_false',
    'ordering',
    'drawing',
    'percentage',
    'unit_conversion',
    'angle',
    'fraction_model',
  ]),
  points: z.number().optional().default(1),
  title: z.string().optional(),
  text: z.string().optional(),
  template: z.string().optional(),
  options: z.array(z.string()).optional(),
  correct: z.union([z.number(), z.array(z.number())]).optional(),
  correctIndices: z.array(z.number()).optional(),
  correctIndex: z.number().optional(),
  pairs: z.array(z.tuple([z.string(), z.string()])).optional(),
  words: z.array(z.object({ word: z.string() })).optional(),
  expected: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  sample_answer: z.string().optional(),
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
  correct_answer: z.boolean().optional(),
  items: z.array(z.string()).optional(),
  canvas_width: z.number().optional(),
  canvas_height: z.number().optional(),
  background_image: z.string().optional(),
  percentage_value: z.number().optional(),
  part_value: z.number().optional(),
  whole_value: z.number().optional(),
  value: z.number().optional(),
  from_unit: z.string().optional(),
  to_unit: z.string().optional(),
  expected_degrees: z.number().optional(),
  angle_type: z.string().optional(),
  model_type: z.string().optional(),
  show_labels: z.boolean().optional(),
})

const GenerationSchema = z.object({
  blocks: z.array(BlockSchema),
})

const GenerateRequestSchema = z.object({
  prompt: z.string().min(3),
  provider: z.string().optional().default('ollama'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  length: z.enum(['short', 'medium', 'long']).optional().default('medium'),
  lernziele: z.string().optional(),
  subject: z.string().optional(),
  grade_level: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  style: z.enum(['practice', 'test', 'revision', 'challenge']).optional().default('practice'),
})

type GeneratedBlock = z.infer<typeof BlockSchema>
type GenerateRequest = z.infer<typeof GenerateRequestSchema>

const DifferentiateSchema = z.object({
  concept: z.string().min(3),
  subject: z.string().optional(),
  grade_level: z.string().optional(),
  language: z.string().optional(),
  provider: z.string().optional().default('gemini'),
})

const DifferentiateResponseSchema = z.object({
  basic: z.string(),
  standard: z.string(),
  advanced: z.string(),
})

const exerciseTypes = new Set([
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
  'true_false',
  'ordering',
  'percentage',
  'unit_conversion',
  'angle',
])

function buildWorksheetPrompt({
  prompt: userPrompt,
  difficulty,
  length,
  lernziele,
  subject,
  grade_level,
  title,
  description,
  style,
}: GenerateRequest): string {
  const parts: string[] = []

  parts.push(`Create a teacher-usable worksheet that makes pupils actively work.`)
  parts.push(`The worksheet must feel classroom-ready, not like a rough draft.`)
  parts.push(``)
  parts.push(`WORKSHEET CONTEXT:`)
  parts.push(`- Teacher request: ${userPrompt}`)
  if (title) parts.push(`- Worksheet title: ${title}`)
  if (subject) parts.push(`- Subject: ${subject}`)
  if (grade_level) parts.push(`- Grade level: Grade ${grade_level}`)
  if (description) parts.push(`- Existing worksheet description/context: ${description}`)
  parts.push(`- Difficulty: ${difficulty || 'medium'}`)
  parts.push(`- Length: ${length || 'medium'}`)
  if (lernziele) parts.push(`- Learning objectives (Lernziele): ${lernziele}`)
  if (style) parts.push(`- Worksheet style: ${style}`)

  parts.push(``)
  parts.push(`PEDAGOGICAL QUALITY RULES:`)
  parts.push(`- The worksheet must require genuine thinking, writing, solving, comparing, explaining, or calculating.`)
  parts.push(`- Avoid shallow filler, trivia, opinion-only prompts, or tasks that can be answered without working.`)
  parts.push(`- Make each exercise self-contained: include enough information, numbers, text, and context to solve it.`)
  parts.push(`- Use plausible distractors for choice questions; never make the correct answer obvious.`)
  parts.push(`- Include a progression: warm-up or orientation, core practice, then at least one more demanding item.`)
  parts.push(`- Prefer real exercises over long explanation blocks. Use at most one intro text/read_aloud/info_box block unless explicitly needed.`)
  parts.push(`- Default language: German, unless the teacher request explicitly asks for another language or the subject is English.`)
  parts.push(`- Match vocabulary, sentence length, and cognitive demand to the specified grade level.`)
  parts.push(`- For hard worksheets, include transfer tasks, multi-step reasoning, and written explanation requirements.`)

  parts.push(``)
  parts.push(`STYLE-SPECIFIC GUIDANCE:`)
  parts.push(`- Style "practice": focus on skill-building. Include scaffolded practice with gradual difficulty. Provide hints where helpful. Include an answer key section marker.`)
  parts.push(`- Style "test": do NOT include answer keys or hints. Questions should assess mastery independently. Use a mix of recall, application, and reasoning.`)
  parts.push(`- Style "revision": cover a broad range of previously taught topics. Each question should be concise. Prioritize variety over depth per topic. Good for exam prep.`)
  parts.push(`- Style "challenge": push beyond grade level. Include transfer tasks, open-ended problems, multi-step reasoning, and creative application. Expect deeper written answers.`)

  parts.push(``)
  parts.push(`SUBJECT-SPECIFIC GUIDANCE:`)
  if (subject === 'Mathematics') {
    parts.push(`- Use real numbers, word problems, and step-by-step reasoning. Include diagrams via geometry_shape or graph_plot where relevant.`)
    parts.push(`- Prefer equation_entry, fraction_input, arithmetic_grid, number_line, graph_plot, word_problem, geometry_shape blocks.`)
    parts.push(`- Ensure answers are unambiguous numeric values or matching pairs.`)
    parts.push(`- For grade 1-3: focus on basic operations, simple word problems, number sense.`)
    parts.push(`- For grade 4-6: include fractions, decimals, area/perimeter, multi-step problems.`)
    parts.push(`- For grade 7-8: include algebra, proportional reasoning, probability, geometry proofs.`)
  } else if (subject === 'German' || subject === 'English') {
    parts.push(`- ALL content in ${subject === 'German' ? 'German' : 'English'}.`)
    parts.push(`- Prefer gap_fill, multiple_choice, short_answer, matching, word_scramble, read_aloud blocks.`)
    parts.push(`- Include reading comprehension passages (read_aloud) with follow-up questions.`)
    parts.push(`- For grade 1-3: basic vocabulary, simple sentences, phonics/reading basics.`)
    parts.push(`- For grade 4-6: grammar exercises, text comprehension, vocabulary building, short writing.`)
    parts.push(`- For grade 7-8: literary analysis, complex grammar, argumentative writing, text interpretation.`)
  } else if (subject === 'Science') {
    parts.push(`- Focus on scientific concepts, experiments, observations, and real-world applications.`)
    parts.push(`- Prefer multiple_choice, gap_fill, matching, short_answer, word_problem blocks.`)
    parts.push(`- Include experimental scenarios where students predict outcomes or explain observations.`)
    parts.push(`- For grade 1-3: basic natural phenomena, living things, weather, simple experiments.`)
    parts.push(`- For grade 4-6: ecosystems, energy, matter, human body, scientific method.`)
    parts.push(`- For grade 7-8: physics basics, chemistry, biology systems, data analysis, scientific argumentation.`)
  } else if (subject === 'History' || subject === 'Geography') {
    parts.push(`- Include timelines, cause-effect relationships, and source analysis.`)
    parts.push(`- Prefer multiple_choice, matching, gap_fill, short_answer, text blocks for source passages.`)
    parts.push(`- For geography: include map-related tasks, climate data analysis, cultural comparisons.`)
    parts.push(`- For history: include chronology, primary source interpretation, historical significance.`)
  }

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
  parts.push(`- "read_aloud": { id, type: "read_aloud", points: 0, text: "short passage or source text" }`)
  parts.push(`- "info_box": { id, type: "info_box", points: 0, title: "Did you know?", text: "explanation", mermaid: "optional diagram code", alt_text: "diagram description" }`)
  parts.push(``)
  parts.push(`RULES:`)
  parts.push(`- Every block MUST have a unique "id" field (uuid format)`)
  parts.push(`- Use 0 points for text/read_aloud/info_box blocks; use 5-15 points for exercise blocks depending on complexity`)
  parts.push(`- VARIETY: Use at least 3 different block types unless the teacher explicitly asks for a single format worksheet.`)
  parts.push(`- For difficulty "easy": use guided practice, simpler wording, fewer distractors, and smaller steps.`)
  parts.push(`- For difficulty "medium": use solid grade-level practice with a mix of recall, application, and short reasoning.`)
  parts.push(`- For difficulty "hard": use multi-step reasoning, transfer tasks, precise vocabulary, and at least one demanding open task.`)
  parts.push(`- For length "short": generate 3-5 blocks with at least 2 scored exercises`)
  parts.push(`- For length "medium": generate 5-8 blocks with at least 4 scored exercises`)
  parts.push(`- For length "long": generate 8-12 blocks with at least 6 scored exercises`)
  parts.push(`- For "multiple_choice" and "single_choice", include "correct" field with the index/indices of the correct option(s)`)
  parts.push(`- For "short_answer", include "keywords" and optionally "sample_answer"`)
  parts.push(`- For "gap_fill", the template MUST contain one or more ((correct answer)) placeholders`)
  parts.push(`- Do not use unsupported block types`)
  parts.push(``)
  parts.push(`GOOD EXAMPLE:`)
  parts.push(`{"blocks":[{"id":"11111111-1111-4111-8111-111111111111","type":"info_box","points":0,"title":"Merksatz","text":"Eine Bruchzahl beschreibt einen Teil eines Ganzen."},{"id":"22222222-2222-4222-8222-222222222222","type":"fraction_input","points":6,"text":"Schreibe den markierten Anteil als Bruch.","numerator":3,"denominator":4},{"id":"33333333-3333-4333-8333-333333333333","type":"single_choice","points":6,"text":"Welcher Bruch ist größer als 1/2?","options":["1/4","2/3","2/5"],"correct":1},{"id":"44444444-4444-4444-8444-444444444444","type":"short_answer","points":8,"text":"Erkläre in einem Satz, woran man erkennt, dass 3/4 größer ist als 2/4.","keywords":["gleicher Nenner","größerer Zähler"],"sample_answer":"Bei gleichem Nenner ist der Bruch mit dem größeren Zähler größer."}]}`)

  return parts.join('\n')
}

function clampPoints(value: unknown, fallback: number): number {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
  return Math.max(1, Math.min(20, numeric))
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
}

function normalizeGeneratedBlock(raw: unknown): GeneratedBlock | null {
  if (!raw || typeof raw !== 'object') return null

  const candidate = raw as Record<string, unknown>
  const type = typeof candidate.type === 'string' ? candidate.type : ''
  if (!BlockSchema.shape.type.safeParse(type).success) return null

  const id = typeof candidate.id === 'string' && z.string().uuid().safeParse(candidate.id).success ? candidate.id : uuidv4()
  const text = typeof candidate.text === 'string' ? candidate.text.trim() : ''
  const title = typeof candidate.title === 'string' ? candidate.title.trim() : ''

  switch (type) {
    case 'text':
    case 'read_aloud': {
      if (!text) return null
      return { id, type, points: 0, text }
    }
    case 'info_box': {
      if (!text) return null
      return {
        id,
        type,
        points: 0,
        title: title || 'Wichtige Info',
        text,
        mermaid: typeof candidate.mermaid === 'string' ? candidate.mermaid.trim() : '',
        alt_text: typeof candidate.alt_text === 'string' ? candidate.alt_text.trim() : '',
      }
    }
    case 'gap_fill': {
      const template = typeof candidate.template === 'string' ? candidate.template.trim() : ''
      if (!template || !/\(\(.+?\)\)/.test(template)) return null
      return { id, type, points: clampPoints(candidate.points, 8), text, template }
    }
    case 'single_choice': {
      const options = asStringArray(candidate.options)
      const correct = Array.isArray(candidate.correct) ? candidate.correct[0] : candidate.correct
      if (!text || options.length < 2 || typeof correct !== 'number' || correct < 0 || correct >= options.length) return null
      return { id, type, points: clampPoints(candidate.points, 8), text, options, correct }
    }
    case 'multiple_choice': {
      const options = asStringArray(candidate.options)
      const correct = Array.isArray(candidate.correct)
        ? candidate.correct.filter((n): n is number => typeof n === 'number' && n >= 0 && n < options.length)
        : typeof candidate.correct === 'number' && candidate.correct >= 0 && candidate.correct < options.length
          ? [candidate.correct]
          : []
      if (!text || options.length < 3 || correct.length === 0) return null
      return { id, type, points: clampPoints(candidate.points, 10), text, options, correct: [...new Set(correct)] }
    }
    case 'matching': {
      const pairs = Array.isArray(candidate.pairs)
        ? candidate.pairs
            .filter((pair): pair is [string, string] => Array.isArray(pair) && pair.length === 2)
            .map((pair) => [String(pair[0]).trim(), String(pair[1]).trim()] as [string, string])
            .filter(([left, right]) => left && right)
        : []
      if (pairs.length < 2) return null
      return { id, type, points: clampPoints(candidate.points, 8), text, pairs }
    }
    case 'word_scramble': {
      const words = Array.isArray(candidate.words)
        ? candidate.words
            .map((entry) => {
              if (typeof entry === 'string') return { word: entry.trim() }
              if (entry && typeof entry === 'object' && typeof (entry as { word?: unknown }).word === 'string') {
                return { word: (entry as { word: string }).word.trim() }
              }
              return { word: '' }
            })
            .filter((entry) => entry.word)
        : []
      if (words.length < 2) return null
      return { id, type, points: clampPoints(candidate.points, 8), text, words }
    }
    case 'short_answer': {
      const keywords = asStringArray(candidate.keywords)
      if (!text || keywords.length === 0) return null
      return {
        id,
        type,
        points: clampPoints(candidate.points, 10),
        text,
        keywords,
        sample_answer: typeof candidate.sample_answer === 'string' ? candidate.sample_answer.trim() : '',
      }
    }
    case 'number_line': {
      const min = typeof candidate.min_value === 'number' ? candidate.min_value : 0
      const max = typeof candidate.max_value === 'number' ? candidate.max_value : 100
      const markers = Array.isArray(candidate.markers)
        ? candidate.markers.filter((n): n is number => typeof n === 'number' && n >= min && n <= max)
        : []
      if (max <= min || markers.length === 0) return null
      return { id, type, points: clampPoints(candidate.points, 8), text, min_value: min, max_value: max, markers }
    }
    case 'equation_entry': {
      const equation = typeof candidate.equation === 'string' ? candidate.equation.trim() : ''
      const final_answer = typeof candidate.final_answer === 'string' ? candidate.final_answer.trim() : ''
      if (!equation || !final_answer) return null
      return { id, type, points: clampPoints(candidate.points, 10), text, equation, final_answer }
    }
    case 'fraction_input': {
      const numerator = typeof candidate.numerator === 'number' ? candidate.numerator : NaN
      const denominator = typeof candidate.denominator === 'number' ? candidate.denominator : NaN
      if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null
      return { id, type, points: clampPoints(candidate.points, 6), text, numerator, denominator }
    }
    case 'arithmetic_grid': {
      const operand1 = typeof candidate.operand1 === 'number' ? candidate.operand1 : NaN
      const operand2 = typeof candidate.operand2 === 'number' ? candidate.operand2 : NaN
      const operation = typeof candidate.operation === 'string' ? candidate.operation.trim() : 'add'
      if (!Number.isFinite(operand1) || !Number.isFinite(operand2)) return null
      return { id, type, points: clampPoints(candidate.points, 8), text, operand1, operand2, operation }
    }
    case 'graph_plot': {
      const points = Array.isArray(candidate.points_to_plot)
        ? candidate.points_to_plot
            .filter((point): point is [number, number] =>
              Array.isArray(point) && point.length === 2 && typeof point[0] === 'number' && typeof point[1] === 'number',
            )
            .map((point) => [point[0], point[1]] as [number, number])
        : []
      if (points.length === 0) return null
      return { id, type, points: clampPoints(candidate.points, 10), text, points_to_plot: points }
    }
    case 'geometry_shape': {
      const shape_type = typeof candidate.shape_type === 'string' ? candidate.shape_type.trim() : ''
      if (!shape_type) return null
      return { id, type, points: clampPoints(candidate.points, 7), text, shape_type }
    }
    case 'word_problem': {
      const problem_text = typeof candidate.problem_text === 'string' ? candidate.problem_text.trim() : text
      const steps = Array.isArray(candidate.steps)
        ? candidate.steps
            .filter((step): step is { description: string; expected: string } =>
              !!step &&
              typeof step === 'object' &&
              typeof (step as { description?: unknown }).description === 'string' &&
              typeof (step as { expected?: unknown }).expected === 'string',
            )
            .map((step) => ({
              description: step.description.trim(),
              expected: step.expected.trim(),
            }))
            .filter((step) => step.description && step.expected)
        : []
      const final_answer = typeof candidate.final_answer === 'string' ? candidate.final_answer.trim() : ''
      if (!problem_text || steps.length === 0 || !final_answer) return null
      return { id, type, points: clampPoints(candidate.points, 12), problem_text, steps, final_answer }
    }
    case 'true_false': {
      const correct_answer = typeof candidate.correct_answer === 'boolean' ? candidate.correct_answer : true
      if (!text) return null
      return { id, type, points: clampPoints(candidate.points, 6), text, correct_answer }
    }
    case 'ordering': {
      const items = asStringArray(candidate.items)
      if (items.length < 2) return null
      return { id, type, points: clampPoints(candidate.points, 8), text, items }
    }
    case 'drawing': {
      const canvas_width = typeof candidate.canvas_width === 'number' ? candidate.canvas_width : 600
      const canvas_height = typeof candidate.canvas_height === 'number' ? candidate.canvas_height : 400
      const background_image = typeof candidate.background_image === 'string' ? candidate.background_image.trim() : ''
      return { id, type, points: 0, text, canvas_width, canvas_height, background_image }
    }
    case 'percentage': {
      const percentage_value = typeof candidate.percentage_value === 'number' ? candidate.percentage_value : NaN
      const part_value = typeof candidate.part_value === 'number' ? candidate.part_value : NaN
      const whole_value = typeof candidate.whole_value === 'number' ? candidate.whole_value : NaN
      if (!text) return null
      return { id, type, points: clampPoints(candidate.points, 8), text, percentage_value, part_value, whole_value }
    }
    case 'unit_conversion': {
      const value = typeof candidate.value === 'number' ? candidate.value : NaN
      const from_unit = typeof candidate.from_unit === 'string' ? candidate.from_unit.trim() : ''
      const to_unit = typeof candidate.to_unit === 'string' ? candidate.to_unit.trim() : ''
      if (!Number.isFinite(value) || !from_unit || !to_unit) return null
      return { id, type, points: clampPoints(candidate.points, 6), text, value, from_unit, to_unit }
    }
    case 'angle': {
      const expected_degrees = typeof candidate.expected_degrees === 'number' ? candidate.expected_degrees : NaN
      const angle_type = typeof candidate.angle_type === 'string' ? candidate.angle_type.trim() : 'measure'
      if (!text) return null
      return { id, type, points: clampPoints(candidate.points, 6), text, expected_degrees, angle_type }
    }
    case 'fraction_model': {
      const numerator = typeof candidate.numerator === 'number' ? candidate.numerator : NaN
      const denominator = typeof candidate.denominator === 'number' ? candidate.denominator : NaN
      const model_type = typeof candidate.model_type === 'string' ? candidate.model_type.trim() : 'circle'
      const show_labels = typeof candidate.show_labels === 'boolean' ? candidate.show_labels : true
      if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null
      return { id, type, points: 0, text, numerator, denominator, model_type, show_labels }
    }
    default:
      return null
  }
}

function normalizeGeneratedBlocks(rawBlocks: unknown, length: GenerateRequest['length']): GeneratedBlock[] {
  const items = Array.isArray(rawBlocks) ? rawBlocks : []
  const normalized = items
    .map((block) => normalizeGeneratedBlock(block))
    .filter((block): block is GeneratedBlock => !!block)

  const uniqueBlocks: GeneratedBlock[] = []
  const seen = new Set<string>()
  for (const block of normalized) {
    const key = `${block.type}:${block.text || block.template || block.problem_text || block.title || ''}`.trim().toLowerCase()
    if (key && seen.has(key)) continue
    if (key) seen.add(key)
    uniqueBlocks.push(block)
  }

  const maxBlocks = { short: 6, medium: 10, long: 14 }
  const maxByLength = { short: 5, medium: 8, long: 12 }
  const limited = uniqueBlocks.slice(0, maxByLength[length || 'medium'])
  const scoredExercises = limited.filter((block) => exerciseTypes.has(block.type))

  if (scoredExercises.length === 0) return []
  return limited
}

function getMinExerciseCount(length: GenerateRequest['length']): number {
  const counts = { short: 2, medium: 4, long: 6 }
  return counts[length || 'medium']
}

function buildDifferentiatePrompt({ concept, subject, grade_level, language }: z.infer<typeof DifferentiateSchema>): string {
  const outputLanguage = language || (subject === 'English' ? 'English' : 'German')
  return [
    'You are an expert differentiated instruction assistant for LearnFlow.',
    `Concept: ${concept}`,
    subject ? `Subject: ${subject}` : '',
    grade_level ? `Grade level: Grade ${grade_level}` : '',
    `Output language: ${outputLanguage}`,
    '',
    'Generate three accurate explanations of the same concept:',
    '- basic: simple vocabulary, 2-3 short sentences, concrete and accessible',
    '- standard: grade-level explanation, 3-4 sentences, connects to prior knowledge',
    '- advanced: more precise vocabulary, 4-5 sentences, includes nuance or edge case',
    '',
    'Return ONLY valid JSON with this exact shape:',
    '{"basic":"...","standard":"...","advanced":"..."}',
  ]
    .filter(Boolean)
    .join('\n')
}

router.post('/generate', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const request = GenerateRequestSchema.parse(req.body)
    const { prompt, provider, difficulty, length, lernziele, subject, grade_level, title, description, style } = request
    const maxAttempts = 2
    let attempt = 0
    let blocks: GeneratedBlock[] = []

    while (attempt < maxAttempts && blocks.length < getMinExerciseCount(length)) {
      attempt++
      const worksheetPrompt = buildWorksheetPrompt({
        prompt,
        provider,
        difficulty,
        length,
        lernziele,
        subject,
        grade_level,
        title,
        description,
        style,
      })

      const attemptPrompt = attempt > 1
        ? `${worksheetPrompt}\n\nIMPORTANT: Your previous attempt was rejected because it did not produce enough valid exercise blocks or had quality issues. Make sure to:\n- Include enough real exercise blocks (not just text/info)\n- Use at least 3 different exercise block types\n- Ensure answers are correct and options are plausible\n- Follow all format rules exactly`
        : worksheetPrompt

      if (provider === 'opencode' && getZenApiKey()) {
        try {
          const response = await callZenChat('Create the worksheet now and return only valid JSON.', attemptPrompt, false, {
            response_format: { type: 'json_object' },
          })
          const data = await response.json()
          if (response.ok) {
            const text = data.choices?.[0]?.message?.content || '{}'
            const parsed = JSON.parse(text)
            blocks = normalizeGeneratedBlocks(parsed.blocks, length)
          } else {
            console.error('OpenCode Zen error:', data)
          }
        } catch (e) {
          console.error('OpenCode Zen generation failed:', e)
        }
      } else if (provider === 'opencode' && (await isOpenCodeAvailable())) {
        try {
          const sessionId = await createSession('Worksheet Generation')
          const result = await sendPromptStructured(sessionId, prompt, GenerationSchema as unknown as Record<string, unknown>, {
            system: attemptPrompt,
            model: await getModelConfig(),
          })
          blocks = normalizeGeneratedBlocks((result as { blocks?: unknown }).blocks, length)
        } catch (e) {
          console.error('OpenCode generation failed:', e)
        }
      } else if (provider === 'ollama' && process.env.OLLAMA_URL) {
        const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || 'llama3',
            prompt: attemptPrompt,
            stream: false,
            format: 'json',
          }),
        })
        const data = await response.json()
        try {
          const parsed = JSON.parse(data.response)
          blocks = normalizeGeneratedBlocks(parsed.blocks, length)
        } catch (e) {
          console.error('Validation failed for Ollama:', e)
        }
      } else if ((provider === 'gemini' || !['opencode', 'ollama'].includes(provider)) && process.env.GEMINI_API_KEY) {
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
                      text: attemptPrompt,
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
          blocks = normalizeGeneratedBlocks(parsed.blocks, length)
        } catch (e) {
          console.error('Validation failed for Gemini:', e)
        }
      }

      if (blocks.length === 0 && attempt < maxAttempts - 1) {
        console.log(`Retry ${attempt}: regenerating with stricter prompt...`)
      }
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

router.post('/regenerate-block', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const { prompt, provider, blockType, difficulty, subject, grade_level, lernziele, style, currentBlock, worksheetContext } = req.body
    
    if (!blockType) {
      res.status(400).json({ error: 'blockType required' })
      return
    }

    const currentBlockContext = currentBlock ? `Current block JSON to improve or replace:\n${JSON.stringify(currentBlock, null, 2)}` : ''
    const worksheetContextText = worksheetContext ? `Worksheet context:\n${JSON.stringify(worksheetContext, null, 2)}` : ''

    const blockPrompt = `Generate ONE block of type "${blockType}" for a worksheet.
Teacher request: ${prompt || 'Generate a suitable exercise'}
${subject ? `Subject: ${subject}` : ''}
${grade_level ? `Grade level: ${grade_level}` : ''}
${difficulty ? `Difficulty: ${difficulty}` : ''}
${style ? `Worksheet style: ${style}` : ''}
${lernziele ? `Learning objectives: ${lernziele}` : ''}
${currentBlockContext}
${worksheetContextText}

Return ONLY a JSON object representing a single block matching these exact formats:
${blockType === 'gap_fill' ? `{"id":"uuid","type":"gap_fill","points":N,"text":"instructions","template":"sentence with ((answer)) gaps"}` : ''}
${blockType === 'multiple_choice' ? `{"id":"uuid","type":"multiple_choice","points":N,"text":"question","options":["a","b","c","d"],"correct":[0]}` : ''}
${blockType === 'single_choice' ? `{"id":"uuid","type":"single_choice","points":N,"text":"question","options":["a","b","c"],"correct":0}` : ''}
${blockType === 'short_answer' ? `{"id":"uuid","type":"short_answer","points":N,"text":"question","keywords":["key1","key2"],"sample_answer":"..."}` : ''}
${blockType === 'matching' ? `{"id":"uuid","type":"matching","points":N,"pairs":[["left","right"]]}` : ''}
${blockType === 'word_scramble' ? `{"id":"uuid","type":"word_scramble","points":N,"words":[{"word":"example"}]}` : ''}
${blockType === 'word_problem' ? `{"id":"uuid","type":"word_problem","points":N,"problem_text":"...","steps":[{"description":"Step","expected":"val"}],"final_answer":"answer"}` : ''}
${blockType === 'text' ? `{"id":"uuid","type":"text","points":0,"text":"content"}` : ''}
${blockType === 'read_aloud' ? `{"id":"uuid","type":"read_aloud","points":0,"text":"short passage"}` : ''}
${blockType === 'info_box' ? `{"id":"uuid","type":"info_box","points":0,"title":"headline","text":"explanation","mermaid":"optional diagram"}` : ''}
${blockType === 'number_line' ? `{"id":"uuid","type":"number_line","points":N,"text":"instructions","min_value":0,"max_value":100,"markers":[25,50,75]}` : ''}
${blockType === 'equation_entry' ? `{"id":"uuid","type":"equation_entry","points":N,"text":"instructions","equation":"x + 3 = 5","final_answer":"2"}` : ''}
${blockType === 'fraction_input' ? `{"id":"uuid","type":"fraction_input","points":N,"text":"instructions","numerator":1,"denominator":2}` : ''}
${blockType === 'arithmetic_grid' ? `{"id":"uuid","type":"arithmetic_grid","points":N,"text":"instructions","operand1":23,"operand2":15,"operation":"add"}` : ''}
${blockType === 'graph_plot' ? `{"id":"uuid","type":"graph_plot","points":N,"text":"instructions","points_to_plot":[[0,0],[1,2]]}` : ''}
${blockType === 'geometry_shape' ? `{"id":"uuid","type":"geometry_shape","points":N,"text":"instructions","shape_type":"triangle"}` : ''}
${blockType === 'true_false' ? `{"id":"uuid","type":"true_false","points":N,"text":"The earth is flat.","correct_answer":false}` : ''}
${blockType === 'ordering' ? `{"id":"uuid","type":"ordering","points":N,"text":"Put these events in order","items":["first","second","third"]}` : ''}
${blockType === 'drawing' ? `{"id":"uuid","type":"drawing","points":0,"text":"Draw a plant cell","canvas_width":600,"canvas_height":400}` : ''}
${blockType === 'percentage' ? `{"id":"uuid","type":"percentage","points":N,"text":"Calculate 20% of 50","percentage_value":20,"part_value":10,"whole_value":50}` : ''}
${blockType === 'unit_conversion' ? `{"id":"uuid","type":"unit_conversion","points":N,"text":"Convert 150 cm to meters","value":150,"from_unit":"cm","to_unit":"m"}` : ''}
${blockType === 'angle' ? `{"id":"uuid","type":"angle","points":N,"text":"What type of angle is 90 degrees?","expected_degrees":90,"angle_type":"right"}` : ''}
${blockType === 'fraction_model' ? `{"id":"uuid","type":"fraction_model","points":0,"text":"What fraction is shaded?","numerator":3,"denominator":4,"model_type":"circle","show_labels":true}` : ''}

RULES:
- The block MUST be educationally useful and grade-appropriate
- Include correct answers and plausible distractors where applicable
- The id should be a UUID v4 string
- Follow the exact field shape for the requested block type
- If current block context is provided, keep the same pedagogical intent but improve clarity/quality
- Return ONLY the JSON object, no other text`

    let block = null

    if (provider === 'opencode' && getZenApiKey()) {
      try {
        const response = await callZenChat('Generate this block as valid JSON only.', blockPrompt, false, {
          response_format: { type: 'json_object' },
        })
        const data = await response.json()
        if (response.ok) {
          const text = data.choices?.[0]?.message?.content || '{}'
          const parsed = JSON.parse(text)
          const validated = normalizeGeneratedBlock(parsed)
          if (validated) block = validated
        }
      } catch (e) {
        console.error('Block regeneration failed:', e)
      }
    } else if (provider === 'ollama' && process.env.OLLAMA_URL) {
      try {
        const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: process.env.OLLAMA_MODEL || 'llama3', prompt: blockPrompt, stream: false, format: 'json' }),
        })
        const data = await response.json()
        const parsed = JSON.parse(data.response)
        const validated = normalizeGeneratedBlock(parsed)
        if (validated) block = validated
      } catch (e) {
        console.error('Ollama block regeneration failed:', e)
      }
    } else if (process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: blockPrompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          },
        )
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
        const parsed = JSON.parse(text)
        const validated = normalizeGeneratedBlock(parsed)
        if (validated) block = validated
      } catch (e) {
        console.error('Gemini block regeneration failed:', e)
      }
    }

    if (!block) {
      res.status(422).json({ error: 'Failed to generate a valid block' })
      return
    }

    res.json({ block })
  } catch (err) {
    next(err)
  }
})

router.post('/differentiate', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const request = DifferentiateSchema.parse(req.body)
    const prompt = buildDifferentiatePrompt(request)
    let result: z.infer<typeof DifferentiateResponseSchema> | null = null

    if (request.provider === 'opencode' && getZenApiKey()) {
      try {
        const response = await callZenChat('Differentiate this concept and return JSON only.', prompt, false, {
          response_format: { type: 'json_object' },
        })
        const data = await response.json()
        if (response.ok) {
          result = DifferentiateResponseSchema.parse(
            JSON.parse(data.choices?.[0]?.message?.content || '{}'),
          )
        }
      } catch (e) {
        console.error('OpenCode Zen differentiation failed:', e)
      }
    } else if (request.provider === 'opencode' && (await isOpenCodeAvailable())) {
      try {
        const sessionId = await createSession('Concept Differentiation')
        const structured = await sendPromptStructured(
          sessionId,
          request.concept,
          DifferentiateResponseSchema as unknown as Record<string, unknown>,
          {
            system: prompt,
            model: await getModelConfig(),
          },
        )
        result = DifferentiateResponseSchema.parse(structured)
      } catch (e) {
        console.error('OpenCode differentiation failed:', e)
      }
    } else if (request.provider === 'ollama' && process.env.OLLAMA_URL) {
      try {
        const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || 'llama3',
            prompt,
            stream: false,
            format: 'json',
          }),
        })
        const data = await response.json()
        result = DifferentiateResponseSchema.parse(JSON.parse(data.response || '{}'))
      } catch (e) {
        console.error('Ollama differentiation failed:', e)
      }
    } else if (process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          },
        )
        const data = await response.json()
        result = DifferentiateResponseSchema.parse(
          JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'),
        )
      } catch (e) {
        console.error('Gemini differentiation failed:', e)
      }
    }

    if (!result) {
      res.status(422).json({ error: 'Failed to differentiate concept' })
      return
    }

    res.json(result)
  } catch (err) {
    next(err)
  }
})

// ----- AI Checker for written answers -----

const CheckAnswerSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  blockType: z.enum(['short_answer', 'word_problem', 'text', 'read_aloud']).optional().default('short_answer'),
  maxPoints: z.number().min(1).max(100).optional().default(10),
  subject: z.string().optional(),
  grade_level: z.string().optional(),
  keywords: z.string().optional(),
  sampleAnswer: z.string().optional(),
  rubric: z.string().optional(),
})

type CheckAnswerResult = {
  suggestedScore: number
  confidence: 'high' | 'medium' | 'low'
  explanation: string
  strengths: string[]
  missing: string[]
  feedback: string
}

function buildCheckPrompt(req: z.infer<typeof CheckAnswerSchema>): string {
  const { question, answer, maxPoints, subject, grade_level, keywords, sampleAnswer, rubric } = req
  const parts: string[] = []

  parts.push(`You are an expert teacher assistant grading a student's written answer.`)
  parts.push(``)
  parts.push(`QUESTION: "${question}"`)
  parts.push(`STUDENT ANSWER: "${answer}"`)
  parts.push(`MAXIMUM POINTS: ${maxPoints}`)
  if (subject) parts.push(`SUBJECT: ${subject}`)
  if (grade_level) parts.push(`GRADE LEVEL: Grade ${grade_level}`)
  if (keywords) parts.push(`EXPECTED KEYWORDS: ${keywords}`)
  if (sampleAnswer) parts.push(`SAMPLE CORRECT ANSWER: ${sampleAnswer}`)
  if (rubric) parts.push(`RUBRIC/GRADING CRITERIA: ${rubric}`)

  parts.push(``)
  parts.push(`GRADING RULES:`)
  parts.push(`- Be fair but honest. Award partial credit for partially correct answers.`)
  parts.push(`- Consider grade-appropriate language and depth.`)
  parts.push(`- If keywords are provided, the answer must include most of them for full credit.`)
  parts.push(`- If a sample answer is provided, compare against it reasonably (not word-for-word).`)
  parts.push(`- Deduct points for irrelevant, incorrect, or missing information.`)
  parts.push(`- Return ONLY a JSON object with this exact structure:`)
  parts.push(`{`)
  parts.push(`  "suggestedScore": number (0 to ${maxPoints}),`)
  parts.push(`  "confidence": "high" | "medium" | "low",`)
  parts.push(`  "explanation": "brief reason for the score",`)
  parts.push(`  "strengths": ["strength1", "strength2"],`)
  parts.push(`  "missing": ["missing1", "missing2"],`)
  parts.push(`  "feedback": "constructive feedback text for the student"`)
  parts.push(`}`)
  parts.push(``)
  parts.push(`CONFIDENCE GUIDELINES:`)
  parts.push(`- "high": clear-cut answer with objective criteria (keywords present/absent, comparison to sample answer)`)
  parts.push(`- "medium": mostly clear but some subjective judgment needed`)
  parts.push(`- "low": very subjective or answer requires significant teacher judgment`)
  parts.push(`- NEVER return "high" confidence for answers requiring significant subjective evaluation.`)

  return parts.join('\n')
}

router.post('/check-answer', requireAuth, async (req, res, next) => {
  try {
    const parsed = CheckAnswerSchema.parse(req.body)
    const { answer, maxPoints } = parsed

    // Step 1: Rule-based checks (fast, no AI needed)
    const ruleScore = { earned: 0, reasons: [] as string[] }
    
    // Minimum length check
    const wordCount = answer.split(/\s+/).filter(Boolean).length
    if (wordCount < 3) {
      ruleScore.reasons.push('Answer too short (fewer than 3 words)')
    } else {
      ruleScore.earned += Math.round(maxPoints * 0.2)
      ruleScore.reasons.push('Minimum length met')
    }

    // Keyword check (if provided)
    const keywordHits: string[] = []
    const keywordMisses: string[] = []
    if (parsed.keywords) {
      const kws = parsed.keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean)
      const answerLower = answer.toLowerCase()
      for (const kw of kws) {
        if (answerLower.includes(kw)) {
          keywordHits.push(kw)
        } else {
          keywordMisses.push(kw)
        }
      }
      if (kws.length > 0) {
        const ratio = keywordHits.length / kws.length
        ruleScore.earned += Math.round(maxPoints * 0.4 * ratio)
        if (keywordHits.length > 0) ruleScore.reasons.push(`Keywords found: ${keywordHits.length}/${kws.length}`)
        if (keywordMisses.length > 0) ruleScore.reasons.push(`Keywords missing: ${keywordMisses.join(', ')}`)
      }
    }

    // If we have keywords and they all match AND answer has good length, return rule-based result immediately
    if (parsed.keywords && keywordMisses.length === 0 && wordCount >= 5) {
      const score = Math.min(maxPoints, ruleScore.earned + Math.round(maxPoints * 0.4))
      res.json({
        suggestedScore: Math.max(0, Math.min(maxPoints, score)),
        confidence: keywordMisses.length === 0 ? 'high' as const : 'medium' as const,
        explanation: 'Rule-based check passed: all keywords present with sufficient length.',
        strengths: keywordHits.length > 0 ? [`Includes required keywords: ${keywordHits.join(', ')}`] : ['Answer length is sufficient'],
        missing: [],
        feedback: 'Good work! Your answer includes the required concepts.' + (keywordMisses.length > 0 ? ` Check: ${keywordMisses.join(', ')}` : ''),
      } satisfies CheckAnswerResult)
      return
    }

    // Step 2: AI-based grading
    const prompt = buildCheckPrompt(parsed)
    let result: CheckAnswerResult | null = null

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          },
        )
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
        const parsed = JSON.parse(text)
        if (typeof parsed.suggestedScore === 'number' && typeof parsed.confidence === 'string') {
          result = parsed as CheckAnswerResult
        }
      } catch (e) {
        console.error('Gemini check-answer failed:', e)
      }
    } else if (getZenApiKey()) {
      try {
        const zenRes = await callZenChat('Grade this answer. Return only valid JSON.', prompt, false, {
          response_format: { type: 'json_object' },
        })
        const data = await zenRes.json()
        if (zenRes.ok) {
          const text = data.choices?.[0]?.message?.content || '{}'
          const parsed = JSON.parse(text)
          if (typeof parsed.suggestedScore === 'number' && typeof parsed.confidence === 'string') {
            result = parsed as CheckAnswerResult
          }
        }
      } catch (e) {
        console.error('Zen check-answer failed:', e)
      }
    }

    // Fallback: blend rule-based with AI or return rule-based alone
    if (!result) {
      const finalScore = Math.max(0, Math.min(maxPoints, ruleScore.earned))
      result = {
        suggestedScore: finalScore,
        confidence: 'low' as const,
        explanation: ruleScore.reasons.join('; ') || 'AI grading unavailable, used basic checks.',
        strengths: keywordHits.length > 0 ? [`Keywords present: ${keywordHits.join(', ')}`] : [],
        missing: keywordMisses.length > 0 ? [`Missing keywords: ${keywordMisses.join(', ')}`] : ['AI grading unavailable for deeper evaluation'],
        feedback: keywordMisses.length === 0
          ? 'Answer submitted. AI grading was unavailable — please review manually.'
          : `Your answer is missing some expected concepts: ${keywordMisses.join(', ')}. Consider revising.`,
      }
    } else {
      // Blend: cap AI suggestion between reasonable bounds based on rule checks
      const blended = Math.round((result.suggestedScore + ruleScore.earned) / 2)
      result.suggestedScore = Math.max(0, Math.min(maxPoints, blended))
    }

    res.json(result satisfies CheckAnswerResult)
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
