# Plan: Critical System Audit & Stabilization

## Summary
I audited backend/frontend flows, quality gates, and security-sensitive code paths. The highest-impact issues are: inconsistent exercise runtime behavior (builder allows `true_false` / `ordering` but student runtime and scoring are incomplete), insecure random generation for credentials/class codes, startup side effects that overwrite worksheet library state, and backend lint failures that block clean CI. This plan fixes those first, validates with full checks, and leaves a concrete improvement backlog.

## Current State (file:line references)
- Backend lint currently fails due explicit `any` and unused variables:
  - `backend/routes/grammar.ts:10`, `:23`, `:742`, plus unused vars around `:603`, `:606`, `:764`, `:767`
  - `backend/routes/submissions.ts:144`
- Exercise type mismatch across app layers:
  - Builder supports `true_false` and `ordering` (`frontend/src/views/WorksheetBuilder.vue:441-444`, `:2889-2894`)
  - Preview handles them (`frontend/src/views/WorksheetPreview.vue:1043-1050`, `:1109-1117`)
  - Player has no main worksheet UI for them (no corresponding `block.type === 'true_false'` / `ordering` section in main block renderer; only remediation `true_false` exists at `frontend/src/views/WorksheetPlayer.vue:273-298`)
  - Scoring engine does not implement explicit `true_false` / `ordering` scoring branches (`backend/routes/scoring.ts` switch in `scoreAnswers`, around `:135+`)
- Insecure randomness in security-sensitive paths:
  - `backend/services/studentImporter.ts:36-47` uses `Math.random()` for passwords/class codes
  - `backend/routes/classes.ts:51` uses `Math.random()` for class join code
- Startup side effect overrides worksheet visibility:
  - `backend/server.ts:14-21` unconditionally sets all worksheets `in_library = 1`
- Error handling leaks internal messages:
  - `backend/middleware/errorHandler.ts:9` returns raw `err.message` for all statuses
- UX inconsistency for remediation rounds:
  - UI says up to 2 rounds / `used x/2` while backend allows 3 (`frontend/src/views/WorksheetPlayer.vue:98`, `:108`; backend `MAX_REMEDIATION_ROUNDS = 3` in `backend/routes/submissions.ts:19`)
- Automated test depth is still thin for scoring edge cases:
  - Only broad sanity and selected AI/validate tests exist (`backend/app.test.ts`, `backend/routes/ai.test.ts`, `backend/middleware/validate.test.ts`)

## Approach
Use a risk-first remediation sequence:
1. Restore quality gate cleanliness (lint blockers) to ensure reliable iteration.
2. Fix security-sensitive randomness and class code uniqueness.
3. Remove accidental destructive startup behavior.
4. Align exercise support end-to-end (UI + scoring) for `true_false`/`ordering`.
5. Add targeted tests for newly fixed scoring behavior.
6. Run full verification and clean warnings where practical.

This minimizes regression risk while addressing the most user-visible and security-relevant problems.

## Files to Change
| File | Change type | Planned change |
|---|---|---|
| `backend/routes/grammar.ts` | Refactor | Replace `any` with typed interfaces, remove unused vars, replace console logging with structured logger |
| `backend/routes/submissions.ts` | Refactor | Remove explicit `any` typing in category scoring path |
| `backend/services/studentImporter.ts` | Security hardening | Replace `Math.random()` with `crypto.randomInt()` for password/class code generation |
| `backend/routes/classes.ts` | Security + reliability | Generate secure class codes and enforce uniqueness against DB |
| `backend/server.ts` | Behavior fix | Remove or guard unconditional startup publish-all update |
| `backend/middleware/errorHandler.ts` | Security hardening | Avoid leaking internal error details for 500-level errors |
| `backend/routes/scoring.ts` | Functional fix | Add robust scoring logic for `true_false` and `ordering` |
| `frontend/src/views/WorksheetPlayer.vue` | Functional + UX fix | Add main worksheet interaction UI for `true_false` + `ordering`, normalize submission payload for ordering, fix remediation rounds text consistency |
| `backend/routes/scoring.test.ts` (new) | Tests | Add tests for `true_false`/`ordering` scoring behavior |
| `frontend/src/views/WorksheetBuilder.vue` and `frontend/src/views/WorksheetPlayer.vue` | Cleanup | Resolve current template-shadow lint warnings for a clean output |

## Step-by-Step Execution
1. [x] Fix lint-blocking types/warnings in backend (`grammar.ts`, `submissions.ts`) so backend lint can pass.
2. [x] Harden random generation in `studentImporter.ts` and class code creation in `classes.ts` with secure randomness + collision-safe generation.
3. [x] Remove/guard startup auto-publish behavior in `server.ts`.
4. [x] Harden `errorHandler.ts` to return generic messages for internal server errors.
5. [x] Implement `true_false` and `ordering` handling in `scoring.ts` and ensure compatibility with existing answer formats.
6. [x] Add/adjust main worksheet UI in `WorksheetPlayer.vue` for `true_false` + `ordering`, including submission normalization.
7. [x] Fix remediation rounds copy/labels to match backend max rounds.
8. [x] Add focused tests for scoring regressions (`backend/routes/scoring.test.ts`).
9. [x] Clean remaining frontend lint warnings (`vue/no-template-shadow`) in the warned templates.
10. [x] Verify with full checks and fix any regressions.

## Risks and Edge Cases
- Existing worksheets may store `true_false` and `ordering` answers in multiple historical formats; scoring must accept booleans, strings, and numeric representations.
- Changing class-code generation must preserve UX format (`xxxx-xxxx`) while preventing collisions.
- Startup behavior change may alter current deployment assumptions if someone relied on auto-publish-all; mitigation is to support an explicit opt-in env flag if needed.
- Ordering exercises may assume author-provided order is canonical; runtime interaction should not mutate source-of-truth unexpectedly.

## Verification
- Backend lint: `npm run lint --workspace backend`
- Frontend lint: `npm run lint --workspace frontend`
- Backend tests: `npm test --workspace backend`
- Frontend tests: `npm test --workspace frontend`
- Backend build: `npm run build --workspace backend`
- Frontend build: `npm run build --workspace frontend`

## Open Questions
None blocking. Assumption: startup auto-publish-all is unintended and should be removed (or made explicit opt-in).
