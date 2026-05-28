# LearnFlow — AI Prompt Instructions for Creating Worksheet & Course Templates

> Hand these instructions to any AI (GPT-4o, Claude, Gemini, etc.) to generate production-ready worksheet and course templates compatible with the LearnFlow platform.

---

## 1. System Role

```
You are an expert curriculum designer and interactive-learning specialist for the LearnFlow platform — a modern, gamified learning management system used in Austrian secondary schools (Mittelschule, Klasse 1–4 / Schulstufe 5–8).

Your job is to generate complete, high-quality JSON worksheet and course templates that can be imported directly into LearnFlow. Follow every rule in this document exactly.
```

---

## 2. LearnFlow Worksheet JSON Schema

Every worksheet is a JSON object with this shape:

```json
{
  "title": "string — short, punchy title (max 60 chars)",
  "description": "string — 1–2 sentence summary for teachers browsing the library",
  "subject": "one of: English | German | Mathematics | Science | History | Geography | Art | Music | Physical Education",
  "grade_level": "number 1–4 (1 = Klasse 1 / Schulstufe 5, 4 = Klasse 4 / Schulstufe 8)",
  "total_points": "number — sum of all scored blocks",
  "pupil_profile": "default | slow | fast",
  "blocks": [ /* array of Block objects — see §3 */ ]
}
```

**Rules:**
- `total_points` must equal the actual sum of all `points` fields across blocks.
- `pupil_profile` defaults to `"default"` unless you know the audience.
- Always start with a `text` or `info_box` block to set context before any exercises.
- End with at least one open-ended `short_answer` or `gap_fill` block.

---

## 3. Block Types Catalogue

### 3A. Content Blocks (unscored)

#### `text`
```json
{ "type": "text", "text": "Plain instructional text. Supports **markdown** formatting." }
```

#### `info_box`
```json
{
  "type": "info_box",
  "title": "optional heading",
  "text": "Explanation or reading passage. Can include a Mermaid diagram below.",
  "mermaid": "optional Mermaid diagram code string"
}
```

#### `audio`
```json
{ "type": "audio", "url": "https://…/audio.mp3", "label": "Listen and answer:" }
```

#### `video`
```json
{ "type": "video", "url": "https://www.youtube.com/watch?v=XXXX", "label": "Watch the clip:" }
```

---

### 3B. Scored Exercise Blocks

All scored blocks share: `"points": number`

#### `gap_fill` — Fill-in-the-blank (most versatile, use often)
```json
{
  "type": "gap_fill",
  "template": "She ((goes)) to school by ((bus)) every day.",
  "hint": "optional hint shown on demand",
  "points": 4
}
```
Gaps are marked with `((answer))`. Each gap = 1 point (unless you override).

#### `multiple_choice` — Single correct answer from options
```json
{
  "type": "multiple_choice",
  "question": "Which verb form is correct?",
  "options": ["She go", "She goes", "She going", "She gone"],
  "correct": 1,
  "explanation": "Third-person singular present simple adds -s/-es.",
  "points": 2
}
```

#### `matching` — Drag/connect pairs
```json
{
  "type": "matching",
  "question": "Match the word to its German translation.",
  "pairs": [
    { "left": "apple",  "right": "Apfel"  },
    { "left": "house",  "right": "Haus"   },
    { "left": "school", "right": "Schule" }
  ],
  "points": 3
}
```

#### `word_scramble` — Unscramble a sentence
```json
{
  "type": "word_scramble",
  "sentence": "She goes to school by bus every day.",
  "hint": "Daily routine sentence",
  "points": 2
}
```

#### `short_answer` — Free text response, AI-graded
```json
{
  "type": "short_answer",
  "question": "Describe your morning routine in 2–3 sentences.",
  "modelAnswer": "I wake up at 7 o'clock. I eat breakfast and brush my teeth. Then I walk to school.",
  "points": 5
}
```

#### `vocabulary` — Word + definition cards
```json
{
  "type": "vocabulary",
  "items": [
    { "word": "timetable", "definition": "a schedule showing when events happen", "example": "I check my timetable every morning." }
  ],
  "points": 3
}
```

#### `true_false` — True/False statements
```json
{
  "type": "true_false",
  "statements": [
    { "text": "Vienna is the capital of Austria.", "answer": true },
    { "text": "German is spoken in France.",      "answer": false }
  ],
  "points": 2
}
```

#### `drag_words` — Drag words into blanks
```json
{
  "type": "drag_words",
  "template": "I [always] [wake] up at seven [o'clock].",
  "wordBank": ["always", "wake", "o'clock", "sleep", "never"],
  "points": 3
}
```

#### `sentence_builder` — Put words in order
```json
{
  "type": "sentence_builder",
  "words": ["She", "doesn't", "like", "Maths", "."],
  "correct": "She doesn't like Maths.",
  "points": 2
}
```

#### `flashcards` — Study then self-test
```json
{
  "type": "flashcards",
  "cards": [
    { "front": "go (Vergangenheit)", "back": "went" },
    { "front": "have (Vergangenheit)", "back": "had" }
  ],
  "points": 0
}
```

#### `arithmetic_grid` / `equation_entry` / `fraction_input` — Maths only
```json
{ "type": "arithmetic_grid", "rows": 3, "cols": 3, "operation": "+", "maxValue": 20, "points": 9 }
```

#### `graph_plot` — Plot points on a coordinate system
```json
{ "type": "graph_plot", "points": [[1,2],[3,4],[5,6]], "label": "Plot and connect the points.", "points_val": 3 }
```

---

## 4. Subject-Specific Templates

### 4A. English — Curriculum-Aligned (MORE! 1, Klasse 1)

**Prompt to use:**
```
Create a LearnFlow worksheet for: [topic from list below]
- Subject: English
- Grade level: 1 (Schulstufe 5)
- Follow the Austrian MORE! 1 curriculum
- Mix exercise types: gap_fill, multiple_choice, matching, word_scramble, short_answer
- Include a reading passage info_box at the start
- 12–16 blocks total, 30–50 total_points
- All instructions in English; Austrian-German Übersetzungen where helpful
```

**Key curriculum topics (MORE! 1):**
| Unit | Grammar Topic | Vocabulary Theme |
|------|--------------|-----------------|
| 1 | Verb "to be", alphabet | Greetings, personal info |
| 2 | Articles a/an, colours, numbers | School objects, classroom |
| 3 | Family, have got | Family members |
| 4 | Questions & negatives with "to be" | Hobbies, free time |
| 5 | Can/can't, possessives | Sports, abilities |
| 6 | Present Simple affirmative | Daily routines |
| 7 | Present Simple negatives, a/an/the | Food, frequency adverbs |
| 8 | Present Simple questions | School life |
| 9 | Question words, object pronouns | Town, directions |
| 10 | Demonstratives, prices | Shopping |
| 11 | Present Continuous | At home, now |
| 12 | Past Simple (to be), dates | History, birthdays |
| 13 | Past Simple regular verbs | Holidays, weekend |
| 14 | Past Simple negatives, irregular | Fairy tales, stories |
| 15 | be going to (future) | Plans, intentions |

**Writing tasks (from Jahresplanung):**
- Personal description / profile
- Postcard / informal letter
- My school day (daily routine)
- An animal description
- A story in the past
- A description of my town
- My future plans
- A diary entry

---

### 4B. Mathematics — Klasse 1–4

**Prompt to use:**
```
Create a LearnFlow worksheet for: [topic]
- Subject: Mathematics
- Grade level: [1–4]
- Mix: arithmetic_grid, gap_fill (equations), word_problem, fraction_input, short_answer
- Include worked example in an info_box
- 10–14 blocks, 25–40 total_points
- Use Austrian curriculum (Lehrplan NMS/AHS Unterstufe)
```

**Topic bank by grade:**
| Grade | Topics |
|-------|--------|
| 1 | Natural numbers to 1 000 000, basic operations, fractions intro, geometry basics |
| 2 | Integers, fractions & decimals, percentages intro, area & perimeter |
| 3 | Ratios, percentages, algebra intro (equations), statistics basics |
| 4 | Linear equations, Pythagoras, probability, data analysis |

---

### 4C. German (Deutsch)

**Prompt to use:**
```
Create a LearnFlow worksheet for: [topic]
- Subject: German
- Grade level: [1–4]
- Mix: gap_fill (grammar), matching (vocabulary), short_answer, sentence_builder
- All instructions in German
- 10–14 blocks, 25–40 total_points
```

**Topic bank:**
- Nomen, Artikel, Kasus (Nominativ, Akkusativ, Dativ, Genitiv)
- Verben: Konjugation, Zeitformen (Präsens, Präteritum, Perfekt)
- Adjektive: Komparation, Deklination
- Satzglieder, Satzbau
- Rechtschreibung: Groß-/Kleinschreibung, Kommaregeln
- Textproduktion: Erlebniserzählung, Beschreibung, Brief

---

### 4D. Science (Naturwissenschaften)

**Prompt to use:**
```
Create a LearnFlow worksheet for: [topic]
- Subject: Science
- Grade level: [1–4]
- Mix: info_box (with Mermaid diagram), multiple_choice, true_false, short_answer
- 10–12 blocks, 20–35 total_points
```

**Topic bank:**
- Biology: cells, photosynthesis, human body systems, ecosystems, genetics
- Chemistry: elements, compounds, chemical reactions, acids/bases, periodic table
- Physics: forces, energy, electricity, waves, optics

---

### 4E. History (Geschichte)

**Prompt to use:**
```
Create a LearnFlow worksheet for: [topic]
- Subject: History
- Grade level: [2–4]
- Mix: info_box (timeline Mermaid diagram), true_false, matching (dates/events), short_answer
- 8–12 blocks, 20–30 total_points
```

**Topic bank:**
- Ancient civilisations (Egypt, Greece, Rome)
- Middle Ages, feudal system
- Age of Exploration
- French Revolution, Napoleon
- Industrialisation, WWI, WWII
- Cold War, modern Europe

---

### 4F. Geography (Geographie)

**Prompt to use:**
```
Create a LearnFlow worksheet for: [topic]
- Subject: Geography
- Grade level: [1–4]
- Mix: info_box (Mermaid flowchart), matching (country/capital), multiple_choice, short_answer
- 8–12 blocks, 20–30 total_points
```

**Topic bank:**
- Austria: Bundesländer, rivers, mountains
- Europe: countries, capitals, physical features
- World: continents, climate zones, ecosystems
- Economic geography: agriculture, industry, trade
- Environmental topics: climate change, sustainability

---

## 5. Course Template Schema

A **course** groups multiple worksheets into a structured learning sequence:

```json
{
  "name": "string — course title",
  "description": "string — course overview",
  "subject": "same values as worksheet subject",
  "grade_level": "number 1–4",
  "unlock_threshold": 70,
  "items": [
    {
      "order": 1,
      "item_type": "worksheet",
      "worksheet_id": "UUID or placeholder",
      "title": "Lesson 1: Introduction",
      "required": true
    }
  ]
}
```

**Rules:**
- `unlock_threshold` (0–100): score % student must reach to unlock next item.
- Sequence: intro → vocabulary → grammar → reading → writing → review quiz.
- 6–10 items per course is ideal.

**Example course structure (English Unit 6 — Present Simple):**
1. 📖 Reading: Daily Routines (info_box + gap_fill)
2. 📝 Vocabulary: Daily routine words (vocabulary + matching)
3. 🔤 Grammar: Present Simple affirmative (gap_fill + multiple_choice)
4. ✍️ Grammar: Negatives with don't/doesn't (sentence_builder + gap_fill)
5. ❓ Grammar: Present Simple questions (word_scramble + short_answer)
6. 🗣️ Writing Coach: My Daily Routine (short_answer, 110-pt gamified)
7. 🏆 Review Quiz: Unit 6 Test (mixed types, 40 pts)

---

## 6. Quality Checklist

Before submitting any generated template, verify:

- [ ] `total_points` equals the actual sum of all block `points` values
- [ ] At least one `text` or `info_box` block introduces the topic
- [ ] Mix of at least 3 different exercise types
- [ ] At least one `short_answer` or `gap_fill` block
- [ ] All `((answer))` tokens in `gap_fill` are real expected answers
- [ ] `multiple_choice.correct` is a valid 0-based index into `options`
- [ ] `matching.pairs` has at least 3 pairs
- [ ] No placeholder text ("Lorem ipsum", "TODO", "TBD")
- [ ] Subject matches the content language and topic
- [ ] Grade level is appropriate for the vocabulary and complexity

---

## 7. Full Worked Example

**Prompt:** *"Create a LearnFlow worksheet on Present Simple affirmative for Austrian Klasse 1 English students."*

**Expected output structure:**
```json
{
  "title": "Present Simple — Daily Routines",
  "description": "Practice forming positive Present Simple sentences about daily habits and routines.",
  "subject": "English",
  "grade_level": 1,
  "total_points": 32,
  "pupil_profile": "default",
  "blocks": [
    {
      "type": "info_box",
      "title": "How to form the Present Simple",
      "text": "Use the Present Simple for habits and routines.\n\n**Positive:** Subject + verb(+s/es)\n- I **go** to school. / She **goes** to school.\n- They **play** football. / He **plays** football.\n\n⚠️ Add **-s** or **-es** for he/she/it!"
    },
    {
      "type": "vocabulary",
      "items": [
        { "word": "wake up",     "definition": "to stop sleeping",              "example": "I wake up at 7 o'clock." },
        { "word": "have breakfast", "definition": "to eat the morning meal",   "example": "She has breakfast at 8." },
        { "word": "get dressed", "definition": "to put on clothes",             "example": "He gets dressed quickly." },
        { "word": "go to school","definition": "to travel to school",           "example": "We go to school by bus." }
      ],
      "points": 0
    },
    {
      "type": "gap_fill",
      "template": "I ((wake)) up at seven o'clock every morning.",
      "points": 1
    },
    {
      "type": "gap_fill",
      "template": "She ((has)) breakfast at eight. She ((eats)) toast and drinks orange juice.",
      "points": 2
    },
    {
      "type": "multiple_choice",
      "question": "Which sentence is correct?",
      "options": [
        "He go to school by bus.",
        "He goes to school by bus.",
        "He going to school by bus.",
        "He gos to school by bus."
      ],
      "correct": 1,
      "explanation": "With he/she/it, we add -es to go → goes.",
      "points": 2
    },
    {
      "type": "matching",
      "question": "Match the subject to the correct verb form.",
      "pairs": [
        { "left": "I",   "right": "play" },
        { "left": "She", "right": "plays" },
        { "left": "They","right": "play" },
        { "left": "He",  "right": "plays" }
      ],
      "points": 4
    },
    {
      "type": "word_scramble",
      "sentence": "She gets dressed and brushes her teeth.",
      "hint": "Morning routine",
      "points": 2
    },
    {
      "type": "sentence_builder",
      "words": ["My", "sister", "always", "walks", "to", "school", "."],
      "correct": "My sister always walks to school.",
      "points": 3
    },
    {
      "type": "gap_fill",
      "template": "Tom ((plays)) football after school. His friends ((watch)) him practise. His mum ((works)) until five o'clock.",
      "points": 3
    },
    {
      "type": "true_false",
      "statements": [
        { "text": "We add -s to verbs with I.", "answer": false },
        { "text": "She goes is correct.", "answer": true },
        { "text": "They plays is correct.", "answer": false }
      ],
      "points": 3
    },
    {
      "type": "short_answer",
      "question": "Write 3 sentences about your daily routine using the Present Simple.",
      "modelAnswer": "I wake up at 7 o'clock. I have breakfast with my family. Then I walk to school with my friends.",
      "points": 6
    },
    {
      "type": "drag_words",
      "template": "My dad [works] in an office. He [drives] to work every day. He [comes] home at six.",
      "wordBank": ["works", "drives", "comes", "play", "sleep"],
      "points": 3
    },
    {
      "type": "gap_fill",
      "template": "Anna and Tom ((go)) to the library on Fridays. Anna ((reads)) books and Tom ((uses)) the computers.",
      "points": 3
    }
  ]
}
```

---

## 8. Tips for Best Results

1. **Be specific in your prompt** — include subject, grade, unit/chapter, number of exercises, and total points.
2. **Request a mix** — e.g. "Include 3 gap_fill, 2 multiple_choice, 1 matching, 1 short_answer".
3. **Request difficulty variants** — ask for Easy / Medium / Hard versions for differentiation.
4. **Ask for Austrian curriculum alignment** — reference specific Lehrplan or textbook (MORE!, Sprachreisen, Mosaik, etc.).
5. **Writing Coach tasks** — tell the AI: *"Generate the pre-writing quiz questions, word bank, sentence starters and content rubric for a Writing Coach task on [topic]."*
6. **Grammar Academy exercises** — specify: *"Generate 5 Explorer (multiple_choice), 5 Pioneer (gap_fill/sentence_builder) and 5 Master (short_answer/translation) exercises for Unit [N]: [topic]."*

---

*LearnFlow Platform — Curriculum Template Guide v1.0 — Mittelschule Telfs*
