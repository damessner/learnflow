# LearnFlow

Active Recall & Spaced Repetition Learning Platform — built for Mittelschule Telfs.

LearnFlow is a full-stack educational platform where teachers create interactive worksheets, students work through them with instant feedback, and the built-in spaced repetition engine optimizes long-term retention. It's self-hosted, runs on modest hardware, and works offline as a PWA.

---

## Features

### For Teachers

- **Worksheet Builder** — drag-and-drop block editor with 22 exercise types: gap fill, multiple choice, matching, word scramble, short answer, number line, equation entry, fraction builder, arithmetic grid, graph plot, geometry, word problems, and more. All types include auto-scoring.
- **AI Worksheet Generator** — describe what you want in natural language and get a complete, auto-scored worksheet back. Pick your AI provider.
- **AI Story Generator** — generate complete German-language reading worksheets with story text, comprehension questions, vocabulary and grammar exercises in one click.
- **Classes & Courses** — create classes with auto-generated join codes, organize worksheets into ordered courses with unlock thresholds, and track progress per student.
- **Library** — publish worksheets for other teachers, browse and clone, star ratings.
- **PDF Student Importer** — upload a class roster PDF (`Namensliste` format) to automatically create student accounts and enroll them in their classes.
- **Results Dashboard** — see per-assignment scores, class averages, and CSV export.
- **Teams Integration** — push grades to Microsoft Teams.
- **Socratic Tutor & Protege Mode** — AI assistant that guides students with questions (tutor) or plays a confused learner they must teach (protege effect).

### For Students

- **Interactive Worksheets** — 22 exercise types with auto-scoring and immediate feedback.
- **Socratic Tutor** — built-in AI tutor that never gives direct answers, only guiding questions.
- **Protege Effect** — teach a confused AI student to deepen your own understanding.
- **Spaced Repetition (FSRS)** — the system tracks what you know and schedules optimal review times to move knowledge into long-term memory.
- **Daily Mix** — interleaved practice across subjects, served as due SRS reviews.
- **Progressive Disclosure** — focus mode shows one question at a time to reduce cognitive load.
- **Confidence Calibration** — wager XP on your confidence before answering, training metacognitive monitoring.
- **Gamification** — earn XP, level up, collect 15 badges, maintain daily streaks.
- **PWA** — install on your phone's home screen, works offline for worksheets you've opened.

### Cognitive Science Engine

| Mechanism | What it does |
|-----------|-------------|
| **FSRS-5** | Free Spaced Repetition Scheduler — tracks 6 parameters per knowledge component (stability, difficulty, elapsed days, etc.) and schedules reviews at the optimal moment for long-term retention |
| **Interleaved Practice** | The Daily Mix shuffles topics from different subjects each session, forcing the brain to discriminate between problem types — a proven retention booster |
| **Progressive Disclosure** | One question at a time in focus mode. Reduces split-attention effect and cognitive load |
| **Confidence Calibration** | Students wager XP based on how confident they feel. Over time this trains accurate self-assessment (metacognitive monitoring) |
| **Dual Coding** | Mermaid.js diagrams render alongside exercises — verbal + visual memory traces for stronger recall |

### 22 Exercise Types

| Category | Types |
|----------|-------|
| **Reading** | Text, Read Aloud, Audio Block, Video Block, Mermaid Diagram, Media Block |
| **Vocabulary** | Gap Fill, Word Scramble, Matching, Flashcards, Memory Match, Vocabulary Builder |
| **Math** | Number Line, Equation Entry, Fraction Builder, Arithmetic Grid, Graph Plot, Geometry Shape, Word Problem |
| **Assessment** | Multiple Choice, Single Choice, Short Answer, Semantic Sorter, Contextual Dialogue, Flow Challenge |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js 22+, Express 4, TypeScript (strict) |
| **Frontend** | Vue 3 (Composition API), Vite 6, Pinia, Vue Router 4 |
| **Database** | SQLite (dev) / PostgreSQL (prod), Knex query builder + migrations |
| **AI Providers** | Ollama (local models), Google Gemini 3.5 Flash, **OpenCode** (75+ providers via OpenCode server — DeepSeek V4 Flash, Claude, GPT, etc.) |
| **SRS Engine** | ts-fsrs v5 |
| **Diagrams** | Mermaid.js (npm) |
| **Math** | KaTeX (CDN) |
| **Auth** | JWT, PBKDF2-SHA256 password hashing, Microsoft Teams SSO |
| **Icons** | Lucide |
| **Logging** | Pino |
| **Dev** | tsx (hot reload), Vitest (testing), ESLint + Prettier |

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm
- One of: Ollama (local), a Gemini API key, or an OpenCode server (optional — the platform works without AI)

### Quick Start

```bash
# Clone
git clone https://github.com/damessner/learnflow.git
cd learnflow

# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and log in with one of the seed accounts.

### Configure AI Providers

```bash
# Option A: Ollama (local)
# Start Ollama, pull a model, and set in backend/.env:
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Option B: Google Gemini
GEMINI_API_KEY=your-key-here

# Option C: OpenCode (DeepSeek V4 Flash, free)
# 1. Install opencode: npm install -g opencode-ai
# 2. Configure DeepSeek in opencode: /connect → DeepSeek → enter API key
# 3. Start opencode server: opencode serve --port 4096
# 4. Set in backend/.env:
OPENCODE_URL=http://127.0.0.1:4096
OPENCODE_PROVIDER=deepseek
OPENCODE_MODEL=deepseek-v4-flash
```

Multiple providers can coexist — select which to use per worksheet from the builder UI.

---

## Seed Users

These accounts are created automatically on first startup:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `teacher` | `teacher123` | Teacher |
| `student` | `student123` | Student |

Guest access class code: `5a1b-c3d4`

---

## PDF Student Importer

Upload a school class roster PDF to automatically create student accounts and classes:

```bash
curl -X POST http://localhost:3001/api/classes/import-pdf \
  -H "Authorization: Bearer <teacher-token>" \
  -F "file=@Schülerliste.pdf"
```

**Expected format:** Austrian `Namensliste` style — each page starts with `Namensliste der <class>` followed by numbered student entries (`1 Surname Given`). The importer:
- Creates classes (if they don't exist) with auto-generated join codes
- Creates student accounts with random 8-char passwords
- Enrolls students in their classes
- Returns a JSON summary with all usernames and passwords
- Skips already-imported students (matched by name or email)

---

## Deployment

### Option 1: Automated LXC (Proxmox VE)

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
cp .env.example .env         # edit this file with your settings
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

Access at `http://your-server-ip/`.

### Update (One-Liner)

```bash
cd /var/www/learnflow && bash deployment/update.sh
```

---

## API Overview

| Prefix | Key Endpoints |
|--------|--------------|
| `/api/auth` | login, Microsoft SSO, guest, register, change-password, verify, users CRUD |
| `/api/worksheets` | CRUD, duplicate, templates, assignments, AI generate, TTS, subjects |
| `/api/submissions` | get/submit/save assignment, feedback, student summary |
| `/api/classes` | CRUD, students, announcements, join, CSV export, **PDF import** |
| `/api/courses` | CRUD, worksheets, reorder, students, progress |
| `/api/learning` | mastery, spaced-queue, planner, gamification, daily-mix, at-risk, analytics |
| `/api/srs` | due reviews (interleaved), review submission, knowledge components |
| `/api/ai` | generate worksheet, generate story, Socratic tutor (SSE), protege (SSE) |
| `/api/teams` | create teams, push grades to Microsoft Teams |
| `/api/media` | upload, list |
| `/api/library` | browse, clone, publish, ratings |
| `/api/admin` | settings, restore, stats |

---

## CI/CD

- **CI** (`.github/workflows/ci.yml`): lint, typecheck, test, build on push/PR to any branch
- **Deploy** (`.github/workflows/deploy.yml`): rsync + PM2 reload to production on push to `main`

---

## Project Structure

```
learnflow/
├── backend/                  # Express + TypeScript API
│   ├── db/                   # Knex init, migrations, seed data
│   ├── middleware/            # Auth, CSRF, CORS, request ID, validation, error handler
│   ├── routes/                # 12 route modules (auth, worksheets, submissions, etc.)
│   ├── services/              # AI generation, SRS engine, gamification, MS auth, OpenCode, student importer
│   ├── lib/                   # Pino logger
│   └── prisma/                # Prisma schema (generated but unused — Knex is the ORM)
├── frontend/                  # Vue 3 + Vite SPA
│   ├── src/views/             # 11 page views
│   ├── src/components/        # 27 exercise types + Mermaid diagram
│   ├── src/stores/            # 7 Pinia stores
│   ├── src/router/            # Vue Router with auth guards
│   └── src/services/          # API client
├── deployment/                # Nginx, PM2, LXC automation scripts
├── teams-app/                 # Microsoft Teams tab package
└── .github/workflows/         # CI + deploy pipelines
```

---

## PWA & Mobile

LearnFlow is a Progressive Web App — installable on phones without app stores:

- **iOS Safari**: Open URL → Share → Add to Home Screen
- **Android Chrome**: Open URL → Menu → Install app

**Microsoft Intune**: Deploy as an iOS/iPadOS web clip via the Intune Admin Center.

---

## License

MIT
