export interface CrosswordWord {
  word: string
  description: string
}

interface PlacedWord {
  wordIdx: number
  word: string
  description: string
  row: number
  col: number
  direction: 'across' | 'down'
}

export interface GridCell {
  row: number
  col: number
  letter: string
  number?: number
  isActive: boolean
  wordIndices: number[]
  /** Maps wordIdx → character position (0-indexed) within that word */
  charPositions: Record<number, number>
}

export interface PlacedWordInfo {
  wordIdx: number
  word: string
  description: string
  row: number
  col: number
  direction: 'across' | 'down'
}

export interface CrosswordLayout {
  grid: GridCell[][]
  rows: number
  cols: number
  acrossClues: { number: number; clue: string; wordIdx: number }[]
  downClues: { number: number; clue: string; wordIdx: number }[]
  placedWords: PlacedWordInfo[]
}

function normalizeWord(w: string): string {
  return w.trim().toUpperCase().replace(/[^A-Z]/g, '')
}

/**
 * Greedy crossword layout algorithm.
 * 1. Place longest word horizontally near center.
 * 2. For each remaining word, find best intersection with placed words.
 * 3. If no intersection, place on new row below.
 */
function layoutWords(words: CrosswordWord[]): PlacedWord[] {
  if (words.length === 0) return []

  // Sort longest-first for denser packing
  const sorted = words
    .map((w, i) => ({ ...w, word: normalizeWord(w.word), originalIndex: i }))
    .filter((w) => w.word.length >= 2)
    .sort((a, b) => b.word.length - a.word.length)

  if (sorted.length === 0) return []

  const placed: PlacedWord[] = []

  // Place first word horizontally at center
  const first = sorted[0]
  placed.push({
    wordIdx: first.originalIndex,
    word: first.word,
    description: first.description,
    row: 0,
    col: 0,
    direction: 'across',
  })

  // Bounding box tracking for centering
  let minRow = 0, maxRow = 0, minCol = 0, maxCol = first.word.length - 1

  for (let wi = 1; wi < sorted.length; wi++) {
    const current = sorted[wi]
    let bestScore = -1
    let bestRow = 0, bestCol = 0
    let bestDir: 'across' | 'down' = 'down'
    let bestIntersectWord: PlacedWord | null = null
    let bestIntersectIdx = -1

    // Try to find intersection with each placed word
    for (const pw of placed) {
      for (let ci = 0; ci < current.word.length; ci++) {
        const ch = current.word[ci]
        // Find matching char in placed word
        for (let pi = 0; pi < pw.word.length; pi++) {
          if (pw.word[pi] !== ch) continue

          let newRow: number, newCol: number, newDir: 'across' | 'down'
          if (pw.direction === 'across') {
            // Current word goes DOWN, intersecting at (pw.row + pi, pw.col + ci) becomes intersection
            // Wait, that's wrong. If placed word is HORIZONTAL starting at (1,1) with "CAT" of length 3:
            // (1,1)=C, (1,2)=A, (1,3)=T
            // If current word goes DOWN starting at (1,2) with "APPLE":
            // (1,2)=A, (2,2)=P, (3,2)=P, (4,2)=L, (5,2)=E
            // The intersection at (1,2) has 'A' matching 'A', so current word starts at (1 - ci, 2) = intersection_row - ci
            // Actually: current word character 'A' is at index ci. The placed word has 'A' at index pi.
            // The current word starts at (pw.row + pi - ci, pw.col) and goes DOWN.
            // Hmm, let me think again.
            // pw direction = across (horizontal). pw is at (pw.row, pw.col) going right.
            // The intersecting character is at (pw.row, pw.col + pi).
            // Current word goes down. Its character ch is at index ci.
            // So the current word starts at (pw.row + pi - ci, pw.col + pi) ... no
            // Current word (vertical): start = (row, col), then (row+1, col), (row+2, col)...
            // At position ci (0-indexed), the cell is (startRow + ci, startCol) = (pw.row, pw.col + pi)
            // So startRow = pw.row - ci, startCol = pw.col + pi
            if (pw.direction === 'across') {
              newRow = pw.row - ci
              newCol = pw.col + pi
              newDir = 'down'
            } else {
              newRow = pw.row + pi
              newCol = pw.col - ci
              newDir = 'across'
            }
          } else {
            newRow = pw.row + pi
            newCol = pw.col - ci
            newDir = 'across'
          }

          // Validate the placement
          if (!isValidPlacement(current.word, newRow, newCol, newDir, placed, minRow, maxRow, minCol, maxCol)) continue

          // Score: prefer closer to center, prefer intersections near middle of word
          const centerRow = (minRow + maxRow) / 2
          const centerCol = (minCol + maxCol) / 2
          const distFromCenter = Math.abs(newRow - centerRow) + Math.abs(newCol - centerCol)
          const intersectPos = Math.min(ci, current.word.length - 1 - ci) // prefer middle intersections
          const score = intersectPos - distFromCenter * 0.5

          if (score > bestScore) {
            bestScore = score
            bestRow = newRow
            bestCol = newCol
            bestDir = newDir
            bestIntersectWord = pw
            bestIntersectIdx = ci
          }
        }
      }
    }

    if (bestScore >= 0) {
      // Place with intersection
      placed.push({
        wordIdx: current.originalIndex,
        word: current.word,
        description: current.description,
        row: bestRow,
        col: bestCol,
        direction: bestDir,
      })
    } else {
      // No intersection found — place on new row below the grid
      const newRow = maxRow + 2
      const newCol = Math.max(0, Math.round((maxCol - current.word.length) / 2))
      placed.push({
        wordIdx: current.originalIndex,
        word: current.word,
        description: current.description,
        row: newRow,
        col: newCol,
        direction: 'across',
      })
    }

    // Update bounds
    const lastPlaced = placed[placed.length - 1]
    if (lastPlaced.direction === 'across') {
      minRow = Math.min(minRow, lastPlaced.row)
      maxRow = Math.max(maxRow, lastPlaced.row)
      minCol = Math.min(minCol, lastPlaced.col)
      maxCol = Math.max(maxCol, lastPlaced.col + lastPlaced.word.length - 1)
    } else {
      minRow = Math.min(minRow, lastPlaced.row)
      maxRow = Math.max(maxRow, lastPlaced.row + lastPlaced.word.length - 1)
      minCol = Math.min(minCol, lastPlaced.col)
      maxCol = Math.max(maxCol, lastPlaced.col)
    }
  }

  // Shift all words so grid starts at positive coordinates
  if (minRow < 0 || minCol < 0) {
    for (const pw of placed) {
      pw.row -= minRow
      pw.col -= minCol
    }
  }

  return placed
}

function isValidPlacement(
  word: string,
  row: number,
  col: number,
  direction: 'across' | 'down',
  placed: PlacedWord[],
  minRow: number,
  maxRow: number,
  minCol: number,
  maxCol: number,
): boolean {
  const expand = 10 // buffer for checking
  for (let i = 0; i < word.length; i++) {
    const r = direction === 'across' ? row : row + i
    const c = direction === 'across' ? col + i : col

    // Check if cell is within reasonable bounds
    if (r < minRow - expand || r > maxRow + expand || c < minCol - expand || c > maxCol + expand) {
      return false
    }

    // Check that this cell doesn't overlap with a non-matching character of another word
    for (const pw of placed) {
      for (let j = 0; j < pw.word.length; j++) {
        const pr = pw.direction === 'across' ? pw.row : pw.row + j
        const pc = pw.direction === 'across' ? pw.col + j : pw.col
        if (pr === r && pc === c) {
          if (pw.word[j] !== word[i]) return false
        }
      }
    }

    // Check adjacent cells (crossword rule: no adjacents parallel to word direction)
    if (direction === 'across') {
      // Check cell above and below (must be empty or matching)
      for (const pw of placed) {
        for (let j = 0; j < pw.word.length; j++) {
          const pr = pw.direction === 'across' ? pw.row : pw.row + j
          const pc = pw.direction === 'across' ? pw.col + j : pw.col
          if ((pr === r - 1 || pr === r + 1) && pc === c && pw.word[j] !== word[i]) {
            // Adjacent non-matching — only OK if this cell isn't an intersection
            const isIntersection = pw.word[j] === word[i]
            if (!isIntersection) return false
          }
        }
      }
    } else {
      // Check cell left and right
      for (const pw of placed) {
        for (let j = 0; j < pw.word.length; j++) {
          const pr = pw.direction === 'across' ? pw.row : pw.row + j
          const pc = pw.direction === 'across' ? pw.col + j : pw.col
          if (pr === r && (pc === c - 1 || pc === c + 1) && pw.word[j] !== word[i]) {
            const isIntersection = pw.word[j] === word[i]
            if (!isIntersection) return false
          }
        }
      }
    }
  }

  // Check that word doesn't collide with cell before/after its start/end
  for (const pw of placed) {
    for (let j = -1; j <= pw.word.length; j++) {
      const pr = pw.direction === 'across' ? pw.row : pw.row + j
      const pc = pw.direction === 'across' ? pw.col + j : pw.col
      if (direction === 'across') {
        // Check cell before start and after end
        if (row === pr && (col - 1 === pc || col + word.length === pc)) return false
      } else {
        if (col === pc && (row - 1 === pr || row + word.length === pr)) return false
      }
    }
  }

  return true
}

function buildGrid(placed: PlacedWord[]): { grid: GridCell[][]; rows: number; cols: number } {
  if (placed.length === 0) return { grid: [], rows: 0, cols: 0 }

  let maxRow = 0, maxCol = 0
  for (const pw of placed) {
    if (pw.direction === 'across') {
      maxRow = Math.max(maxRow, pw.row)
      maxCol = Math.max(maxCol, pw.col + pw.word.length - 1)
    } else {
      maxRow = Math.max(maxRow, pw.row + pw.word.length - 1)
      maxCol = Math.max(maxCol, pw.col)
    }
  }

  const rows = maxRow + 1
  const cols = maxCol + 1

  // Initialize empty grid
  const grid: GridCell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      letter: '',
      isActive: false,
      wordIndices: [] as number[],
      charPositions: {} as Record<number, number>,
    })),
  )

  // Fill in letters from placed words
  for (const pw of placed) {
    for (let i = 0; i < pw.word.length; i++) {
      const r = pw.direction === 'across' ? pw.row : pw.row + i
      const c = pw.direction === 'across' ? pw.col + i : pw.col
      grid[r][c].letter = pw.word[i]
      grid[r][c].isActive = true
      grid[r][c].wordIndices.push(pw.wordIdx)
      grid[r][c].charPositions[pw.wordIdx] = i
    }
  }

  return { grid, rows, cols }
}

function numberCells(grid: GridCell[][], placed: PlacedWord[]): void {
  let nextNumber = 1
  const numberedCells = new Set<string>()

  for (const pw of placed) {
    // Cells that start a word get a number
    const r = pw.direction === 'across' ? pw.row : pw.row
    const c = pw.direction === 'across' ? pw.col : pw.col
    const key = `${r},${c}`
    if (!numberedCells.has(key)) {
      grid[r][c].number = nextNumber++
      numberedCells.add(key)
    }
  }
}

function separateClues(placed: PlacedWord[], grid: GridCell[][]): {
  acrossClues: { number: number; clue: string; wordIdx: number }[]
  downClues: { number: number; clue: string; wordIdx: number }[]
} {
  const acrossClues: { number: number; clue: string; wordIdx: number }[] = []
  const downClues: { number: number; clue: string; wordIdx: number }[] = []

  for (const pw of placed) {
    const r = pw.direction === 'across' ? pw.row : pw.row
    const c = pw.direction === 'across' ? pw.col : pw.col
    const cellNumber = grid[r][c].number || 0
    const clue = { number: cellNumber, clue: pw.description, wordIdx: pw.wordIdx }

    if (pw.direction === 'across') {
      acrossClues.push(clue)
    } else {
      downClues.push(clue)
    }
  }

  // Sort by number
  acrossClues.sort((a, b) => a.number - b.number)
  downClues.sort((a, b) => a.number - b.number)

  return { acrossClues, downClues }
}

export function useCrosswordGrid(words: CrosswordWord[]): CrosswordLayout {
  const placed = layoutWords(words)
  const { grid, rows, cols } = buildGrid(placed)
  numberCells(grid, placed)
  const { acrossClues, downClues } = separateClues(placed, grid)
  const placedWords: PlacedWordInfo[] = placed.map(pw => ({
    wordIdx: pw.wordIdx,
    word: pw.word,
    description: pw.description,
    row: pw.row,
    col: pw.col,
    direction: pw.direction,
  }))

  return { grid, rows, cols, acrossClues, downClues, placedWords }
}
