export interface GrammarTemplate {
  name: string
  description: string
  type: string
  languages: string[]
  generateBlocks(inputs: Record<string, string>): Record<string, unknown>[]
}

const grammarTemplates: GrammarTemplate[] = [
  {
    name: 'conjugation',
    description: 'Verb conjugation drill',
    type: 'gap_fill',
    languages: ['de', 'en', 'fr', 'es'],
    generateBlocks(inputs) {
      const verbs = (inputs.verbs || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const tense = inputs.tense || 'present'
      const pronouns =
        inputs.language === 'de'
          ? ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']
          : ['I', 'you', 'he/she/it', 'we', 'you (pl)', 'they']

      const blocks: Record<string, unknown>[] = []
      for (const verb of verbs) {
        for (let i = 0; i < pronouns.length; i++) {
          blocks.push({
            id: crypto.randomUUID?.(),
            type: 'gap_fill',
            points: 1,
            template: `${pronouns[i]} ((conjugate: ${verb}, ${tense}))`,
          })
        }
      }
      return blocks
    },
  },
  {
    name: 'cases',
    description: 'German case exercise (der/die/das → dem/der/dem)',
    type: 'gap_fill',
    languages: ['de'],
    generateBlocks(inputs) {
      const focus = inputs.case || 'dativ'
      const templates: Record<string, string[]> = {
        nominativ: ['((Der)) Mann geht.', '((Die)) Frau liest.', '((Das)) Kind spielt.'],
        akkusativ: ['Ich sehe ((den)) Mann.', 'Ich sehe ((die)) Frau.', 'Ich sehe ((das)) Kind.'],
        dativ: [
          'Ich gebe ((dem)) Mann das Buch.',
          'Ich gebe ((der)) Frau das Buch.',
          'Ich gebe ((dem)) Kind das Buch.',
        ],
        genitiv: [
          'Das ist das Buch ((des)) Mannes.',
          'Das ist das Buch ((der)) Frau.',
          'Das ist das Buch ((des)) Kindes.',
        ],
      }

      const sentences = templates[focus] || templates['dativ']
      return sentences.map((s) => ({
        id: crypto.randomUUID?.(),
        type: 'gap_fill',
        points: 1,
        template: s,
      }))
    },
  },
  {
    name: 'word_order',
    description: 'Sentence word order — scramble and reorder',
    type: 'ordering',
    languages: ['de', 'en', 'nl'],
    generateBlocks(inputs) {
      const sentences = (inputs.sentences || '')
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean)
      return sentences.map((s) => ({
        id: crypto.randomUUID?.(),
        type: 'ordering',
        points: s.split(' ').length,
        items: s.split(' '),
        correct_order: Array.from({ length: s.split(' ').length }, (_, i) => i),
      }))
    },
  },
  {
    name: 'prepositions',
    description: 'Preposition practice (in, auf, an, unter...)',
    type: 'gap_fill',
    languages: ['de', 'en'],
    generateBlocks(inputs) {
      const focus = inputs.focus || 'location'
      const dePreps: Record<string, string[]> = {
        location: ['in', 'auf', 'an', 'unter', 'über', 'neben', 'vor', 'hinter', 'zwischen'],
        direction: ['nach', 'zu', 'in', 'auf', 'an', 'aus', 'von', 'bei', 'seit'],
        time: ['um', 'am', 'im', 'vor', 'nach', 'seit', 'bis', 'ab', 'gegen'],
      }
      const preps = dePreps[focus] || dePreps['location']
      const sentences: string[] = []
      for (const p of preps) {
        sentences.push(`Der Stift liegt ((${p})) dem Tisch.`)
      }
      return sentences.map((s) => ({
        id: crypto.randomUUID?.(),
        type: 'gap_fill',
        points: 1,
        template: s,
      }))
    },
  },
]

export function getGrammarTemplates(language?: string): GrammarTemplate[] {
  if (!language) return grammarTemplates
  return grammarTemplates.filter((t) => t.languages.includes(language))
}

export function generateGrammarExercise(
  templateName: string,
  inputs: Record<string, string>,
): Record<string, unknown>[] {
  const template = grammarTemplates.find((t) => t.name === templateName)
  if (!template) throw new Error(`Grammar template "${templateName}" not found`)
  return template.generateBlocks(inputs)
}
