<template>
  <div class="page">
    <h2 v-if="worksheet">{{ worksheet.title }}</h2>
    <p v-if="worksheet" style="color: var(--text-muted); margin-bottom: 1rem">
      {{ worksheet.description }}
    </p>

    <div
      v-if="assignment?.due_date"
      class="card"
      style="margin-bottom: 1rem; padding: 0.75rem 1rem"
    >
      <strong>Due:</strong>
      <span
        :style="{
          color: isOverdue && !submitted ? 'var(--danger)' : 'var(--text-main)',
          marginLeft: '0.35rem',
        }"
      >
        {{ new Date(assignment.due_date).toLocaleString() }}
      </span>
      <span v-if="isOverdue && !submitted" class="badge-danger badge" style="margin-left: 0.5rem"
        >Overdue</span
      >
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

    <div v-if="submitted" class="card" style="margin-bottom: 1rem">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        "
      >
        <h3 style="margin: 0">🧠 Personalisierte Nacharbeit</h3>
        <button
          class="btn-primary"
          :disabled="
            remediationLoading || remediationGenerating || !remediationData?.canGenerateRound
          "
          @click="generateRemediationRound"
        >
          {{
            remediationGenerating
              ? 'Generating...'
              : `Generate Round (${remediationData?.roundsLeft ?? 0} left)`
          }}
        </button>
      </div>

      <p style="margin: 0.35rem 0 0.6rem; color: var(--text-muted); font-size: 0.85rem">
        KI analysiert deine Fehler und erstellt bis zu 2 individuelle Übungsrunden.
      </p>

      <div v-if="remediationLoading" style="color: var(--text-muted)">Loading remediation…</div>
      <div v-else-if="!remediationData" style="color: var(--text-muted)">
        No remediation data yet.
      </div>
      <div v-else>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem">
          <span class="badge">Wrong blocks: {{ remediationData.wrongBlocks?.length || 0 }}</span>
          <span class="badge">Rounds used: {{ remediationData.roundsUsed || 0 }}/2</span>
        </div>

        <div v-if="(remediationData.wrongBlocks || []).length" style="margin-bottom: 0.5rem">
          <h4 style="margin: 0 0 0.35rem; font-size: 0.95rem">Fehlerübersicht</h4>
          <ul style="margin: 0; padding-left: 1rem">
            <li
              v-for="wb in remediationData.wrongBlocks"
              :key="wb.blockId"
              style="margin-bottom: 0.2rem"
            >
              <strong>{{ wb.blockType }}</strong
              >: {{ wb.blockText }}
            </li>
          </ul>
        </div>

        <div v-if="!(remediationData.rounds || []).length" style="color: var(--text-muted)">
          Noch keine KI-Nacharbeit erstellt. Klicke auf "Generate Round".
        </div>

        <div
          v-for="round in remediationData.rounds || []"
          :key="round.id"
          class="card"
          style="padding: 0.75rem; margin-top: 0.5rem; border: 1px solid var(--border-color)"
        >
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 0.5rem;
              flex-wrap: wrap;
            "
          >
            <strong>Round {{ round.round_number }}</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted)">{{
              new Date(round.created_at).toLocaleString()
            }}</span>
          </div>

          <p style="margin: 0.4rem 0 0.5rem">{{ round.analysis?.summary }}</p>

          <div v-if="round.analysis?.misconceptions?.length" style="margin-bottom: 0.45rem">
            <strong style="font-size: 0.85rem">Misconceptions:</strong>
            <ul style="margin: 0.25rem 0 0; padding-left: 1rem">
              <li v-for="m in round.analysis.misconceptions" :key="m">{{ m }}</li>
            </ul>
          </div>

          <div v-if="round.analysis?.custom_instructions?.length" style="margin-bottom: 0.45rem">
            <strong style="font-size: 0.85rem">Custom instructions:</strong>
            <ol style="margin: 0.25rem 0 0; padding-left: 1rem">
              <li v-for="c in round.analysis.custom_instructions" :key="c">{{ c }}</li>
            </ol>
          </div>

          <MermaidDiagram
            v-if="round.analysis?.mermaid"
            :code="round.analysis.mermaid"
            alt-text="Remediation diagram"
            style="margin-bottom: 0.5rem"
          />

          <div v-if="round.exercises?.length">
            <strong style="font-size: 0.85rem">Individual exercises:</strong>
            <div
              v-for="(ex, exIdx) in round.exercises"
              :key="`${round.id}_${exIdx}`"
              style="
                margin-top: 0.35rem;
                padding: 0.6rem;
                border: 1px dashed var(--border-color);
                border-radius: 6px;
              "
            >
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  gap: 0.5rem;
                  flex-wrap: wrap;
                "
              >
                <div style="font-weight: 600">{{ ex.title }}</div>
                <div style="display: flex; gap: 0.35rem; align-items: center">
                  <span class="badge" style="font-size: 0.7rem">{{ ex.type }}</span>
                  <span class="badge" style="font-size: 0.7rem">{{ ex.points ?? 0 }} pts</span>
                </div>
              </div>

              <div v-if="ex.prompt" style="white-space: pre-wrap; margin-top: 0.35rem">
                {{ ex.prompt }}
              </div>
              <div v-if="ex.problem_text" style="white-space: pre-wrap; margin-top: 0.35rem">
                {{ ex.problem_text }}
              </div>

              <div style="margin-top: 0.5rem">
                <template v-if="ex.type === 'gap_fill'">
                  <template
                    v-for="seg in getGapSegments(ex.template || '')"
                    :key="`${round.id}_${getRemediationExerciseId(ex, exIdx)}_${seg.key}`"
                  >
                    <span v-if="seg.type === 'text'" style="white-space: pre-wrap">{{
                      seg.text
                    }}</span>
                    <input
                      v-else
                      type="text"
                      :value="
                        remediationRoundResponses[round.id]?.[
                          getRemediationExerciseId(ex, exIdx)
                        ]?.[String(seg.index)] || ''
                      "
                      @input="
                        remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)][
                          String(seg.index)
                        ] = ($event.target as HTMLInputElement).value
                      "
                      style="
                        display: inline;
                        width: auto;
                        min-width: 80px;
                        padding: 0.2rem 0.5rem;
                        border: 1px dashed var(--primary);
                        border-radius: 4px;
                      "
                    />
                  </template>
                </template>

                <template v-else-if="ex.type === 'multiple_choice'">
                  <div v-for="(opt, oi) in ex.options || []" :key="oi" style="margin: 0.2rem 0">
                    <label style="display: flex; align-items: center; gap: 0.5rem">
                      <input
                        v-model="
                          remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]
                        "
                        type="checkbox"
                        :value="oi"
                      />
                      {{ opt }}
                    </label>
                  </div>
                </template>

                <template v-else-if="ex.type === 'single_choice'">
                  <div v-for="(opt, oi) in ex.options || []" :key="oi" style="margin: 0.2rem 0">
                    <label style="display: flex; align-items: center; gap: 0.5rem">
                      <input
                        v-model="
                          remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]
                        "
                        type="radio"
                        :value="oi"
                        :name="`rem_sc_${round.id}_${getRemediationExerciseId(ex, exIdx)}`"
                      />
                      {{ opt }}
                    </label>
                  </div>
                </template>

                <template v-else-if="ex.type === 'true_false'">
                  <div style="display: flex; gap: 0.75rem; flex-wrap: wrap">
                    <label style="display: flex; align-items: center; gap: 0.35rem">
                      <input
                        v-model="
                          remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]
                        "
                        type="radio"
                        :value="1"
                        :name="`rem_tf_${round.id}_${getRemediationExerciseId(ex, exIdx)}`"
                      />
                      True
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.35rem">
                      <input
                        v-model="
                          remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]
                        "
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
                    style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem"
                  >
                    <span style="min-width: 120px">{{ pair[0] }}</span>
                    <input
                      v-model="
                        remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)][
                          String(pi)
                        ]
                      "
                      :placeholder="'Match for ' + pair[0]"
                    />
                  </div>
                </template>

                <template v-else-if="ex.type === 'word_scramble'">
                  <div
                    v-for="(w, wi) in ex.words || []"
                    :key="wi"
                    style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem"
                  >
                    <span style="font-family: monospace; letter-spacing: 2px">
                      {{
                        getRemediationScrambled(
                          String(round.id),
                          getRemediationExerciseId(ex, exIdx),
                          wi,
                          w.word,
                        )
                      }}
                    </span>
                    <input
                      v-model="
                        remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)][wi]
                      "
                      placeholder="Unscramble"
                    />
                  </div>
                </template>

                <template v-else-if="ex.type === 'word_problem'">
                  <div
                    v-for="(step, si) in ex.steps || []"
                    :key="si"
                    style="margin-bottom: 0.35rem"
                  >
                    <label style="display: block; font-size: 0.8rem; color: var(--text-muted)">
                      Step {{ Number(si) + 1 }}: {{ step.description }}
                    </label>
                    <input
                      v-model="
                        remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)][
                          String(si)
                        ]
                      "
                    />
                  </div>
                  <label style="display: block; font-size: 0.8rem; color: var(--text-muted)"
                    >Final answer</label
                  >
                  <input
                    v-model="
                      remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]
                        .final_answer
                    "
                  />
                </template>

                <template v-else-if="ex.type === 'fraction_input'">
                  <div style="display: flex; gap: 0.5rem; align-items: center">
                    <input
                      v-model.number="
                        remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]
                          .numerator
                      "
                      type="number"
                      placeholder="Numerator"
                      style="width: 120px"
                    />
                    <span>/</span>
                    <input
                      v-model.number="
                        remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]
                          .denominator
                      "
                      type="number"
                      placeholder="Denominator"
                      style="width: 120px"
                    />
                  </div>
                </template>

                <template v-else-if="ex.type === 'number_line'">
                  <input
                    v-model.number="
                      remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]
                    "
                    type="number"
                    placeholder="Pick a number"
                    style="width: 180px"
                  />
                </template>

                <template v-else-if="ex.type === 'graph_plot'">
                  <textarea
                    v-model="
                      remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]
                    "
                    rows="2"
                    placeholder="Enter points as x,y; x,y"
                  ></textarea>
                </template>

                <template v-else-if="ex.type === 'geometry_shape'">
                  <input
                    v-model="
                      remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]
                        .shape_name
                    "
                    placeholder="Shape name"
                  />
                </template>

                <template v-else-if="ex.type === 'short_answer'">
                  <textarea
                    v-model="
                      remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]
                    "
                    rows="3"
                    placeholder="Your answer..."
                  ></textarea>
                </template>

                <template v-else>
                  <input
                    v-model="
                      remediationRoundResponses[round.id][getRemediationExerciseId(ex, exIdx)]
                    "
                    placeholder="Your answer"
                  />
                </template>
              </div>

              <div
                v-if="ex.answer_hint"
                style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem"
              >
                Hint: {{ ex.answer_hint }}
              </div>
            </div>

            <div
              style="
                margin-top: 0.6rem;
                display: flex;
                gap: 0.5rem;
                align-items: center;
                flex-wrap: wrap;
              "
            >
              <button
                class="btn-primary btn-sm"
                :disabled="remediationRoundSubmitting[round.id]"
                @click="submitRoundResponses(round)"
              >
                {{
                  remediationRoundSubmitting[round.id] ? 'Submitting...' : 'Submit Round Responses'
                }}
              </button>
              <span v-if="remediationRoundResults[round.id]" class="badge">
                Score: {{ remediationRoundResults[round.id].score }}/{{
                  remediationRoundResults[round.id].maxScore
                }}
                · Correct: {{ remediationRoundResults[round.id].exercises_correct }}/{{
                  remediationRoundResults[round.id].exercises_attempted
                }}
              </span>
              <span v-else-if="getRoundHistoryMetrics(round.round_number)" class="badge">
                Attempts:
                {{ getRoundHistoryMetrics(round.round_number)?.exercises_attempted || 0 }} ·
                Correct: {{ getRoundHistoryMetrics(round.round_number)?.exercises_correct || 0 }} ·
                Time: {{ getRoundHistoryMetrics(round.round_number)?.time_spent_seconds || 0 }}s
              </span>
            </div>

            <div style="margin-top: 0.55rem">
              <label
                style="
                  display: block;
                  font-size: 0.8rem;
                  color: var(--text-muted);
                  margin-bottom: 0.25rem;
                "
              >
                Self-assessment (min. 10 chars): What did you understand better after this round?
              </label>
              <textarea
                v-model="remediationSelfAssessments[round.id]"
                rows="2"
                placeholder="I understood that..."
              ></textarea>
              <div style="margin-top: 0.4rem">
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

        <div
          style="
            margin-top: 0.75rem;
            border-top: 1px solid var(--border-color);
            padding-top: 0.6rem;
          "
        >
          <h4 style="margin: 0 0 0.35rem; font-size: 0.9rem">
            Your remediation history (this worksheet)
          </h4>
          <div v-if="remediationHistoryLoading" style="color: var(--text-muted); font-size: 0.8rem">
            Loading history…
          </div>
          <div
            v-else-if="!currentAssignmentRemediationHistory"
            style="color: var(--text-muted); font-size: 0.8rem"
          >
            No completed history yet.
          </div>
          <div v-else style="display: flex; gap: 0.45rem; flex-wrap: wrap">
            <span class="badge"
              >Rounds: {{ currentAssignmentRemediationHistory.round_count || 0 }}</span
            >
            <span class="badge"
              >Attempted: {{ currentAssignmentRemediationHistory.attempted || 0 }}</span
            >
            <span class="badge"
              >Correct: {{ currentAssignmentRemediationHistory.correct || 0 }}</span
            >
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
              style="
                display: inline;
                width: auto;
                min-width: 80px;
                padding: 0.2rem 0.5rem;
                border: 1px dashed var(--primary);
                border-radius: 4px;
              "
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

      <!-- Media / Image Block -->
      <template v-if="block.type === 'media'">
        <div style="text-align: center; margin-top: 0.5rem">
          <img
            :src="block.src"
            style="
              max-width: 100%;
              max-height: 400px;
              border-radius: 8px;
              border: 1px solid var(--border-color);
            "
          />
          <p
            v-if="block.caption"
            style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem"
          >
            {{ block.caption }}
          </p>
        </div>
      </template>

      <!-- Audio Block -->
      <template v-if="block.type === 'audio'">
        <div style="margin-top: 0.5rem">
          <audio :src="block.src" controls style="width: 100%"></audio>
          <p
            v-if="block.caption"
            style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem"
          >
            {{ block.caption }}
          </p>
        </div>
      </template>

      <!-- Video Block -->
      <template v-if="block.type === 'video'">
        <div style="text-align: center; margin-top: 0.5rem">
          <video
            :src="block.src"
            controls
            style="max-width: 100%; max-height: 400px; border-radius: 8px"
          ></video>
          <p
            v-if="block.caption"
            style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem"
          >
            {{ block.caption }}
          </p>
        </div>
      </template>

      <!-- YouTube Block -->
      <template v-if="block.type === 'youtube'">
        <div style="text-align: center; margin-top: 0.5rem">
          <iframe
            v-if="youtubeEmbed(block.src)"
            width="560"
            height="315"
            :src="youtubeEmbed(block.src)"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            style="max-width: 100%; border-radius: 8px"
          ></iframe>
          <div v-else style="color: var(--text-muted)">Invalid YouTube Link</div>
          <p
            v-if="block.caption"
            style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem"
          >
            {{ block.caption }}
          </p>
        </div>
      </template>

      <!-- Drawing Block -->
      <template v-if="block.type === 'drawing'">
        <div style="margin-top: 0.5rem">
          <div style="font-weight: 500; margin-bottom: 0.25rem">
            {{ block.text || 'Draw here:' }}
          </div>
          <ScratchpadCanvas />
        </div>
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
          <div
            style="
              display: flex;
              align-items: center;
              gap: 0.5rem;
              font-weight: 600;
              color: var(--primary);
            "
          >
            <span style="font-size: 1.1rem">💡</span>
            <span style="flex: 1">{{ block.title || 'Click to learn more' }}</span>
            <span style="font-size: 0.85rem; color: var(--text-muted)">{{
              infoBoxOpen[block.id] ? '▼' : '▶'
            }}</span>
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
          <span style="font-family: monospace; letter-spacing: 3px">{{
            getScrambled(block.id, wi)
          }}</span>
          <input v-model="answers[block.id][wi]" placeholder="Unscramble" />
        </div>
      </template>

      <!-- Drag Words -->
      <template v-if="block.type === 'drag_words'">
        <div style="margin-bottom: 0.75rem">
          {{ initDragWords(block) }}
          <div style="line-height: 2; font-size: 1rem">
            <template v-for="seg in getGapSegments(block.template)" :key="seg.key">
              <span v-if="seg.type === 'text'" style="white-space: pre-wrap">{{ seg.text }}</span>
              <span
                v-else-if="seg.type === 'gap'"
                @click="readonly ? null : setActiveGap(block.id, seg.index)"
                :style="{
                  display: 'inline-block',
                  minWidth: '90px',
                  height: '28px',
                  padding: '0.1rem 0.6rem',
                  margin: '0 0.25rem',
                  border:
                    activeGap?.blockId === block.id && activeGap?.index === seg.index
                      ? '2px solid var(--primary)'
                      : '1px dashed var(--text-muted)',
                  borderRadius: '6px',
                  background: getGapValue(block.id, seg.index)
                    ? 'var(--primary-light)'
                    : 'var(--bg-main)',
                  color: 'var(--text-main)',
                  textAlign: 'center',
                  cursor: readonly ? 'default' : 'pointer',
                  fontWeight: '600',
                  verticalAlign: 'middle',
                  transition: 'all 0.2s',
                }"
              >
                {{ getGapValue(block.id, seg.index) || 'Drop here' }}
                <span
                  v-if="getGapValue(block.id, seg.index) && !readonly"
                  @click.stop="setGapValue(block.id, seg.index, '')"
                  style="color: red; margin-left: 4px; font-weight: bold; font-size: 0.8rem"
                  >×</span
                >
              </span>
            </template>
          </div>
          <!-- Options list -->
          <div
            v-if="!readonly"
            style="
              display: flex;
              gap: 0.5rem;
              flex-wrap: wrap;
              margin-top: 0.75rem;
              background: var(--bg-card);
              padding: 0.5rem;
              border-radius: 8px;
              border: 1px solid var(--border-color);
            "
          >
            <button
              v-for="word in dragWordsOptions[block.id] || []"
              :key="word"
              @click="onSelectDragWord(block.id, word)"
              class="btn-sm"
              :style="{
                background: isDragWordUsed(block.id, word)
                  ? 'var(--border-color)'
                  : 'var(--primary)',
                color: isDragWordUsed(block.id, word) ? 'var(--text-muted)' : '#fff',
                cursor: isDragWordUsed(block.id, word) ? 'not-allowed' : 'pointer',
                opacity: isDragWordUsed(block.id, word) ? 0.6 : 1,
                border: 'none',
                fontWeight: '600',
                borderRadius: '6px',
              }"
              :disabled="isDragWordUsed(block.id, word)"
            >
              {{ word }}
            </button>
          </div>
        </div>
      </template>

      <!-- Correct Words -->
      <template v-if="block.type === 'correct_words'">
        <div style="line-height: 2; font-size: 1.05rem">
          <template v-for="(seg, si) in getCorrectWordsSegments(block.template)" :key="si">
            <span v-if="seg.type === 'text'" style="white-space: pre-wrap">{{ seg.text }}</span>
            <span
              v-else-if="seg.type === 'word'"
              style="position: relative; display: inline-block; margin: 0 0.25rem"
            >
              <span
                @click="readonly ? null : toggleCorrectWordsInput(block.id, seg.index)"
                style="
                  text-decoration: underline dashed red;
                  cursor: pointer;
                  color: #dc2626;
                  font-weight: 600;
                "
              >
                {{ seg.wrong }}
              </span>
              <!-- Inline edit bubble -->
              <div
                v-if="
                  activeCorrectWordsInput?.blockId === block.id &&
                  activeCorrectWordsInput?.index === seg.index &&
                  !readonly
                "
                style="
                  position: absolute;
                  bottom: 100%;
                  left: 50%;
                  transform: translateX(-50%);
                  background: var(--bg-card);
                  border: 1px solid var(--border-color);
                  border-radius: 8px;
                  padding: 0.5rem;
                  box-shadow: var(--shadow-lg);
                  z-index: 100;
                  display: flex;
                  gap: 0.25rem;
                  align-items: center;
                  min-width: 180px;
                "
              >
                <input
                  :value="getCorrectWordsValue(block.id, seg.index)"
                  @input="
                    setCorrectWordsValue(
                      block.id,
                      seg.index,
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                  placeholder="Enter correction..."
                  style="font-size: 0.8rem; padding: 0.2rem 0.4rem; flex: 1"
                  @keyup.enter="activeCorrectWordsInput = null"
                  autofocus
                />
                <button
                  class="btn-sm btn-primary"
                  style="font-size: 0.75rem; padding: 0.2rem 0.4rem"
                  @click="activeCorrectWordsInput = null"
                >
                  ✓
                </button>
              </div>
              <!-- Display typed correction below if filled -->
              <span
                v-if="getCorrectWordsValue(block.id, seg.index)"
                style="
                  font-size: 0.75rem;
                  color: var(--primary);
                  display: block;
                  text-align: center;
                  line-height: 1;
                  margin-top: -2px;
                "
              >
                ({{ getCorrectWordsValue(block.id, seg.index) }})
              </span>
            </span>
          </template>
        </div>
      </template>

      <!-- Question Table -->
      <template v-if="block.type === 'question_table'">
        <div style="overflow-x: auto; margin-top: 0.5rem">
          <table
            style="width: 100%; border-collapse: collapse; border: 1px solid var(--border-color)"
          >
            <thead>
              <tr style="border-bottom: 2px solid var(--border-color)">
                <th style="text-align: left; padding: 0.5rem">Statement / Question</th>
                <th
                  v-for="col in block.columns || []"
                  :key="col"
                  style="text-align: center; padding: 0.5rem"
                >
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, ri) in block.rows || []"
                :key="ri"
                style="border-bottom: 1px solid var(--border-color)"
              >
                <td style="padding: 0.5rem; color: var(--text-main)">
                  {{ row.split('##')[0] }}
                </td>
                <td
                  v-for="col in block.columns || []"
                  :key="col"
                  style="text-align: center; padding: 0.5rem"
                >
                  <input
                    type="radio"
                    :name="`${block.id}_row_${ri}`"
                    :value="col"
                    :disabled="readonly"
                    :checked="getQuestionTableValue(block.id, Number(ri)) === col"
                    @change="setQuestionTableValue(block.id, Number(ri), col)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Crossword -->
      <template v-if="block.type === 'crossword'">
        <div
          v-if="crosswordLayout.rows > 0"
          style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 0.5rem"
        >
          <!-- Crossword Grid -->
          <div style="flex-shrink: 0">
            <div
              :style="{
                display: 'grid',
                gridTemplateColumns: `repeat(${crosswordLayout.cols}, 36px)`,
                gap: '1px',
                background: '#bbb',
                border: '2px solid #999',
                borderRadius: '4px',
                overflow: 'hidden',
              }"
            >
              <template v-for="r in crosswordLayout.rows" :key="r">
                <div
                  v-for="c in crosswordLayout.cols"
                  :key="`${r}-${c}`"
                  :style="{
                    width: '36px',
                    height: '36px',
                    background: crosswordLayout.grid[r - 1][c - 1].isActive ? '#fff' : '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxSizing: 'border-box',
                  }"
                >
                  <!-- Cell number -->
                  <span
                    v-if="crosswordLayout.grid[r - 1][c - 1].number"
                    style="
                      position: absolute;
                      top: 1px;
                      left: 3px;
                      font-size: 9px;
                      font-weight: 700;
                      color: #666;
                      pointer-events: none;
                      line-height: 1;
                    "
                  >
                    {{ crosswordLayout.grid[r - 1][c - 1].number }}
                  </span>
                  <!-- Letter input (active cells only) -->
                  <input
                    v-if="crosswordLayout.grid[r - 1][c - 1].isActive"
                    :ref="(el) => setCrosswordCellRef(r - 1, c - 1, el as HTMLInputElement | null)"
                    maxlength="1"
                    :disabled="readonly"
                    :value="
                      getCrosswordChar(
                        block.id,
                        crosswordLayout.grid[r - 1][c - 1].wordIndices[0],
                        crosswordLayout.grid[r - 1][c - 1].charPositions[
                          crosswordLayout.grid[r - 1][c - 1].wordIndices[0]
                        ],
                      )
                    "
                    @input="
                      onCrosswordInput(
                        block.id,
                        crosswordLayout.grid[r - 1][c - 1],
                        ($event.target as HTMLInputElement).value,
                        $event,
                      )
                    "
                    @keydown="
                      onCrosswordKeydown(block.id, crosswordLayout.grid[r - 1][c - 1], $event)
                    "
                    :style="{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      textAlign: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      padding: 0,
                      outline: 'none',
                      background: 'transparent',
                      caretColor: readonly ? 'transparent' : 'var(--primary)',
                    }"
                    class="crossword-cell-input"
                  />
                </div>
              </template>
            </div>
          </div>

          <!-- Clues -->
          <div style="flex: 1; min-width: 200px">
            <div v-if="crosswordLayout.acrossClues.length" style="margin-bottom: 1rem">
              <h4 style="font-size: 0.9rem; margin-bottom: 0.35rem">Across</h4>
              <div
                v-for="clue in crosswordLayout.acrossClues"
                :key="'a' + clue.number"
                style="font-size: 0.85rem; margin-bottom: 0.2rem"
              >
                <strong>{{ clue.number }}.</strong> {{ clue.clue }}
                <span style="color: var(--text-muted); font-size: 0.75rem">
                  ({{ block.words?.[clue.wordIdx]?.word?.length || '?' }})
                </span>
              </div>
            </div>
            <div v-if="crosswordLayout.downClues.length">
              <h4 style="font-size: 0.9rem; margin-bottom: 0.35rem">Down</h4>
              <div
                v-for="clue in crosswordLayout.downClues"
                :key="'d' + clue.number"
                style="font-size: 0.85rem; margin-bottom: 0.2rem"
              >
                <strong>{{ clue.number }}.</strong> {{ clue.clue }}
                <span style="color: var(--text-muted); font-size: 0.75rem">
                  ({{ block.words?.[clue.wordIdx]?.word?.length || '?' }})
                </span>
              </div>
            </div>
          </div>
        </div>
        <p v-else style="color: var(--text-muted); font-size: 0.85rem">
          No crossword words configured.
        </p>
      </template>

      <template v-if="block.type === 'vocabulary'">
        <Vocabulary v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <!-- Audio Match -->
      <template v-if="block.type === 'audio_match'">
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem">
          <div
            v-for="(pair, pi) in block.pairs || []"
            :key="pi"
            style="
              display: flex;
              align-items: center;
              gap: 0.75rem;
              background: var(--bg-main);
              padding: 0.5rem 0.75rem;
              border-radius: 8px;
              border: 1px solid var(--border-color);
            "
          >
            <button
              class="btn-sm"
              style="
                padding: 0.25rem 0.5rem;
                font-size: 0.9rem;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
              "
              @click="playAudioUrl(block.audioUrls?.[pi] || '')"
              :disabled="!block.audioUrls?.[pi]"
            >
              🔊
            </button>
            <span style="font-size: 0.85rem; color: var(--text-muted)"
              >Audio #{{ Number(pi) + 1 }}</span
            >
            <span style="color: var(--text-muted)">→</span>
            <input
              v-model="answers[block.id][pi]"
              :disabled="readonly"
              placeholder="Enter matching text..."
              style="flex: 1"
            />
          </div>
        </div>
      </template>

      <!-- Dictation -->
      <template v-if="block.type === 'dictation'">
        <div
          style="
            background: var(--bg-main);
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            margin-top: 0.5rem;
          "
        >
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem">
            <button
              class="btn-primary"
              style="
                padding: 0.4rem 0.8rem;
                display: flex;
                align-items: center;
                gap: 0.4rem;
                border-radius: 24px;
              "
              @click="playAudioUrl(block.audioUrl || '')"
              :disabled="!block.audioUrl"
            >
              <span>🔊 Play Dictation</span>
            </button>
            <span style="font-size: 0.8rem; color: var(--text-muted)"
              >Listen to the speaker and type what you hear.</span
            >
          </div>
          <textarea
            v-model="answers[block.id]"
            :disabled="readonly"
            rows="2"
            placeholder="Type your transcription here..."
            style="width: 100%"
          ></textarea>
        </div>
      </template>

      <template v-if="block.type === 'semantic_sorter'">
        <SemanticSorter v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'flashcards'">
        <Flashcards :block="block" v-model="answers[block.id]" :readonly="readonly" />
      </template>

      <!-- Word Search -->
      <template v-if="block.type === 'word_search'">
        <div style="margin-top: 0.5rem">
          {{ initWordSearch(block) }}
          <!-- Grid display -->
          <div
            style="
              display: grid;
              grid-template-columns: repeat(12, 1fr);
              gap: 2px;
              max-width: 360px;
              margin: 0.5rem auto;
              background: var(--border-color);
              padding: 4px;
              border-radius: 8px;
            "
          >
            <template v-for="(row, r) in wordSearchGrids[block.id] || []" :key="r">
              <div
                v-for="(char, c) in row"
                :key="c"
                style="
                  background: var(--bg-card);
                  aspect-ratio: 1;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 0.9rem;
                  border-radius: 4px;
                "
              >
                {{ char }}
              </div>
            </template>
          </div>
          <!-- Entry form -->
          <div v-if="!readonly" style="display: flex; gap: 0.5rem; margin-top: 0.75rem">
            <input
              v-model="wordSearchInputs[block.id]"
              placeholder="Type a word you found..."
              @keyup.enter="addFoundWord(block.id)"
              style="flex: 1"
            />
            <button class="btn-primary" @click="addFoundWord(block.id)">Add Word</button>
          </div>
          <!-- Found words list -->
          <div style="margin-top: 0.5rem">
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block"
              >Words Found:</label
            >
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.25rem">
              <span
                v-for="(w, wi) in answers[block.id] || []"
                :key="wi"
                style="
                  padding: 0.2rem 0.5rem;
                  background: var(--primary-light);
                  border: 1px solid var(--primary-soft);
                  color: var(--primary);
                  border-radius: 12px;
                  font-size: 0.8rem;
                  font-weight: 600;
                "
              >
                {{ w }}
                <span
                  v-if="!readonly"
                  @click="removeFoundWord(block.id, wi)"
                  style="color: red; cursor: pointer; margin-left: 4px; font-weight: bold"
                  >×</span
                >
              </span>
              <span
                v-if="!(answers[block.id] || []).length"
                style="font-size: 0.8rem; color: var(--text-muted); font-style: italic"
              >
                No words added yet.
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Sentence Builder -->
      <template v-if="block.type === 'sentence_builder'">
        <div style="margin-top: 0.5rem">
          {{ initSentenceBuilder(block) }}
          <!-- Built sentence display -->
          <div
            style="
              min-height: 45px;
              background: var(--bg-main);
              border: 1px dashed var(--border-color);
              border-radius: 8px;
              padding: 0.5rem;
              display: flex;
              gap: 0.4rem;
              flex-wrap: wrap;
              align-items: center;
              margin-bottom: 0.75rem;
            "
          >
            <span
              v-for="(w, wi) in answers[block.id] || []"
              :key="wi"
              @click="readonly ? null : removeSentenceWord(block.id, wi)"
              style="
                padding: 0.25rem 0.5rem;
                background: var(--primary-light);
                border: 1px solid var(--primary-soft);
                color: var(--primary);
                border-radius: 6px;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
              "
            >
              {{ w }}
            </span>
            <span
              v-if="!(answers[block.id] || []).length"
              style="font-size: 0.8rem; color: var(--text-muted); font-style: italic"
            >
              Click words below to build the sentence.
            </span>
          </div>
          <!-- Scrambled source words list -->
          <div
            v-if="!readonly"
            style="
              display: flex;
              gap: 0.4rem;
              flex-wrap: wrap;
              background: var(--bg-card);
              padding: 0.5rem;
              border-radius: 8px;
              border: 1px solid var(--border-color);
            "
          >
            <button
              v-for="(word, wIndex) in getSentenceBuilderOptions(block.id)"
              :key="wIndex"
              @click="addSentenceWord(block.id, word, wIndex)"
              class="btn-sm"
              style="font-weight: 600; border-radius: 6px"
            >
              {{ word }}
            </button>
          </div>
        </div>
      </template>

      <!-- Odd One Out -->
      <template v-if="block.type === 'odd_one_out'">
        <div style="margin-top: 0.5rem">
          <label
            style="
              font-size: 0.85rem;
              color: var(--text-muted);
              display: block;
              margin-bottom: 0.4rem;
            "
            >Select the odd item:</label
          >
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
            <button
              v-for="(item, idx) in block.items || []"
              :key="idx"
              @click="readonly ? null : setOddOneOutSelected(block.id, Number(idx))"
              class="btn-sm"
              :style="{
                background:
                  getOddOneOutSelected(block.id) === Number(idx)
                    ? 'var(--primary)'
                    : 'var(--bg-main)',
                color: getOddOneOutSelected(block.id) === idx ? '#fff' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                fontWeight: '600',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
              }"
            >
              {{ item }}
            </button>
          </div>
          <div class="form-group" style="margin-top: 0.75rem">
            <label style="font-size: 0.8rem; color: var(--text-muted)"
              >Explain why this item is the odd one:</label
            >
            <textarea
              :value="getOddOneOutReason(block.id)"
              @input="setOddOneOutReason(block.id, ($event.target as HTMLInputElement).value)"
              :disabled="readonly"
              rows="2"
              placeholder="e.g. Carrot is a vegetable, while the others are fruits..."
              style="width: 100%"
            ></textarea>
          </div>
        </div>
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
import ScratchpadCanvas from '../components/exercises/ScratchpadCanvas.vue'
import { useCrosswordGrid, type GridCell } from '../composables/useCrosswordGrid'

function youtubeEmbed(url: string) {
  if (!url) return ''
  const id = url.match(/(?:v=|\/)([\w-]{11})/)
  return id ? `https://www.youtube.com/embed/${id[1]}` : ''
}

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

// --- Crossword grid ---
const crosswordCellRefs = reactive<Record<string, HTMLInputElement | null>>({})

const crosswordLayout = computed(() => {
  for (const block of blocks.value) {
    if (block.type === 'crossword') {
      return useCrosswordGrid(block.words || [])
    }
  }
  return { grid: [], rows: 0, cols: 0, acrossClues: [], downClues: [], placedWords: [] }
})

function setCrosswordCellRef(row: number, col: number, el: HTMLInputElement | null) {
  if (el) crosswordCellRefs[`${row}_${col}`] = el
}

// Read a single character from a word's stored answer string
function getCrosswordChar(blockId: string, wordIdx: number, charPos: number): string {
  const blockAnswers = answers[blockId]
  if (!blockAnswers || typeof blockAnswers !== 'object') return ''
  const stored = String((blockAnswers as Record<string, string>)[String(wordIdx)] || '')
  return stored[Number(charPos)] || ''
}

// Write a single character to a word's stored answer string
function setCrosswordWordChar(blockId: string, wordIdx: number, charPos: number, ch: string): void {
  const words = (blocks.value.find((b: Record<string, unknown>) => b.id === blockId)?.words ||
    []) as Array<Record<string, unknown>>
  const expectedWord = String(words[wordIdx]?.word || '')
  const wordLen = expectedWord.length
  if (!blockId || wordLen === 0) return
  if (!answers[blockId] || typeof answers[blockId] !== 'object') {
    answers[blockId] = {}
  }
  const existing = String(
    (answers[blockId] as Record<string, string>)[String(wordIdx)] || '',
  ).padEnd(wordLen, ' ')
  const arr = existing.split('')
  arr[Number(charPos)] = ch.toUpperCase()
  ;(answers[blockId] as Record<string, string>)[String(wordIdx)] = arr.join('')
}

// Handle input into a grid cell
function onCrosswordInput(blockId: string, cell: GridCell, value: string, event: Event): void {
  if (!cell.isActive || cell.wordIndices.length === 0 || readonly.value) return
  const ch = String(value || '')
    .slice(0, 1)
    .toUpperCase()

  for (const wi of cell.wordIndices) {
    const charPos = cell.charPositions[wi]
    if (charPos !== undefined) {
      setCrosswordWordChar(blockId, wi, charPos, ch)
    }
  }

  // Auto-advance to next cell in the same word
  if (ch) {
    const wi = cell.wordIndices[0]
    const placedWord = crosswordLayout.value.placedWords.find((pw) => pw.wordIdx === wi)
    if (placedWord) {
      const nextPos = cell.charPositions[wi] + 1
      if (nextPos < placedWord.word.length) {
        const nextRow =
          placedWord.direction === 'across' ? placedWord.row : placedWord.row + nextPos
        const nextCol =
          placedWord.direction === 'across' ? placedWord.col + nextPos : placedWord.col
        const refKey = `${nextRow}_${nextCol}`
        setTimeout(() => crosswordCellRefs[refKey]?.focus(), 10)
      }
    }
  }
}

// Handle keyboard navigation in crossword cells
function onCrosswordKeydown(blockId: string, cell: GridCell, event: KeyboardEvent): void {
  if (!cell.isActive || cell.wordIndices.length === 0 || readonly.value) return
  const wi = cell.wordIndices[0]
  const placedWord = crosswordLayout.value.placedWords.find((pw) => pw.wordIdx === wi)
  if (!placedWord) return

  const charPos = cell.charPositions[wi]
  if (charPos === undefined) return

  if (event.key === 'Backspace') {
    // Clear current cell and move back
    setCrosswordWordChar(blockId, wi, charPos, ' ')
    event.preventDefault()
    // Also clear intersecting words
    for (const wi2 of cell.wordIndices) {
      if (wi2 !== wi) {
        setCrosswordWordChar(blockId, wi2, cell.charPositions[wi2], ' ')
      }
    }
    // Move back
    if (charPos > 0) {
      const prevRow =
        placedWord.direction === 'across' ? placedWord.row : placedWord.row + charPos - 1
      const prevCol =
        placedWord.direction === 'across' ? placedWord.col + charPos - 1 : placedWord.col
      setTimeout(() => crosswordCellRefs[`${prevRow}_${prevCol}`]?.focus(), 10)
    }
  } else if (
    event.key === 'ArrowRight' ||
    (event.key === 'ArrowDown' && placedWord.direction === 'down')
  ) {
    event.preventDefault()
    if (charPos + 1 < placedWord.word.length) {
      const nextRow =
        placedWord.direction === 'across' ? placedWord.row : placedWord.row + charPos + 1
      const nextCol =
        placedWord.direction === 'across' ? placedWord.col + charPos + 1 : placedWord.col
      crosswordCellRefs[`${nextRow}_${nextCol}`]?.focus()
    }
  } else if (
    event.key === 'ArrowLeft' ||
    (event.key === 'ArrowUp' && placedWord.direction === 'down')
  ) {
    event.preventDefault()
    if (charPos > 0) {
      const prevRow =
        placedWord.direction === 'across' ? placedWord.row : placedWord.row + charPos - 1
      const prevCol =
        placedWord.direction === 'across' ? placedWord.col + charPos - 1 : placedWord.col
      crosswordCellRefs[`${prevRow}_${prevCol}`]?.focus()
    }
  }
}
interface SubmitResult {
  score: number
  maxScore: number
  feedback: string
  gritBonusAwarded?: boolean
  xpEarned?: number
  xpLost?: number
  wageringResults?: Array<{ blockId: string; correct: boolean; wagered: number; earned: number }>
}
const submitResult = ref<SubmitResult>({ score: 0, maxScore: 0, feedback: '' })
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

// ===== Interactive Question Types State & Helpers =====
const activeGap = ref<{ blockId: string; index: number } | null>(null)
function setActiveGap(blockId: string, index: number) {
  activeGap.value = { blockId, index }
}

const dragWordsOptions = reactive<Record<string, string[]>>({})
function initDragWords(block: any) {
  if (dragWordsOptions[block.id]) return
  const matches = block.template?.match(/\(\(.*?\)\)/g) || []
  const words = matches.map((m: string) => m.slice(2, -2).trim())
  const shuffled = [...words].sort(() => Math.random() - 0.5)
  dragWordsOptions[block.id] = shuffled
}

function isDragWordUsed(blockId: string, word: string): boolean {
  const blockAnswers = answers[blockId]
  if (!blockAnswers || typeof blockAnswers !== 'object') return false
  return Object.values(blockAnswers).includes(word)
}

function onSelectDragWord(blockId: string, word: string) {
  if (!activeGap.value || activeGap.value.blockId !== blockId) return
  setGapValue(blockId, activeGap.value.index, word)
  activeGap.value = null
}

const activeCorrectWordsInput = ref<{ blockId: string; index: number } | null>(null)
function toggleCorrectWordsInput(blockId: string, index: number) {
  if (
    activeCorrectWordsInput.value?.blockId === blockId &&
    activeCorrectWordsInput.value?.index === index
  ) {
    activeCorrectWordsInput.value = null
  } else {
    activeCorrectWordsInput.value = { blockId, index }
  }
}

function getCorrectWordsSegments(template: string) {
  const segments: Array<
    { type: 'text'; text: string } | { type: 'word'; index: number; wrong: string; correct: string }
  > = []
  if (!template) return segments
  let lastIndex = 0
  let wordIndex = 0
  const regex = /\(\((.*?)\)\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: template.slice(lastIndex, match.index),
      })
    }
    const parts = match[1].split('/')
    segments.push({
      type: 'word',
      index: wordIndex++,
      wrong: parts[0] || '',
      correct: parts[1] || parts[0] || '',
    })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < template.length) {
    segments.push({
      type: 'text',
      text: template.slice(lastIndex),
    })
  }
  return segments
}

function getCorrectWordsValue(blockId: string, index: number): string {
  const blockAnswers = answers[blockId]
  if (!blockAnswers || typeof blockAnswers !== 'object') return ''
  return (blockAnswers as Record<string, string>)[String(index)] ?? ''
}

function setCorrectWordsValue(blockId: string, index: number, value: string): void {
  if (!answers[blockId] || typeof answers[blockId] !== 'object') {
    answers[blockId] = {}
  }
  ;(answers[blockId] as Record<string, string>)[String(index)] = value
}

function getQuestionTableValue(blockId: string, rowIndex: number | string): string {
  const blockAnswers = answers[blockId]
  if (!blockAnswers || typeof blockAnswers !== 'object') return ''
  return (blockAnswers as Record<string, string>)[String(rowIndex)] ?? ''
}

function setQuestionTableValue(blockId: string, rowIndex: number | string, value: string): void {
  if (!answers[blockId] || typeof answers[blockId] !== 'object') {
    answers[blockId] = {}
  }
  ;(answers[blockId] as Record<string, string>)[String(rowIndex)] = value
}

function playAudioUrl(url: string) {
  if (!url) return
  const audio = new Audio(url)
  audio.play().catch((e) => console.warn('Audio play failed:', e))
}

const wordSearchGrids = reactive<Record<string, string[][]>>({})
const wordSearchInputs = reactive<Record<string, string>>({})
function initWordSearch(block: any) {
  if (wordSearchGrids[block.id]) return
  const size = 12
  const grid = Array(size)
    .fill(null)
    .map(() => Array(size).fill(''))
  const words = (block.words || [])
    .map((w: any) =>
      String(w)
        .toUpperCase()
        .replace(/[^A-Z]/g, ''),
    )
    .filter(Boolean)
  for (const word of words) {
    let placed = false
    let attempts = 0
    while (!placed && attempts < 100) {
      attempts++
      const dir = Math.random() > 0.5 ? { r: 0, c: 1 } : { r: 1, c: 0 }
      const row = Math.floor(Math.random() * (size - (dir.r ? word.length : 0)))
      const col = Math.floor(Math.random() * (size - (dir.c ? word.length : 0)))
      let fit = true
      for (let i = 0; i < word.length; i++) {
        const curr = grid[row + i * dir.r][col + i * dir.c]
        if (curr && curr !== word[i]) {
          fit = false
          break
        }
      }
      if (fit) {
        for (let i = 0; i < word.length; i++) {
          grid[row + i * dir.r][col + i * dir.c] = word[i]
        }
        placed = true
      }
    }
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
      }
    }
  }
  wordSearchGrids[block.id] = grid
  wordSearchInputs[block.id] = ''
}

function addFoundWord(blockId: string) {
  const val = (wordSearchInputs[blockId] || '').trim().toUpperCase()
  if (!val) return
  if (!answers[blockId] || !Array.isArray(answers[blockId])) {
    answers[blockId] = []
  }
  if (!answers[blockId].includes(val)) {
    answers[blockId].push(val)
  }
  wordSearchInputs[blockId] = ''
}

function removeFoundWord(blockId: string, idx: number) {
  if (Array.isArray(answers[blockId])) {
    answers[blockId].splice(idx, 1)
  }
}

const sentenceBuilderScrambled = reactive<Record<string, string[]>>({})
function initSentenceBuilder(block: any) {
  if (sentenceBuilderScrambled[block.id]) return
  const words = (block.sentence || '').split(/\s+/).filter(Boolean)
  const scrambled = [...words].sort(() => Math.random() - 0.5)
  sentenceBuilderScrambled[block.id] = scrambled
  if (!answers[block.id] || !Array.isArray(answers[block.id])) {
    answers[block.id] = []
  }
}

function getSentenceBuilderOptions(blockId: string): string[] {
  const scrambled = sentenceBuilderScrambled[blockId] || []
  const current = answers[blockId] || []
  const remaining = [...scrambled]
  for (const w of current) {
    const idx = remaining.indexOf(w)
    if (idx !== -1) remaining.splice(idx, 1)
  }
  return remaining
}

function addSentenceWord(blockId: string, word: string, wIndex: number) {
  if (!answers[blockId] || !Array.isArray(answers[blockId])) {
    answers[blockId] = []
  }
  answers[blockId].push(word)
}

function removeSentenceWord(blockId: string, wi: number) {
  answers[blockId].splice(wi, 1)
}

function getOddOneOutSelected(blockId: string): number | null {
  const val = (answers as Record<string, unknown>)[`odd_${blockId}`]
  return val !== undefined ? Number(val) : null
}
function setOddOneOutSelected(blockId: string, index: number | string): void {
  if (!answers[blockId] || typeof answers[blockId] !== 'object') {
    answers[blockId] = { selected: null, reason: '' }
  }
  answers[blockId].selected = index
}

function getOddOneOutReason(blockId: string): string {
  const blockAnswers = answers[blockId]
  if (!blockAnswers || typeof blockAnswers !== 'object') return ''
  return blockAnswers.reason || ''
}

function setOddOneOutReason(blockId: string, reason: string): void {
  if (!answers[blockId] || typeof answers[blockId] !== 'object') {
    answers[blockId] = { selected: null, reason: '' }
  }
  answers[blockId].reason = reason
}

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
          else if (
            b.type === 'flashcards' ||
            b.type === 'memory_match' ||
            b.type === 'semantic_sorter'
          )
            answers[b.id] = ''
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

function parseGapTemplate(
  template: string,
): Array<
  { type: 'text'; text: string; key: string } | { type: 'gap'; index: number; key: string }
> {
  const segments: Array<
    { type: 'text'; text: string; key: string } | { type: 'gap'; index: number; key: string }
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

watch(
  [answers, wagers, blockConfidence],
  () => {
    scheduleSave()
  },
  { deep: true },
)

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

function getRemediationExerciseId(ex: Record<string, unknown>, exIdx: number | string = 0): string {
  const fromEx = ex?.id
  if (typeof fromEx === 'string' && fromEx.trim()) return fromEx
  return `ex_${String(exIdx)}`
}

function buildDefaultRoundResponse(ex: Record<string, unknown>): unknown {
  const type = String(ex?.type || '')

  if (type === 'multiple_choice' || type === 'word_search' || type === 'sentence_builder') return []
  if (type === 'matching' || type === 'audio_match') {
    const initial: Record<string, string> = {}
    const pairs = Array.isArray(ex?.pairs) ? ex.pairs : []
    for (let i = 0; i < pairs.length; i++) initial[String(i)] = ''
    return initial
  }
  if (type === 'gap_fill' || type === 'drag_words' || type === 'correct_words') {
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
  if (type === 'question_table') {
    const initial: Record<string, string> = {}
    const rows = Array.isArray(ex?.rows) ? ex.rows : []
    for (let i = 0; i < rows.length; i++) initial[String(i)] = ''
    return initial
  }
  if (type === 'crossword') {
    const initial: Record<string, string> = {}
    const words = Array.isArray(ex?.words) ? ex.words : []
    for (let i = 0; i < words.length; i++) initial[String(i)] = ''
    return initial
  }
  if (type === 'odd_one_out') {
    return { selected: null, reason: '' }
  }
  if (type === 'dictation') return ''
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
    const result = await store.submitRemediationResponses(roundId, {
      responses,
      time_spent_seconds,
    })
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

function getRemediationScrambled(
  roundId: string,
  exId: string,
  wi: number | string,
  word: string,
): string {
  const key = `${roundId}_${exId}_${wi}`
  if (!remediationScrambleCache[key]) {
    remediationScrambleCache[key] = scrambleWord(String(word || ''))
  }
  return remediationScrambleCache[key]
}

const currentAssignmentRemediationHistory = computed(() => {
  const assignmentId = String(route.params.id)
  return (
    remediationHistory.value.find(
      (entry: Record<string, unknown>) => String(entry.assignment_id) === assignmentId,
    ) || null
  )
})

function getRoundHistoryMetrics(roundNumber: number): Record<string, unknown> | null {
  const rounds = currentAssignmentRemediationHistory.value?.rounds || []
  return (
    rounds.find((r: Record<string, unknown>) => Number(r.round_number) === Number(roundNumber)) ||
    null
  )
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
  const cx = 100,
    cy = 100,
    r = 95
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
