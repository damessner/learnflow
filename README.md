# LearnFlow — Active Recall & Spaced Repetition Learning Platform

LearnFlow is a modern, full-stack educational platform designed for teachers and students. It combines worksheet management, spaced repetition, AI-powered content generation, cognitive science-backed learning techniques, and gamification — all in a self-hostable monorepo.

---

## Features

### Core Platform

- **Worksheets** — drag-drop block editor with 22 exercise types (gap fill, multiple choice, matching, drag-drop, etc.)
- **Classes & Courses** — create classes with join codes, manage courses with ordered worksheet sequences
- **Assignments & Submissions** — assign worksheets to classes, auto-save progress, submit and auto-score
- **Authentication** — local login, Microsoft Teams SSO, guest access via class codes. JWT-based tokens.
- **Library** — publish worksheets, browse/search/filter, clone from library, star ratings
- **Media** — file uploads, video, audio, TTS (text-to-speech via edge-tts or say.js)

### AI-Powered Generation

- **Worksheet Generator** — generate complete interactive worksheets from a natural language prompt via Ollama or Gemini
- **Story Generator** — auto-generate reading worksheets with story text, comprehension questions, vocabulary exercises, and grammar exercises — all in one worksheet
- **Socratic Tutor** — AI tutor that guides students with questions instead of giving answers (SSE streaming)
- **Protege Effect** — AI acts as a confused student; the learner teaches it to deepen their own understanding

### Cognitive Science Engine

- **FSRS Spaced Repetition** — Free Spaced Repetition Scheduler (ts-fsrs v5) optimizes review timing for long-term retention
- **Interleaved Practice** — daily mix shuffles topics from different subjects to force category discrimination
- **Progressive Disclosure** — focus mode shows one question at a time to reduce cognitive load
- **Confidence Calibration & XP Wagering** — students wager gamification XP based on their confidence, training metacognitive monitoring
- **Dual Coding** — Mermaid.js diagrams rendered alongside exercises to create verbal + visual memory traces

### Gamification

- **XP & Levels** — earn XP from assignments, daily mix, and SRS reviews; level up with `floor(√(xp/200)) + 1` formula
- **15 Badges** — milestone, achievement, streak, level, XP, wagering, and consistency categories
- **Streaks** — daily activity tracking with streak counter
- **Leaderboard-ready** — per-user XP, level, and badge data stored for future leaderboard features

### Math-Specific Question Types

- **Number Line** — click where a value belongs on an interactive number line
- **Equation Entry** — type solutions to math equations with automatic validation
- **Fraction Builder** — build fractions with numerator/denominator inputs and visual feedback
- **Arithmetic Grid** — column arithmetic practice (addition, subtraction, multiplication, division)
- **Graph Plot** — plot points on an interactive coordinate grid
- **Geometry Shape** — identify shapes with visual SVG rendering
- **Word Problem** — step-by-step problem solving with intermediate answer validation

### Subject & Grade Tagging

- **Standardized subjects** — Mathematics, German, English, Science, History, Geography, Art, Music, PE
- **Grade levels** — 1st through 8th grade
- **Library filtering** — filter worksheets by subject, grade level, and search
- **Course categorization** — courses now have subject and grade fields

---

## Tech Stack

| Layer            | Technology                                                              |
| ---------------- | ----------------------------------------------------------------------- |
| **Backend**      | Node.js 18+, Express 4, TypeScript (strict, ES2022)                     |
| **Frontend**     | Vue 3 (Composition API), Vite 6, Pinia, Vue Router 4                    |
| **Database**     | SQLite via better-sqlite3 (dev) / PostgreSQL via pg + Knex (production) |
| **AI Providers** | Ollama (local) or Google Gemini (cloud)                                 |
| **SRS Engine**   | ts-fsrs v5 (Free Spaced Repetition Scheduler)                           |
| **Diagrams**     | Mermaid.js (npm bundled)                                                |
| **Math**         | KaTeX (CDN) for math rendering                                          |
| **Auth**         | JWT (jsonwebtoken), PBKDF2-SHA256 password hashing                      |
| **Dev**          | tsx for hot-reload, Vitest for testing                                  |

---

## Deployment Options

### Option 1: Proxmox VE LXC (Automated)

```bash
curl -fsSL https://raw.githubusercontent.com/damessner/learnflow/main/deployment/create-lxc.sh | bash
```

Creates a Debian 12 LXC container, installs dependencies, builds backend + frontend, configures Nginx + PM2.

Custom installation:

```bash
curl -fsSL https://raw.githubusercontent.com/damessner/learnflow/main/deployment/create-lxc.sh | bash -s -- 200 learnflow yourpassword
```

### Option 2: Manual Linux Server

```bash
# Install prerequisites
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
sudo npm install -g pm2

# Clone repo
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

Access at `http://your-server-ip/`.

### Updating (One-Liner)

On your LXC/server, pull the latest code, rebuild, and restart in one command:

```bash
cd /var/www/learnflow && bash deployment/update.sh
```

### Default Seed Users

| Username | Password   | Role    |
| -------- | ---------- | ------- |
| admin    | admin123   | Admin   |
| teacher  | teacher123 | Teacher |
| student  | student123 | Student |

Guest access class code: `5a1b-c3d4`

---

## PWA & Mobile

LearnFlow is a Progressive Web App — installable on iOS and Android home screens without app stores:

- **iOS Safari**: Open URL → Share → Add to Home Screen
- **Android Chrome/Edge**: Open URL → Menu → Install app

**MDM Deployment** (Microsoft Intune): Deploy as an iOS/iPadOS web clip in the Intune Admin Center.

---

## Microsoft Teams Integration

Build the Teams app package:

```bash
cd teams-app
node package-teams.js http://your-server-ip
```

Upload the generated `learnflow-teams-app.zip` in Teams → Apps → Upload a custom app.

---

## Project Structure

```
learnflow/
├── backend/                  # Express + TypeScript API
│   ├── db/                   # Knex migrations, helpers, init, seed
│   ├── middleware/            # Auth, validation (Zod), error handling, CORS
│   ├── routes/                # API endpoints (auth, worksheets, submissions, etc.)
│   ├── services/              # AI worksheet gen, FSRS engine, gamification, MS auth
│   ├── lib/                   # Logger (Pino)
│   └── data/                  # badges.json, templates
├── frontend/                  # Vue 3 + Vite SPA
│   ├── src/
│   │   ├── views/             # 11 views (Login, Dashboards, Builder, Player, StoryGenerator, etc.)
│   │   ├── components/        # 27 exercise components + MermaidDiagram
│   │   ├── stores/            # 7 Pinia stores (auth, ui, worksheets, classes, submissions, courses, learning)
│   │   ├── router/            # Vue Router with lazy loading + auth guards
│   │   └── services/          # API client (fetch-based)
│   └── public/                # PWA icons, manifest
├── deployment/                # Nginx config, PM2 ecosystem, LXC setup scripts
├── teams-app/                 # Microsoft Teams tab integration
└── .github/workflows/         # CI (lint, typecheck, test, build) + Deploy workflow
```

---

## API Endpoints

| Prefix             | Module            | Key Endpoints                                                                                             |
| ------------------ | ----------------- | --------------------------------------------------------------------------------------------------------- |
| `/api/auth`        | Authentication    | login, microsoft, guest, register, change-password, verify, users CRUD                                    |
| `/api/worksheets`  | Worksheets        | CRUD, duplicate, templates, assignments, AI generate, TTS, subjects, grade-levels                         |
| `/api/submissions` | Submissions       | get/submit/save assignment, feedback, student summary                                                     |
| `/api/classes`     | Classes           | CRUD, students, announcements, join, CSV export, PDF import                                               |
| `/api/courses`     | Courses           | CRUD, worksheets, reorder, students, progress                                                             |
| `/api/learning`    | Learning          | mastery, spaced-queue, planner, gamification, daily-mix, at-risk, interventions, analytics, wager-history |
| `/api/srs`         | Spaced Repetition | due reviews (with interleaving), review submission, KC management                                         |
| `/api/ai`          | AI                | generate worksheet, generate story, tutor (SSE), protege (SSE)                                            |
| `/api/teams`       | Teams             | create teams, push grades                                                                                 |
| `/api/media`       | Media             | upload, list                                                                                              |
| `/api/library`     | Library           | browse, clone, publish, ratings                                                                           |

---

## CI/CD

- **CI** (`.github/workflows/ci.yml`): Lint, `tsc --noEmit`, Vitest tests, build on push/PR
- **Deploy** (`.github/workflows/deploy.yml`): rsync + PM2 reload to Ubuntu LXC on push to main

---

## License

MIT
