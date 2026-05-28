import { describe, it, expect } from 'vitest'
import { scoreAnswers } from './scoring'

describe('scoreAnswers true_false support', () => {
  it('scores correct for boolean answer shape', () => {
    const blocks = [
      { id: 'b1', type: 'true_false', points: 2, correct_answer: true },
    ]

    const result = scoreAnswers(blocks, { b1: true })
    expect(result.score).toBe(2)
    expect(result.maxScore).toBe(2)
  })

  it('scores correct for numeric and string answer shapes', () => {
    const blocks = [
      { id: 'b1', type: 'true_false', points: 1, correct_answer: false },
      { id: 'b2', type: 'true_false', points: 1, correct_answer: true },
    ]

    const result = scoreAnswers(blocks, { b1: 0, b2: 'true' })
    expect(result.score).toBe(2)
    expect(result.maxScore).toBe(2)
  })
})

describe('scoreAnswers ordering support', () => {
  it('scores correct when answer uses ordered text array', () => {
    const blocks = [
      { id: 'o1', type: 'ordering', points: 3, items: ['first', 'second', 'third'] },
    ]

    const result = scoreAnswers(blocks, { o1: ['first', 'second', 'third'] })
    expect(result.score).toBe(3)
  })

  it('scores correct when answer uses index map object', () => {
    const blocks = [
      { id: 'o1', type: 'ordering', points: 4, items: ['a', 'b', 'c'], correct_order: [0, 1, 2] },
    ]

    const result = scoreAnswers(blocks, { o1: { 0: 0, 1: 1, 2: 2 } })
    expect(result.score).toBe(4)
  })

  it('scores incorrect when order is wrong', () => {
    const blocks = [
      { id: 'o1', type: 'ordering', points: 5, items: ['x', 'y', 'z'] },
    ]

    const result = scoreAnswers(blocks, { o1: ['z', 'y', 'x'] })
    expect(result.score).toBe(0)
    expect(result.maxScore).toBe(5)
  })
})
