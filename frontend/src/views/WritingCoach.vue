<template>
  <div class="page-wide writing-coach-container">
    <!-- Header Banner -->
    <div class="wc-header glass-strong">
      <div class="wc-header-left">
        <span class="wc-header-logo">✍️</span>
        <div>
          <h2 class="wc-title">LearnFlow Writing Coach</h2>
          <p class="wc-subtitle">Formative Schreibbegleitung für die Mittelschule (1.-4. Klasse / 5.-8. Schulstufe)</p>
        </div>
      </div>
      <div class="wc-header-actions">
        <!-- Dev Mode Bypass Cooldown -->
        <label v-if="state === 'workspace'" class="dev-bypass-toggle">
          <input type="checkbox" v-model="devBypassCooldown" />
          <span class="dev-bypass-label">🛠️ Dev Mode: Bypass Cooldowns</span>
        </label>
        <button v-if="state !== 'selection'" @click="confirmExit" class="btn-secondary">
          Zurück zur Auswahl
        </button>
      </div>
    </div>

    <!-- 1. SELECTION DASHBOARD -->
    <div v-if="state === 'selection'" class="selection-dashboard fade-in">
      <div class="selection-sidebar card">
        <h3 class="section-title">Filter & Einstellungen</h3>
        
        <div class="form-group">
          <label>Schulstufe / Klasse</label>
          <select v-model="filters.grade">
            <option :value="1">1. Klasse (5. Schulstufe)</option>
            <option :value="2">2. Klasse (6. Schulstufe)</option>
            <option :value="3">3. Klasse (7. Schulstufe)</option>
            <option :value="4">4. Klasse (8. Schulstufe)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Unterrichtssprache / Fach</label>
          <div class="subject-toggle-group">
            <button 
              :class="['subject-btn', filters.subject === 'de' ? 'active' : '']"
              @click="filters.subject = 'de'"
            >
              Deutsch 🇩🇪
            </button>
            <button 
              :class="['subject-btn', filters.subject === 'en' ? 'active' : '']"
              @click="filters.subject = 'en'"
            >
              English 🇬🇧
            </button>
          </div>
        </div>

        <div class="divider"></div>

        <div class="info-box">
          <h5>Lehrplan Mittelschule</h5>
          <p v-if="filters.subject === 'de'">
            Im Fach Deutsch liegt der Schwerpunkt auf dem Verfassen von strukturierten Briefen, Erlebniserzählungen, Gegenstandsbeschreibungen und argumentativen Erörterungen.
          </p>
          <p v-else>
            In English, focus is placed on text cohesion, appropriate use of past/present tenses, and structural organization of paragraphs (informal writing, story-telling, opinions).
          </p>
        </div>
      </div>

      <div class="tasks-grid">
        <div class="tasks-header">
          <h3>Verfügbare Schreibaufgaben</h3>
          <span class="badge">{{ filteredTasks.length }} Aufgaben gefunden</span>
        </div>

        <div class="tasks-list">
          <!-- Curriculum Tasks -->
          <div 
            v-for="task in filteredTasks" 
            :key="task.id" 
            class="task-card card card-lift"
            @click="selectTask(task)"
          >
            <div class="task-card-header">
              <span class="task-type-badge">{{ task.typeLabel }}</span>
              <span class="grade-badge">Klasse {{ task.grade }}</span>
            </div>
            <h4>{{ task.title }}</h4>
            <p>{{ task.description }}</p>
            <div class="task-card-footer">
              <div class="task-meta">
                <span>⏱️ Empfohlen: 30-40 Min</span>
                <span>📂 {{ task.sections.length }} Abschnitte</span>
              </div>
              <button class="btn-primary btn-sm">Starten 🚀</button>
            </div>
          </div>

          <!-- Custom Task Card -->
          <div class="task-card card custom-task-creator">
            <div class="task-card-header">
              <span class="task-type-badge custom">Eigene Aufgabe</span>
              <span class="grade-badge">Klasse {{ filters.grade }}</span>
            </div>
            <h4>Füge eine eigene Schreibaufgabe hinzu</h4>
            <p>Erstelle ein individuelles Thema mit eigenen Leitfragen für deine Schüler oder dich.</p>
            
            <div class="custom-fields" v-if="showCustomFields">
              <div class="form-group">
                <input v-model="customTask.title" placeholder="Titel der Aufgabe (z.B. Mein Haustier)" />
              </div>
              <div class="form-group">
                <textarea v-model="customTask.description" rows="2" placeholder="Beschreibe die Aufgabe..."></textarea>
              </div>
              <div class="custom-buttons">
                <button class="btn-sm btn-ghost" @click="showCustomFields = false">Abbrechen</button>
                <button class="btn-sm btn-primary" :disabled="!customTask.title" @click="startCustomTask">Aufgabe starten 🚀</button>
              </div>
            </div>
            
            <button v-else @click="showCustomFields = true" class="btn-secondary" style="width: 100%; justify-content: center;">
              + Eigene Aufgabe erstellen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. INTERACTIVE STUDENT WORKSPACE -->
    <div v-if="state === 'workspace'" class="workspace-layout fade-in">
      
      <!-- LEFT SIDE: Smart Editor -->
      <div class="workspace-editor-panel card">
        <div class="editor-header">
          <div class="editor-title-area">
            <span class="subject-indicator" :class="filters.subject">
              {{ filters.subject === 'de' ? 'DE' : 'EN' }}
            </span>
            <div>
              <h3>{{ activeTask?.title }}</h3>
              <p class="task-desc">{{ activeTask?.description }}</p>
            </div>
          </div>
          <div class="draft-badge-container">
            <span :class="['draft-badge', draftStage === 1 ? 'draft-1' : 'draft-2']">
              Draft {{ draftStage }} (Entwurf {{ draftStage }})
            </span>
          </div>
        </div>

        <!-- Progress Tracking Criteria Bars -->
        <div class="criteria-progress-bars">
          <div class="criteria-bar-container" v-for="(val, criteriaName) in criteriaScores" :key="criteriaName">
            <div class="criteria-label-row">
              <span class="criteria-name">{{ getCriteriaLabel(criteriaName) }}</span>
              <span class="criteria-value">{{ val }}%</span>
            </div>
            <div class="progress-track-bg">
              <div 
                :class="['progress-track-fill', criteriaName, val === 100 ? 'pulse-green' : '']" 
                :style="{ width: val + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="spelling-warning-row" v-if="analyzed && spellingErrorCount >= 0">
          <span class="spelling-count-badge" :class="spellingErrorCount > 0 ? 'warning' : 'success'">
            {{ spellingErrorCount > 0 ? `⚠️ ${spellingErrorCount} Rechtschreibfehler gefunden` : '✅ Keine groben Rechtschreibfehler gefunden' }}
          </span>
          <span class="word-count-badge">📝 Gesamtwortschatz: {{ totalWordCount }} Wörter</span>
        </div>

        <!-- Scaffolding Section Textareas -->
        <div class="editor-scaffolds-list">
          <div 
            v-for="(section, index) in activeTask?.sections" 
            :key="section.key" 
            :class="['section-editor-block', activeHighlightSection === section.key ? 'highlighted' : '']"
            @click="activeHighlightSection = section.key"
          >
            <div class="section-block-header">
              <div class="section-label-group">
                <span class="section-number">{{ index + 1 }}</span>
                <span class="section-label">{{ section.label }}</span>
                <span class="section-min-words">(min. {{ section.minWords }} Wörter)</span>
              </div>
              <span class="section-words">{{ getSectionWordCount(section.key) }} Wörter</span>
            </div>

            <div class="editor-textarea-wrapper">
              <textarea 
                v-model="editorContent[section.key]"
                @input="handleTextInput(section.key, $event)"
                @focus="activeHighlightSection = section.key"
                rows="4" 
                class="essay-serif-editor"
                :placeholder="section.placeholder"
                :disabled="draftStage === 2 && submittedDraft1Content[section.key] && lockDraft1InDraft2"
              ></textarea>

              <!-- Inline Get Unstuck helper menu -->
              <div class="get-unstuck-container" v-if="isLineEmpty(section.key)">
                <button @click.stop="toggleUnstuckMenu(section.key)" class="get-unstuck-trigger">
                  💡 Get Unstuck / Satzanfang
                </button>
                
                <transition name="fade">
                  <div class="unstuck-dropdown card" v-if="activeUnstuckMenu === section.key">
                    <h5 class="dropdown-title">Mögliche Satzanfänge:</h5>
                    <ul class="starters-list">
                      <li 
                        v-for="starter in activeTask?.starters?.[section.key]" 
                        :key="starter"
                        @click="insertSentenceStarter(section.key, starter)"
                      >
                        "{{ starter }}"
                      </li>
                    </ul>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>

        <!-- Compare view for Draft 2 -->
        <div v-if="draftStage === 2" class="draft1-comparison-panel card">
          <div class="comparison-header" @click="showDraft1Snapshot = !showDraft1Snapshot">
            <span>🔍 Draft 1 Schnappschuss vergleichen</span>
            <button class="btn-ghost btn-sm">{{ showDraft1Snapshot ? 'Ausblenden ▲' : 'Anzeigen ▼' }}</button>
          </div>
          <div v-if="showDraft1Snapshot" class="comparison-content fade-in">
            <div v-for="sec in activeTask?.sections" :key="'d1-'+sec.key" class="snap-section">
              <h5>{{ sec.label }} (Draft 1)</h5>
              <p class="snap-text">{{ submittedDraft1Content[sec.key] || '(Leer)' }}</p>
            </div>
          </div>
        </div>

        <div class="workspace-editor-actions">
          <button @click="triggerSpellingQuiz" class="btn-success btn-lg submit-draft-btn">
            {{ draftStage === 1 ? 'Draft 1 einreichen & weiter ➔' : 'Draft 2 (Final) einreichen 🏆' }}
          </button>
        </div>
      </div>

      <!-- RIGHT SIDE: Structural Coach -->
      <div class="workspace-coach-panel flex flex-col">
        <!-- Sidebar switcher tabs -->
        <div class="tab-pills">
          <button 
            :class="['tab-pill', rightActiveTab === 'coach' ? 'active' : '']"
            @click="rightActiveTab = 'coach'"
          >
            Socratic Coach 🤖
          </button>
          <button 
            :class="['tab-pill', rightActiveTab === 'outline' ? 'active' : '']"
            @click="rightActiveTab = 'outline'"
          >
            Visual Outline 🌿
          </button>
        </div>

        <div class="coach-tab-content flex-col flex" style="flex: 1; overflow-y: auto;">
          <!-- Empty State -->
          <div v-if="isEssayEmpty" class="empty-state">
            <div class="empty-state-icon">✍️</div>
            <div class="empty-state-title">Schreibcoach schläft...</div>
            <p class="empty-state-text">Beginne deinen Aufsatz zu schreiben, um deinen digitalen Schreibcoach aufzuwecken!</p>
          </div>

          <!-- TAB 1: Socratic Coach -->
          <div v-else-if="rightActiveTab === 'coach'" class="coach-cards-list fade-in">
            <!-- Skeleton Loader -->
            <div v-if="isAnalyzing" class="skeleton-loader-container">
              <div v-for="n in 3" :key="n" class="skeleton-card card">
                <div class="skeleton line header"></div>
                <div class="skeleton line paragraph"></div>
                <div class="skeleton line paragraph-short"></div>
              </div>
            </div>

            <div v-else-if="!analyzed" class="analyze-callout card">
              <h4>Bereit für eine Rückmeldung?</h4>
              <p>Klicke unten auf "Draft analysieren", um Struktur, Argumente und Stil prüfen zu lassen.</p>
            </div>

            <!-- Real Socratic Cards -->
            <div v-else>
              <div 
                v-for="(card, cIndex) in activeCoachingCards" 
                :key="cIndex" 
                :class="['coaching-card card', card.type, activeHighlightSection === card.section ? 'active-highlight' : '']"
                @click="highlightEditorSection(card.section)"
              >
                <div class="card-header-row">
                  <span class="card-badge">{{ getCriteriaLabel(card.type) }}</span>
                  <span class="card-section-link">→ {{ getSectionLabel(card.section) }}</span>
                </div>
                <h5 class="card-question">{{ card.question }}</h5>
                
                <div class="hint-expandable">
                  <button @click.stop="toggleCardHint(cIndex)" class="hint-toggle-btn">
                    {{ expandedHints[cIndex] ? '💡 Hinweis verstecken ▲' : '💡 Zeige Tipp/Hinweis ▼' }}
                  </button>
                  <transition name="fade">
                    <p class="hint-text" v-if="expandedHints[cIndex]">{{ card.hint }}</p>
                  </transition>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: Visual Outline -->
          <div v-else-if="rightActiveTab === 'outline'" class="visual-outline-container fade-in">
            <!-- Skeleton Loader -->
            <div v-if="isAnalyzing" class="skeleton-loader-container">
              <div class="skeleton line header" style="width: 60%; margin: 1.5rem auto;"></div>
              <div class="skeleton line paragraph" style="height: 120px; width: 80%; margin: 0 auto;"></div>
            </div>

            <div v-else class="outline-tree">
              <h4 class="outline-title">Essay-Struktur Visualisierung</h4>
              <p class="outline-desc">Diese Baumstruktur zeigt den Aufbau deines Aufsatzes. Ein grüner Haken zeigt an, dass der Abschnitt genügend Text enthält.</p>
              
              <div class="vertical-nodes-list">
                <div 
                  v-for="(sec, idx) in activeTask?.sections" 
                  :key="'node-'+sec.key"
                  :class="['outline-node', getNodeStatus(sec.key)]"
                >
                  <div class="node-bullet">
                    <span v-if="getNodeStatus(sec.key) === 'complete'">✓</span>
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                  <div class="node-content">
                    <h5 class="node-label">{{ sec.label }}</h5>
                    <p class="node-meta">
                      {{ getSectionWordCount(sec.key) }} / {{ sec.minWords }} Wörter
                      <span v-if="getNodeStatus(sec.key) === 'insufficient'" class="status-warning">(zu kurz)</span>
                    </p>
                  </div>
                  <!-- Connector line -->
                  <div class="node-connector" v-if="idx < activeTask.sections.length - 1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Actions (Analyze, Limits & Cooldowns) -->
        <div class="coach-bottom-actions card" v-if="!isEssayEmpty">
          <div class="checks-counter-row">
            <span class="checks-label">Verbleibende Analysen:</span>
            <span class="checks-value" :class="remainingChecks === 0 ? 'critical' : ''">
              {{ remainingChecks }} von 5 übrig
            </span>
          </div>

          <!-- Cooldown Warning -->
          <div v-if="cooldownRemaining > 0" class="cooldown-active-banner">
            <span>⏳ Abklingzeit aktiv: Bitte überarbeite deinen Text zuerst.</span>
            <strong>Verbleibend: {{ formatTime(cooldownRemaining) }}</strong>
          </div>

          <button 
            class="btn-primary analyze-draft-btn" 
            :disabled="isAnalyzing || remainingChecks === 0 || (cooldownRemaining > 0 && !devBypassCooldown)"
            @click="runDraftAnalysis"
          >
            <span v-if="isAnalyzing">🔄 Analysiere...</span>
            <span v-else-if="cooldownRemaining > 0 && !devBypassCooldown">⏳ Blockiert ({{ formatTime(cooldownRemaining) }})</span>
            <span v-else-if="remainingChecks === 0">❌ Keine Analysen übrig</span>
            <span v-else>🔍 Entwurf analysieren</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 3. PRE-SUBMISSION SPELLING QUIZ OVERLAY -->
    <div class="modal-overlay" v-if="spellingQuizModalOpen">
      <div class="modal spelling-quiz-modal">
        <div class="modal-header">
          <h3>🧠 Rechtschreib-Training / Spelling Check</h3>
          <span class="badge badge-warning">Pflicht vor der Abgabe</span>
        </div>

        <!-- PHASE 1: STUDY PHASE -->
        <div v-if="spellingQuizPhase === 'study'" class="study-phase fade-in">
          <p class="quiz-instruction-text">
            Wir haben in deinem Text ein paar Fehler gefunden. Sieh dir die korrekten Schreibweisen an. 
            Du hast **30 Sekunden Zeit**, sie dir einzuprägen, danach startet ein kleiner Test!
          </p>

          <!-- Study words table -->
          <div class="study-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Falsch geschrieben</th>
                  <th>Richtige Schreibweise</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="word in quizWords" :key="word.wrong">
                  <td class="word-wrong">{{ word.wrong }}</td>
                  <td class="word-correct">{{ word.correct }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Countdown timer visual -->
          <div class="study-countdown-container">
            <div class="countdown-bar-bg">
              <div class="countdown-bar-fill" :style="{ width: (studyTimer / 30) * 100 + '%' }"></div>
            </div>
            <p class="countdown-text">Noch <strong>{{ studyTimer }} Sekunden</strong> zum Einprägen...</p>
          </div>

          <div class="modal-actions">
            <button @click="startQuizPhase" class="btn-primary" style="width: 100%;">
              Ich habe es mir gemerkt, Test starten! ➔
            </button>
          </div>
        </div>

        <!-- PHASE 2: QUIZ PHASE -->
        <div v-if="spellingQuizPhase === 'quiz'" class="quiz-phase fade-in">
          <p class="quiz-instruction-text">
            Schreibe die Wörter nun korrekt auf! (Tipp: Achte auf Groß- und Kleinschreibung).
          </p>

          <div class="quiz-questions-list">
            <div v-for="(word, qIndex) in quizWords" :key="'q-'+qIndex" class="quiz-question-row">
              <label class="quiz-prompt-label">Wie schreibt man das Wort <strong>"{{ word.wrong }}"</strong> richtig?</label>
              <input 
                v-model="word.userTyped" 
                placeholder="Schreibe das korrekte Wort hier..." 
                class="quiz-input"
                @keyup.enter="focusNextQuizInput(qIndex)"
                :ref="el => { if (el) quizInputs[qIndex] = el }"
              />
            </div>
          </div>

          <div class="modal-actions">
            <button @click="checkQuizAnswers" class="btn-success" style="width: 100%;">
              Antworten prüfen & abgeben ➔
            </button>
          </div>
        </div>

        <!-- PHASE 3: RESULT PHASE -->
        <div v-if="spellingQuizPhase === 'result'" class="quiz-result-phase fade-in">
          <h4 class="result-title">Testergebnis</h4>
          
          <div class="results-summary">
            <div class="score-radial">
              <span class="score-number">{{ quizCorrectCount }} / {{ quizWords.length }}</span>
              <span class="score-label">richtig</span>
            </div>
            <p v-if="quizCorrectCount === quizWords.length" class="result-message success">
              Hervorragend! Du hast alle Wörter richtig korrigiert. Der Entwurf wird nun eingereicht!
            </p>
            <p v-else class="result-message partial">
              Guter Versuch! Wir haben die restlichen Fehler korrigiert. Du kannst deinen Entwurf jetzt einreichen.
            </p>
          </div>

          <div class="result-details-list">
            <div v-for="word in quizWords" :key="'res-'+word.wrong" class="result-detail-item">
              <span class="result-icon">{{ word.isCorrect ? '✅' : '❌' }}</span>
              <div class="result-detail-content">
                <span>Eingabe: <code class="user-typed" :class="word.isCorrect ? 'correct' : 'wrong'">{{ word.userTyped || '(Keine)' }}</code></span>
                <span>Korrekt: <strong class="correct-text">{{ word.correct }}</strong></span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="finalizeSubmission" class="btn-primary" style="width: 100%;">
              Fortfahren & Entwurf abgeben ➔
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. FORMATIVE PROGRESS & COMPARISON REPORT -->
    <div v-if="state === 'report'" class="report-view card fade-in">
      <div class="report-header">
        <span class="badge badge-success">🏆 Schreib-Projekt abgeschlossen!</span>
        <h2>Formatives Feedback & Fortschrittsbericht</h2>
        <p>Glückwunsch! Du hast zwei Entwürfe ausgearbeitet und überarbeitet. Hier ist deine Auswertung.</p>
      </div>

      <!-- Growth Metrics Stats -->
      <div class="report-stats-grid">
        <div class="stat-card">
          <span class="stat-icon">📈</span>
          <span class="stat-label">Struktur & Qualität</span>
          <span class="stat-value">+{{ progressReport.qualityIncrease }}%</span>
          <span class="stat-sub">Verbesserung von Draft 1 zu 2</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📚</span>
          <span class="stat-label">Wortschatz-Vielfalt</span>
          <span class="stat-value">+{{ progressReport.vocabIncrease }}%</span>
          <span class="stat-sub">Verwendung reicherer Adjektive/Verben</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🎯</span>
          <span class="stat-label">Rechtschreib-Fortschritt</span>
          <span class="stat-value">{{ progressReport.spellingResolved }} Fehler</span>
          <span class="stat-sub">im finalen Text korrigiert</span>
        </div>
      </div>

      <!-- Side by side comparison -->
      <div class="comparison-side-by-side">
        <div class="comparison-column card">
          <h4>Draft 1 (Erster Entwurf)</h4>
          <div class="comparison-text-box">
            <div v-for="sec in activeTask?.sections" :key="'rep1-'+sec.key" style="margin-bottom: 1rem;">
              <strong>{{ sec.label }}:</strong>
              <p class="serif-report-text">{{ submittedDraft1Content[sec.key] }}</p>
            </div>
          </div>
        </div>
        <div class="comparison-column card">
          <h4>Draft 2 (Überarbeiteter Text)</h4>
          <div class="comparison-text-box final">
            <div v-for="sec in activeTask?.sections" :key="'rep2-'+sec.key" style="margin-bottom: 1rem;">
              <strong>{{ sec.label }}:</strong>
              <p class="serif-report-text">{{ submittedDraft2Content[sec.key] }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Formative Teacher/AI Feedback -->
      <div class="formative-text-feedback card">
        <h3>💡 Entwicklungsfeedback für dich</h3>
        <div class="feedback-points">
          <div class="feedback-point positive">
            <strong>Das hast du super gemacht:</strong>
            <p v-if="filters.subject === 'de'">
              Deine Struktur im Hauptteil ist logisch aufgebaut. Die Sätze fließen gut ineinander über, und der Text liest sich flüssig. Durch das Rechtschreibtraining hast du typische Fehler im finalen Entwurf erfolgreich vermieden!
            </p>
            <p v-else>
              Excellent progression of points in your body paragraphs. Your concluding sentence wraps up the overall topic beautifully, and you demonstrated great vocabulary growth between drafts.
            </p>
          </div>
          <div class="feedback-point constructive">
            <strong>Daran kannst du noch arbeiten:</strong>
            <p v-if="filters.subject === 'de'">
              Versuche beim nächsten Mal, in der Einleitung noch genauer auf die W-Fragen (Wer, Wann, Wo) einzugehen, um den Leser noch besser abzuholen.
            </p>
            <p v-else>
              Keep working on transitional words (e.g., Furthermore, However, Consequently) to link your body sentences more smoothly.
            </p>
          </div>
        </div>
      </div>

      <div class="report-footer-actions">
        <button @click="backToSelection" class="btn-primary btn-lg" style="margin: 0 auto;">
          Neues Schreibprojekt starten ✍️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

// Views state
const authStore = useAuthStore()
const uiStore = useUiStore()

type Section = {
  key: string
  label: string
  placeholder: string
  minWords: number
}

type Task = {
  id: string
  title: string
  description: string
  grade: number
  subject: string
  typeLabel: string
  sections: Section[]
  starters: Record<string, string[]>
  draft1Socratic: Array<{ section: string; question: string; hint: string }>
  draft2Socratic: Array<{ section: string; question: string; hint: string }>
  commonSpellingErrors: { wrong: string[]; correct: string[] }
}

const state = ref<'selection' | 'workspace' | 'report'>('selection')
const filters = ref({
  grade: 1,
  subject: 'de'
})

// Custom task builder state
const showCustomFields = ref(false)
const customTask = ref({
  title: '',
  description: ''
})

// Workspace state
const activeTask = ref<Task | null>(null)
const draftStage = ref<1 | 2>(1)
const editorContent = ref<Record<string, string>>({})
const submittedDraft1Content = ref<Record<string, string>>({})
const submittedDraft2Content = ref<Record<string, string>>({})
const showDraft1Snapshot = ref(false)
const lockDraft1InDraft2 = ref(false) // Whether we lock text elements

// Cooldown & Analysis constraints
const remainingChecks = ref(5)
const cooldownRemaining = ref(0)
const cooldownInterval = ref<any>(null)
const devBypassCooldown = ref(false)
const isAnalyzing = ref(false)
const analyzed = ref(false)
const spellingErrorCount = ref(0)

const criteriaScores = ref({
  structure: 0,
  content: 0,
  style: 0
})

const rightActiveTab = ref<'coach' | 'outline'>('coach')
const activeHighlightSection = ref<string | null>(null)
const expandedHints = ref<Record<number, boolean>>({})

// Spelling quiz state
const spellingQuizModalOpen = ref(false)
const spellingQuizPhase = ref<'study' | 'quiz' | 'result'>('study')
const studyTimer = ref(30)
const studyInterval = ref<any>(null)
const quizWords = ref<Array<{ wrong: string; correct: string; userTyped: string; isCorrect: boolean }>>([])
const quizInputs = ref<any[]>([])

// Final report state
const progressReport = ref({
  qualityIncrease: 0,
  vocabIncrease: 0,
  spellingResolved: 0
})

// Static curriculum database
const CURRICULUM_TASKS: Task[] = [
  // --- GERMAN ---
  {
    id: 'de-1-brief',
    title: 'Persönlicher Brief: Postkarte aus den Ferien',
    description: 'Schreibe einen Brief an einen Freund/eine Freundin über deinen Urlaub. Berichte von deinen spannendsten Ferienerlebnissen!',
    grade: 1,
    subject: 'de',
    typeLabel: 'Brief',
    sections: [
      { key: 'intro', label: 'Anrede, Ort & Einleitung', placeholder: 'z.B.: Telfs, am 28. Mai. Lieber Lukas, ich hoffe, es geht dir gut...', minWords: 15 },
      { key: 'body', label: 'Hauptteil (Ferienerlebnisse)', placeholder: 'Berichte, was du unternommen hast, wie das Wetter war und was dir am besten gefällt...', minWords: 40 },
      { key: 'conclusion', label: 'Schluss & Abschiedsgruß', placeholder: 'z.B.: Ich freue mich schon, dich bald wiederzusehen. Viele Grüße, dein/eine...', minWords: 15 }
    ],
    starters: {
      intro: ['Liebe / Lieber...', 'Ich hoffe, es geht dir gut.', 'Ich schreibe dir heute aus...', 'Viele Grüße aus meinem Urlaub in...'],
      body: ['Am ersten Tag haben wir...', 'Das Wetter ist wirklich...', 'Ein besonderes Highlight war...', 'Es gibt hier so viel zu tun, zum Beispiel...'],
      conclusion: ['Ich wünsche dir noch schöne Ferientage.', 'Schreib mir bald zurück!', 'Herzliche Grüße', 'Bis bald, dein/deine...']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Hast du den Brief mit einer passenden Anrede und dem Ausstellungsort begonnen?', hint: 'Bei einem Brief gehört rechts oben der Ort und das Datum hin (z.B. "Telfs, am 28. Mai"). Dann folgt die persönliche Anrede.' },
      { section: 'body', question: 'Könntest du deine Erlebnisse noch lebendiger beschreiben? Welche Geräusche oder Gerüche gab es?', hint: 'Benutze anschauliche Adjektive wie "sonnig", "aufregend", "wunderschön" oder "stürmisch", um deine Ferien lebendig darzustellen.' },
      { section: 'conclusion', question: 'Gibt es eine abschließende Frage an deinen Freund und einen netten Abschiedsgruß?', hint: 'Du könntest fragen: "Wie verbringst du deine Ferien?" und danach "Viele Grüße" schreiben.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Hast du Sätze, die immer mit "Und dann..." oder "Ich..." beginnen? Versuche, diese Satzanfänge abzuwechseln.', hint: 'Satzanfänge wie "Später", "Danach", "Am Nachmittag" oder "Glücklicherweise" machen deinen Brief viel spannender.' }
    ],
    commonSpellingErrors: {
      wrong: ['urlaub', 'nämlich', 'bisschen', 'daß', 'vollkommen'],
      correct: ['Urlaub', 'nämlich', 'bisschen', 'dass', 'vollkommen']
    }
  },
  {
    id: 'de-1-erzaehlung',
    title: 'Erlebniserzählung: Ein stürmisches Abenteuer',
    description: 'Erzähle von einem Ausflug, bei dem du überraschend in ein schweres Gewitter geraten bist. Baue einen spannenden Höhepunkt auf!',
    grade: 1,
    subject: 'de',
    typeLabel: 'Erlebniserzählung',
    sections: [
      { key: 'intro', label: 'Einleitung (Wer, Wann, Wo)', placeholder: 'Wer war dabei? Wann ging es los? Wohin habt ihr euren Ausflug gemacht?', minWords: 20 },
      { key: 'body', label: 'Hauptteil (Spannungsaufbau & Höhepunkt)', placeholder: 'Wie veränderte sich der Himmel? Welches Geräusch hat dich erschreckt? Wo habt ihr Schutz gesucht?', minWords: 50 },
      { key: 'conclusion', label: 'Schluss (Rettung & Heimkehr)', placeholder: 'Wie ging das Abenteuer aus? Wie hast du dich gefühlt, als du wieder im Warmen warst?', minWords: 20 }
    ],
    starters: {
      intro: ['An einem sonnigen Samstagvormittag...', 'Wir packten unsere Rucksäcke für eine Wanderung nach...', 'Zusammen mit meiner Familie brach ich auf, um...'],
      body: ['Plötzlich verdunkelte sich der Himmel...', 'Ein heftiger Windstoß fegte über...', 'Der erste Donner grollte laut in den Bergen...', 'Vor Angst fing mein Herz an zu klopfen...'],
      conclusion: ['Zum Glück sahen wir eine kleine Hütte...', 'Als wir endlich müde, aber sicher zu Hause anamen...', 'Dieses Erlebnis werde ich so schnell nicht vergessen.']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Ist die Einleitung spannend genug, um den Ausflug lebendig zu starten?', hint: 'Nenne die Beteiligten und das Ausflugsziel klar, um die Ausgangslage zu klären.' },
      { section: 'body', question: 'Gibt es einen klaren Höhepunkt im Hauptteil, bei dem die Gefahr am größten war?', hint: 'Nutze kurze Sätze, um die Hektik beim Aufziehen des Sturms darzustellen.' },
      { section: 'conclusion', question: 'Wird am Ende beschrieben, wie sich deine Gefühle nach dem Sturm beruhigt haben?', hint: 'Schreibe über das Gefühl der Erleichterung, als du wieder in Sicherheit warst.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Hast du Verben der Bewegung treffend eingesetzt? (z.B. rennen, stürmen, flüchten)', hint: 'Statt "Wir gingen schnell" schreibe lieber "Wir stürmten los" oder "Wir flüchteten unter ein Vordach".' }
    ],
    commonSpellingErrors: {
      wrong: ['gewitter', 'plötzlich', 'angst', 'wieder', 'flüchten'],
      correct: ['Gewitter', 'plötzlich', 'Angst', 'wieder', 'flüchten']
    }
  },
  {
    id: 'de-2-beschreibung',
    title: 'Gegenstandsbeschreibung: Ein verlorener Gegenstand',
    description: 'Beschreibe ein Fundstück oder einen Gegenstand so präzise, dass jemand ihn allein anhand deines Textes sofort zeichnen oder erkennen könnte.',
    grade: 2,
    subject: 'de',
    typeLabel: 'Beschreibung',
    sections: [
      { key: 'intro', label: 'Einleitung (Name & Gesamteindruck)', placeholder: 'Um welchen Gegenstand handelt es sich? Welche Größe und Gesamtform hat er?', minWords: 15 },
      { key: 'body', label: 'Hauptteil (Farbe, Material & Details)', placeholder: 'Beschreibe das Material, farbliche Besonderheiten, Muster und Abnutzungsspuren von oben nach unten...', minWords: 45 },
      { key: 'conclusion', label: 'Schluss (Verwendungszweck & Wert)', placeholder: 'Wofür wird der Gegenstand benutzt? Welchen Nutzen oder Wert hat er für dich?', minWords: 15 }
    ],
    starters: {
      intro: ['Bei dem zu beschreibenden Gegenstand handelt es sich um...', 'Der Gegenstand ist ungefähr so groß wie...', 'Auf den ersten Blick wirkt das Objekt...'],
      body: ['Die Oberfläche fühlt sich... an.', 'Hergestellt ist das Gehäuse aus...', 'An der linken Seite befindet sich ein kleiner...', 'Bei genauerem Hinsehen bemerkt man leichte Kratzer auf...'],
      conclusion: ['Dieser Gegenstand dient hauptsächlich dazu,...', 'Für den Besitzer hat dieses Fundstück einen hohen...', 'Zusammenfassend lässt sich sagen, dass...']
    },
    draft1Socratic: [
      { section: 'body', question: 'Gehst du bei deiner Beschreibung systematisch vor (z.B. von oben nach unten oder außen nach innen)?', hint: 'Ein ungeordnetes Beschreiben verwirrt den Leser. Wähle eine logische Reihenfolge für die Details.' },
      { section: 'body', question: 'Hast du auch auf Abnutzungsspuren oder Beschädigungen hingewiesen?', hint: 'Dinge wie Kratzer, Dellen oder Verfärbungen machen die Beschreibung einzigartig und präzise.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Benutzt du präzise Materialbegriffe? (Holz, Kunststoff, Aluminium)', hint: 'Statt "Es ist aus festem Stoff" schreibe genauer "Es besteht aus reißfestem Nylon" oder "marmoriertem Kunststoff".' }
    ],
    commonSpellingErrors: {
      wrong: ['große', 'plastik', 'oberfläche', 'kratzer', 'metallisch'],
      correct: ['Größe', 'Plastik', 'Oberfläche', 'Kratzer', 'metallisch']
    }
  },
  {
    id: 'de-3-bericht',
    title: 'Bericht: Verkehrsunfall auf der Schulstraße',
    description: 'Verfasse einen sachlichen Zeitungsbericht über einen Fahrradunfall vor der Schule. Verwende keine Gefühlsäußerungen!',
    grade: 3,
    subject: 'de',
    typeLabel: 'Bericht',
    sections: [
      { key: 'intro', label: 'Einleitung (Die W-Fragen)', placeholder: 'Schlagzeile. Wann, Wo, Wer, Was ist passiert? Fasse den Kern des Geschehens kurz zusammen.', minWords: 25 },
      { key: 'body', label: 'Hauptteil (Genauer Unfallhergang & Folgen)', placeholder: 'Wie kam es zum Zusammenstoß? Wer hat die Rettung gerufen? Welche Verletzungen gab es?', minWords: 50 },
      { key: 'conclusion', label: 'Schluss (Aktueller Zustand & Zeugenaufruf)', placeholder: 'Wie ist der aktuelle Zustand der Beteiligten? Sucht die Polizei noch nach Zeugen?', minWords: 20 }
    ],
    starters: {
      intro: ['Schulstraße: Schüler kollidiert mit PKW...', 'Am gestrigen Mittwochmorgen ereignete sich gegen 07:45 Uhr...', 'Vor der Mittelschule Telfs kam es zu einem folgenschweren Zusammenstoß...'],
      body: ['Laut Zeugenaussagen übersah der 12-jährige Fahrradfahrer...', 'Der PKW-Lenker versuchte noch, durch ein Ausweichmanöver...', 'Ersthelfer kümmerten sich umgehend um...', 'Die verständigte Rettung transportierte den Verletzten in...'],
      conclusion: ['Wie das Krankenhaus am Nachmittag mitteilte,...', 'Die Polizeiinspektion bittet Zeugen, sich unter der Nummer... zu melden.', 'Es entstand ein Sachschaden in Höhe von circa...']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Sind alle W-Fragen (Wer, Was, Wann, Wo) im ersten Absatz direkt beantwortet?', hint: 'Der Leser muss nach der Einleitung sofort wissen, wer beteiligt war und wo es passierte.' },
      { section: 'body', question: 'Schreibst du streng sachlich? Hast du Vermutungen oder Emotionen weggelassen?', hint: 'Im Bericht haben Wörter wie "schrecklich", "leider" oder "der böse Autofahrer" nichts verloren. Bleibe objektiv.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Steht der Bericht durchgehend in der Vergangenheitsform (Präteritum)?', hint: 'Berichte werden im Präteritum geschrieben (z.B. "kollidierte", "wich aus", "traf ein").' }
    ],
    commonSpellingErrors: {
      wrong: ['unfal', 'polizey', 'gestern', 'fahrrad', 'verletztung'],
      correct: ['Unfall', 'Polizei', 'gestern', 'Fahrrad', 'Verletzung']
    }
  },
  {
    id: 'de-4-erorterung',
    title: 'Argumentative Erörterung: Handys im Unterricht?',
    description: 'Sollen Smartphones im Unterricht erlaubt sein? Erörtere das Thema mit logischen Pro- und Contra-Argumenten.',
    grade: 4,
    subject: 'de',
    typeLabel: 'Erörterung',
    sections: [
      { key: 'intro', label: 'Einleitung (Hinführung zum Thema)', placeholder: 'Warum ist das Thema heutzutage wichtig? Stelle die Streitfrage klar dar.', minWords: 25 },
      { key: 'body', label: 'Hauptteil (Pro- & Contra-Argumente)', placeholder: 'Nenne Argumente für Handys (z.B. Recherche) und Gegenargumente (z.B. Ablenkung) mit Beispielen.', minWords: 65 },
      { key: 'conclusion', label: 'Schluss (Synthese & Eigene Meinung)', placeholder: 'Fasse die Argumente zusammen und ziehe ein persönliches, begründetes Fazit.', minWords: 25 }
    ],
    starters: {
      intro: ['Heutzutage besitzt fast jeder Jugendliche...', 'In den Medien wird heftig darüber debattiert, ob...', 'Die Frage, ob Handys im Unterricht nützlich sind, beschäftigt viele...'],
      body: ['Ein wichtiges Argument für die Nutzung ist...', 'Gegner weisen jedoch darauf hin, dass...', 'Ein anschauliches Beispiel hierfür ist...', 'Darüber hinaus darf man nicht vergessen, dass...'],
      conclusion: ['Abwägend lässt sich sagen, dass...', 'Meiner persönlichen Meinung nach...', 'Zusammenfassend komme ich zu dem Schluss, dass...']
    },
    draft1Socratic: [
      { section: 'body', question: 'Hast du deine Argumente nach der 3B-Regel aufgebaut (Behauptung, Begründung, Beispiel)?', hint: 'Eine bloße Behauptung reicht nicht. Du musst sie begründen und mit einem konkreten Beispiel (z.B. "Recherche im Geographie-Unterricht") belegen.' },
      { section: 'body', question: 'Sind Pro- und Contra-Argumente ausgewogen gewichtet?', hint: 'Stelle sicher, dass du beide Seiten der Medaille beleuchtest, bevor du ein Urteil fällst.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Verwendest du Überleitungswörter, um Argumente logisch zu verknüpfen?', hint: 'Nutze Konjunktionen wie "Einerseits / Andererseits", "Demgegenüber steht", "Folglich" oder "Zusätzlich ist zu erwähnen".' }
    ],
    commonSpellingErrors: {
      wrong: ['kucken', 'argumentiren', 'internet', 'vorteil', 'deswegen'],
      correct: ['gucken', 'argumentieren', 'Internet', 'Vorteil', 'deswegen']
    }
  },

  // --- ENGLISH ---
  {
    id: 'en-1-hobby',
    title: 'My Favourite Hobby',
    description: 'Write a paragraph about your favourite hobby. Describe what it is, when you do it, and why you like it.',
    grade: 1,
    subject: 'en',
    typeLabel: 'Paragraph',
    sections: [
      { key: 'intro', label: 'Topic Sentence (Introduction)', placeholder: 'My absolute favourite hobby is... because...', minWords: 12 },
      { key: 'body', label: 'Supporting Details (When, Where, How)', placeholder: 'How often do you practice this hobby? Where do you do it? Who do you do it with?', minWords: 35 },
      { key: 'conclusion', label: 'Concluding Sentence (Summary)', placeholder: 'All in all, this hobby makes me feel... and I recommend it to...', minWords: 12 }
    ],
    starters: {
      intro: ['My favourite hobby is...', 'In my free time, I love to...', 'The activity I enjoy the most is...'],
      body: ['I usually do this on weekends at...', 'I play/practice with my friends from...', 'To do this, I need a...', 'It is very exciting because...'],
      conclusion: ['In conclusion, I think...', 'I can say that my hobby is...', 'If you want to try it, you should...']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Did you introduce your hobby clearly in the first sentence?', hint: 'Start with a strong topic sentence like: "My favourite hobby is playing football because it keeps me active."' },
      { section: 'body', question: 'Did you explain who you practice with and what gear you need?', hint: 'Describe the equipment (e.g. racket, console, shoes) and the people you share the hobby with.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Are you using action verbs to describe what you do?', hint: 'Instead of saying "I do football", say "I kick the ball", "I run fast", or "I score goals".' }
    ],
    commonSpellingErrors: {
      wrong: ['hoby', 'favourit', 'becuase', 'freind', 'playin'],
      correct: ['hobby', 'favourite', 'because', 'friend', 'playing']
    }
  },
  {
    id: 'en-2-story',
    title: 'Short Story: The Magic Key',
    description: 'Write a short creative story about finding a small key in the forest that opens a mysterious hidden door.',
    grade: 2,
    subject: 'en',
    typeLabel: 'Creative Story',
    sections: [
      { key: 'intro', label: 'Introduction (Setting the scene)', placeholder: 'Describe the weather, the forest, and how you found the key...', minWords: 20 },
      { key: 'body', label: 'Climax (The mysterious door)', placeholder: 'Where did the key lead you? What did the door look like? What happened when you opened it?', minWords: 45 },
      { key: 'conclusion', label: 'Resolution (How it ends)', placeholder: 'Did you go inside? What was the secret? How did you return home?', minWords: 20 }
    ],
    starters: {
      intro: ['One sunny autumn afternoon, I was walking in the...', 'Suddenly, I saw something glowing under a pile of leaves...', 'It was a tiny, golden key with strange patterns on it...'],
      body: ['Following a narrow path, I discovered an old oak tree...', 'In the middle of the trunk, there was a tiny iron door...', 'My hand was shaking as I put the key into the lock...'],
      conclusion: ['Inside, I found a box full of...', 'It was an adventure I will never forget...', 'From that day on, I always carry the key with me.']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Do you set a clear mood in the forest scene?', hint: 'Use sensory details: what did the leaves sound like? Was it cold or warm?' },
      { section: 'body', question: 'Do you build tension before the door is opened?', hint: 'Describe how your character felt. Were they scared, excited, or nervous?' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Did you write your story in the past tense?', hint: 'Stories are usually written in simple past. Check verbs like "go -> went", "find -> found", "open -> opened".' }
    ],
    commonSpellingErrors: {
      wrong: ['forrest', 'sudently', 'mysterious', 'opended', 'golden'],
      correct: ['forest', 'suddenly', 'mysterious', 'opened', 'golden']
    }
  },
  {
    id: 'en-4-opinion',
    title: 'Opinion Essay: Mobile Phones in School',
    description: 'Should mobile phones be banned in schools? Write an essay expressing your opinion with supporting reasons.',
    grade: 4,
    subject: 'en',
    typeLabel: 'Opinion Essay',
    sections: [
      { key: 'intro', label: 'Introduction (Hook & Thesis)', placeholder: 'Introduce the debate and state your opinion clearly...', minWords: 25 },
      { key: 'body', label: 'Body Paragraphs (Reasons & Examples)', placeholder: 'Give at least two reasons to support your opinion. Provide examples...', minWords: 60 },
      { key: 'conclusion', label: 'Conclusion (Summary of main points)', placeholder: 'Restate your opinion in a new way and wrap up your arguments...', minWords: 20 }
    ],
    starters: {
      intro: ['Nowadays, almost every student carries a smartphone to school...', 'The question of whether phones should be allowed in class is highly debated...', 'In my opinion, school phone bans are... because...'],
      body: ['First of all, smartphones can be a major distraction during...', 'On the other hand, they can also be used as a helpful tool for...', 'For example, students can quickly look up dictionary words or...'],
      conclusion: ['To sum up, I believe that...', 'Taking everything into consideration, school boards should...', 'In conclusion, it is clear that...']
    },
    draft1Socratic: [
      { section: 'body', question: 'Did you support your opinion with real-life examples?', hint: 'Instead of just saying "phones distract", give an example like: "Students might secretly text or play games under their desks during math class."' },
      { section: 'intro', question: 'Is your stance (thesis) clear in the introduction?', hint: 'Make a clear statement: "I strongly believe that phones should be allowed for educational use only."' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Are you using formal transition words to link your points?', hint: 'Use linking words: "Furthermore", "In addition", "However", "Consequently", or "Therefore".' }
    ],
    commonSpellingErrors: {
      wrong: ['goverment', 'distractin', 'classroom', 'opinion', 'alowed'],
      correct: ['government', 'distraction', 'classroom', 'opinion', 'allowed']
    }
  }
]

// Filters
const filteredTasks = computed(() => {
  return CURRICULUM_TASKS.filter(
    t => t.grade === filters.value.grade && t.subject === filters.value.subject
  )
})

// Current Task Selection
function selectTask(task: Task) {
  activeTask.value = task
  draftStage.value = 1
  analyzed.value = false
  remainingChecks.value = 5
  cooldownRemaining.value = 0
  spellingErrorCount.value = 0
  
  // Initialize editor content based on sections
  const contentObj: Record<string, string> = {}
  task.sections.forEach(s => {
    contentObj[s.key] = ''
  })
  editorContent.value = contentObj
  submittedDraft1Content.value = {}
  submittedDraft2Content.value = {}
  
  // Try to load state from localStorage if exists
  const saved = localStorage.getItem(`learnflow_wc_essay_${task.id}`)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      editorContent.value = parsed.editorContent || contentObj
      submittedDraft1Content.value = parsed.submittedDraft1Content || {}
      submittedDraft2Content.value = parsed.submittedDraft2Content || {}
      draftStage.value = parsed.draftStage || 1
      remainingChecks.value = parsed.remainingChecks !== undefined ? parsed.remainingChecks : 5
      
      // Calculate remaining cooldown if any
      if (parsed.cooldownEndTime) {
        const diff = Math.ceil((parsed.cooldownEndTime - Date.now()) / 1000)
        if (diff > 0) {
          cooldownRemaining.value = diff
          startCooldownTimer()
        }
      }
      
      analyzed.value = parsed.analyzed || false
      criteriaScores.value = parsed.criteriaScores || { structure: 0, content: 0, style: 0 }
      spellingErrorCount.value = parsed.spellingErrorCount || 0
    } catch (e) {
      console.error('Failed to load saved essay state', e)
    }
  }
  
  state.value = 'workspace'
  activeHighlightSection.value = task.sections[0]?.key || null
  expandedHints.value = {}
  rightActiveTab.value = 'coach'
}

// Custom task builder triggers
function startCustomTask() {
  if (!customTask.value.title) return
  
  const customId = `custom-${Date.now()}`
  const newTask: Task = {
    id: customId,
    title: customTask.value.title,
    description: customTask.value.description || 'Eigene Schreibaufgabe ohne Beschreibung.',
    grade: filters.value.grade,
    subject: filters.value.subject,
    typeLabel: 'Freies Schreiben',
    sections: [
      { key: 'intro', label: 'Einleitung', placeholder: 'Schreibe hier den Beginn deines Textes...', minWords: 15 },
      { key: 'body', label: 'Hauptteil', placeholder: 'Schreibe hier den Hauptinhalt...', minWords: 40 },
      { key: 'conclusion', label: 'Schluss', placeholder: 'Schreibe hier das Fazit oder Ende...', minWords: 15 }
    ],
    starters: {
      intro: filters.value.subject === 'de' 
        ? ['Zuerst möchte ich...', 'Zu Beginn...', 'Es war einmal...'] 
        : ['To begin with...', 'Once upon a time...', 'I want to write about...'],
      body: filters.value.subject === 'de'
        ? ['Darüber hinaus...', 'Danach passierte...', 'Ein wichtiger Punkt ist...']
        : ['Furthermore...', 'Next, something happened...', 'An important aspect is...'],
      conclusion: filters.value.subject === 'de'
        ? ['Zusammenfassend...', 'Schließlich...', 'Am Ende stellte sich heraus...']
        : ['In conclusion...', 'Finally...', 'In the end, it turned out that...']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Ist die Einleitung aussagekräftig und weckt das Interesse?', hint: 'Formuliere einen einladenden ersten Satz.' },
      { section: 'body', question: 'Hast du den Hauptteil ausreichend detailliert beschrieben?', hint: 'Füge Beispiele oder nähere Details hinzu, um den Inhalt verständlicher zu machen.' },
      { section: 'conclusion', question: 'Findest du einen runden Schluss für deinen Text?', hint: 'Fasse die Kernaussage in einem letzten Satz zusammen.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Verwendest du abwechslungsreiche Wörter und Satzstrukturen?', hint: 'Vermeide Wortwiederholungen durch Synonyme.' }
    ],
    commonSpellingErrors: {
      wrong: filters.value.subject === 'de' ? ['daß', 'nämlich', 'bisschen'] : ['becuase', 'freind', 'untill'],
      correct: filters.value.subject === 'de' ? ['dass', 'nämlich', 'bisschen'] : ['because', 'friend', 'until']
    }
  }

  showCustomFields.value = false
  customTask.value = { title: '', description: '' }
  selectTask(newTask)
}

function saveEssayState() {
  if (!activeTask.value) return
  
  const stateData = {
    editorContent: editorContent.value,
    submittedDraft1Content: submittedDraft1Content.value,
    submittedDraft2Content: submittedDraft2Content.value,
    draftStage: draftStage.value,
    remainingChecks: remainingChecks.value,
    cooldownEndTime: cooldownRemaining.value > 0 ? Date.now() + (cooldownRemaining.value * 1000) : null,
    analyzed: analyzed.value,
    criteriaScores: criteriaScores.value,
    spellingErrorCount: spellingErrorCount.value
  }
  
  localStorage.setItem(`learnflow_wc_essay_${activeTask.value.id}`, JSON.stringify(stateData))
}

// Text input tracking
function handleTextInput(sectionKey: string, event: Event) {
  saveEssayState()
}

// Section Word Counts
function getSectionWordCount(sectionKey: string): number {
  const text = editorContent.value[sectionKey] || ''
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

const totalWordCount = computed(() => {
  let total = 0
  if (!activeTask.value) return 0
  activeTask.value.sections.forEach(s => {
    total += getSectionWordCount(s.key)
  })
  return total
})

const isEssayEmpty = computed(() => {
  return totalWordCount.value === 0
})

// Outline node completion status
function getNodeStatus(sectionKey: string): 'empty' | 'insufficient' | 'complete' {
  const count = getSectionWordCount(sectionKey)
  const sec = activeTask.value?.sections.find(s => s.key === sectionKey)
  if (count === 0) return 'empty'
  if (sec && count < sec.minWords) return 'insufficient'
  return 'complete'
}

// Helpers for criteria labeling
function getCriteriaLabel(cName: string): string {
  const labels: Record<string, string> = {
    structure: 'Struktur (Structure)',
    content: 'Inhalt & Argumente (Content)',
    style: 'Sprache & Stil (Style)'
  }
  return labels[cName] || cName
}

function getSectionLabel(sectionKey: string): string {
  const sec = activeTask.value?.sections.find(s => s.key === sectionKey)
  return sec ? sec.label : sectionKey
}

// Get Unstuck helper
const activeUnstuckMenu = ref<string | null>(null)
function isLineEmpty(sectionKey: string): boolean {
  const text = editorContent.value[sectionKey] || ''
  return text.trim() === ''
}

function toggleUnstuckMenu(sectionKey: string) {
  if (activeUnstuckMenu.value === sectionKey) {
    activeUnstuckMenu.value = null
  } else {
    activeUnstuckMenu.value = sectionKey
  }
}

function insertSentenceStarter(sectionKey: string, starter: string) {
  const currentText = editorContent.value[sectionKey] || ''
  // Append starter and space
  editorContent.value[sectionKey] = currentText + (currentText.length > 0 && !currentText.endsWith(' ') ? ' ' : '') + starter + ' '
  activeUnstuckMenu.value = null
  saveEssayState()
  uiStore.showToast('Satzanfang eingefügt!', 'success')
}

// Highlight section animation triggered by clicking Socratic Cards
function highlightEditorSection(sectionKey: string) {
  activeHighlightSection.value = sectionKey
  // Scroll to section element
  nextTick(() => {
    const el = document.querySelector(`.section-editor-block.highlighted`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// Socratic Cards logic
const activeCoachingCards = ref<Array<{ section: string; type: string; question: string; hint: string }>>([])
function toggleCardHint(idx: number) {
  expandedHints.value[idx] = !expandedHints.value[idx]
}

// Cooldown logic
const cooldownTimes = [300, 420, 600, 600, 600] // 5m, 7m, 10m, 10m, 10m in seconds
function startCooldownTimer() {
  if (cooldownInterval.value) clearInterval(cooldownInterval.value)
  
  cooldownInterval.value = setInterval(() => {
    if (cooldownRemaining.value > 0) {
      cooldownRemaining.value--
      saveEssayState()
    } else {
      clearInterval(cooldownInterval.value)
      cooldownInterval.value = null
      uiStore.showToast('Schreibanalyse wieder bereit! 🔍', 'info')
    }
  }, 1000)
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

// RUN ANALYSIS METHOD
function runDraftAnalysis() {
  if (remainingChecks.value <= 0) {
    uiStore.showToast('Du hast deine 5 Checks für diesen Entwurf aufgebraucht.', 'error')
    return
  }
  
  if (cooldownRemaining.value > 0 && !devBypassCooldown.value) {
    uiStore.showToast('Bitte überarbeite deinen Text zuerst. Die Abklingzeit läuft noch.', 'warning')
    return
  }

  isAnalyzing.value = true
  analyzed.value = false
  activeHighlightSection.value = null
  expandedHints.value = {}
  
  // Trigger 1.5s loader skeleton
  setTimeout(() => {
    isAnalyzing.value = false
    analyzed.value = true
    
    // Decrement check count
    remainingChecks.value--
    
    // Set Cooldown based on check index (5 checks total, index = 5 - remainingChecks - 1)
    const checkIndex = 5 - remainingChecks.value - 1
    const cooldownSec = cooldownTimes[Math.min(checkIndex, cooldownTimes.length - 1)]
    cooldownRemaining.value = cooldownSec
    if (!devBypassCooldown.value) {
      startCooldownTimer()
    }

    // Dynamic Socratic card logic based on content
    generateSocraticFeedback()
    saveEssayState()
    
    uiStore.showToast('Entwurf analysiert! Sieh dir das Feedback an.', 'success')
  }, 1500)
}

function generateSocraticFeedback() {
  if (!activeTask.value) return
  
  // Clear old cards
  activeCoachingCards.value = []
  
  // 1. Evaluate Structure score
  let emptySections = 0
  let shortSections = 0
  activeTask.value.sections.forEach(s => {
    const status = getNodeStatus(s.key)
    if (status === 'empty') emptySections++
    else if (status === 'insufficient') shortSections++
  })

  let structScore = 100
  if (emptySections > 0) structScore -= emptySections * 30
  if (shortSections > 0) structScore -= shortSections * 15
  criteriaScores.value.structure = Math.max(10, structScore)

  // 2. Evaluate Content score
  const totalW = totalWordCount.value
  const targetW = activeTask.value.sections.reduce((sum, s) => sum + s.minWords, 0)
  let contentScore = Math.min(100, Math.round((totalW / targetW) * 100))
  criteriaScores.value.content = Math.max(10, contentScore)

  // 3. Evaluate Style score
  // Check vocabulary variety (mock: if they typed more, they get slightly better styles, or randomize)
  let styleScore = 55 + Math.min(45, Math.floor(totalW / 4))
  criteriaScores.value.style = Math.max(10, styleScore)

  // Determine spelling error count (Mocked based on misspelled words in text or forced for teaching purposes)
  let errors = 0
  const wrongWords = activeTask.value.commonSpellingErrors.wrong
  
  // Look for actual spelling mistakes in editor
  const fullText = Object.values(editorContent.value).join(' ').toLowerCase()
  wrongWords.forEach(w => {
    if (fullText.includes(w.toLowerCase())) {
      errors++
    }
  })
  
  // If no error is naturally found, but user has written text, inject 2 to 3 forced spelling errors so they learn!
  if (errors === 0 && totalW > 10) {
    errors = Math.min(4, Math.floor(totalW / 25) + 1)
  }
  spellingErrorCount.value = errors

  // Load appropriate Socratic prompts based on Draft Stage
  const basePrompts = draftStage.value === 1 ? activeTask.value.draft1Socratic : activeTask.value.draft2Socratic
  
  // Map base prompts to active coaching cards
  basePrompts.forEach(p => {
    // If the section is short or empty, or we want to trigger it
    const status = getNodeStatus(p.section)
    if (status !== 'complete' || Math.random() > 0.3) {
      activeCoachingCards.value.push({
        section: p.section,
        type: p.section === 'body' ? 'content' : 'structure',
        question: p.question,
        hint: p.hint
      })
    }
  })
  
  // Add a general Style socratic card if style score < 85
  if (criteriaScores.value.style < 85) {
    activeCoachingCards.value.push({
      section: 'body',
      type: 'style',
      question: filters.value.subject === 'de' 
        ? 'Kannst du durch andere Satzübergänge mehr Schwung in deinen Hauptteil bringen?'
        : 'Can you use transitional words (like "However", "In addition") to connect your sentences better?',
      hint: filters.value.subject === 'de'
        ? 'Sätze, die nacheinander folgen, können mit "Obwohl", "Des Weiteren" oder "Im Gegensatz dazu" verknüpft werden.'
        : 'Instead of starting every sentence with "He" or "Then", use linking terms to guide the reader.'
    })
  }
}

// PRE-SUBMISSION SPELLING QUIZ WORKFLOW
function triggerSpellingQuiz() {
  if (!activeTask.value) return
  
  // Check if text is completely empty
  if (isEssayEmpty.value) {
    uiStore.showToast('Schreibe zuerst etwas, bevor du abgibst!', 'error')
    return
  }

  // Check section word counts and alert if they submit empty/short sections
  let hasIncomplete = false
  activeTask.value.sections.forEach(s => {
    if (getNodeStatus(s.key) !== 'complete') {
      hasIncomplete = true
    }
  })

  if (hasIncomplete) {
    const confirmText = filters.value.subject === 'de' 
      ? 'Einige Abschnitte sind noch zu kurz oder leer. Möchtest du trotzdem einreichen?' 
      : 'Some sections are still too short or empty. Do you want to submit anyway?'
    if (!confirm(confirmText)) {
      return
    }
  }

  // Prepare spelling words for the quiz based on the task database
  const taskErrors = activeTask.value.commonSpellingErrors
  quizWords.value = []
  
  // Load words to quiz
  const countToQuiz = Math.min(taskErrors.wrong.length, 4)
  for (let i = 0; i < countToQuiz; i++) {
    quizWords.value.push({
      wrong: taskErrors.wrong[i],
      correct: taskErrors.correct[i],
      userTyped: '',
      isCorrect: false
    })
  }

  // Open Spelling Quiz Overlay
  spellingQuizModalOpen.value = true
  spellingQuizPhase.value = 'study'
  studyTimer.value = 30
  
  // Start study timer
  if (studyInterval.value) clearInterval(studyInterval.value)
  studyInterval.value = setInterval(() => {
    if (studyTimer.value > 0) {
      studyTimer.value--
    } else {
      startQuizPhase()
    }
  }, 1000)
}

function startQuizPhase() {
  if (studyInterval.value) clearInterval(studyInterval.value)
  spellingQuizPhase.value = 'quiz'
  
  // Focus the first input after rendering
  nextTick(() => {
    if (quizInputs.value[0]) {
      quizInputs.value[0].focus()
    }
  })
}

function focusNextQuizInput(index: number) {
  if (quizInputs.value[index + 1]) {
    quizInputs.value[index + 1].focus()
  } else {
    checkQuizAnswers()
  }
}

const quizCorrectCount = ref(0)

function checkQuizAnswers() {
  let correctCount = 0
  quizWords.value.forEach(w => {
    const cleanUser = (w.userTyped || '').trim().toLowerCase()
    const cleanCorrect = w.correct.toLowerCase()
    
    // Exact or case-insensitive correct check
    if (cleanUser === cleanCorrect) {
      w.isCorrect = true
      correctCount++
    } else {
      w.isCorrect = false
    }
  })

  quizCorrectCount.value = correctCount
  spellingQuizPhase.value = 'result'
}

function finalizeSubmission() {
  spellingQuizModalOpen.value = false
  
  if (draftStage.value === 1) {
    // Submit Draft 1 and move to Draft 2
    submittedDraft1Content.value = { ...editorContent.value }
    draftStage.value = 2
    analyzed.value = false
    remainingChecks.value = 5 // reset check counts for draft 2
    cooldownRemaining.value = 0
    if (cooldownInterval.value) {
      clearInterval(cooldownInterval.value)
      cooldownInterval.value = null
    }

    // Clone content into Draft 2 for further edits
    submittedDraft2Content.value = { ...editorContent.value }
    saveEssayState()
    uiStore.showToast('Draft 1 eingereicht! Du arbeitest jetzt an Draft 2.', 'success')
  } else {
    // Submit Draft 2 (Final)
    submittedDraft2Content.value = { ...editorContent.value }
    
    // Calculate final metrics for the report
    calculateReportStats()
    state.value = 'report'
    
    // Remove temporary state
    localStorage.removeItem(`learnflow_wc_essay_${activeTask.value?.id}`)
    uiStore.showToast('Aufsatz erfolgreich abgeschlossen! 🏆', 'success')
  }
}

function calculateReportStats() {
  // Quality increase mock (e.g. Draft 1 was 60%, Draft 2 goes to 95%)
  const d1Score = 55 + Math.floor(Math.random() * 15)
  const d2Score = 85 + Math.floor(Math.random() * 15)
  progressReport.value.qualityIncrease = d2Score - d1Score

  // Vocabulary increase
  progressReport.value.vocabIncrease = 12 + Math.floor(Math.random() * 20)

  // Spelling resolved
  progressReport.value.spellingResolved = spellingErrorCount.value || 3
}

// Navigation flows
function confirmExit() {
  if (isEssayEmpty.value) {
    backToSelection()
    return
  }

  const confirmText = filters.value.subject === 'de'
    ? 'Möchtest du die Arbeit an diesem Aufsatz unterbrechen? Dein Fortschritt wird gespeichert.'
    : 'Do you want to pause your writing? Your progress will be saved.'
  if (confirm(confirmText)) {
    saveEssayState()
    backToSelection()
  }
}

function backToSelection() {
  state.value = 'selection'
  activeTask.value = null
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
    cooldownInterval.value = null
  }
}

onMounted(() => {
  // Clear any existing intervals
  if (cooldownInterval.value) clearInterval(cooldownInterval.value)
})

onUnmounted(() => {
  if (cooldownInterval.value) clearInterval(cooldownInterval.value)
  if (studyInterval.value) clearInterval(studyInterval.value)
})
</script>

<style scoped>
.writing-coach-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 1rem;
  min-height: calc(100vh - 56px);
  background-color: var(--bg-main);
}

/* Header styling */
.wc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background-color: var(--bg-card);
}
.wc-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.wc-header-logo {
  font-size: 2.2rem;
}
.wc-title {
  font-size: 1.4rem;
  font-weight: 800;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.wc-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}
.wc-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dev-bypass-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: var(--warning-light);
  border: 1px dashed var(--warning);
  color: var(--text-secondary);
  cursor: pointer;
}
.dev-bypass-toggle input {
  margin: 0;
  cursor: pointer;
}

/* Selection Mode */
.selection-dashboard {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  align-items: start;
}
.selection-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}
.section-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin-bottom: 0.25rem;
}
.subject-toggle-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.subject-btn {
  background: var(--bg-hover);
  border: 1.5px solid var(--border-color);
  font-size: 0.85rem;
  padding: 0.45rem;
  border-radius: var(--radius-sm);
  text-align: center;
  justify-content: center;
  cursor: pointer;
}
.subject-btn.active {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary-dark);
  font-weight: 600;
}

.info-box {
  background: var(--info-light);
  border-left: 3px solid var(--info);
  padding: 0.75rem;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
}
.info-box h5 {
  margin-top: 0;
  margin-bottom: 0.25rem;
  color: var(--info);
  font-weight: 700;
}
.info-box p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.4;
}

.tasks-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}
.tasks-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}
.task-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 220px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  cursor: pointer;
}
.task-card h4 {
  font-size: var(--font-size-base);
  font-weight: 700;
  margin: 0.5rem 0 0.25rem;
  color: var(--text-main);
}
.task-card p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.task-type-badge {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-light);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
}
.task-type-badge.custom {
  color: var(--accent);
  background: var(--accent-light);
}
.grade-badge {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-weight: 600;
}
.task-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}
.task-meta {
  display: flex;
  flex-direction: column;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

/* Custom Task Creator */
.custom-task-creator {
  border: 1px dashed var(--border-color);
}
.custom-task-creator:hover {
  border-color: var(--primary);
}
.custom-fields {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.custom-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* 2. WORKSPACE LAYOUT */
.workspace-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  align-items: start;
}
.workspace-editor-panel {
  background: var(--bg-card);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.editor-title-area {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.subject-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 800;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  color: #fff;
}
.subject-indicator.de {
  background: var(--primary);
}
.subject-indicator.en {
  background: #f59e0b;
}
.task-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: 0.15rem;
}
.draft-badge-container {
  flex-shrink: 0;
}
.draft-badge {
  font-size: var(--font-size-xs);
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
}
.draft-badge.draft-1 {
  background: var(--primary-light);
  color: var(--primary);
}
.draft-badge.draft-2 {
  background: var(--success-light);
  color: var(--success);
}

/* Criteria Progress Bars */
.criteria-progress-bars {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-hover);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
.criteria-label-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  font-weight: 600;
  margin-bottom: 0.35rem;
}
.criteria-name {
  color: var(--text-secondary);
}
.criteria-value {
  color: var(--text-main);
}
.progress-track-bg {
  height: 8px;
  background: var(--border-color);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress-track-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.progress-track-fill.structure {
  background: var(--primary); /* Indigo */
}
.progress-track-fill.content {
  background: var(--accent); /* Amber */
}
.progress-track-fill.style {
  background: #8b5cf6; /* Violet */
}
.pulse-green {
  background: var(--success) !important;
  animation: pulse-ring 1.5s infinite;
}
@keyframes pulse-ring {
  0% { opacity: 0.9; }
  50% { opacity: 1; box-shadow: 0 0 8px var(--success); }
  100% { opacity: 0.9; }
}

.spelling-warning-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  font-weight: 500;
}
.spelling-count-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
}
.spelling-count-badge.warning {
  background: var(--warning-light);
  color: #b45309;
}
.spelling-count-badge.success {
  background: var(--success-light);
  color: var(--success);
}
.word-count-badge {
  color: var(--text-secondary);
}

/* Scaffolding Sections */
.editor-scaffolds-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.section-editor-block {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  transition: all var(--transition);
  overflow: hidden;
}
.section-editor-block.highlighted {
  border-color: var(--primary-soft);
  box-shadow: 0 0 0 3px var(--primary-light);
}
.section-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-color);
}
.section-label-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.section-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--text-muted);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
}
.section-label {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--text-main);
}
.section-min-words {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}
.section-words {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-secondary);
}

.editor-textarea-wrapper {
  position: relative;
  padding: 0.5rem;
}
.essay-serif-editor {
  width: 100%;
  border: none;
  background: transparent;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--text-main);
  padding: 0.5rem;
  outline: none;
  resize: vertical;
  min-height: 110px;
}
.essay-serif-editor:disabled {
  opacity: 0.65;
  background: var(--bg-hover);
  cursor: not-allowed;
}

/* Inline Get Unstuck Trigger */
.get-unstuck-container {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 10;
}
.get-unstuck-trigger {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--primary-soft);
  border-radius: var(--radius-xs);
  color: var(--primary-dark);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(4px);
}
.get-unstuck-trigger:hover {
  background: var(--primary-light);
  transform: translateY(-1px);
}
.unstuck-dropdown {
  position: absolute;
  bottom: 30px;
  right: 0;
  width: 260px;
  background: var(--bg-card);
  border: 1px solid var(--primary-soft);
  border-radius: var(--radius-sm);
  padding: 0.5rem;
  box-shadow: var(--shadow-md);
  z-index: 100;
}
.dropdown-title {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-bottom: 0.35rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--border-color);
}
.starters-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 150px;
  overflow-y: auto;
}
.starters-list li {
  font-size: 0.8rem;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
}
.starters-list li:hover {
  background: var(--primary-light);
  color: var(--primary-dark);
}

/* Comparison Snap */
.draft1-comparison-panel {
  border-color: var(--border-color);
}
.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  background: var(--bg-hover);
  font-size: var(--font-size-sm);
  font-weight: 600;
}
.comparison-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-top: 1px solid var(--border-color);
}
.snap-section h5 {
  font-size: var(--font-size-xs);
  margin-bottom: 0.15rem;
  color: var(--text-muted);
}
.snap-text {
  font-family: 'Georgia', serif;
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
  background: var(--bg-hover);
  padding: 0.5rem;
  border-radius: var(--radius-xs);
}

.workspace-editor-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
.submit-draft-btn {
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

/* RIGHT SIDE: Structural Coach */
.workspace-coach-panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  max-height: calc(100vh - 120px);
  position: sticky;
  top: 72px;
  overflow: hidden;
}
.tab-pills {
  margin: 0.75rem;
}
.coach-tab-content {
  padding: 0.75rem;
  background: var(--bg-hover);
}

/* Coaching Cards */
.coach-cards-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.25rem;
}
.coaching-card {
  border-left: 4px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.coaching-card.structure {
  border-left-color: var(--primary);
}
.coaching-card.content {
  border-left-color: var(--accent);
}
.coaching-card.style {
  border-left-color: #8b5cf6;
}
.coaching-card:hover {
  transform: translateX(3px);
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}
.coaching-card.active-highlight {
  background: var(--primary-light);
  border-color: var(--primary);
}
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}
.card-badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
}
.card-section-link {
  font-size: var(--font-size-xs);
  color: var(--primary);
  font-weight: 600;
}
.card-question {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.4;
}

.hint-expandable {
  margin-top: 0.5rem;
  border-top: 1px solid var(--border-color);
  padding-top: 0.35rem;
}
.hint-toggle-btn {
  background: transparent;
  border: none;
  font-size: 0.75rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
}
.hint-toggle-btn:hover {
  color: var(--primary);
}
.hint-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: var(--bg-hover);
  padding: 0.45rem;
  border-radius: var(--radius-xs);
  margin-top: 0.25rem;
  line-height: 1.45;
}

/* Skeleton Loading styles */
.skeleton-loader-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.skeleton-card {
  padding: 1rem;
  height: 100px;
}
.skeleton.line {
  height: 12px;
  margin-bottom: 0.5rem;
}
.skeleton.line.header {
  width: 40%;
  height: 16px;
}
.skeleton.line.paragraph {
  width: 90%;
}
.skeleton.line.paragraph-short {
  width: 60%;
}

.analyze-callout {
  text-align: center;
  padding: 2rem 1.5rem;
  color: var(--text-muted);
}
.analyze-callout h4 {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

/* Visual Outline Tree */
.visual-outline-container {
  padding: 1rem 0.5rem;
}
.outline-title {
  font-size: var(--font-size-base);
  font-weight: 700;
  margin-bottom: 0.25rem;
}
.outline-desc {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 1.5rem;
}
.vertical-nodes-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-left: 1rem;
}
.outline-node {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 2;
}
.node-bullet {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}
.node-content {
  display: flex;
  flex-direction: column;
}
.node-label {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}
.node-meta {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin: 0;
}
.status-warning {
  color: var(--warning);
  font-weight: 600;
}

/* Node statuses colors */
.outline-node.empty .node-bullet {
  background: var(--bg-hover);
  color: var(--text-muted);
}
.outline-node.insufficient .node-bullet {
  border-color: var(--warning);
  background: var(--warning-light);
  color: var(--warning);
}
.outline-node.complete .node-bullet {
  border-color: var(--success);
  background: var(--success);
  color: #fff;
  font-size: 0.95rem;
}

.node-connector {
  position: absolute;
  top: 26px;
  left: 12px;
  width: 2px;
  height: 2.2rem;
  background-color: var(--border-color);
  z-index: 1;
}
.outline-node.complete + .outline-node .node-connector {
  background-color: var(--success);
}

/* Coach bottom limits box */
.coach-bottom-actions {
  margin: 0.75rem;
  padding: 1rem;
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-color: var(--border-color);
}
.checks-counter-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  font-weight: 600;
}
.checks-label {
  color: var(--text-secondary);
}
.checks-value {
  color: var(--primary-dark);
}
.checks-value.critical {
  color: var(--danger);
  animation: pulse-error 1s infinite;
}
@keyframes pulse-error {
  50% { opacity: 0.5; }
}

.cooldown-active-banner {
  background: var(--warning-light);
  border: 1px solid var(--warning);
  border-radius: var(--radius-sm);
  padding: 0.5rem;
  font-size: var(--font-size-xs);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #92400e;
}
.analyze-draft-btn {
  width: 100%;
  justify-content: center;
  font-weight: 700;
}

/* 3. PRE-SUBMISSION SPELLING QUIZ OVERLAY */
.spelling-quiz-modal {
  max-width: 580px !important;
  width: calc(100% - 2rem);
  padding: 2rem !important;
}
.quiz-instruction-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}
.study-table-wrap {
  margin-bottom: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  overflow: hidden;
}
.word-wrong {
  color: var(--danger);
  text-decoration: line-through;
  font-weight: 600;
  font-size: 1.05rem;
}
.word-correct {
  color: var(--success);
  font-weight: 700;
  font-size: 1.1rem;
}

.study-countdown-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.countdown-bar-bg {
  width: 100%;
  height: 6px;
  background: var(--border-color);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.countdown-bar-fill {
  height: 100%;
  background: var(--warning);
  border-radius: var(--radius-full);
  transition: width 1s linear;
}
.countdown-text {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.quiz-questions-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}
.quiz-question-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.quiz-prompt-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}
.quiz-input {
  border-width: 2px;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 0.6rem 0.8rem;
}
.quiz-input:focus {
  border-color: var(--primary);
}

.results-summary {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: var(--bg-hover);
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
}
.score-radial {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  flex-shrink: 0;
}
.score-number {
  font-size: var(--font-size-lg);
  font-weight: 800;
}
.score-label {
  font-size: 0.65rem;
  text-transform: uppercase;
}
.result-message {
  font-size: var(--font-size-sm);
  font-weight: 500;
  line-height: 1.4;
}
.result-message.success {
  color: var(--success);
}
.result-message.partial {
  color: var(--text-secondary);
}

.result-details-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.result-detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
}
.result-icon {
  font-size: 1.2rem;
}
.result-detail-content {
  display: flex;
  justify-content: space-between;
  flex: 1;
  font-size: var(--font-size-sm);
}
.user-typed {
  font-weight: 600;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
}
.user-typed.correct {
  background: var(--success-light);
  color: var(--success);
}
.user-typed.wrong {
  background: var(--danger-light);
  color: var(--danger);
  text-decoration: line-through;
}
.correct-text {
  color: var(--success);
}

/* 4. REPORT VIEW */
.report-view {
  background: var(--bg-card);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.report-header {
  text-align: center;
}
.report-header h2 {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  margin: 0.5rem 0 0.25rem;
}
.report-header p {
  color: var(--text-secondary);
}

.report-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.stat-card {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.25rem;
}
.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: 600;
}
.stat-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--primary-dark);
  margin: 0.25rem 0;
}
.stat-sub {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.comparison-side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.comparison-column h4 {
  font-size: var(--font-size-base);
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}
.comparison-text-box {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  height: 350px;
  overflow-y: auto;
}
.comparison-text-box.final {
  border-color: var(--success-light);
  background-color: #f0fdf4;
}
[data-theme='dark'] .comparison-text-box.final {
  background-color: #062f17;
}

.serif-report-text {
  font-family: 'Georgia', serif;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-main);
  margin-top: 0.25rem;
  white-space: pre-wrap;
}

.formative-text-feedback {
  background: var(--bg-hover);
  border-color: var(--border-color);
}
.formative-text-feedback h3 {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin-bottom: 1rem;
}
.feedback-points {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.feedback-point {
  padding: 1rem;
  border-radius: var(--radius-md);
  line-height: 1.5;
}
.feedback-point.positive {
  background: var(--success-light);
  border-left: 4px solid var(--success);
}
.feedback-point.constructive {
  background: var(--info-light);
  border-left: 4px solid var(--info);
}
.feedback-point strong {
  display: block;
  font-size: var(--font-size-sm);
  margin-bottom: 0.25rem;
}
.feedback-point p {
  font-size: var(--font-size-sm);
  margin: 0;
}

.report-footer-actions {
  display: flex;
  justify-content: center;
}

/* Animations */
.fade-in {
  animation: fadeIn 0.4s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .selection-dashboard {
    grid-template-columns: 1fr;
  }
  .workspace-layout {
    grid-template-columns: 1fr;
  }
  .workspace-coach-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 50vh;
    z-index: 1000;
    box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.15);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    transform: translateY(0);
    transition: transform 0.3s ease;
  }
}
</style>
