<template>
  <div class="page-wide grammar-academy-container">
    <!-- Header Banner -->
    <div class="ga-header glass-strong">
      <div class="ga-header-left">
        <span class="ga-header-logo">🏆</span>
        <div>
          <h2 class="ga-title">LearnFlow Grammar Academy</h2>
          <p class="ga-subtitle">
            Meistere die 15 Kernbereiche der Grammatik (Klasse 1 / Schulstufe 5)
          </p>
        </div>
      </div>
      <div class="ga-header-right flex items-center gap-4">
        <div class="badge-counter card py-1.5 px-3 flex items-center gap-2">
          <span>🎖️ Gesammelte Abzeichen:</span>
          <strong class="text-primary">{{ badgesCount }}</strong>
        </div>
        <button v-if="activeTopic" @click="activeTopic = null" class="btn-secondary">
          Zurück zur Übersicht
        </button>
      </div>
    </div>

    <!-- 1. TOPICS OVERVIEW -->
    <div v-if="!activeTopic" class="topics-grid fade-in">
      <div 
        v-for="topic in topics" 
        :key="topic.id" 
        class="topic-card card card-lift"
        @click="selectTopic(topic)"
      >
        <div class="topic-card-header">
          <span class="unit-badge">Unit {{ topic.unit }}</span>
          <span v-if="topic.progress.quizGrade" class="grade-badge" :class="topic.progress.quizGrade">
            Note: {{ topic.progress.quizGrade }}
          </span>
          <span v-else class="status-badge-incomplete">In Bearbeitung</span>
        </div>
        <h4>{{ topic.title }}</h4>
        <p>{{ topic.description }}</p>
        
        <!-- Badges Locker Preview -->
        <div class="badges-row mt-4">
          <span 
            class="badge-icon 🧭" 
            :class="{ 'earned': topic.badges.explorer }" 
            title="Explorer Badge"
          >🧭</span>
          <span 
            class="badge-icon 🔍" 
            :class="{ 'earned': topic.badges.pioneer }" 
            title="Pioneer Badge"
          >🔍</span>
          <span 
            class="badge-icon 🏆" 
            :class="{ 'earned': topic.badges.master }" 
            title="Master Badge"
          >🏆</span>
        </div>
      </div>
    </div>

    <!-- 2. TOPIC PATHWAY VIEW -->
    <div v-else class="topic-roadmap-layout fade-in">
      <!-- Left sidebar: Progress Tracker & Reset Lock -->
      <div class="roadmap-sidebar card flex flex-col gap-4">
        <span class="unit-badge self-start">Unit {{ activeTopic.unit }}</span>
        <h3>{{ activeTopic.title }}</h3>
        <p class="text-sm text-secondary">{{ activeTopic.description }}</p>
        
        <div class="divider"></div>
        
        <!-- Badges locker status -->
        <h5>🎖️ Dein Abzeichen-Schrank:</h5>
        <div class="badges-row large">
          <div class="badge-item flex flex-col items-center gap-1">
            <span class="badge-icon large 🧭" :class="{ 'earned': activeTopic.badges.explorer }">🧭</span>
            <span class="badge-lbl">Explorer</span>
          </div>
          <div class="badge-item flex flex-col items-center gap-1">
            <span class="badge-icon large 🔍" :class="{ 'earned': activeTopic.badges.pioneer }">🔍</span>
            <span class="badge-lbl">Pioneer</span>
          </div>
          <div class="badge-item flex flex-col items-center gap-1">
            <span class="badge-icon large 🏆" :class="{ 'earned': activeTopic.badges.master }">🏆</span>
            <span class="badge-lbl">Master</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Grade Display -->
        <div class="grade-report-card text-center py-4 px-2 card" v-if="activeTopic.progress.quizGrade">
          <span class="text-xs text-muted block mb-1">Deine Abschlussnote</span>
          <div class="grade-symbol" :class="activeTopic.progress.quizGrade">
            {{ activeTopic.progress.quizGrade }}
          </div>
          <p class="text-xs text-secondary mt-2">
            Möchtest du deine Note verbessern? Nutze den Redo-Button, um das Thema zurückzusetzen.
          </p>
          <button @click="confirmReset" class="btn-danger btn-sm mt-3 w-full justify-center">
            🔄 Thema zurücksetzen
          </button>
        </div>
        <div class="info-box-roadmap text-xs text-secondary" v-else>
          <p>Schließe alle 3 Quests ab, um das **AI Finisher Quiz** freizuschalten.</p>
        </div>
      </div>

      <!-- Right Panel: Step-by-Step Roadmap Pathway -->
      <div class="roadmap-path-panel flex flex-col gap-6">
        <!-- Level 1: Explorer Quest -->
        <div 
          class="roadmap-step card flex items-center justify-between"
          :class="{ 
            'completed': activeTopic.progress.explorer,
            'playable': !activeTopic.progress.explorer
          }"
        >
          <div class="step-left flex items-start gap-4">
            <span class="step-num 🧭">🧭</span>
            <div>
              <h4>Level 1: Explorer Quest (Entdecker-Pfad)</h4>
              <p class="text-sm text-secondary">
                Lerne die grundlegenden Formen und Regeln kennen (Wortart-Erkennung & Multiple-Choice).
              </p>
              <span class="badge-reward text-xs mt-1 block">🏆 Belohnung: Explorer Badge</span>
            </div>
          </div>
          <div class="step-right">
            <button 
              @click="showInstruction('explorer')" 
              class="btn-primary"
              v-if="!activeTopic.progress.explorer"
            >
              Starten 🧭
            </button>
            <span v-else class="completed-label">✅ Gelöst</span>
          </div>
        </div>

        <!-- Level 2: Pioneer Challenge -->
        <div 
          class="roadmap-step card flex items-center justify-between"
          :class="{ 
            'completed': activeTopic.progress.pioneer,
            'playable': activeTopic.progress.explorer && !activeTopic.progress.pioneer,
            'locked': !activeTopic.progress.explorer
          }"
        >
          <div class="step-left flex items-start gap-4">
            <span class="step-num 🔍">🔍</span>
            <div>
              <h4>Level 2: Pioneer Challenge (Pionier-Herausforderung)</h4>
              <p class="text-sm text-secondary">
                Wende die Grammatik in kurzen Sätzen an (Lückentexte & Transformationen).
              </p>
              <span class="badge-reward text-xs mt-1 block">🏆 Belohnung: Pioneer Badge</span>
            </div>
          </div>
          <div class="step-right">
            <button 
              @click="showInstruction('pioneer')" 
              class="btn-primary"
              v-if="activeTopic.progress.explorer && !activeTopic.progress.pioneer"
            >
              Starten 🔍
            </button>
            <span v-else-if="activeTopic.progress.pioneer" class="completed-label">✅ Gelöst</span>
            <span v-else class="locked-label">🔒 Gesperrt</span>
          </div>
        </div>

        <!-- Level 3: Master Arena -->
        <div 
          class="roadmap-step card flex items-center justify-between"
          :class="{ 
            'completed': activeTopic.progress.master,
            'playable': activeTopic.progress.pioneer && !activeTopic.progress.master,
            'locked': !activeTopic.progress.pioneer
          }"
        >
          <div class="step-left flex items-start gap-4">
            <span class="step-num 🏆">🏆</span>
            <div>
              <h4>Level 3: Master Arena (Meister-Arena)</h4>
              <p class="text-sm text-secondary">
                Meistere schwierige Textaufgaben und korrigiere Fehler im Kontext.
              </p>
              <span class="badge-reward text-xs mt-1 block">🏆 Belohnung: Master Badge</span>
            </div>
          </div>
          <div class="step-right">
            <button 
              @click="showInstruction('master')" 
              class="btn-primary"
              v-if="activeTopic.progress.pioneer && !activeTopic.progress.master"
            >
              Starten 🏆
            </button>
            <span v-else-if="activeTopic.progress.master" class="completed-label">✅ Gelöst</span>
            <span v-else class="locked-label">🔒 Gesperrt</span>
          </div>
        </div>

        <!-- Level 4: Custom AI Finisher Quiz -->
        <div 
          class="roadmap-step card quiz-step flex items-center justify-between"
          :class="{ 
            'completed': activeTopic.progress.quizGrade,
            'playable': activeTopic.progress.master && !activeTopic.progress.quizGrade,
            'locked': !activeTopic.progress.master
          }"
        >
          <div class="step-left flex items-start gap-4">
            <span class="step-num 🧠">🧠</span>
            <div>
              <h4>Schritt 4: Custom AI Finisher Quiz</h4>
              <p class="text-sm text-secondary">
                Ein maßgeschneiderter Test, der deine individuellen Fehlerschwerpunkte prüft.
              </p>
              <span class="badge-reward text-xs mt-1 block text-primary" v-if="activeTopic.progress.quizGrade">
                Erreichte Note: <strong>{{ activeTopic.progress.quizGrade }}</strong>
              </span>
            </div>
          </div>
          <div class="step-right">
            <button 
              @click="triggerQuizGeneration" 
              class="btn-success"
              v-if="activeTopic.progress.master && !activeTopic.progress.quizGrade"
            >
              Quiz starten 🧠
            </button>
            <span v-else-if="activeTopic.progress.quizGrade" class="completed-label success">🏆 Note: {{ activeTopic.progress.quizGrade }}</span>
            <span v-else class="locked-label">🔒 Gesperrt</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. INSTRUCTION SCREEN BEFORE WORKSHEET -->
    <div class="modal-overlay" v-if="instructionVisible">
      <div class="modal instruction-modal">
        <div class="modal-header flex items-center gap-3">
          <span class="instruction-emoji text-3xl">
            <span v-if="activeLevel === 'explorer'">🧭</span>
            <span v-else-if="activeLevel === 'pioneer'">🔍</span>
            <span v-else>🏆</span>
          </span>
          <div>
            <h3>
              <span v-if="activeLevel === 'explorer'">🧭 Explorer Quest – Erklärung</span>
              <span v-else-if="activeLevel === 'pioneer'">🔍 Pioneer Challenge – Erklärung</span>
              <span v-else>🏆 Master Arena – Erklärung</span>
            </h3>
            <p class="text-sm text-secondary">{{ activeTopic?.title }}</p>
          </div>
        </div>

        <div class="modal-body flex flex-col gap-4 mt-2">
          <div class="instruction-text card py-4 px-4 text-center">
            <p class="instruction-text-main text-base font-semibold leading-relaxed">
              {{ currentInstruction?.text }}
            </p>
            <div class="instruction-tips mt-3 flex flex-wrap gap-2 justify-center">
              <span class="tip-badge" v-for="tip in (currentInstruction?.tips || [])" :key="tip">{{ tip }}</span>
            </div>
          </div>

          <div class="instruction-diagram card py-4 px-4" v-if="currentInstruction?.mermaid">
            <h4 class="text-sm font-bold text-center mb-3">📊 Grammatik-Übersicht</h4>
            <div class="mermaid-wrapper">
              <pre class="mermaid" ref="mermaidRef">{{ currentInstruction.mermaid }}</pre>
            </div>
          </div>

          <div class="instruction-rules card py-3 px-4" v-if="currentInstruction?.rules?.length">
            <h4 class="text-xs font-bold mb-2">📝 Merk dir:</h4>
            <ul class="rule-list">
              <li v-for="(rule, ri) in currentInstruction.rules" :key="ri" class="text-sm py-1">✅ {{ rule }}</li>
            </ul>
          </div>
        </div>

        <div class="modal-footer flex justify-between gap-4 mt-4">
          <button @click="closeInstruction" class="btn-secondary">Schließen</button>
          <button @click="proceedToWorksheet" class="btn-primary btn-lg flex items-center gap-2">
            Los geht's! 🚀
          </button>
        </div>
      </div>
    </div>

    <!-- 4. WORKSHEET PLAYER OVERLAY MODAL -->
    <div class="modal-overlay" v-if="activeWorksheet">
      <div class="modal worksheet-player-modal">
        <div class="modal-header">
          <h3>
            <span v-if="activeWorksheet.level === 'explorer'">🧭 Explorer Quest</span>
            <span v-else-if="activeWorksheet.level === 'pioneer'">🔍 Pioneer Challenge</span>
            <span v-else>🏆 Master Arena</span>
          </h3>
          <button @click="activeWorksheet = null" class="btn-icon modal-close">&times;</button>
        </div>

        <div class="modal-body flex flex-col gap-4 mt-2">
          <p class="text-sm text-secondary">Beantworte alle {{ activeWorksheet?.questions?.length || 5 }} Fragen korrekt, um das Level zu meistern und dein Abzeichen zu verdienen!</p>
          
          <div class="questions-list-player">
            <!-- Questions Rendering -->
            <div 
              v-for="(q, index) in activeWorksheet.questions" 
              :key="index"
              class="worksheet-question-card card mt-2"
              :class="{
                'correct-border': worksheetEvaluations[index] === true,
                'wrong-border': worksheetEvaluations[index] === false
              }"
            >
              <!-- EXPLORER (MC) -->
              <div v-if="activeWorksheet.level === 'explorer'">
                <p class="question-text-bold"><strong>Frage {{ Number(index) + 1 }}:</strong> {{ q.question }}</p>
                <div class="options-vertical-grid mt-2 flex flex-col gap-2">
                  <button 
                    v-for="(opt, oIdx) in q.options" 
                    :key="oIdx"
                    class="option-btn"
                    :class="{ 
                      'selected': worksheetAnswers[index] === Number(oIdx),
                      'correct-mc': worksheetEvaluations[index] !== null && Number(oIdx) === q.correctIndex,
                      'wrong-mc': worksheetAnswers[index] === Number(oIdx) && worksheetEvaluations[index] === false && Number(oIdx) !== q.correctIndex
                    }"
                    :disabled="worksheetSubmitted"
                    @click="worksheetAnswers[index] = Number(oIdx)"
                  >
                    {{ opt }}
                  </button>
                </div>
              </div>

              <!-- PIONEER (FITB) -->
              <div v-else-if="activeWorksheet.level === 'pioneer'">
                <p class="question-text-bold"><strong>Aufgabe {{ Number(index) + 1 }}:</strong> {{ q.sentence }}</p>
                <div class="fitb-input-row mt-2 flex items-center gap-3">
                  <span>Trage das Wort ein ({{ q.placeholder }}):</span>
                  <input 
                    v-model="worksheetAnswers[index]"
                    placeholder="..." 
                    class="fitb-input" 
                    :disabled="worksheetSubmitted"
                    :class="{
                      'correct-text-input': worksheetEvaluations[index] === true,
                      'wrong-text-input': worksheetEvaluations[index] === false
                    }"
                  />
                </div>
              </div>

              <!-- MASTER (FREE TEXT) -->
              <div v-else>
                <p class="question-text-bold"><strong>Aufgabe {{ Number(index) + 1 }}:</strong> {{ q.question }}</p>
                <div class="master-input-row mt-2 flex flex-col gap-2">
                  <input 
                    v-model="worksheetAnswers[index]"
                    placeholder="Schreibe den gesamten korrigierten/übersetzten Satz hier..." 
                    class="master-input"
                    :disabled="worksheetSubmitted"
                    :class="{
                      'correct-text-input': worksheetEvaluations[index] === true,
                      'wrong-text-input': worksheetEvaluations[index] === false
                    }"
                  />
                </div>
              </div>

              <!-- Explanations -->
              <transition name="fade">
                <div v-if="worksheetSubmitted && q.explanation" class="explanation-box mt-3 text-xs">
                  <span class="badge" :class="worksheetEvaluations[index] ? 'badge-success' : 'badge-danger'">
                    {{ worksheetEvaluations[index] ? 'Richtig' : 'Falsch' }}
                  </span>
                  <p class="mt-1">{{ q.explanation }}</p>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <div class="modal-footer flex justify-between gap-4 mt-4">
          <button @click="activeWorksheet = null" class="btn-secondary">Schließen</button>
          
          <button 
            @click="submitWorksheet" 
            class="btn-primary" 
            v-if="!worksheetSubmitted"
          >
            Antworten prüfen ➔
          </button>
          <button 
            @click="resetWorksheetPlayer" 
            class="btn-warning" 
            v-else-if="!allWorksheetAnswersCorrect"
          >
            Falsche Fragen wiederholen 🔄
          </button>
          <button 
            @click="finishWorksheetPlayer" 
            class="btn-success" 
            v-else
          >
            Abzeichen einsammeln & weiter 🎖️
          </button>
        </div>
      </div>
    </div>

    <!-- 5. CUSTOM AI FINISHER QUIZ OVERLAY -->
    <div class="modal-overlay" v-if="quizActive">
      <div class="modal quiz-player-modal">
        <!-- PHASE 1: GENERATION LOADER -->
        <div v-if="quizPhase === 'loading'" class="quiz-loader flex flex-col items-center justify-center py-10 gap-4">
          <span class="loader-emoji text-5xl">🤖</span>
          <h4>AI Coach generiert deinen Finisher Test...</h4>
          <p class="text-sm text-secondary text-center max-w-sm">
            Wir analysieren deine Fehler aus dem Explorer-, Pioneer- und Master-Level, um maßgeschneiderte Fragen für dich zu erstellen.
          </p>
          <div class="loading-bar-container">
            <div class="loading-bar-fill"></div>
          </div>
        </div>

        <!-- PHASE 2: PLAYING QUIZ -->
        <div v-else-if="quizPhase === 'playing'" class="quiz-play flex flex-col gap-4">
          <div class="modal-header">
            <h3>🧠 Custom AI Finisher Test</h3>
            <span class="badge badge-warning">Frage {{ quizCurrentIdx + 1 }} von {{ quizQuestions.length }}</span>
          </div>
          
          <div class="quiz-question-wrap card mt-2" v-if="quizQuestions[quizCurrentIdx]">
            <p class="text-base font-semibold">{{ quizQuestions[quizCurrentIdx].question }}</p>
            <div class="options-vertical-grid mt-3 flex flex-col gap-2">
              <button 
                v-for="(opt, oIdx) in quizQuestions[quizCurrentIdx].options" 
                :key="oIdx"
                class="option-btn"
                :class="{ 'selected': quizAnswers[quizCurrentIdx] === Number(oIdx) }"
                @click="quizAnswers[quizCurrentIdx] = Number(oIdx)"
              >
                {{ opt }}
              </button>
            </div>
          </div>

          <div class="modal-footer flex justify-between mt-4">
            <button 
              @click="quizCurrentIdx--" 
              class="btn-secondary" 
              :disabled="quizCurrentIdx === 0"
            >
              Zurück
            </button>
            <button 
              @click="quizCurrentIdx++" 
              class="btn-primary" 
              v-if="quizCurrentIdx < quizQuestions.length - 1"
              :disabled="quizAnswers[quizCurrentIdx] === undefined"
            >
              Nächste Frage
            </button>
            <button 
              @click="submitQuiz" 
              class="btn-success" 
              v-else
              :disabled="quizAnswers[quizCurrentIdx] === undefined"
            >
              Test abgeben ➔
            </button>
          </div>
        </div>

        <!-- PHASE 3: RESULTS CARD -->
        <div v-else-if="quizPhase === 'result'" class="quiz-result flex flex-col items-center gap-4 text-center py-6">
          <span class="text-5xl">🏆</span>
          <h3>Finisher Quiz abgeschlossen!</h3>
          <p class="text-sm text-secondary max-w-sm">
            Deine Antworten wurden ausgewertet. Hier ist deine Note für dieses Grammatikthema:
          </p>
          
          <div class="grade-symbol large" :class="quizResultData.grade">
            {{ quizResultData.grade }}
          </div>
          
          <p class="points-label mt-2">
            Punkte: <strong>{{ quizResultData.score }}</strong> von {{ quizQuestions.length }} richtig ({{ Math.round((quizResultData.score / quizQuestions.length) * 100) }}%)
          </p>

          <div class="divider w-full mt-4"></div>

          <div class="result-actions flex flex-col gap-2 w-full max-w-xs mt-2">
            <button @click="closeQuiz" class="btn-primary w-full justify-center">
              Zurück zur Roadmap ➔
            </button>
            <button @click="confirmReset" class="btn-secondary btn-sm w-full justify-center text-danger">
              🔄 Test wiederholen (Löscht allen Fortschritt)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '../stores/ui'
import mermaid from 'mermaid'

mermaid.initialize({ startOnLoad: false, theme: 'neutral', themeVariables: { fontFamily: 'system-ui' } })

const uiStore = useUiStore()
const route = useRoute()
const router = useRouter()

// State variables
const topics = ref<any[]>([])
const badgesCount = ref(0)
const activeTopic = ref<any | null>(null)

// Instruction Screen State
const instructionVisible = ref(false)
const activeLevel = ref<string | null>(null)
const currentInstruction = ref<any>(null)
const mermaidRef = ref<any>(null)

// Worksheet Player State
const activeWorksheet = ref<any | null>(null)
const worksheetAnswers = ref<Record<number, any>>({})
const worksheetEvaluations = ref<Record<number, boolean | null>>({})
const worksheetSubmitted = ref(false)

// Finisher Quiz State
const quizActive = ref(false)
const quizPhase = ref<'loading' | 'playing' | 'result'>('loading')
const quizQuestions = ref<any[]>([])
const quizAnswers = ref<Record<number, number>>({})
const quizCurrentIdx = ref(0)
const quizResultData = ref<any>({ score: 0, grade: 'F' })

// Fetch topics and user completions
async function fetchTopics() {
  try {
    const res = await fetch('/api/grammar/topics')
    if (res.ok) {
      const data = await res.json()
      topics.value = data.topics
      badgesCount.value = data.badgesCount
      
      // Update activeTopic reference if currently editing one
      if (activeTopic.value) {
        const found = data.topics.find((t: any) => t.id === activeTopic.value.id)
        if (found) activeTopic.value = found
      }
    }
  } catch (e) {
    console.error('Failed to fetch grammar topics', e)
  }
}

onMounted(() => {
  fetchTopics().then(() => {
    // Check if we are in worksheet mode from route params
    const topicId = route.params.topicId as string
    const level = route.params.level as string
    if (topicId && level && ['explorer', 'pioneer', 'master'].includes(level)) {
      const found = topics.value.find((t: any) => t.id === topicId)
      if (found) {
        activeTopic.value = found
        // Show instruction and start
        showInstruction(level as 'explorer' | 'pioneer' | 'master')
      }
    }
  })
})

// Watch for route changes to detect worksheet mode
watch(() => route.params, (params) => {
  const topicId = params.topicId as string
  const level = params.level as string
  if (topicId && level && topics.value.length > 0) {
    const found = topics.value.find((t: any) => t.id === topicId)
    if (found && !activeWorksheet.value && !instructionVisible.value) {
      activeTopic.value = found
      startWorksheet(level as 'explorer' | 'pioneer' | 'master')
    }
  }
})

function selectTopic(topic: any) {
  activeTopic.value = topic
}

// ─── Instruction Screen ──────────────────────────────────────────────────
function showInstruction(level: 'explorer' | 'pioneer' | 'master') {
  if (!activeTopic.value) return
  activeLevel.value = level
  currentInstruction.value = getTopicInstruction(activeTopic.value, level)
  instructionVisible.value = true
  nextTick(() => {
    try {
      mermaid.run({ nodes: [document.querySelector('.mermaid')!] })
    } catch (_e) { /* Mermaid render fallback */ }
  })
}

function closeInstruction() {
  instructionVisible.value = false
  activeLevel.value = null
  // Go back to main grammar academy view
  if (route.params.topicId) {
    router.push('/grammar-academy')
  }
}

async function proceedToWorksheet() {
  instructionVisible.value = false
  if (activeTopic.value && activeLevel.value) {
    router.push(`/grammar-academy/${activeTopic.value.id}/${activeLevel.value}`)
  } else {
    await startWorksheet((activeLevel.value || 'explorer') as 'explorer' | 'pioneer' | 'master')
  }
}

function getTopicInstruction(topic: any, level: string) {
  const t = topic.title || 'Grammar'
  const d = topic.description || ''
  const u = topic.unit || 1

  // Emoji-rich explanations for each topic unit + level
  const instructions: Record<string, any> = {
    '1-explorer': {
      text: '🧩 **Pluralformen & Befehle** – Lerne, wie du aus 1 Gegenstand viele machst! 🎯 Bei regelmäßigen Nomen hängst du einfach **-s** an: book → books. Aber Achtung: Es gibt auch **Ausnahmen** wie child → children! Bei Befehlen (Imperativen) sagst du einfach das Verb: **"Open the door!"** Für Verbote nutzt du **"Don\'t"**.',
      tips: ['📌 Regular plural: noun + -s', '⚠️ Irregulars: child→children, foot→feet', '📌 Imperative: base verb', '⚠️ Negative: Don\'t + verb'],
      mermaid: `graph TD
    A[Start with a noun] --> B{Regular or irregular?}
    B -->|Regular| C[Add -s or -es]
    B -->|Irregular| D[Change the word]
    C --> E[book→books, box→boxes]
    D --> F[child→children, foot→feet]
    A --> G[For commands]
    G --> H[Use base verb]
    H --> I[Open the door!]
    H --> J[Negative: Don't run!]`,
      rules: ['Regular plural = noun + -s (pencil → pencils)', 'Nouns ending in -s, -x, -ch, -sh add -es (box → boxes)', 'Irregular plurals change completely (child → children)', 'Imperatives start with the base verb (Open, Sit, Close)', 'Negative imperatives use "Don\'t" + verb (Don\'t run!)']
    },
    '1-pioneer': {
      text: '🔍 **Vertiefung: Plural & Imperative** – Jetzt wird\'s kniffliger! 🧠 Schreibe die richtige Pluralform oder den passenden Befehl in die Lücke. Achte auf **unregelmäßige Formen** und **Wortstellung** bei Befehlen! ✏️',
      tips: ['📌 Doppelkonsonant bei -ing? Nein, hier nicht!', '⚠️ Achte auf -es bei -s, -x, -ch, -sh', '📌 Unregelmäßige Pluralformen auswendig lernen!'],
      mermaid: `flowchart LR
    A[Noun] --> B{Ending?}
    B -->|-s, -x, -ch, -sh| C[Add -es]
    B -->|Consonant + y| D[Change y→ies]
    B -->|Most others| E[Add -s]
    B -->|Irregular| F[Learn by heart!]
    C --> G[box→boxes]
    D --> H[baby→babies]
    E --> I[book→books]
    F --> J[man→men, mouse→mice]`,
      rules: ['Nouns ending in -s, -x, -ch, -sh: add -es (watch → watches)', 'Consonant + y: change y to -ies (baby → babies)', 'Irregular plurals: child→children, person→people, tooth→teeth', 'Practice unscrambling imperative sentences!']
    },
    '1-master': {
      text: '🏆 **Meister-Level: Plural & Imperative** – Zeig, was du kannst! 💪 Korrigiere Fehler in Sätzen, übersetze vom Deutschen ins Englische und forme Sätze um. Hier zählt jedes Detail! 🔍',
      tips: ['⚠️ Achte auf Groß- und Kleinschreibung', '📌 Satzzeichen nicht vergessen!', '⚠️ Es gibt oft mehrere richtige Antworten'],
      mermaid: `graph TD
    subgraph "Fehler finden 🔍"
    A[Sentence with error] --> B[Identify the mistake]
    B --> C[Wrong plural? Wrong verb form?]
    end
    subgraph "Korrigieren ✏️"
    C --> D[Apply the correct rule]
    D --> E[Write the correct sentence]
    end
    subgraph "Übersetzen 🌍"
    F[German sentence] --> G[Think in English]
    G --> H[Check word order!]
    end`,
      rules: ['Check each word for correct plural forms', 'Imperatives must use base verb (no -ing, no "to")', 'Translations need correct word order (SVO)', 'Capitalize "I" and sentence beginnings']
    },
    '2-explorer': {
      text: '🧩 **Verb "to be" & Prepositions** – Das wichtigste Verb im Englischen! 🎯 **Am, is, are** – je nach Person: I am, he/she/it is, you/we/they are. Und wo ist etwas? **In, on, under, behind, next to** – mit diesen Wörtern beschreibst du Positionen! 🗺️',
      tips: ['📌 I → am', '📌 he/she/it → is', '📌 you/we/they → are', '📌 on = auf, under = unter, next to = neben'],
      mermaid: `graph TD
    A[Subject] --> B{Pick the right form}
    B -->|I| C[am]
    B -->|He/She/It| D[is]
    B -->|You/We/They| E[are]
    F[Prepositions] --> G[in = in/inside]
    F --> H[on = auf/on top]
    F --> I[under = unter/below]
    F --> J[behind = hinter]
    F --> K[next to = neben]`,
      rules: ['I → am, He/She/It → is, You/We/They → are', 'Prepositions describe where things are', '"in" for inside, "on" for surface, "under" for below']
    },
    '2-pioneer': {
      text: '🔍 **Vertiefung: "to be" & Präpositionen** – Fülle die Lücken mit der richtigen Form von **am, is, are** oder der passenden Präposition! 🧠 Achte auf die Person (ich, du, er/sie...) und die Position!',
      tips: ['📌 Fragen mit "to be": Verb + Subjekt?', '⚠️ Verneinung: is not / are not', '📌 Unscramble-Übungen: Finde die richtige Reihenfolge!'],
      mermaid: `flowchart LR
    A[Subject] --> B{Singular or Plural?}
    B -->|I| C[am / am not]
    B -->|He/She/It| D[is / isn't]
    B -->|You/We/They| E[are / aren't]
    C --> F{I'm ready! ✅}
    D --> G{She is kind ✅}
    E --> H{We are late 😅}`,
      rules: ['Questions: Am I? / Is he? / Are you? (invert verb + subject)', 'Negatives: I am not / He is not (isn\'t) / They are not (aren\'t)', 'Prepositions describe locations: in, on, under, behind, next to']
    },
    '2-master': {
      text: '🏆 **Meister-Level: "to be" & Präpositionen** – Übersetze ganze Sätze vom Deutschen ins Englische und korrigiere Fehler! 🎯 Achte besonders auf **Wortstellung** und **Subjekt-Verb-Übereinstimmung**!',
      tips: ['📌 Deutsche Sätze → Englische Wortstellung (SVO)', '⚠️ "to be" + Präposition = Ortsangabe', '📌 Plural = are, Singular = is'],
      mermaid: `graph LR
    A[German] --> B[Identify subject]
    B --> C[Pick to be form]
    C --> D[Add preposition]
    D --> E[English sentence ✅]
    F[Common mistakes] --> G[Wrong: They is]
    G --> H[Correct: They are]
    F --> I[Wrong: next the]
    I --> J[Correct: next to the]`,
      rules: ['Subject must agree with the verb (They are, not They is)', '"Next to" has TWO words! (not "next the")', 'Word order: Subject + Verb + Preposition + Object']
    },
    '3-explorer': {
      text: '🧩 **Have got / Haven\'t got** – So sagst du, was du hast! 🎯 **I have got** = Ich habe. **He/She/It has got** = Er/Sie/Es hat. Für Verneinung: **haven\'t got / hasn\'t got** = habe/nicht habe! 👋',
      tips: ['📌 I/You/We/They → have got', '📌 He/She/It → has got', '⚠️ Negative: haven\'t/hasn\'t got'],
      mermaid: `graph TD
    A[Subject] --> B{Which form?}
    B -->|I, You, We, They| C[have got]
    B -->|He, She, It| D[has got]
    C --> E[I have got a cat ✅]
    D --> F[She has got a dog ✅]
    E --> G{Negative?}
    G -->|Yes| H[haven't got]
    G -->|No| I[have got ✅]
    F --> J{Negative?}
    J -->|Yes| K[hasn't got]
    J -->|No| L[has got ✅]`,
      rules: ['I/You/We/They → have got', 'He/She/It → has got', 'Negative: haven\'t got / hasn\'t got', 'Short form: I\'ve got / She\'s got']
    },
    '3-pioneer': {
      text: '🔍 **Vertiefung: Have got** – Bilde Sätze und Fragen mit **have got / has got**! ✏️ Übe die Verneinung und die **Frageform**: Have you got...? Has she got...? 🔄',
      tips: ['📌 Questions: Have/Has + subject + got?', '⚠️ Kurzantworten: Yes, I have. / No, I haven\'t.', '📌 Unscramble: Ordne die Wörter richtig!'],
      mermaid: `flowchart LR
    A{Question?} -->|Yes| B[Have/Has + subject + got?]
    A -->|No| C{Positive or negative?}
    B --> D[Have you got a pet?]
    C -->|Positive| E[Subject + have/has got]
    C -->|Negative| F[Subject + haven't/hasn't got]
    E --> G[I have got a bike]
    F --> H[She hasn't got a car]`,
      rules: ['Questions: Have/Has + subject + got? (Have you got a pet?)', 'Short answers: Yes, I have. / No, I haven\'t.', 'Negative: haven\'t got / hasn\'t got']
    },
    '3-master': {
      text: '🏆 **Meister-Level: Have got** – Übersetze Sätze, korrigiere Fehler und wende "have got" in verschiedenen Kontexten an! 🧠 **Hast du** wirklich alles verstanden? Beweise es! 💪',
      tips: ['📌 Achte auf die Person (he/she/it → has)', '⚠️ Keine doppelte Verneinung!', '📏 "have got" ≠ "have" + Partizip'],
      mermaid: `graph TD
    subgraph "Haben oder nicht haben? 🎯"
    A[I have got 💡] --> B{What do you have?}
    B --> C[A book ✅]
    B --> D[No car ❌ → haven't got]
    end
    subgraph "Typische Fehler 🚫"
    E[Wrong: She have got ❌] --> F[Correct: She has got ✅]
    G[Wrong: He hasn't got no ❌] --> H[Correct: He hasn't got any ✅]
    end`,
      rules: ['She/He/It takes "has got", not "have got"', 'No double negatives: "hasn\'t got any" not "hasn\'t got no"', 'Questions: Has/Have + subject + got?']
    }
  }

  // Dynamic instruction for units 4-15
  const key = `${u}-${level}`
  if (instructions[key]) return instructions[key]

  const levelNames: Record<string, string> = { explorer: '🧭 Grundlagen', pioneer: '🔍 Übung', master: '🏆 Meisterschaft' }
  const levelDescs: Record<string, string> = {
    explorer: `Lerne die wichtigsten Regeln zu **${t}** kennen. Beantworte Multiple-Choice-Fragen und finde die richtige Antwort! 🎯`,
    pioneer: `Wende dein Wissen zu **${t}** in Lückentexten und Satzübungen an! ✏️ Zeig, was du schon kannst! 🔍`,
    master: `Meistere **${t}** mit Übersetzungen, Fehlerkorrekturen und kreativen Satzbau-Aufgaben! 🏆`
  }

  return {
    text: `📚 **${t}** – ${levelDescs[level] || ''}`,
    tips: ['📌 Lies jede Frage genau!', '⚠️ Du hast unbegrenzt Zeit.', '📌 Bei Unsicherheit: probiere es einfach!'],
    mermaid: `graph TD
    A[${t} 📚] --> B[${levelNames[level]}]
    B --> C[Üben & Lernen 💪]
    C --> D[Abzeichen verdienen 🎖️]`,
    rules: [`Konzentriere dich auf die Regeln von ${t}.`, 'Lies jede Aufgabenstellung genau.', 'Übung macht den Meister!']
  }
}

// Start playing Explorer, Pioneer, or Master worksheet
async function startWorksheet(level: 'explorer' | 'pioneer' | 'master') {
  if (!activeTopic.value) return
  
  // Find correct questions based on static config served by backend or simulate
  let questions: any[] = []
  
  // Simulated request to load questions for safety, or hardcoded fallback
  try {
    // We can fetch from backend or reconstruct from activeTopic details
    // For convenience we generate from activeTopic details or fetch. Let's make an API endpoint:
    // GET /api/grammar/topics/:id/level/:level/questions
    // Or we fetch from activeTopic directly. In our router, topics returned by /api/grammar/topics do NOT include full question data to keep payload clean.
    // Let's call endpoint: POST /api/grammar/topics/:id/submit-worksheet (which evaluates), but we need questions to play!
    // Let's make a mock list of questions based on activeTopic id and level:
    questions = await getWorksheetQuestions(activeTopic.value.id, level)
  } catch (e) {
    console.error('Failed to get questions', e)
  }

  activeWorksheet.value = {
    level,
    questions
  }
  
  // Reset answers
  resetWorksheetPlayer()
}

// Fetch questions for worksheets helper
async function getWorksheetQuestions(topicId: string, level: string): Promise<any[]> {
  const qs: Record<string, any[]> = {
    // ── Topic 1: Plurals & Imperatives ──
    'grammar-1-plurals-explorer': [
      { question: 'What is the plural of "book"?', options: ['books', 'bookes', 'book\'s'], correctIndex: 0, explanation: 'Regular plural forms simply add an "-s" to the singular noun.' },
      { question: 'Which of these is an irregular plural form?', options: ['tables', 'children', 'pens'], correctIndex: 1, explanation: '"children" is irregular.' },
      { question: 'How do you form the negative imperative of "talk"?', options: ['No talk!', 'Not talk!', "Don't talk!"], correctIndex: 2, explanation: 'Negative imperative uses "Don\'t" + infinitive.' },
      { question: 'What is the plural of "box"?', options: ['boxs', 'boxes', 'boxies'], correctIndex: 1, explanation: 'Nouns ending in "-x" add "-es".' },
      { question: 'Choose the correct imperative:', options: ['Open the window, please.', 'You opening the window.', 'Please window open.'], correctIndex: 0, explanation: 'Imperatives start with the base verb.' },
      { question: 'True or False: "Childs" is the correct plural of "child".', options: ['True', 'False'], correctIndex: 1, explanation: '"Child" → "children" (irregular).' },
      { question: 'Which sentence uses the imperative correctly?', options: ['Sit down, please.', 'You sit down, please.', 'Sitting down, please.'], correctIndex: 0, explanation: 'Imperatives start with the base form of the verb.' },
      { question: 'What is the plural of "foot"?', options: ['foots', 'feet', 'footes'], correctIndex: 1, explanation: '"Foot" → "feet" (irregular).' },
      { question: 'Which word is a plural noun?', options: ['mouse', 'mice', 'mouses'], correctIndex: 1, explanation: '"Mice" is the irregular plural of "mouse".' },
      { question: 'What is the correct imperative for "not to run"?', options: ["Don't run!", 'No running!', 'Not to run!'], correctIndex: 0, explanation: 'Negative imperative = "Don\'t" + verb.' },
      { question: 'Choose the sentence with the correct plural:', options: ['I have two foots.', 'I have two feet.', 'I have two foot.'], correctIndex: 1, explanation: '"Feet" is the correct plural of "foot".' },
      { question: 'What is the plural of "tooth"?', options: ['tooths', 'teeth', 'toothes'], correctIndex: 1, explanation: '"Tooth" → "teeth" (irregular).' },
      { question: 'Which is the correct imperative for "not be late"?', options: ["Don't be late!", 'Not be late!', "Be not late!"], correctIndex: 0, explanation: '"Don\'t be late!" is the correct negative imperative.' },
      { question: 'What is the plural of "man"?', options: ['mans', 'men', 'manes'], correctIndex: 1, explanation: '"Man" → "men" (irregular).' },
      { question: 'Which sentence is a polite imperative?', options: ['Please close the door.', 'Close the door!', 'You close the door.'], correctIndex: 0, explanation: '"Please" makes an imperative polite.' }
    ],
    'grammar-1-plurals-pioneer': [
      { sentence: 'Two _____ (child) are playing.', placeholder: 'child', correctAnswer: 'children', explanation: 'Irregular plural: children.' },
      { sentence: 'Please _____ (not close) the door.', placeholder: 'not close', correctAnswer: "don't close", explanation: 'Negative imperative: don\'t close.' },
      { sentence: 'We have three _____ (box) of pencils.', placeholder: 'box', correctAnswer: 'boxes', explanation: '-x → -es: boxes.' },
      { sentence: '_____ (open) your book on page 10.', placeholder: 'open', correctAnswer: 'open', explanation: 'Imperative uses base verb.' },
      { sentence: 'There are five _____ (pencil) in my case.', placeholder: 'pencil', correctAnswer: 'pencils', explanation: 'Regular plural: -s.' },
      { sentence: 'Put the words in order: "please / book / your / open"', placeholder: 'order', correctAnswer: 'open your book please', explanation: 'Imperative order: verb + object + please.' },
      { sentence: 'Two _____ (woman) are walking to school.', placeholder: 'woman', correctAnswer: 'women', explanation: 'Irregular: woman → women.' },
      { sentence: 'All the _____ (child) love football.', placeholder: 'child', correctAnswer: 'children', explanation: 'Irregular plural: children.' },
      { sentence: 'Please _____ (not / write) on the table!', placeholder: 'not / write', correctAnswer: "don't write", explanation: 'Negative imperative: don\'t + verb.' },
      { sentence: 'How many _____ (tooth) does a shark have?', placeholder: 'tooth', correctAnswer: 'teeth', explanation: 'Irregular: tooth → teeth.' },
      { sentence: '_____ (not / forget) your homework!', placeholder: 'not / forget', correctAnswer: "don't forget", explanation: '"Don\'t forget" = negative imperative.' },
      { sentence: 'There are three _____ (bus) at the station.', placeholder: 'bus', correctAnswer: 'buses', explanation: 'Nouns ending in -s add -es.' },
      { sentence: 'We have two _____ (mouse) as class pets.', placeholder: 'mouse', correctAnswer: 'mice', explanation: 'Irregular: mouse → mice.' },
      { sentence: 'Unscramble: "the / Don\'t / door / close"', placeholder: 'unscramble', correctAnswer: "don't close the door", explanation: 'Don\'t + verb + object.' },
      { sentence: 'There are many _____ (person) at the party.', placeholder: 'person', correctAnswer: 'people', explanation: 'Irregular plural: person → people.' }
    ],
    'grammar-1-plurals-master': [
      { question: 'Correct: "Don\'t opening the window, please."', correctAnswers: ["Don't open the window, please.", "Don't open the window please.", "Please don't open the window."], explanation: 'Imperative uses base verb, not -ing.' },
      { question: 'Translate: "Öffne die Tür, bitte."', correctAnswers: ['Open the door, please.', 'Open the door please.', 'Please open the door.'], explanation: '"Öffne" → "Open" (imperative).' },
      { question: 'Form the plural: "This is a child with a pencil."', correctAnswers: ['These are children with pencils.', 'These are children with pencils'], explanation: '"child" → "children", "pencil" → "pencils".' },
      { question: 'Correct: "The three boyes are sitting on the chairs."', correctAnswers: ['The three boys are sitting on the chairs.', 'The three boys are sitting on chairs.'], explanation: '"boy" → "boys" (add -s, not -es).' },
      { question: 'Form the negative command: "Run in the classroom!"', correctAnswers: ["Don't run in the classroom!", "Do not run in the classroom!", "Don't run in the classroom."], explanation: '"Don\'t" + verb for negative imperatives.' },
      { question: 'Rewrite in plural: "The man has a red car."', correctAnswers: ['The men have red cars.', 'The men have a red car.'], explanation: '"man" → "men", "has" → "have".' },
      { question: 'Translate: "Öffnet eure Bücher auf Seite 5."', correctAnswers: ['Open your books on page 5.', 'Open your books at page 5.', 'Open your books to page 5.'], explanation: 'Imperative plural: "Open your books."' },
      { question: 'Correct: "The childs are playing with the mouses."', correctAnswers: ['The children are playing with the mice.', 'The children are playing with the mice.'], explanation: '"childs" → "children", "mouses" → "mice".' },
      { question: 'Rewrite as a negative imperative: "Close the window."', correctAnswers: ["Don't close the window.", "Do not close the window."], explanation: '"Don\'t" + base verb.' },
      { question: 'Translate: "Die Frauen sind Lehrerinnen."', correctAnswers: ['The women are teachers.', 'The women are teachers.'], explanation: '"Frauen" → "women", "Lehrerinnen" → "teachers".' },
      { question: 'Combine: "I have a book. I have a pen."', correctAnswers: ['I have a book and a pen.', 'I have a book and I have a pen.'], explanation: 'Use "and" to combine.' },
      { question: 'Correct: "Don\'t to run in the hallway!"', correctAnswers: ["Don't run in the hallway!", "Do not run in the hallway!"], explanation: 'No "to" after "Don\'t".' },
      { question: 'Rewrite in plural: "This is a child with a tooth."', correctAnswers: ['These are children with teeth.', 'These are children with teeth.'], explanation: '"This" → "These", "child" → "children", "tooth" → "teeth".' },
      { question: 'Form an imperative from: "you / please / quiet / be"', correctAnswers: ['Please be quiet.', 'Be quiet, please.'], explanation: 'Imperatives drop "you".' },
      { question: 'Correct and rewrite: "The mans are playing with the childs."', correctAnswers: ['The men are playing with the children.', 'The men are playing with the children.'], explanation: '"mans" → "men", "childs" → "children".' }
    ]
  }

  // If we have hardcoded questions (topics 1-3), use them immediately
  const key = `${topicId}-${level}`
  if (qs[key]) return qs[key]

  // For topics 4-15: fetch the actual questions from the backend
  // This ensures frontend questions always match backend evaluation
  try {
    const res = await fetch(`/api/grammar/topics/${topicId}/questions/${level}`)
    if (res.ok) {
      const data = await res.json()
      return data.questions || []
    }
  } catch (e) {
    console.error('Failed to fetch grammar questions:', e)
  }

  // Ultimate fallback: return empty array so UI shows error
  return []
}

function resetWorksheetPlayer() {
  worksheetAnswers.value = {}
  const questionCount = activeWorksheet.value?.questions?.length || 15
  const evals: Record<number, boolean | null> = {}
  for (let i = 0; i < questionCount; i++) {
    evals[i] = null
  }
  worksheetEvaluations.value = evals
  worksheetSubmitted.value = false
}

// Submit answers to worksheet
async function submitWorksheet() {
  if (!activeTopic.value || !activeWorksheet.value) return
  
  // Call backend to submit
  try {
    const res = await fetch(`/api/grammar/topics/${activeTopic.value.id}/submit-worksheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify({
        level: activeWorksheet.value.level,
        answers: worksheetAnswers.value
      })
    })

    if (res.ok) {
      const data = await res.json()
      // Populate evaluations
      data.evaluation.forEach((val: boolean, idx: number) => {
        worksheetEvaluations.value[idx] = val
      })
      worksheetSubmitted.value = true
      
      if (data.success) {
        uiStore.showToast('Hervorragend! Alle Antworten sind richtig!', 'success')
      } else {
        uiStore.showToast('Manche Antworten waren leider falsch. Versuche es noch einmal!', 'warning')
      }
    }
  } catch (e) {
    uiStore.showToast('Submit failed', 'error')
  }
}

const allWorksheetAnswersCorrect = computed(() => {
  return Object.values(worksheetEvaluations.value).every(val => val === true)
})

function finishWorksheetPlayer() {
  activeWorksheet.value = null
  fetchTopics()
}

// CSRF helper
function getCsrfToken(): string {
  const name = 'csrf_token='
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

// AI Finisher Quiz Flow
async function triggerQuizGeneration() {
  if (!activeTopic.value) return
  quizActive.value = true
  quizPhase.value = 'loading'
  quizCurrentIdx.value = 0
  quizAnswers.value = {}

  // Simulate loader (2s) while backend "generates" the quiz via AI
  setTimeout(async () => {
    try {
      const res = await fetch(`/api/grammar/topics/${activeTopic.value.id}/quiz/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        }
      })
      if (res.ok) {
        const data = await res.json()
        quizQuestions.value = data.questions
        quizPhase.value = 'playing'
      }
    } catch (e) {
      uiStore.showToast('Failed to generate quiz', 'error')
      quizActive.value = false
    }
  }, 2000)
}

async function submitQuiz() {
  if (!activeTopic.value) return
  try {
    const res = await fetch(`/api/grammar/topics/${activeTopic.value.id}/quiz/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify({
        answers: quizAnswers.value
      })
    })

    if (res.ok) {
      const data = await res.json()
      quizResultData.value = {
        score: data.score,
        grade: data.grade
      }
      quizPhase.value = 'result'
      fetchTopics()
      uiStore.showToast(`Quiz abgeschlossen! Deine Note: ${data.grade}`, 'success')
    }
  } catch (e) {
    uiStore.showToast('Quiz submission failed', 'error')
  }
}

function closeQuiz() {
  quizActive.value = false
}

// Reset lock confirmation
async function confirmReset() {
  const topicTitle = activeTopic.value?.title || ''
  const confirmed = confirm(
    `Bist du sicher, dass du "${topicTitle}" zurücksetzen möchtest?\n\n` +
    `Dadurch werden ALLE deine bisherigen Abzeichen (Explorer, Pioneer, Master) und deine Note für dieses Thema gelöscht. Sie müssen alle 3 Level erneut abschließen!`
  )

  if (confirmed) {
    try {
      const res = await fetch(`/api/grammar/topics/${activeTopic.value.id}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        }
      })
      if (res.ok) {
        uiStore.showToast('Fortschritt zurückgesetzt. Du kannst von vorne beginnen!', 'info')
        quizActive.value = false
        fetchTopics()
      }
    } catch (e) {
      uiStore.showToast('Reset failed', 'error')
    }
  }
}
</script>

<style scoped>
.grammar-academy-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 1rem;
  min-height: calc(100vh - 56px);
  background-color: var(--bg-main);
}

/* Header style */
.ga-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background-color: var(--bg-card);
}
.ga-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.ga-header-logo {
  font-size: 2.2rem;
}
.ga-title {
  font-size: 1.4rem;
  font-weight: 800;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.ga-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}
.badge-counter {
  font-size: 0.85rem;
  font-weight: 600;
  border-color: var(--primary-soft);
  background-color: var(--primary-light);
}

/* Grid layout */
.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}
.topic-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 220px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  cursor: pointer;
}
.topic-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.unit-badge {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--primary-dark);
  background: var(--primary-light);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
}
.status-badge-incomplete {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-hover);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
}
.grade-badge {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
}
.grade-badge.A { background: var(--success-light); color: var(--success); }
.grade-badge.B { background: var(--info-light); color: var(--info); }
.grade-badge.C { background: var(--warning-light); color: #b45309; }
.grade-badge.D { background: rgba(249, 115, 22, 0.1); color: #ea580c; }
.grade-badge.F { background: var(--danger-light); color: var(--danger); }

.topic-card h4 {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0.5rem 0 0.25rem;
  color: var(--text-main);
}
.topic-card p {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* Badges Row */
.badges-row {
  display: flex;
  gap: 0.5rem;
}
.badges-row.large {
  justify-content: space-around;
  padding: 0.75rem 0;
}
.badge-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  font-size: 1.05rem;
  filter: grayscale(100%);
  opacity: 0.4;
  transition: all var(--transition-fast);
}
.badge-icon.earned {
  filter: grayscale(0%);
  opacity: 1;
  border-color: #f59e0b;
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.3);
}
.badge-icon.large {
  width: 52px;
  height: 52px;
  font-size: 2rem;
}
.badge-lbl {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
}

/* Topic Pathway Layout */
.topic-roadmap-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
  align-items: start;
}
.roadmap-sidebar {
  padding: 1.5rem;
  background: var(--bg-card);
}
.roadmap-sidebar h3 {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0.25rem 0;
  color: var(--text-main);
}
.grade-report-card {
  border-color: var(--primary-soft);
  background: var(--bg-hover);
}
.grade-symbol {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1;
}
.grade-symbol.A { color: var(--success); }
.grade-symbol.B { color: var(--info); }
.grade-symbol.C { color: var(--warning); }
.grade-symbol.D { color: #f97316; }
.grade-symbol.F { color: var(--danger); }

.info-box-roadmap {
  background: var(--info-light);
  border-left: 3px solid var(--info);
  padding: 0.75rem;
  border-radius: var(--radius-xs);
}

/* Step list */
.roadmap-path-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.roadmap-step {
  padding: 1.5rem;
  transition: all var(--transition);
}
.roadmap-step.completed {
  border-color: var(--success-light);
  background: rgba(16, 185, 129, 0.03);
}
.roadmap-step.playable {
  border-color: var(--primary-soft);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.05);
}
.roadmap-step.locked {
  opacity: 0.6;
  background: var(--bg-hover);
  border-color: var(--border-color);
}
.step-num {
  font-size: 2.2rem;
  line-height: 1;
}
.roadmap-step h4 {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: var(--text-main);
}
.badge-reward {
  font-weight: 700;
  color: #b45309;
}
.completed-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--success);
}
.completed-label.success {
  background: var(--success-light);
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-xs);
}
.locked-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

/* Instruction screen */
.instruction-modal {
  max-width: 680px !important;
  width: calc(100% - 2rem);
}
.instruction-text {
  background: var(--primary-light);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius-sm);
}
.instruction-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}
.tip-badge {
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.instruction-diagram {
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  overflow-x: auto;
}
.instruction-diagram .mermaid {
  display: flex;
  justify-content: center;
  min-width: 300px;
}
.instruction-rules {
  background: var(--success-light);
  border-radius: var(--radius-sm);
}
.rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.rule-list li {
  padding: 0.3rem 0;
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

/* Worksheet player */
.worksheet-player-modal {
  max-width: 680px !important;
  width: calc(100% - 2rem);
}
.questions-list-player {
  max-height: 480px;
  overflow-y: auto;
  padding-right: 0.5rem;
}
.worksheet-question-card {
  padding: 1.25rem;
  border-left: 3px solid var(--border-color);
  transition: border-color var(--transition);
}
.worksheet-question-card.correct-border {
  border-left-color: var(--success);
}
.worksheet-question-card.wrong-border {
  border-left-color: var(--danger);
}
.question-text-bold {
  font-size: 0.95rem;
  line-height: 1.5;
}
.options-vertical-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.option-btn {
  text-align: left;
  padding: 0.6rem 0.8rem;
  border: 1.5px solid var(--border-color);
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.option-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--text-muted);
}
.option-btn.selected {
  border-color: var(--primary);
  background: var(--primary-light);
  color: var(--primary-dark);
}
.option-btn.correct-mc {
  background: var(--success) !important;
  border-color: var(--success) !important;
  color: #fff !important;
  font-weight: 600;
}
.option-btn.wrong-mc {
  background: var(--danger) !important;
  border-color: var(--danger) !important;
  color: #fff !important;
}

.fitb-input, .master-input {
  border: 2px solid var(--border-color);
  border-radius: var(--radius-xs);
  padding: 0.45rem 0.75rem;
  font-size: var(--font-size-sm);
  outline: none;
  background: var(--bg-card);
}
.fitb-input:focus, .master-input:focus {
  border-color: var(--primary);
}
.fitb-input {
  width: 140px;
}
.master-input {
  width: 100%;
}
.correct-text-input {
  border-color: var(--success) !important;
  background-color: var(--success-light) !important;
  color: var(--success) !important;
  font-weight: 600;
}
.wrong-text-input {
  border-color: var(--danger) !important;
  background-color: var(--danger-light) !important;
  color: var(--danger) !important;
}
.explanation-box {
  background: var(--bg-hover);
  padding: 0.75rem;
  border-radius: var(--radius-xs);
  line-height: 1.45;
}

/* Quiz steps loader */
.loading-bar-container {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: var(--radius-full);
  overflow: hidden;
  max-width: 320px;
}
.loading-bar-fill {
  height: 100%;
  width: 30%;
  background: var(--primary);
  border-radius: var(--radius-full);
  animation: loading-pulse 2s infinite linear;
}
@keyframes loading-pulse {
  0% { transform: translateX(-100%); width: 30%; }
  50% { width: 50%; }
  100% { transform: translateX(320px); width: 30%; }
}

.grade-symbol.large {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  border: 4px solid currentColor;
}

.fade-in {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .ga-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  .ga-header-right {
    justify-content: space-between;
  }
  .topic-roadmap-layout {
    grid-template-columns: 1fr;
  }
}
</style>
