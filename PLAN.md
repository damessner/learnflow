# Plan: Expand Grammar Academy Quizzes & Open in Separate Tab

## Summary
The Grammar Academy currently has only 5 questions per level (Explorer/Pioneer/Master) per topic and 10 questions for the AI Finisher Quiz. The user wants these **much longer** (target: ~15 per level, ~20 for the quiz). Also, the worksheet player is currently a modal overlay — open it as a **separate route/tab** instead.

## Current State

### Backend — `backend/routes/grammar.ts`
- **Topics 1-3** (`grammar-1-plurals`, `grammar-2-tobe`, `grammar-3-havegot`): Fully hardcoded with **5 Explorer MC, 5 Pioneer FITB, 5 Master text** questions each.
- **Topics 4-15**: Dynamically generated with **5 placeholder questions** per level.
- **AI Finisher Quiz** (`/quiz/generate`): Generates **10 questions** (static template).
- `resetWorksheetPlayer()` in frontend hardcodes `{ 0: null, 1: null, 2: null, 3: null, 4: null }` — only 5 slots.
- Quiz UI references "Frage X von 10" hardcoded.

### Frontend — `frontend/src/views/GrammarAcademy.vue`
- **`getWorksheetQuestions()`**: Has duplicate hardcoded questions for topics 1-3 (5 each) and fallback generators for 4-15 (5 each).
- **Worksheet player**: Modal overlay, not a separate route.
- **Quiz**: "Frage {{ quizCurrentIdx + 1 }} von 10" and button logic assumes 10 questions.

### Router — `frontend/src/router/index.ts`
- Grammar Academy is at `/grammar-academy` (already a separate route).

## Approach

1. **Expand backend questions with varied types** — Add ~15 questions per level per topic with variety:
   - **Explorer**: Mix of MC, True/False, "Which sentence is correct?," multiple-choice ordering
   - **Pioneer**: Mix of FITB, unscramble-and-write, word formation, sentence completion
   - **Master**: Mix of error correction, translation (both directions), sentence rewriting, combining sentences
2. **Expand AI Finisher Quiz** — From 10 to 20 mixed-type questions.
3. **Expand frontend client-side questions** — Match the backend expansions.
4. **Add instruction screen with Mermaid diagram before each level** — Before the worksheet starts, show:
   - A kid-friendly **instruction card** explaining the grammar rule for that topic
   - A **Mermaid diagram** visualizing the grammar concept (e.g., conjugation flow, plural formation, preposition map)
   - Emoji-rich, colorful design with playful language
   - A "Los geht's!" button to start the questions
5. **Open worksheet as sub-route** — Navigate to `/grammar-academy/:topicId/:level` instead of modal overlay.
6. **Fix hardcoded lengths** — `resetWorksheetPlayer()`, "von 10" label, button logic.

## Files to Change

| File | Change Type | What |
|------|-------------|------|
| `backend/routes/grammar.ts` | Edit | Expand topics 1-3 questions to ~15 each with variety; expand topic 4-15 to ~15 real questions; expand quiz to 20 mixed-type questions |
| `frontend/src/views/GrammarAcademy.vue` | Edit | Expand client-side questions to match; add instruction+Mermaid screen before worksheet; remove hardcoded 5; update quiz to 20; add sub-route support |
| `frontend/src/router/index.ts` | Edit | Add `/grammar-academy/:topicId/:level` route for dedicated worksheet view |
| `frontend/package.json` | Edit | Add `mermaid` dependency if not present |

## Step-by-Step Execution

### Step 1: Expand backend topics 1-3 (15 questions per level)
Edit `backend/routes/grammar.ts` — expand each of `grammar-1-plurals`, `grammar-2-tobe`, `grammar-3-havegot` arrays from 5 to ~15 questions.

### Step 2: Expand backend topics 4-15 (15 placeholder questions)
Edit `backend/routes/grammar.ts` — increase the `for` loop generation from 5 to ~15, add variety to the generated questions.

### Step 3: Expand AI Finisher Quiz to 20 questions
Edit `backend/routes/grammar.ts` — add 10 more unique questions to the `generatedQuestions` array (line ~674).

### Step 4: Update frontend client-side questions
Edit `GrammarAcademy.vue` — expand the hardcoded questions in `getWorksheetQuestions()` to match backend.

### Step 5: Add instruction + Mermaid diagram screen before worksheet
Edit `GrammarAcademy.vue` — Add an `instructionPhase` before the worksheet starts:
- Create a `getTopicExplanation(topicId, level)` function returning emoji-rich instruction text + Mermaid diagram definition
- Display instruction card with diagram before showing questions
- "Los geht's!" button transitions to the worksheet
- Install/ensure `mermaid` npm package is available in frontend

### Step 6: Fix hardcoded 5-question assumption
Edit `GrammarAcademy.vue` — `resetWorksheetPlayer()` should initialize dynamically based on actual question count.

### Step 7: Update quiz UI from "von 10" to dynamic count
Edit `GrammarAcademy.vue` — "Frage {{ quizCurrentIdx + 1 }} von 10" → use `quizQuestions.length`, fix button logic.

### Step 8: Open worksheet as sub-route
- Create a new `GrammarWorksheetView.vue` component extracted from the modal portion of `GrammarAcademy.vue`
- Add `/grammar-academy/:topicId/:level` route in `router/index.ts`
- Wire up navigation from the start buttons

## Risks and Edge Cases
- **CSRF token** — worksheet submission uses cookie-based CSRF; must ensure it works on the new route.
- **State sharing** — progress state is fetched on mount; the separate route will need to refetch or receive topic data.
- **Backward compatibility** — existing users with progress in the JSON file must still work.

## Verification
1. Server starts without errors (`npm run dev` in backend)
2. Frontend builds without errors (`npm run build` in frontend)
3. `/api/grammar/topics` returns 15+ questions per level
4. `/api/grammar/topics/:id/quiz/generate` returns 20 questions
5. Instruction screen shows before worksheet with Mermaid diagram rendering
6. Worksheet player shows all questions (not just 5)
7. Quiz shows all 20 questions with correct counter

## Open Questions
1. **"Open in separate tab"**: Should the worksheet *player* (currently a modal) open as a new browser tab (`window.open`), or should it navigate to a sub-route within the app? I'll implement it as a sub-route since it keeps the app context.
2. **Question content**: Should I write actual grammar content for the expanded questions in topics 4-15, or keep them as varied but sensible placeholders with real grammar structure? **Update**: Will write real, varied grammar questions for all topics — topics 1-3 get expanded with more variety, topics 4-15 get proper questions instead of placeholders.
