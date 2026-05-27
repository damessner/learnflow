<template>
  <div class="page">
    <h2 v-if="worksheet">{{ worksheet.title }}</h2>
    <p v-if="worksheet" style="color: var(--text-muted); margin-bottom: 1rem">
      {{ worksheet.description }}
    </p>

    <div v-if="assignment?.due_date" class="card" style="margin-bottom: 1rem; padding: 0.75rem 1rem">
      <strong>Due:</strong>
      <span :style="{ color: isOverdue && !submitted ? 'var(--danger)' : 'var(--text-main)', marginLeft: '0.35rem' }">
        {{ new Date(assignment.due_date).toLocaleString() }}
      </span>
      <span v-if="isOverdue && !submitted" class="badge-danger badge" style="margin-left: 0.5rem">Overdue</span>
    </div>

    <div
      v-if="submitted"
      class="card"
      style="background: var(--success); color: #fff; margin-bottom: 1rem"
    >
      <h3>Submitted!</h3>
      <p>Score: {{ submitResult.score }} / {{ submitResult.maxScore }}</p>
      <div
        v-if="submitResult.gritBonusAwarded"
        style="
          background: rgba(253, 224, 71, 0.2);
          border: 1px solid #fde047;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 700;
          color: #fef08a;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.5rem 0;
          width: 100%;
          box-sizing: border-box;
        "
      >
        🔥 Grit Boost! +150 XP for Retake Improvement!
      </div>
      <p v-if="submitResult.xpEarned">XP: +{{ submitResult.xpEarned }}</p>
      <p v-if="submitResult.xpLost" style="color: var(--danger-light)">
        XP Lost: -{{ submitResult.xpLost }}
      </p>
      <div v-if="submitResult.wageringResults?.length">
        <p style="margin-top: 0.5rem; font-size: 0.9rem">Wagering Results:</p>
        <div
          v-for="wr in submitResult.wageringResults"
          :key="wr.blockId"
          style="font-size: 0.85rem; opacity: 0.9"
        >
          {{ wr.correct ? 'Correct' : 'Missed' }} — wagered {{ wr.wagered }} XP →
          {{ wr.earned > 0 ? '+' + wr.earned : wr.earned }} XP
        </div>
      </div>
      <p>{{ submitResult.feedback }}</p>
    </div>

    <div v-if="submitted" class="card" style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap">
        <h3 style="margin:0">🧠 Personalisierte Nacharbeit</h3>
        <button
          class="btn-primary"
          :disabled="remediationLoading || remediationGenerating || !remediationData?.canGenerateRound"
          @click="generateRemediationRound"
        >
          {{ remediationGenerating ? 'Generating...' : `Generate Round (${remediationData?.roundsLeft ?? 0} left)` }}
        </button>
      </div>

      <p style="margin:0.35rem 0 0.6rem;color:var(--text-muted);font-size:0.85rem">
        KI analysiert deine Fehler und erstellt bis zu 2 individuelle Übungsrunden.
      </p>

      <div v-if="remediationLoading" style="color:var(--text-muted)">Loading remediation…</div>
      <div v-else-if="!remediationData" style="color:var(--text-muted)">No remediation data yet.</div>
      <div v-else>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.5rem">
          <span class="badge">Wrong blocks: {{ remediationData.wrongBlocks?.length || 0 }}</span>
          <span class="badge">Rounds used: {{ remediationData.roundsUsed || 0 }}/2</span>
        </div>

        <div v-if="(remediationData.wrongBlocks || []).length" style="margin-bottom:0.5rem">
          <h4 style="margin:0 0 0.35rem;font-size:0.95rem">Fehlerübersicht</h4>
          <ul style="margin:0;padding-left:1rem">
            <li v-for="wb in remediationData.wrongBlocks" :key="wb.blockId" style="margin-bottom:0.2rem">
              <strong>{{ wb.blockType }}</strong>: {{ wb.blockText }}
            </li>
          </ul>
        </div>

        <div v-if="!(remediationData.rounds || []).length" style="color:var(--text-muted)">
          Noch keine KI-Nacharbeit erstellt. Klicke auf "Generate Round".
        </div>

        <div
          v-for="round in remediationData.rounds || []"
          :key="round.id"
          class="card"
          style="padding:0.75rem;margin-top:0.5rem;border:1px solid var(--border-color)"
        >
          <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap">
            <strong>Round {{ round.round_number }}</strong>
            <span style="font-size:0.75rem;color:var(--text-muted)">{{ new Date(round.created_at).toLocaleString() }}</span>
          </div>

          <p style="margin:0.4rem 0 0.5rem">{{ round.analysis?.summary }}</p>

          <div v-if="round.analysis?.misconceptions?.length" style="margin-bottom:0.45rem">
            <strong style="font-size:0.85rem">Misconceptions:</strong>
            <ul style="margin:0.25rem 0 0;padding-left:1rem">
              <li v-for="m in round.analysis.misconceptions" :key="m">{{ m }}</li>
            </ul>
          </div>

          <div v-if="round.analysis?.custom_instructions?.length" style="margin-bottom:0.45rem">
            <strong style="font-size:0.85rem">Custom instructions:</strong>
            <ol style="margin:0.25rem 0 0;padding-left:1rem">
              <li v-for="c in round.analysis.custom_instructions" :key="c">{{ c }}</li>
            </ol>
          </div>

          <MermaidDiagram
            v-if="round.analysis?.mermaid"
            :code="round.analysis.mermaid"
            alt-text="Remediation diagram"
            style="margin-bottom:0.5rem"
          />

          <div v-if="round.exercises?.length">
            <strong style="font-size:0.85rem">Individual exercises:</strong>
            <div
              v-for="(ex, exIdx) in round.exercises"
              :key="`${round.id}_${exIdx}`"
              style="margin-top:0.35rem;padding:0.6rem;border:1px dashed var(--border-color);border-radius:6px"
            >
              <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap">
                <div style="font-weight:600">{{ ex.title }}</div>
                <div style="display:flex;gap:0.35rem;align-items:center">
                  <span class="badge" style="font-size:0.7rem">{{ ex.type }}</span>
                  <span class="badge" style="font-size:0.7rem">{{ ex.points ?? 0 }} pts</span>
                </div>
              </div>

              <div v-if="ex.prompt" style="white-space:pre-wrap;margin-top:0.35rem">{{ ex.prompt }}</div>
              <div v-if="ex.problem_text" style="white-space:pre-wrap;margin-top:0.35rem">{{ ex.problem_text }}</div>

              <div style="margin-top:0.5rem">
                <template v-if="ex.type === 'gap_fill'">
                  <template v-for="seg in getGapSegments(ex.template || '')" :key="`${round.id}_${getRemediationExerciseId(ex, exIdx)}_${seg.key}`">
                    <span v-if="seg.type === 'text'" style="white-space: pre-wrap">{{ seg.text }}</span>
                    <input
                      v-else
                      type="text"
                      :value="remediationRoundResponses[round.id]?.[getRemediationExerciseId(ex, exIdx)]?.[String(seg.index)] || ''"
                      @input="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)][String(seg.index)] = ($event.target as HTMLInputElement).value"
                      style="display:inline;width:auto;min-width:80px;padding:0.2rem 0.5rem;border:1px dashed var(--primary);border-radius:4px"
                    />
                  </template>
                </template>

                <template v-else-if="ex.type === 'multiple_choice'">
                  <div v-for="(opt, oi) in ex.options || []" :key="oi" style="margin:0.2rem 0">
                    <label style="display:flex;align-items:center;gap:0.5rem">
                      <input
                        v-model="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]"
                        type="checkbox"
                        :value="oi"
                      />
                      {{ opt }}
                    </label>
                  </div>
                </template>

                <template v-else-if="ex.type === 'single_choice'">
                  <div v-for="(opt, oi) in ex.options || []" :key="oi" style="margin:0.2rem 0">
                    <label style="display:flex;align-items:center;gap:0.5rem">
                      <input
                        v-model="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]"
                        type="radio"
                        :value="oi"
                        :name="`rem_sc_${round.id}_${getRemediationExerciseId(ex, exIdx)}`"
                      />
                      {{ opt }}
                    </label>
                  </div>
                </template>

                <template v-else-if="ex.type === 'true_false'">
                  <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
                    <label style="display:flex;align-items:center;gap:0.35rem">
                      <input
                        v-model="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]"
                        type="radio"
                        :value="1"
                        :name="`rem_tf_${round.id}_${getRemediationExerciseId(ex, exIdx)}`"
                      />
                      True
                    </label>
                    <label style="display:flex;align-items:center;gap:0.35rem">
                      <input
                        v-model="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]"
                        type="radio"
                        :value="0"
                        :name="`rem_tf_${round.id}_${getRemediationExerciseId(ex, exIdx)}`"
                      />
                      False
                    </label>
                  </div>
                </template>

                <template v-else-if="ex.type === 'matching'">
                  <div
                    v-for="(pair, pi) in ex.pairs || []"
                    :key="pi"
                    style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.25rem"
                  >
                    <span style="min-width:120px">{{ pair[0] }}</span>
                    <input
                      v-model="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)][String(pi)]"
                      :placeholder="'Match for ' + pair[0]"
                    />
                  </div>
                </template>

                <template v-else-if="ex.type === 'word_scramble'">
                  <div
                    v-for="(w, wi) in ex.words || []"
                    :key="wi"
                    style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.25rem"
                  >
                    <span style="font-family: monospace; letter-spacing: 2px">
                      {{ getRemediationScrambled(String(round.id), getRemediationExerciseId(ex, exIdx), wi, w.word) }}
                    </span>
                    <input
                      v-model="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)][wi]"
                      placeholder="Unscramble"
                    />
                  </div>
                </template>

                <template v-else-if="ex.type === 'word_problem'">
                  <div v-for="(step, si) in ex.steps || []" :key="si" style="margin-bottom:0.35rem">
                    <label style="display:block;font-size:0.8rem;color:var(--text-muted)">
                      Step {{ si + 1 }}: {{ step.description }}
                    </label>
                    <input v-model="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)][String(si)]" />
                  </div>
                  <label style="display:block;font-size:0.8rem;color:var(--text-muted)">Final answer</label>
                  <input v-model="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)].final_answer" />
                </template>

                <template v-else-if="ex.type === 'fraction_input'">
                  <div style="display:flex;gap:0.5rem;align-items:center">
                    <input
                      v-model.number="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)].numerator"
                      type="number"
                      placeholder="Numerator"
                      style="width:120px"
                    />
                    <span>/</span>
                    <input
                      v-model.number="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)].denominator"
                      type="number"
                      placeholder="Denominator"
                      style="width:120px"
                    />
                  </div>
                </template>

                <template v-else-if="ex.type === 'number_line'">
                  <input
                    v-model.number="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]"
                    type="number"
                    placeholder="Pick a number"
                    style="width:180px"
                  />
                </template>

                <template v-else-if="ex.type === 'graph_plot'">
                  <textarea
                    v-model="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]"
                    rows="2"
                    placeholder="Enter points as x,y; x,y"
                  ></textarea>
                </template>

                <template v-else-if="ex.type === 'geometry_shape'">
                  <input
                    v-model="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)].shape_name"
                    placeholder="Shape name"
                  />
                </template>

                <template v-else-if="ex.type === 'short_answer'">
                  <textarea
                    v-model="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]"
                    rows="3"
                    placeholder="Your answer..."
                  ></textarea>
                </template>

                <template v-else>
                  <input
                    v-model="remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]"
                    placeholder="Your answer"
                  />
                </template>
              </div>

              <div v-if="ex.answer_hint" style="font-size:0.8rem;color:var(--text-muted);margin-top:0.25rem">
                Hint: {{ ex.answer_hint }}
              </div>
            </div>

            <div style="margin-top:0.6rem;display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
              <button
                class="btn-primary btn-sm"
                :disabled="remediationRoundSubmitting[round.id]"
                @click="submitRoundResponses(round)"
              >
                {{ remediationRoundSubmitting[round.id] ? 'Submitting...' : 'Submit Round Responses' }}
              </button>
              <span
                v-if="remediationRoundResults[round.id]"
                class="badge"
              >
                Score: {{ remediationRoundResults[round.id].score }}/{{ remediationRoundResults[round.id].maxScore }} ·
                Correct: {{ remediationRoundResults[round.id].exercises_correct }}/{{ remediationRoundResults[round.id].exercises_attempted }}
              </span>
              <span
                v-else-if="getRoundHistoryMetrics(round.round_number)"
                class="badge"
              >
                Attempts: {{ getRoundHistoryMetrics(round.round_number)?.exercises_attempted || 0 }} ·
                Correct: {{ getRoundHistoryMetrics(round.round_number)?.exercises_correct || 0 }} ·
                Time: {{ getRoundHistoryMetrics(round.round_number)?.time_spent_seconds || 0 }}s
              </span>
            </div>

            <div style="margin-top:0.55rem">
              <label style="display:block;font-size:0.8rem;color:var(--text-muted);margin-bottom:0.25rem">
                Self-assessment (min. 10 chars): What did you understand better after this round?
              </label>
              <textarea
                v-model="remediationSelfAssessments[round.id]"
                rows="2"
                placeholder="I understood that..."
              ></textarea>
              <div style="margin-top:0.4rem">
                <button
                  class="btn-sm"
                  :disabled="remediationSelfAssessmentSaving[round.id]"
                  @click="submitRoundSelfAssessment(round)"
                >
                  {{ remediationSelfAssessmentSaving[round.id] ? 'Saving...' : 'Save Reflection' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top:0.75rem;border-top:1px solid var(--border-color);padding-top:0.6rem">
          <h4 style="margin:0 0 0.35rem;font-size:0.9rem">Your remediation history (this worksheet)</h4>
          <div v-if="remediationHistoryLoading" style="color:var(--text-muted);font-size:0.8rem">Loading history…</div>
          <div v-else-if="!currentAssignmentRemediationHistory" style="color:var(--text-muted);font-size:0.8rem">
            No completed history yet.
          </div>
          <div v-else style="display:flex;gap:0.45rem;flex-wrap:wrap">
            <span class="badge">Rounds: {{ currentAssignmentRemediationHistory.round_count || 0 }}</span>
            <span class="badge">Attempted: {{ currentAssignmentRemediationHistory.attempted || 0 }}</span>
            <span class="badge">Correct: {{ currentAssignmentRemediationHistory.correct || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="!submitted && blocks.length > 0"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      "
    >
      <div v-if="gamXp != null" style="display: flex; align-items: center; gap: 0.5rem">
        <span style="font-weight: 600">Your XP:</span>
        <span class="badge" style="background: var(--warning); color: #000">{{ gamXp }} XP</span>
      </div>
      <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer">
        <input type="checkbox" v-model="progressiveMode" />
        <span title="Reduces cognitive load by showing one question at a time">🧘 Focus Mode</span>
      </label>
    </div>

    <div
      v-for="(block, idx) in blocks"
      :key="block.id"
      class="card block-item"
      :style="getProgressiveStyle(idx)"
      style="margin-bottom: 0.5rem; transition: all 0.4s ease"
    >
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem">
        <strong>{{ block.type.replace(/_/g, ' ') }}</strong>
        <span class="badge">{{ block.points }} pts</span>
      </div>

      <MermaidDiagram v-if="block.mermaid" :code="block.mermaid" :alt-text="block.alt_text" />

      <template v-if="block.type === 'gap_fill'">
        <div>
          <template v-for="seg in getGapSegments(block.template)" :key="seg.key">
            <span v-if="seg.type === 'text'" style="white-space: pre-wrap">{{ seg.text }}</span>
            <input
              v-else-if="seg.type === 'gap'"
              type="text"
              :value="getGapValue(block.id, seg.index)"
              @input="setGapValue(block.id, seg.index, ($event.target as HTMLInputElement).value)"
              style="display:inline;width:auto;min-width:80px;padding:0.2rem 0.5rem;border:1px dashed var(--primary);border-radius:4px"
            />
          </template>
        </div>
      </template>

      <template v-if="block.type === 'multiple_choice'">
        <div v-for="(opt, oi) in block.options || []" :key="oi">
          <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0">
            <input v-model="answers[block.id]" type="checkbox" :value="oi" />
            {{ opt }}
          </label>
        </div>
      </template>

      <template v-if="block.type === 'single_choice'">
        <div v-for="(opt, oi) in block.options || []" :key="oi">
          <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0">
            <input v-model="answers[block.id]" type="radio" :value="oi" :name="block.id" />
            {{ opt }}
          </label>
        </div>
      </template>

      <template v-if="block.type === 'matching'">
        <div
          v-for="(pair, pi) in block.pairs || []"
          :key="pi"
          style="display: flex; gap: 0.5rem; margin-bottom: 0.25rem"
        >
          <span>{{ pair[0] }}</span>
          <input v-model="answers[block.id][pi]" :placeholder="'Match for ' + pair[0]" />
        </div>
      </template>

      <template v-if="block.type === 'short_answer'">
        <textarea v-model="answers[block.id]" rows="3" placeholder="Your answer..."></textarea>
      </template>

      <template v-if="block.type === 'text' || block.type === 'read_aloud'">
        <div style="white-space: pre-wrap">{{ block.text }}</div>
      </template>

      <template v-if="block.type === 'info_box'">
        <div
          @click="toggleInfoBox(block.id)"
          style="
            cursor: pointer;
            background: var(--primary-light);
            border: 1px solid var(--primary-soft);
            border-radius: var(--radius-md);
            padding: 0.75rem 1rem;
            transition: all var(--transition);
            user-select: none;
          "
        >
          <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: var(--primary)">
            <span style="font-size: 1.1rem">💡</span>
            <span style="flex: 1">{{ block.title || 'Click to learn more' }}</span>
            <span style="font-size: 0.85rem; color: var(--text-muted)">{{ infoBoxOpen[block.id] ? '▼' : '▶' }}</span>
          </div>
          <div
            v-if="infoBoxOpen[block.id]"
            style="
              margin-top: 0.75rem;
              padding-top: 0.75rem;
              border-top: 1px solid var(--primary-soft);
              color: var(--text-main);
              font-size: 0.9rem;
              line-height: 1.7;
            "
          >
            <div style="white-space: pre-wrap">{{ block.text }}</div>
            <MermaidDiagram
              v-if="block.mermaid"
              :code="block.mermaid"
              :alt-text="block.alt_text"
              style="margin-top: 0.75rem"
            />
          </div>
        </div>
      </template>

      <template v-if="block.type === 'word_scramble'">
        <div
          v-for="(w, wi) in block.words || []"
          :key="wi"
          style="display: flex; gap: 0.5rem; margin-bottom: 0.25rem"
        >
          <span style="font-family: monospace; letter-spacing: 3px">{{ getScrambled(block.id, wi) }}</span>
          <input v-model="answers[block.id][wi]" placeholder="Unscramble" />
        </div>
      </template>

      <template v-if="block.type === 'number_line'">
        <NumberLine v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'equation_entry'">
        <EquationInput v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'fraction_input'">
        <FractionInput v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <!-- Fraction Model (visual aid — always shown) -->
      <template v-if="block.type === 'fraction_model'">
        <div style="margin-bottom:0.5rem" v-if="block.text">{{ block.text }}</div>
        <div style="display:flex;justify-content:center;padding:0.75rem">
          <svg :viewBox="playerFractionViewBox(block)" width="220" height="auto" style="max-width:100%">
            <template v-if="block.model_type === 'circle'">
              <g v-for="i in playerFractionIndices(block)" :key="i">
                <path :d="playerFractionSlicePath(i, block)" :fill="i < (block.numerator || 0) ? '#3b82f6' : '#f3f4f6'" stroke="#94a3b8" stroke-width="1" />
              </g>
              <circle cx="100" cy="100" r="98" fill="none" stroke="#64748b" stroke-width="1.5" />
              <text v-if="block.show_labels" x="100" y="105" text-anchor="middle" font-size="16" font-weight="600" fill="#1e293b">
                {{ block.numerator || 0 }}/{{ block.denominator || 1 }}
              </text>
            </template>
            <template v-else>
              <g v-for="i in playerFractionIndices(block)" :key="i">
                <rect :x="i * (240 / Math.max(1, block.denominator || 1))" y="0"
                  :width="Math.max(0, (240 / Math.max(1, block.denominator || 1)) - 1)" height="60"
                  :fill="i < (block.numerator || 0) ? '#3b82f6' : '#f3f4f6'" stroke="#94a3b8" stroke-width="1" rx="2" />
              </g>
              <text v-if="block.show_labels" x="120" y="82" text-anchor="middle" font-size="14" font-weight="600" fill="#1e293b">
                {{ block.numerator || 0 }}/{{ block.denominator || 1 }}
              </text>
            </template>
          </svg>
        </div>
      </template>

      <template v-if="block.type === 'arithmetic_grid'">
        <ArithmeticGrid v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'graph_plot'">
        <GraphPlot v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'geometry_shape'">
        <GeometryShape v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'word_problem'">
        <WordProblem v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'vocabulary'">
        <Vocabulary v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'contextual_dialogue'">
        <ContextualDialogue v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'semantic_sorter'">
        <SemanticSorter v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'flashcards'">
        <Flashcards :block="block" v-model="answers[block.id]" :readonly="readonly" />
      </template>

      <template v-if="block.type === 'memory_match'">
        <MemoryMatch v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'drag_drop'">
        <DragDrop v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <div
        v-if="!submitted"
        style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color)"
      >
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem">
          <label style="font-size: 0.8rem; white-space: nowrap">Wager XP:</label>
          <input
            type="range"
            v-model.number="wagers[block.id]"
            :min="0"
            :max="gamXp || 100"
            step="10"
            style="flex: 1"
          />
          <span style="font-size: 0.8rem; min-width: 40px; text-align: right"
            >{{ wagers[block.id] || 0 }} XP</span
          >
        </div>
        <div style="display: flex; gap: 0.75rem; font-size: 0.75rem; color: var(--text-muted)">
          <label
            ><input type="radio" v-model="blockConfidence[block.id]" value="1" /> Guessing</label
          >
          <label><input type="radio" v-model="blockConfidence[block.id]" value="3" /> Unsure</label>
          <label
            ><input type="radio" v-model="blockConfidence[block.id]" value="5" /> Confident</label
          >
        </div>
      </div>

      <div
        v-if="progressiveMode && idx === currentBlockIndex && idx < blocks.length - 1"
        style="margin-top: 1rem; text-align: right"
      >
        <button class="btn-primary" @click="currentBlockIndex++">Next Question ↓</button>
      </div>
    </div>

    <div
      v-if="!submitted && (!progressiveMode || currentBlockIndex === blocks.length - 1)"
      style="display: flex; gap: 0.5rem; margin-top: 1rem; justify-content: flex-end"
    >
      <button
        class="btn-primary"
        @click="openTutor"
        style="background: #0ea5e9; border-color: #0ea5e9"
      >
        🤖 Ask Socratic Tutor
      </button>
      <button :disabled="saving" @click="saveProgress">Save</button>
      <button class="btn-primary" :disabled="submitting" @click="submit">Submit Assignment</button>
    </div>

    <!-- Socratic Tutor Modal -->
    <div
      v-if="tutorOpen"
      class="modal"
      style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      "
    >
      <div
        class="card"
        style="
          width: 500px;
          max-width: 90%;
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
          max-height: 80vh;
        "
      >
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem">
          <h3>🤖 Socratic Tutor</h3>
          <button
            @click="tutorOpen = false"
            style="background: none; border: none; font-size: 1.5rem; cursor: pointer"
          >
            &times;
          </button>
        </div>
        <div
          style="
            flex: 1;
            overflow-y: auto;
            border: 1px solid var(--border-color);
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 4px;
            background: var(--bg-main);
          "
        >
          <div
            v-for="(msg, i) in tutorMessages"
            :key="i"
            :style="{ textAlign: msg.role === 'user' ? 'right' : 'left', marginBottom: '0.5rem' }"
          >
            <span
              :style="{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                borderRadius: '1rem',
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--border-color)',
                color: msg.role === 'user' ? '#fff' : 'inherit',
              }"
              >{{ msg.text }}</span
            >
          </div>
          <div v-if="tutorLoading" style="color: var(--text-muted); font-size: 0.9rem">
            Tutor is typing...
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem">
          <input
            v-model="tutorInput"
            @keyup.enter="sendToTutor"
            placeholder="I'm stuck on..."
            style="flex: 1"
          />
          <button class="btn-primary" @click="sendToTutor" :disabled="tutorLoading">Ask</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSubmissionsStore } from '../stores/submissions'
import { useUiStore } from '../stores/ui'
import { useLearningStore } from '../stores/learning'
import { buildApiHeaders } from '../services/api'
import { audioSynth } from '../utils/audioSynth'
import MermaidDiagram from '../components/exercises/MermaidDiagram.vue'
import NumberLine from '../components/exercises/NumberLine.vue'
import EquationInput from '../components/exercises/EquationInput.vue'
import FractionInput from '../components/exercises/FractionInput.vue'
import ArithmeticGrid from '../components/exercises/ArithmeticGrid.vue'
import GraphPlot from '../components/exercises/GraphPlot.vue'
import GeometryShape from '../components/exercises/GeometryShape.vue'
import WordProblem from '../components/exercises/WordProblem.vue'
import Vocabulary from '../components/exercises/Vocabulary.vue'
import ContextualDialogue from '../components/exercises/ContextualDialogue.vue'
import SemanticSorter from '../components/exercises/SemanticSorter.vue'
import Flashcards from '../components/exercises/Flashcards.vue'
import MemoryMatch from '../components/exercises/MemoryMatch.vue'
import DragDrop from '../components/exercises/DragDrop.vue'

const route = useRoute()
const store = useSubmissionsStore()
const uiStore = useUiStore()
const learningStore = useLearningStore()

const worksheet = ref(null)
const assignment = ref(null)
const blocks = ref([])
const answers = reactive({})
const submitted = ref(false)
const readonly = ref(false)
const submitResult = ref({ score: 0, maxScore: 0, feedback: '' })
const saving = ref(false)
const submitting = ref(false)

const wagers = reactive({})
const blockConfidence = reactive({})
const gamXp = ref(null)
const infoBoxOpen = reactive({})

function toggleInfoBox(id) {
  infoBoxOpen[id] = !infoBoxOpen[id]
}

const progressiveMode = ref(false)
const currentBlockIndex = ref(0)
const isOverdue = computed(() => {
  if (!assignment.value?.due_date) return false
  return new Date(assignment.value.due_date) < new Date()
})

const tutorOpen = ref(false)
const tutorInput = ref('')
const tutorMessages = ref([
  {
    role: 'tutor',
    text: 'Hi! I am your Socratic Tutor. I will not give you the answers directly, but I will help you find them yourself. What are you stuck on?',
  },
])
const tutorLoading = ref(false)

const remediationData = ref(null)
const remediationLoading = ref(false)
const remediationGenerating = ref(false)
const remediationHistory = ref([])
const remediationHistoryLoading = ref(false)
const remediationRoundResponses = reactive({})
const remediationRoundSubmitting = reactive({})
const remediationRoundResults = reactive({})
const remediationSelfAssessments = reactive({})
const remediationSelfAssessmentSaving = reactive({})
const remediationRoundStartedAt = reactive({})
const remediationScrambleCache = reactive({})

const initialized = ref(false)
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null
let lastSavedPayload = ''

onMounted(async () => {
  try {
    const data = await store.fetchAssignmentSubmission(route.params.id)
    worksheet.value = data.worksheet
    assignment.value = data.assignment
    try {
      const content = JSON.parse(data.worksheet.content)
      blocks.value = content.blocks || []
    } catch (e) {
      console.warn('Failed to parse worksheet content:', e)
      blocks.value = []
    }

    if (data.submission.answers) {
      try {
        const saved = JSON.parse(data.submission.answers)
        applySavedProgress(saved)
        lastSavedPayload = JSON.stringify(getProgressPayload())
      } catch (e) {
        console.warn('Failed to parse server saved progress:', e)
      }
    }

    if (blocks.value.length) {
      for (const b of blocks.value) {
        if (answers[b.id] === undefined) {
          if (b.type === 'multiple_choice') answers[b.id] = []
          else if (b.type === 'matching') answers[b.id] = {}
          else if (b.type === 'word_scramble') answers[b.id] = []
          else if (b.type === 'single_choice') answers[b.id] = null
          else if (b.type === 'gap_fill') answers[b.id] = {}
          else if (b.type === 'vocabulary') answers[b.id] = {}
          else if (b.type === 'contextual_dialogue') answers[b.id] = {}
          else if (b.type === 'drag_drop') answers[b.id] = {}
          else if (b.type === 'flashcards' || b.type === 'memory_match' || b.type === 'semantic_sorter') answers[b.id] = ''
          else answers[b.id] = ''
        }
      }
    }

    const local = localStorage.getItem(`answers_${route.params.id}`)
    if (local && !data.submission.submitted_at) {
      try {
        applySavedProgress(JSON.parse(local))
      } catch (e) {
        console.warn('Failed to parse localStorage saved progress:', e)
      }
    }

    try {
      await learningStore.fetchGamification()
      gamXp.value = learningStore.gamification?.xp || 0
    } catch {
      gamXp.value = 0
    }

    if (data.submission.submitted_at) {
      submitted.value = true
      readonly.value = true
      submitResult.value = {
        score: Number(data.submission.score || 0),
        maxScore: Number(data.submission.max_score || 0),
        feedback: data.submission.feedback || '',
      }
      await loadRemediation()
      await loadRemediationHistory()
    }

    initialized.value = true
    lastSavedPayload = JSON.stringify(getProgressPayload())
  } catch (_e) {
    uiStore.showToast('Failed to load assignment', 'error')
  }
})

onUnmounted(() => {
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer)
})

function parseGapTemplate(template: string): Array<
  | { type: 'text'; text: string; key: string }
  | { type: 'gap'; index: number; key: string }
> {
  const segments: Array<
    | { type: 'text'; text: string; key: string }
    | { type: 'gap'; index: number; key: string }
  > = []
  if (!template) return segments
  let lastIndex = 0
  let gapIndex = 0
  const regex = /\(\((.*?)\)\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: template.slice(lastIndex, match.index),
        key: `t_${lastIndex}_${match.index}`,
      })
    }

    segments.push({ type: 'gap', index: gapIndex++, key: `g_${match.index}` })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < template.length) {
    segments.push({
      type: 'text',
      text: template.slice(lastIndex),
      key: `t_${lastIndex}_${template.length}`,
    })
  }
  return segments
}

function getGapSegments(template: string) {
  return parseGapTemplate(template)
}

function getGapValue(blockId: string, index: number): string {
  const blockAnswers = answers[blockId]
  if (!blockAnswers || typeof blockAnswers !== 'object') return ''
  return (blockAnswers as Record<string, string>)[String(index)] ?? ''
}

function setGapValue(blockId: string, index: number, value: string): void {
  if (!answers[blockId] || typeof answers[blockId] !== 'object') {
    answers[blockId] = {}
  }
  ;(answers[blockId] as Record<string, string>)[String(index)] = value
}

function scrambleWord(word) {
  const arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

const scrambledCache = computed(() => {
  const cache = {}
  for (const block of blocks.value) {
    if (block.type === 'word_scramble' && block.words) {
      cache[block.id] = block.words.map((w) => scrambleWord(w.word))
    }
  }
  return cache
})

function getScrambled(blockId, wordIndex) {
  return scrambledCache.value[blockId]?.[wordIndex] || ''
}

function getProgressiveStyle(idx) {
  if (!progressiveMode.value) return ''
  if (idx === currentBlockIndex.value) return 'opacity: 1; filter: none; transform: scale(1);'
  if (idx < currentBlockIndex.value)
    return 'opacity: 0.4; filter: blur(2px); pointer-events: none; transform: scale(0.98);'
  return 'display: none;'
}

function getProgressPayload(): Record<string, unknown> {
  return { ...answers, _wagers: { ...wagers }, _confidence: { ...blockConfidence } }
}

function applySavedProgress(savedRaw: unknown): void {
  if (!savedRaw || typeof savedRaw !== 'object') return
  const saved = savedRaw as Record<string, unknown>
  if (saved._wagers && typeof saved._wagers === 'object') {
    Object.assign(wagers, saved._wagers)
  }
  if (saved._confidence && typeof saved._confidence === 'object') {
    Object.assign(blockConfidence, saved._confidence)
  }
  for (const key of Object.keys(saved)) {
    if (key !== '_wagers' && key !== '_confidence') {
      ;(answers as Record<string, unknown>)[key] = saved[key]
    }
  }
}

async function saveProgress() {
  if (saving.value || submitted.value) return
  const payload = getProgressPayload()
  const payloadStr = JSON.stringify(payload)
  if (payloadStr === lastSavedPayload) return
  saving.value = true
  try {
    localStorage.setItem(`answers_${route.params.id}`, payloadStr)
    await store.saveProgress(route.params.id, payload)
    lastSavedPayload = payloadStr
  } catch (e) {
    console.warn('Failed to save progress:', e)
  }
  saving.value = false
}

function scheduleSave() {
  if (!initialized.value || submitted.value || document.hidden) return
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer)
  saveDebounceTimer = setTimeout(() => {
    saveProgress()
  }, 5000)
}

watch([answers, wagers, blockConfidence], () => {
  scheduleSave()
}, { deep: true })

async function submit() {
  submitting.value = true
  try {
    const result = await store.submitAssignment(route.params.id, {
      answers: { ...answers },
      wagers: { ...wagers },
      per_block_confidence: { ...blockConfidence },
    })
    submitResult.value = result
    submitted.value = true
    readonly.value = true
    if (saveDebounceTimer) clearTimeout(saveDebounceTimer)
    localStorage.removeItem(`answers_${route.params.id}`)
    if (result.gritBonusAwarded) {
      audioSynth.playLevelUp()
      uiStore.showToast('Grit Boost! +150 XP for retake improvement!', 'success')
    } else {
      audioSynth.playComplete()
      uiStore.showToast('Submitted successfully!', 'success')
    }
    await loadRemediation()
    await loadRemediationHistory()
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
  submitting.value = false
}

async function loadRemediation() {
  remediationLoading.value = true
  try {
    remediationData.value = await store.fetchRemediation(route.params.id)
    syncRemediationRoundState()
  } catch (e) {
    console.warn('Failed to load remediation:', e)
    remediationData.value = null
  } finally {
    remediationLoading.value = false
  }
}

async function loadRemediationHistory() {
  remediationHistoryLoading.value = true
  try {
    const data = await store.fetchStudentRemediationHistory()
    remediationHistory.value = data?.assignments || []
  } catch (e) {
    console.warn('Failed to load remediation history:', e)
    remediationHistory.value = []
  } finally {
    remediationHistoryLoading.value = false
  }
}

function getRemediationExerciseId(ex: Record<string, unknown>, exIdx = 0): string {
  const fromEx = ex?.id
  if (typeof fromEx === 'string' && fromEx.trim()) return fromEx
  return `ex_${exIdx}`
}

function buildDefaultRoundResponse(ex: Record<string, unknown>): unknown {
  const type = String(ex?.type || '')

  if (type === 'multiple_choice') return []
  if (type === 'matching') {
    const initial: Record<string, string> = {}
    const pairs = Array.isArray(ex?.pairs) ? ex.pairs : []
    for (let i = 0; i < pairs.length; i++) initial[String(i)] = ''
    return initial
  }
  if (type === 'gap_fill') {
    const initial: Record<string, string> = {}
    const template = String(ex?.template || '')
    const gapCount = (template.match(/\(\(.*?\)\)/g) || []).length
    for (let i = 0; i < gapCount; i++) initial[String(i)] = ''
    return initial
  }
  if (type === 'word_scramble') {
    const words = Array.isArray(ex?.words) ? ex.words : []
    return Array.from({ length: words.length }, () => '')
  }
  if (type === 'word_problem') {
    const initial: Record<string, string> = { final_answer: '' }
    const steps = Array.isArray(ex?.steps) ? ex.steps : []
    for (let i = 0; i < steps.length; i++) initial[String(i)] = ''
    return initial
  }
  if (type === 'fraction_input') return { numerator: '', denominator: '' }
  if (type === 'geometry_shape') return { shape_name: '' }
  if (type === 'graph_plot') return ''
  return ''
}

function syncRemediationRoundState() {
  const rounds = remediationData.value?.rounds || []
  for (const round of rounds) {
    const roundId = String(round.id)
    if (!remediationRoundResponses[roundId]) remediationRoundResponses[roundId] = {}
    if (!remediationSelfAssessments[roundId]) remediationSelfAssessments[roundId] = ''
    if (!remediationRoundStartedAt[roundId]) remediationRoundStartedAt[roundId] = Date.now()

    const exercises = Array.isArray(round.exercises) ? round.exercises : []
    exercises.forEach((ex: Record<string, unknown>, exIdx: number) => {
      const exId = getRemediationExerciseId(ex, exIdx)
      if (remediationRoundResponses[roundId][exId] === undefined) {
        remediationRoundResponses[roundId][exId] = buildDefaultRoundResponse(ex)
      }
    })
  }
}

function normalizeGraphPlotResponse(value: unknown): unknown {
  if (Array.isArray(value)) return value
  const raw = String(value || '').trim()
  if (!raw) return []
  const pairs = raw
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => entry.split(',').map((n) => Number(n.trim())))
    .filter((xy) => xy.length === 2 && Number.isFinite(xy[0]) && Number.isFinite(xy[1]))
  return pairs
}

function hasAnyNonEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.some((v) => hasAnyNonEmptyValue(v))
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some((v) => hasAnyNonEmptyValue(v))
  }
  return false
}

function normalizeRoundResponses(round: Record<string, unknown>): Record<string, unknown> {
  const roundId = String(round.id)
  const responses = remediationRoundResponses[roundId] || {}
  const normalized: Record<string, unknown> = {}
  const exercises = Array.isArray(round.exercises) ? round.exercises : []

  exercises.forEach((ex: Record<string, unknown>, exIdx: number) => {
    const exId = getRemediationExerciseId(ex, exIdx)
    const type = String(ex?.type || '')
    const value = responses[exId]

    if (type === 'multiple_choice') {
      const picked = Array.isArray(value)
        ? value.map((v) => Number(v)).filter((v) => Number.isFinite(v))
        : []
      normalized[exId] = picked.length > 0 ? picked : ''
      return
    }

    if (type === 'single_choice' || type === 'true_false') {
      if (!hasAnyNonEmptyValue(value)) {
        normalized[exId] = ''
        return
      }
      const n = Number(value)
      normalized[exId] = Number.isFinite(n) ? n : value
      return
    }

    if (type === 'number_line') {
      if (!hasAnyNonEmptyValue(value)) {
        normalized[exId] = ''
        return
      }
      const n = Number(value)
      normalized[exId] = Number.isFinite(n) ? n : ''
      return
    }

    if (type === 'fraction_input') {
      const numRaw = (value as Record<string, unknown>)?.numerator
      const denRaw = (value as Record<string, unknown>)?.denominator
      if (!hasAnyNonEmptyValue(numRaw) && !hasAnyNonEmptyValue(denRaw)) {
        normalized[exId] = ''
        return
      }
      normalized[exId] = {
        numerator: Number(numRaw),
        denominator: Number(denRaw),
      }
      return
    }

    if (type === 'graph_plot') {
      const parsed = normalizeGraphPlotResponse(value)
      normalized[exId] = Array.isArray(parsed) && parsed.length === 0 ? '' : parsed
      return
    }

    if (
      type === 'matching' ||
      type === 'gap_fill' ||
      type === 'word_problem' ||
      type === 'word_scramble' ||
      type === 'geometry_shape'
    ) {
      normalized[exId] = hasAnyNonEmptyValue(value) ? value : ''
      return
    }

    normalized[exId] = hasAnyNonEmptyValue(value) ? value : ''
  })

  return normalized
}

async function submitRoundResponses(round: Record<string, unknown>) {
  const roundId = String(round.id)
  if (remediationRoundSubmitting[roundId]) return

  remediationRoundSubmitting[roundId] = true
  try {
    const time_spent_seconds = Math.max(
      1,
      Math.round((Date.now() - Number(remediationRoundStartedAt[roundId] || Date.now())) / 1000),
    )
    const responses = normalizeRoundResponses(round)
    const result = await store.submitRemediationResponses(roundId, { responses, time_spent_seconds })
    remediationRoundResults[roundId] = result
    remediationRoundStartedAt[roundId] = Date.now()
    uiStore.showToast('Remediation responses submitted', 'success')
    await loadRemediationHistory()
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to submit remediation responses', 'error')
  } finally {
    remediationRoundSubmitting[roundId] = false
  }
}

async function submitRoundSelfAssessment(round: Record<string, unknown>) {
  const roundId = String(round.id)
  if (remediationSelfAssessmentSaving[roundId]) return
  const text = String(remediationSelfAssessments[roundId] || '').trim()
  if (text.length < 10) {
    uiStore.showToast('Please write at least 10 characters for your reflection', 'error')
    return
  }

  remediationSelfAssessmentSaving[roundId] = true
  try {
    await store.submitRemediationSelfAssessment(roundId, text)
    uiStore.showToast('Reflection saved', 'success')
    await loadRemediationHistory()
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to save reflection', 'error')
  } finally {
    remediationSelfAssessmentSaving[roundId] = false
  }
}

function getRemediationScrambled(roundId: string, exId: string, wi: number, word: string): string {
  const key = `${roundId}_${exId}_${wi}`
  if (!remediationScrambleCache[key]) {
    remediationScrambleCache[key] = scrambleWord(String(word || ''))
  }
  return remediationScrambleCache[key]
}

const currentAssignmentRemediationHistory = computed(() => {
  const assignmentId = String(route.params.id)
  return remediationHistory.value.find((entry: Record<string, unknown>) => String(entry.assignment_id) === assignmentId) || null
})

function getRoundHistoryMetrics(roundNumber: number): Record<string, unknown> | null {
  const rounds = currentAssignmentRemediationHistory.value?.rounds || []
  return rounds.find((r: Record<string, unknown>) => Number(r.round_number) === Number(roundNumber)) || null
}

async function generateRemediationRound() {
  if (remediationGenerating.value) return
  remediationGenerating.value = true
  try {
    await store.generateRemediationRound(route.params.id)
    await loadRemediation()
    await loadRemediationHistory()
    uiStore.showToast('Remediation round generated', 'success')
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to generate remediation round', 'error')
  } finally {
    remediationGenerating.value = false
  }
}

function openTutor() {
  tutorOpen.value = true
}

async function sendToTutor() {
  if (!tutorInput.value.trim() || tutorLoading.value) return

  const question = tutorInput.value.trim()
  tutorMessages.value.push({ role: 'user', text: question })
  tutorInput.value = ''
  tutorLoading.value = true

  const tutorReplyIndex = tutorMessages.value.length
  tutorMessages.value.push({ role: 'tutor', text: '' })

  try {
    const context = `Worksheet: ${worksheet.value?.title}. Description: ${worksheet.value?.description}. Exercises: ${JSON.stringify(blocks.value)}`

    // Use raw fetch for SSE
    const response = await fetch('/api/ai/tutor', {
      method: 'POST',
      headers: buildApiHeaders('POST'),
      body: JSON.stringify({ question, context }),
      credentials: 'include',
    })

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No reader')

    const decoder = new TextDecoder()
    let done_received = false
    while (!done_received) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

      for (const line of lines) {
        if (line === 'data: [DONE]') {
          done_received = true
          break
        }
        try {
          const json = JSON.parse(line.replace('data: ', ''))
          tutorMessages.value[tutorReplyIndex].text += json.text
        } catch {
          /* ignore parse errors for partial chunks */
        }
      }
    }
  } catch (_err) {
    tutorMessages.value[tutorReplyIndex].text = "I'm having trouble connecting right now."
  } finally {
    tutorLoading.value = false
  }
}

/* ---- Fraction model SVG helpers ---- */
function playerFractionIndices(block) {
  const n = Math.max(1, Math.min(block.denominator || 1, 20))
  return Array.from({ length: n }, (_, i) => i)
}
function playerFractionViewBox(block) {
  return block.model_type === 'circle' ? '0 0 200 200' : '0 0 240 90'
}
function playerFractionSlicePath(index, block) {
  const n = Math.max(1, Math.min(block.denominator || 1, 20))
  if (n === 0) return ''
  const cx = 100, cy = 100, r = 95
  const angle = (2 * Math.PI) / n
  const startAngle = angle * index - Math.PI / 2
  const endAngle = startAngle + angle
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)
  const largeArc = angle > Math.PI ? 1 : 0
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
}
</script>
