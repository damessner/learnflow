import { describe, it, expect } from 'vitest'
import { getAustrianGrade, getSubjectKey, buildWorksheetPrompt } from './ai'

describe('Austrian Curriculum (Lehrpläne) integration', () => {
  describe('getAustrianGrade', () => {
    it('should map grade levels 1 and 5 to Austrian Mittelschule Grade 1', () => {
      expect(getAustrianGrade('1')).toBe('1')
      expect(getAustrianGrade('5')).toBe('1')
      expect(getAustrianGrade(' 5 ')).toBe('1')
    })

    it('should map grade levels 2 and 6 to Austrian Mittelschule Grade 2', () => {
      expect(getAustrianGrade('2')).toBe('2')
      expect(getAustrianGrade('6')).toBe('2')
    })

    it('should map grade levels 3 and 7 to Austrian Mittelschule Grade 3', () => {
      expect(getAustrianGrade('3')).toBe('3')
      expect(getAustrianGrade('7')).toBe('3')
    })

    it('should map grade levels 4 and 8 to Austrian Mittelschule Grade 4', () => {
      expect(getAustrianGrade('4')).toBe('4')
      expect(getAustrianGrade('8')).toBe('4')
    })

    it('should return null for other values or undefined', () => {
      expect(getAustrianGrade('9')).toBeNull()
      expect(getAustrianGrade(undefined)).toBeNull()
      expect(getAustrianGrade('')).toBeNull()
    })
  })

  describe('getSubjectKey', () => {
    it('should map common subject names to official JSON subject keys', () => {
      expect(getSubjectKey('english')).toBe('English')
      expect(getSubjectKey('englisch')).toBe('English')
      expect(getSubjectKey('mathematics')).toBe('Mathematics')
      expect(getSubjectKey('mathematik')).toBe('Mathematics')
      expect(getSubjectKey('mathe')).toBe('Mathematics')
      expect(getSubjectKey('german')).toBe('German')
      expect(getSubjectKey('deutsch')).toBe('German')
      expect(getSubjectKey('science')).toBe('Science')
      expect(getSubjectKey('biologie')).toBe('Science')
      expect(getSubjectKey('history')).toBe('History')
      expect(getSubjectKey('geschichte')).toBe('History')
      expect(getSubjectKey('geography')).toBe('Geography')
      expect(getSubjectKey('geographie')).toBe('Geography')
    })

    it('should capitalize other subjects as a fallback', () => {
      expect(getSubjectKey('art')).toBe('Art')
      expect(getSubjectKey('music')).toBe('Music')
    })

    it('should return null for undefined', () => {
      expect(getSubjectKey(undefined)).toBeNull()
    })
  })

  describe('buildWorksheetPrompt curriculum injection', () => {
    it('should inject Austrian Lehrplan constraints for English Grade 5 (MS 1)', () => {
      const prompt = buildWorksheetPrompt({
        prompt: 'Present Simple vs Present Progressive',
        subject: 'English',
        grade_level: '5',
        difficulty: 'easy',
        length: 'short',
        provider: 'gemini',
        style: 'practice',
      })

      expect(prompt).toContain('AUSTRIAN CURRICULUM CONSTRAINTS (LEHRPLAN):')
      expect(prompt).toContain('Mittelschule Österreich (Grade 1 / Schulstufe 5):')
      expect(prompt).toContain('Present Simple')
    })

    it('should inject Austrian Lehrplan constraints for Math Grade 8 (MS 4)', () => {
      const prompt = buildWorksheetPrompt({
        prompt: 'Calculate volumes',
        subject: 'Mathematics',
        grade_level: '8',
        difficulty: 'medium',
        length: 'medium',
        provider: 'gemini',
        style: 'practice',
      })

      expect(prompt).toContain('AUSTRIAN CURRICULUM CONSTRAINTS (LEHRPLAN):')
      expect(prompt).toContain('Mittelschule Österreich (Grade 4 / Schulstufe 8):')
      expect(prompt).toContain('Oberfläche und Volumen (Kegel, Kugel')
    })

    it('should not inject curriculum constraints if subject is not mapped', () => {
      const prompt = buildWorksheetPrompt({
        prompt: 'Paint a sunset',
        subject: 'Art',
        grade_level: '5',
        difficulty: 'easy',
        length: 'short',
        provider: 'gemini',
        style: 'practice',
      })

      expect(prompt).not.toContain('AUSTRIAN CURRICULUM CONSTRAINTS (LEHRPLAN):')
    })
  })
})
