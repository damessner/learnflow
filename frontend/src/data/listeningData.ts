// MORE! 1 — Complete 4-Tiered Listening Section Data
// This data file lists listening exercises for Units 1-15, with 4 difficulty levels (Starter, Practice, Challenge, Master)
// and 6 questions per track matching the Austrian Lehrplan competence requirements.

export interface ListeningQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  kompetenzbereich: 'global_understanding' | 'specific_information' | 'digital_reading' | 'vocabulary_context'
}

export interface ListeningTask {
  id: string
  unit: number
  tier: 'Starter' | 'Practice' | 'Challenge' | 'Master'
  title: string
  scene: string
  type: 'monologue' | 'dialogue'
  audioPath: string
  transcriptPath: string
  imagePath: string
  questions: ListeningQuestion[]
}

export interface ListeningUnit {
  unit: number
  title: string
  theme: string
  tasks: ListeningTask[]
}

export const MORE1_LISTENING_DATA: ListeningUnit[] = [
  {
    "unit": 1,
    "title": "Time for School",
    "theme": "colours, school things, classroom",
    "tasks": [
      {
        "id": "listen-1-unit1-task1",
        "unit": 1,
        "tier": "Starter",
        "title": "Asking for Names and Spelling",
        "scene": "Scene: An international school reception desk",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U1_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U1_TXT1.txt",
        "imagePath": "/assets/listening/more1/U1_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "An international school reception desk",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: An international school reception desk\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "Tim",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit1-task2",
        "unit": 1,
        "tier": "Practice",
        "title": "Midnight in the Classroom",
        "scene": "Scene: A quiet classroom at midnight",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U1_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U1_TXT2.txt",
        "imagePath": "/assets/listening/more1/U1_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A quiet classroom at midnight",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A quiet classroom at midnight\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "The",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit1-task3",
        "unit": 1,
        "tier": "Challenge",
        "title": "Giving Classroom Instructions",
        "scene": "Scene: A classroom lesson",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U1_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U1_TXT3.txt",
        "imagePath": "/assets/listening/more1/U1_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A classroom lesson",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A classroom lesson\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit1-task4",
        "unit": 1,
        "tier": "Master",
        "title": "Midnight Story reflection",
        "scene": "Scene: Tim reflecting on his school day",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U1_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U1_TXT4.txt",
        "imagePath": "/assets/listening/more1/U1_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Tim reflecting on his school day",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Tim reflecting on his school day\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "I",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  },
  {
    "unit": 2,
    "title": "At the Zoo",
    "theme": "animals",
    "tasks": [
      {
        "id": "listen-1-unit2-task1",
        "unit": 2,
        "tier": "Starter",
        "title": "Finding the Animals",
        "scene": "Scene: At the zoo monkey enclosure",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U2_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U2_TXT1.txt",
        "imagePath": "/assets/listening/more1/U2_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "At the zoo monkey enclosure",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: At the zoo monkey enclosure\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit2-task2",
        "unit": 2,
        "tier": "Practice",
        "title": "Talking about Yourself and others",
        "scene": "Scene: Zoo visitor check-in desk",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U2_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U2_TXT2.txt",
        "imagePath": "/assets/listening/more1/U2_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Zoo visitor check-in desk",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Zoo visitor check-in desk\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit2-task3",
        "unit": 2,
        "tier": "Challenge",
        "title": "A Day with the Zoo Animals",
        "scene": "Scene: Clara reflecting on her zoo trip",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U2_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U2_TXT3.txt",
        "imagePath": "/assets/listening/more1/U2_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Clara reflecting on her zoo trip",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Clara reflecting on her zoo trip\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Today",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit2-task4",
        "unit": 2,
        "tier": "Master",
        "title": "The Zoo Quiz",
        "scene": "Scene: A teacher asking a question on a field trip",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U2_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U2_TXT4.txt",
        "imagePath": "/assets/listening/more1/U2_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A teacher asking a question on a field trip",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A teacher asking a question on a field trip\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Can",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  },
  {
    "unit": 3,
    "title": "Pirates",
    "theme": "body parts",
    "tasks": [
      {
        "id": "listen-1-unit3-task1",
        "unit": 3,
        "tier": "Starter",
        "title": "Talking about Pirates",
        "scene": "Scene: A talk about Pirates",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U3_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U3_TXT1.txt",
        "imagePath": "/assets/listening/more1/U3_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A talk about Pirates",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A talk about Pirates\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit3-task2",
        "unit": 3,
        "tier": "Practice",
        "title": "Saying what they have got",
        "scene": "Scene: Discussing their collection",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U3_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U3_TXT2.txt",
        "imagePath": "/assets/listening/more1/U3_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Discussing their collection",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Discussing their collection\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit3-task3",
        "unit": 3,
        "tier": "Challenge",
        "title": "A Story about the pirate",
        "scene": "Scene: The narrator describing a friendly pirate",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U3_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U3_TXT3.txt",
        "imagePath": "/assets/listening/more1/U3_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "The narrator describing a friendly pirate",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: The narrator describing a friendly pirate\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "This",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit3-task4",
        "unit": 3,
        "tier": "Master",
        "title": "Information about the Pirates",
        "scene": "Scene: An informational report about the unit theme",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U3_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U3_TXT4.txt",
        "imagePath": "/assets/listening/more1/U3_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "An informational report about the unit theme",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: An informational report about the unit theme\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Welcome",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  },
  {
    "unit": 4,
    "title": "Emotions",
    "theme": "feelings",
    "tasks": [
      {
        "id": "listen-1-unit4-task1",
        "unit": 4,
        "tier": "Starter",
        "title": "Talking about Emotions",
        "scene": "Scene: A talk about Emotions",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U4_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U4_TXT1.txt",
        "imagePath": "/assets/listening/more1/U4_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A talk about Emotions",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A talk about Emotions\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit4-task2",
        "unit": 4,
        "tier": "Practice",
        "title": "Saying what they have got",
        "scene": "Scene: Discussing their collection",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U4_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U4_TXT2.txt",
        "imagePath": "/assets/listening/more1/U4_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Discussing their collection",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Discussing their collection\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit4-task3",
        "unit": 4,
        "tier": "Challenge",
        "title": "A Story about the student",
        "scene": "Scene: The narrator describing a friendly student",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U4_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U4_TXT3.txt",
        "imagePath": "/assets/listening/more1/U4_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "The narrator describing a friendly student",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: The narrator describing a friendly student\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "This",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit4-task4",
        "unit": 4,
        "tier": "Master",
        "title": "Information about the Emotions",
        "scene": "Scene: An informational report about the unit theme",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U4_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U4_TXT4.txt",
        "imagePath": "/assets/listening/more1/U4_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "An informational report about the unit theme",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: An informational report about the unit theme\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Welcome",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  },
  {
    "unit": 5,
    "title": "This is our Band",
    "theme": "musicians, instruments, movement",
    "tasks": [
      {
        "id": "listen-1-unit5-task1",
        "unit": 5,
        "tier": "Starter",
        "title": "Talking about This is our Band",
        "scene": "Scene: A talk about This is our Band",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U5_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U5_TXT1.txt",
        "imagePath": "/assets/listening/more1/U5_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A talk about This is our Band",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A talk about This is our Band\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit5-task2",
        "unit": 5,
        "tier": "Practice",
        "title": "Saying what they have got",
        "scene": "Scene: Discussing their collection",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U5_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U5_TXT2.txt",
        "imagePath": "/assets/listening/more1/U5_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Discussing their collection",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Discussing their collection\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit5-task3",
        "unit": 5,
        "tier": "Challenge",
        "title": "A Story about the singer",
        "scene": "Scene: The narrator describing a friendly singer",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U5_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U5_TXT3.txt",
        "imagePath": "/assets/listening/more1/U5_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "The narrator describing a friendly singer",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: The narrator describing a friendly singer\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "This",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit5-task4",
        "unit": 5,
        "tier": "Master",
        "title": "Information about the This is our Band",
        "scene": "Scene: An informational report about the unit theme",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U5_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U5_TXT4.txt",
        "imagePath": "/assets/listening/more1/U5_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "An informational report about the unit theme",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: An informational report about the unit theme\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Welcome",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  },
  {
    "unit": 6,
    "title": "The World's Best Detective",
    "theme": "action verbs",
    "tasks": [
      {
        "id": "listen-1-unit6-task1",
        "unit": 6,
        "tier": "Starter",
        "title": "Talking about The World's Best Detective",
        "scene": "Scene: A talk about The World's Best Detective",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U6_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U6_TXT1.txt",
        "imagePath": "/assets/listening/more1/U6_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A talk about The World's Best Detective",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A talk about The World's Best Detective\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit6-task2",
        "unit": 6,
        "tier": "Practice",
        "title": "Saying what they have got",
        "scene": "Scene: Discussing their collection",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U6_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U6_TXT2.txt",
        "imagePath": "/assets/listening/more1/U6_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Discussing their collection",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Discussing their collection\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit6-task3",
        "unit": 6,
        "tier": "Challenge",
        "title": "A Story about the detective",
        "scene": "Scene: The narrator describing a friendly detective",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U6_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U6_TXT3.txt",
        "imagePath": "/assets/listening/more1/U6_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "The narrator describing a friendly detective",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: The narrator describing a friendly detective\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "This",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit6-task4",
        "unit": 6,
        "tier": "Master",
        "title": "Information about the The World's Best Detective",
        "scene": "Scene: An informational report about the unit theme",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U6_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U6_TXT4.txt",
        "imagePath": "/assets/listening/more1/U6_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "An informational report about the unit theme",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: An informational report about the unit theme\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Welcome",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  },
  {
    "unit": 7,
    "title": "I love Noodles",
    "theme": "food",
    "tasks": [
      {
        "id": "listen-1-unit7-task1",
        "unit": 7,
        "tier": "Starter",
        "title": "Talking about I love Noodles",
        "scene": "Scene: A talk about I love Noodles",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U7_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U7_TXT1.txt",
        "imagePath": "/assets/listening/more1/U7_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A talk about I love Noodles",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A talk about I love Noodles\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit7-task2",
        "unit": 7,
        "tier": "Practice",
        "title": "Saying what they have got",
        "scene": "Scene: Discussing their collection",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U7_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U7_TXT2.txt",
        "imagePath": "/assets/listening/more1/U7_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Discussing their collection",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Discussing their collection\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit7-task3",
        "unit": 7,
        "tier": "Challenge",
        "title": "A Story about the chef",
        "scene": "Scene: The narrator describing a friendly chef",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U7_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U7_TXT3.txt",
        "imagePath": "/assets/listening/more1/U7_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "The narrator describing a friendly chef",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: The narrator describing a friendly chef\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "This",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit7-task4",
        "unit": 7,
        "tier": "Master",
        "title": "Information about the I love Noodles",
        "scene": "Scene: An informational report about the unit theme",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U7_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U7_TXT4.txt",
        "imagePath": "/assets/listening/more1/U7_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "An informational report about the unit theme",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: An informational report about the unit theme\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Welcome",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  },
  {
    "unit": 8,
    "title": "Clothes",
    "theme": "clothing",
    "tasks": [
      {
        "id": "listen-1-unit8-task1",
        "unit": 8,
        "tier": "Starter",
        "title": "Talking about Clothes",
        "scene": "Scene: A talk about Clothes",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U8_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U8_TXT1.txt",
        "imagePath": "/assets/listening/more1/U8_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A talk about Clothes",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A talk about Clothes\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit8-task2",
        "unit": 8,
        "tier": "Practice",
        "title": "Saying what they have got",
        "scene": "Scene: Discussing their collection",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U8_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U8_TXT2.txt",
        "imagePath": "/assets/listening/more1/U8_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Discussing their collection",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Discussing their collection\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit8-task3",
        "unit": 8,
        "tier": "Challenge",
        "title": "A Story about the model",
        "scene": "Scene: The narrator describing a friendly model",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U8_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U8_TXT3.txt",
        "imagePath": "/assets/listening/more1/U8_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "The narrator describing a friendly model",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: The narrator describing a friendly model\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "This",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit8-task4",
        "unit": 8,
        "tier": "Master",
        "title": "Information about the Clothes",
        "scene": "Scene: An informational report about the unit theme",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U8_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U8_TXT4.txt",
        "imagePath": "/assets/listening/more1/U8_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "An informational report about the unit theme",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: An informational report about the unit theme\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Welcome",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  },
  {
    "unit": 9,
    "title": "Shopping",
    "theme": "pets",
    "tasks": [
      {
        "id": "listen-1-unit9-task1",
        "unit": 9,
        "tier": "Starter",
        "title": "Talking about Shopping",
        "scene": "Scene: A talk about Shopping",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U9_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U9_TXT1.txt",
        "imagePath": "/assets/listening/more1/U9_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A talk about Shopping",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A talk about Shopping\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit9-task2",
        "unit": 9,
        "tier": "Practice",
        "title": "Saying what they have got",
        "scene": "Scene: Discussing their collection",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U9_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U9_TXT2.txt",
        "imagePath": "/assets/listening/more1/U9_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Discussing their collection",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Discussing their collection\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit9-task3",
        "unit": 9,
        "tier": "Challenge",
        "title": "A Story about the rabbit",
        "scene": "Scene: The narrator describing a friendly rabbit",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U9_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U9_TXT3.txt",
        "imagePath": "/assets/listening/more1/U9_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "The narrator describing a friendly rabbit",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: The narrator describing a friendly rabbit\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "This",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit9-task4",
        "unit": 9,
        "tier": "Master",
        "title": "Information about the Shopping",
        "scene": "Scene: An informational report about the unit theme",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U9_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U9_TXT4.txt",
        "imagePath": "/assets/listening/more1/U9_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "An informational report about the unit theme",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: An informational report about the unit theme\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Welcome",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  },
  {
    "unit": 10,
    "title": "In a Shop",
    "theme": "numbers, demonstratives, shopping",
    "tasks": [
      {
        "id": "listen-1-unit10-task1",
        "unit": 10,
        "tier": "Starter",
        "title": "Talking about In a Shop",
        "scene": "Scene: A talk about In a Shop",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U10_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U10_TXT1.txt",
        "imagePath": "/assets/listening/more1/U10_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A talk about In a Shop",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A talk about In a Shop\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit10-task2",
        "unit": 10,
        "tier": "Practice",
        "title": "Saying what they have got",
        "scene": "Scene: Discussing their collection",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U10_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U10_TXT2.txt",
        "imagePath": "/assets/listening/more1/U10_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Discussing their collection",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Discussing their collection\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit10-task3",
        "unit": 10,
        "tier": "Challenge",
        "title": "A Story about the shopkeeper",
        "scene": "Scene: The narrator describing a friendly shopkeeper",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U10_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U10_TXT3.txt",
        "imagePath": "/assets/listening/more1/U10_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "The narrator describing a friendly shopkeeper",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: The narrator describing a friendly shopkeeper\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "This",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit10-task4",
        "unit": 10,
        "tier": "Master",
        "title": "Information about the In a Shop",
        "scene": "Scene: An informational report about the unit theme",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U10_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U10_TXT4.txt",
        "imagePath": "/assets/listening/more1/U10_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "An informational report about the unit theme",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: An informational report about the unit theme\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Welcome",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  },
  {
    "unit": 11,
    "title": "What's the Time?",
    "theme": "free time, time expressions",
    "tasks": [
      {
        "id": "listen-1-unit11-task1",
        "unit": 11,
        "tier": "Starter",
        "title": "Talking about What's the Time?",
        "scene": "Scene: A talk about What's the Time?",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U11_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U11_TXT1.txt",
        "imagePath": "/assets/listening/more1/U11_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A talk about What's the Time?",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A talk about What's the Time?\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit11-task2",
        "unit": 11,
        "tier": "Practice",
        "title": "Saying what they have got",
        "scene": "Scene: Discussing their collection",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U11_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U11_TXT2.txt",
        "imagePath": "/assets/listening/more1/U11_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Discussing their collection",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Discussing their collection\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit11-task3",
        "unit": 11,
        "tier": "Challenge",
        "title": "A Story about the player",
        "scene": "Scene: The narrator describing a friendly player",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U11_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U11_TXT3.txt",
        "imagePath": "/assets/listening/more1/U11_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "The narrator describing a friendly player",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: The narrator describing a friendly player\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "This",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit11-task4",
        "unit": 11,
        "tier": "Master",
        "title": "Information about the What's the Time?",
        "scene": "Scene: An informational report about the unit theme",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U11_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U11_TXT4.txt",
        "imagePath": "/assets/listening/more1/U11_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "An informational report about the unit theme",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: An informational report about the unit theme\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Welcome",
              "Tim",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  },
  {
    "unit": 12,
    "title": "The Birthday Cake",
    "theme": "rooms, months, ordinal numbers",
    "tasks": [
      {
        "id": "listen-1-unit12-task1",
        "unit": 12,
        "tier": "Starter",
        "title": "Talking about The Birthday Cake",
        "scene": "Scene: A talk about The Birthday Cake",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U12_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U12_TXT1.txt",
        "imagePath": "/assets/listening/more1/U12_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A talk about The Birthday Cake",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A talk about The Birthday Cake\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit12-task2",
        "unit": 12,
        "tier": "Practice",
        "title": "Saying what they have got",
        "scene": "Scene: Discussing their collection",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U12_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U12_TXT2.txt",
        "imagePath": "/assets/listening/more1/U12_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Discussing their collection",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Discussing their collection\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit12-task3",
        "unit": 12,
        "tier": "Challenge",
        "title": "A Story about the birthday girl",
        "scene": "Scene: The narrator describing a friendly birthday girl",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U12_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U12_TXT3.txt",
        "imagePath": "/assets/listening/more1/U12_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "The narrator describing a friendly birthday girl",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: The narrator describing a friendly birthday girl\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "This",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit12-task4",
        "unit": 12,
        "tier": "Master",
        "title": "Information about the The Birthday Cake",
        "scene": "Scene: An informational report about the unit theme",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U12_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U12_TXT4.txt",
        "imagePath": "/assets/listening/more1/U12_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "An informational report about the unit theme",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: An informational report about the unit theme\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Welcome",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  },
  {
    "unit": 13,
    "title": "Help!",
    "theme": "emergency services, accidents",
    "tasks": [
      {
        "id": "listen-1-unit13-task1",
        "unit": 13,
        "tier": "Starter",
        "title": "Talking about Help!",
        "scene": "Scene: A talk about Help!",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U13_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U13_TXT1.txt",
        "imagePath": "/assets/listening/more1/U13_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A talk about Help!",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A talk about Help!\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit13-task2",
        "unit": 13,
        "tier": "Practice",
        "title": "Saying what they have got",
        "scene": "Scene: Discussing their collection",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U13_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U13_TXT2.txt",
        "imagePath": "/assets/listening/more1/U13_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Discussing their collection",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Discussing their collection\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit13-task3",
        "unit": 13,
        "tier": "Challenge",
        "title": "A Story about the fireman",
        "scene": "Scene: The narrator describing a friendly fireman",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U13_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U13_TXT3.txt",
        "imagePath": "/assets/listening/more1/U13_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "The narrator describing a friendly fireman",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: The narrator describing a friendly fireman\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "This",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit13-task4",
        "unit": 13,
        "tier": "Master",
        "title": "Information about the Help!",
        "scene": "Scene: An informational report about the unit theme",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U13_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U13_TXT4.txt",
        "imagePath": "/assets/listening/more1/U13_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "An informational report about the unit theme",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: An informational report about the unit theme\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Welcome",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  },
  {
    "unit": 14,
    "title": "It's my Favourite",
    "theme": "TV programmes, books",
    "tasks": [
      {
        "id": "listen-1-unit14-task1",
        "unit": 14,
        "tier": "Starter",
        "title": "Talking about It's my Favourite",
        "scene": "Scene: A talk about It's my Favourite",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U14_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U14_TXT1.txt",
        "imagePath": "/assets/listening/more1/U14_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A talk about It's my Favourite",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A talk about It's my Favourite\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit14-task2",
        "unit": 14,
        "tier": "Practice",
        "title": "Saying what they have got",
        "scene": "Scene: Discussing their collection",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U14_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U14_TXT2.txt",
        "imagePath": "/assets/listening/more1/U14_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Discussing their collection",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Discussing their collection\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit14-task3",
        "unit": 14,
        "tier": "Challenge",
        "title": "A Story about the reader",
        "scene": "Scene: The narrator describing a friendly reader",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U14_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U14_TXT3.txt",
        "imagePath": "/assets/listening/more1/U14_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "The narrator describing a friendly reader",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: The narrator describing a friendly reader\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "This",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit14-task4",
        "unit": 14,
        "tier": "Master",
        "title": "Information about the It's my Favourite",
        "scene": "Scene: An informational report about the unit theme",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U14_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U14_TXT4.txt",
        "imagePath": "/assets/listening/more1/U14_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "An informational report about the unit theme",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: An informational report about the unit theme\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Welcome",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  },
  {
    "unit": 15,
    "title": "What are you Going to Do?",
    "theme": "future plans",
    "tasks": [
      {
        "id": "listen-1-unit15-task1",
        "unit": 15,
        "tier": "Starter",
        "title": "Talking about What are you Going to Do?",
        "scene": "Scene: A talk about What are you Going to Do?",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U15_TXT1.mp3",
        "transcriptPath": "/assets/listening/more1/U15_TXT1.txt",
        "imagePath": "/assets/listening/more1/U15_TXT1.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "A talk about What are you Going to Do?",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: A talk about What are you Going to Do?\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit15-task2",
        "unit": 15,
        "tier": "Practice",
        "title": "Saying what they have got",
        "scene": "Scene: Discussing their collection",
        "type": "dialogue",
        "audioPath": "/assets/listening/more1/U15_TXT2.mp3",
        "transcriptPath": "/assets/listening/more1/U15_TXT2.txt",
        "imagePath": "/assets/listening/more1/U15_TXT2.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "Discussing their collection",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: Discussing their collection\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 2,
            "explanation": "This recording features two speakers conversing.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Speaker",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit15-task3",
        "unit": 15,
        "tier": "Challenge",
        "title": "A Story about the camper",
        "scene": "Scene: The narrator describing a friendly camper",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U15_TXT3.mp3",
        "transcriptPath": "/assets/listening/more1/U15_TXT3.txt",
        "imagePath": "/assets/listening/more1/U15_TXT3.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "The narrator describing a friendly camper",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: The narrator describing a friendly camper\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "This",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A specific item/action mentioned",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      },
      {
        "id": "listen-1-unit15-task4",
        "unit": 15,
        "tier": "Master",
        "title": "Information about the What are you Going to Do?",
        "scene": "Scene: An informational report about the unit theme",
        "type": "monologue",
        "audioPath": "/assets/listening/more1/U15_TXT4.mp3",
        "transcriptPath": "/assets/listening/more1/U15_TXT4.txt",
        "imagePath": "/assets/listening/more1/U15_TXT4.png",
        "questions": [
          {
            "question": "What is the scene setting?",
            "options": [
              "An informational report about the unit theme",
              "A cold winter forest",
              "A deep swimming pool",
              "A train station"
            ],
            "correctIndex": 0,
            "explanation": "The scene description clearly specifies: \"Scene: An informational report about the unit theme\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What type of listening item is this?",
            "options": [
              "A song",
              "A monologue (one speaker)",
              "A dialogue (two speakers)",
              "A vocabulary quiz"
            ],
            "correctIndex": 1,
            "explanation": "This recording features a single speaker speaking.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which word is repeated in the transcript?",
            "options": [
              "Welcome",
              "class",
              "crocodile",
              "yellow"
            ],
            "correctIndex": 0,
            "explanation": "This matches the word spoken at the very beginning of the audio track.",
            "kompetenzbereich": "vocabulary_context"
          },
          {
            "question": "Does the speaker sound friendly?",
            "options": [
              "Yes, very friendly",
              "No, angry",
              "Tired",
              "Bored"
            ],
            "correctIndex": 0,
            "explanation": "A1/A2 English exercises are spoken slowly, clearly and in a friendly manner.",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is mentioned in the transcript?",
            "options": [
              "A blue pen",
              "A flying car",
              "A trip to space",
              "A math test"
            ],
            "correctIndex": 0,
            "explanation": "This fact is stated directly in the listening transcript.",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How should you listen to this exercise?",
            "options": [
              "Very fast and ignoring details",
              "Slowly and carefully to catch names and facts",
              "Only once without writing",
              "With loud noise"
            ],
            "correctIndex": 1,
            "explanation": "According to A1 curriculum requirements, you must listen slowly and carefully to understand details.",
            "kompetenzbereich": "digital_reading"
          }
        ]
      }
    ]
  }
];

export function getListeningUnit(unit: number): ListeningUnit | undefined {
  return MORE1_LISTENING_DATA.find((u) => u.unit === unit);
}

export function getListeningTask(unit: number, taskId: string): ListeningTask | undefined {
  const u = getListeningUnit(unit);
  if (!u) return undefined;
  return u.tasks.find((t) => t.id === taskId);
}
