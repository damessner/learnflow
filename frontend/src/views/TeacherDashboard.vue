<template>
  <div class="page">
    <div style="display: flex; justify-content: space-between; align-items: center">
      <h2 class="page-title">Teacher Dashboard</h2>
      <div class="flex gap-sm">
        <router-link to="/teacher/workspace" class="btn-primary btn-lg"
          >Subject Workspace</router-link
        >
        <router-link to="/teacher/bank" class="btn-primary btn-lg">LearnFlowBank</router-link>
        <router-link to="/teacher/builder" class="btn-primary btn-lg">Create Worksheet</router-link>
        <router-link to="/teacher/stories" class="btn-primary btn-lg">Stories</router-link>
      </div>
    </div>

    <div class="tab-pills">
      <button
        v-for="t in tabs"
        :key="t.key"
        :class="['tab-pill', { active: tab === t.key }]"
        @click="tab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <template v-if="tab === 'worksheets'">
      <div class="card" style="margin-bottom: 1rem; padding: 0.75rem 1.25rem">
        <div class="flex items-center gap-sm">
          <label
            style="
              font-weight: 600;
              font-size: 0.9rem;
              color: var(--text-muted);
              white-space: nowrap;
              margin: 0;
            "
            >Search:</label
          >
          <input
            v-model="searchQuery"
            placeholder="Filter by title, subject, or grade..."
            style="flex: 1; padding: 0.4rem 0.75rem"
          />
        </div>
      </div>

      <div v-if="filteredWorksheets.length === 0" class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-title">No worksheets found</div>
        <div class="empty-state-text">Create your first worksheet or adjust your search.</div>
      </div>
      <div v-for="ws in filteredWorksheets" :key="ws.id" class="card" style="margin-bottom: 0.5rem">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div>
            <strong>{{ ws.title }}</strong>
            <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 0.5rem">{{
              ws.subject
            }}</span>
          </div>
          <div style="display: flex; gap: 0.25rem">
            <button class="btn-sm" @click="editWs(ws.id)">Edit</button>
            <button class="btn-sm" @click="previewWs(ws.id)">Preview</button>
            <button class="btn-sm" @click="duplicateWs(ws.id)">Copy</button>
            <button class="btn-sm" @click="assignWs(ws)">Assign</button>
            <button class="btn-sm btn-danger" @click="deleteWs(ws.id)">Delete</button>
          </div>
        </div>
        <div
          v-if="assignTarget && assignTarget.id === ws.id"
          style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color)"
        >
          <div
            v-if="assignmentLoading[ws.id]"
            style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem"
          >
            Loading assignments…
          </div>
          <div
            v-else-if="assignmentMap[ws.id]?.length"
            style="margin-bottom: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem"
          >
            <div
              v-for="assignment in assignmentMap[ws.id]"
              :key="assignment.id"
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem;
                border: 1px solid var(--border-color);
                border-radius: 6px;
              "
            >
              <div style="font-size: 0.82rem">
                <div style="font-weight: 600">
                  {{ assignment.class_name || 'Class assignment' }}
                </div>
                <div style="color: var(--text-muted)">
                  Due:
                  {{
                    assignment.due_date
                      ? new Date(assignment.due_date).toLocaleDateString()
                      : 'No deadline'
                  }}
                  · {{ assignment.retry_policy || 'single' }}
                </div>
              </div>
              <button class="btn-sm" @click="prefillAssignmentEdit(assignment)">Edit</button>
              <button class="btn-sm" @click="openAssignmentResults(assignment, ws)">Results</button>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap">
            <select v-model="assignForm.class_id" style="width: 200px">
              <option value="">Select class...</option>
              <option v-for="c in classesList" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <input v-model="assignForm.due_date" type="date" style="width: 150px" />
            <select v-model="assignForm.retry_policy" style="width: 120px">
              <option value="single">Single</option>
              <option value="best">Best</option>
              <option value="latest">Latest</option>
            </select>
            <button class="btn-primary btn-sm" @click="doAssign(ws.id)">
              {{ assignForm.assignment_id ? 'Update' : 'Assign' }}
            </button>
            <button class="btn-sm" @click="clearAssignForm()">Cancel</button>
          </div>
          <div style="margin-top: 0.4rem; font-size: 0.75rem; color: var(--text-muted)">
            {{
              assignForm.assignment_id
                ? 'Editing existing schedule'
                : 'Create a new scheduled assignment'
            }}
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 1rem">
        <h3>New Class</h3>
        <div style="display: flex; gap: 0.5rem">
          <input v-model="newClassName" placeholder="Class name" />
          <button class="btn-primary" @click="createClass">Create</button>
        </div>
      </div>
    </template>

    <template v-if="tab === 'classes'">
      <div
        class="card"
        style="margin-bottom: 1rem; padding: 1rem; border: 1px dashed var(--primary-soft)"
      >
        <div class="flex items-center gap-md" style="flex-wrap: wrap">
          <div style="flex: 1; min-width: 200px">
            <strong style="font-size: 0.95rem">📄 PDF Student Importer</strong>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.2rem">
              Upload a class roster PDF (Namensliste format). Creates student accounts and classes
              automatically.
            </p>
          </div>
          <input
            ref="pdfInput"
            type="file"
            accept=".pdf,application/pdf"
            style="display: none"
            @change="onPdfSelected"
          />
          <button
            class="btn-primary"
            :disabled="importingPdf"
            @click="($refs.pdfInput as HTMLInputElement)?.click()"
          >
            {{ importingPdf ? 'Importing...' : 'Upload PDF & Import' }}
          </button>
        </div>
        <div v-if="importResult" class="divider" style="margin: 0.75rem 0"></div>
        <div v-if="importResult" style="font-size: 0.85rem">
          <div class="flex gap-md" style="flex-wrap: wrap">
            <span class="badge-success badge"
              >{{ importResult.studentsCreated }} students created</span
            >
            <span class="badge-warning badge">{{ importResult.studentsSkipped }} skipped</span>
            <span class="badge badge">{{ importResult.classesCreated }} classes created</span>
            <span v-if="importResult.errorCount > 0" class="badge-danger badge"
              >{{ importResult.errorCount }} errors</span
            >
          </div>
          <div
            v-if="importResult.classNames.length > 0"
            style="margin-top: 0.5rem; color: var(--text-muted); font-size: 0.8rem"
          >
            Classes: {{ importResult.classNames.join(', ') }}
          </div>
          <div v-if="credentialsList.length > 0" style="margin-top: 0.75rem">
            <button class="btn-sm" @click="showCredentials = !showCredentials">
              {{ showCredentials ? 'Hide' : 'Show' }} Student Passwords ({{
                credentialsList.length
              }})
            </button>
            <div
              v-if="showCredentials"
              style="margin-top: 0.5rem; max-height: 400px; overflow-y: auto"
            >
              <table style="font-size: 0.75rem">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Class</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="c in credentialsList" :key="c.username">
                    <td>{{ c.name }}</td>
                    <td>
                      <code>{{ c.username }}</code>
                    </td>
                    <td>
                      <code>{{ c.password }}</code>
                    </td>
                    <td>{{ c.class }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div
            v-if="importErrors.length > 0"
            style="margin-top: 0.5rem; color: var(--danger); font-size: 0.8rem"
          >
            <p v-for="(err, i) in importErrors" :key="i">{{ err }}</p>
          </div>
        </div>
      </div>

      <div v-if="classesList.length === 0" style="color: var(--text-muted)">No classes yet</div>
      <div
        v-for="c in classesList"
        :key="c.id"
        class="card"
        style="margin-bottom: 1.5rem; border-top: 3px solid var(--primary)"
      >
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
          "
        >
          <div>
            <strong style="font-size: 1.2rem">{{ c.name }}</strong>
            <span
              class="badge"
              style="margin-left: 0.5rem; background: rgba(79, 70, 229, 0.1); color: var(--primary)"
              >Code: {{ c.class_code }}</span
            >
          </div>
          <div style="display: flex; gap: 0.25rem">
            <button class="btn-primary btn-sm" @click="viewClassProgress(c.id)">
              {{ selectedClass === c.id ? 'Hide Progress' : 'View Progress' }}
            </button>
            <button class="btn-sm" @click="exportCsv(c.id)">Export CSV</button>
            <button class="btn-sm btn-danger" @click="deleteClass(c.id)">Delete</button>
          </div>
        </div>

        <div v-if="selectedClass === c.id" style="margin-top: 1rem">
          <div
            v-if="classProgress.length === 0"
            style="color: var(--text-muted); font-size: 0.9rem; padding: 1rem 0"
          >
            No students enrolled in this class yet.
          </div>
          <div v-else class="student-grid">
            <div
              v-for="p in classProgress"
              :key="p.student.id"
              class="student-progress-card"
              :class="{ 'at-risk': p.total > 0 && p.completed / p.total < 0.5 }"
            >
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem">
                <span
                  class="student-emoji streak-aura"
                  :class="
                    p.student.streak_days >= 7
                      ? 'streak-level-3'
                      : p.student.streak_days >= 3
                        ? 'streak-level-2'
                        : p.student.streak_days >= 1
                          ? 'streak-level-1'
                          : ''
                  "
                >
                  {{ p.student.character_emoji || '👤' }}
                </span>
                <div style="flex: 1; min-width: 0">
                  <h4
                    style="
                      margin: 0;
                      font-size: 0.95rem;
                      font-weight: 700;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    "
                  >
                    {{ p.student.name }}
                  </h4>
                  <div
                    style="
                      font-size: 0.75rem;
                      color: var(--text-muted);
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                  >
                    @{{ p.student.username }}
                  </div>
                </div>
                <span
                  v-if="p.total > 0 && p.completed / p.total < 0.5"
                  class="status-badge risk-badge"
                >
                  ⚠️ At Risk
                </span>
                <span
                  v-else-if="p.total > 0 && p.completed === p.total"
                  class="status-badge complete-badge"
                >
                  ✅ Done
                </span>
                <span v-else class="status-badge track-badge"> On Track </span>
              </div>
              <div
                style="
                  font-size: 0.8rem;
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 0.35rem;
                "
              >
                <span style="color: var(--text-muted)">Completed:</span>
                <span style="font-weight: 700; color: var(--text-main)"
                  >{{ p.completed }} / {{ p.total }}</span
                >
              </div>
              <div class="progress-bar-container">
                <div
                  class="progress-bar"
                  :style="{
                    width: (p.total > 0 ? (p.completed / p.total) * 100 : 0) + '%',
                    background:
                      p.total > 0 && p.completed / p.total < 0.5
                        ? 'var(--danger)'
                        : 'var(--success)',
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-if="tab === 'ai-grader'">
      <div class="card">
        <h3>🤖 AI Answer Grader</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem">
          Paste a student answer and get an AI-assisted grading suggestion. You can accept, edit, or
          reject it before saving.
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap">
          <div style="flex: 1; min-width: 280px">
            <div class="form-group">
              <label>Question / Prompt</label>
              <textarea
                v-model="graderForm.question"
                rows="4"
                placeholder="Paste the question or task the student had to answer..."
              ></textarea>
            </div>
            <div class="form-group">
              <label>Student Answer</label>
              <textarea
                v-model="graderForm.answer"
                rows="4"
                placeholder="Paste the student's written answer..."
              ></textarea>
            </div>
          </div>
          <div style="flex: 1; min-width: 240px">
            <div class="form-group">
              <label>Subject</label>
              <select v-model="graderForm.subject">
                <option value="">-- Any --</option>
                <option v-for="s in graderSubjects" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Grade Level</label>
              <select v-model="graderForm.grade_level">
                <option value="">-- Any Grade --</option>
                <option v-for="g in ['1', '2', '3', '4']" :key="g" :value="g">
                  {{ GRADE_LABELS[g] }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Max Points</label>
              <input v-model.number="graderForm.maxPoints" type="number" min="1" max="100" />
            </div>
            <div class="form-group">
              <label>Expected Keywords (comma-separated, optional)</label>
              <input v-model="graderForm.keywords" placeholder="keyword1, keyword2" />
            </div>
            <div class="form-group">
              <label>Sample Correct Answer (optional)</label>
              <textarea
                v-model="graderForm.sampleAnswer"
                rows="2"
                placeholder="What a correct answer looks like..."
              ></textarea>
            </div>
            <button
              class="btn-primary"
              :disabled="graderLoading || !graderForm.question || !graderForm.answer"
              @click="runAiGrader"
              style="width: 100%; margin-top: 0.5rem"
            >
              {{ graderLoading ? 'Checking...' : 'Check with AI' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="graderResult" class="card" style="margin-top: 1rem">
        <h4>Grading Suggestion</h4>
        <div style="display: flex; gap: 2rem; align-items: center; margin: 1rem 0">
          <div style="text-align: center">
            <div style="font-size: 2.5rem; font-weight: 700">
              {{ graderResult.suggestedScore }}/{{ graderForm.maxPoints }}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted)">Suggested Score</div>
          </div>
          <div>
            <span :class="['badge', confidenceClass(graderResult.confidence)]">
              {{ graderResult.confidence }} confidence
            </span>
          </div>
        </div>
        <div style="margin: 0.75rem 0">
          <strong>Explanation:</strong>
          <p style="margin-top: 0.25rem; color: var(--text-muted); font-size: 0.9rem">
            {{ graderResult.explanation }}
          </p>
        </div>
        <div v-if="graderResult.strengths.length" style="margin: 0.5rem 0">
          <strong style="color: var(--success)">✓ Strengths:</strong>
          <ul style="margin: 0.25rem 0; font-size: 0.9rem">
            <li v-for="s in graderResult.strengths" :key="s">{{ s }}</li>
          </ul>
        </div>
        <div v-if="graderResult.missing.length" style="margin: 0.5rem 0">
          <strong style="color: var(--danger)">✗ Missing / Could Improve:</strong>
          <ul style="margin: 0.25rem 0; font-size: 0.9rem">
            <li v-for="m in graderResult.missing" :key="m">{{ m }}</li>
          </ul>
        </div>
        <div class="form-group" style="margin-top: 0.75rem">
          <label>Suggested Feedback for Student</label>
          <textarea v-model="graderFeedbackText" rows="2" style="font-size: 0.9rem"></textarea>
        </div>
        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem">
          <button class="btn-sm btn-primary" @click="copyFeedback">📋 Copy Feedback</button>
          <button class="btn-sm" @click="graderResult = null">Clear</button>
        </div>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem">
          ⚠ AI grading is a suggestion — always review before assigning a final grade.
        </p>
      </div>
    </template>

    <template v-if="tab === 'results'">
      <div v-if="!selectedAssignment" style="color: var(--text-muted)">
        Select a worksheet and assignment first
      </div>
      <div v-else>
        <h3>Results for {{ selectedAssignment.worksheet_title }}</h3>
        <div v-if="remediationLoading" style="color: var(--text-muted); margin-bottom: 0.5rem">
          Loading remediation summary…
        </div>
        <div
          v-if="(remediationSummary?.aggregate?.most_missed || []).length"
          class="card"
          style="margin: 0.6rem 0; padding: 0.6rem"
        >
          <h4 style="margin: 0 0 0.4rem">Top Missed Blocks</h4>
          <div
            v-for="m in remediationSummary.aggregate.most_missed.slice(0, 5)"
            :key="m.blockId"
            style="font-size: 0.83rem; margin-bottom: 0.2rem"
          >
            <strong>{{ m.blockType }}</strong> · {{ m.count }} students · {{ m.blockText }}
          </div>
        </div>
        <div v-if="remediationAbMetrics" class="card" style="margin: 0.6rem 0; padding: 0.6rem">
          <h4 style="margin: 0 0 0.4rem">Remediation A/B Metrics</h4>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; font-size: 0.82rem">
            <span class="badge">A rounds: {{ remediationAbMetrics.A?.rounds ?? 0 }}</span>
            <span class="badge">B rounds: {{ remediationAbMetrics.B?.rounds ?? 0 }}</span>
            <span class="badge"
              >Round2 rate: {{ Math.round((remediationAbMetrics.round2_rate || 0) * 100) }}%</span
            >
            <span class="badge"
              >A avg correct: {{ remediationAbMetrics.A?.avg_exercises_correct ?? 0 }}</span
            >
            <span class="badge"
              >B avg correct: {{ remediationAbMetrics.B?.avg_exercises_correct ?? 0 }}</span
            >
          </div>
        </div>
        <table v-if="results.length">
          <thead>
            <tr>
              <th>Student</th>
              <th>Score</th>
              <th>Submitted</th>
              <th>Wrong</th>
              <th>Remediation</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="r in results" :key="r.id">
              <tr>
                <td>{{ r.student_name }}</td>
                <td>{{ r.score }}/{{ r.max_score }}</td>
                <td>{{ r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '-' }}</td>
                <td>{{ r.remediation?.wrong_count ?? '-' }}</td>
                <td>
                  <span class="badge" v-if="r.remediation">
                    {{ r.remediation.rounds_used }}/2 rounds
                  </span>
                  <span
                    style="font-size: 0.75rem; color: var(--text-muted)"
                    v-if="r.remediation?.latest_summary"
                  >
                    {{ r.remediation.latest_summary }}
                  </span>
                  <div v-if="r.remediation?.rounds?.length" style="margin-top: 0.35rem">
                    <button class="btn-sm" @click="toggleRemediationDetails(r.id)">
                      {{ remediationDetailsExpanded[r.id] ? 'Hide details' : 'Show details' }}
                    </button>
                  </div>
                </td>
                <td>
                  <button class="btn-sm" @click="giveFeedback(r)">Feedback</button>
                </td>
              </tr>
              <tr v-show="remediationDetailsExpanded[r.id]">
                <td colspan="6" style="background: var(--bg-main)">
                  <div
                    v-if="!r.remediation?.rounds?.length"
                    style="color: var(--text-muted); font-size: 0.82rem"
                  >
                    No remediation rounds available.
                  </div>
                  <div
                    v-for="round in r.remediation?.rounds || []"
                    :key="round.id"
                    class="card"
                    style="
                      margin: 0.45rem 0;
                      padding: 0.55rem;
                      border: 1px solid var(--border-color);
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
                      <strong>Round {{ round.round_number }}</strong>
                      <div style="display: flex; gap: 0.35rem; flex-wrap: wrap">
                        <span class="badge">Attempted: {{ round.exercises_attempted || 0 }}</span>
                        <span class="badge">Correct: {{ round.exercises_correct || 0 }}</span>
                        <span class="badge">Time: {{ round.time_spent_seconds || 0 }}s</span>
                      </div>
                    </div>
                    <p
                      v-if="round.analysis?.summary"
                      style="margin: 0.35rem 0; color: var(--text-muted)"
                    >
                      {{ round.analysis.summary }}
                    </p>
                    <div
                      v-if="round.self_assessment"
                      style="
                        font-size: 0.82rem;
                        margin: 0.35rem 0;
                        padding: 0.45rem;
                        border-left: 3px solid var(--primary);
                        background: var(--bg-card);
                      "
                    >
                      <strong>Student reflection:</strong> {{ round.self_assessment }}
                    </div>
                    <div v-if="round.exercises?.length" style="margin-top: 0.35rem">
                      <div
                        v-for="(ex, exIdx) in round.exercises"
                        :key="`${round.id}_${exIdx}`"
                        style="padding: 0.45rem 0; border-top: 1px dashed var(--border-color)"
                      >
                        <div
                          style="
                            display: flex;
                            justify-content: space-between;
                            gap: 0.5rem;
                            flex-wrap: wrap;
                          "
                        >
                          <strong style="font-size: 0.85rem">{{ ex.title }}</strong>
                          <span style="font-size: 0.75rem; color: var(--text-muted)"
                            >{{ ex.type }} · {{ ex.points ?? 0 }} pts</span
                          >
                        </div>
                        <div
                          v-if="ex.prompt || ex.problem_text || ex.template"
                          style="font-size: 0.8rem; color: var(--text-muted); white-space: pre-wrap"
                        >
                          {{ ex.prompt || ex.problem_text || ex.template }}
                        </div>
                        <div
                          v-if="getRoundExerciseResponse(round, ex, exIdx)"
                          style="font-size: 0.8rem; margin-top: 0.2rem"
                        >
                          <div>
                            <strong>Response:</strong>
                            {{
                              formatExerciseResponse(
                                getRoundExerciseResponse(round, ex, exIdx)?.response,
                              )
                            }}
                          </div>
                          <div style="color: var(--text-muted)">
                            Score: {{ getRoundExerciseResponse(round, ex, exIdx)?.score ?? 0 }}/{{
                              getRoundExerciseResponse(round, ex, exIdx)?.maxScore ?? 0
                            }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <div v-if="feedbackTarget" style="margin-top: 0.5rem">
          <textarea v-model="feedbackText" placeholder="Enter feedback" rows="3"></textarea>
          <button class="btn-primary btn-sm" @click="submitFeedback">Submit Feedback</button>
        </div>
      </div>
    </template>

    <template v-if="tab === 'analytics'">
      <div class="grid grid-3">
        <div v-if="learningStore.analytics" class="card">
          <h4>Classes</h4>
          <p style="font-size: 2rem; font-weight: 700">
            {{ learningStore.analytics.totalClasses }}
          </p>
        </div>
        <div v-if="learningStore.analytics" class="card">
          <h4>Assignments</h4>
          <p style="font-size: 2rem; font-weight: 700">
            {{ learningStore.analytics.totalAssignments }}
          </p>
        </div>
        <div v-if="learningStore.analytics" class="card">
          <h4>Avg Score</h4>
          <p style="font-size: 2rem; font-weight: 700">
            {{ learningStore.analytics.averageScore }}%
          </p>
        </div>
      </div>

      <div class="grid grid-2" style="margin-top: 1rem">
        <div class="card">
          <h4>🚨 Needs Intervention</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem">
            Dynamic suggestions based on recent failures and low mastery.
          </p>
          <div v-if="learningStore.interventions.length === 0" style="color: var(--text-muted)">
            No critical interventions needed.
          </div>
          <div
            v-for="(inv, i) in learningStore.interventions"
            :key="i"
            style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color)"
          >
            <strong>{{ inv.type }}</strong>
            <p style="font-size: 0.9rem; margin-top: 0.25rem">{{ inv.description }}</p>
          </div>
        </div>

        <div class="card">
          <h4>🧠 Class Mastery Map</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem">
            Weakest concepts across all your classes.
          </p>
          <div
            v-if="learningStore.masteryMap && learningStore.masteryMap.length === 0"
            style="color: var(--text-muted)"
          >
            No mastery data yet.
          </div>
          <div
            v-for="m in learningStore.masteryMap?.slice(0, 5)"
            :key="m.topic"
            style="display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0"
          >
            <span style="flex: 1">{{ m.topic }}</span>
            <div
              style="
                width: 100px;
                height: 8px;
                background: var(--border-color);
                border-radius: 4px;
                overflow: hidden;
              "
            >
              <div
                :style="{
                  width: m.averageMastery + '%',
                  background: m.averageMastery < 50 ? 'var(--danger)' : 'var(--primary)',
                  height: '100%',
                }"
              ></div>
            </div>
            <span style="font-size: 0.8rem">{{ m.averageMastery }}%</span>
          </div>
        </div>
      </div>
    </template>

    <template v-if="tab === 'courses'">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        "
      >
        <h3>My Courses</h3>
        <button class="btn-primary" @click="openCreateCourseModal">Create Course</button>
      </div>

      <div
        v-if="coursesStore.courses.length === 0"
        style="color: var(--text-muted); text-align: center; padding: 3rem 1rem"
        class="card"
      >
        No courses created yet. Create a course to sequence learning modules with score thresholds
        and badges!
      </div>

      <div v-else class="grid grid-2">
        <div
          v-for="course in coursesStore.courses"
          :key="course.id"
          class="card"
          style="
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border-top: 4px solid var(--primary);
            min-height: 200px;
          "
        >
          <div>
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 0.5rem;
                gap: 0.5rem;
              "
            >
              <h4 style="margin: 0; font-size: 1.25rem">{{ course.name }}</h4>
              <span
                v-if="course.badge_name"
                class="badge"
                style="
                  background: rgba(234, 179, 8, 0.15);
                  color: #ca8a04;
                  border: 1px solid rgba(234, 179, 8, 0.3);
                  font-weight: 700;
                  font-size: 0.8rem;
                  white-space: nowrap;
                "
              >
                🏆 {{ course.badge_name }}
              </span>
            </div>
            <p
              style="
                color: var(--text-muted);
                font-size: 0.9rem;
                margin-bottom: 1rem;
                line-height: 1.4;
              "
            >
              {{ course.description || 'No description provided.' }}
            </p>

            <div
              style="
                font-size: 0.8rem;
                color: var(--text-muted);
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                margin-bottom: 1rem;
              "
            >
              <span v-if="course.deadline"
                >📅 Deadline:
                <strong>{{ new Date(course.deadline).toLocaleDateString() }}</strong></span
              >
              <span
                >🎯 Pass Threshold: <strong>{{ course.unlock_threshold }}%</strong></span
              >
            </div>
          </div>

          <div
            style="
              display: flex;
              gap: 0.5rem;
              margin-top: auto;
              border-top: 1px solid var(--border-color);
              padding-top: 0.75rem;
            "
          >
            <button class="btn-sm" @click="manageCourse(course)">Manage & Edit</button>
            <button class="btn-sm btn-danger" @click="deleteCourse(course.id)">Delete</button>
          </div>
        </div>
      </div>
    </template>

    <!-- ─── REPORTS TAB ─────────────────────────────────────────────────── -->
    <template v-if="tab === 'reports'">
      <div class="reports-layout">
        <!-- Left panel: Assignments list -->
        <div class="reports-sidebar">
          <h4 class="reports-section-title">📝 Worksheet Assignments</h4>
          <div v-if="!reportAssignments.length" class="reports-empty">No assignments yet.</div>
          <div
            v-for="a in reportAssignments"
            :key="a.id"
            class="report-item"
            :class="{
              'report-item-active':
                selectedReport?.id === a.id && selectedReport?.type === 'assignment',
            }"
            @click="loadAssignmentReport(a)"
          >
            <div class="report-item-name">{{ a.worksheet_title }}</div>
            <div class="report-item-meta">
              {{ a.class_name }} ·
              {{ a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No deadline' }}
            </div>
            <span v-if="a.due_date && new Date(a.due_date) < new Date()" class="report-ready-badge"
              >📢 REPORT READY</span
            >
          </div>

          <h4 class="reports-section-title" style="margin-top: 1.5rem">🎓 Courses</h4>
          <div v-if="!reportCourses.length" class="reports-empty">No courses yet.</div>
          <div
            v-for="c in reportCourses"
            :key="c.id"
            class="report-item"
            :class="{
              'report-item-active':
                selectedReport?.id === c.id && selectedReport?.type === 'course',
            }"
            @click="loadCourseReport(c)"
          >
            <div class="report-item-name">{{ c.name }}</div>
            <div class="report-item-meta">
              {{ c.deadline ? new Date(c.deadline).toLocaleDateString() : 'No deadline' }}
            </div>
            <span v-if="c.deadline && new Date(c.deadline) < new Date()" class="report-ready-badge"
              >📢 REPORT READY</span
            >
          </div>
        </div>

        <!-- Right panel: Report view -->
        <div class="reports-main">
          <div
            v-if="reportLoading"
            style="text-align: center; padding: 3rem; color: var(--text-muted)"
          >
            ⏳ Loading report data...
          </div>

          <div v-else-if="!reportData" class="reports-placeholder">
            <div style="font-size: 3rem; margin-bottom: 1rem">📊</div>
            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem">
              Select an assignment or course
            </div>
            <div style="color: var(--text-muted); font-size: 0.9rem">
              Items marked with 📢 REPORT READY have passed their deadline.
            </div>
          </div>

          <div v-else>
            <!-- Report Header -->
            <div class="report-header-row">
              <div>
                <h3 style="margin: 0 0 0.25rem">
                  {{
                    selectedReport?.type === 'course'
                      ? reportData.course?.name
                      : reportData.assignment?.worksheet_title
                  }}
                </h3>
                <div style="font-size: 0.85rem; color: var(--text-muted)">
                  <span v-if="selectedReport?.type === 'assignment'">
                    Class: <strong>{{ reportData.assignment?.class_name }}</strong> · Subject:
                    <strong>{{ reportData.assignment?.subject || '—' }}</strong> · Due:
                    <strong>{{
                      reportData.assignment?.due_date
                        ? new Date(reportData.assignment.due_date).toLocaleDateString()
                        : '—'
                    }}</strong>
                  </span>
                  <span v-else>
                    Deadline:
                    <strong>{{
                      reportData.course?.deadline
                        ? new Date(reportData.course.deadline).toLocaleDateString()
                        : '—'
                    }}</strong>
                    · Badge: <strong>{{ reportData.course?.badge_name || '—' }}</strong>
                  </span>
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem">
                <button class="btn-sm" @click="printList">📄 Print List</button>
                <button class="btn-sm btn-primary" @click="printCards">
                  📇 Print Student Cards
                </button>
              </div>
            </div>

            <!-- ── LIST VIEW (always shown in browser) ── -->
            <table class="report-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th v-if="selectedReport?.type === 'assignment'">Submitted</th>
                  <th v-if="selectedReport?.type === 'assignment'">Score</th>
                  <th v-if="selectedReport?.type === 'course'">Progress</th>
                  <th v-if="selectedReport?.type === 'course'">Avg Score</th>
                  <th>XP / Lv</th>
                  <th>Streak</th>
                  <th v-if="selectedReport?.type === 'course'">Badge</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(student, idx) in reportData.students"
                  :key="student.student_id"
                  :class="{
                    'row-submitted': student.submitted || student.completion_pct === 100,
                    'row-pending': !student.submitted && student.completion_pct !== 100,
                  }"
                >
                  <td style="color: var(--text-muted); font-size: 0.8rem">{{ Number(idx) + 1 }}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem">
                      <span>{{ student.character_emoji }}</span>
                      <div>
                        <div style="font-weight: 600; font-size: 0.9rem">
                          {{ student.student_name }}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-muted)">
                          @{{ student.student_username }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td v-if="selectedReport?.type === 'assignment'">
                    <span v-if="student.submitted" class="status-chip chip-done"
                      >✅ {{ new Date(student.submitted_at).toLocaleDateString() }}</span
                    >
                    <span v-else class="status-chip chip-pending">⏳ Pending</span>
                  </td>
                  <td v-if="selectedReport?.type === 'assignment'">
                    <span
                      v-if="student.score !== null"
                      class="score-pill"
                      :class="student.score_pct >= 60 ? 'score-pass' : 'score-fail'"
                    >
                      {{ student.score }}/{{ student.max_score }} ({{ student.score_pct }}%)
                    </span>
                    <span v-else style="color: var(--text-muted)">—</span>
                  </td>
                  <td v-if="selectedReport?.type === 'course'">
                    <div style="display: flex; align-items: center; gap: 0.5rem">
                      <div class="mini-bar">
                        <div
                          class="mini-bar-fill"
                          :style="{
                            width: student.completion_pct + '%',
                            background:
                              student.completion_pct === 100 ? 'var(--success)' : 'var(--primary)',
                          }"
                        ></div>
                      </div>
                      <span style="font-size: 0.8rem; font-weight: 700"
                        >{{ student.completion_pct }}%</span
                      >
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted)">
                      {{ student.completed_worksheets }}/{{ student.total_worksheets }}
                    </div>
                  </td>
                  <td v-if="selectedReport?.type === 'course'">
                    <span
                      v-if="student.average_score_pct !== null"
                      class="score-pill"
                      :class="student.average_score_pct >= 60 ? 'score-pass' : 'score-fail'"
                      >{{ student.average_score_pct }}%</span
                    >
                    <span v-else style="color: var(--text-muted)">—</span>
                  </td>
                  <td style="font-size: 0.85rem">⚡ {{ student.xp }} / Lv {{ student.level }}</td>
                  <td style="font-size: 0.85rem">🔥 {{ student.streak_days }}d</td>
                  <td v-if="selectedReport?.type === 'course'">
                    <span v-if="student.course_badge_earned" style="color: #ca8a04"
                      >🏆 {{ reportData.course?.badge_name }}</span
                    >
                    <span v-else style="color: var(--text-muted)">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- ─── PRINT SECTION (hidden in browser, shown only on print) ─────────── -->
  <div id="print-section" style="display: none">
    <!-- List Print -->
    <div v-if="printMode === 'list' && reportData" class="print-list">
      <div class="print-header">
        <h1>
          {{
            selectedReport?.type === 'course'
              ? reportData.course?.name
              : reportData.assignment?.worksheet_title
          }}
        </h1>
        <p>
          <span v-if="selectedReport?.type === 'assignment'">
            Class: {{ reportData.assignment?.class_name }} · Subject:
            {{ reportData.assignment?.subject || '—' }} · Due:
            {{
              reportData.assignment?.due_date
                ? new Date(reportData.assignment.due_date).toLocaleDateString()
                : '—'
            }}
          </span>
          <span v-else>
            Course Deadline:
            {{
              reportData.course?.deadline
                ? new Date(reportData.course.deadline).toLocaleDateString()
                : '—'
            }}
          </span>
          · Generated: {{ new Date().toLocaleString() }}
        </p>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Student</th>
            <th v-if="selectedReport?.type === 'assignment'">Submitted</th>
            <th v-if="selectedReport?.type === 'assignment'">Score</th>
            <th v-if="selectedReport?.type === 'course'">Progress</th>
            <th v-if="selectedReport?.type === 'course'">Avg Score</th>
            <th>XP</th>
            <th>Level</th>
            <th>Streak</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, idx) in reportData.students" :key="s.student_id">
            <td>{{ Number(idx) + 1 }}</td>
            <td>{{ s.character_emoji }} {{ s.student_name }}</td>
            <td v-if="selectedReport?.type === 'assignment'">
              {{ s.submitted ? new Date(s.submitted_at).toLocaleDateString() : 'Pending' }}
            </td>
            <td v-if="selectedReport?.type === 'assignment'">
              {{ s.score !== null ? s.score + '/' + s.max_score + ' (' + s.score_pct + '%)' : '—' }}
            </td>
            <td v-if="selectedReport?.type === 'course'">
              {{ s.completed_worksheets }}/{{ s.total_worksheets }} ({{ s.completion_pct }}%)
            </td>
            <td v-if="selectedReport?.type === 'course'">
              {{ s.average_score_pct !== null ? s.average_score_pct + '%' : '—' }}
            </td>
            <td>{{ s.xp }}</td>
            <td>{{ s.level }}</td>
            <td>{{ s.streak_days }}d</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Cards Print (2 per A4 page) -->
    <div v-if="printMode === 'cards' && reportData" class="print-cards">
      <div class="print-header">
        <h1>
          {{
            selectedReport?.type === 'course'
              ? reportData.course?.name
              : reportData.assignment?.worksheet_title
          }}
        </h1>
        <p>Student Progress Report · {{ new Date().toLocaleString() }}</p>
      </div>
      <div class="print-cards-grid">
        <div v-for="s in reportData.students" :key="s.student_id" class="print-student-card">
          <div class="psc-header">
            <span class="psc-emoji">{{ s.character_emoji }}</span>
            <div>
              <div class="psc-name">{{ s.student_name }}</div>
              <div class="psc-username">@{{ s.student_username }}</div>
            </div>
          </div>
          <div class="psc-stats">
            <div class="psc-stat">
              <div class="psc-stat-label">XP</div>
              <div class="psc-stat-val">⚡ {{ s.xp }}</div>
            </div>
            <div class="psc-stat">
              <div class="psc-stat-label">Level</div>
              <div class="psc-stat-val">{{ s.level }}</div>
            </div>
            <div class="psc-stat">
              <div class="psc-stat-label">Streak</div>
              <div class="psc-stat-val">🔥 {{ s.streak_days }}d</div>
            </div>
            <div v-if="selectedReport?.type === 'assignment'" class="psc-stat">
              <div class="psc-stat-label">Score</div>
              <div class="psc-stat-val">{{ s.score !== null ? s.score_pct + '%' : '—' }}</div>
            </div>
            <div v-if="selectedReport?.type === 'course'" class="psc-stat">
              <div class="psc-stat-label">Progress</div>
              <div class="psc-stat-val">{{ s.completion_pct }}%</div>
            </div>
            <div v-if="selectedReport?.type === 'course'" class="psc-stat">
              <div class="psc-stat-label">Avg Score</div>
              <div class="psc-stat-val">
                {{ s.average_score_pct !== null ? s.average_score_pct + '%' : '—' }}
              </div>
            </div>
          </div>
          <div
            v-if="selectedReport?.type === 'assignment'"
            class="psc-status"
            :class="s.submitted ? 'psc-done' : 'psc-pending'"
          >
            {{
              s.submitted
                ? '✅ Submitted ' + new Date(s.submitted_at).toLocaleDateString()
                : '⏳ Not submitted'
            }}
          </div>
          <div v-if="selectedReport?.type === 'course' && s.course_badge_earned" class="psc-badge">
            🏆 {{ reportData.course?.badge_name }}
          </div>
          <div v-if="selectedReport?.type === 'course'" class="psc-progress-bar">
            <div class="psc-progress-fill" :style="{ width: s.completion_pct + '%' }"></div>
          </div>
          <div style="font-size: 0.65rem; margin-top: 0.5rem; color: #888">
            LearnFlow Report · {{ new Date().toLocaleDateString() }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Course Modal -->
  <div v-if="createCourseModalOpen" class="modal-overlay" @click.self="closeCreateCourseModal">
    <div class="modal" style="max-width: 500px">
      <h3 style="margin-top: 0; margin-bottom: 1.25rem; font-weight: 700">Create New Course</h3>
      <div class="form-group" style="margin-bottom: 1rem">
        <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.9rem"
          >Course Name *</label
        >
        <input
          v-model="courseForm.name"
          placeholder="e.g., Algebra I, Physics Basics"
          style="width: 100%"
          required
        />
      </div>
      <div class="form-group" style="margin-bottom: 1rem">
        <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.9rem"
          >Description</label
        >
        <textarea
          v-model="courseForm.description"
          placeholder="A brief description of this course..."
          style="width: 100%; resize: vertical"
          rows="3"
        ></textarea>
      </div>
      <div class="grid grid-2" style="margin-bottom: 1rem; gap: 1rem">
        <div class="form-group">
          <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.9rem"
            >Unlock Threshold (%)</label
          >
          <input
            v-model.number="courseForm.unlock_threshold"
            type="number"
            min="0"
            max="100"
            style="width: 100%"
          />
        </div>
        <div class="form-group">
          <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.9rem"
            >Course Deadline</label
          >
          <input v-model="courseForm.deadline" type="date" style="width: 100%" />
        </div>
      </div>
      <div class="form-group" style="margin-bottom: 1.5rem">
        <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.9rem"
          >Completion Badge Name</label
        >
        <input
          v-model="courseForm.badge_name"
          placeholder="e.g., Math Wizard, Physics Pioneer"
          style="width: 100%"
        />
        <span
          style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 0.25rem"
        >
          Students will receive this badge on their profile + 100 XP upon completion.
        </span>
      </div>
      <div style="display: flex; gap: 0.5rem; justify-content: flex-end">
        <button class="btn-sm" @click="closeCreateCourseModal">Cancel</button>
        <button class="btn-primary btn-sm" @click="doCreateCourse">Create Course</button>
      </div>
    </div>
  </div>

  <!-- Manage Course Modal -->
  <div
    v-if="manageCourseModalOpen"
    class="modal-overlay"
    @click.self="manageCourseModalOpen = false"
  >
    <div
      class="modal"
      style="
        max-width: 900px;
        width: 95%;
        max-height: 90vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 2rem;
      "
    >
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        "
      >
        <h3 style="margin: 0; font-size: 1.4rem; font-weight: 700">
          Manage Course: {{ coursesStore.currentCourse?.course?.name }}
        </h3>
        <button
          class="btn-sm"
          @click="manageCourseModalOpen = false"
          style="
            background: transparent;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-muted);
          "
        >
          &times;
        </button>
      </div>

      <div class="grid grid-3" style="align-items: start; gap: 1.5rem">
        <!-- Left Column: Course Settings Form -->
        <div class="card" style="padding: 1.25rem; grid-column: span 1; background: var(--bg-main)">
          <h4
            style="
              margin-top: 0;
              margin-bottom: 1rem;
              border-bottom: 1px solid var(--border-color);
              padding-bottom: 0.5rem;
              color: var(--primary);
              font-weight: 700;
            "
          >
            Course Settings
          </h4>
          <div class="form-group" style="margin-bottom: 1rem">
            <label
              style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.85rem"
              >Name *</label
            >
            <input v-model="courseForm.name" style="width: 100%" />
          </div>
          <div class="form-group" style="margin-bottom: 1rem">
            <label
              style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.85rem"
              >Description</label
            >
            <textarea
              v-model="courseForm.description"
              style="width: 100%; resize: vertical"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group" style="margin-bottom: 1rem">
            <label
              style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.85rem"
              >Default Threshold (%)</label
            >
            <input
              v-model.number="courseForm.unlock_threshold"
              type="number"
              min="0"
              max="100"
              style="width: 100%"
            />
          </div>
          <div class="form-group" style="margin-bottom: 1rem">
            <label
              style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.85rem"
              >Deadline</label
            >
            <input v-model="courseForm.deadline" type="date" style="width: 100%" />
          </div>
          <div class="form-group" style="margin-bottom: 1.25rem">
            <label
              style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.85rem"
              >Completion Badge Name</label
            >
            <input v-model="courseForm.badge_name" style="width: 100%" />
          </div>
          <button
            class="btn-primary"
            style="width: 100%; font-weight: 600"
            @click="saveCourseSettings"
          >
            Save Settings
          </button>
        </div>

        <!-- Middle Column: Worksheets Sequencing -->
        <div class="card" style="padding: 1.25rem; grid-column: span 2; background: var(--bg-main)">
          <h4
            style="
              margin-top: 0;
              margin-bottom: 1rem;
              border-bottom: 1px solid var(--border-color);
              padding-bottom: 0.5rem;
              color: var(--primary);
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-weight: 700;
            "
          >
            <span>Worksheet Sequence</span>
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal">
              {{ coursesStore.currentCourse?.worksheets?.length || 0 }} modules
            </span>
          </h4>

          <!-- Add Worksheet form -->
          <div
            style="
              display: flex;
              gap: 0.5rem;
              margin-bottom: 1.25rem;
              padding-bottom: 1rem;
              border-bottom: 1px solid var(--border-color);
            "
          >
            <select v-model="newWorksheetToCourseId" style="flex: 1">
              <option value="">Select worksheet to add...</option>
              <option v-for="ws in availableWorksheetsForCourse" :key="ws.id" :value="ws.id">
                {{ ws.title }} ({{ ws.subject || 'General' }})
              </option>
            </select>
            <button
              class="btn-primary btn-sm"
              @click="addWorksheetToCourse"
              :disabled="!newWorksheetToCourseId"
            >
              Add
            </button>
          </div>

          <!-- List of worksheets -->
          <div
            v-if="!coursesStore.currentCourse?.worksheets?.length"
            style="color: var(--text-muted); text-align: center; padding: 3rem 0"
          >
            No worksheets added to this course yet.
          </div>

          <div
            v-else
            style="
              display: flex;
              flex-direction: column;
              gap: 0.75rem;
              max-height: 400px;
              overflow-y: auto;
              padding-right: 0.25rem;
            "
          >
            <div
              v-for="(ws, index) in coursesStore.currentCourse.worksheets"
              :key="ws.id"
              style="
                padding: 0.75rem;
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
                background: var(--bg-card);
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                transition: border-color 0.2s;
              "
              :style="{
                borderColor:
                  editingCourseWorksheetSettings === ws.id
                    ? 'var(--primary)'
                    : 'var(--border-color)',
              }"
            >
              <div style="display: flex; justify-content: space-between; align-items: center">
                <div style="display: flex; align-items: center; gap: 0.5rem">
                  <span style="font-weight: bold; color: var(--text-muted); font-size: 0.9rem"
                    >#{{ Number(index) + 1 }}</span
                  >
                  <strong style="font-size: 0.95rem">{{ ws.title }}</strong>
                  <span style="color: var(--text-muted); font-size: 0.75rem"
                    >({{ ws.subject || 'General' }})</span
                  >
                </div>

                <div style="display: flex; gap: 0.25rem">
                  <button
                    class="btn-sm"
                    style="padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: 500"
                    @click="
                      editingCourseWorksheetSettings =
                        editingCourseWorksheetSettings === ws.id ? null : ws.id
                    "
                  >
                    ⚙️ {{ editingCourseWorksheetSettings === ws.id ? 'Close' : 'Configure' }}
                  </button>
                  <button
                    class="btn-sm"
                    style="padding: 0.2rem 0.4rem"
                    @click="moveWorksheet(ws.id, -1)"
                    :disabled="index === 0"
                  >
                    ▲
                  </button>
                  <button
                    class="btn-sm"
                    style="padding: 0.2rem 0.4rem"
                    @click="moveWorksheet(ws.id, 1)"
                    :disabled="index === coursesStore.currentCourse.worksheets.length - 1"
                  >
                    ▼
                  </button>
                  <button
                    class="btn-sm btn-danger"
                    style="padding: 0.2rem 0.4rem"
                    @click="removeWorksheetFromCourse(ws.id)"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <!-- Worksheet Settings Panel (Expandable) -->
              <div
                v-if="editingCourseWorksheetSettings === ws.id"
                style="
                  margin-top: 0.25rem;
                  padding: 0.75rem;
                  background: var(--bg-main);
                  border-radius: var(--radius-xs);
                  border: 1px dashed var(--border-color);
                "
              >
                <h5
                  style="
                    margin-top: 0;
                    margin-bottom: 0.5rem;
                    font-size: 0.85rem;
                    color: var(--primary);
                    font-weight: 700;
                  "
                >
                  Configure Worksheet Settings
                </h5>
                <div class="grid grid-2" style="gap: 0.75rem; align-items: end">
                  <div class="form-group">
                    <label
                      style="
                        display: block;
                        font-size: 0.75rem;
                        font-weight: 600;
                        margin-bottom: 0.15rem;
                      "
                      >Unlock Threshold (%)</label
                    >
                    <input
                      v-model.number="ws.ws_unlock_threshold"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Inherited (default)"
                      style="width: 100%; padding: 0.25rem 0.5rem; font-size: 0.85rem"
                    />
                  </div>
                  <div class="form-group">
                    <label
                      style="
                        display: block;
                        font-size: 0.75rem;
                        font-weight: 600;
                        margin-bottom: 0.15rem;
                      "
                      >Deadline override</label
                    >
                    <input
                      v-model="ws.ws_deadline"
                      type="date"
                      style="width: 100%; padding: 0.25rem 0.5rem; font-size: 0.85rem"
                    />
                  </div>
                  <div
                    style="
                      grid-column: span 2;
                      display: flex;
                      justify-content: flex-end;
                      gap: 0.5rem;
                      margin-top: 0.5rem;
                    "
                  >
                    <button
                      class="btn-sm"
                      style="padding: 0.2rem 0.5rem; font-size: 0.75rem"
                      @click="editingCourseWorksheetSettings = null"
                    >
                      Cancel
                    </button>
                    <button
                      class="btn-primary btn-sm"
                      style="padding: 0.2rem 0.5rem; font-size: 0.75rem"
                      @click="updateWorksheetOverride(ws)"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Student Enrollment management -->
      <div class="card" style="padding: 1.25rem; margin-top: 0.5rem; background: var(--bg-main)">
        <h4
          style="
            margin-top: 0;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
            color: var(--primary);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 700;
          "
        >
          <span>Student Enrollment</span>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal">
            {{ coursesStore.currentCourse?.students?.length || 0 }} students enrolled
          </span>
        </h4>

        <!-- Enroll Form -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; max-width: 500px">
          <select v-model="newStudentToCourseId" style="flex: 1">
            <option value="">Select student to enroll...</option>
            <option v-for="st in availableStudentsForCourse" :key="st.id" :value="st.id">
              {{ st.name }} (@{{ st.username }})
            </option>
          </select>
          <button
            class="btn-primary btn-sm"
            @click="enrollStudentInCourse"
            :disabled="!newStudentToCourseId"
          >
            Enroll Student
          </button>
        </div>

        <div
          v-if="!coursesStore.currentCourse?.students?.length"
          style="color: var(--text-muted); text-align: center; padding: 1.5rem 0"
        >
          No students currently enrolled in this course.
        </div>

        <div
          v-else
          style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 0.75rem;
            max-height: 200px;
            overflow-y: auto;
          "
        >
          <div
            v-for="st in coursesStore.currentCourse.students"
            :key="st.id"
            style="
              padding: 0.5rem 0.75rem;
              border: 1px solid var(--border-color);
              border-radius: var(--radius-sm);
              background: var(--bg-card);
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0">
              <span style="font-size: 1.25rem">{{ st.character_emoji || '👤' }}</span>
              <div style="min-width: 0">
                <div
                  style="
                    font-weight: 600;
                    font-size: 0.85rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  {{ st.name }}
                </div>
                <div
                  style="
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  @{{ st.username }}
                </div>
              </div>
            </div>
            <button
              class="btn-sm btn-danger"
              style="padding: 0.15rem 0.4rem; font-size: 0.75rem"
              @click="unenrollStudentFromCourse(st.id)"
            >
              Unenroll
            </button>
          </div>
        </div>
      </div>

      <div
        style="
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
        "
      >
        <button class="btn-primary btn-sm" @click="manageCourseModalOpen = false">Done</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useWorksheetsStore } from '../stores/worksheets'
import { useClassesStore } from '../stores/classes'
import { useSubmissionsStore } from '../stores/submissions'
import { useLearningStore } from '../stores/learning'
import { useUiStore } from '../stores/ui'
import { useCoursesStore } from '../stores/courses'
import { api } from '../services/api'

const router = useRouter()
const wsStore = useWorksheetsStore()
const classesStore = useClassesStore()
const submissionsStore = useSubmissionsStore()
const learningStore = useLearningStore()
const uiStore = useUiStore()
const coursesStore = useCoursesStore()

const tab = ref('worksheets')
const tabs = [
  { key: 'worksheets', label: 'Worksheets' },
  { key: 'classes', label: 'Classes' },
  { key: 'courses', label: 'Courses' },
  { key: 'results', label: 'Results' },
  { key: 'ai-grader', label: '🤖 AI Grader' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'reports', label: '📊 Reports' },
]
const classesList = ref([])
const newClassName = ref('')
const assignTarget = ref(null)
const assignForm = ref({
  assignment_id: '',
  class_id: '',
  class_name: '',
  due_date: '',
  retry_policy: 'single',
})
const assignmentMap = ref({})
const assignmentLoading = ref({})
const selectedClass = ref(null)
const classProgress = ref([])
const selectedAssignment = ref(null)
const results = ref([])
const remediationSummary = ref(null)
const remediationLoading = ref(false)
const remediationAbMetrics = ref(null)
const remediationDetailsExpanded = ref({})
const feedbackTarget = ref(null)
const feedbackText = ref('')

const createCourseModalOpen = ref(false)
const manageCourseModalOpen = ref(false)
const courseForm = ref({
  name: '',
  description: '',
  unlock_threshold: 60,
  deadline: '',
  badge_name: '',
})
const selectedCourseId = ref(null)
const newWorksheetToCourseId = ref('')
const newStudentToCourseId = ref('')
const editingCourseWorksheetSettings = ref(null)
const allStudents = ref([])
// AI Grader state

const GRADE_LABELS: Record<string, string> = {
  '1': '1. Klasse (5. Schulstufe)',
  '2': '2. Klasse (6. Schulstufe)',
  '3': '3. Klasse (7. Schulstufe)',
  '4': '4. Klasse (8. Schulstufe)',
}

const graderForm = ref({
  question: '',
  answer: '',
  subject: '',
  grade_level: '',
  maxPoints: 10,
  keywords: '',
  sampleAnswer: '',
})
const graderResult = ref(null)
const graderFeedbackText = ref('')
const graderLoading = ref(false)
const graderSubjects = [
  'Mathematics',
  'German',
  'English',
  'Science',
  'History',
  'Geography',
  'Art',
  'Music',
]

function confidenceClass(confidence) {
  return (
    { high: 'badge-success', medium: 'badge-warning', low: 'badge-danger' }[confidence] || 'badge'
  )
}

async function runAiGrader() {
  if (!graderForm.value.question.trim() || !graderForm.value.answer.trim()) return
  graderLoading.value = true
  graderResult.value = null
  try {
    const data = await wsStore.aiCheckAnswer({
      question: graderForm.value.question,
      answer: graderForm.value.answer,
      subject: graderForm.value.subject || undefined,
      grade_level: graderForm.value.grade_level || undefined,
      maxPoints: graderForm.value.maxPoints || 10,
      keywords: graderForm.value.keywords || undefined,
      sampleAnswer: graderForm.value.sampleAnswer || undefined,
    })
    graderResult.value = data
    graderFeedbackText.value = data.feedback || ''
    uiStore.showToast('AI grading suggestion ready', 'success')
  } catch (e) {
    uiStore.showToast(e.message || 'AI grading failed', 'error')
  } finally {
    graderLoading.value = false
  }
}

function copyFeedback() {
  navigator.clipboard.writeText(graderFeedbackText.value)
  uiStore.showToast('Feedback copied', 'success')
}

const importResult = ref(null)
const credentialsList = ref([])
const importErrors = ref([])
const importingPdf = ref(false)
const showCredentials = ref(false)

async function onPdfSelected(e) {
  const file = e.target?.files?.[0]
  if (!file) return
  importingPdf.value = true
  importResult.value = null
  credentialsList.value = []
  importErrors.value = []
  showCredentials.value = false
  try {
    const formData = new FormData()
    formData.append('file', file)
    const data = await api.upload('/classes/import-pdf', formData)
    importResult.value = data.summary
    credentialsList.value = data.credentials || []
    importErrors.value = data.errors || []
    if (data.summary?.studentsCreated > 0) {
      uiStore.showToast(`${data.summary.studentsCreated} students imported`, 'success')
      await classesStore.fetchClasses()
      classesList.value = classesStore.classes
    }
  } catch (err) {
    uiStore.showToast(err.message || 'Import failed', 'error')
  } finally {
    importingPdf.value = false
    if (e.target) e.target.value = ''
  }
}

const searchQuery = ref('')
const filteredWorksheets = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return wsStore.worksheets
  return wsStore.worksheets.filter((ws) => {
    return (
      (ws.title || '').toLowerCase().includes(q) ||
      (ws.subject && ws.subject.toLowerCase().includes(q)) ||
      (ws.grade_level && ws.grade_level.toLowerCase().includes(q))
    )
  })
})

const availableWorksheetsForCourse = computed(() => {
  if (!coursesStore.currentCourse?.worksheets) return wsStore.worksheets
  const currentIds = new Set(coursesStore.currentCourse.worksheets.map((w) => w.id))
  return wsStore.worksheets.filter((w) => !currentIds.has(w.id))
})

const availableStudentsForCourse = computed(() => {
  if (!coursesStore.currentCourse?.students) return allStudents.value
  const enrolledIds = new Set(coursesStore.currentCourse.students.map((s) => s.id))
  return allStudents.value.filter((s) => !enrolledIds.has(s.id))
})

// ── Report state ─────────────────────────────────────────────────────────────
const reportAssignments = ref([])
const reportCourses = ref([])
const selectedReport = ref(null)
const reportData = ref(null)
const reportLoading = ref(false)
const printMode = ref<'list' | 'cards' | null>(null)

onMounted(async () => {
  await wsStore.fetchMyWorksheets()
  await classesStore.fetchClasses()
  classesList.value = classesStore.classes
  await learningStore.fetchTeacherDashboard()
  try {
    await coursesStore.fetchCourses()
  } catch {
    /* ignore */
  }
  await loadReportIndex()
})

async function loadReportIndex() {
  try {
    const promises = wsStore.worksheets.map(async (ws) => {
      try {
        const data = await api.get(`/worksheets/${ws.id}/assignments`)
        return (data.assignments || []).map((a) => ({ ...a, worksheet_title: ws.title }))
      } catch {
        return []
      }
    })
    const results = await Promise.all(promises)
    reportAssignments.value = results.flat()
  } catch {
    /* */
  }
  try {
    reportCourses.value = coursesStore.courses || []
  } catch {
    /* */
  }
}

async function loadAssignmentReport(assignment) {
  selectedReport.value = { id: assignment.id, type: 'assignment' }
  reportData.value = null
  reportLoading.value = true
  printMode.value = null
  try {
    const data = await api.get(`/worksheets/assignments/${assignment.id}/reports`)
    reportData.value = data
  } catch (e) {
    uiStore.showToast(e.message || 'Error loading report', 'error')
  } finally {
    reportLoading.value = false
  }
}

async function loadCourseReport(course) {
  selectedReport.value = { id: course.id, type: 'course' }
  reportData.value = null
  reportLoading.value = true
  printMode.value = null
  try {
    const data = await api.get(`/courses/${course.id}/reports`)
    reportData.value = data
  } catch (e) {
    uiStore.showToast(e.message || 'Error loading report', 'error')
  } finally {
    reportLoading.value = false
  }
}

async function printList() {
  printMode.value = 'list'
  await nextTick()
  window.print()
}

async function printCards() {
  printMode.value = 'cards'
  await nextTick()
  window.print()
}

function editWs(id) {
  router.push(`/teacher/builder/${id}`)
}
function previewWs(id) {
  router.push(`/teacher/preview/${id}`)
}

async function duplicateWs(id) {
  try {
    await wsStore.duplicateWorksheet(id)
    await wsStore.fetchMyWorksheets()
    uiStore.showToast('Worksheet duplicated', 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function deleteWs(id) {
  try {
    await wsStore.deleteWorksheet(id)
    await wsStore.fetchMyWorksheets()
    uiStore.showToast('Worksheet deleted', 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

function assignWs(ws) {
  assignTarget.value = ws
  clearAssignForm(false)
  loadAssignmentsForWorksheet(ws.id)
}

function clearAssignForm(clearTarget = true) {
  assignForm.value = {
    assignment_id: '',
    class_id: '',
    class_name: '',
    due_date: '',
    retry_policy: 'single',
  }
  if (clearTarget) assignTarget.value = null
}

async function loadAssignmentsForWorksheet(wsId) {
  assignmentLoading.value = { ...assignmentLoading.value, [wsId]: true }
  try {
    assignmentMap.value = {
      ...assignmentMap.value,
      [wsId]: await wsStore.fetchAssignments(wsId),
    }
  } catch {
    assignmentMap.value = { ...assignmentMap.value, [wsId]: [] }
  } finally {
    assignmentLoading.value = { ...assignmentLoading.value, [wsId]: false }
  }
}

async function loadAssignmentResults(assignmentId) {
  remediationLoading.value = true
  try {
    const [subs, remediation] = await Promise.all([
      wsStore.fetchAssignmentResults(assignmentId),
      wsStore.fetchAssignmentRemediation(assignmentId).catch(() => null),
    ])

    const ab = await submissionsStore.fetchRemediationAbMetrics().catch(() => null)

    const remediationBySubmission = new Map(
      (remediation?.students || []).map((s) => [s.submission_id, s]),
    )

    results.value = (subs || []).map((row) => ({
      ...row,
      remediation: remediationBySubmission.get(row.id) || null,
    }))
    remediationSummary.value = remediation
    remediationAbMetrics.value = ab
    remediationDetailsExpanded.value = {}
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to load assignment results', 'error')
    results.value = []
    remediationSummary.value = null
    remediationAbMetrics.value = null
  } finally {
    remediationLoading.value = false
  }
}

function toggleRemediationDetails(submissionId) {
  remediationDetailsExpanded.value = {
    ...remediationDetailsExpanded.value,
    [submissionId]: !remediationDetailsExpanded.value[submissionId],
  }
}

function getExerciseId(ex, exIdx) {
  return ex?.id || `ex_${exIdx}`
}

function getRoundExerciseResponse(round, ex, exIdx) {
  const exId = getExerciseId(ex, exIdx)
  return round?.exercise_responses?.[exId] || null
}

function formatExerciseResponse(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function openAssignmentResults(assignment, worksheet) {
  selectedAssignment.value = {
    ...assignment,
    worksheet_title: worksheet?.title || assignment?.worksheet_title || 'Worksheet',
  }
  tab.value = 'results'
  loadAssignmentResults(assignment.id)
}

function prefillAssignmentEdit(assignment) {
  assignForm.value = {
    assignment_id: assignment.id,
    class_id: assignment.class_id || '',
    class_name: assignment.class_name || '',
    due_date: assignment.due_date ? String(assignment.due_date).slice(0, 10) : '',
    retry_policy: assignment.retry_policy || 'single',
  }
}

async function doAssign(wsId) {
  if (!assignForm.value.class_id) {
    uiStore.showToast('Please select a class', 'error')
    return
  }
  try {
    const selectedClassObj = classesList.value.find((c) => c.id === assignForm.value.class_id)
    if (selectedClassObj) {
      assignForm.value.class_name = selectedClassObj.name
    }
    if (assignForm.value.assignment_id) {
      await wsStore.updateAssignment(wsId, assignForm.value.assignment_id, assignForm.value)
      uiStore.showToast('Assignment schedule updated', 'success')
    } else {
      await wsStore.createAssignment(wsId, assignForm.value)
      uiStore.showToast('Assignment created', 'success')
    }
    await loadAssignmentsForWorksheet(wsId)
    clearAssignForm()
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function createClass() {
  if (!newClassName.value.trim()) return
  try {
    await classesStore.createClass({ name: newClassName.value })
    uiStore.showToast('Class created', 'success')
    newClassName.value = ''
    await classesStore.fetchClasses()
    classesList.value = classesStore.classes
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function deleteClass(id) {
  try {
    await classesStore.deleteClass(id)
    await classesStore.fetchClasses()
    classesList.value = classesStore.classes
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function viewClassProgress(id) {
  if (selectedClass.value === id) {
    selectedClass.value = null
    classProgress.value = []
    return
  }
  selectedClass.value = id
  try {
    const data = await classesStore.fetchClassProgress(id)
    classProgress.value = data.progress
  } catch {
    /* */
  }
}

async function exportCsv(id) {
  try {
    await classesStore.exportCsv(id)
    uiStore.showToast('CSV downloaded', 'success')
  } catch {
    /* */
  }
}

function giveFeedback(r) {
  feedbackTarget.value = r
  feedbackText.value = r.feedback || ''
}

async function submitFeedback() {
  if (!feedbackTarget.value) return
  try {
    await submissionsStore.submitFeedback(feedbackTarget.value.id, feedbackText.value)
    uiStore.showToast('Feedback saved', 'success')
    if (selectedAssignment.value?.id) {
      await loadAssignmentResults(selectedAssignment.value.id)
    }
    feedbackTarget.value = null
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

function openCreateCourseModal() {
  courseForm.value = {
    name: '',
    description: '',
    unlock_threshold: 60,
    deadline: '',
    badge_name: '',
  }
  createCourseModalOpen.value = true
}

function closeCreateCourseModal() {
  createCourseModalOpen.value = false
}

async function doCreateCourse() {
  if (!courseForm.value.name.trim()) return
  try {
    await coursesStore.createCourse(courseForm.value)
    uiStore.showToast('Course created successfully', 'success')
    createCourseModalOpen.value = false
    await coursesStore.fetchCourses()
  } catch (e) {
    uiStore.showToast(e.message || 'Error creating course', 'error')
  }
}

async function manageCourse(course) {
  selectedCourseId.value = course.id
  courseForm.value = {
    name: course.name || '',
    description: course.description || '',
    unlock_threshold: course.unlock_threshold !== undefined ? course.unlock_threshold : 60,
    deadline: course.deadline || '',
    badge_name: course.badge_name || '',
  }
  editingCourseWorksheetSettings.value = null
  newWorksheetToCourseId.value = ''
  newStudentToCourseId.value = ''

  try {
    await coursesStore.fetchCourse(course.id)
    manageCourseModalOpen.value = true
    await loadAllStudents()
  } catch {
    uiStore.showToast('Error loading course details', 'error')
  }
}

async function saveCourseSettings() {
  try {
    await coursesStore.updateCourseSettings(selectedCourseId.value, courseForm.value)
    uiStore.showToast('Course settings updated', 'success')
    await coursesStore.fetchCourses()
  } catch (e) {
    uiStore.showToast(e.message || 'Error updating settings', 'error')
  }
}

async function deleteCourse(id) {
  if (!confirm('Are you sure you want to delete this course?')) return
  try {
    await coursesStore.deleteCourse(id)
    uiStore.showToast('Course deleted', 'success')
    await coursesStore.fetchCourses()
  } catch (e) {
    uiStore.showToast(e.message || 'Error deleting course', 'error')
  }
}

async function addWorksheetToCourse() {
  if (!newWorksheetToCourseId.value) return
  try {
    await coursesStore.addWorksheetToCourse(selectedCourseId.value, newWorksheetToCourseId.value)
    uiStore.showToast('Worksheet added to course', 'success')
    newWorksheetToCourseId.value = ''
    await coursesStore.fetchCourse(selectedCourseId.value)
  } catch (e) {
    uiStore.showToast(e.message || 'Error adding worksheet', 'error')
  }
}

async function removeWorksheetFromCourse(worksheetId) {
  try {
    await coursesStore.removeWorksheetFromCourse(selectedCourseId.value, worksheetId)
    uiStore.showToast('Worksheet removed from course', 'success')
    if (editingCourseWorksheetSettings.value === worksheetId) {
      editingCourseWorksheetSettings.value = null
    }
    await coursesStore.fetchCourse(selectedCourseId.value)
  } catch (e) {
    uiStore.showToast(e.message || 'Error removing worksheet', 'error')
  }
}

async function moveWorksheet(worksheetId, direction) {
  const wsList = coursesStore.currentCourse?.worksheets
  if (!wsList) return
  const idx = wsList.findIndex((w) => w.id === worksheetId)
  if (idx === -1) return
  const targetIdx = idx + direction
  if (targetIdx < 0 || targetIdx >= wsList.length) return

  const listCopy = [...wsList]
  const temp = listCopy[idx]
  listCopy[idx] = listCopy[targetIdx]
  listCopy[targetIdx] = temp

  const orderedIds = listCopy.map((w) => w.id)
  try {
    await coursesStore.reorderWorksheets(selectedCourseId.value, orderedIds)
    await coursesStore.fetchCourse(selectedCourseId.value)
  } catch {
    uiStore.showToast('Error reordering worksheets', 'error')
  }
}

async function updateWorksheetOverride(ws) {
  try {
    await coursesStore.updateCourseWorksheetSettings(selectedCourseId.value, ws.id, {
      unlock_threshold:
        ws.ws_unlock_threshold !== null && ws.ws_unlock_threshold !== ''
          ? Number(ws.ws_unlock_threshold)
          : null,
      deadline: ws.ws_deadline || null,
    })
    uiStore.showToast('Worksheet settings updated', 'success')
    editingCourseWorksheetSettings.value = null
    await coursesStore.fetchCourse(selectedCourseId.value)
  } catch {
    uiStore.showToast('Error updating worksheet settings', 'error')
  }
}

async function loadAllStudents() {
  const studentsMap = new Map()
  for (const c of classesList.value) {
    try {
      const data = await api.get(`/classes/${c.id}/students`)
      if (data && data.students) {
        data.students.forEach((s) => {
          studentsMap.set(s.id, s)
        })
      }
    } catch {
      /* ignore */
    }
  }
  allStudents.value = Array.from(studentsMap.values())
}

async function enrollStudentInCourse() {
  if (!newStudentToCourseId.value) return
  try {
    await coursesStore.enrollStudent(selectedCourseId.value, newStudentToCourseId.value)
    uiStore.showToast('Student enrolled', 'success')
    newStudentToCourseId.value = ''
    await coursesStore.fetchCourse(selectedCourseId.value)
  } catch (e) {
    uiStore.showToast(e.message || 'Error enrolling student', 'error')
  }
}

async function unenrollStudentFromCourse(studentId) {
  try {
    await coursesStore.unenrollStudent(selectedCourseId.value, studentId)
    uiStore.showToast('Student unenrolled', 'success')
    await coursesStore.fetchCourse(selectedCourseId.value)
  } catch (e) {
    uiStore.showToast(e.message || 'Error unenrolling student', 'error')
  }
}
</script>

<style scoped>
/* ── Reports tab ─────────────────────────────────────────────────────────── */
.reports-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.25rem;
  align-items: start;
}

@media (max-width: 800px) {
  .reports-layout {
    grid-template-columns: 1fr;
  }
}

.reports-sidebar {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  max-height: 70vh;
  overflow-y: auto;
}

.reports-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin: 0 0 0.75rem;
}

.reports-empty {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
  padding: 0.5rem 0;
}

.report-item {
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: 1px solid transparent;
  margin-bottom: 0.4rem;
  transition: all 0.15s;
}

.report-item:hover {
  background: var(--bg-main);
  border-color: var(--border-color);
}

.report-item-active {
  background: rgba(79, 70, 229, 0.08);
  border-color: var(--primary);
}

.report-item-name {
  font-weight: 600;
  font-size: 0.85rem;
}

.report-item-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

.report-ready-badge {
  display: inline-block;
  margin-top: 0.3rem;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 20px;
  background: rgba(34, 197, 94, 0.15);
  color: #166534;
  border: 1px solid rgba(34, 197, 94, 0.4);
  animation: pulse-green 2s infinite alternate;
}

[data-theme='dark'] .report-ready-badge {
  color: #86efac;
}

@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.2);
  }
  100% {
    box-shadow: 0 0 6px 2px rgba(34, 197, 94, 0.4);
  }
}

.reports-main {
  min-width: 0;
}

.reports-placeholder {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 4rem 2rem;
  text-align: center;
}

.report-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.report-table th {
  background: var(--bg-main);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.6rem 0.75rem;
}

.report-table td {
  padding: 0.6rem 0.75rem;
  font-size: 0.87rem;
  border-bottom: 1px solid var(--border-color);
}

.row-submitted td:first-child {
  border-left: 3px solid var(--success);
}
.row-pending td:first-child {
  border-left: 3px solid var(--warning);
}

.status-chip {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
}
.chip-done {
  background: rgba(34, 197, 94, 0.12);
  color: #166534;
}
.chip-pending {
  background: rgba(245, 158, 11, 0.12);
  color: #92400e;
}
[data-theme='dark'] .chip-done {
  color: #86efac;
}
[data-theme='dark'] .chip-pending {
  color: #fde68a;
}

.score-pill {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
}
.score-pass {
  background: rgba(34, 197, 94, 0.12);
  color: #166534;
}
.score-fail {
  background: rgba(239, 68, 68, 0.12);
  color: #991b1b;
}
[data-theme='dark'] .score-pass {
  color: #86efac;
}
[data-theme='dark'] .score-fail {
  color: #fca5a5;
}

.mini-bar {
  width: 60px;
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}
.mini-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.student-progress-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  transition: all 0.3s ease;
  position: relative;
}

.student-progress-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.student-progress-card.at-risk {
  border-color: rgba(239, 68, 68, 0.4);
  background: linear-gradient(to bottom, var(--bg-card), rgba(239, 68, 68, 0.02));
  animation: pulse-border 2s infinite alternate;
}

@keyframes pulse-border {
  0% {
    box-shadow: 0 0 4px rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }
  100% {
    box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.7);
  }
}

.student-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 50%;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
}

.risk-badge {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

.complete-badge {
  background: rgba(34, 197, 94, 0.15);
  color: var(--success);
}

.track-badge {
  background: rgba(79, 70, 229, 0.15);
  color: var(--primary);
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.5s ease;
}

/* ─── Print Styles ───────────────────────────────────────────────────────────
   Moved to src/assets/theme.css (global) so that body-level selectors like
   `body > * { display: none }` are not blocked by Vue's scoped CSS hashing.
   ─────────────────────────────────────────────────────────────────────────── */
</style>
