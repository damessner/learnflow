import { Router, Request, Response, NextFunction } from 'express'
import fs from 'fs'
import path from 'path'
import { requireAuth } from '../middleware/requireAuth'
import logger from '../lib/logger'

const router = Router()
const PROGRESS_FILE = path.join(__dirname, '..', 'data', 'grammar_progress.json')

type CompletionState = {
  explorer: boolean
  pioneer: boolean
  master: boolean
  quizGrade: string | null
}

type QuizQuestion = {
  correctIndex: number
}

type UserProgress = {
  completions: Record<string, CompletionState>
  badges: string[]
  quizzes: Record<string, { questions: QuizQuestion[]; userAnswers?: unknown; grade?: string }>
}

type GrammarProgressStore = Record<string, UserProgress>

// Helper to read progress
function readProgress(): GrammarProgressStore {
  if (!fs.existsSync(PROGRESS_FILE)) {
    return {}
  }
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8')) as GrammarProgressStore
  } catch (err) {
    logger.error({ err }, 'Error reading grammar progress file, resetting')
    return {}
  }
}

// Helper to write progress
function writeProgress(data: GrammarProgressStore) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    logger.error({ err }, 'Error writing grammar progress file')
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
      },
      {
        question: 'True or False: "Childs" is the correct plural of "child".',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: '"Child" has an irregular plural: "children", not "childs".'
      },
      {
        question: 'Which of these sentences uses the imperative correctly?',
        options: ['Sit down, please.', 'You sit down, please.', 'Sitting down, please.'],
        correctIndex: 0,
        explanation: 'Imperatives start with the base verb: "Sit down, please."'
      },
      {
        question: 'What is the plural of "foot"?',
        options: ['foots', 'feet', 'footes'],
        correctIndex: 1,
        explanation: '"Foot" is an irregular noun — its plural is "feet".'
      },
      {
        question: 'Which word is a plural noun?',
        options: ['mouse', 'mice', 'mouses'],
        correctIndex: 1,
        explanation: '"Mice" is the irregular plural of "mouse".'
      },
      {
        question: 'What is the correct imperative for a teacher telling students not to run?',
        options: ["Don't run!", 'No running!', 'Not to run!'],
        correctIndex: 0,
        explanation: 'The negative imperative is formed with "Don\'t" + base verb.'
      },
      {
        question: 'Choose the sentence with the correct plural:',
        options: ['I have two foots.', 'I have two feet.', 'I have two foot.'],
        correctIndex: 1,
        explanation: '"Feet" is the correct irregular plural of "foot".'
      },
      {
        question: 'What is the plural of "tooth"?',
        options: ['tooths', 'teeth', 'toothes'],
        correctIndex: 1,
        explanation: '"Tooth" becomes "teeth" in its irregular plural form.'
      },
      {
        question: 'Which is the correct imperative form for "not to be late"?',
        options: ["Don't be late!", 'Not be late!', "Be not late!"],
        correctIndex: 0,
        explanation: 'Negative imperatives use "Don\'t" + base verb: "Don\'t be late!"'
      },
      {
        question: 'What is the plural of "man"?',
        options: ['mans', 'men', 'manes'],
        correctIndex: 1,
        explanation: '"Man" is irregular — its plural is "men".'
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
      },
      {
        sentence: 'Put the words in order: "please / book / your / open"',
        placeholder: 'order',
        correctAnswer: 'open your book please',
        explanation: 'The correct imperative order is: verb + object + please.'
      },
      {
        sentence: 'Two _____ (woman) are walking to school.',
        placeholder: 'woman',
        correctAnswer: 'women',
        explanation: '"Woman" is irregular — its plural is "women".'
      },
      {
        sentence: 'All the _____ (child) love playing football.',
        placeholder: 'child',
        correctAnswer: 'children',
        explanation: '"Children" is the irregular plural of "child".'
      },
      {
        sentence: 'Please _____ (not / write) on the table!',
        placeholder: 'not / write',
        correctAnswer: "don't write",
        explanation: 'The negative imperative uses "don\'t" + verb.'
      },
      {
        sentence: 'How many _____ (tooth) does a shark have?',
        placeholder: 'tooth',
        correctAnswer: 'teeth',
        explanation: '"Teeth" is the irregular plural of "tooth".'
      },
      {
        sentence: '_____ (not / forget) your homework!',
        placeholder: 'not / forget',
        correctAnswer: "don't forget",
        explanation: '"Don\'t forget" is the negative imperative form.'
      },
      {
        sentence: 'There are three _____ (bus) at the station.',
        placeholder: 'bus',
        correctAnswer: 'buses',
        explanation: 'Nouns ending in "-s" add "-es" for the plural form.'
      },
      {
        sentence: 'We have two _____ (mouse) as class pets.',
        placeholder: 'mouse',
        correctAnswer: 'mice',
        explanation: '"Mice" is the irregular plural of "mouse".'
      },
      {
        sentence: 'Unscramble: "the / Don\'t / door / close"',
        placeholder: 'unscramble',
        correctAnswer: "don't close the door",
        explanation: 'Negative imperative: "Don\'t" + verb + object.'
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
      },
      {
        question: 'Rewrite in plural: "The man has a red car."',
        correctAnswers: ['The men have red cars.', 'The men have a red car.'],
        explanation: '"Man" becomes "men", and "has" changes to "have" for the plural subject.'
      },
      {
        question: 'Translate: "Öffnet eure Bücher auf Seite 5."',
        correctAnswers: ['Open your books on page 5.', 'Open your books at page 5.', 'Open your books to page 5.'],
        explanation: '"Öffnet" is the imperative (plural) — "Open your books".'
      },
      {
        question: 'Correct: "The childs are playing with the mouses."',
        correctAnswers: ['The children are playing with the mice.', 'The children are playing with the mice.'],
        explanation: '"Childs" → "children", "mouses" → "mice". Both have irregular plurals.'
      },
      {
        question: 'Rewrite as a negative imperative: "Close the window."',
        correctAnswers: ["Don't close the window.", "Do not close the window."],
        explanation: 'Add "Don\'t" before the base verb to make a negative imperative.'
      },
      {
        question: 'Translate: "Die Frauen sind Lehrerinnen."',
        correctAnswers: ['The women are teachers.', 'The women are teachers.'],
        explanation: '"Frauen" → "women" (plural of "woman"), "Lehrerinnen" → "teachers".'
      },
      {
        question: 'Combine these into one sentence using "and": "I have a book. I have a pen."',
        correctAnswers: ['I have a book and a pen.', 'I have a book and I have a pen.'],
        explanation: 'Use "and" to combine items: "I have a book and a pen."'
      },
      {
        question: 'Correct: "Don\'t to run in the hallway!"',
        correctAnswers: ["Don't run in the hallway!", "Do not run in the hallway!"],
        explanation: 'Negative imperative = "Don\'t" + base verb (no "to").'
      },
      {
        question: 'Rewrite in plural: "This is a child with a tooth."',
        correctAnswers: ['These are children with teeth.', 'These are children with teeth.'],
        explanation: '"This" → "These", "child" → "children", "tooth" → "teeth".'
      },
      {
        question: 'Form an imperative from: "you / please / quiet / be"',
        correctAnswers: ['Please be quiet.', 'Be quiet, please.'],
        explanation: 'Imperatives drop the subject "you": "Please be quiet."'
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
      },
      {
        question: 'Which is correct? "The book is _____ the shelf." (inside a shelf)',
        options: ['on', 'in', 'at'],
        correctIndex: 0,
        explanation: 'Books rest "on" a shelf (on the surface).'
      },
      {
        question: 'True or False: "We are students" is a correct sentence.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: '"We are students" is correct — "we" takes "are".'
      },
      {
        question: 'Complete: "My teacher _____ very nice."',
        options: ['am', 'is', 'are'],
        correctIndex: 1,
        explanation: '"My teacher" (he/she) takes "is".'
      },
      {
        question: 'Where is the cat if it is under the table?',
        options: ['auf dem Tisch', 'unter dem Tisch', 'neben dem Tisch'],
        correctIndex: 1,
        explanation: '"Unter dem Tisch" means "under the table" in German.'
      },
      {
        question: 'Choose the correct sentence:',
        options: ['You is my friend.', 'You am my friend.', 'You are my friend.'],
        correctIndex: 2,
        explanation: '"You" always takes "are" — both singular and plural.'
      },
      {
        question: 'The pencils are _____ the pencil case.',
        options: ['on', 'in', 'under'],
        correctIndex: 1,
        explanation: 'Pencils go "in" a pencil case (inside a container).'
      },
      {
        question: 'True or False: "She are at school" is correct.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: '"She" takes "is", not "are". The correct form is "She is at school."'
      },
      {
        question: 'What preposition means "next to" in German?',
        options: ['neben', 'unter', 'hinter'],
        correctIndex: 0,
        explanation: '"Neben" is the German preposition for "next to".'
      },
      {
        question: 'Complete: "They _____ happy about the test."',
        options: ['am', 'is', 'are'],
        correctIndex: 2,
        explanation: '"They" is plural and takes "are".'
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
      },
      {
        sentence: 'My friends _____ (be) in the classroom.',
        placeholder: 'be',
        correctAnswer: 'are',
        explanation: '"My friends" (they) takes the plural form "are".'
      },
      {
        sentence: 'The school is _____ (neben) the church.',
        placeholder: 'neben',
        correctAnswer: 'next to',
        explanation: '"Neben" translates to "next to" in English.'
      },
      {
        sentence: 'I _____ (be) ten years old.',
        placeholder: 'be',
        correctAnswer: 'am',
        explanation: '"I" always takes the form "am".'
      },
      {
        sentence: 'Unscramble: "is / the / cat / behind / door / the"',
        placeholder: 'unscramble',
        correctAnswer: 'the cat is behind the door',
        explanation: 'Correct order: subject + verb + preposition + object.'
      },
      {
        sentence: 'Bello _____ (be) under the chair right now.',
        placeholder: 'be',
        correctAnswer: 'is',
        explanation: '"Bello" (he/it) takes "is".'
      },
      {
        sentence: 'Where _____ (be) my pencils?',
        placeholder: 'be',
        correctAnswer: 'are',
        explanation: '"My pencils" (they/plural) takes "are".'
      },
      {
        sentence: 'The ball is _____ (hinter) the door.',
        placeholder: 'hinter',
        correctAnswer: 'behind',
        explanation: '"Hinter" means "behind" in English.'
      },
      {
        sentence: 'He _____ (not / be) my brother.',
        placeholder: 'not / be',
        correctAnswer: 'is not',
        explanation: 'The negative of "is" is "is not" (or "isn\'t").'
      },
      {
        sentence: 'Unscramble: "on / The / are / books / the / desk"',
        placeholder: 'unscramble',
        correctAnswer: 'the books are on the desk',
        explanation: 'Correct sentence: subject + verb + prepositional phrase.'
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
      },
      {
        question: 'Translate: "Das Buch ist unter dem Tisch."',
        correctAnswers: ['The book is under the table.', 'The book is under the table.'],
        explanation: '"Das Buch" → "The book", "ist unter" → "is under", "dem Tisch" → "the table".'
      },
      {
        question: 'Correct: "We is in the classroom with our teacher."',
        correctAnswers: ['We are in the classroom with our teacher.', 'We are in the classroom with our teacher.'],
        explanation: '"We" takes "are", not "is".'
      },
      {
        question: 'Combine: "The pen is on the desk. The pencil is on the desk."',
        correctAnswers: ['The pen and the pencil are on the desk.', 'The pen and pencil are on the desk.'],
        explanation: 'Combine with "and": "The pen and the pencil are on the desk."'
      },
      {
        question: 'Translate: "Bist du hinter der Tür?"',
        correctAnswers: ['Are you behind the door?', 'Are you behind the door?'],
        explanation: '"Bist du" → "Are you", "hinter" → "behind", "der Tür" → "the door".'
      },
      {
        question: 'Correct: "The dog are next to the cat."',
        correctAnswers: ['The dog is next to the cat.', 'The dog is next to the cat.'],
        explanation: '"The dog" (singular/it) takes "is", not "are".'
      },
      {
        question: 'Rewrite in plural: "I am in the classroom."',
        correctAnswers: ['We are in the classroom.', 'We are in the classroom.'],
        explanation: 'Plural of "I am" is "We are".'
      },
      {
        question: 'Translate: "Meine Freunde sind neben der Schule."',
        correctAnswers: ['My friends are next to the school.', 'My friends are next to the school.'],
        explanation: '"Meine Freunde" → "My friends", "sind neben" → "are next to".'
      },
      {
        question: 'Correct: "She are on the playground."',
        correctAnswers: ['She is on the playground.', 'She is on the playground.'],
        explanation: '"She" takes "is", not "are".'
      },
      {
        question: 'Write a sentence describing where your pencil case is right now:',
        correctAnswers: ['My pencil case is on the desk.', 'My pencil case is in my bag.', 'My pencil case is next to my book.', 'My pencil case is under the chair.', 'My pencil case is on my table.'],
        explanation: 'Use: subject + is/are + preposition + location.'
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
      },
      {
        question: 'True or False: "I has got a new phone" is correct.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: '"I" takes "have got", not "has got".'
      },
      {
        question: 'Complete: "My parents _____ a big house."',
        options: ["has got", "have got", "is got"],
        correctIndex: 1,
        explanation: '"My parents" (they/plural) takes "have got".'
      },
      {
        question: 'What is the short form of "she has got"?',
        options: ["She's got", "She has", "She got"],
        correctIndex: 0,
        explanation: '"She has got" can be shortened to "She\'s got".'
      },
      {
        question: 'Choose the correct negative: "We _____ a car."',
        options: ["haven't got", "hasn't got", "not got"],
        correctIndex: 0,
        explanation: '"We" (plural) negates as "haven\'t got".'
      },
      {
        question: 'What does "I have got a sister" mean?',
        options: ['I have a sister.', 'I am a sister.', 'I like my sister.'],
        correctIndex: 0,
        explanation: '"Have got" means "to have" or "to possess".'
      },
      {
        question: 'True or False: "It has got four legs" is correct.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: '"It" is third person singular and takes "has got". Correct!'
      },
      {
        question: 'Complete: "My friend _____ blue eyes."',
        options: ["have got", "has got", "haven't got"],
        correctIndex: 1,
        explanation: '"My friend" (he/she) takes "has got".'
      },
      {
        question: 'Which question is correct?',
        options: ['Have you got a pet?', 'Has you got a pet?', 'You have got a pet?'],
        correctIndex: 0,
        explanation: 'Questions use: Have/Has + subject + got?'
      },
      {
        question: 'Choose the correct short form of "they have got":',
        options: ["They've got", "They has got", "They got"],
        correctIndex: 0,
        explanation: '"They have got" shortens to "They\'ve got".'
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
      },
      {
        sentence: '_____ you _____ (have got) a brother?',
        placeholder: 'have got',
        correctAnswer: 'have got',
        explanation: 'Questions with "you" use "Have ... got?"'
      },
      {
        sentence: 'She _____ (not / have got) a pet fish.',
        placeholder: 'not / have got',
        correctAnswer: "hasn't got",
        explanation: 'Third person singular negative: "hasn\'t got".'
      },
      {
        sentence: 'Unscramble: "got / I / have / a / bike / new"',
        placeholder: 'unscramble',
        correctAnswer: 'i have got a new bike',
        explanation: 'Correct order: I + have got + a/an + adjective + noun.'
      },
      {
        sentence: 'My cat _____ (have got) a long tail.',
        placeholder: 'have got',
        correctAnswer: 'has got',
        explanation: '"My cat" (it) takes "has got".'
      },
      {
        sentence: 'We _____ (not / have got) a TV in our classroom.',
        placeholder: 'not / have got',
        correctAnswer: "haven't got",
        explanation: 'Plural "We" negates as "haven\'t got".'
      },
      {
        sentence: '_____ he _____ (have got) a cold?',
        placeholder: 'have got',
        correctAnswer: 'has he got',
        explanation: 'Question form: Has + subject + got?'
      },
      {
        sentence: 'They _____ (have got) a new teacher this year.',
        placeholder: 'have got',
        correctAnswer: 'have got',
        explanation: '"They" always uses "have got".'
      },
      {
        sentence: 'Unscramble: "hasn\'t / She / a / got / ruler / blue"',
        placeholder: 'unscramble',
        correctAnswer: "she hasn't got a blue ruler",
        explanation: 'Negative: subject + hasn\'t/haven\'t + got + object.'
      },
      {
        sentence: 'You _____ (have got) a nice smile!',
        placeholder: 'have got',
        correctAnswer: 'have got',
        explanation: '"You" always takes "have got".'
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
      },
      {
        question: 'Translate: "Hast du einen Hund?"',
        correctAnswers: ['Have you got a dog?', 'Have you got a dog?'],
        explanation: '"Hast du" → "Have you got", "einen Hund" → "a dog".'
      },
      {
        question: 'Correct: "She have got long hair."',
        correctAnswers: ['She has got long hair.', 'She has got long hair.'],
        explanation: '"She" takes "has got", not "have got".'
      },
      {
        question: 'Translate: "Er hat drei Schwestern, aber er hat keinen Bruder."',
        correctAnswers: ["He has got three sisters, but he hasn't got a brother.", "He has got three sisters but he hasn't got a brother."],
        explanation: '"Er hat" → "He has got", "drei Schwestern" → "three sisters", "keinen Bruder" → "no brother/hasn\'t got a brother".'
      },
      {
        question: 'Rewrite with "got": "They do not have a computer."',
        correctAnswers: ["They haven't got a computer.", "They have not got a computer."],
        explanation: 'Replace "do not have" with "haven\'t got".'
      },
      {
        question: 'Translate: "Ich habe Kopfschmerzen."',
        correctAnswers: ["I've got a headache.", "I have got a headache.", "I have a headache."],
        explanation: '"Ich habe" → "I have got" / "I\'ve got". "Kopfschmerzen" → "a headache".'
      },
      {
        question: 'Correct: "He hasn\'t got no homework." (Double negative)',
        correctAnswers: ["He hasn't got any homework.", "He has got no homework.", "He has not got any homework."],
        explanation: 'In English, avoid double negatives: "hasn\'t" + "any" (not "no").'
      },
      {
        question: 'Form a question from: "she / got / a bike / ?"',
        correctAnswers: ['Has she got a bike?', 'Has she got a bike?'],
        explanation: 'Question: Has/Have + subject + got + object?'
      },
      {
        question: 'Combine: "He has got a cat. He has got a dog."',
        correctAnswers: ['He has got a cat and a dog.', 'He has got a cat and a dog.'],
        explanation: 'Combine with "and": "He has got a cat and a dog."'
      },
      {
        question: 'Write 3 things you have got in your school bag:',
        correctAnswers: ['I have got a book, a pen and a pencil.', 'I have got a notebook, a ruler and an eraser.', 'I have got books, pens and pencils.'],
        explanation: 'List your items: "I have got [item], [item] and [item]."'
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
    explorer: generateExplorerQuestions(u, titles[u]),
    pioneer: generatePioneerQuestions(u, titles[u]),
    master: generateMasterQuestions(u, titles[u])
  })
}

function generateExplorerQuestions(u: number, title: string) {
  const shared: { q: string; opts: string[]; correct: number; exp: string }[][] = []
  
  // Unit 4 – Questions & Negatives with "to be"
  shared[4] = [
    { q: 'How do you form a question with "to be"?', opts: ['Verb + subject', 'Subject + verb', 'Verb + object'], correct: 0, exp: 'Questions with "to be" invert: Is he...? / Are they...?' },
    { q: 'Complete: "_____ she your sister?"', opts: ['Is', 'Are', 'Am'], correct: 0, exp: '"She" takes "Is" at the start of questions.' },
    { q: 'Which is a negative sentence?', opts: ['She is not here.', 'She is here.', 'Is she here?'], correct: 0, exp: '"Is not" (isn\'t) makes a negative sentence.' },
    { q: 'True or False: "Aren\'t you tired?" is a question.', opts: ['True', 'False'], correct: 0, exp: '"Aren\'t you..." is a negative question form.' },
    { q: 'Choose the correct question: "_____ the students ready?"', opts: ['Is', 'Are', 'Am'], correct: 1, exp: '"The students" (they/plural) takes "Are".' },
    { q: 'What is the negative of "I am happy"?', opts: ["I am not happy.", "I aren't happy.", "I isn't happy."], correct: 0, exp: '"I am not" is the negative form — there is no contraction for "am not".' },
    { q: 'True or False: "He isn\'t a teacher" is a question.', opts: ['True', 'False'], correct: 1, exp: '"He isn\'t" is a statement (negative), not a question.' },
    { q: 'Complete: "_____ you from Austria?"', opts: ['Is', 'Am', 'Are'], correct: 2, exp: '"You" always takes "Are" in questions.' },
    { q: 'Which is the correct negative question?', opts: ["Isn't she nice?", "She isn't nice?", "Is she not nice?"], correct: 0, exp: 'Negative question: Isn\'t/aren\'t + subject?' },
    { q: 'Choose the correct short answer: "Is he your friend?" — "Yes, he _____."', opts: ['is', 'are', 'am'], correct: 0, exp: 'Short answers repeat the verb: "Yes, he is."' },
    { q: 'What does "We aren\'t late" mean?', opts: ['We are not late.', 'We are late.', 'Are we late?'], correct: 0, exp: '"Aren\'t" is the contraction of "are not".' },
    { q: 'True or False: "Am I wrong?" is a correct question.', opts: ['True', 'False'], correct: 0, exp: '"Am I...?" is a correct question form with "to be".' },
    { q: 'Complete: "The cat _____ on the roof, _____ it?"', opts: ['is / isn\'t', 'are / aren\'t', 'is / is'], correct: 0, exp: 'Question tags: "The cat is... isn\'t it?"' },
    { q: 'Which question is correct?', opts: ['Where is the school?', 'Where the school is?', 'Is where the school?'], correct: 0, exp: 'WH-questions: WH-word + to be + subject?' },
    { q: 'Choose: "They _____ ready for the test." (negative)', opts: ['are not', 'is not', 'am not'], correct: 0, exp: '"They" takes "are not" (aren\'t) in negatives.' }
  ]
  
  // Unit 5 – Can/Can't & Possessives
  shared[5] = [
    { q: 'What does "can" express?', opts: ['Ability', 'Ownership', 'Location'], correct: 0, exp: '"Can" expresses ability — what someone is able to do.' },
    { q: 'Complete: "She _____ swim very well."', opts: ['can', 'cans', 'can to'], correct: 0, exp: '"Can" does not change form: She can / He can.' },
    { q: 'What is the negative of "can"?', opts: ["can't", 'cannot', 'Both are correct'], correct: 2, exp: 'Both "can\'t" and "cannot" are correct negatives of "can".' },
    { q: 'True or False: "He can\'t plays football" is correct.', opts: ['True', 'False'], correct: 1, exp: 'After "can" we use the base verb without -s: "He can play".' },
    { q: 'Which is a possessive pronoun?', opts: ['hers', 'her', 'she'], correct: 0, exp: '"Hers" is a possessive pronoun (replaces "her + noun").' },
    { q: 'Complete: "This book is _____." (belongs to me)', opts: ['mine', 'my', 'me'], correct: 0, exp: '"Mine" is the possessive pronoun for "my + noun".' },
    { q: 'Choose the correct sentence:', opts: ['I can to ride a bike.', 'I can ride a bike.', 'I can rides a bike.'], correct: 1, exp: '"Can" is followed by the base verb without "to".' },
    { q: 'True or False: "Yours" means "belonging to you".', opts: ['True', 'False'], correct: 0, exp: '"Yours" is the possessive pronoun for "you".' },
    { q: 'Complete: "_____ I go to the toilet, please?"', opts: ['Can', 'Must', 'Have'], correct: 0, exp: '"Can I...?" is used to ask for permission.' },
    { q: 'Which possessive adjective matches "they"?', opts: ['their', 'theirs', 'them'], correct: 0, exp: '"Their" is the possessive adjective for "they".' },
    { q: 'Choose: "The dog is _____." (belongs to us)', opts: ['ours', 'our', 'us'], correct: 0, exp: '"Ours" is the possessive pronoun for "we".' },
    { q: 'What is the opposite of "can"?', opts: ["can't", 'must', 'should'], correct: 0, exp: '"Can\'t" (cannot) is the negative/opposite of "can".' },
    { q: 'True or False: "She can sings" has a grammar mistake.', opts: ['True', 'False'], correct: 0, exp: 'After "can" we use the base verb "sing", not "sings".' },
    { q: 'Complete: "This is _____ house." (belongs to them)', opts: ['their', 'theirs', 'they'], correct: 0, exp: '"Their" is a possessive adjective used before a noun.' },
    { q: 'Which sentence uses "can\'t" correctly?', opts: ["He can't find his pen.", "He can't to find his pen.", "He can't finds his pen."], correct: 0, exp: '"Can\'t" + base verb is the correct pattern.' }
  ]
  
  // Unit 6 – Present Simple Affirmative
  shared[6] = [
    { q: 'What ending do he/she/it verbs get in Present Simple?', opts: ['-s', '-ed', '-ing'], correct: 0, exp: 'Third person singular adds "-s": He plays / She reads.' },
    { q: 'Complete: "She _____ (read) books every day."', opts: ['read', 'reads', 'reading'], correct: 1, exp: '"She" (3rd person singular) takes "reads".' },
    { q: 'True or False: "I goes to school" is correct.', opts: ['True', 'False'], correct: 1, exp: '"I" takes "go", not "goes". Only he/she/it adds -s.' },
    { q: 'Choose the correct sentence:', opts: ['He play tennis.', 'He plays tennis.', 'He playing tennis.'], correct: 1, exp: '"He" + verb with -s: "He plays tennis."' },
    { q: 'What do we add to verbs ending in -ch, -sh, -s, -x, -o?', opts: ['-es', '-s', '-ies'], correct: 0, exp: 'Verbs ending in -ch/-sh/-s/-x/-o add "-es": watches, goes.' },
    { q: 'Complete: "They _____ (live) in Vienna."', opts: ['live', 'lives', 'living'], correct: 0, exp: '"They" (plural) takes the base form without -s: "live".' },
    { q: 'What happens to verbs ending in consonant + y?', opts: ['Change y to ies', 'Add -s', 'Add -es'], correct: 0, exp: 'Study → studies, fly → flies (consonant + y → ies).' },
    { q: 'True or False: "The sun rises in the east" is Present Simple.', opts: ['True', 'False'], correct: 0, exp: 'Present Simple is used for facts/truths: "The sun rises..."' },
    { q: 'Complete: "My brother _____ (watch) TV every evening."', opts: ['watch', 'watches', 'watching'], correct: 1, exp: '"Watch" ends in -ch, so it adds -es: "watches".' },
    { q: 'Choose: "We _____ (go) to school by bus."', opts: ['go', 'goes', 'going'], correct: 0, exp: '"We" (plural) takes the base form: "go".' },
    { q: 'Which is correct for "a dog"?', opts: ['It barks', 'It bark', 'It barking'], correct: 0, exp: '"It" (third person singular) adds -s: "barks".' },
    { q: 'True or False: Present Simple describes habits and routines.', opts: ['True', 'False'], correct: 0, exp: 'Present Simple is used for habits, routines, and general truths.' },
    { q: 'Complete: "She _____ (study) English every Monday."', opts: ['study', 'studies', 'studys'], correct: 1, exp: 'Consonant + y → ies: "study" becomes "studies".' },
    { q: 'Choose the correct verb: "He _____ breakfast at 7 am."', opts: ['has', 'have', 'is having'], correct: 0, exp: '"He" (third person) takes "has" (irregular form of "have").' },
    { q: 'Which signal word often goes with Present Simple?', opts: ['every day', 'now', 'yesterday'], correct: 0, exp: '"Every day" is a typical Present Simple signal word.' }
  ]
  
  // Unit 7 – Present Simple Negatives & Articles
  shared[7] = [
    { q: 'How do we form negatives in Present Simple?', opts: ["don't / doesn't + verb", "not + verb", "no + verb"], correct: 0, exp: 'We use "don\'t" (I/you/we/they) or "doesn\'t" (he/she/it).' },
    { q: 'Complete: "He _____ (not/like) coffee."', opts: ["doesn't like", "don't like", "isn't like"], correct: 0, exp: '"He" (third person) takes "doesn\'t" + base verb.' },
    { q: 'Which article goes before "apple"?', opts: ['an', 'a', 'the'], correct: 0, exp: '"Apple" starts with a vowel sound → "an apple".' },
    { q: 'True or False: "I don\'t plays football" is correct.', opts: ['True', 'False'], correct: 1, exp: 'After "don\'t/doesn\'t" we use the base verb: "don\'t play".' },
    { q: 'Choose: "They _____ (not/go) to the park on Sundays."', opts: ["don't go", "doesn't go", "aren't go"], correct: 0, exp: '"They" takes "don\'t" + base verb.' },
    { q: 'What is the correct article? "She is _____ honest girl."', opts: ['an', 'a', 'the'], correct: 0, exp: '"Honest" starts with a vowel sound (silent h) → "an honest".' },
    { q: 'Complete: "She _____ (not/have) a pet."', opts: ["doesn't have", "don't have", "hasn't"], correct: 0, exp: '"She" + "doesn\'t" + base verb "have".' },
    { q: 'True or False: "A" is used before vowel sounds.', opts: ['True', 'False'], correct: 1, exp: '"A" is used before consonant sounds; "an" before vowel sounds.' },
    { q: 'Choose: "We _____ (not/play) video games on weekdays."', opts: ["don't play", "doesn't play", "not play"], correct: 0, exp: '"We" takes "don\'t" + base verb.' },
    { q: 'Which article: "He is _____ teacher."', opts: ['a', 'an', 'the'], correct: 0, exp: '"Teacher" starts with a consonant sound → "a teacher".' },
    { q: 'Complete: "It _____ (not/rain) much in summer."', opts: ["doesn't rain", "don't rain", "isn't rain"], correct: 0, exp: '"It" (third person) takes "doesn\'t" + rain.' },
    { q: 'What is "often" in "I don\'t often eat pizza"?', opts: ['adverb of frequency', 'verb', 'article'], correct: 0, exp: '"Often" is an adverb of frequency — it goes before the main verb.' },
    { q: 'True or False: "A hour" is correct because h is a consonant.', opts: ['True', 'False'], correct: 1, exp: '"Hour" has a silent h (vowel sound) → "an hour".' },
    { q: 'Choose: "My parents _____ (not/speak) French."', opts: ["don't speak", "doesn't speak", "aren't speak"], correct: 0, exp: '"My parents" (they) takes "don\'t" + speak.' },
    { q: 'Complete: "I eat _____ orange every morning."', opts: ['an', 'a', 'the'], correct: 0, exp: '"Orange" starts with a vowel sound → "an orange".' }
  ]
  
  // Unit 8 – Present Simple Questions
  shared[8] = [
    { q: 'How do we form questions in Present Simple?', opts: ['Do/Does + subject + verb?', 'Is + subject + verb?', 'Verb + subject?'], correct: 0, exp: 'Use "Do" (I/you/we/they) or "Does" (he/she/it) + subject + base verb.' },
    { q: 'Complete: "_____ she like chocolate?"', opts: ['Does', 'Do', 'Is'], correct: 0, exp: '"She" (third person) uses "Does" in questions.' },
    { q: 'Choose the correct question: "_____ they play tennis?"', opts: ['Do', 'Does', 'Are'], correct: 0, exp: '"They" (plural) uses "Do" in questions.' },
    { q: 'True or False: "Does he plays football?" is correct.', opts: ['True', 'False'], correct: 1, exp: 'After "Does", the verb goes back to base form: "Does he play?"' },
    { q: 'Complete: "Where _____ your parents live?"', opts: ['do', 'does', 'are'], correct: 0, exp: '"Your parents" (they/plural) → "do".' },
    { q: 'Short answer: "Does she sing well?" — "Yes, she _____."', opts: ['does', 'do', 'sings'], correct: 0, exp: 'Short answer: "Yes, she does."' },
    { q: 'Which is correct?', opts: ['When do you get up?', 'When does you get up?', 'When you get up?'], correct: 0, exp: 'WH-question: WH-word + do/does + subject + verb?' },
    { q: 'Complete: "_____ he walk to school?"', opts: ['Does', 'Do', 'Is'], correct: 0, exp: '"He" (third person) → "Does he walk...?"' },
    { q: 'True or False: "Do you likes ice cream?" is correct.', opts: ['True', 'False'], correct: 1, exp: 'After "Do", use the base verb: "Do you like...?"' },
    { q: 'Choose: "What _____ you do after school?"', opts: ['do', 'does', 'are'], correct: 0, exp: '"You" takes "do" in questions.' },
    { q: 'Complete: "Why _____ he always late?"', opts: ['is', 'do', 'does'], correct: 0, exp: '"Why is he...?" uses the verb "to be", not "do/does".' },
    { q: 'Short answer: "Do they live near here?" — "No, they _____."', opts: ["don't", "doesn't", "aren't"], correct: 0, exp: '"No, they don\'t" is the short negative answer.' },
    { q: 'Which is a yes/no question?', opts: ['Do you like pizza?', 'What do you like?', 'Where do you live?'], correct: 0, exp: 'Yes/no questions start with Do/Does and expect yes/no.' },
    { q: 'Complete: "How often _____ you visit your grandparents?"', opts: ['do', 'does', 'are'], correct: 0, exp: '"You" takes "do" in questions about frequency.' },
    { q: 'Choose the correct question word: "_____ is your best friend?" — "Anna."', opts: ['Who', 'What', 'Where'], correct: 0, exp: '"Who" asks about people.' }
  ]
  
  // Unit 9 – Question Words & Object Pronouns
  shared[9] = [
    { q: 'Which question word asks about places?', opts: ['Where', 'Who', 'What'], correct: 0, exp: '"Where" is used to ask about locations/places.' },
    { q: 'Complete: "_____ is your birthday?" — "In March."', opts: ['When', 'Where', 'What'], correct: 0, exp: '"When" asks about time.' },
    { q: 'What is the object pronoun for "she"?', opts: ['her', 'she', 'hers'], correct: 0, exp: '"Her" is the object pronoun — "I see her."' },
    { q: 'True or False: "Who" is used for people.', opts: ['True', 'False'], correct: 0, exp: '"Who" asks about people/persons.' },
    { q: 'Complete: "Please give _____ (I) the book."', opts: ['me', 'I', 'my'], correct: 0, exp: '"Me" is the object pronoun for "I".' },
    { q: 'Choose: "Why _____ you sad?"', opts: ['are', 'do', 'does'], correct: 0, exp: '"Why are you...?" uses "to be" for states/feelings.' },
    { q: 'Which is an object pronoun?', opts: ['him', 'he', 'his'], correct: 0, exp: '"Him" is the object pronoun for "he".' },
    { q: 'Complete: "I sit next to _____ (they) in class."', opts: ['them', 'they', 'their'], correct: 0, exp: '"Them" is the object pronoun for "they".' },
    { q: 'True or False: "What" asks about reasons.', opts: ['True', 'False'], correct: 1, exp: '"What" asks about things/objects; "Why" asks about reasons.' },
    { q: 'Choose: "Can you help _____ (we)?"', opts: ['us', 'we', 'our'], correct: 0, exp: '"Us" is the object pronoun for "we".' },
    { q: 'Complete: "_____ do you like dogs?" — "Because they\'re cute!"', opts: ['Why', 'What', 'When'], correct: 0, exp: '"Why" asks about reasons; answers use "Because".' },
    { q: 'Which question word asks about time?', opts: ['When', 'Where', 'Who'], correct: 0, exp: '"When" is the question word for time.' },
    { q: 'True or False: "Her" can be both an object pronoun and a possessive adjective.', opts: ['True', 'False'], correct: 0, exp: 'Yes: "I see her" (object) / "Her book" (possessive adjective).' },
    { q: 'Complete: "I often visit _____ (he) after school."', opts: ['him', 'he', 'his'], correct: 0, exp: '"Him" is the object pronoun for "he".' },
    { q: 'Choose: "_____ is your phone number?"', opts: ['What', 'How', 'Where'], correct: 0, exp: '"What" asks for specific information like a number.' }
  ]
  
  // Unit 10 – Demonstratives & Prices
  shared[10] = [
    { q: 'Which demonstrative is used for something far?', opts: ['that/those', 'this/these', 'here/there'], correct: 0, exp: '"That" (singular) and "those" (plural) are for distant objects.' },
    { q: 'Complete: "_____ is my pen here."', opts: ['This', 'That', 'Those'], correct: 0, exp: '"This" is for something near the speaker.' },
    { q: 'Choose: "Look at _____ birds up in the sky!" (far away)', opts: ['those', 'these', 'this'], correct: 0, exp: '"Those" is the plural demonstrative for distant objects.' },
    { q: 'True or False: "This" is plural.', opts: ['True', 'False'], correct: 1, exp: '"This" is singular; its plural is "these".' },
    { q: 'How do you ask for a price?', opts: ['How much is it?', 'How many is it?', 'What price it?'], correct: 0, exp: '"How much...?" is used to ask about prices.' },
    { q: 'Complete: "_____ are my books here on the table."', opts: ['These', 'This', 'That'], correct: 0, exp: '"These" is the plural of "this" — for things near the speaker.' },
    { q: 'Which is correct? "_____ book over there is mine."', opts: ['That', 'This', 'These'], correct: 0, exp: '"That" is for something far from the speaker.' },
    { q: 'True or False: "How much" is used for countable nouns.', opts: ['True', 'False'], correct: 1, exp: '"How much" is for uncountable nouns/prices; "How many" for countable.' },
    { q: 'Complete: "How much _____ these shoes?"', opts: ['are', 'is', 'do'], correct: 0, exp: '"These shoes" (they/plural) takes "are".' },
    { q: 'Choose: "_____ are my friends over there."', opts: ['Those', 'These', 'This'], correct: 0, exp: '"Those" is for plural things far from the speaker.' },
    { q: 'Complete: "How much does _____ jacket cost?" (pointing at it)', opts: ['that', 'this', 'these'], correct: 0, exp: '"That jacket" — the jacket is not near the speaker.' },
    { q: 'True or False: "These" is used for singular objects near you.', opts: ['True', 'False'], correct: 1, exp: '"These" is the plural of "this". Use "this" for singular near objects.' },
    { q: 'Choose: "Can I try _____ dress on?" (holding it)', opts: ['this', 'that', 'those'], correct: 0, exp: '"This" — you are holding the dress (near).' },
    { q: 'Complete: "How much _____ the ticket cost?"', opts: ['does', 'do', 'is'], correct: 0, exp: '"The ticket" (it/singular) takes "does" in questions.' },
    { q: 'Which is a demonstrative pronoun?', opts: ['those', 'they', 'them'], correct: 0, exp: '"Those" is a demonstrative pronoun (points to things far away).' }
  ]
  
  // Unit 11 – Present Continuous
  shared[11] = [
    { q: 'How do we form Present Continuous?', opts: ['am/is/are + verb-ing', 'have + verb-ed', 'verb + -s'], correct: 0, exp: 'Present Continuous = am/is/are + verb + -ing.' },
    { q: 'Complete: "She _____ (read) a book right now."', opts: ['is reading', 'reads', 'read'], correct: 0, exp: 'Right now → Present Continuous: "She is reading".' },
    { q: 'True or False: "They are play football" is correct Present Continuous.', opts: ['True', 'False'], correct: 1, exp: 'Must use verb-ing: "They are playing football."' },
    { q: 'Choose: "Look! It _____ (rain)."', opts: ['is raining', 'rains', 'rained'], correct: 0, exp: '"Look!" signals something happening now → Present Continuous.' },
    { q: 'What happens to verbs ending in -e in Present Continuous?', opts: ['Drop the e, add -ing', 'Add -ing', 'Add -ing after e'], correct: 0, exp: 'Make → making, write → writing (drop e, add -ing).' },
    { q: 'Complete: "We _____ (watch) a film at the moment."', opts: ['are watching', 'watch', 'watches'], correct: 0, exp: '"At the moment" → Present Continuous: "are watching".' },
    { q: 'True or False: Present Continuous is used for permanent situations.', opts: ['True', 'False'], correct: 1, exp: 'Present Continuous is for temporary/ongoing actions now.' },
    { q: 'Complete: "He _____ (swim) in the pool now."', opts: ['is swimming', 'swims', 'swim'], correct: 0, exp: '"Now" → Present Continuous. Double the -m: "swimming".' },
    { q: 'Choose: "The baby _____ (sleep) at the moment."', opts: ['is sleeping', 'sleeps', 'slept'], correct: 0, exp: '"At the moment" → "is sleeping" (Present Continuous).' },
    { q: 'Which verb form is correct? "They _____ (run) in the park now."', opts: ['are running', 'is running', 'run'], correct: 0, exp: '"They" → "are". Double the -n: "running".' },
    { q: 'True or False: "I am knowing the answer" is correct.', opts: ['True', 'False'], correct: 1, exp: '"Know" is a stative verb and is not used in continuous forms.' },
    { q: 'Complete: "What _____ you doing right now?"', opts: ['are', 'is', 'do'], correct: 0, exp: '"You" → "are": "What are you doing right now?"' },
    { q: 'Choose: "Listen! Someone _____ (sing) beautifully."', opts: ['is singing', 'sings', 'sang'], correct: 0, exp: '"Listen!" → something happening now → Present Continuous.' },
    { q: 'Complete: "The teacher _____ (talk) to a parent."', opts: ['is talking', 'talks', 'talked'], correct: 0, exp: 'Ongoing action → "is talking" (Present Continuous).' },
    { q: 'Which time expression goes with Present Continuous?', opts: ['right now', 'every day', 'sometimes'], correct: 0, exp: '"Right now" / "at the moment" signal Present Continuous.' }
  ]
  
  // Unit 12 – Past Simple of "to be"
  shared[12] = [
    { q: 'What is the past tense of "am/is"?', opts: ['was', 'were', 'been'], correct: 0, exp: '"Am" and "is" both become "was" in past tense.' },
    { q: 'Complete: "They _____ at school yesterday."', opts: ['were', 'was', 'are'], correct: 0, exp: '"They" (plural) takes "were" in past tense.' },
    { q: 'What is the negative of "was"?', opts: ["wasn't", "weren't", "isn't"], correct: 0, exp: '"Was not" = "wasn\'t" (negative of "was").' },
    { q: 'True or False: "You was late yesterday" is correct.', opts: ['True', 'False'], correct: 1, exp: '"You" takes "were", not "was": "You were late."' },
    { q: 'Complete: "I _____ (be) very tired last night."', opts: ['was', 'were', 'am'], correct: 0, exp: '"I" takes "was" in past tense.' },
    { q: 'Choose the correct question: "_____ you at home yesterday?"', opts: ['Were', 'Was', 'Are'], correct: 0, exp: '"You" → "Were you at home?"' },
    { q: 'True or False: "We wasn\'t at the party" is correct.', opts: ['True', 'False'], correct: 1, exp: '"We" takes "weren\'t": "We weren\'t at the party."' },
    { q: 'Complete: "Where _____ she last night?"', opts: ['was', 'were', 'is'], correct: 0, exp: '"She" (singular) takes "was" in questions.' },
    { q: 'Which is correct? "The weather _____ nice last weekend."', opts: ['was', 'were', 'is'], correct: 0, exp: '"The weather" (it/singular) takes "was".' },
    { q: 'Complete: "My parents _____ (be) happy about my grade."', opts: ['were', 'was', 'are'], correct: 0, exp: '"My parents" (they/plural) takes "were".' },
    { q: 'True or False: "Was" and "were" are past forms of "to be".', opts: ['True', 'False'], correct: 0, exp: 'Yes — "was" for I/he/she/it, "were" for you/we/they.' },
    { q: 'Choose: "There _____ many people at the concert."', opts: ['were', 'was', 'is'], correct: 0, exp: '"Many people" (plural) → "There were...".' },
    { q: 'Complete: "He _____ (not/be) at home when I called."', opts: ["wasn't", "weren't", "isn't"], correct: 0, exp: '"He" (singular) → "wasn\'t" (was not).' },
    { q: 'Short answer: "Were you on holiday?" — "Yes, I _____."', opts: ['was', 'were', 'am'], correct: 0, exp: 'Short answer: "Yes, I was."' },
    { q: 'Complete: "The books _____ on the shelf last week."', opts: ['were', 'was', 'are'], correct: 0, exp: '"The books" (they/plural) takes "were".' }
  ]
  
  // Unit 13 – Past Simple Regular Verbs
  shared[13] = [
    { q: 'How do we form past tense of regular verbs?', opts: ['Add -ed', 'Add -ing', 'Change the vowel'], correct: 0, exp: 'Regular past tense = verb + -ed: play → played.' },
    { q: 'Complete: "She _____ (walk) to school yesterday."', opts: ['walked', 'walks', 'walking'], correct: 0, exp: '"Yesterday" → past tense: walk + -ed = walked.' },
    { q: 'What happens to verbs ending in -e? "dance" → ?', opts: ['danced', 'dancd', 'danceed'], correct: 0, exp: 'Verbs ending in -e just add -d: dance → danced.' },
    { q: 'True or False: "They play football yesterday" is correct.', opts: ['True', 'False'], correct: 1, exp: 'Past needs -ed: "They played football yesterday."' },
    { q: 'Complete: "We _____ (visit) our grandparents last weekend."', opts: ['visited', 'visits', 'visiting'], correct: 0, exp: '"Last weekend" → past tense: visit + -ed = visited.' },
    { q: 'What happens to "stop" in past tense?', opts: ['stopped', 'stopd', 'stoped'], correct: 0, exp: 'Short vowel + consonant: double the consonant + -ed: stop → stopped.' },
    { q: 'True or False: "Carry" becomes "carryed" in past tense.', opts: ['True', 'False'], correct: 1, exp: 'Consonant + y → -ied: carry → carried.' },
    { q: 'Complete: "He _____ (study) for the test last night."', opts: ['studied', 'studyed', 'studys'], correct: 0, exp: 'Consonant + y → -ied: study → studied.' },
    { q: 'Choose: "They _____ (play) in the park yesterday."', opts: ['played', 'plays', 'playing'], correct: 0, exp: 'Regular past: play + -ed = played.' },
    { q: 'Which word signals past tense?', opts: ['yesterday', 'today', 'now'], correct: 0, exp: '"Yesterday" is a signal word for past tense.' },
    { q: 'Complete: "I _____ (watch) a great film last night."', opts: ['watched', 'watch', 'watching'], correct: 0, exp: 'Watch + -ed = watched (regular past).' },
    { q: 'True or False: "Try" becomes "tried" in past tense.', opts: ['True', 'False'], correct: 0, exp: 'Yes — consonant + y → -ied: try → tried.' },
    { q: 'Choose: "She _____ (cry) when she heard the news."', opts: ['cried', 'cryed', 'crys'], correct: 0, exp: 'Consonant + y → -ied: cry → cried.' },
    { q: 'Complete: "The train _____ (arrive) at 6 pm."', opts: ['arrived', 'arrives', 'arriving'], correct: 0, exp: 'Arrive + -d = arrived (verb ending in -e).' },
    { q: 'Which is correct? "He _____ (carry) the heavy box yesterday."', opts: ['carried', 'carryed', 'carrys'], correct: 0, exp: 'Consonant + y → -ied: carry → carried.' }
  ]
  
  // Unit 14 – Past Simple Negatives & Irregular Verbs
  shared[14] = [
    { q: 'How do we form negative past tense?', opts: ["didn't + base verb", "wasn't + verb-ed", "don't + verb-ed"], correct: 0, exp: 'Past negative = "didn\'t" + base verb (no -ed).' },
    { q: 'Complete: "I _____ (not/go) to the party."', opts: ["didn't go", "didn't went", "don't go"], correct: 0, exp: '"Didn\'t" + base verb "go" (not "went").' },
    { q: 'What is the past of "go"?', opts: ['went', 'goed', 'gone'], correct: 0, exp: '"Go" is irregular — past form is "went".' },
    { q: 'True or False: "He didn\'t went to school" is correct.', opts: ['True', 'False'], correct: 1, exp: 'After "didn\'t", use base form: "He didn\'t go."' },
    { q: 'What is the past of "eat"?', opts: ['ate', 'eated', 'eat'], correct: 0, exp: '"Eat" → "ate" (irregular past form).' },
    { q: 'Complete: "She _____ (not/see) the movie last night."', opts: ["didn't see", "didn't saw", "doesn't see"], correct: 0, exp: '"Didn\'t" + base verb "see" (not "saw").' },
    { q: 'What is the past of "have"?', opts: ['had', 'haved', 'has'], correct: 0, exp: '"Have" → "had" (irregular past form).' },
    { q: 'True or False: "Buy" becomes "buyed" in past tense.', opts: ['True', 'False'], correct: 1, exp: '"Buy" is irregular → "bought" (not "buyed").' },
    { q: 'Choose: "They _____ (not/know) the answer."', opts: ["didn't know", "didn't knew", "don't know"], correct: 0, exp: '"Didn\'t" + base verb: "didn\'t know".' },
    { q: 'What is the past of "come"?', opts: ['came', 'comed', 'comes'], correct: 0, exp: '"Come" → "came" (irregular).' },
    { q: 'Complete: "He _____ (not/find) his keys this morning."', opts: ["didn't find", "didn't found", "doesn't find"], correct: 0, exp: '"Didn\'t" + base verb "find".' },
    { q: 'What is the past of "drink"?', opts: ['drank', 'drinked', 'drunk'], correct: 0, exp: '"Drink" → "drank" (irregular past).' },
    { q: 'True or False: "Write" becomes "wrote" in past tense.', opts: ['True', 'False'], correct: 0, exp: 'Yes — "write" → "wrote" (irregular).' },
    { q: 'Complete: "We _____ (not/have) much time yesterday."', opts: ["didn't have", "didn't had", "don't have"], correct: 0, exp: '"Didn\'t" + base verb "have".' },
    { q: 'Choose: "She _____ (make) a cake for my birthday."', opts: ['made', 'maked', 'makes'], correct: 0, exp: '"Make" → "made" (irregular past).' }
  ]
  
  // Unit 15 – Future Plans: "be going to"
  shared[15] = [
    { q: 'How do we express future plans?', opts: ["am/is/are + going to + verb", 'will + verb-ing', 'have + verb-ed'], correct: 0, exp: '"Be going to" + base verb expresses future plans/intentions.' },
    { q: 'Complete: "I _____ (going to/visit) my grandma tomorrow."', opts: ["am going to visit", "is going to visit", "going to visit"], correct: 0, exp: '"I" → "am going to" + base verb.' },
    { q: 'True or False: "She are going to travel" is correct.', opts: ['True', 'False'], correct: 1, exp: '"She" takes "is": "She is going to travel."' },
    { q: 'Choose: "They _____ going to play football after school."', opts: ['are', 'is', 'am'], correct: 0, exp: '"They" → "are going to".' },
    { q: 'Complete: "What _____ you going to do this weekend?"', opts: ['are', 'is', 'am'], correct: 0, exp: '"You" → "are". "What are you going to do...?"' },
    { q: 'True or False: "Going to" is used for spontaneous decisions.', opts: ['True', 'False'], correct: 1, exp: '"Going to" is for planned intentions; "will" is for spontaneous decisions.' },
    { q: 'Complete: "He _____ (not/go) to study tonight."', opts: ["isn't going to", "doesn't going to", "aren't going to"], correct: 0, exp: 'Negative: "He isn\'t going to study."' },
    { q: 'Choose: "We _____ going to have a test next week."', opts: ['are', 'is', 'am'], correct: 0, exp: '"We" → "are going to".' },
    { q: 'Complete: "She _____ (going to/buy) a new phone."', opts: ['is going to buy', 'are going to buy', 'going to buy'], correct: 0, exp: '"She" → "is going to" + buy.' },
    { q: 'True or False: "I am going to playing tennis" is correct.', opts: ['True', 'False'], correct: 1, exp: 'After "going to", use the base verb: "going to play".' },
    { q: 'Complete: "They _____ (not/have) a party this year."', opts: ["aren't going to have", "isn't going to have", "don't going to have"], correct: 0, exp: '"They" → "aren\'t going to" + have.' },
    { q: 'Which time expression fits "going to"?', opts: ['tomorrow', 'yesterday', 'every day'], correct: 0, exp: '"Tomorrow" / "next week" / "in the future" fit "going to".' },
    { q: 'True or False: "Are you going to come to the party?" is a correct question.', opts: ['True', 'False'], correct: 0, exp: 'Yes — "be + subject + going to + verb?" forms questions.' },
    { q: 'Complete: "My brother _____ (going to/start) a new job."', opts: ['is going to start', 'are going to start', 'going to start'], correct: 0, exp: '"My brother" (he) → "is going to start".' },
    { q: 'Choose: "I _____ not going to watch TV tonight."', opts: ['am', 'is', 'are'], correct: 0, exp: '"I" → "am not going to".' }
  ]

  const data = shared[u]
  if (!data) return []
  return data.map(d => ({
    question: d.q, options: d.opts, correctIndex: d.correct, explanation: d.exp
  }))
}

function generatePioneerQuestions(u: number, title: string) {
  const shared: { s: string; p: string; a: string; e: string }[][] = []
  
  // Unit 4
  shared[4] = [
    { s: '_____ she your best friend? (question)', p: 'question', a: 'is', e: 'Question with "she" → "Is she...?"' },
    { s: 'We _____ (not/be) from Germany.', p: 'not/be', a: 'are not', e: '"We" → "are not" (aren\'t).' },
    { s: '_____ they at home? (question)', p: 'question', a: 'are', e: '"They" → "Are they at home?"' },
    { s: 'He _____ (not/be) my brother. He\'s my cousin.', p: 'not/be', a: 'is not', e: '"He" → "is not" (isn\'t).' },
    { s: 'Unscramble: "you / Are / from / England / ?"', p: 'unscramble', a: 'are you from england', e: 'Question: Are + subject + complement?' },
    { s: 'I _____ (be) eleven years old. _____ I right? (question)', p: 'be', a: 'am / am', e: '"I" → "am". Question: "Am I right?"' },
    { s: 'The pizza _____ (not/be) very good.', p: 'not/be', a: 'is not', e: '"The pizza" (it) → "is not" (isn\'t).' },
    { s: 'Unscramble: "isn\'t / She / teacher / a"', p: 'unscramble', a: "she isn't a teacher", e: 'Negative sentence: She + isn\'t + noun.' },
    { s: '_____ your parents at work? (question)', p: 'question', a: 'are', e: '"Your parents" (they) → "Are" at start.' },
    { s: 'The movies _____ (not/be) interesting.', p: 'not/be', a: 'are not', e: '"The movies" (they) → "are not" (aren\'t).' },
    { s: '_____ it cold outside? (question)', p: 'question', a: 'is', e: '"It" → "Is it cold outside?"' },
    { s: 'We _____ (be) ready for the test.', p: 'be', a: 'are', e: '"We" → "are ready".' },
    { s: 'Unscramble: "not / Why / you / are / ready / ?"', p: 'unscramble', a: 'why are you not ready', e: 'WH-question: Why + are + subject + not?' },
    { s: 'Bello and Max _____ (not/be) in the garden.', p: 'not/be', a: 'are not', e: '"Bello and Max" (they) → "are not".' },
    { s: 'Short answer: "Is she nice?" — "Yes, she _____."', p: 'short', a: 'is', e: 'Short answer: "Yes, she is."' }
  ]
  
  // Unit 5
  shared[5] = [
    { s: 'She _____ (can) swim very fast.', p: 'can', a: 'can', e: '"Can" does not change: She can swim.' },
    { s: 'He _____ (not/can) speak French.', p: 'not/can', a: "can't", e: 'Negative: can\'t (cannot) + base verb.' },
    { s: '_____ you play the guitar? (question)', p: 'question', a: 'can', e: 'Question: "Can you play...?"' },
    { s: 'This book is _____ (I).', p: 'I', a: 'mine', e: 'Possessive pronoun for "I" is "mine".' },
    { s: 'Unscramble: "can\'t / He / Italian / speak"', p: 'unscramble', a: "he can't speak italian", e: 'Subject + can\'t + verb + object.' },
    { s: 'That pen is _____ (you).', p: 'you', a: 'yours', e: 'Possessive pronoun for "you" is "yours".' },
    { s: '_____ they come to the party? (question)', p: 'question', a: 'can', e: '"They" → "Can they come...?"' },
    { s: 'The dog is _____ (we).', p: 'we', a: 'ours', e: 'Possessive pronoun for "we" is "ours".' },
    { s: 'I _____ (not/can) find my pencil case.', p: 'not/can', a: "can't", e: '"I can\'t find..." = I am not able to find.' },
    { s: 'Unscramble: "yours / Is / this / pencil / ?"', p: 'unscramble', a: 'is this pencil yours', e: 'Question: Is + object + possessive pronoun?' },
    { s: 'She _____ (can/ride) a horse.', p: 'can/ride', a: 'can ride', e: '"Can" + base verb: "can ride".' },
    { s: 'The green bag is _____ (she).', p: 'she', a: 'hers', e: 'Possessive pronoun for "she" is "hers".' },
    { s: '_____ he speak English? (question)', p: 'question', a: 'can', e: '"He" → "Can he speak English?"' },
    { s: 'These books are _____ (they).', p: 'they', a: 'theirs', e: 'Possessive pronoun for "they" is "theirs".' },
    { s: 'Unscramble: "can\'t / very / Bello / run / fast"', p: 'unscramble', a: "bello can't run very fast", e: 'Subject + can\'t + verb + adverb.' }
  ]
  
  // Unit 6
  shared[6] = [
    { s: 'She _____ (read) books every day.', p: 'read', a: 'reads', e: '"She" (3rd person) adds -s: reads.' },
    { s: 'They _____ (play) tennis on Saturdays.', p: 'play', a: 'play', e: '"They" (plural) takes base verb.' },
    { s: 'He _____ (watch) TV in the evening.', p: 'watch', a: 'watches', e: 'Verbs ending in -ch add -es: watches.' },
    { s: 'Unscramble: "up / gets / He / at / 7"', p: 'unscramble', a: 'he gets up at 7', e: 'He + verb-s + time.' },
    { s: 'My sister _____ (study) at the library.', p: 'study', a: 'studies', e: 'Consonant + y → ies: studies.' },
    { s: 'We _____ (go) to school by bus.', p: 'go', a: 'go', e: '"We" → base verb "go".' },
    { s: 'The cat _____ (sleep) all day.', p: 'sleep', a: 'sleeps', e: '"The cat" (it) adds -s: sleeps.' },
    { s: 'She _____ (have) breakfast at 7 am.', p: 'have', a: 'has', e: '"Have" → "has" for he/she/it.' },
    { s: 'Unscramble: "every / plays / He / Sunday / football"', p: 'unscramble', a: 'he plays football every sunday', e: 'He + verb-s + object + time.' },
    { s: 'They _____ (live) in a small town.', p: 'live', a: 'live', e: '"They" (plural) → base verb.' },
    { s: 'The bus _____ (leave) at 8 am.', p: 'leave', a: 'leaves', e: '"The bus" (it) adds -s/-es: leaves.' },
    { s: 'He always _____ (do) his homework.', p: 'do', a: 'does', e: '"Do" → "does" for he/she/it.' },
    { s: 'My parents _____ (work) in an office.', p: 'work', a: 'work', e: '"My parents" (they) → base verb.' },
    { s: 'Unscramble: "brushes / every / He / teeth / his / morning"', p: 'unscramble', a: 'he brushes his teeth every morning', e: 'He + verb-s + object + time.' },
    { s: 'She _____ (finish) school at 3 pm.', p: 'finish', a: 'finishes', e: 'Verbs ending in -sh add -es: finishes.' }
  ]
  
  // Unit 7
  shared[7] = [
    { s: 'He _____ (not/like) broccoli.', p: 'not/like', a: "doesn't like", e: '"He" → doesn\'t + base verb.' },
    { s: 'I _____ (not/eat) meat.', p: 'not/eat', a: "don't eat", e: '"I" → don\'t + base verb.' },
    { s: 'She is _____ (a/an) honest girl.', p: 'a/an', a: 'an', e: '"Honest" has a silent h → "an".' },
    { s: 'Unscramble: "doesn\'t / He / play / guitar / the"', p: 'unscramble', a: "he doesn't play the guitar", e: 'He + doesn\'t + base verb + object.' },
    { s: 'We _____ (not/watch) TV in the morning.', p: 'not/watch', a: "don't watch", e: '"We" → don\'t + base verb.' },
    { s: 'It is _____ (a/an) umbrella.', p: 'a/an', a: 'an', e: '"Umbrella" starts with a vowel sound → "an".' },
    { s: 'They _____ (not/speak) German at home.', p: 'not/speak', a: "don't speak", e: '"They" → don\'t + base verb.' },
    { s: 'He is _____ (a/an) teacher.', p: 'a/an', a: 'a', e: '"Teacher" starts with a consonant → "a".' },
    { s: 'Unscramble: "don\'t / I / up / get / early"', p: 'unscramble', a: "i don't get up early", e: 'Subject + don\'t + verb + adverb.' },
    { s: 'She _____ (not/have) a pet.', p: 'not/have', a: "doesn't have", e: '"She" → doesn\'t + have.' },
    { s: 'He eats _____ (a/an) orange every day.', p: 'a/an', a: 'an', e: '"Orange" starts with a vowel → "an".' },
    { s: 'My friends _____ (not/play) video games.', p: 'not/play', a: "don't play", e: '"My friends" (they) → don\'t + verb.' },
    { s: 'Unscramble: "doesn\'t / She / to / music / listen / like"', p: 'unscramble', a: "she doesn't like to listen to music", e: 'She + doesn\'t + like + to + verb.' },
    { s: 'It _____ (not/rain) very often here.', p: 'not/rain', a: "doesn't rain", e: '"It" → doesn\'t + rain.' },
    { s: 'This is _____ (a/an) easy exercise.', p: 'a/an', a: 'an', e: '"Easy" starts with a vowel sound → "an".' }
  ]
  
  // Unit 8
  shared[8] = [
    { s: '_____ she like chocolate? (question)', p: 'question', a: 'does', e: '"She" → "Does she like...?"' },
    { s: 'Where _____ they live? (question)', p: 'question', a: 'do', e: '"They" → "Where do they live?"' },
    { s: '_____ he play football on Saturdays?', p: 'question', a: 'does', e: '"He" → "Does he play...?"' },
    { s: 'Unscramble: "does / Where / live / she / ?"', p: 'unscramble', a: 'where does she live', e: 'WH-word + does + subject + verb?' },
    { s: 'What _____ you do after school?', p: 'question', a: 'do', e: '"You" → "What do you do...?"' },
    { s: 'Short answer: "Do you like pizza?" — "Yes, I _____."', p: 'short', a: 'do', e: '"Yes, I do."' },
    { s: '_____ they visit their grandparents often?', p: 'question', a: 'do', e: '"They" → "Do they visit...?"' },
    { s: 'When _____ the bus arrive?', p: 'question', a: 'does', e: '"The bus" (it) → "does".' },
    { s: 'Unscramble: "you / Do / dogs / like / ?"', p: 'unscramble', a: 'do you like dogs', e: 'Do + subject + verb + object?' },
    { s: 'Short answer: "Does he speak English?" — "No, he _____."', p: 'short', a: "doesn't", e: '"No, he doesn\'t."' },
    { s: 'Why _____ you study English?', p: 'question', a: 'do', e: '"You" → "Why do you study...?"' },
    { s: '_____ your mother work in a hospital?', p: 'question', a: 'does', e: '"Your mother" (she) → "Does she work...?"' },
    { s: 'How often _____ you go to the cinema?', p: 'question', a: 'do', e: '"You" → "How often do you...?"' },
    { s: 'Unscramble: "does / What / mean / this / word / ?"', p: 'unscramble', a: 'what does this word mean', e: 'WH-word + does + subject + verb?' },
    { s: '_____ your friends like sports?', p: 'question', a: 'do', e: '"Your friends" (they) → "Do they like...?"' }
  ]
  
  // Unit 9
  shared[9] = [
    { s: '_____ is your birthday? — In June.', p: 'wh', a: 'when', e: '"When" asks about time.' },
    { s: 'Please give _____ (I) the book.', p: 'object', a: 'me', e: 'Object pronoun for "I" is "me".' },
    { s: '_____ is your best friend? — Anna.', p: 'wh', a: 'who', e: '"Who" asks about people.' },
    { s: 'Unscramble: "is / bag / Whose / this / ?"', p: 'unscramble', a: 'whose bag is this', e: '"Whose" asks about possession.' },
    { s: 'I sit next to _____ (she) in class.', p: 'object', a: 'her', e: 'Object pronoun for "she" is "her".' },
    { s: '_____ do you like winter? — Because I love snow!', p: 'wh', a: 'why', e: '"Why" asks for reasons.' },
    { s: 'Can you help _____ (we)?', p: 'object', a: 'us', e: 'Object pronoun for "we" is "us".' },
    { s: '_____ do you go to school? — By bus.', p: 'wh', a: 'how', e: '"How" asks about means/manner.' },
    { s: 'Unscramble: "them / I / see / can / ?"', p: 'unscramble', a: 'can i see them', e: '"Them" is the object pronoun for "they".' },
    { s: 'I often visit _____ (he) after school.', p: 'object', a: 'him', e: 'Object pronoun for "he" is "him".' },
    { s: '_____ is your phone number?', p: 'wh', a: 'what', e: '"What" asks for specific information.' },
    { s: 'Please call _____ (they) tomorrow.', p: 'object', a: 'them', e: 'Object pronoun for "they" is "them".' },
    { s: '_____ much is this T-shirt?', p: 'wh', a: 'how', e: '"How much" asks about prices.' },
    { s: 'Unscramble: "her / give / Please / book / the"', p: 'unscramble', a: 'please give her the book', e: 'Please + verb + object pronoun + object.' },
    { s: '_____ old are you? — I\'m 11.', p: 'wh', a: 'how', e: '"How old" asks about age.' }
  ]
  
  // Unit 10
  shared[10] = [
    { s: '_____ is my book here. (near)', p: 'demo', a: 'this', e: '"This" for something near the speaker.' },
    { s: '_____ book over there is mine. (far)', p: 'demo', a: 'that', e: '"That" for something far from the speaker.' },
    { s: '_____ are my friends here. (near/plural)', p: 'demo', a: 'these', e: '"These" for plural things near the speaker.' },
    { s: 'Unscramble: "much / How / is / book / that / ?"', p: 'unscramble', a: 'how much is that book', e: '"How much" + is + that + noun?' },
    { s: '_____ birds up in the sky are beautiful. (far/plural)', p: 'demo', a: 'those', e: '"Those" for plural things far away.' },
    { s: 'How much _____ these shoes cost?', p: 'cost', a: 'do', e: '"These shoes" (they/plural) → "do".' },
    { s: 'Look at _____ picture here! (near)', p: 'demo', a: 'this', e: '"This picture" — near the speaker.' },
    { s: 'How much _____ that jacket?', p: 'cost', a: 'is', e: '"That jacket" (it/singular) → "is".' },
    { s: 'Unscramble: "those / Are / yours / shoes / ?"', p: 'unscramble', a: 'are those shoes yours', e: 'Are + those + noun + possessive?' },
    { s: '_____ are my pencils in this case. (near/plural)', p: 'demo', a: 'these', e: '"These pencils" — near/plural.' },
    { s: 'Can you pass me _____ salt? (near)', p: 'demo', a: 'this', e: '"This salt" — near the speaker.' },
    { s: '_____ is my house at the end of the street. (far)', p: 'demo', a: 'that', e: '"That house" — far away.' },
    { s: 'How much _____ the tickets cost?', p: 'cost', a: 'do', e: '"The tickets" (they/plural) → "do".' },
    { s: 'Unscramble: "these / much / How / apples / are / ?"', p: 'unscramble', a: 'how much are these apples', e: 'How much + are + these + noun?' },
    { s: '_____ students in this room are very smart! (near/plural)', p: 'demo', a: 'these', e: '"These students" — near the speaker (plural).' }
  ]
  
  // Unit 11
  shared[11] = [
    { s: 'She _____ (read) a book right now.', p: 'read', a: 'is reading', e: 'Present Continuous: She + is + reading.' },
    { s: 'They _____ (play) football at the moment.', p: 'play', a: 'are playing', e: '"They" + are + playing.' },
    { s: 'He _____ (watch) TV now.', p: 'watch', a: 'is watching', e: '"He" + is + watching (now).' },
    { s: 'Unscramble: "is / singing / She / a / song"', p: 'unscramble', a: 'she is singing a song', e: 'Subject + is + verb-ing + object.' },
    { s: 'We _____ (study) for the test right now.', p: 'study', a: 'are studying', e: '"We" + are + studying.' },
    { s: 'Look! It _____ (rain) outside.', p: 'rain', a: 'is raining', e: '"It" + is + raining (Look! → now).' },
    { s: 'The baby _____ (sleep) at the moment.', p: 'sleep', a: 'is sleeping', e: '"The baby" (it) + is + sleeping.' },
    { s: 'I _____ (write) an email right now.', p: 'write', a: 'am writing', e: '"I" + am + writing (drop -e, add -ing).' },
    { s: 'Unscramble: "the / are / in / playing / They / park"', p: 'unscramble', a: 'they are playing in the park', e: 'They + are + verb-ing + place.' },
    { s: 'My mother _____ (cook) dinner at the moment.', p: 'cook', a: 'is cooking', e: '"My mother" (she) + is + cooking.' },
    { s: 'The children _____ (run) in the garden now.', p: 'run', a: 'are running', e: 'Double -n: running. "Children" (they) + are.' },
    { s: 'Listen! Someone _____ (knock) on the door.', p: 'knock', a: 'is knocking', e: '"Someone" (it) + is + knocking.' },
    { s: 'What _____ you doing right now?', p: 'doing', a: 'are', e: '"You" → "What are you doing...?"' },
    { s: 'Unscramble: "is / The / in / bath / dog / having / a"', p: 'unscramble', a: 'the dog is having a bath', e: 'The dog + is + having + object.' },
    { s: 'The teacher _____ (talk) to a parent.', p: 'talk', a: 'is talking', e: '"The teacher" (he/she) + is + talking.' }
  ]
  
  // Unit 12
  shared[12] = [
    { s: 'I _____ (be) at home yesterday.', p: 'be', a: 'was', e: '"I" → "was" in past tense.' },
    { s: 'They _____ (be) at the park last Sunday.', p: 'be', a: 'were', e: '"They" → "were" in past tense.' },
    { s: 'She _____ (not/be) at school yesterday.', p: 'not/be', a: "wasn't", e: '"She" → "wasn\'t" (was not).' },
    { s: 'Unscramble: "were / Where / you / yesterday / ?"', p: 'unscramble', a: 'where were you yesterday', e: 'WH-word + were + subject + time?' },
    { s: 'We _____ (be) very tired after the trip.', p: 'be', a: 'were', e: '"We" → "were".' },
    { s: 'The weather _____ (be) nice last weekend.', p: 'be', a: 'was', e: '"The weather" (it) → "was".' },
    { s: 'My friends _____ (not/be) at the party.', p: 'not/be', a: "weren't", e: '"My friends" (they) → "weren\'t".' },
    { s: '_____ you at home last night?', p: 'question', a: 'were', e: '"You" → "Were you at home...?"' },
    { s: 'Unscramble: "wasn\'t / The / good / movie / very"', p: 'unscramble', a: 'the movie wasn\'t very good', e: 'Subject + wasn\'t + adverb + adjective.' },
    { s: 'He _____ (be) born in 2014.', p: 'be', a: 'was', e: '"He" → "was born".' },
    { s: 'The books _____ (be) on the shelf.', p: 'be', a: 'were', e: '"The books" (they) → "were".' },
    { s: 'I _____ (not/be) hungry after the meal.', p: 'not/be', a: "wasn't", e: '"I" → "wasn\'t".' },
    { s: 'There _____ (be) a cat under the table.', p: 'be', a: 'was', e: '"A cat" (singular) → "there was".' },
    { s: 'Short answer: "Were you late?" — "No, I _____."', p: 'short', a: "wasn't", e: '"No, I wasn\'t."' },
    { s: 'Unscramble: "weren\'t / happy / The / children / very"', p: 'unscramble', a: 'the children weren\'t very happy', e: 'Subject + weren\'t + adverb + adjective.' }
  ]
  
  // Unit 13
  shared[13] = [
    { s: 'She _____ (walk) to school yesterday.', p: 'walk', a: 'walked', e: 'Walk + -ed = walked.' },
    { s: 'They _____ (play) in the park last Sunday.', p: 'play', a: 'played', e: 'Play + -ed = played.' },
    { s: 'He _____ (study) for the test last night.', p: 'study', a: 'studied', e: 'Consonant + y → ied: studied.' },
    { s: 'Unscramble: "watched / a / He / movie / last / night"', p: 'unscramble', a: 'he watched a movie last night', e: 'Subject + verb-ed + object + time.' },
    { s: 'We _____ (visit) our grandparents last weekend.', p: 'visit', a: 'visited', e: 'Visit + -ed = visited.' },
    { s: 'I _____ (stop) at the red light.', p: 'stop', a: 'stopped', e: 'Short vowel + p → doubled: stopped.' },
    { s: 'She _____ (carry) the heavy bag.', p: 'carry', a: 'carried', e: 'Consonant + y → ied: carried.' },
    { s: 'They _____ (dance) at the party.', p: 'dance', a: 'danced', e: 'Verb ending in -e + -d: danced.' },
    { s: 'Unscramble: "arrived / The / at / 8 / train / pm"', p: 'unscramble', a: 'the train arrived at 8 pm', e: 'Subject + verb-ed + time.' },
    { s: 'He _____ (try) to open the door.', p: 'try', a: 'tried', e: 'Consonant + y → ied: tried.' },
    { s: 'My mother _____ (cook) a delicious meal.', p: 'cook', a: 'cooked', e: 'Cook + -ed = cooked.' },
    { s: 'We _____ (watch) a great film last night.', p: 'watch', a: 'watched', e: 'Watch + -ed = watched.' },
    { s: 'She _____ (plan) her birthday party.', p: 'plan', a: 'planned', e: 'Short vowel + n → doubled: planned.' },
    { s: 'Unscramble: "called / He / friend / his / yesterday"', p: 'unscramble', a: 'he called his friend yesterday', e: 'Subject + verb-ed + object + time.' },
    { s: 'The children _____ (play) outside all day.', p: 'play', a: 'played', e: 'Play + -ed = played.' }
  ]
  
  // Unit 14
  shared[14] = [
    { s: 'I _____ (not/go) to school yesterday.', p: 'not/go', a: "didn't go", e: '"Didn\'t" + base verb "go".' },
    { s: 'She _____ (eat) all the cake!', p: 'eat', a: 'ate', e: '"Eat" → "ate" (irregular).' },
    { s: 'He _____ (not/see) the movie.', p: 'not/see', a: "didn't see", e: '"Didn\'t" + base verb "see".' },
    { s: 'Unscramble: "went / She / to / Vienna / last / week"', p: 'unscramble', a: 'she went to vienna last week', e: '"Go" → "went" (irregular).' },
    { s: 'They _____ (buy) a new car last month.', p: 'buy', a: 'bought', e: '"Buy" → "bought" (irregular).' },
    { s: 'We _____ (not/have) much time.', p: 'not/have', a: "didn't have", e: '"Didn\'t" + base verb "have".' },
    { s: 'I _____ (drink) a lot of water.', p: 'drink', a: 'drank', e: '"Drink" → "drank" (irregular).' },
    { s: 'She _____ (write) a letter to her friend.', p: 'write', a: 'wrote', e: '"Write" → "wrote" (irregular).' },
    { s: 'Unscramble: "didn\'t / find / I / my / keys"', p: 'unscramble', a: "i didn't find my keys", e: 'Subject + didn\'t + base verb + object.' },
    { s: 'He _____ (make) a cake for my birthday.', p: 'make', a: 'made', e: '"Make" → "made" (irregular).' },
    { s: 'They _____ (not/know) the answer.', p: 'not/know', a: "didn't know", e: '"Didn\'t" + base verb "know".' },
    { s: 'We _____ (go) to the beach last summer.', p: 'go', a: 'went', e: '"Go" → "went" (irregular past).' },
    { s: 'I _____ (get) a present from my parents.', p: 'get', a: 'got', e: '"Get" → "got" (irregular).' },
    { s: 'Unscramble: "bought / a / He / gift / her / for"', p: 'unscramble', a: 'he bought a gift for her', e: '"Buy" → "bought" (irregular).' },
    { s: 'She _____ (not/find) her pencil case.', p: 'not/find', a: "didn't find", e: '"Didn\'t" + base verb "find".' }
  ]
  
  // Unit 15
  shared[15] = [
    { s: 'I _____ (going to/visit) my grandma tomorrow.', p: 'going to/visit', a: 'am going to visit', e: '"I" + am going to + visit.' },
    { s: 'She _____ (going to/buy) a new phone.', p: 'going to/buy', a: 'is going to buy', e: '"She" + is going to + buy.' },
    { s: 'They _____ (not/go) to have a party.', p: 'not/go', a: "aren't going to", e: '"They" + aren\'t going to + verb.' },
    { s: 'Unscramble: "going / What / to / do / are / you / ?"', p: 'unscramble', a: 'what are you going to do', e: 'What + are + subject + going to + verb?' },
    { s: 'We _____ (going to/study) for the test.', p: 'going to/study', a: 'are going to study', e: '"We" + are going to + study.' },
    { s: 'He _____ (not/go) to play football.', p: 'not/go', a: "isn't going to", e: '"He" + isn\'t going to + verb.' },
    { s: 'My parents _____ (going to/travel) to Italy.', p: 'going to/travel', a: 'are going to travel', e: '"My parents" (they) + are going to.' },
    { s: '_____ you going to come to the party?', p: 'question', a: 'are', e: '"You" → "Are you going to...?"' },
    { s: 'Unscramble: "to / not / going / I\'m / late / be"', p: 'unscramble', a: "i'm not going to be late", e: 'Subject + \'m not + going to + verb.' },
    { s: 'What _____ you going to do this weekend?', p: 'question', a: 'are', e: '"You" → "What are you going to...?"' },
    { s: 'She _____ (going to/start) a new hobby.', p: 'going to/start', a: 'is going to start', e: '"She" + is going to + start.' },
    { s: 'We _____ (not/have) a test next week.', p: 'not/have', a: "aren't going to have", e: '"We" + aren\'t going to + have.' },
    { s: 'He _____ (going to/be) a doctor when he grows up.', p: 'going to/be', a: 'is going to be', e: '"He" + is going to + be.' },
    { s: 'Unscramble: "to / going / is / She / a / buy / bike"', p: 'unscramble', a: 'she is going to buy a bike', e: 'Subject + is + going to + verb + object.' },
    { s: 'I _____ (not/go) to watch TV tonight.', p: 'not/go', a: "am not going to", e: '"I" + am not going to + verb.' }
  ]

  const data = shared[u]
  if (!data) return []
  return data.map(d => ({
    sentence: d.s, placeholder: d.p, correctAnswer: d.a, explanation: d.e
  }))
}

function generateMasterQuestions(u: number, title: string) {
  const shared: { q: string; a: string[]; e: string }[][] = []
  
  // Unit 4
  shared[4] = [
    { q: 'Translate: "Bist du müde?"', a: ['Are you tired?', 'Are you tired'], e: '"Bist du" → "Are you", "müde" → "tired".' },
    { q: 'Correct: "He aren\'t my friend."', a: ["He isn't my friend.", "He is not my friend."], e: '"He" takes "isn\'t" (not "aren\'t").' },
    { q: 'Translate: "Sind die Schüler fleißig?"', a: ['Are the students hard-working?', 'Are the students diligent?'], e: '"Sind" → "Are", "die Schüler" → "the students".' },
    { q: 'Correct: "I aren\'t ready for the test."', a: ["I am not ready for the test.", "I'm not ready for the test."], e: '"I" takes "am not" — there is no contraction.' },
    { q: 'Translate: "Er ist nicht zu Hause."', a: ["He is not at home.", "He isn't at home.", "He isn't home."], e: '"Er ist nicht" → "He is not/isn\'t", "zu Hause" → "at home".' },
    { q: 'Combine: "She is nice. She is helpful."', a: ['She is nice and helpful.', 'She is nice and she is helpful.'], e: 'Combine adjectives with "and".' },
    { q: 'Correct: "Aren\'t I your best friend?" → fix to standard form', a: ["Am I not your best friend?", "Am I not your best friend?"], e: '"Aren\'t I" is informal. Standard: "Am I not"?' },
    { q: 'Translate: "Wo ist mein Bleistift?"', a: ['Where is my pencil?', 'Where is my pencil'], e: '"Wo" → "Where", "mein" → "my".' },
    { q: 'Correct: "We isn\'t in the classroom."', a: ["We aren't in the classroom.", "We are not in the classroom."], e: '"We" takes "aren\'t" (not "isn\'t").' },
    { q: 'Write a question asking if the food is good:', a: ['Is the food good?', 'Is the food good'], e: 'Question: Is + subject + adjective?' },
    { q: 'Translate: "Sind sie nicht süß?"', a: ["Aren't they cute?", "Are they not cute?"], e: 'Negative question: "Aren\'t they...?"' },
    { q: 'Correct: "The teachers is very nice."', a: ['The teachers are very nice.', 'The teachers are very nice.'], e: '"The teachers" (they/plural) → "are".' },
    { q: 'Rewrite as question: "You are from Italy."', a: ['Are you from Italy?', 'Are you from Italy'], e: 'Invert subject and verb for questions.' },
    { q: 'Translate: "Warum bist du traurig?"', a: ['Why are you sad?', 'Why are you sad'], e: '"Warum" → "Why", "traurig" → "sad".' },
    { q: 'Correct: "The children isn\'t at school today."', a: ["The children aren't at school today.", "The children are not at school today."], e: '"Children" (plural) → "aren\'t".' }
  ]
  
  // Unit 5
  shared[5] = [
    { q: 'Translate: "Kannst du Klavier spielen?"', a: ['Can you play the piano?', 'Can you play piano?'], e: '"Kannst du" → "Can you", "Klavier spielen" → "play the piano".' },
    { q: 'Correct: "She can to swim very fast."', a: ['She can swim very fast.', 'She can swim very fast.'], e: 'After "can", use the base verb without "to".' },
    { q: 'Translate: "Das ist mein Buch." (use possessive pronoun)', a: ['This book is mine.', 'That book is mine.'], e: '"Mein Buch" → "my book" or use "mine" as possessive pronoun.' },
    { q: 'Correct: "He can\'t rides a bike."', a: ["He can't ride a bike.", "He cannot ride a bike."], e: 'After "can\'t", use the base verb "ride" (not "rides").' },
    { q: 'Translate: "Diese Schule ist unsere."', a: ['This school is ours.', 'This school is ours.'], e: '"Unsere" → "ours" (possessive pronoun).' },
    { q: 'Rewrite: "This is my pen." (use possessive pronoun)', a: ['This pen is mine.', 'This pen is mine.'], e: '"My pen" → "mine" (no noun after).' },
    { q: 'Correct: "You can sings very well."', a: ['You can sing very well.', 'You can sing very well.'], e: 'After "can" + base verb (no -s).' },
    { q: 'Translate: "Kann er nicht kommen?"', a: ["Can't he come?", 'Cannot he come?', 'Can he not come?'], e: 'Negative question: "Can\'t he come?"' },
    { q: 'Combine: "This is my book. This is my pen."', a: ['This is my book and my pen.', 'This is my book and this is my pen.'], e: 'Combine with "and".' },
    { q: 'Correct: "That bag is her."', a: ['That bag is hers.', 'That bag is hers.'], e: 'Use possessive pronoun "hers" (not "her").' },
    { q: 'Translate: "Ich kann nicht schwimmen."', a: ["I can't swim.", 'I cannot swim.'], e: '"Ich kann nicht" → "I can\'t / cannot".' },
    { q: 'Rewrite as question: "She can dance."', a: ['Can she dance?', 'Can she dance'], e: 'Invert: Can + subject + verb?' },
    { q: 'Correct: "Those books are their."', a: ['Those books are theirs.', 'Those books are theirs.'], e: 'Use "theirs" (possessive pronoun, not "their").' },
    { q: 'Translate: "Wem gehört dieser Bleistift? — Meiner."', a: ['Whose pencil is this? — Mine.', 'Whose is this pencil? — Mine.'], e: '"Meiner" → "mine" (possessive pronoun).' },
    { q: 'Write 2 things you can do and 1 you can\'t:', a: ['I can swim and dance, but I can\'t fly.', 'I can play football and read, but I can\'t drive.'], e: 'Pattern: I can [verb] and [verb], but I can\'t [verb].' }
  ]
  
  // Unit 6
  shared[6] = [
    { q: 'Translate: "Sie spielt jeden Tag Tennis."', a: ['She plays tennis every day.', 'She plays tennis every day.'], e: '"Sie spielt" → "She plays", "jeden Tag" → "every day".' },
    { q: 'Correct: "He go to school by bus."', a: ['He goes to school by bus.', 'He goes to school by bus.'], e: '"He" (3rd person) → verb + -s: "goes".' },
    { q: 'Translate: "Mein Bruder mag Pizza."', a: ['My brother likes pizza.', 'My brother likes pizza.'], e: '"Mein Bruder" → "My brother", "mag" → "likes".' },
    { q: 'Correct: "She watch TV every evening."', a: ['She watches TV every evening.', 'She watches TV every evening.'], e: 'Verbs ending in -ch add -es: "watches".' },
    { q: 'Rewrite: "I get up at 7. My sister gets up at 7." (combine)', a: ['My sister and I get up at 7.', 'I get up at 7 and my sister gets up at 7.'], e: 'Combine with "and".' },
    { q: 'Translate: "Die Schule beginnt um 8 Uhr."', a: ['School starts at 8 o\'clock.', 'School begins at 8 o\'clock.'], e: '"Beginnt" → "starts/begins", "um 8 Uhr" → "at 8 o\'clock".' },
    { q: 'Correct: "My dog like to play in the garden."', a: ['My dog likes to play in the garden.', 'My dog likes playing in the garden.'], e: '"My dog" (it) → verb + -s: "likes".' },
    { q: 'Rewrite in 3rd person: "I study every day. → He _____"', a: ['He studies every day.', 'He studies every day.'], e: 'Consonant + y → ies: "studies".' },
    { q: 'Translate: "Wir wohnen in einem kleinen Haus."', a: ['We live in a small house.', 'We live in a small house.'], e: '"Wir wohnen" → "We live", "klein" → "small".' },
    { q: 'Correct: "He has breakfast and then he go to school."', a: ['He has breakfast and then he goes to school.', 'He has breakfast and then goes to school.'], e: 'Both verbs need -s: "has" and "goes".' },
    { q: 'Write about your daily routine (3 sentences):', a: ['I get up at 7. I have breakfast. I go to school.', 'I wake up, brush my teeth and go to school.'], e: 'Use Present Simple for routines.' },
    { q: 'Correct: "She do her homework after school."', a: ['She does her homework after school.', 'She does her homework after school.'], e: '"Do" → "does" for he/she/it.' },
    { q: 'Translate: "Er trinkt jeden Morgen Kaffee."', a: ['He drinks coffee every morning.', 'He drinks coffee every morning.'], e: '"Er trinkt" → "He drinks", "jeden Morgen" → "every morning".' },
    { q: 'Rewrite in negative: "She likes vegetables."', a: ["She doesn't like vegetables.", 'She does not like vegetables.'], e: '"Doesn\'t" + base verb: "doesn\'t like".' },
    { q: 'Correct: "The children plays in the park every day."', a: ['The children play in the park every day.', 'The children play in the park every day.'], e: '"Children" (plural) → base verb "play".' }
  ]
  
  // Unit 7
  shared[7] = [
    { q: 'Translate: "Er mag keine Schokolade."', a: ["He doesn't like chocolate.", 'He does not like chocolate.'], e: '"Er mag nicht" → "He doesn\'t like".' },
    { q: 'Correct: "I don\'t likes cold weather."', a: ["I don't like cold weather.", 'I do not like cold weather.'], e: 'After "don\'t", use base verb "like".' },
    { q: 'Translate: "Wir haben keinen Hund."', a: ["We don't have a dog.", 'We do not have a dog.'], e: '"Wir haben keinen" → "We don\'t have a".' },
    { q: 'Correct: "She doesn\'t plays the guitar."', a: ["She doesn't play the guitar.", 'She does not play the guitar.'], e: 'After "doesn\'t", use base verb "play".' },
    { q: 'Fill in articles: "I have ___ apple and ___ banana."', a: ['an, a', 'I have an apple and a banana.'], e: '"Apple" (vowel) → "an", "banana" (consonant) → "a".' },
    { q: 'Correct: "They don\'t goes to the gym."', a: ["They don't go to the gym.", 'They do not go to the gym.'], e: 'After "don\'t", use base verb "go".' },
    { q: 'Translate: "Sie wohnt nicht in der Stadt."', a: ["She doesn't live in the city.", 'She does not live in the city.'], e: '"Sie wohnt nicht" → "She doesn\'t live".' },
    { q: 'Rewrite in negative: "We play football on Sundays."', a: ["We don't play football on Sundays.", 'We do not play football on Sundays.'], e: '"We" → "We don\'t play".' },
    { q: 'Correct: "It don\'t rain much in summer."', a: ["It doesn't rain much in summer.", 'It does not rain much in summer.'], e: '"It" (3rd person) → "doesn\'t".' },
    { q: 'Translate: "Ich habe einen Bruder, aber keine Schwester."', a: ['I have a brother but not a sister.', "I have a brother but I don't have a sister."], e: '"Einen Bruder" → "a brother", "keine Schwester" → "not a sister / no sister".' },
    { q: 'Rewrite with frequency adverb: "I get up late. (never)"', a: ['I never get up late.', 'I never get up late.'], e: 'Adverb of frequency goes before the main verb: "never get".' },
    { q: 'Correct: "He doesn\'t has a bicycle."', a: ["He doesn't have a bicycle.", 'He does not have a bicycle.'], e: 'After "doesn\'t", use base verb "have" (not "has").' },
    { q: 'Translate: "Meine Eltern essen kein Fleisch."', a: ["My parents don't eat meat.", 'My parents do not eat meat.'], e: '"Meine Eltern" → "My parents" (they) → "don\'t eat".' },
    { q: 'Correct: "She isn\'t like coffee." → fix the grammar', a: ["She doesn't like coffee.", 'She does not like coffee.'], e: 'Use "doesn\'t like" (not "isn\'t like").' },
    { q: 'Write 2 things you don\'t do in the morning:', a: ["I don't watch TV and I don't play video games.", "I don't drink coffee and I don't eat chocolate."], e: 'Pattern: "I don\'t [verb] and I don\'t [verb]."' }
  ]
  
  // Unit 8
  shared[8] = [
    { q: 'Translate: "Magst du Schokolade?"', a: ['Do you like chocolate?', 'Do you like chocolate'], e: '"Magst du" → "Do you like".' },
    { q: 'Correct: "Does he plays football?"', a: ['Does he play football?', 'Does he play football'], e: 'After "Does", use base verb "play".' },
    { q: 'Translate: "Wo wohnt deine Tante?"', a: ['Where does your aunt live?', 'Where does your aunt live'], e: '"Wo wohnt" → "Where does ... live".' },
    { q: 'Correct: "Do she like ice cream?"', a: ['Does she like ice cream?', 'Does she like ice cream'], e: '"She" (3rd person) → "Does she like".' },
    { q: 'Form a question from: "They live in London."', a: ['Do they live in London?', 'Do they live in London'], e: 'Question: Do + subject + verb?' },
    { q: 'Translate: "Was isst du zum Frühstück?"', a: ['What do you eat for breakfast?', 'What do you eat for breakfast'], e: '"Was isst du" → "What do you eat".' },
    { q: 'Correct: "Where your parents live?"', a: ['Where do your parents live?', 'Where do your parents live'], e: 'Add "do": "Where do your parents live?"' },
    { q: 'Short answer: "Does he speak German?" — "Yes,..."', a: ['Yes, he does.', 'Yes, he does'], e: 'Short answer: "Yes, he does."' },
    { q: 'Translate: "Wie oft gehst du ins Kino?"', a: ['How often do you go to the cinema?', 'How often do you go to the cinema'], e: '"Wie oft" → "How often", "gehst du" → "do you go".' },
    { q: 'Correct: "Why does you want to learn English?"', a: ['Why do you want to learn English?', 'Why do you want to learn English'], e: '"You" takes "do", not "does".' },
    { q: 'Form a question: "She gets up at 7. → When...?"', a: ['When does she get up?', 'When does she get up'], e: 'WH-word + does + subject + base verb?' },
    { q: 'Correct: "Do he likes pizza?"', a: ['Does he like pizza?', 'Does he like pizza'], e: '"He" → "Does he like" (no -s on like).' },
    { q: 'Translate: "Hast du Geschwister?" (use do/does)', a: ['Do you have siblings?', 'Do you have brothers and sisters?'], e: '"Hast du" → "Do you have".' },
    { q: 'Correct: "What time get you up?"', a: ['What time do you get up?', 'What time do you get up'], e: 'Add "do": "What time do you get up?"' },
    { q: 'Write 3 questions to ask a new friend:', a: ['What is your name? Where do you live? Do you like sports?', 'How old are you? What is your hobby? Do you have a pet?'], e: 'Use different question words.' }
  ]
  
  // Unit 9
  shared[9] = [
    { q: 'Translate: "Wen rufst du an?" (who(m))', a: ['Who do you call?', 'Who do you call'], e: '"Wen" → "Who" as object (informal: "Who do you call?").' },
    { q: 'Correct: "I want to help she."', a: ['I want to help her.', 'I want to help her.'], e: 'Object pronoun for "she" is "her".' },
    { q: 'Translate: "Wem gehört dieses Buch?"', a: ['Whose book is this?', 'Whose is this book?'], e: '"Wem gehört" → "Whose".' },
    { q: 'Correct: "Please give the book to I."', a: ['Please give the book to me.', 'Please give me the book.'], e: '"To I" → "to me" (object pronoun).' },
    { q: 'Rewrite: "I know the girl. She lives next door." (combine)', a: ['I know the girl who lives next door.', 'I know the girl living next door.'], e: 'Use "who" to combine sentences.' },
    { q: 'Translate: "Kannst du ihnen helfen?"', a: ['Can you help them?', 'Can you help them'], e: '"Ihnen" → "them" (object pronoun for "they").' },
    { q: 'Correct: "She sits next to I in class."', a: ['She sits next to me in class.', 'She sits next to me in class.'], e: '"Next to" takes the object pronoun "me".' },
    { q: 'Translate: "Warum lernst du Englisch?"', a: ['Why do you learn English?', 'Why do you learn English'], e: '"Warum" → "Why", "lernst du" → "do you learn".' },
    { q: 'Correct: "Who book is this?"', a: ['Whose book is this?', 'Whose book is this'], e: '"Whose" (possession), not "who".' },
    { q: 'Rewrite with object pronoun: "I see the boys. → I see _____."', a: ['I see them.', 'I see them.'], e: '"The boys" → "them" (object pronoun).' },
    { q: 'Translate: "Wie kommst du zur Schule?"', a: ['How do you get to school?', 'How do you come to school?'], e: '"Wie" → "How", "kommst du" → "do you get/come".' },
    { q: 'Correct: "The teacher gave we a test."', a: ['The teacher gave us a test.', 'The teacher gave us a test.'], e: '"We" → "us" (object pronoun after verb).' },
    { q: 'Combine: "This is the man. He helped me."', a: ['This is the man who helped me.', 'This is the man that helped me.'], e: 'Use "who" to connect: "the man who helped me".' },
    { q: 'Translate: "Was machst du gerne in deiner Freizeit?"', a: ['What do you like to do in your free time?', 'What do you like doing in your free time?'], e: '"Was machst du gerne" → "What do you like to do".' },
    { q: 'Write 2 questions using "how" and "why":', a: ['How do you get to school? Why do you like English?', 'How old are you? Why are you happy?'], e: 'WH-questions ask for specific information.' }
  ]
  
  // Unit 10
  shared[10] = [
    { q: 'Translate: "Dieses Buch hier ist interessant."', a: ['This book is interesting.', 'This book here is interesting.'], e: '"Dieses" (near) → "this".' },
    { q: 'Correct: "These book over there is mine."', a: ['That book over there is mine.', 'That book over there is mine.'], e: '"Over there" (far) → "that" (singular).' },
    { q: 'Translate: "Wie viel kosten diese Schuhe?"', a: ['How much are these shoes?', 'How much do these shoes cost?'], e: '"Diese Schuhe" (plural/near) → "these shoes".' },
    { q: 'Correct: "How much is these apples?"', a: ['How much are these apples?', 'How much do these apples cost?'], e: '"These apples" (plural) → "are" or "do...cost".' },
    { q: 'Rewrite: "This is a book. (plural)"', a: ['These are books.', 'These are books.'], e: '"This" (singular) → "these" (plural).' },
    { q: 'Translate: "Jenes Haus dort ist sehr alt."', a: ['That house is very old.', 'That house there is very old.'], e: '"Jenes" (far) → "that".' },
    { q: 'Correct: "How much does this shoes cost?"', a: ['How much do these shoes cost?', 'How much are these shoes?'], e: '"These shoes" (plural) → "do".' },
    { q: 'Translate: "Diese Aufgaben hier sind einfach."', a: ['These exercises are easy.', 'These tasks are easy.'], e: '"Diese" (near/plural) → "these".' },
    { q: 'Correct: "Those is my friends."', a: ['Those are my friends.', 'Those are my friends.'], e: '"Those" (plural) → "are".' },
    { q: 'Rewrite in singular: "These are my books."', a: ['This is my book.', 'This is my book.'], e: '"These" → "this", "books" → "book".' },
    { q: 'Translate: "Kannst du mir diesen Stift geben?" (holding it)', a: ['Can you give me this pen?', 'Can you give me this pen?'], e: '"Diesen" (near — you see/hold it) → "this".' },
    { q: 'Correct: "This students over there are in my class."', a: ['Those students over there are in my class.', 'Those students over there are in my class.'], e: '"Over there" (far) → "those".' },
    { q: 'Translate: "Wie viel kostet jenes Fahrrad?"', a: ['How much does that bike cost?', 'How much is that bike?'], e: '"Jenes" (far) → "that", "Fahrrad" → "bike/bicycle".' },
    { q: 'Correct: "How much are this T-shirt?"', a: ['How much is this T-shirt?', 'How much does this T-shirt cost?'], e: '"This T-shirt" (singular) → "is" or "does...cost".' },
    { q: 'Describe 2 things near you and 2 far from you:', a: ['This pen and these books are near me. That door and those windows are far.', 'This phone and this water bottle are near. That tree and those cars are far.'], e: 'Use this/these for near, that/those for far.' }
  ]
  
  // Unit 11
  shared[11] = [
    { q: 'Translate: "Sie liest gerade ein Buch."', a: ['She is reading a book right now.', 'She is reading a book.'], e: '"Sie liest gerade" → "She is reading" (Present Continuous).' },
    { q: 'Correct: "They are play football in the garden."', a: ['They are playing football in the garden.', 'They are playing football in the garden.'], e: '"Are" + verb-ing: "are playing".' },
    { q: 'Translate: "Was machst du gerade?"', a: ['What are you doing right now?', 'What are you doing?'], e: '"Was machst du gerade" → "What are you doing right now?"' },
    { q: 'Correct: "He is swiming in the pool."', a: ['He is swimming in the pool.', 'He is swimming in the pool.'], e: 'Double the -m: "swimming" (not "swiming").' },
    { q: 'Translate: "Die Kinder schlafen gerade."', a: ['The children are sleeping right now.', 'The children are sleeping.'], e: '"Schlafen gerade" → "are sleeping" (Present Continuous).' },
    { q: 'Correct: "Look! It rains." → use correct tense', a: ['Look! It is raining.', 'Look! It is raining.'], e: '"Look!" signals Present Continuous: "It is raining".' },
    { q: 'Translate: "Ich mache gerade meine Hausaufgaben."', a: ['I am doing my homework right now.', 'I am doing my homework.'], e: '"Mache gerade" → "am doing" (Present Continuous).' },
    { q: 'Correct: "She is write a letter at the moment."', a: ['She is writing a letter at the moment.', 'She is writing a letter.'], e: '"Is" + verb-ing: "is writing".' },
    { q: 'Rewrite: "I read a book." (change to right now)', a: ['I am reading a book right now.', 'I am reading a book.'], e: 'Change to Present Continuous: "I am reading".' },
    { q: 'Translate: "Hör zu! Jemand singt."', a: ['Listen! Someone is singing.', 'Listen! Someone is singing.'], e: '"Hör zu!" → "Listen!", "singt" (gerade) → "is singing".' },
    { q: 'Correct: "The baby is cry."', a: ['The baby is crying.', 'The baby is crying.'], e: '"Is" + verb-ing: "is crying".' },
    { q: 'Write 3 things happening right now in your room:', a: ['I am sitting at my desk. The sun is shining. My phone is charging.', 'I am studying. My brother is playing. My cat is sleeping.'], e: 'Use Present Continuous for actions happening now.' },
    { q: 'Translate: "Wir lernen gerade für den Test."', a: ['We are studying for the test right now.', 'We are learning for the test.'], e: '"Lernen gerade" → "are studying/learning" (Present Continuous).' },
    { q: 'Correct: "The dog are running in the park."', a: ['The dog is running in the park.', 'The dog is running in the park.'], e: '"The dog" (it/singular) → "is running".' },
    { q: 'Rewrite as negative: "She is sleeping."', a: ['She is not sleeping.', "She isn't sleeping."], e: 'Negative: "She is not / isn\'t sleeping."' }
  ]
  
  // Unit 12
  shared[12] = [
    { q: 'Translate: "Ich war gestern im Kino."', a: ['I was at the cinema yesterday.', 'I was at the movies yesterday.'], e: '"Ich war" → "I was", "gestern" → "yesterday".' },
    { q: 'Correct: "We was at the park last Sunday."', a: ['We were at the park last Sunday.', 'We were at the park last Sunday.'], e: '"We" takes "were", not "was".' },
    { q: 'Translate: "Wo warst du gestern?"', a: ['Where were you yesterday?', 'Where were you yesterday?'], e: '"Wo warst du" → "Where were you".' },
    { q: 'Correct: "She weren\'t at home last night."', a: ["She wasn't at home last night.", 'She was not at home last night.'], e: '"She" → "wasn\'t" (not "weren\'t").' },
    { q: 'Translate: "Das Wetter war letztes Wochenende schön."', a: ['The weather was nice last weekend.', 'The weather was beautiful last weekend.'], e: '"Das Wetter war" → "The weather was", "letztes Wochenende" → "last weekend".' },
    { q: 'Correct: "There was many people at the concert."', a: ['There were many people at the concert.', 'There were many people at the concert.'], e: '"Many people" (plural) → "there were".' },
    { q: 'Translate: "Meine Großeltern waren sehr nett."', a: ['My grandparents were very nice.', 'My grandparents were very kind.'], e: '"Meine Großeltern" (they/plural) → "My grandparents were".' },
    { q: 'Correct: "I weren\'t tired after the trip."', a: ["I wasn't tired after the trip.", 'I was not tired after the trip.'], e: '"I" → "wasn\'t" (not "weren\'t").' },
    { q: 'Rewrite in past: "The children are in the garden."', a: ['The children were in the garden.', 'The children were in the garden.'], e: 'Present "are" → past "were".' },
    { q: 'Translate: "War dein Onkel auch auf der Party?"', a: ['Was your uncle at the party too?', 'Was your uncle also at the party?'], e: '"War" → "Was", "dein Onkel" → "your uncle".' },
    { q: 'Correct: "The books was on the table."', a: ['The books were on the table.', 'The books were on the table.'], e: '"The books" (they/plural) → "were".' },
    { q: 'Short answer: "Were you at school yesterday?" "Yes, ..."', a: ['Yes, I was.', 'Yes, I was.'], e: 'Short answer: "Yes, I was."' },
    { q: 'Translate: "Es war einmal ein kleiner Junge."', a: ['Once upon a time there was a little boy.', 'There was once a little boy.'], e: '"Es war einmal" → "Once upon a time there was".' },
    { q: 'Correct: "The movie wasn\'t very good, but the actors was great."', a: ['The movie wasn\'t very good, but the actors were great.', 'The movie wasn\'t very good, but the actors were great.'], e: '"The actors" (plural) → "were".' },
    { q: 'Write 2 things you were yesterday and 2 you weren\'t:', a: ['I was at school. I was happy. I wasn\'t tired. I wasn\'t late.', 'I was at home in the morning. I was hungry. I wasn\'t at the park. I wasn\'t sad.'], e: 'Use "was/were" for past states.' }
  ]
  
  // Unit 13
  shared[13] = [
    { q: 'Translate: "Ich habe gestern Fußball gespielt."', a: ['I played football yesterday.', 'I played football yesterday.'], e: '"Habe gespielt" (past) → "played" (regular).' },
    { q: 'Correct: "She studyed for the test last night."', a: ['She studied for the test last night.', 'She studied for the test last night.'], e: 'Consonant + y → -ied: "studied".' },
    { q: 'Translate: "Wir haben letztes Wochenende unsere Großeltern besucht."', a: ['We visited our grandparents last weekend.', 'We visited our grandparents last weekend.'], e: '"Haben besucht" → "visited" (regular past).' },
    { q: 'Correct: "He stoped at the red light."', a: ['He stopped at the red light.', 'He stopped at the red light.'], e: 'Short vowel + p → double consonant: "stopped".' },
    { q: 'Rewrite in past: "They dance at the party."', a: ['They danced at the party.', 'They danced at the party.'], e: 'Dance + -d = danced (verb ending in -e).' },
    { q: 'Translate: "Sie hat die ganze Schokolade gegessen." (use past simple)', a: ['She ate all the chocolate.', 'She ate all the chocolate.'], e: '"Eat" → "ate" (irregular past — review unit 14 for irregulars).' },
    { q: 'Correct: "We watch a great film last night."', a: ['We watched a great film last night.', 'We watched a great film last night.'], e: '"Watch" + -ed = "watched".' },
    { q: 'Translate: "Das Konzert begann um 20 Uhr." (use started)', a: ['The concert started at 8 pm.', 'The concert started at 8 pm.'], e: '"Begannte" → "started" (regular past).' },
    { q: 'Correct: "She carryed the heavy box upstairs."', a: ['She carried the heavy box upstairs.', 'She carried the heavy box upstairs.'], e: 'Consonant + y → -ied: "carried".' },
    { q: 'Rewrite with "last night": "I watch TV."', a: ['I watched TV last night.', 'I watched TV last night.'], e: 'Add -ed: "watched" + "last night".' },
    { q: 'Translate: "Mein Bruder hat sein Zimmer aufgeräumt."', a: ['My brother cleaned his room.', 'My brother tidied his room.', 'My brother cleaned up his room.'], e: '"Aufgeräumt" → "cleaned/tidied" (regular past).' },
    { q: 'Correct: "They visited their grandparents and then they play in the park."', a: ['They visited their grandparents and then they played in the park.', 'They visited their grandparents and then played in the park.'], e: 'Both verbs in past: "visited" and "played".' },
    { q: 'Write 3 things you did yesterday (use regular verbs):', a: ['I walked to school. I watched TV. I played with my friend.', 'I studied English. I cooked dinner. I listened to music.'], e: 'Regular past: verb + -ed / -d / -ied.' },
    { q: 'Translate: "Hast du deine Hausaufgaben gemacht?" ("Did you...")', a: ['Did you do your homework?', 'Did you do your homework?'], e: 'Past question: "Did you + base verb?"' },
    { q: 'Correct: "We didn\'t watched the movie."', a: ["We didn't watch the movie.", 'We did not watch the movie.'], e: 'After "didn\'t", use base verb "watch".' }
  ]
  
  // Unit 14
  shared[14] = [
    { q: 'Translate: "Ich bin gestern nicht zur Schule gegangen."', a: ["I didn't go to school yesterday.", 'I did not go to school yesterday.'], e: '"Ich bin nicht gegangen" → "I didn\'t go".' },
    { q: 'Correct: "She didn\'t went to the party."', a: ["She didn't go to the party.", 'She did not go to the party.'], e: 'After "didn\'t", use base verb "go" (not "went").' },
    { q: 'Translate: "Er hat einen neuen Computer gekauft."', a: ['He bought a new computer.', 'He bought a new computer.'], e: '"Hat gekauft" → "bought" (irregular past of "buy").' },
    { q: 'Correct: "I drinked a lot of water yesterday."', a: ['I drank a lot of water yesterday.', 'I drank a lot of water yesterday.'], e: '"Drink" → "drank" (irregular, not "drinked").' },
    { q: 'Translate: "Wir haben sie letzte Woche gesehen."', a: ['We saw her last week.', 'We saw her last week.'], e: '"Haben gesehen" → "saw" (irregular past of "see").' },
    { q: 'Correct: "He didn\'t knew the answer."', a: ["He didn't know the answer.", 'He did not know the answer.'], e: 'After "didn\'t", use base verb "know".' },
    { q: 'Translate: "Sie hat einen Kuchen für mich gemacht."', a: ['She made a cake for me.', 'She made a cake for me.'], e: '"Hat gemacht" → "made" (irregular past of "make").' },
    { q: 'Correct: "They didn\'t went to the beach."', a: ["They didn't go to the beach.", 'They did not go to the beach.'], e: 'After "didn\'t", use base verb "go".' },
    { q: 'Rewrite in negative: "He found his keys."', a: ["He didn't find his keys.", 'He did not find his keys.'], e: '"Didn\'t" + base verb "find".' },
    { q: 'Translate: "Ich habe einen Brief geschrieben."', a: ['I wrote a letter.', 'I wrote a letter.'], e: '"Habe geschrieben" → "wrote" (irregular past of "write").' },
    { q: 'Correct: "Yesterday I goed to the park."', a: ['Yesterday I went to the park.', 'Yesterday I went to the park.'], e: '"Go" → "went" (irregular, not "goed").' },
    { q: 'Translate: "Hast du das Fenster geöffnet?" ("Did you...")', a: ['Did you open the window?', 'Did you open the window?'], e: 'Past question: "Did you + open" (base verb).' },
    { q: 'Correct: "She didn\'t ate her breakfast."', a: ["She didn't eat her breakfast.", 'She did not eat her breakfast.'], e: 'After "didn\'t", use base verb "eat" (not "ate").' },
    { q: 'Rewrite in past: "I eat an apple and drink water."', a: ['I ate an apple and drank water.', 'I ate an apple and drank water.'], e: '"Eat" → "ate", "drink" → "drank" (both irregular).' },
    { q: 'Write 2 things you did and 2 you didn\'t do yesterday:', a: ['I went to school and played football. I didn\'t watch TV and I didn\'t eat pizza.', 'I did my homework and read a book. I didn\'t go to the park and I didn\'t buy anything.'], e: 'Use irregular past for some verbs.' }
  ]
  
  // Unit 15
  shared[15] = [
    { q: 'Translate: "Ich werde morgen meine Oma besuchen."', a: ['I am going to visit my grandma tomorrow.', 'I am going to visit my grandmother tomorrow.'], e: '"Ich werde besuchen" (intention) → "I am going to visit".' },
    { q: 'Correct: "She is going to playing tennis tomorrow."', a: ['She is going to play tennis tomorrow.', 'She is going to play tennis tomorrow.'], e: 'After "going to", use base verb: "play" (not "playing").' },
    { q: 'Translate: "Wir werden nächstes Jahr nach Italien reisen."', a: ['We are going to travel to Italy next year.', 'We are going to Italy next year.'], e: '"Wir werden reisen" → "We are going to travel".' },
    { q: 'Correct: "He aren\'t going to study tonight."', a: ["He isn't going to study tonight.", 'He is not going to study tonight.'], e: '"He" → "isn\'t going to".' },
    { q: 'Translate: "Wirst du dieses Wochenende lernen?"', a: ['Are you going to study this weekend?', 'Are you going to learn this weekend?'], e: '"Wirst du" (intention) → "Are you going to".' },
    { q: 'Correct: "They is going to buy a new house."', a: ['They are going to buy a new house.', 'They are going to buy a new house.'], e: '"They" → "are going to".' },
    { q: 'Rewrite: "I will visit you tomorrow." (use going to)', a: ['I am going to visit you tomorrow.', 'I am going to visit you tomorrow.'], e: '"Will" → "am going to" for planned intentions.' },
    { q: 'Translate: "Er wird Arzt, wenn er groß ist."', a: ['He is going to be a doctor when he grows up.', 'He is going to become a doctor when he grows up.'], e: '"Wird" (future intention) → "is going to be".' },
    { q: 'Correct: "We aren\'t going to not have a party."', a: ["We aren't going to have a party.", 'We are not going to have a party.'], e: 'Remove double negative: "We aren\'t going to have a party."' },
    { q: 'Translate: "Was wirst du nach der Schule machen?"', a: ['What are you going to do after school?', 'What are you going to do after school?'], e: '"Was wirst du machen" (future intention) → "What are you going to do".' },
    { q: 'Correct: "I going to watch a film tonight."', a: ['I am going to watch a film tonight.', "I'm going to watch a film tonight."], e: 'Missing "am": "I am going to watch".' },
    { q: 'Translate: "Meine Schwester wird nächstes Jahr studieren."', a: ['My sister is going to study next year.', 'My sister is going to study next year.'], e: '"Wird studieren" → "is going to study".' },
    { q: 'Correct: "She is going to buys a new dress."', a: ['She is going to buy a new dress.', 'She is going to buy a new dress.'], e: 'After "going to", use base verb "buy".' },
    { q: 'Write 3 plans you have for next weekend:', a: ['I am going to visit my grandma. I am going to play football. I am going to study English.', 'I am going to watch a movie. I am going to meet my friends. I am going to clean my room.'], e: 'Use "am/is/are going to + verb" for plans.' },
    { q: 'Translate: "Ich werde nicht fernsehen, weil ich lernen muss."', a: ["I am not going to watch TV because I have to study.", "I am not going to watch TV because I must study."], e: '"Ich werde nicht" → "I am not going to", "weil" → "because".' }
  ]

  const data = shared[u]
  if (!data) return []
  return data.map(d => ({
    question: d.q, correctAnswers: d.a, explanation: d.e
  }))
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
    const {
      answers,
      level: rawLevel,
    } = req.body as { answers?: unknown[]; level?: 'explorer' | 'pioneer' | 'master' }
    const userId = req.user!.userId

    if (!rawLevel || !['explorer', 'pioneer', 'master'].includes(rawLevel)) {
       res.status(400).json({ error: 'Invalid level' })
       return
    }
    const level = rawLevel
    const answerList = Array.isArray(answers) ? answers : []

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
        const correct = Number(answerList[idx]) === q.correctIndex
        evaluation.push(correct)
        if (!correct) isCorrect = false
      })
    } else if (level === 'pioneer') {
      const questions = topic.pioneer
      questions.forEach((q, idx) => {
        const correct =
          String(answerList[idx] || '').trim().toLowerCase() === q.correctAnswer.toLowerCase()
        evaluation.push(correct)
        if (!correct) isCorrect = false
      })
    } else if (level === 'master') {
      const questions = topic.master
      questions.forEach((q, idx) => {
        const input = String(answerList[idx] || '').trim().toLowerCase()
        const match = q.correctAnswers.some(ans => ans.toLowerCase() === input)
        evaluation.push(match)
        if (!match) isCorrect = false
      })
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
          const { addXp } = require('../services/gamification')
          await addXp(userId, 25) // 25 XP per level
        } catch (_e) {
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
    // Simulate analyzing wrong answers or difficulty, generating 20 tailored questions
    const generatedQuestions = [
      {
        question: `Which sentence correctly applies ${topic.title}?`,
        options: ['Correct example (Right)', 'Wrong example', 'Also wrong'],
        correctIndex: 0,
        explanation: `The correct application of ${topic.title} follows the grammar rule precisely.`
      },
      {
        question: `What is the most common mistake students make with ${topic.title}?`,
        options: ['Using wrong verb form', 'Incorrect word order (Correct perception)', 'Wrong preposition'],
        correctIndex: 1,
        explanation: 'Students often confuse the word order in this grammar area.'
      },
      {
        question: `Identify the error in this sentence related to ${topic.title}:`,
        options: ['The sentence is correct', 'There is a grammar mistake (Correct)', 'The spelling is wrong'],
        correctIndex: 1,
        explanation: 'Carefully check the grammar rule you have learned.'
      },
      {
        question: `How do you form the negative in ${topic.title}?`,
        options: ['Add "not" after the verb (Correct)', 'Add "no" before the verb', 'Use "don\'t" always'],
        correctIndex: 0,
        explanation: 'Negation rules depend on the specific grammar structure.'
      },
      {
        question: `Complete this sentence using ${topic.title}: "She ___ to school every day."`,
        options: ['go', 'goes (Correct)', 'going'],
        correctIndex: 1,
        explanation: 'Third person singular requires the -s ending in Present Simple.'
      },
      {
        question: `True or False: In ${topic.title}, the word order changes for questions.`,
        options: ['True (Correct)', 'False'],
        correctIndex: 0,
        explanation: 'Many grammar topics require subject-verb inversion in questions.'
      },
      {
        question: `Which time expression best matches ${topic.title}?`,
        options: ['yesterday', 'every day (Correct)', 'now'],
        correctIndex: 1,
        explanation: 'Signal words help identify the correct grammar tense.'
      },
      {
        question: `Choose the correct translation related to ${topic.title}:`,
        options: ['Correct translation (Right)', 'Wrong translation', 'Partly correct'],
        correctIndex: 0,
        explanation: 'Translation accuracy depends on understanding the grammar rule.'
      },
      {
        question: `What is the correct pronoun to use with ${topic.title}?`,
        options: ['Correct pronoun (Right)', 'Wrong pronoun', 'Not a pronoun'],
        correctIndex: 0,
        explanation: 'Pronouns must agree with the subject in person and number.'
      },
      {
        question: `How many different forms does the verb take in ${topic.title}?`,
        options: ['One form', 'Two forms (Correct)', 'Three forms'],
        correctIndex: 1,
        explanation: 'Understanding verb forms is key to mastering this topic.'
      },
      {
        question: `Which of these sentences has the correct word order for ${topic.title}?`,
        options: ['Correct order (Right)', 'Incorrect order', 'Another incorrect order'],
        correctIndex: 0,
        explanation: 'Word order follows specific patterns in English grammar.'
      },
      {
        question: `What auxiliary verb is used in questions for ${topic.title}?`,
        options: ['Correct auxiliary (Right)', 'Wrong auxiliary', 'No auxiliary needed'],
        correctIndex: 0,
        explanation: 'Auxiliary verbs help form questions and negatives.'
      },
      {
        question: `Complete: "They ___ not ready for the ${topic.title.toLowerCase()} exercise."`,
        options: ['are (Correct)', 'is', 'am'],
        correctIndex: 0,
        explanation: 'Plural subjects require "are" with the verb "to be".'
      },
      {
        question: `Which of these is a signal word for ${topic.title}?`,
        options: ['Correct signal word (Right)', 'Wrong signal word', 'Not a time expression'],
        correctIndex: 0,
        explanation: 'Signal words help identify which grammar tense or structure to use.'
      },
      {
        question: `What is the biggest challenge when learning ${topic.title}?`,
        options: ['Remembering the rules (Fair)', 'Using it in speaking (Correct insight)', 'Spelling'],
        correctIndex: 1,
        explanation: 'Applying grammar in real conversation is often the hardest part.'
      },
      {
        question: `Choose the sentence with the correct spelling related to ${topic.title}:`,
        options: ['Correct spelling (Right)', 'Wrong spelling', 'Another wrong spelling'],
        correctIndex: 0,
        explanation: 'Spelling changes are important in English grammar (e.g., adding -es/-ies).'
      },
      {
        question: `How would you explain ${topic.title} to a friend in one sentence?`,
        options: ['Clear explanation (Correct)', 'Confusing explanation', 'Wrong explanation'],
        correctIndex: 0,
        explanation: 'Being able to explain a rule shows you truly understand it.'
      },
      {
        question: `Which short answer is correct for a question about ${topic.title}?`,
        options: ['Correct short answer (Right)', 'Wrong short answer', 'Grammatically incorrect'],
        correctIndex: 0,
        explanation: 'Short answers use the auxiliary verb from the question.'
      },
      {
        question: `What comes after the verb in ${topic.title}?`,
        options: ['The object (Correct)', 'The subject', 'Another verb'],
        correctIndex: 0,
        explanation: 'Standard English word order is Subject + Verb + Object.'
      },
      {
        question: `Final Challenge: Which mix of words creates a correct sentence using ${topic.title}?`,
        options: ['Correct sentence (Right)', 'Mixed up sentence', 'Wrong combination'],
        correctIndex: 0,
        explanation: `You have mastered the key concepts of ${topic.title}. Great job!`
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
    const { answers } = req.body as { answers?: unknown[] } // array of 10 answers
    const userId = req.user!.userId

    const progress = readProgress()
    const userProgress = progress[userId]
    if (!userProgress || !userProgress.quizzes || !userProgress.quizzes[topicId]) {
       res.status(404).json({ error: 'Quiz not generated or not found' })
       return
    }

    const quiz = userProgress.quizzes[topicId]
    const answerList = Array.isArray(answers) ? answers : []
    let correctCount = 0
    const evaluation = quiz.questions.map((q: QuizQuestion, idx: number) => {
      const correct = Number(answerList[idx]) === q.correctIndex
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
    quiz.userAnswers = answerList
    quiz.grade = grade

    // Award XP for completing finisher quiz
    try {
      const { addXp } = require('../services/gamification')
      await addXp(userId, 50) // 50 XP for Finisher Quiz
    } catch (_e) {
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
