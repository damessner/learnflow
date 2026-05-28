# Plan: Five Strategic Feature Implementations

## Summary

Five major feature areas to take LearnFlow from a worksheet builder to a complete intelligent learning platform. Ordered by dependency — each builds on the previous. The existing architecture already has partial implementations for all five; this plan closes the gaps, hardens what exists, and connects the pieces into coherent user-facing features.

---

## 1. AI Provider Resilience

### Current State

- `backend/routes/ai.ts` — provider selection is a flat `if/else if` chain (lines 849–981): tries `opencode+Zen`, then `opencode+SDK`, then `ollama`, then `gemini`. Each branch has its own try/catch.
- Retry logic (line 825) repeats the *same* provider 3 times — if Gemini is down, all 3 attempts hit the same dead endpoint.
- Fallback added for Gemini→Zen in `/generate` and `/differentiate` but not in `/tutor`, `/protege`, `/generate-story`, `/check-answer`.
- No health-check endpoint for the frontend to know which providers work.
- No configurable provider priority/ordering.

### Approach

Centralize provider logic into a `ProviderService` that can be configured with a priority-ordered list of providers. Each provider has a `isAvailable()` check and a `generate()` method. The retry loop tries the *next available* provider on each attempt, not the same one.

### Files to Change

| File | Change | What |
|------|--------|------|
| `backend/services/providerService.ts` | **Create** | Central provider registry with priority ordering, health checks, fallback chains |
| `backend/services/opencode.ts` | **Refactor** | Export `isZenAvailable()`, `callZen()` as standalone functions |
| `backend/routes/ai.ts` | **Refactor** | Replace `if/else if` chain with `providerService.generate()` call |
| `backend/routes/ai.ts` | **Add** | `GET /ai/providers` — returns configured providers + availability status |
| `frontend/src/views/WorksheetBuilder.vue` | **Update** | Fetch provider status, disable unavailable providers in dropdown, show status indicator |

### Step-by-Step Execution

1. **Create `backend/services/providerService.ts`**
   - `interface AIProvider { name: string; isAvailable(): Promise<boolean>; generate(prompt, opts): Promise<...> }`
   - `class ProviderService` with a registry and priority-ordered list
   - `getAvailableProviders()` — returns only healthy providers
   - `generateWithFallback(prompt, preferredProvider, opts)` — tries preferred, then fallbacks in priority order
   - Reads priority from env var `AI_PROVIDER_ORDER` or defaults to `['gemini', 'zen', 'ollama']`

2. **Extract Zen and Gemini into provider implementations**
   - Move `callZenChat()` into a `ZenProvider` class
   - Move Gemini fetch logic into a `GeminiProvider` class  
   - Keep Ollama as an `OllamaProvider` class
   - Each implements the `AIProvider` interface

3. **Add `GET /ai/providers` endpoint**
   - Returns `[{ name: 'gemini', available: true, model: 'gemini-2.0-flash' }, ...]`
   - Frontend uses this to show/hide provider options

4. **Refactor `/generate` endpoint**
   - Replace `if/else if` with `providerService.generateWithFallback(prompt, provider, opts)`
   - Retry loop now tries different providers on each attempt
   - Remove the manual Gemini→Zen fallback (now handled by the service)

5. **Update frontend provider selector**
   - Fetch available providers on mount
   - Grey out unavailable providers
   - Show tooltip: "Currently unavailable" with reason

### Risks and Edge Cases
- Provider may become unavailable between health check and generation — handled by per-attempt fallback
- Zen API may be rate-limited — add basic retry with backoff
- All providers down at once — final error message lists which were tried and why each failed

---

## 2. Student-Facing Dashboard with Progress Analytics

### Current State

- `frontend/src/views/StudentDashboard.vue` (740 lines) — shows: daily mix SRS session, gamification card (XP/level/badges), join-class form, emoji avatar picker, class list
- `backend/routes/learning.ts` — endpoints for mastery, spaced queue, planner, gamification, wager-history
- `backend/routes/submissions.ts` — `GET /student/summary` returns submission stats
- `backend/routes/classes.ts` — `GET /:id/progress` returns per-student progress in a class
- Gamification data in `learning_gamification` table: xp, level, badges, streak_days
- Mastery data in `learning_mastery` table: topic, mastery_level (0-100), last_practiced_at
- Wager calibration data from `/student/wager-history`

### Approach

Build a multi-tab dashboard with visual analytics: progress overview, mastery heatmap, XP history chart, weakness drill-down, and metacognitive calibration. Use a lightweight chart library (Chart.js via vue-chartjs) for the visualizations. All data endpoints already exist — this is primarily a frontend effort with one new aggregation endpoint.

### Files to Change

| File | Change | What |
|------|--------|------|
| `frontend/src/views/StudentDashboard.vue` | **Rewrite** | Multi-tab dashboard: Overview, Mastery, History, Calibration |
| `backend/routes/learning.ts` | **Add** | `GET /student/progress-summary` — aggregated stats endpoint |
| `backend/routes/submissions.ts` | **Update** | `GET /student/summary` — add last-30-days history, per-subject breakdown |
| `frontend/package.json` | **Add** | `chart.js` + `vue-chartjs` dependencies |
| `frontend/src/components/student/MasteryHeatmap.vue` | **Create** | Subject-topic mastery visualization |
| `frontend/src/components/student/ProgressChart.vue` | **Create** | XP/score line chart over time |
| `frontend/src/components/student/WeaknessDrillDown.vue` | **Create** | Topic-level weakness list with remediation links |
| `frontend/src/components/student/CalibrationCard.vue` | **Create** | Confidence wagering accuracy visualization |

### Step-by-Step Execution

1. **Add aggregation endpoint `GET /student/progress-summary`**
   - Returns: total XP, current level, streak days, worksheets completed, average score, subject breakdown (scores per subject), last 30 days of activity (daily scores), weakness topics (mastery < 40)
   - Combines data from `learning_gamification`, `learning_mastery`, `submissions`, `submission_attempts`

2. **Install chart.js and vue-chartjs**
   - `npm install chart.js vue-chartjs`

3. **Build progress-summary data fetching into StudentDashboard**
   - Use `onMounted` to fetch all data in parallel
   - Store in reactive refs

4. **Create tabbed layout with 4 tabs:**
   - **Overview tab**: XP card (animated counter), streak display, recent activity feed, next-up (due SRS items)
   - **Mastery tab**: MasteryHeatmap component — grid of topics × mastery level (color-coded green→yellow→red) with subject filters
   - **History tab**: ProgressChart component — line chart of scores over time, XP accumulation, submission frequency
   - **Calibration tab**: CalibrationCard — confidence vs accuracy scatter, overall calibration score, by-confidence breakdown

5. **Create MasteryHeatmap.vue**
   - Receives `mastery: Array<{topic, level, subject}>`
   - Groups by subject, displays as color-coded cards
   - Click on a weak topic → open remediation or suggest practice

6. **Create ProgressChart.vue**
   - Uses vue-chartjs `Line` chart
   - X-axis: dates (last 30 days), Y-axis: score %
   - Overlay: XP gained per day as bar chart

7. **Create WeaknessDrillDown.vue**
   - Lists topics with mastery < 40
   - Shows: topic name, current mastery %, last practiced date
   - "Practice" button → opens Daily Mix filtered to that topic

8. **Create CalibrationCard.vue**
   - Shows: overall calibration score, total wagers
   - Bar chart of confidence levels (1,3,5) vs actual accuracy
   - Encouraging message based on calibration quality

### Risks and Edge Cases
- No submission history yet — show "Start your first worksheet!" empty state
- Chart.js bundle size — lazy-load the chart components
- Student has no classes — hide class-specific sections, show "Join a class" prompt

---

## 3. Adaptive Learning Paths

### Current State

- `backend/routes/learning.ts` lines 69–104 — Daily Mix picks 5 due items from `learning_queue`, fills remaining slots with low-mastery topics
- Mastery updates use a simple SuperMemo-2-like formula: correct → +10, wrong → -15
- No adaptive difficulty adjustment — all worksheets have fixed difficulty
- Courses have `adaptive_difficulty` column on `assignments` but it's unused
- FSRS-5 library (`ts-fsrs`) is installed but only used by vocabulary review, not by worksheet/mastery system

### Approach

Wire the existing FSRS-5 engine into the mastery/queue system so that:
- Each knowledge component (KC) uses true FSRS-5 scheduling instead of the simple +/- formula
- Worksheet difficulty adapts based on student's KC state: if stability is high, serve harder variants; if low, serve easier or scaffolded versions
- Course progression uses mastery-based unlock: next worksheet unlocks only when prerequisite KCs reach threshold
- Daily Mix uses FSRS-5 due dates for optimal interleaving

### Files to Change

| File | Change | What |
|------|--------|------|
| `backend/routes/learning.ts` | **Rewrite** Daily Mix & completion | Replace SuperMemo-2 with FSRS-5 for mastery updates |
| `backend/routes/srs.ts` | **Read** (already exists) | Study existing SRS endpoints for vocabulary |
| `backend/services/adaptiveService.ts` | **Create** | Difficulty calibration, worksheet variant selection, prerequisite checking |
| `backend/services/fsrsService.ts` | **Create** | Wrapper around ts-fsrs: `scheduleReview()`, `getNextDue()`, `computeStability()` |
| `backend/db/migrations/20260530_001_adaptive.ts` | **Create** | Add `difficulty`, `kc_ids` columns to worksheets, `prerequisites` to courses |
| `backend/routes/worksheets.ts` | **Update** | Tag worksheets with KC IDs on creation, return adaptive difficulty info |
| `frontend/src/views/CourseView.vue` | **Update** | Show mastery progress per worksheet, locked/unlocked state |
| `frontend/src/views/StudentDashboard.vue` | **Update** | Daily Mix uses FSRS-5 scheduling display |

### Step-by-Step Execution

1. **Create migration: add adaptive columns**
   - `worksheets`: add `difficulty text default 'medium'`, `kc_ids text` (JSON array of KC IDs)
   - `course_worksheets`: add `prerequisite_kc_ids text`, `unlock_threshold integer default 60`
   - `learning_mastery`: add `kc_id` column, `stability`, `difficulty`, `elapsed_days` (matching FSRS params) — or just use `student_knowledge_state` table directly

2. **Create `backend/services/fsrsService.ts`**
   - Wraps `ts-fsrs` `createFSRS()` 
   - `export function computeNextReview(kc: StudentKCState, grade: number): FSRSReviewResult`
   - `export function getDueKCs(userId: string, limit: number): Promise<KC[]>`
   - `export function getOptimalInterleaving(dueKCs: KC[]): KC[]` — sorts by subject for interleaving

3. **Rewrite Daily Mix completion in `learning.ts`**
   - Replace `mastery_level +/- N` with FSRS-5 `computeNextReview()`
   - Store FSRS params in `student_knowledge_state` table
   - Update `learning_queue` with computed due dates

4. **Create `backend/services/adaptiveService.ts`**
   - `getAdaptiveDifficulty(userId, worksheet)` — returns difficulty adjustment based on user's KC state for this worksheet's topics
   - `getPrerequisiteStatus(userId, courseWorksheet)` — returns `{ unlocked: boolean, missingKCs: string[] }`
   - `selectWorksheetVariant(userId, worksheet)` — if multiple difficulty variants exist, pick the right one

5. **Update worksheet creation to tag KCs**
   - When a worksheet is created/saved, extract KC IDs from `kc_ids` field
   - When assigning, check if student has prerequisite KCs

6. **Update CourseView.vue**
   - Add locked/unlocked visual state per worksheet
   - Show missing prerequisite KCs when locked
   - Show mastery progress bar per worksheet

7. **Update StudentDashboard Daily Mix**
   - Show FSRS-based scheduling info: "Due in 2 days", "Overdue by 3 days"
   - Show expected retention % per item

### Risks and Edge Cases
- FSRS needs initial calibration data — seed with default params for first review
- Existing `learning_mastery` data format differs from FSRS — migration script to convert or dual-write
- Prerequisite chains could create deadlocks — warn teacher when circular dependencies detected
- Performance: FSRS computations are cheap but querying many KCs could be slow — add index on `student_knowledge_state.due`

---

## 4. Austrian Bildungsstandards Integration

### Current State

- `backend/data/lehrplaene.json` — not found in current repo (might be missing or in a different location)
- `backend/routes/ai.ts` lines 115–139 — `getLehrplaeneData()` loads lehrplan JSON from multiple paths, injects into AI prompts
- Lines 141–149 — `getAustrianGrade()` maps grade 1→1, 5→1, 2→2, 6→2, etc.
- Lines 151–159 — `getSubjectKey()` maps DE/EN subject names
- The AI prompt includes: "You MUST adhere to the following official curriculum standards for Mittelschule Österreich"
- No structured competency tracking per student

### Approach

Transform the lehrplan from a prompt-injection text blob into a structured competency framework:
1. Parse/extend the lehrplan JSON into structured **competence statements** with IDs, subjects, grades, and categories
2. Teachers tag exercises with specific competence codes
3. Student mastery is tracked per competence, not just per topic
4. Reports export per-student competence matrices aligned to **Bildungsstandards**
5. AI prompt references specific competence codes instead of free-text curriculum text

### Files to Change

| File | Change | What |
|------|--------|------|
| `backend/data/competences.ts` | **Create** | Structured competence catalog: subjects → grades → categories → statements with IDs |
| `backend/routes/ai.ts` | **Update** | Replace free-text lehrplan injection with structured competence references in prompts |
| `backend/routes/worksheets.ts` | **Update** | Add `competence_ids` field to worksheet schema, allow tagging on save |
| `backend/db/migrations/20260530_002_competences.ts` | **Create** | Add `competence_id` to `learning_mastery` (or new `student_competences` table) |
| `backend/routes/competences.ts` | **Create** | CRUD for competences, student competence tracking, teacher reports |
| `frontend/src/views/WorksheetBuilder.vue` | **Update** | Add competence-tagging UI (multi-select from structured catalog) |
| `frontend/src/views/TeacherDashboard.vue` | **Update** | Add "Competence Overview" tab with per-class competence matrix |
| `frontend/src/components/teacher/CompetenceMatrix.vue` | **Create** | Class-wide competence heatmap (students × competences) |

### Step-by-Step Execution

1. **Create structured competence catalog**
   - Research: extract competence statements from the official Austrian **Bildungsstandards** for Mittelschule
   - Format: `{ id: "M3_1_2", subject: "Mathematics", grade: "3", category: "Zahlen und Maße", statement: "Kann mit natürlichen Zahlen in verschiedenen Darstellungsformen umgehen", kompetenzbereich: "Arithmetik" }`
   - Store as `backend/data/competences.json` or `backend/data/competences.ts`
   - Cover Mathematics, German, English for all 4 grades initially

2. **Create migration: add competence tracking**
   - New table `competences`: `id, subject, grade, category, kompetenzbereich, statement, description`
   - New table `worksheet_competences`: `worksheet_id, competence_id` (many-to-many)
   - New table `student_competences`: `user_id, competence_id, mastery_level, last_assessed_at` (can reuse `learning_mastery` with `topic → competence_id`)

3. **Create `backend/routes/competences.ts`**
   - `GET /competences?subject&grade` — return structured catalog
   - `GET /student/competences` — per-student competence mastery
   - `GET /teacher/competences/:classId` — class-wide competence matrix
   - `POST /worksheets/:id/competences` — tag worksheet with competences

4. **Update worksheet builder — competence tagging**
   - After subject/grade selected, show competence picker (grouped by category)
   - Multi-select checkboxes: "This exercise addresses competences: ☐ M3_1_1 ☐ M3_1_2"
   - Store selected competence IDs in worksheet metadata

5. **Update AI prompt to reference specific competences**
   - Instead of injecting full lehrplan text, inject: "This worksheet targets competences: [M3_1_1: 'Can handle natural numbers...', M3_1_2: 'Can compare numbers...']"
   - The AI then designs exercises specifically targeting those competences

6. **Update scoring to update student competences**
   - When a submission is scored, look up which competences the worksheet targets
   - Update `student_competences.mastery_level` accordingly
   - Use average of all exercises targeting that competence

7. **Build CompetenceMatrix.vue for teachers**
   - Rows: students in class
   - Columns: competences (grouped by category)
   - Cells: color-coded mastery level (green=mastered, yellow=developing, red=not assessed)
   - Hover shows competence statement
   - Export to CSV for report cards

8. **Update TeacherDashboard — Competence tab**
   - Add "📋 Competence Overview" tab
   - Shows: class matrix, most-missed competences, competence growth over time

### Risks and Edge Cases
- Building the full competence catalog is a large data-entry task — start with Mathematics (most structured), then English, then German
- Existing worksheets won't have competence tags — show "not yet assessed" for all competences until new assignments are made
- Competence statements are subject to change when new Lehrpläne are published — make the catalog editable via admin UI
- Some exercises map to multiple competences — support multiple tags per worksheet

---

## 5. AI-Powered Lesson Planning

### Current State

- `backend/routes/ai.ts` — `buildWorksheetPrompt()` (lines 324–500), `POST /generate` (lines 816–971), `POST /generate-story` (lines 1773–1890)
- AI can generate individual worksheets and stories
- No concept of a "lesson sequence" — a series of worksheets with scaffolding, objectives, and pedagogical progression
- No output format for lesson plans (PDF, printable, etc.)

### Approach

Build a lesson planning system where the teacher describes what they want to teach over N days, and the AI generates a full lesson sequence:
1. Lesson plan data model (objectives, activities, materials, assessment per session)
2. AI prompt that generates multi-day sequences with scaffolding
3. Export as printable lesson plan (HTML → Print or PDF)
4. One-click "Generate Worksheets" per lesson to create the actual worksheet blocks
5. Save lesson plans for reuse and sharing

### Files to Change

| File | Change | What |
|------|--------|------|
| `backend/routes/ai.ts` | **Add** | `POST /ai/lesson-plan` — generates multi-day lesson sequence |
| `backend/services/lessonPlanner.ts` | **Create** | Lesson plan prompt builder, response parser, curriculum-aware sequencing |
| `backend/db/migrations/20260530_003_lesson_plans.ts` | **Create** | `lesson_plans` table with objectives, activities per session, linked worksheets |
| `backend/routes/lessonPlans.ts` | **Create** | CRUD for lesson plans, generate worksheets from plan, export |
| `frontend/src/views/LessonPlanner.vue` | **Create** | Main lesson planner interface |
| `frontend/src/views/LessonPlanView.vue` | **Create** | View/print/export a saved lesson plan |
| `frontend/src/router/index.ts` | **Update** | Add routes for lesson planner views |
| `frontend/src/views/TeacherDashboard.vue` | **Update** | Add "📋 Lesson Plans" tab linking to planner |

### Step-by-Step Execution

1. **Create migration: lesson_plans table**
   - `id, title, subject, grade_level, duration_days, topics TEXT (JSON array), learning_objectives TEXT, competence_ids TEXT, created_by, created_at, updated_at`
   - `lesson_sessions`: `id, lesson_plan_id, session_number, title, duration_minutes, learning_objectives, activities TEXT (JSON), materials TEXT, assessment TEXT, worksheet_id, created_at`
   - `lesson_plan_worksheets`: `lesson_plan_id, session_number, worksheet_id` (bridge)

2. **Create `backend/services/lessonPlanner.ts`**
   - `buildLessonPlanPrompt(opts)` — constructs a prompt for N-day lesson plan
   - Prompt structure:
     - Teacher's request + subject + grade + number of sessions
     - Austrian curriculum constraints (from competence catalog)
     - Pedagogical framework: cognitive load theory, scaffolding, gradual release of responsibility
     - Required output format: structured JSON with per-session objectives, activities, materials
   - `parseLessonPlanResponse(raw: string)` — validates and parses AI response
   - `generateWorksheetsForSession(planId, sessionNumber)` — generates individual worksheet blocks per session using existing `/generate` logic

3. **Add `POST /ai/lesson-plan` endpoint**
   - Input: `{ prompt, subject, grade_level, num_sessions, duration_per_session, lernziele }`
   - Calls AI with lesson plan prompt
   - Returns structured lesson plan with N sessions
   - Each session has: title, objectives, activities (opening, direct instruction, guided practice, independent practice, closing), materials, assessment method

4. **Create `backend/routes/lessonPlans.ts`**
   - `POST /lesson-plans` — create new plan (from AI or manual)
   - `GET /lesson-plans` — list teacher's plans
   - `GET /lesson-plans/:id` — get full plan with sessions
   - `PUT /lesson-plans/:id` — update plan
   - `DELETE /lesson-plans/:id` — delete plan
   - `POST /lesson-plans/:id/generate-session/:sessionNum` — generate worksheets for a session
   - `GET /lesson-plans/:id/export` — return printable HTML

5. **Create LessonPlanner.vue**
   - Step 1: Teacher input form (subject, grade, topic, number of sessions, duration, learning objectives, style)
   - Step 2: AI generates plan → teacher reviews/edit session-by-session
   - Step 3: For each session, teacher can "Generate Worksheet" → creates blocks in worksheet builder
   - Step 4: Save plan → appears in teacher's lesson plans list
   - UI: stepper/wizard layout with edit-in-place for each session

6. **Create LessonPlanView.vue**
   - Read-only view of a saved lesson plan
   - Printable layout (CSS @media print)
   - Per-session: objectives, activity timeline, linked worksheets
   - "Clone & Edit" button → opens in LessonPlanner

7. **Update TeacherDashboard.vue**
   - Add "📋 Lesson Plans" tab
   - Shows list of saved plans with subject/grade
   - Quick action: "Create New Lesson Plan"
   - Shows lesson plans created this week/month

### Risks and Edge Cases
- AI-generated lesson plans may be too generic — include strong curriculum constraints in prompt
- Activities suggested by AI may require materials the teacher doesn't have — prompt should request common classroom materials
- Nested generation (lesson plan → worksheets → exercise blocks) may hit AI rate limits — implement with progressive loading and save-as-you-go
- Export to PDF requires an HTML-to-PDF solution (puppeteer or wkhtmltopdf) — for v1, use browser print (Ctrl+P)

---

## Verification

After each feature is implemented:

### Feature 1 — AI Provider Resilience
```bash
cd backend && npx vitest run routes/ai.test.ts
# Manual: POST /api/ai/providers → expect status 200 with providers array
# Manual: Set no API keys, POST /api/ai/generate → expect clear "no provider configured" error
# Manual: Set invalid Gemini key + valid Zen key → expect successful generation via fallback
```

### Feature 2 — Student Dashboard
```bash
cd frontend && npx vue-tsc --noEmit
# Manual: Log in as student → expect 4 tabs with data
# Manual: Student with no submissions → expect empty states
# Manual: Check chart renders correctly in Chrome and Safari
```

### Feature 3 — Adaptive Learning Paths
```bash
cd backend && npx vitest run
# Manual: Complete a Daily Mix → expect FSRS params stored in student_knowledge_state
# Manual: Create course with prerequisites → expect locked worksheets for students
```

### Feature 4 — Bildungsstandards
```bash
cd backend && npx tsc --noEmit
cd frontend && npx vue-tsc --noEmit
# Manual: Open worksheet builder with Subject=Math, Grade=3 → expect competence picker
# Manual: Assign worksheet with competences → submit → expect competence mastery updated
# Manual: Teacher dashboard → Competence tab → expect matrix with data
```

### Feature 5 — Lesson Planning
```bash
cd backend && npx vitest run
# Manual: Create lesson plan via AI → expect N sessions with structured activities
# Manual: Generate worksheet for a session → expect blocks created
# Manual: Print lesson plan → expect clean print layout
```

## Open Questions

Before proceeding, please confirm:

1. **Lehrplan data**: The file `backend/data/lehrplaene.json` wasn't found. Is there a structured curriculum data file I should use, or should we build the competence catalog from scratch based on official Bildungsstandards?

2. **Chart library preference**: Chart.js (vue-chartjs) is the most widely used — okay to add it, or prefer a different visualization approach? We could build the dashboard with pure CSS/math (no extra dependency) but it would be significantly less polished.

3. **Feature priority**: Should we do these in dependency order (1→2→3→4→5) or is there a different priority? Feature 2 (student dashboard) can be done independently. Features 4 and 5 depend on 1 but are independent of each other.

4. **Lesson plan AI prompt language**: German or English? The existing worksheet generator prompts are in English with German content. Should lesson plans be generated in German for Austrian teachers?
