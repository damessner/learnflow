export function setsEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false
  const aSorted = [...a].sort()
  const bSorted = [...b].sort()
  return aSorted.every((v, i) => String(v) === String(bSorted[i]))
}

export function checkSTEMMatch(s1: string, s2: string): boolean {
  const n1 = Number(s1.replace(',', '.'))
  const n2 = Number(s2.replace(',', '.'))
  if (isNaN(n1) || isNaN(n2)) return s1.trim().toLowerCase() === s2.trim().toLowerCase()
  const tolerance = 0.02
  return Math.abs(n1 - n2) <= Math.abs(n2) * tolerance
}

export function isAcceptableVariant(s1: string, s2: string): boolean {
  const a = s1.trim().toLowerCase()
  const b = s2.trim().toLowerCase()
  if (a === b) return true

  return levenshteinRatio(a, b) >= 0.85
}

function levenshteinRatio(a: string, b: string): number {
  const lenA = a.length
  const lenB = b.length
  if (lenA === 0 && lenB === 0) return 1
  if (lenA === 0 || lenB === 0) return 0

  const prev = new Array(lenB + 1)
  const curr = new Array(lenB + 1)
  for (let j = 0; j <= lenB; j++) prev[j] = j

  for (let i = 1; i <= lenA; i++) {
    curr[0] = i
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    for (let j = 0; j <= lenB; j++) prev[j] = curr[j]
  }

  const distance = curr[lenB]
  return 1 - distance / Math.max(lenA, lenB)
}

export function buildShortAnswerKeywords(keywords: string[]): string[] {
  return keywords.map((k) => k.trim().toLowerCase())
}

interface Block {
  id: string
  type: string
  points: number
  correct?: number[] | number
  options?: string[]
  pairs?: [string, string][]
  items?: string[]
  answers?: Record<string, string>
  keywords?: string[]
  cards?: { front: string; back: string }[]
  words?: { word: string }[]
  categories?: { name: string; words: string[] }[]
  messages?: { text: string; isGap?: boolean; answer?: string }[]
  vocabulary?: { l: string; r: string }[] | { pairs: { l: string; r: string }[]; direction: string }
  template?: string
  markers?: number[]
  equation?: string
  numerator?: number
  denominator?: number
  operand1?: number
  operand2?: number
  operation?: string
  final_answer?: string
  steps?: { description: string; expected: string }[]
  problem_text?: string
  points_to_plot?: [number, number][]
  shape_type?: string
}

interface ScoreResult {
  score: number
  maxScore: number
  feedback: string
  blockScores: { blockId: string; score: number; maxScore: number }[]
}

function scoreGapFill(
  block: Block,
  answer: { gaps?: string[]; answers?: Record<string, string> } | Record<string, string>,
): { score: number; maxScore: number; feedback: string } {
  if (!block.template) return { score: 0, maxScore: block.points, feedback: '' }
  const gapCount = (block.template.match(/\(\(.*?\)\)/g) || []).length
  let correct = 0

  const gapKeys = Array.from({ length: gapCount }, (_, i) => String(i))

  for (let i = 0; i < gapCount; i++) {
    const userVal = (getGapValue(answer, i, gapKeys[i]) || '').trim().toLowerCase()
    const match = (block.template.match(new RegExp(`\\(\\([^)]+\\)\\)`, 'g')) || [])[i] || ''
    const expected = match.slice(2, -2).trim().toLowerCase()
    if (userVal === expected) correct++
  }

  const earned = gapCount > 0 ? Math.round((correct / gapCount) * block.points) : 0
  return { score: earned, maxScore: block.points, feedback: `${correct}/${gapCount} correct` }
}

function getGapValue(answer: Record<string, unknown>, index: number, key: string): string {
  if (Array.isArray(answer.gaps)) return String(answer.gaps[index] || '')
  if (answer.answers && typeof answer.answers === 'object') {
    return String((answer.answers as Record<string, string>)[key] || '')
  }
  return String(answer[key] || '')
}

export function scoreAnswers(blocks: Block[], answers: Record<string, unknown>): ScoreResult {
  let totalScore = 0
  let totalMax = 0
  const feedback: string[] = []
  const blockScores: { blockId: string; score: number; maxScore: number }[] = []

  for (const block of blocks) {
    const userAnswer = answers[block.id]
    totalMax += block.points

    try {
      let earned = 0
      switch (block.type) {
        case 'gap_fill': {
          const r = scoreGapFill(block, (userAnswer || {}) as Record<string, string>)
          earned = r.score
          feedback.push(`Gap fill: ${r.feedback}`)
          break
        }
        case 'multiple_choice': {
          const ans = (userAnswer as number[]) || []
          if (block.correct && setsEqual(ans, block.correct as number[])) {
            earned = block.points
            feedback.push('Multiple choice: correct')
          } else {
            feedback.push('Multiple choice: incorrect')
          }
          break
        }
        case 'single_choice': {
          if (userAnswer === block.correct) {
            earned = block.points
            feedback.push('Single choice: correct')
          } else {
            feedback.push('Single choice: incorrect')
          }
          break
        }
        case 'matching': {
          const pairs = block.pairs || []
          const ans = (userAnswer as Record<string, string>) || {}
          let matchCount = 0
          for (let i = 0; i < pairs.length; i++) {
            const key = String(i)
            if (ans[key] && ans[key].trim().toLowerCase() === (pairs[i][1] || '').trim().toLowerCase()) {
              matchCount++
            }
          }
          earned = pairs.length > 0 ? Math.round((matchCount / pairs.length) * block.points) : 0
          feedback.push(`Matching: ${matchCount}/${pairs.length}`)
          break
        }
        case 'drag_drop': {
          const ans = (userAnswer as Record<string, string>) || {}
          const expected = block.answers || {}
          const slots = Object.keys(expected)
          let correct = 0
          for (const slot of slots) {
            if (ans[slot]?.trim().toLowerCase() === expected[slot]?.trim().toLowerCase()) correct++
          }
          earned = slots.length > 0 ? Math.round((correct / slots.length) * block.points) : 0
          feedback.push(`Drag-drop: ${correct}/${slots.length}`)
          break
        }
        case 'short_answer': {
          const ans = (userAnswer as string) || ''
          const keywords = buildShortAnswerKeywords(block.keywords || [])
          let kwMatches = 0
          for (const kw of keywords) {
            if (ans.toLowerCase().includes(kw) || isAcceptableVariant(ans, kw)) kwMatches++
          }
          const pass = kwMatches >= Math.ceil(keywords.length * 0.85)
          earned = pass ? block.points : 0
          feedback.push(pass ? 'Short answer: correct' : 'Short answer: incorrect')
          break
        }
        case 'flashcards':
        case 'memory_match': {
          if (userAnswer === 'completed' || (userAnswer as Record<string, unknown>)?.completed) {
            earned = block.points
            feedback.push(`${block.type}: completed`)
          } else {
            feedback.push(`${block.type}: not completed`)
          }
          break
        }
        case 'flow_challenge': {
          const externalScore = Number(userAnswer) || 0
          const capped = Math.min(externalScore, block.points)
          earned = capped
          feedback.push(`Flow challenge: ${capped}/${block.points}`)
          break
        }
        case 'word_scramble': {
          const words = block.words || []
          const ans = (userAnswer as string[]) || []
          let correct = 0
          for (let i = 0; i < words.length; i++) {
            if (ans[i]?.trim().toLowerCase() === (words[i].word || '').trim().toLowerCase()) correct++
          }
          earned = words.length > 0 ? Math.round((correct / words.length) * block.points) : 0
          feedback.push(`Word scramble: ${correct}/${words.length}`)
          break
        }
        case 'semantic_sorter': {
          const ans = (userAnswer as Record<string, string[]>) || {}
          const categories = block.categories || []
          let totalItems = 0
          let correct = 0
          for (const cat of categories) {
            const userWords = (ans[cat.name] || []).map((w: string) => w.trim().toLowerCase())
            const expectedWords = cat.words.map((w: string) => w.trim().toLowerCase())
            for (const uw of userWords) {
              if (expectedWords.includes(uw)) correct++
            }
            totalItems += cat.words.length
          }
          earned = totalItems > 0 ? Math.round((correct / totalItems) * block.points) : 0
          feedback.push(`Semantic sorter: ${correct}/${totalItems}`)
          break
        }
        case 'contextual_dialogue': {
          const messages = block.messages || []
          const ans = (userAnswer as Record<string, string>) || {}
          let correct = 0
          let gapCount = 0
          for (let mi = 0; mi < messages.length; mi++) {
            if (messages[mi].isGap) {
              gapCount++
              const expected = messages[mi].answer || ''
              const userVal = (ans[String(mi)] || '').trim()
              if (
                userVal.toLowerCase() === expected.toLowerCase() ||
                isAcceptableVariant(userVal, expected)
              ) {
                correct++
              }
            }
          }
          earned = gapCount > 0 ? Math.round((correct / gapCount) * block.points) : 0
          feedback.push(`Dialogue: ${correct}/${gapCount}`)
          break
        }
        case 'vocabulary': {
          let pairs: { l: string; r: string }[]
          let direction = 'l2r'
          const v = block.vocabulary
          if (Array.isArray(v)) {
            pairs = v.map((p: { l: string; r: string }) => ({ l: p.l, r: p.r }))
          } else if (v && typeof v === 'object' && 'pairs' in v) {
            pairs = (v as { pairs: { l: string; r: string }[] }).pairs
            direction = (v as { direction: string }).direction || 'l2r'
          } else {
            pairs = []
          }
          const ans = (userAnswer as Record<string, string>) || {}
          if (ans.completed === 'true') {
            earned = block.points
            feedback.push('Vocabulary: completed')
            break
          }
          let pairCorrect = 0
          for (let i = 0; i < pairs.length; i++) {
            const userVal = (ans[String(i)] || '').trim().toLowerCase()
            const expected =
              direction === 'r2l'
                ? (pairs[i].l || '').trim().toLowerCase()
                : (pairs[i].r || '').trim().toLowerCase()
            if (userVal === expected || isAcceptableVariant(userVal, expected)) pairCorrect++
          }
          earned = pairs.length > 0 ? Math.round((pairCorrect / pairs.length) * block.points) : 0
          feedback.push(`Vocabulary: ${pairCorrect}/${pairs.length}`)
          break
        }
        case 'text':
        case 'info_box':
        case 'media':
        case 'video':
        case 'audio':
        case 'read_aloud': {
          earned = block.points
          feedback.push(`${block.type}: auto`)
          break
        }
        case 'number_line': {
          const ans = Number(userAnswer)
          const markers = block.markers || []
          if (markers.length > 0 && !isNaN(ans)) {
            const closest = markers.reduce((prev, curr) =>
              Math.abs(curr - ans) < Math.abs(prev - ans) ? curr : prev,
            )
            earned = Math.abs(ans - closest) < 0.5 ? block.points : 0
            feedback.push(`Number line: ${earned > 0 ? 'correct' : 'incorrect'}`)
          }
          break
        }
        case 'equation_entry': {
          const ans = String(userAnswer || '')
            .replace(/\s/g, '')
            .toLowerCase()
          const expected = String(block.final_answer || block.equation || '')
            .replace(/\s/g, '')
            .toLowerCase()
          earned = ans === expected ? block.points : 0
          feedback.push(`Equation: ${earned > 0 ? 'correct' : 'incorrect'}`)
          break
        }
        case 'fraction_input': {
          const userNum = (userAnswer as Record<string, number>)?.numerator
          const userDen = (userAnswer as Record<string, number>)?.denominator
          if (userNum === block.numerator && userDen === block.denominator) {
            earned = block.points
            feedback.push('Fraction: correct')
          } else {
            feedback.push('Fraction: incorrect')
          }
          break
        }
        case 'arithmetic_grid': {
          const ans = String(userAnswer || '').replace(/\s/g, '')
          const a = block.operand1 || 0
          const b = block.operand2 || 0
          const op = block.operation || 'add'
          let expectedResult = 0
          if (op === 'add') expectedResult = a + b
          else if (op === 'subtract') expectedResult = a - b
          else if (op === 'multiply') expectedResult = a * b
          else if (op === 'divide') expectedResult = b !== 0 ? a / b : 0
          earned = Number(ans) === expectedResult ? block.points : 0
          feedback.push(`Arithmetic: ${earned > 0 ? 'correct' : 'incorrect'}`)
          break
        }
        case 'graph_plot': {
          const userPoints = (userAnswer as [number, number][]) || []
          const expectedPoints = block.points_to_plot || []
          let correct = 0
          for (const ep of expectedPoints) {
            for (const up of userPoints) {
              if (Math.abs(up[0] - ep[0]) < 0.5 && Math.abs(up[1] - ep[1]) < 0.5) {
                correct++
                break
              }
            }
          }
          earned =
            expectedPoints.length > 0
              ? Math.round((correct / expectedPoints.length) * block.points)
              : 0
          feedback.push(`Graph: ${correct}/${expectedPoints.length} points`)
          break
        }
        case 'geometry_shape': {
          const ans = (userAnswer as Record<string, unknown>) || {}
          const nameMatch =
            String(ans.shape_name || '').toLowerCase() ===
            String(block.shape_type || '').toLowerCase()
          earned = nameMatch ? block.points : 0
          feedback.push(`Geometry: ${earned > 0 ? 'correct' : 'incorrect'}`)
          break
        }
        case 'word_problem': {
          const steps = block.steps || []
          const userSteps = (userAnswer as Record<string, string>) || {}
          let correct = 0
          for (let i = 0; i < steps.length; i++) {
            const userVal = String(userSteps[i] || userSteps[String(i)] || '')
              .trim()
              .toLowerCase()
            const expVal = (steps[i].expected || '').trim().toLowerCase()
            if (userVal === expVal || checkSTEMMatch(userVal, expVal)) correct++
          }
          const finalAnsMatch =
            String(userSteps.final_answer || '')
              .trim()
              .toLowerCase() ===
            String(block.final_answer || '')
              .trim()
              .toLowerCase()
          if (finalAnsMatch) correct++
          const totalItems = steps.length + 1
          earned = totalItems > 0 ? Math.round((correct / totalItems) * block.points) : 0
          feedback.push(`Word problem: ${correct}/${totalItems}`)
          break
        }
      }

      totalScore += earned
      blockScores.push({ blockId: block.id, score: earned, maxScore: block.points })
    } catch (err) {
      feedback.push(`Error scoring ${block.type}: ${String(err)}`)
    }
  }

  return { score: totalScore, maxScore: totalMax, feedback: feedback.join('; '), blockScores }
}
