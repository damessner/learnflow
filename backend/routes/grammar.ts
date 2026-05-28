import { Router, Request, Response, NextFunction } from 'express'
import fs from 'fs'
import path from 'path'
import { requireAuth } from '../middleware/requireAuth'

const router = Router()
const PROGRESS_FILE = path.join(__dirname, '..', 'data', 'grammar_progress.json')

// Helper to read progress
function readProgress(): Record<string, any> {
  if (!fs.existsSync(PROGRESS_FILE)) {
    return {}
  }
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
  } catch (e) {
    console.error('Error reading grammar progress file, resetting...', e)
    return {}
  }
}

// Helper to write progress
function writeProgress(data: Record<string, any>) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('Error writing grammar progress file', e)
  }
}

// Interfaces
interface QuestionMC {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface QuestionFITB {
  sentence: string
  placeholder: string
  correctAnswer: string
  explanation: string
}

interface QuestionText {
  question: string
  correctAnswers: string[]
  explanation: string
}

interface Topic {
  id: string
  unit: number
  title: string
  description: string
  explorer: QuestionMC[]
  pioneer: QuestionFITB[]
  master: QuestionText[]
}

// Static Grammar Topics Database (15 topics matching the MORE! 1 syllabus)
const GRAMMAR_TOPICS: Topic[] = [
  {
    id: 'grammar-1-plurals',
    unit: 1,
    title: 'Plurals & Imperatives',
    description: 'Learn how to form regular and irregular plural nouns and how to use imperatives in classroom instructions.',
    explorer: [
      {
        question: 'What is the plural of "book"?',
        options: ['books', 'bookes', 'book\'s'],
        correctIndex: 0,
        explanation: 'Regular plural forms simply add an "-s" to the singular noun.'
      },
      {
        question: 'Which of these is an irregular plural form?',
        options: ['tables', 'children', 'pens'],
        correctIndex: 1,
        explanation: '"children" is irregular (singular: "child"). Regular plurals add "-s" (e.g. tables, pens).'
      },
      {
        question: 'How do you form the negative imperative of "talk"?',
        options: ['No talk!', 'Not talk!', "Don't talk!"],
        correctIndex: 2,
        explanation: 'We use "Don\'t" + infinitive verb to form a negative imperative.'
      },
      {
        question: 'What is the plural of "box"?',
        options: ['boxs', 'boxes', 'boxies'],
        correctIndex: 1,
        explanation: 'Nouns ending in "-x" form their plurals by adding "-es" for easier pronunciation.'
      },
      {
        question: 'Choose the correct imperative for asking someone to open the window:',
        options: ['Open the window, please.', 'You opening the window.', 'Please window open.'],
        correctIndex: 0,
        explanation: 'Imperatives start directly with the base form of the verb: "Open...".'
      }
    ],
    pioneer: [
      {
        sentence: 'Two _____ (child) are playing in the schoolyard.',
        placeholder: 'child',
        correctAnswer: 'children',
        explanation: 'The plural of "child" is the irregular form "children".'
      },
      {
        sentence: 'Please _____ (not close) the door, it is hot.',
        placeholder: 'not close',
        correctAnswer: "don't close",
        explanation: 'Negative imperatives are formed with "don\'t" followed by the verb.'
      },
      {
        sentence: 'We have three _____ (box) of pencils in our classroom.',
        placeholder: 'box',
        correctAnswer: 'boxes',
        explanation: 'Nouns ending in "-x" add "-es" in their plural form.'
      },
      {
        sentence: '_____ (open) your book on page 10, please.',
        placeholder: 'open',
        correctAnswer: 'open',
        explanation: 'Imperatives start with the base form of the verb.'
      },
      {
        sentence: 'There are five _____ (pencil) in my pencil case.',
        placeholder: 'pencil',
        correctAnswer: 'pencils',
        explanation: 'The regular plural is formed by adding "-s".'
      }
    ],
    master: [
      {
        question: 'Correct the following sentence: "Don\'t opening the window, please."',
        correctAnswers: ["Don't open the window, please.", "Don't open the window please.", "Please don't open the window."],
        explanation: 'Imperatives must use the infinitive base verb, not the -ing form.'
      },
      {
        question: 'Translate: "Öffne die Tür, bitte."',
        correctAnswers: ['Open the door, please.', 'Open the door please.', 'Please open the door.'],
        explanation: 'The verb "open" is translated as "Öffne".'
      },
      {
        question: 'Form the plural of: "This is a child with a pencil." (Translate to plural: "These are...")',
        correctAnswers: ['These are children with pencils.', 'These are children with pencils'],
        explanation: '"child" becomes "children" and "pencil" becomes "pencils".'
      },
      {
        question: 'Correct: "The three boyes are sitting on the chairs."',
        correctAnswers: ['The three boys are sitting on the chairs.', 'The three boys are sitting on chairs.'],
        explanation: '"boy" forms a regular plural by adding "-s" ("boys"), not "-es".'
      },
      {
        question: 'Form the negative command: "Run in the classroom!"',
        correctAnswers: ["Don't run in the classroom!", "Do not run in the classroom!", "Don't run in the classroom."],
        explanation: 'Use "Don\'t" or "Do not" to negate imperatives.'
      }
    ]
  },
  {
    id: 'grammar-2-tobe',
    unit: 2,
    title: 'Verb "to be" & Prepositions of Place',
    description: 'Master the forms of "to be" (am, is, are) and prepositions like in, on, under, behind, and next to.',
    explorer: [
      {
        question: 'Which form of "to be" matches "He"?',
        options: ['am', 'is', 'are'],
        correctIndex: 1,
        explanation: '"He/She/It" uses "is".'
      },
      {
        question: 'Complete: "The pens _____ on the table."',
        options: ['am', 'is', 'are'],
        correctIndex: 2,
        explanation: '"The pens" is plural (they), which takes the form "are".'
      },
      {
        question: 'Where is the book if it is resting on top of the desk?',
        options: ['in the desk', 'on the desk', 'under the desk'],
        correctIndex: 1,
        explanation: '"on" is used when an object is in contact with the upper surface of another.'
      },
      {
        question: 'Complete: "I _____ eleven years old."',
        options: ['am', 'is', 'are'],
        correctIndex: 0,
        explanation: '"I" always matches with "am".'
      },
      {
        question: 'If Bello is sleeping beneath the chair, he is _____ the chair.',
        options: ['under', 'behind', 'next to'],
        correctIndex: 0,
        explanation: '"under" means below or beneath.'
      }
    ],
    pioneer: [
      {
        sentence: 'We _____ (be) students at the Mittelschule.',
        placeholder: 'be',
        correctAnswer: 'are',
        explanation: '"We" takes the plural form of the verb to be, which is "are".'
      },
      {
        sentence: 'The cat is sitting _____ (auf) the table.',
        placeholder: 'auf',
        correctAnswer: 'on',
        explanation: '"on" translates to "auf" when indicating surface contact.'
      },
      {
        sentence: 'Look! My ruler is _____ (unter) the chair.',
        placeholder: 'unter',
        correctAnswer: 'under',
        explanation: '"under" is used for positions below.'
      },
      {
        sentence: 'She _____ (be) my English teacher.',
        placeholder: 'be',
        correctAnswer: 'is',
        explanation: '"She" is third-person singular and takes "is".'
      },
      {
        sentence: 'The pencils are _____ (in) the pencil case.',
        placeholder: 'in',
        correctAnswer: 'in',
        explanation: '"in" is used for objects inside a container.'
      }
    ],
    master: [
      {
        question: 'Translate: "Ich bin in der Schule und mein Buch ist auf dem Tisch."',
        correctAnswers: ['I am at school and my book is on the table.', 'I am in school and my book is on the table.', 'I am in the school and my book is on the table.'],
        explanation: 'Bin -> am, in der Schule -> at/in school, ist -> is, auf dem Tisch -> on the table.'
      },
      {
        question: 'Correct: "The children is next the teacher."',
        correctAnswers: ['The children are next to the teacher.', 'The children are next to teacher.'],
        explanation: 'Plural "children" takes "are", and the preposition must be "next to".'
      },
      {
        question: 'Translate: "Wo sind die Hunde? Sie sind unter dem Stuhl."',
        correctAnswers: ['Where are the dogs? They are under the chair.', 'Where are the dogs? They are under the chair'],
        explanation: 'Wo sind -> Where are, Hunde -> dogs, sie sind -> they are, unter dem Stuhl -> under the chair.'
      },
      {
        question: 'Correct: "I are on the classroom."',
        correctAnswers: ['I am in the classroom.', 'I am in classroom.'],
        explanation: '"I" takes "am", and the correct preposition for a room is "in".'
      },
      {
        question: 'Form a sentence using: "Bello", "is", "next to", "the box".',
        correctAnswers: ['Bello is next to the box.', 'Bello is next to the box'],
        explanation: 'Subject + verb + prepositional phrase: "Bello is next to the box."'
      }
    ]
  },
  {
    id: 'grammar-3-havegot',
    unit: 3,
    title: "Have got & Haven't got",
    description: 'Learn how to state possessions and describe character traits using have/has got and negatives.',
    explorer: [
      {
        question: 'Complete: "He _____ a green parrot."',
        options: ["have got", "has got", "is got"],
        correctIndex: 1,
        explanation: '"He/She/It" takes "has got".'
      },
      {
        question: 'What is the negative form of "I have got a bike"?',
        options: ["I haven't got a bike.", "I has got not a bike.", "I don't have got a bike."],
        correctIndex: 0,
        explanation: 'The negative form is "haven\'t got".'
      },
      {
        question: 'Complete: "They _____ a big dog."',
        options: ["has got", "have got", "haves got"],
        correctIndex: 1,
        explanation: 'Plural "They" takes "have got".'
      },
      {
        question: 'Choose the correct sentence:',
        options: ["She have got one brother.", "She has got one brother.", "She is got one brother."],
        correctIndex: 1,
        explanation: '"She" takes "has got".'
      },
      {
        question: 'What is the correct negative of "He has got a sister"?',
        options: ["He hasn't got a sister.", "He haven't got a sister.", "He has not sister."],
        correctIndex: 0,
        explanation: 'Singular "He" negates as "hasn\'t got".'
      }
    ],
    pioneer: [
      {
        sentence: 'I _____ (have got) two computers in my room.',
        placeholder: 'have got',
        correctAnswer: 'have got',
        explanation: '"I" takes the base "have got".'
      },
      {
        sentence: 'She _____ (not have got) a pet hamster.',
        placeholder: 'not have got',
        correctAnswer: "hasn't got",
        explanation: 'Third person singular negative is "hasn\'t got".'
      },
      {
        sentence: 'My brother _____ (have got) blue eyes.',
        placeholder: 'have got',
        correctAnswer: 'has got',
        explanation: '"My brother" (he) takes "has got".'
      },
      {
        sentence: 'We _____ (not have got) school today.',
        placeholder: 'not have got',
        correctAnswer: "haven't got",
        explanation: 'Plural "We" negates as "haven\'t got".'
      },
      {
        sentence: 'They _____ (have got) ten colored pencils.',
        placeholder: 'have got',
        correctAnswer: 'have got',
        explanation: '"They" takes "have got".'
      }
    ],
    master: [
      {
        question: 'Translate: "Er hat ein rotes Fahrrad, aber er hat keinen Helm."',
        correctAnswers: ["He has got a red bike, but he hasn't got a helmet.", "He has got a red bicycle, but he hasn't got a helmet."],
        explanation: 'Er hat -> He has got, rotes Fahrrad -> a red bike, aber -> but, er hat keinen -> he hasn\'t got.'
      },
      {
        question: 'Correct: "They has got three dogs and one cat."',
        correctAnswers: ['They have got three dogs and one cat.', 'They have got three dogs and a cat.'],
        explanation: 'Plural "They" must take "have got", not "has got".'
      },
      {
        question: 'Translate: "Ich habe braune Haare, aber ich habe keine braunen Augen."',
        correctAnswers: ["I have got brown hair, but I haven't got brown eyes.", "I have got brown hair but I haven't got brown eyes."],
        explanation: 'brown hair -> braune Haare (singular uncountable in English), but -> aber, I haven\'t got -> ich habe keine.'
      },
      {
        question: 'Correct: "She haven\'t got any homework today."',
        correctAnswers: ["She hasn't got any homework today.", "She has got no homework today."],
        explanation: '"She" must use the singular negative "hasn\'t got".'
      },
      {
        question: 'Write a sentence saying you have got a green book:',
        correctAnswers: ['I have got a green book.', 'I have got a green book', 'I\'ve got a green book.'],
        explanation: 'Subject + have got + object: "I have got a green book."'
      }
    ]
  }
];

// Dynamically generate default topics for Units 4 to 15 if not fully hardcoded
for (let u = 4; u <= 15; u++) {
  const titles = [
    "", "", "", "", // 0, 1, 2, 3
    'Questions & Negatives with "to be"', // 4
    "Can/Can't & Possessives", // 5
    "Present Simple Affirmative", // 6
    "Present Simple Negatives & Articles", // 7
    "Present Simple Questions", // 8
    "Question Words & Object Pronouns", // 9
    "Demonstratives & Prices", // 10
    "Present Continuous", // 11
    'Past Simple of "to be"', // 12
    "Past Simple Regular Verbs", // 13
    "Past Simple Negatives & Irregular Verbs", // 14
    'Future Plans: "be going to"' // 15
  ]

  const descriptions = [
    "", "", "", "",
    'Practice building questions and negative statements using the verb "to be".',
    "Learn to express actions using can/can't and describe possession.",
    'Master the Present Simple tense in positive sentences, including third-person "-s".',
    'Practice don\'t/doesn\'t, articles a/an, and frequency adverbs.',
    'Form questions in the Present Simple using "do" and "does".',
    'Learn how to ask questions with question words and use object pronouns.',
    'Master demonstratives (this/that/these/those) and asking for prices.',
    'Describe ongoing actions happening right now using the -ing form.',
    'Practice talking about past events using was and were and dates.',
    'Master forming regular past tense verbs with -ed endings and connectives.',
    'Form past negative sentences and use irregular past tense verbs.',
    'Plan ahead and state your intentions using the be going to future.'
  ]

  GRAMMAR_TOPICS.push({
    id: `grammar-${u}-${titles[u].toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    unit: u,
    title: titles[u],
    description: descriptions[u],
    explorer: [
      {
        question: `Question 1 about ${titles[u]} (Explorer)`,
        options: ['Option A (Correct)', 'Option B', 'Option C'],
        correctIndex: 0,
        explanation: `This is a sample explanation for ${titles[u]} Explorer.`
      },
      {
        question: `Question 2 about ${titles[u]} (Explorer)`,
        options: ['Option A', 'Option B (Correct)', 'Option C'],
        correctIndex: 1,
        explanation: 'Correct choice verified.'
      },
      {
        question: `Question 3 about ${titles[u]} (Explorer)`,
        options: ['Option A', 'Option B', 'Option C (Correct)'],
        correctIndex: 2,
        explanation: 'Correct choice verified.'
      },
      {
        question: `Question 4 about ${titles[u]} (Explorer)`,
        options: ['Option A (Correct)', 'Option B', 'Option C'],
        correctIndex: 0,
        explanation: 'Correct choice verified.'
      },
      {
        question: `Question 5 about ${titles[u]} (Explorer)`,
        options: ['Option A', 'Option B (Correct)', 'Option C'],
        correctIndex: 1,
        explanation: 'Correct choice verified.'
      }
    ],
    pioneer: [
      {
        sentence: `This is a pioneer sentence for ${titles[u]}. Please write "yes" in the blank. _____`,
        placeholder: 'blank',
        correctAnswer: 'yes',
        explanation: 'This is the Pioneer explanation.'
      },
      {
        sentence: 'I always _____ (study) grammar in school.',
        placeholder: 'study',
        correctAnswer: 'study',
        explanation: 'Present form is study.'
      },
      {
        sentence: 'Bello _____ (not like) cats.',
        placeholder: 'not like',
        correctAnswer: "doesn't like",
        explanation: 'Negation takes does not.'
      },
      {
        sentence: 'We _____ (be) excited about the quest.',
        placeholder: 'be',
        correctAnswer: 'are',
        explanation: 'We matches are.'
      },
      {
        sentence: 'The student _____ (write) an answer now.',
        placeholder: 'write',
        correctAnswer: 'is writing',
        explanation: 'Continuous action.'
      }
    ],
    master: [
      {
        question: `Correct this master sentence: "i plays tennis very well"`,
        correctAnswers: ['I play tennis very well.', 'I play tennis very well'],
        explanation: 'Capitalize I, use play instead of plays for first person singular.'
      },
      {
        question: `Translate: "Wir spielen Fußball."`,
        correctAnswers: ['We play football.', 'We are playing football.', 'We play soccer.'],
        explanation: 'Translation verified.'
      },
      {
        question: `Correct: "He dont like apples."`,
        correctAnswers: ["He doesn't like apples.", "He does not like apples."],
        explanation: 'Third person negation.'
      },
      {
        question: 'Form a sentence using: "she", "can", "swim".',
        correctAnswers: ['She can swim.', 'She can swim', 'she can swim.'],
        explanation: 'Subject + modal + verb.'
      },
      {
        question: `Correct: "They was at school yesterday."`,
        correctAnswers: ['They were at school yesterday.', 'They were at school yesterday'],
        explanation: 'They matches were.'
      }
    ]
  })
}

// ─── GET /api/grammar/topics ──────────────────────────────────────────────
router.get('/topics', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const progress = readProgress()
    
    // User progress details
    const userProgress = progress[userId] || { completions: {}, badges: [], quizzes: {} }
    
    // Map topics with student progress
    const topicsList = GRAMMAR_TOPICS.map((topic) => {
      const topicProgress = userProgress.completions[topic.id] || {
        explorer: false,
        pioneer: false,
        master: false,
        quizGrade: null
      }
      
      const badgeExplorer = `badge-explorer-${topic.id}`
      const badgePioneer = `badge-pioneer-${topic.id}`
      const badgeMaster = `badge-master-${topic.id}`

      return {
        id: topic.id,
        unit: topic.unit,
        title: topic.title,
        description: topic.description,
        progress: topicProgress,
        badges: {
          explorer: userProgress.badges.includes(badgeExplorer),
          pioneer: userProgress.badges.includes(badgePioneer),
          master: userProgress.badges.includes(badgeMaster)
        }
      }
    })

    res.json({ topics: topicsList, badgesCount: userProgress.badges.length })
  } catch (err) {
    next(err)
  }
})

// ─── POST /api/grammar/topics/:id/submit-worksheet ─────────────────────────
router.post('/topics/:id/submit-worksheet', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topicId = req.params.id as string
    const { answers, level } = req.body // level: 'explorer' | 'pioneer' | 'master'
    const userId = req.user!.userId

    const topic = GRAMMAR_TOPICS.find((t) => t.id === topicId)
    if (!topic) {
       res.status(404).json({ error: 'Topic not found' })
       return
    }

    const progress = readProgress()
    if (!progress[userId]) {
      progress[userId] = { completions: {}, badges: [], quizzes: {} }
    }

    if (!progress[userId].completions[topicId]) {
      progress[userId].completions[topicId] = {
        explorer: false,
        pioneer: false,
        master: false,
        quizGrade: null
      }
    }

    // Evaluate answers
    let isCorrect = true
    const evaluation: boolean[] = []

    if (level === 'explorer') {
      const questions = topic.explorer
      questions.forEach((q, idx) => {
        const correct = Number(answers[idx]) === q.correctIndex
        evaluation.push(correct)
        if (!correct) isCorrect = false
      })
    } else if (level === 'pioneer') {
      const questions = topic.pioneer
      questions.forEach((q, idx) => {
        const correct = String(answers[idx] || '').trim().toLowerCase() === q.correctAnswer.toLowerCase()
        evaluation.push(correct)
        if (!correct) isCorrect = false
      })
    } else if (level === 'master') {
      const questions = topic.master
      questions.forEach((q, idx) => {
        const input = String(answers[idx] || '').trim().toLowerCase()
        const match = q.correctAnswers.some(ans => ans.toLowerCase() === input)
        evaluation.push(match)
        if (!match) isCorrect = false
      })
    } else {
       res.status(400).json({ error: 'Invalid level' })
       return
    }

    // Award badge if all are correct
    let badgeAwarded = false
    const badgeId = `badge-${level}-${topicId}`
    if (isCorrect) {
      progress[userId].completions[topicId][level] = true
      
      // Award badge if not already earned
      if (!progress[userId].badges.includes(badgeId)) {
        progress[userId].badges.push(badgeId)
        badgeAwarded = true
        
        // Award XP via gamification service if possible (or simulate it locally)
        try {
          const knex = require('../db/knex').getKnex()
          const { addXp } = require('../services/gamification')
          await addXp(userId, 25) // 25 XP per level
        } catch (e) {
          // ignore if gamification unavailable in context
        }
      }
    }

    writeProgress(progress)

    res.json({
      success: isCorrect,
      evaluation,
      badge_awarded: badgeAwarded,
      badge_id: badgeId,
      progress: progress[userId].completions[topicId]
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /api/grammar/topics/:id/quiz/generate ────────────────────────────
router.post('/topics/:id/quiz/generate', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topicId = req.params.id as string
    const userId = req.user!.userId

    const topic = GRAMMAR_TOPICS.find((t) => t.id === topicId)
    if (!topic) {
       res.status(404).json({ error: 'Topic not found' })
       return
    }

    const progress = readProgress()
    const userProgress = progress[userId]
    if (!userProgress || !userProgress.completions[topicId] || !userProgress.completions[topicId].master) {
       res.status(400).json({ error: 'Must complete all 3 levels before starting the finisher quiz!' })
       return
    }

    // Custom AI Finisher Quiz Generation
    // Simulate analyzing wrong answers or difficulty, generating 10 tailored questions
    const generatedQuestions = [
      {
        question: `Review: Which of these shows the correct application of ${topic.title}?`,
        options: ['Choice A (Correct)', 'Choice B', 'Choice C'],
        correctIndex: 0,
        explanation: 'Review explanation.'
      },
      {
        question: `Challenge: What is the most formal way to apply ${topic.title}?`,
        options: ['Choice A', 'Choice B (Correct)', 'Choice C'],
        correctIndex: 1,
        explanation: 'Correct usage verified.'
      },
      {
        question: `Identify the grammatical error related to ${topic.title}:`,
        options: ['Correct sentence', 'Incorrect sentence (Correct)', 'Another sentence'],
        correctIndex: 1,
        explanation: 'Incorrect forms must be corrected.'
      },
      {
        question: `How does the spelling change for third person plural in ${topic.title}?`,
        options: ['No change (Correct)', 'Adds -es', 'Adds -s'],
        correctIndex: 0,
        explanation: 'Plural matches base forms.'
      },
      {
        question: `Complete the sentence with correct grammar:`,
        options: ['Correct option (Correct)', 'Incorrect option', 'Partially correct option'],
        correctIndex: 0,
        explanation: 'Grammatically sound.'
      },
      {
        question: `Which connector is appropriate for this grammar context?`,
        options: ['Option 1', 'Option 2', 'Option 3 (Correct)'],
        correctIndex: 2,
        explanation: 'Matches connectors context.'
      },
      {
        question: `Choose the correct negation:`,
        options: ['Incorrect negative', 'Correct negative (Correct)', 'No negative'],
        correctIndex: 1,
        explanation: 'Negation form validated.'
      },
      {
        question: `Translate correctly using this topic:`,
        options: ['Translation A (Correct)', 'Translation B', 'Translation C'],
        correctIndex: 0,
        explanation: 'Matches original sentence meaning.'
      },
      {
        question: `What is the irregular form here?`,
        options: ['Regular', 'Irregular (Correct)', 'None of above'],
        correctIndex: 1,
        explanation: 'Irregular forms do not follow regular rules.'
      },
      {
        question: `Final Question: Summarize the core rule of ${topic.title}:`,
        options: ['Rule statement (Correct)', 'Alternative rule', 'Wrong rule'],
        correctIndex: 0,
        explanation: 'The core rule is essential.'
      }
    ]

    // Save generated quiz
    if (!userProgress.quizzes) userProgress.quizzes = {}
    userProgress.quizzes[topicId] = {
      questions: generatedQuestions
    }

    writeProgress(progress)

    res.json({
      questions: generatedQuestions
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /api/grammar/topics/:id/quiz/submit ──────────────────────────────
router.post('/topics/:id/quiz/submit', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topicId = req.params.id as string
    const { answers } = req.body // array of 10 answers
    const userId = req.user!.userId

    const progress = readProgress()
    const userProgress = progress[userId]
    if (!userProgress || !userProgress.quizzes || !userProgress.quizzes[topicId]) {
       res.status(404).json({ error: 'Quiz not generated or not found' })
       return
    }

    const quiz = userProgress.quizzes[topicId]
    let correctCount = 0
    const evaluation = quiz.questions.map((q: any, idx: number) => {
      const correct = Number(answers[idx]) === q.correctIndex
      if (correct) correctCount++
      return correct
    })

    const scorePct = Math.round((correctCount / quiz.questions.length) * 100)
    
    // Grading mapping A-F
    let grade = 'F'
    if (scorePct >= 90) grade = 'A'
    else if (scorePct >= 80) grade = 'B'
    else if (scorePct >= 60) grade = 'C'
    else if (scorePct >= 50) grade = 'D'

    // Update completions
    userProgress.completions[topicId].quizGrade = grade
    quiz.userAnswers = answers
    quiz.grade = grade

    // Award XP for completing finisher quiz
    try {
      const knex = require('../db/knex').getKnex()
      const { addXp } = require('../services/gamification')
      await addXp(userId, 50) // 50 XP for Finisher Quiz
    } catch (e) {
      // ignore
    }

    writeProgress(progress)

    res.json({
      score: correctCount,
      total: quiz.questions.length,
      grade,
      evaluation,
      completions: userProgress.completions[topicId]
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /api/grammar/topics/:id/reset ────────────────────────────────────
router.post('/topics/:id/reset', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topicId = req.params.id as string
    const userId = req.user!.userId

    const progress = readProgress()
    const userProgress = progress[userId]
    if (userProgress) {
      // Reset completion states
      userProgress.completions[topicId] = {
        explorer: false,
        pioneer: false,
        master: false,
        quizGrade: null
      }

      // Remove specific badges for this topic
      const badgesToRemove = [
        `badge-explorer-${topicId}`,
        `badge-pioneer-${topicId}`,
        `badge-master-${topicId}`
      ]
      userProgress.badges = userProgress.badges.filter((b: string) => !badgesToRemove.includes(b))

      // Delete generated quiz
      if (userProgress.quizzes && userProgress.quizzes[topicId]) {
        delete userProgress.quizzes[topicId]
      }

      writeProgress(progress)
    }

    res.json({
      message: 'Grammar topic progress reset successfully. All levels are locked.',
      progress: userProgress ? userProgress.completions[topicId] : null
    })
  } catch (err) {
    next(err)
  }
})

export default router
