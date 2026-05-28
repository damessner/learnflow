import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { requireAuth, requireRole } from '../middleware/requireAuth'
import { z } from 'zod'
import * as fs from 'fs'
import * as path from 'path'
import {
  createSession,
  sendPromptStructured,
  sendPrompt,
  getModelConfig,
  isOpenCodeAvailable,
} from '../services/opencode'
import { getProviderService } from '../services/ProviderService'

const ZEN_API_URL = 'https://opencode.ai/zen/v1/chat/completions'
const DEFAULT_FETCH_TIMEOUT_MS = 60_000
const STREAM_FETCH_TIMEOUT_MS = 300_000

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

function getZenApiKey(): string | undefined {
  return process.env.OPENCODE_ZEN_API_KEY
}

function getZenModel(): string {
  return process.env.OPENCODE_ZEN_MODEL || 'deepseek-v4-flash-free'
}

async function callZenChat(
  prompt: string,
  system?: string,
  stream = false,
  extraBody: Record<string, unknown> = {},
): Promise<Response> {
  const messages: { role: string; content: string }[] = []
  if (system) messages.push({ role: 'system', content: system })
  messages.push({ role: 'user', content: prompt })
  return fetchWithTimeout(
    ZEN_API_URL,
    {
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
    },
    stream ? STREAM_FETCH_TIMEOUT_MS : DEFAULT_FETCH_TIMEOUT_MS,
  )
}

async function callZenChatStream(messages: { role: string; content: string }[]): Promise<Response> {
  return fetchWithTimeout(
    ZEN_API_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getZenApiKey()}`,
      },
      body: JSON.stringify({
        model: getZenModel(),
        messages,
        stream: true,
      }),
    },
    STREAM_FETCH_TIMEOUT_MS,
  )
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

export const GRADE_LEVELS = ['1', '2', '3', '4'] as const

// Austrian Mittelschule Curriculum (Lehrpläne) integration
const subjectKeyMap: Record<string, string> = {
  english: 'English',
  englisch: 'English',
  mathematics: 'Mathematics',
  mathe: 'Mathematics',
  mathematik: 'Mathematics',
  german: 'German',
  deutsch: 'German',
  science: 'Science',
  biologie: 'Science',
  physik: 'Science',
  chemie: 'Science',
  naturwissenschaften: 'Science',
  history: 'History',
  geschichte: 'History',
  geography: 'Geography',
  geografie: 'Geography',
  geographie: 'Geography',
}

let lehrplaeneCache: Record<string, Record<string, string>> | null = null

function getLehrplaeneData(): Record<string, Record<string, string>> {
  if (lehrplaeneCache) {
    return lehrplaeneCache
  }
  const pathsToTry = [
    path.join(__dirname, '../data/lehrplaene.json'),
    path.join(__dirname, '../../data/lehrplaene.json'),
    path.join(process.cwd(), 'data/lehrplaene.json'),
    path.join(process.cwd(), 'backend/data/lehrplaene.json'),
  ]
  for (const filePath of pathsToTry) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        lehrplaeneCache = JSON.parse(content)
        return lehrplaeneCache!
      }
    } catch (_e) {
      // ignore
    }
  }
  return {}
}

export function getAustrianGrade(gradeLevel: string | undefined): string | null {
  if (!gradeLevel) return null
  const cleanGrade = gradeLevel.trim()
  if (cleanGrade === '1' || cleanGrade === '5') return '1'
  if (cleanGrade === '2' || cleanGrade === '6') return '2'
  if (cleanGrade === '3' || cleanGrade === '7') return '3'
  if (cleanGrade === '4' || cleanGrade === '8') return '4'
  return null
}

export function getSubjectKey(subject: string | undefined): string | null {
  if (!subject) return null
  const cleanSubject = subject.trim().toLowerCase()
  if (subjectKeyMap[cleanSubject]) {
    return subjectKeyMap[cleanSubject]
  }
  const capitalized = cleanSubject.charAt(0).toUpperCase() + cleanSubject.slice(1)
  return capitalized
}

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
    'info_box',
    'true_false',
    'ordering',
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
  words: z.array(z.object({ word: z.string(), description: z.string().optional() })).optional(),
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
  direction: z.string().optional(),
  vocabulary: z
    .object({ pairs: z.array(z.object({ l: z.string(), r: z.string() })), direction: z.string() })
    .optional(),
  messages: z
    .array(
      z.object({ text: z.string(), isGap: z.boolean().optional(), answer: z.string().optional() }),
    )
    .optional(),
  categories: z.array(z.object({ name: z.string(), words: z.array(z.string()) })).optional(),
  cards: z
    .array(
      z.object({
        front: z.string(),
        back: z.string(),
        image_url: z.string().optional(),
        audio_url: z.string().optional(),
      }),
    )
    .optional(),
  answers: z.record(z.string(), z.string()).optional(),
  source_lang: z.string().optional(),
  target_lang: z.string().optional(),
  columns: z.array(z.string()).optional(),
  rows: z.array(z.string()).optional(),
  sentence: z.string().optional(),
  audioText: z.string().optional(),
  voice: z.string().optional(),
  audioUrl: z.string().optional(),
  reason: z.string().optional(),
})

const GenerationSchema = z.object({
  blocks: z.array(BlockSchema),
})

const GenerateRequestSchema = z.object({
  prompt: z.string().min(3),
  provider: z.string().optional().default('gemini'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  length: z.enum(['short', 'medium', 'long']).optional().default('medium'),
  lernziele: z.string().optional(),
  subject: z.string().optional(),
  grade_level: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  style: z.enum(['practice', 'test', 'revision', 'challenge']).optional().default('practice'),
  source_lang: z.string().optional(),
  target_lang: z.string().optional(),
  cefr_level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
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

export function buildWorksheetPrompt({
  prompt: userPrompt,
  difficulty,
  length,
  lernziele,
  subject,
  grade_level,
  title,
  description,
  style,
  source_lang,
  target_lang,
  cefr_level,
}: GenerateRequest & { source_lang?: string; target_lang?: string; cefr_level?: string }): string {
  const parts: string[] = []

  const austrianGrade = getAustrianGrade(grade_level)
  const mappedSubject = getSubjectKey(subject)
  let lehrplanText = ''

  if (austrianGrade && mappedSubject) {
    const data = getLehrplaeneData()
    if (data[mappedSubject] && data[mappedSubject][austrianGrade]) {
      lehrplanText = data[mappedSubject][austrianGrade]
    }
  }

  parts.push(`Create a teacher-usable worksheet that makes pupils actively work.`)
  parts.push(`The worksheet must feel classroom-ready, not like a rough draft.`)
  parts.push(``)
  parts.push(`WORKSHEET CONTEXT:`)
  parts.push(`- Teacher request: ${userPrompt}`)
  parts.push(
    `- IMPORTANT: If the teacher request is very short or brief (e.g. "simple past", "fractions", "water cycle", "climate change"), you MUST expand this topic into a comprehensive worksheet design. Brainstorm the core subtopics, rules, relevant vocabulary, processes, or facts, and fully cover and test them.`,
  )
  if (title) parts.push(`- Worksheet title: ${title}`)
  if (subject) parts.push(`- Subject: ${subject}`)
  if (grade_level) parts.push(`- Grade level: Grade ${grade_level}`)
  if (description) parts.push(`- Existing worksheet description/context: ${description}`)
  parts.push(`- Difficulty: ${difficulty || 'medium'}`)
  parts.push(`- Length: ${length || 'medium'}`)
  if (lernziele) parts.push(`- Learning objectives (Lernziele): ${lernziele}`)
  if (style) parts.push(`- Worksheet style: ${style}`)

  if (lehrplanText) {
    parts.push(``)
    parts.push(`AUSTRIAN CURRICULUM CONSTRAINTS (LEHRPLAN):`)
    parts.push(
      `You MUST adhere to the following official curriculum standards for Mittelschule Österreich (Grade ${austrianGrade} / Schulstufe ${grade_level || ''}):`,
    )
    parts.push(`- Curriculum Specs: ${lehrplanText}`)
    parts.push(
      `- Ensure all questions, vocabulary, math problems, and grammar match these specific topics and expectations.`,
    )
  }

  parts.push(``)
  parts.push(`NEUROLOGICAL & MOTIVATIONAL RESEARCH GUIDELINES:`)
  parts.push(
    `- Cognitive Load Theory: Structure information clearly. Break tasks into small chunks, starting with simple recognition and building up to production.`,
  )
  parts.push(`- Retrieval Practice: Actively test student knowledge. Use spaced retrieval cues.`)
  parts.push(
    `- Self-Determination Theory (Autonomy, Competence, Relatedness): Use real-world, relevant scenarios. Provide clear instruction, tips, and choice where applicable.`,
  )
  parts.push(
    `- Spaced repetition & Gamification elements: Integrate crosswords, word search, or puzzle elements (matching, scramble) to keep students motivated and reduce test anxiety.`,
  )

  parts.push(``)
  parts.push(`PEDAGOGICAL QUALITY RULES:`)
  parts.push(
    `- The worksheet must require genuine thinking, writing, solving, comparing, explaining, or calculating.`,
  )
  parts.push(
    `- Avoid shallow filler, trivia, opinion-only prompts, or tasks that can be answered without working.`,
  )
  parts.push(
    `- Make each exercise self-contained: include enough information, numbers, text, and context to solve it.`,
  )
  parts.push(
    `- Use plausible distractors for choice questions; never make the correct answer obvious.`,
  )
  parts.push(
    `- Include a progression: warm-up or orientation, core practice, then at least one more demanding item.`,
  )
  parts.push(
    `- You MUST ALWAYS start the worksheet with a conceptual explanation inside a block of type "info_box". This block MUST contain:`,
  )
  parts.push(
    `  1. A visual Mermaid diagram (using the "mermaid" field) that illustrates the concept, structural flow, or grammatical relations. Include fun emojis in the diagram node labels to make it visually engaging for students (e.g. 🌟 for key ideas, 📝 for examples, 🔑 for rules, ⚠️ for common mistakes, ✅ for correct, ❌ for wrong).`,
  )
  parts.push(`  2. A clear text explanation.`)
  parts.push(`  3. An informative title (e.g. "Merksatz", "Wusstest du?", "Auf einen Blick").`)
  parts.push(
    `- After the info_box, generate a variety of interactive exercises. Generate between 8 to 12 scored exercise blocks to make the worksheet longer rather than shorter.`,
  )
  parts.push(
    `- VARIETY: You MUST generate at least 6 to 7 different exercise block types (e.g., gap_fill, multiple_choice, crossword, sentence_builder, odd_one_out, matching) to cover a wide range of exercises. Every single exercise block should have sufficient depth (at least 5-10 question items, options, or pairs inside it to be comprehensive).`,
  )
  parts.push(
    `- Default language: German, unless the teacher request explicitly asks for another language or the subject is English.`,
  )
  parts.push(
    `- Match vocabulary, sentence length, and cognitive demand to the specified grade level.`,
  )
  parts.push(
    `- For hard worksheets, include transfer tasks, multi-step reasoning, and written explanation requirements.`,
  )

  parts.push(``)
  parts.push(`STYLE-SPECIFIC GUIDANCE:`)
  parts.push(
    `- Style "practice": focus on skill-building. Include scaffolded practice with gradual difficulty. Provide hints where helpful. Include an answer key section marker.`,
  )
  parts.push(
    `- Style "test": do NOT include answer keys or hints. Questions should assess mastery independently. Use a mix of recall, application, and reasoning.`,
  )
  parts.push(
    `- Style "revision": cover a broad range of previously taught topics. Each question should be concise. Prioritize variety over depth per topic. Good for exam prep.`,
  )
  parts.push(
    `- Style "challenge": push beyond grade level. Include transfer tasks, open-ended problems, multi-step reasoning, and creative application. Expect deeper written answers.`,
  )

  parts.push(``)
  parts.push(`SUBJECT-SPECIFIC GUIDANCE:`)
  if (subject === 'Mathematics') {
    parts.push(
      `- Note: The mathematics-specific grids are deprecated. Generate standard worksheets using gap_fill, single_choice, multiple_choice, short_answer, matching, true_false, ordering, and question_table blocks.`,
    )
    parts.push(`- Ensure answers are unambiguous numeric values or matching pairs.`)
    parts.push(`- For grade 1-3: focus on basic operations, simple word problems, number sense.`)
    parts.push(`- For grade 4-6: include fractions, decimals, area/perimeter, multi-step problems.`)
    parts.push(`- For grade 7-8: include algebra, proportional reasoning, probability.`)
  } else if (subject === 'German' || subject === 'English') {
    parts.push(`- ALL content in ${subject === 'German' ? 'German' : 'English'}.`)
    parts.push(
      `- Prefer gap_fill, multiple_choice, single_choice, short_answer, matching, true_false, ordering, word_scramble, read_aloud blocks. For language learning, also use vocabulary, semantic_sorter, flashcards, drag_words, correct_words, question_table, crossword, audio_match, dictation, word_search, sentence_builder, odd_one_out.`,
    )
    parts.push(`- Include reading comprehension passages (read_aloud) with follow-up questions.`)
    parts.push(`- For grade 1-3: basic vocabulary, simple sentences, phonics/reading basics.`)
    parts.push(
      `- For grade 4-6: grammar exercises, text comprehension, vocabulary building, short writing.`,
    )
    parts.push(
      `- For grade 7-8: literary analysis, complex grammar, argumentative writing, text interpretation.`,
    )
    parts.push(
      `- For language worksheets (German as foreign language, English as foreign language): include vocabulary, semantic_sorter, flashcards, drag_words, correct_words, question_table, crossword, audio_match, dictation, word_search, sentence_builder, odd_one_out blocks.`,
    )
    parts.push(
      `- If language_pair is set (e.g. source_lang="de", target_lang="en"), ALL exercises and instructions should use the target language for output, with source language for vocabulary pairs. Vocabulary pair direction: source→target.`,
    )
    parts.push(
      `- If cefr_level is set (A1/A2/B1/B2/C1/C2), calibrate vocabulary complexity, sentence length, and grammar accordingly.`,
    )
  } else if (subject === 'Science') {
    parts.push(
      `- Focus on scientific concepts, experiments, observations, and real-world applications.`,
    )
    parts.push(`- Prefer multiple_choice, gap_fill, matching, short_answer, word_problem blocks.`)
    parts.push(
      `- Include experimental scenarios where students predict outcomes or explain observations.`,
    )
    parts.push(
      `- For grade 1-3: basic natural phenomena, living things, weather, simple experiments.`,
    )
    parts.push(`- For grade 4-6: ecosystems, energy, matter, human body, scientific method.`)
    parts.push(
      `- For grade 7-8: physics basics, chemistry, biology systems, data analysis, scientific argumentation.`,
    )
  } else if (subject === 'History' || subject === 'Geography') {
    parts.push(`- Include timelines, cause-effect relationships, and source analysis.`)
    parts.push(
      `- Prefer multiple_choice, matching, gap_fill, short_answer, text blocks for source passages.`,
    )
    parts.push(
      `- For geography: include map-related tasks, climate data analysis, cultural comparisons.`,
    )
    parts.push(
      `- For history: include chronology, primary source interpretation, historical significance.`,
    )
  }

  if (source_lang && target_lang) {
    parts.push(`LANGUAGE PAIR: The student is learning ${target_lang} from ${source_lang}.`)
    parts.push(`- All content, instructions, and exercises should be in ${target_lang}.`)
    parts.push(
      `- Vocabulary pairs should be: source=${source_lang} word → target=${target_lang} translation.`,
    )
  }
  if (cefr_level) {
    parts.push(`CEFR LEVEL: ${cefr_level}`)
    const cefrGuidance: Record<string, string> = {
      A1: '- Use very basic vocabulary (200-500 words). Simple present tense only. Short sentences (3-8 words). Everyday topics (family, food, colors, numbers).',
      A2: '- Use elementary vocabulary (500-1000 words). Present/past simple. Sentences up to 12 words. Daily life, shopping, directions.',
      B1: '- Use intermediate vocabulary (1000-2000 words). All basic tenses. Compound sentences. Opinions, plans, experiences.',
      B2: '- Use upper-intermediate vocabulary (2000-4000 words). Complex grammar including subjunctive. Abstract topics, arguments, professional contexts.',
      C1: '- Use advanced vocabulary. Idiomatic expressions. Nuanced arguments. Academic and professional language.',
      C2: '- Use near-native vocabulary. Subtle nuance. Literary and technical language. Complex rhetorical structures.',
    }
    parts.push(cefrGuidance[cefr_level] || '')
  }

  parts.push(``)
  parts.push(
    `You MUST return ONLY a JSON object with a "blocks" array. Each block is one exercise. Here are ALL supported block types and their required fields:`,
  )
  parts.push(``)
  parts.push(`BLOCK TYPES:`)
  parts.push(`- "text": { id, type: "text", points: 0, text: "content" }`)
  parts.push(
    `- "gap_fill": { id, type: "gap_fill", points: N, template: "sentence with ((answer)) gaps" }`,
  )
  parts.push(
    `- "multiple_choice": { id, type: "multiple_choice", points: N, text: "question", options: ["a","b","c","d"], correct: [0,2] }`,
  )
  parts.push(
    `- "single_choice": { id, type: "single_choice", points: N, text: "question", options: ["a","b","c"], correct: 0 }`,
  )
  parts.push(
    `- "matching": { id, type: "matching", points: N, pairs: [["left1","right1"],["left2","right2"]] }`,
  )
  parts.push(
    `- "word_scramble": { id, type: "word_scramble", points: N, words: [{word:"example"},{word:"another"}] }`,
  )
  parts.push(
    `- "short_answer": { id, type: "short_answer", points: N, text: "question", keywords: ["key1","key2"] }`,
  )
  parts.push(
    `- "read_aloud": { id, type: "read_aloud", points: 0, text: "short passage or source text" }`,
  )
  parts.push(
    `- "info_box": { id, type: "info_box", points: 0, title: "Did you know?", text: "explanation", mermaid: "optional diagram code", alt_text: "diagram description" }`,
  )
  parts.push(
    `- "vocabulary": { id, type: "vocabulary", points: N, vocabulary: { pairs: [{l:"source_word",r:"translation"}], direction: "l2r" } }`,
  )
  parts.push(
    `- "semantic_sorter": { id, type: "semantic_sorter", points: N, categories: [{name:"Nouns", words:["table","chair"]},{name:"Verbs",words:["run","eat"]}] }`,
  )
  parts.push(
    `- "flashcards": { id, type: "flashcards", points: N, cards: [{front:"Hund",back:"dog"},{front:"Katze",back:"cat"}] }`,
  )
  parts.push(
    `- "drag_words": { id, type: "drag_words", points: N, template: "This is a ((sentence)) with ((gaps))." }`,
  )
  parts.push(
    `- "correct_words": { id, type: "correct_words", points: N, template: "Wrong words should be marked ((wrong/correct)) this way." }`,
  )
  parts.push(
    `- "question_table": { id, type: "question_table", points: N, columns: ["True", "False"], rows: ["The sun is a star##True", "The moon is a planet##False"] }`,
  )
  parts.push(
    `- "crossword": { id, type: "crossword", points: N, words: [{"word":"HELLO","description":"A greeting"},{"word":"WORLD","description":"Our planet"}] }`,
  )
  parts.push(
    `- "audio_match": { id, type: "audio_match", points: N, pairs: [["Hund","dog"],["Katze","cat"]], voice: "de-DE" }`,
  )
  parts.push(
    `- "dictation": { id, type: "dictation", points: N, audioText: "Diktattext hier eintragen", voice: "de-DE" }`,
  )
  parts.push(
    `- "word_search": { id, type: "word_search", points: N, words: [{"word":"HUND"},{"word":"KATZE"}] }`,
  )
  parts.push(
    `- "sentence_builder": { id, type: "sentence_builder", points: N, sentence: "Das ist ein ganzer Satz." }`,
  )
  parts.push(
    `- "odd_one_out": { id, type: "odd_one_out", points: N, items: ["Hund", "Katze", "Tisch"], correct: 2, reason: "Tisch ist kein Tier" }`,
  )
  parts.push(``)
  parts.push(`RULES:`)
  parts.push(`- Every block MUST have a unique "id" field (uuid format)`)
  parts.push(
    `- Use 0 points for text/read_aloud/info_box blocks; use 5-15 points for exercise blocks depending on complexity`,
  )
  parts.push(
    `- VARIETY: Use at least 3 different block types unless the teacher explicitly asks for a single format worksheet.`,
  )
  parts.push(
    `- For difficulty "easy": use guided practice, simpler wording, fewer distractors, and smaller steps.`,
  )
  parts.push(
    `- For difficulty "medium": use solid grade-level practice with a mix of recall, application, and short reasoning.`,
  )
  parts.push(
    `- For difficulty "hard": use multi-step reasoning, transfer tasks, precise vocabulary, and at least one demanding open task.`,
  )
  parts.push(`- For length "short": generate 3-5 blocks with at least 2 scored exercises`)
  parts.push(`- For length "medium": generate 5-8 blocks with at least 4 scored exercises`)
  parts.push(`- For length "long": generate 8-12 blocks with at least 6 scored exercises`)
  parts.push(
    `- For "multiple_choice" and "single_choice", include "correct" field with the index/indices of the correct option(s)`,
  )
  parts.push(`- For "short_answer", include "keywords" and optionally "sample_answer"`)
  parts.push(
    `- For "gap_fill", the template MUST contain one or more ((correct answer)) placeholders`,
  )
  parts.push(`- Do not use unsupported block types`)
  parts.push(``)
  parts.push(`GOOD EXAMPLE:`)
  parts.push(
    `{"blocks":[{"id":"11111111-1111-4111-8111-111111111111","type":"info_box","points":0,"title":"Merksatz","text":"Im Englischen verwenden wir 'simple past' für abgeschlossene Handlungen in der Vergangenheit."},{"id":"22222222-2222-4222-8222-222222222222","type":"gap_fill","points":6,"template":"Yesterday, I ((went)) to the cinema."},{"id":"33333333-3333-4333-8333-333333333333","type":"single_choice","points":6,"text":"Was ist das Simple Past von 'run'?","options":["runned","ran","runs"],"correct":1}]}`,
  )

  return parts.join('\n')
}

function clampPoints(value: unknown, fallback: number): number {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
  return Math.max(1, Math.min(20, numeric))
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => (typeof entry === 'string' ? entry.trim() : '')).filter(Boolean)
}

function parseCorrectIndices(correctVal: unknown, options: string[]): number[] {
  if (typeof correctVal === 'number') {
    return [correctVal]
  }
  if (typeof correctVal === 'string') {
    const clean = correctVal.trim().toLowerCase()
    const num = parseInt(clean, 10)
    if (!isNaN(num)) return [num]
    const idx = options.findIndex((opt) => opt.trim().toLowerCase() === clean)
    if (idx !== -1) return [idx]
    if (clean.length === 1) {
      const charCode = clean.charCodeAt(0) - 97
      if (charCode >= 0 && charCode < options.length) return [charCode]
    }
  }
  if (Array.isArray(correctVal)) {
    const indices: number[] = []
    for (const val of correctVal) {
      indices.push(...parseCorrectIndices(val, options))
    }
    return [...new Set(indices)]
  }
  return []
}

function normalizeGeneratedBlock(raw: unknown): GeneratedBlock | null {
  if (!raw || typeof raw !== 'object') return null

  const candidate = raw as Record<string, unknown>
  const type = typeof candidate.type === 'string' ? candidate.type : ''
  if (!BlockSchema.shape.type.safeParse(type).success) return null

  const id =
    typeof candidate.id === 'string' && z.string().uuid().safeParse(candidate.id).success
      ? candidate.id
      : uuidv4()
  let text = typeof candidate.text === 'string' ? candidate.text.trim() : ''
  if (!text && typeof candidate.question === 'string') {
    text = candidate.question.trim()
  }
  if (!text && typeof candidate.problem_text === 'string') {
    text = candidate.problem_text.trim()
  }
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
      let template = typeof candidate.template === 'string' ? candidate.template.trim() : ''
      if (!template && text && /\(\(.+?\)\)/.test(text)) {
        template = text
        text = 'Fülle die Lücken aus.'
      }
      if (!template || !/\(\(.+?\)\)/.test(template)) {
        template = template || text || ''
        template = template
          .replace(/\[(.+?)\]/g, '(($1))')
          .replace(/__(.+?)__/g, '(($1))')
          .replace(/\{(.+?)\}/g, '(($1))')
        if (!/\(\(.+?\)\)/.test(template)) return null
      }
      return { id, type, points: clampPoints(candidate.points, 8), text, template }
    }
    case 'single_choice': {
      const options = asStringArray(candidate.options)
      const correctIndices = parseCorrectIndices(
        candidate.correct !== undefined ? candidate.correct : candidate.correctIndex,
        options,
      )
      if (!text || options.length < 2 || correctIndices.length === 0) return null
      return {
        id,
        type,
        points: clampPoints(candidate.points, 8),
        text,
        options,
        correct: correctIndices[0],
      }
    }
    case 'multiple_choice': {
      const options = asStringArray(candidate.options)
      const correctIndices = parseCorrectIndices(
        candidate.correct !== undefined ? candidate.correct : candidate.correctIndices,
        options,
      )
      if (!text || options.length < 3 || correctIndices.length === 0) return null
      return {
        id,
        type,
        points: clampPoints(candidate.points, 10),
        text,
        options,
        correct: correctIndices,
      }
    }
    case 'matching': {
      let pairs: [string, string][] = []
      if (Array.isArray(candidate.pairs)) {
        pairs = candidate.pairs
          .filter((pair): pair is [string, string] => Array.isArray(pair) && pair.length === 2)
          .map((pair) => [String(pair[0]).trim(), String(pair[1]).trim()] as [string, string])
          .filter(([left, right]) => left && right)
      } else if (candidate.pairs && typeof candidate.pairs === 'object') {
        pairs = Object.entries(candidate.pairs)
          .map(([left, right]) => [left.trim(), String(right).trim()] as [string, string])
          .filter(([left, right]) => left && right)
      }
      if (pairs.length < 2) return null
      return { id, type, points: clampPoints(candidate.points, 8), text, pairs }
    }
    case 'word_scramble': {
      const words = Array.isArray(candidate.words)
        ? candidate.words
            .map((entry) => {
              if (typeof entry === 'string') return { word: entry.trim() }
              if (
                entry &&
                typeof entry === 'object' &&
                typeof (entry as { word?: unknown }).word === 'string'
              ) {
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
        sample_answer:
          typeof candidate.sample_answer === 'string' ? candidate.sample_answer.trim() : '',
      }
    }
    case 'drag_words': {
      let template = typeof candidate.template === 'string' ? candidate.template.trim() : ''
      if (!template && text && /\(\(.+?\)\)/.test(text)) {
        template = text
        text = 'Ziehe die richtigen Wörter in die Lücken.'
      }
      if (!template || !/\(\(.+?\)\)/.test(template)) {
        template = template || text || ''
        template = template
          .replace(/\[(.+?)\]/g, '(($1))')
          .replace(/__(.+?)__/g, '(($1))')
          .replace(/\{(.+?)\}/g, '(($1))')
        if (!/\(\(.+?\)\)/.test(template)) return null
      }
      return { id, type, points: clampPoints(candidate.points, 8), text, template }
    }
    case 'correct_words': {
      let template = typeof candidate.template === 'string' ? candidate.template.trim() : ''
      if (!template && text && /\(\(.+?\)\)/.test(text)) {
        template = text
        text = 'Markiere das richtige Wort.'
      }
      if (!template || !/\(\(.+?\)\)/.test(template)) {
        template = template || text || ''
        template = template
          .replace(/\[(.+?)\]/g, '(($1))')
          .replace(/__(.+?)__/g, '(($1))')
          .replace(/\{(.+?)\}/g, '(($1))')
        if (!/\(\(.+?\)\)/.test(template)) return null
      }
      return { id, type, points: clampPoints(candidate.points, 8), text, template }
    }
    case 'question_table': {
      const columns = asStringArray(candidate.columns)
      const rows = asStringArray(candidate.rows)
      if (columns.length === 0 || rows.length === 0) return null
      return { id, type, points: clampPoints(candidate.points, 10), text, columns, rows }
    }
    case 'crossword': {
      let words = Array.isArray(candidate.words)
        ? candidate.words
            .filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (w: any) =>
                w &&
                typeof w === 'object' &&
                typeof (w.word || w.answer) === 'string' &&
                typeof (w.description || w.clue) === 'string',
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((w: any) => ({
              word: String(w.word || w.answer)
                .trim()
                .toUpperCase(),
              description: String(w.description || w.clue).trim(),
            }))
        : []

      if (words.length === 0 && Array.isArray(candidate.words)) {
        words = candidate.words
          .filter((w): w is string => typeof w === 'string' && !!w)
          .map((w) => ({ word: w.trim().toUpperCase(), description: `Finde das Wort: ${w}` }))
      }

      if (words.length < 2) return null
      return { id, type, points: clampPoints(candidate.points, 10), text, words }
    }
    case 'audio_match': {
      const pairs = Array.isArray(candidate.pairs)
        ? candidate.pairs
            .filter((pair): pair is [string, string] => Array.isArray(pair) && pair.length === 2)
            .map((pair) => [String(pair[0]).trim(), String(pair[1]).trim()] as [string, string])
            .filter(([left, right]) => left && right)
        : []
      if (pairs.length < 2) return null
      return {
        id,
        type,
        points: clampPoints(candidate.points, 8),
        text,
        pairs,
        voice: typeof candidate.voice === 'string' ? candidate.voice.trim() : '',
      }
    }
    case 'dictation': {
      const audioText = typeof candidate.audioText === 'string' ? candidate.audioText.trim() : ''
      if (!audioText) return null
      return {
        id,
        type,
        points: clampPoints(candidate.points, 8),
        text,
        audioText,
        voice: typeof candidate.voice === 'string' ? candidate.voice.trim() : '',
      }
    }
    case 'word_search': {
      const words = Array.isArray(candidate.words)
        ? candidate.words
            .map((entry) => {
              if (typeof entry === 'string') return entry.trim().toUpperCase()
              if (
                entry &&
                typeof entry === 'object' &&
                typeof (entry as Record<string, unknown>).word === 'string'
              ) {
                return String((entry as Record<string, unknown>).word)
                  .trim()
                  .toUpperCase()
              }
              return ''
            })
            .filter(Boolean)
            .map((w) => ({ word: w }))
        : []
      if (words.length === 0) return null
      return { id, type, points: clampPoints(candidate.points, 8), text, words }
    }
    case 'sentence_builder': {
      const sentence = typeof candidate.sentence === 'string' ? candidate.sentence.trim() : ''
      if (!sentence) return null
      return { id, type, points: clampPoints(candidate.points, 8), text, sentence }
    }
    case 'odd_one_out': {
      const items = asStringArray(candidate.items)
      const correct = typeof candidate.correct === 'number' ? candidate.correct : 0
      if (items.length < 3) return null
      return {
        id,
        type,
        points: clampPoints(candidate.points, 8),
        text,
        items,
        correct,
        reason: typeof candidate.reason === 'string' ? candidate.reason.trim() : '',
      }
    }
    default:
      return null
  }
}

function normalizeGeneratedBlocks(
  rawBlocks: unknown,
  length: GenerateRequest['length'],
): GeneratedBlock[] {
  const items = Array.isArray(rawBlocks) ? rawBlocks : []
  const normalized = items
    .map((block) => normalizeGeneratedBlock(block))
    .filter((block): block is GeneratedBlock => !!block)

  const uniqueBlocks: GeneratedBlock[] = []
  const seen = new Set<string>()
  for (const block of normalized) {
    const key =
      `${block.type}:${block.text || block.template || block.problem_text || block.title || ''}`
        .trim()
        .toLowerCase()
    if (key && seen.has(key)) continue
    if (key) seen.add(key)
    uniqueBlocks.push(block)
  }

  const maxByLength = { short: 5, medium: 8, long: 12 }
  const limited = uniqueBlocks.slice(0, maxByLength[length || 'medium'])
  const scoredExercises = limited.filter((block) => exerciseTypes.has(block.type))

  if (scoredExercises.length === 0) return []
  return limited
}

function getMinExerciseCount(length: GenerateRequest['length']): number {
  const counts = { short: 3, medium: 5, long: 8 }
  return counts[length || 'medium']
}

function buildDifferentiatePrompt({
  concept,
  subject,
  grade_level,
  language,
}: z.infer<typeof DifferentiateSchema>): string {
  const outputLanguage = language || (subject === 'English' ? 'English' : 'German')
  const austrianGrade = getAustrianGrade(grade_level)
  const mappedSubject = getSubjectKey(subject)
  let lehrplanText = ''

  if (austrianGrade && mappedSubject) {
    const data = getLehrplaeneData()
    if (data[mappedSubject] && data[mappedSubject][austrianGrade]) {
      lehrplanText = data[mappedSubject][austrianGrade]
    }
  }

  const promptParts = [
    'You are an expert differentiated instruction assistant for LearnFlow.',
    `Concept: ${concept}`,
    subject ? `Subject: ${subject}` : '',
    grade_level ? `Grade level: Grade ${grade_level}` : '',
  ]

  if (lehrplanText) {
    promptParts.push(
      `Austrian Curriculum Context (Lehrplan Grade ${austrianGrade}): ${lehrplanText}`,
    )
  }

  promptParts.push(
    `Output language: ${outputLanguage}`,
    '',
    'Generate three accurate explanations of the same concept:',
    '- basic: simple vocabulary, 2-3 short sentences, concrete and accessible',
    '- standard: grade-level explanation, 3-4 sentences, connects to prior knowledge',
    '- advanced: more precise vocabulary, 4-5 sentences, includes nuance or edge case',
    '',
    'Return ONLY valid JSON with this exact shape:',
    '{"basic":"...","standard":"...","advanced":"..."}',
  )

  return promptParts.filter(Boolean).join('\n')
}

router.get('/providers', requireAuth, async (_req, res, next) => {
  try {
    const service = getProviderService()
    const providers = await service.getAvailableProviders()
    res.json({ providers })
  } catch (err) {
    next(err)
  }
})

router.post('/generate', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const request = GenerateRequestSchema.parse(req.body)
    const {
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
    } = request
    // Early provider check: fail fast with a helpful message if no provider is reachable
    const hasGemini = !!process.env.GEMINI_API_KEY
    const hasZen = !!getZenApiKey()
    const hasOllama = !!process.env.OLLAMA_URL
    if (!hasGemini && !hasZen && !hasOllama) {
      console.error(
        'AI generation failed: No AI provider configured. Set GEMINI_API_KEY or OPENCODE_ZEN_API_KEY in .env',
      )
      res.status(500).json({
        error:
          'No AI provider is configured. Ask your administrator to set up at least one AI provider (Gemini, OpenCode Zen, or Ollama) in the server .env file.',
      })
      return
    }

    const maxAttempts = 3
    let attempt = 0
    let blocks: GeneratedBlock[] = []
    let lastError: Error | null = null

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
        source_lang: request.source_lang,
        target_lang: request.target_lang,
        cefr_level: request.cefr_level,
      })

      const attemptPrompt =
        attempt > 1
          ? `${worksheetPrompt}\n\nIMPORTANT: Your previous attempt was rejected because it did not produce enough valid exercise blocks or had quality issues. Make sure to:\n- Include enough real exercise blocks (not just text/info)\n- Use at least 3 different exercise block types\n- Ensure answers are correct and options are plausible\n- Follow all format rules exactly`
          : worksheetPrompt

      let candidateBlocks: GeneratedBlock[] = []

      const providerService = getProviderService()
      const genResult = await providerService.generateWithFallback(
        attemptPrompt,
        provider === 'opencode' ? 'zen' : provider,
        {
          system:
            'You are an expert worksheet generator. Return ONLY valid JSON matching the requested format.',
          extraBody: { response_format: { type: 'json_object' } },
          onFallback(from, to, error) {
            console.warn(`Provider "${from}" failed (${error}), falling back to "${to}"...`)
          },
        },
      )

      if (genResult.success && genResult.data) {
        const parsed = genResult.data as Record<string, unknown>
        candidateBlocks = normalizeGeneratedBlocks(parsed.blocks, length)
        console.log(`Generation succeeded via ${genResult.providerUsed}`)
      } else {
        console.error('All providers failed:', genResult.error)
        lastError = new Error(genResult.error || 'All AI providers failed')
        // Log individual attempt details
        for (const attempt of genResult.attempts) {
          if (attempt.error) console.error(`  ${attempt.provider}: ${attempt.error}`)
        }
      }

      if (candidateBlocks.length > blocks.length) {
        blocks = candidateBlocks
      }

      if (blocks.length === 0 && attempt < maxAttempts) {
        console.log(`Retry ${attempt}: regenerating with stricter prompt...`)
      }
    }

    if (blocks.length === 0) {
      const detailedMessage = lastError?.message
        ? `AI Generator failed after ${maxAttempts} attempts. Last error: ${lastError.message}`
        : `AI Generator failed to produce any valid exercise blocks after ${maxAttempts} attempts. The AI may have returned content that didn't pass validation, or the API may be unreachable. Check the server logs for details.`
      console.error(
        `Worksheet generation failed after ${maxAttempts} attempts. Provider: ${provider}. Subject: ${subject || 'N/A'}. Grade: ${grade_level || 'N/A'}. Last error:`,
        lastError,
      )
      res.status(500).json({ error: detailedMessage })
      return
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

router.post(
  '/regenerate-block',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const {
        prompt,
        provider,
        blockType,
        difficulty,
        subject,
        grade_level,
        lernziele,
        style,
        currentBlock,
        worksheetContext,
      } = req.body

      if (!blockType) {
        res.status(400).json({ error: 'blockType required' })
        return
      }

      const currentBlockContext = currentBlock
        ? `Current block JSON to improve or replace:\n${JSON.stringify(currentBlock, null, 2)}`
        : ''
      const worksheetContextText = worksheetContext
        ? `Worksheet context:\n${JSON.stringify(worksheetContext, null, 2)}`
        : ''
      const austrianGrade = getAustrianGrade(grade_level)
      const mappedSubject = getSubjectKey(subject)
      let lehrplanSnippet = ''
      if (austrianGrade && mappedSubject) {
        const data = getLehrplaeneData()
        if (data[mappedSubject] && data[mappedSubject][austrianGrade]) {
          lehrplanSnippet = `\nOfficial Austrian Curriculum Constraints (Lehrplan Grade ${austrianGrade}):\n${data[mappedSubject][austrianGrade]}\n`
        }
      }

      const blockPrompt = `Generate ONE block of type "${blockType}" for a worksheet.
Teacher request: ${prompt || 'Generate a suitable exercise'}
${subject ? `Subject: ${subject}` : ''}
${grade_level ? `Grade level: ${grade_level}` : ''}
${lehrplanSnippet}${difficulty ? `Difficulty: ${difficulty}` : ''}
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
          const response = await callZenChat(
            'Generate this block as valid JSON only.',
            blockPrompt,
            false,
            {
              response_format: { type: 'json_object' },
            },
          )
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
          const response = await fetchWithTimeout(`${process.env.OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: process.env.OLLAMA_MODEL || 'llama3',
              prompt: blockPrompt,
              stream: false,
              format: 'json',
            }),
          })
          const data = await response.json()
          const parsed = JSON.parse(data.response)
          const validated = normalizeGeneratedBlock(parsed)
          if (validated) block = validated
        } catch (e) {
          console.error('Ollama block regeneration failed:', e)
        }
      } else if ((provider === 'gemini' || !provider) && process.env.GEMINI_API_KEY) {
        try {
          const response = await fetchWithTimeout(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': process.env.GEMINI_API_KEY,
              },
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
  },
)

router.post(
  '/differentiate',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const request = DifferentiateSchema.parse(req.body)
      const prompt = buildDifferentiatePrompt(request)
      let result: z.infer<typeof DifferentiateResponseSchema> | null = null

      if (request.provider === 'opencode' && getZenApiKey()) {
        try {
          const response = await callZenChat(
            'Differentiate this concept and return JSON only.',
            prompt,
            false,
            {
              response_format: { type: 'json_object' },
            },
          )
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
          const response = await fetchWithTimeout(`${process.env.OLLAMA_URL}/api/generate`, {
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
      } else if (
        (request.provider === 'gemini' || !request.provider) &&
        process.env.GEMINI_API_KEY
      ) {
        let geminiOk = false
        try {
          const response = await fetchWithTimeout(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
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
          if (response.ok) {
            result = DifferentiateResponseSchema.parse(
              JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'),
            )
            geminiOk = true
          } else {
            throw new Error(
              `Gemini API error (${response.status}): ${data.error?.message || 'unknown error'}`,
            )
          }
        } catch (e) {
          console.error('Gemini differentiation failed:', e)
        }
        // Fallback to OpenCode Zen if Gemini failed
        if (!geminiOk && !result && getZenApiKey()) {
          console.warn('Gemini differentiate failed, falling back to OpenCode Zen...')
          try {
            const zenRes = await callZenChat(
              'Differentiate this concept and return JSON only.',
              prompt,
              false,
              {
                response_format: { type: 'json_object' },
              },
            )
            const zenData = await zenRes.json()
            if (zenRes.ok) {
              result = DifferentiateResponseSchema.parse(
                JSON.parse(zenData.choices?.[0]?.message?.content || '{}'),
              )
            }
          } catch (fallbackErr) {
            console.error('OpenCode Zen differentiate fallback also failed:', fallbackErr)
          }
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
  },
)

// ----- AI Checker for written answers -----

const CheckAnswerSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  blockType: z
    .enum(['short_answer', 'word_problem', 'text', 'read_aloud'])
    .optional()
    .default('short_answer'),
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
  parts.push(
    `- "high": clear-cut answer with objective criteria (keywords present/absent, comparison to sample answer)`,
  )
  parts.push(`- "medium": mostly clear but some subjective judgment needed`)
  parts.push(`- "low": very subjective or answer requires significant teacher judgment`)
  parts.push(
    `- NEVER return "high" confidence for answers requiring significant subjective evaluation.`,
  )

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
      const kws = parsed.keywords
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean)
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
        if (keywordHits.length > 0)
          ruleScore.reasons.push(`Keywords found: ${keywordHits.length}/${kws.length}`)
        if (keywordMisses.length > 0)
          ruleScore.reasons.push(`Keywords missing: ${keywordMisses.join(', ')}`)
      }
    }

    // If we have keywords and they all match AND answer has good length, return rule-based result immediately
    if (parsed.keywords && keywordMisses.length === 0 && wordCount >= 5) {
      const score = Math.min(maxPoints, ruleScore.earned + Math.round(maxPoints * 0.4))
      res.json({
        suggestedScore: Math.max(0, Math.min(maxPoints, score)),
        confidence: keywordMisses.length === 0 ? ('high' as const) : ('medium' as const),
        explanation: 'Rule-based check passed: all keywords present with sufficient length.',
        strengths:
          keywordHits.length > 0
            ? [`Includes required keywords: ${keywordHits.join(', ')}`]
            : ['Answer length is sufficient'],
        missing: [],
        feedback:
          'Good work! Your answer includes the required concepts.' +
          (keywordMisses.length > 0 ? ` Check: ${keywordMisses.join(', ')}` : ''),
      } satisfies CheckAnswerResult)
      return
    }

    // Step 2: AI-based grading
    const prompt = buildCheckPrompt(parsed)
    let result: CheckAnswerResult | null = null

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await fetchWithTimeout(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
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
        const zenRes = await callZenChat(
          'Grade this answer. Return only valid JSON.',
          prompt,
          false,
          {
            response_format: { type: 'json_object' },
          },
        )
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
        missing:
          keywordMisses.length > 0
            ? [`Missing keywords: ${keywordMisses.join(', ')}`]
            : ['AI grading unavailable for deeper evaluation'],
        feedback:
          keywordMisses.length === 0
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
      const deepseekRes = await fetchWithTimeout(
        'https://api.deepseek.com/chat/completions',
        {
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
        },
        STREAM_FETCH_TIMEOUT_MS,
      )

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
    } else if (
      (await isOpenCodeAvailable()) &&
      !process.env.OLLAMA_URL &&
      !process.env.GEMINI_API_KEY
    ) {
      try {
        const sessionId = await createSession('Socratic Tutor')
        const text = await sendPrompt(sessionId, question, {
          system: systemPrompt,
          model: await getModelConfig(),
        })
        res.write(`data: ${JSON.stringify({ text })}\n\n`)
      } catch (e) {
        console.error('OpenCode tutor error:', e)
        res.write(`data: ${JSON.stringify({ text: 'AI tutor encountered an error.' })}\n\n`)
      }
    } else if (process.env.OLLAMA_URL) {
      const ollamaRes = await fetchWithTimeout(
        `${process.env.OLLAMA_URL}/api/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || 'llama3',
            prompt: systemPrompt,
            stream: true,
          }),
        },
        STREAM_FETCH_TIMEOUT_MS,
      )

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
      const geminiRes = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
          }),
        },
        STREAM_FETCH_TIMEOUT_MS,
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
    } else if (
      (await isOpenCodeAvailable()) &&
      !process.env.OLLAMA_URL &&
      !process.env.GEMINI_API_KEY
    ) {
      try {
        const sessionId = await createSession('Protege Student')
        const text = await sendPrompt(sessionId, message, {
          system: systemPrompt,
          model: await getModelConfig(),
        })
        res.write(`data: ${JSON.stringify({ text })}\n\n`)
      } catch (e) {
        console.error('OpenCode protege error:', e)
        res.write(
          `data: ${JSON.stringify({ text: 'Uh... I got confused. Can you try explaining again?' })}\n\n`,
        )
      }
    } else if (process.env.OLLAMA_URL) {
      const ollamaRes = await fetchWithTimeout(
        `${process.env.OLLAMA_URL}/api/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || 'llama3',
            prompt: systemPrompt,
            stream: true,
          }),
        },
        STREAM_FETCH_TIMEOUT_MS,
      )

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
      const geminiRes = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
          }),
        },
        STREAM_FETCH_TIMEOUT_MS,
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
      const provider = req.body.provider || 'gemini'

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
          const zenRes = await callZenChat(storyPrompt, undefined, false, {
            response_format: { type: 'json_object' },
          })
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
          const result = await sendPromptStructured(
            sessionId,
            storyPrompt,
            GenerationSchema as unknown as Record<string, unknown>,
            {
              model: await getModelConfig(),
            },
          )
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
      } else if (provider === 'ollama' && process.env.OLLAMA_URL) {
        const response = await fetchWithTimeout(`${process.env.OLLAMA_URL}/api/generate`, {
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
      } else if ((provider === 'gemini' || !provider) && process.env.GEMINI_API_KEY) {
        const response = await fetchWithTimeout(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': process.env.GEMINI_API_KEY,
            },
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

// ----- Language Learning Endpoints -----

router.post('/language/writing', requireAuth, async (req, res, next) => {
  try {
    const { text, topic, target_lang, cefr_level } = req.body
    if (!text || !target_lang) {
      res.status(400).json({ error: 'text and target_lang required' })
      return
    }

    const prompt = `You are an expert ${target_lang} language teacher. Review this student writing:
    
Topic: ${topic || 'General writing'}
Target language: ${target_lang}
${cefr_level ? `CEFR Level: ${cefr_level}` : ''}

Student text:
"""
${text}
"""

Provide detailed feedback as JSON:
{
  "grammar_score": 0-100,
  "vocabulary_score": 0-100,
  "coherence_score": 0-100,
  "overall_score": 0-100,
  "corrections": [
    {"original": "wrong text", "suggestion": "corrected text", "rule": "grammar rule name"}
  ],
  "strengths": ["what was done well"],
  "rubric": "overall teacher feedback in a supportive tone, 2-4 sentences"
}

Return ONLY valid JSON.`

    const provider = req.body.provider || 'gemini'
    let result = null

    if (provider === 'opencode' && (await isOpenCodeAvailable())) {
      try {
        const sessionId = await createSession('Language Writing Feedback')
        result = await sendPromptStructured(
          sessionId,
          prompt,
          z.object({
            grammar_score: z.number(),
            vocabulary_score: z.number(),
            coherence_score: z.number(),
            overall_score: z.number(),
            corrections: z.array(
              z.object({ original: z.string(), suggestion: z.string(), rule: z.string() }),
            ),
            strengths: z.array(z.string()),
            rubric: z.string(),
          }) as unknown as Record<string, unknown>,
          { model: await getModelConfig() },
        )
      } catch {
        result = null
      }
    }

    if (!result) {
      try {
        const zenRes = await callZenChat(prompt, undefined, false, {
          response_format: { type: 'json_object' },
        })
        const data = await zenRes.json()
        result = JSON.parse(data.choices?.[0]?.message?.content || '{}')
      } catch {
        result = null
      }
    }

    if (!result) {
      res.status(503).json({ error: 'AI feedback unavailable' })
      return
    }

    res.json({ feedback: result })
  } catch (err) {
    next(err)
  }
})

router.post('/language/conversation', requireAuth, async (req, res, next) => {
  try {
    const { scenario, target_lang, cefr_level, message, history } = req.body
    if (!scenario || !target_lang || !message) {
      res.status(400).json({ error: 'scenario, target_lang, and message required' })
      return
    }

    const systemPrompt = `You are a role-play partner for language learning.
Scenario: ${scenario}
Target language: ${target_lang}
${cefr_level ? `CEFR Level: ${cefr_level} — use vocabulary and grammar appropriate for this level` : ''}

Rules:
- Stay in character. Respond in ${target_lang} only.
- If the student makes a grammar mistake, gently correct it in your response by modeling the correct form.
- Keep responses concise (1-3 sentences).
- Use vocabulary appropriate for ${cefr_level || "the student's level"}.
- Be encouraging and supportive.`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...(Array.isArray(history)
        ? history.map((h: { role: string; text: string }) => ({
            role: h.role === 'user' ? ('user' as const) : ('assistant' as const),
            content: h.text,
          }))
        : []),
      { role: 'user' as const, content: message },
    ]

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    try {
      const stream = await callZenChatStream(messages)
      if (!stream?.body) {
        res.write('data: [DONE]\n\n')
        res.end()
        return
      }
      const reader = stream.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
        for (const line of lines) {
          if (line === 'data: [DONE]') {
            res.write('data: [DONE]\n\n')
            break
          }
          try {
            const json = JSON.parse(line.replace('data: ', ''))
            const text = json.choices?.[0]?.delta?.content || ''
            if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`)
          } catch {}
        }
      }
    } catch {
      res.write('data: [DONE]\n\n')
    }
    res.end()
  } catch (err) {
    next(err)
  }
})

router.post('/language/glosses', requireAuth, async (req, res, next) => {
  try {
    const { text, target_lang, cefr_level, known_words } = req.body
    if (!text || !target_lang) {
      res.status(400).json({ error: 'text and target_lang required' })
      return
    }

    const prompt = `You are a ${target_lang} language teacher. Given this text:
"""
${text}
"""

For a student at ${cefr_level || 'A2'} CEFR level${known_words?.length ? ` who already knows these words: ${known_words.join(', ')}` : ''}:

Identify words that are LIKELY UNKNOWN to the student (above their CEFR level). For each:
- Provide a translation to the student's likely native language (context-based)
- Provide the base/dictionary form
- Suggest whether to add to vocabulary study

Return JSON:
{
  "unknown_words": [
    {"word": "original word in text", "translation": "translation", "base_form": "dictionary form", "add_to_study": true}
  ],
  "suggestions": [
    {"word": "word", "reason": "why worth studying"}
  ]
}

Focus on words above ${cefr_level || 'A2'} level. Return ONLY JSON.`

    const provider = req.body.provider || 'gemini'
    let result = null

    if (provider === 'opencode' && (await isOpenCodeAvailable())) {
      try {
        const sessionId = await createSession('Language Glosses')
        result = await sendPromptStructured(
          sessionId,
          prompt,
          z.object({
            unknown_words: z.array(
              z.object({
                word: z.string(),
                translation: z.string(),
                base_form: z.string(),
                add_to_study: z.boolean(),
              }),
            ),
            suggestions: z.array(z.object({ word: z.string(), reason: z.string() })),
          }) as unknown as Record<string, unknown>,
          { model: await getModelConfig() },
        )
      } catch {
        result = null
      }
    }

    if (!result) {
      try {
        const zenRes = await callZenChat(prompt, undefined, false, {
          response_format: { type: 'json_object' },
        })
        const data = await zenRes.json()
        result = JSON.parse(data.choices?.[0]?.message?.content || '{}')
      } catch {
        result = null
      }
    }

    if (!result) {
      res.status(503).json({ error: 'AI glosses unavailable' })
      return
    }

    res.json(result)
  } catch (err) {
    next(err)
  }
})

export default router
