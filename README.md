# 📚 LearnFlow

**Because every child deserves to feel the joy of "I got it!"** 🎉

> Built with love for Mittelschule Telfs, by a teacher who believes that great tools don't have to be cold and corporate — they can be warm, personal, and alive with the excitement of real learning.

LearnFlow is a full-stack learning platform designed by someone who spends real hours in the classroom. It's what happens when a teacher says: *"What if tech actually helped kids learn better, instead of just grading them faster?"*

Interactive worksheets, AI that *guides* (not cheats), spaced repetition that *remembers* what each student needs, and a dash of gamification to keep the spark alive. 🧠✨

It's self-hosted, runs on modest hardware, works offline as a PWA, and it's completely open source.

---

## ✨ What Makes LearnFlow Different?

| Instead of… | LearnFlow does… |
|---|---|
| ❌ A student getting a grade and moving on | ✅ AI **analyses mistakes**, creates **2 personalised remediation rounds**, tracks **mastery before/after** |
| ❌ Every student doing the same worksheet | ✅ **Interleaved Daily Mix** — subjects shuffle, knowledge sticks |
| ❌ An AI that gives away the answer | ✅ **Socratic Tutor** asks guiding questions; **Protégé Mode** makes *you* the teacher |
| ❌ Cognitive science locked in research papers | ✅ FSRS-5, progressive disclosure, confidence calibration — built right in |
| ❌ Another PDF to file | ✅ Real-time results, **PDF class roster import**, CSV export, printable reports |

---

## ❤️ What's Inside

### For Teachers 👩‍🏫👨‍🏫

| Feature | Why You'll Love It |
|---|---|
| 🧩 **Worksheet Builder** | 22 interactive exercise types — gap fill, matching, word scramble, fraction builder, geometry, graph plotting, and more. Every type is **auto-scored**. |
| 🤖 **AI Generator** | Type what you want in plain language — *"a practice worksheet about fractions with real-world examples for grade 5"* — and get a complete, auto-scored worksheet back. Uses **Gemini**, **OpenCode** (DeepSeek, Claude, GPT — 75+ providers), or **local Ollama**. |
| 📖 **AI Story Generator** | Generate complete German-language reading worksheets: story text, comprehension questions, vocabulary, and grammar exercises — all in one click. |
| 🗂️ **Classes & Courses** | Auto-generated join codes. Sequence worksheets into courses with unlock thresholds. Track progress per student visually. |
| 📈 **Results Dashboard** | Per-assignment scores, class averages, **most-missed blocks**, **A/B remediation metrics**, per-student exercise response drilldown. CSV export included. |
| 📄 **PDF Importer** | Upload your `Namensliste` PDF — student accounts and classes created automatically. Done. |
| 🔬 **Remediation Engine** | When a student gets something wrong, AI generates **up to 2 personalised exercise rounds** with difficulty calibration (hint/scaffold/prerequisite), self-assessment, and mastery tracking. |
| 🔗 **A/B Prompt Testing** | Two instruction styles — *Direct Corrective* vs *Socratic Guided* — randomly assigned. See which works better per student with built-in metrics. |
| 🏫 **Teams Integration** | Push grades straight to Microsoft Teams. |

### For Students 🧑‍🎓👩‍🎓

| Feature | What It Does |
|---|---|
| 🎮 **Interactive Worksheets** | 22 exercise types with **instant auto-scoring** — no waiting for the teacher to hand back a graded stack |
| 🧠 **Socratic Tutor** | *"I won't give you the answer, but I'll help you find it yourself."* Streaming AI that asks guiding questions. |
| 🧑‍🏫 **Protégé Effect** | Teach a confused AI student. The best way to learn is to explain — this puts that superpower in your hands. |
| 🔁 **Spaced Repetition (FSRS-5)** | The system tracks *what you know* across 6 dimensions (stability, difficulty, etc.) and schedules review at the optimal moment. **Long-term memory, not cramming.** |
| 🌈 **Daily Mix** | Interleaved practice across subjects. Your brain has to *discriminate* between problem types — the #1 predictor of durable learning. |
| 🧘 **Focus Mode** | One question at a time — reduces cognitive load, reduces anxiety, increases accuracy. |
| 🎲 **Confidence Wagering** | Wager XP based on how sure you feel. Trains accurate self-assessment and metacognitive monitoring. |
| 🏆 **Gamification** | XP, levels, 15 badges, daily streaks, emoji avatars. Learning feels like a game because *it should*. |
| 📱 **PWA** | Install on your phone's home screen. Works offline for worksheets you've opened. |

### 🧪 The Cognitive Science Engine (the nerdy-but-awesome part)

| Mechanism | What It Does |
|---|---|
| 🧠 **FSRS-5** | The gold standard in spaced repetition — 6 parameters per knowledge component (stability, difficulty, elapsed days, reps, lapses, learning steps) schedule reviews at the *exact* moment for maximum retention |
| 🔀 **Interleaved Practice** | Daily Mix shuffles topics *across* subjects each session. Forces your brain to distinguish problem types — a +30% retention boost over blocked practice |
| 🔍 **Progressive Disclosure** | Focus mode shows one question at a time. Reduces split-attention, lowers cognitive load, improves accuracy |
| 🎯 **Confidence Calibration** | Wager XP based on confidence. Over time, students learn to know *what they don't know* — the metacognitive skill that most predicts academic growth |
| 🖼️ **Dual Coding** | Mermaid.js diagrams render alongside exercises. Verbal + visual memory traces = stronger recall |
| 📊 **Mastery Tracking** | Every remediation exercise scores mastery before/after. Teachers see not just *what* students got wrong, but *whether the remediation actually worked* |
| ✅ **Self-Assessment** | After each remediation round, students reflect: "What did I understand better?" This alone has an effect size of d=0.55-0.74 on learning outcomes |

---

## 🎯 Exercise Types (22 and counting)

| Category | Types |
|---|---|
| 📖 **Reading & Media** | Text, Read Aloud (+ recording + **smart glosses**), Audio Block, Video Block, Mermaid Diagram, Media Block |
| 🗣️ **Vocabulary & Language** | Gap Fill, Word Scramble, Matching, Flashcards (+ **images & audio**), Memory Match, **Vocabulary Pairs**, **Contextual Dialogue**, **Semantic Sorter**, **Drag & Drop** |
| 🔢 **Math & STEM** | Number Line, Equation Entry, Fraction Builder, Arithmetic Grid, Graph Plot, Geometry Shape, Word Problem, Unit Conversion, Percentage, Angle |
| ✅ **Assessment** | Multiple Choice, Single Choice, Short Answer (+ AI grading), True/False, Ordering, Drawing |
| 🧩 **Grammar** | Conjugation drills, German case exercises, word order, preposition practice — **template-based, always repeatable** |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| 🖥️ **Backend** | Node.js 22+, Express 4, TypeScript (strict) |
| 🎨 **Frontend** | Vue 3 (Composition API), Vite 6, Pinia, Vue Router 4 |
| 🗄️ **Database** | SQLite (dev) / PostgreSQL (prod), **Knex** query builder + migrations |
| 🤖 **AI Providers** | Google Gemini 3.5 Flash, **OpenCode** (75+ providers via OpenCode server — DeepSeek V4 Flash, Claude, GPT-4o, etc.), Ollama (local models) |
| 🧮 **SRS Engine** | [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) v5 |
| 📊 **Diagrams** | Mermaid.js |
| 📐 **Math** | KaTeX |
| 🔐 **Auth** | JWT, PBKDF2-SHA256, Microsoft Teams SSO |
| 📝 **Logging** | Pino |
| 🛠️ **Dev** | tsx (hot reload), Vitest, ESLint + Prettier |

---

## 🚀 Getting Started

### What You'll Need

- Node.js 22+
- One of: a **Gemini API key**, an **OpenCode server**, or **Ollama** (or none — the platform works without AI too!)

### Quick Start

```bash
# Grab it
git clone https://github.com/damessner/learnflow.git
cd learnflow

# Fire up the backend
cd backend
cp .env.example .env        # Add your AI keys here
npm install
npm run dev                  # http://localhost:3001

# Fire up the frontend (in another terminal)
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

Log in with one of the seed accounts:

| 👤 | 🔑 | 🎭 |
|---|---|---|
| `admin` | `admin123` | Admin |
| `teacher` | `teacher123` | Teacher |
| `student` | `student123` | Student |

Guest class code: `5a1b-c3d4`

### 🧠 Connect an AI Provider

```bash
# Option A: Google Gemini (simplest)
GEMINI_API_KEY=your-key-here

# Option B: Ollama (local, free)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Option C: OpenCode (75+ models — DeepSeek, Claude, GPT, etc.)
# npm install -g opencode-ai
# opencode serve --port 4096
OPENCODE_URL=http://127.0.0.1:4096
OPENCODE_PROVIDER=deepseek
OPENCODE_MODEL=deepseek-v4-flash
```

Multiple providers can coexist — pick which one to use per worksheet from the builder UI. 🎛️

---

## 📥 PDF Student Importer

Austrian teacher? Upload your `Namensliste` PDF and watch the magic happen:

```bash
curl -X POST http://localhost:3001/api/classes/import-pdf \
  -H "Authorization: Bearer <teacher-token>" \
  -F "file=@Schülerliste.pdf"
```

It parses the class roster, creates student accounts with random 8-char passwords, sets up classes with join codes, and enrolls everyone — all at once. Skips already-imported students (matched by name or email). Returns a JSON summary with all credentials. ⚡

---

## 🚢 Deployment

### Option 1: One-Command LXC (Proxmox VE)

```bash
curl -fsSL https://raw.githubusercontent.com/damessner/learnflow/main/deployment/create-lxc.sh | bash
```

### Option 2: Manual Linux Server

```bash
# Prerequisites
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
sudo npm install -g pm2

# Clone
sudo git clone https://github.com/damessner/learnflow.git /var/www/learnflow
cd /var/www/learnflow

# Backend
cd backend
cp .env.example .env
npm install
npm run build
pm2 start ../deployment/ecosystem.config.js
pm2 save

# Frontend
cd ../frontend
npm install
npm run build

# Nginx
sudo cp ../deployment/nginx.conf /etc/nginx/sites-available/learnflow
sudo ln -sf /etc/nginx/sites-available/learnflow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 🔄 Update (One-Liner — works on first install too)

```bash
cd /var/www/learnflow && bash deployment/update.sh
```

---

## 🔌 API Overview

| Prefix | Key Endpoints |
|---|---|
| `/api/auth` | Login, Microsoft SSO, guest access, register, change password, verify, users CRUD |
| `/api/worksheets` | CRUD, duplicate, templates, assignments, AI generate, TTS, neuro-vocab |
| `/api/submissions` | Get/submit/save, remediation (generate, responses, self-assessment, history, A/B metrics) |
| `/api/classes` | CRUD, students, announcements, join, CSV export, **PDF import** |
| `/api/courses` | CRUD, worksheets, reorder, students, progress |
| `/api/learning` | Mastery, spaced queue, planner, gamification, daily mix, at-risk, analytics |
| `/api/srs` | Due reviews (interleaved), review submission, knowledge components |
| `/api/ai` | Generate worksheet, generate story, Socratic tutor (SSE), protégé (SSE) |
| `/api/language` | Vocabulary CRUD (**with FSRS**), grammar templates, writing feedback, conversation role-play (SSE), smart glosses |
| `/api/teams` | Create teams, push grades to Microsoft Teams |
| `/api/media` | Upload, list |
| `/api/library` | Browse, clone, publish, ratings |
| `/api/admin` | Settings, restore, stats |

---

## 🏗️ Project Structure

```
learnflow/
├── backend/                    # Express + TypeScript API
│   ├── db/                     # Knex init, migrations, seed data
│   ├── middleware/              # Auth, CSRF, CORS, request ID, validation, error handler
│   ├── routes/                  # 13 route modules
│   ├── services/                # AI generation, SRS, gamification, vocabulary, grammar engine, auth, OpenCode
│   └── lib/                     # Logger
├── frontend/                    # Vue 3 + Vite SPA
│   ├── src/views/               # 11 page views + Worksheet Builder + Player
│   ├── src/components/          # 27+ exercise components + Mermaid diagram
│   ├── src/stores/              # 7 Pinia stores
│   ├── src/router/              # Vue Router with auth guards
│   └── src/services/            # API client
├── deployment/                  # Nginx, PM2, LXC automation
├── teams-app/                   # Microsoft Teams tab package
└── .github/workflows/           # CI + deploy pipelines
```

---

## 📱 PWA & Mobile

LearnFlow is a Progressive Web App — install it on your phone without any app store:

- **📱 iOS Safari**: Open → Share → Add to Home Screen
- **📱 Android Chrome**: Open → Menu → Install app

**Microsoft Intune**: Deploy as an iOS/iPadOS web clip via the Intune Admin Center.

---

## 🤝 Why Open Source?

Because education shouldn't be locked behind enterprise licenses. Because a teacher in a small school should have access to the same cognitive science tools as a well-funded district. Because when you love what you build, you want to share it.

PRs, issues, and ideas are always welcome. 🙌

---

## 📄 License

MIT — use it, share it, build on it. Just keep the love for learning alive. ❤️
