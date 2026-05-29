<template>
  <div class="listening-play-container page-wide">
    <!-- Header -->
    <div class="listening-header flex justify-between items-center mb-4">
      <div class="flex items-center gap-3">
        <button @click="goBack" class="btn-secondary btn-sm">← Zurück</button>
        <div>
          <h2 class="text-xl font-bold flex items-center gap-2">
            <span>🎧</span> {{ task?.title || 'Listening Exercise' }}
          </h2>
          <p class="text-xs text-secondary">
            Unit {{ unit }} • Level: <span class="badge" :class="tierClass">{{ task?.tier }}</span>
          </p>
        </div>
      </div>
      <div class="progress-indicator" v-if="task && !completed">
        Question {{ currentQuestionIdx + 1 }} of {{ task.questions.length }}
      </div>
    </div>

    <!-- Main View -->
    <div v-if="loading" class="text-center py-6">
      <div class="loading-spinner"></div>
      <p class="text-secondary mt-2">Loading listening exercise...</p>
    </div>

    <div v-else-if="error" class="card text-center py-6 text-danger">
      <p class="font-bold text-lg">⚠️ Error</p>
      <p class="text-sm mt-1">{{ error }}</p>
      <button @click="goBack" class="btn-secondary mt-3">Go Back</button>
    </div>

    <div v-else-if="completed" class="results-card card fade-in text-center">
      <div class="results-icon">🏆</div>
      <h3 class="text-2xl font-bold">Listening Completed!</h3>
      <p class="text-secondary mb-4">Great job! You finished the listening quiz.</p>

      <!-- Score Circle -->
      <div class="score-circle-container flex justify-center mb-6">
        <div class="score-circle" :style="{ borderColor: gradeColor }">
          <span class="score-num">{{ score }} / {{ task?.questions.length }}</span>
          <span class="score-pct">{{ percentage }}%</span>
          <span class="score-grade" :style="{ color: gradeColor }">Grade {{ letterGrade }}</span>
        </div>
      </div>

      <!-- Competence breakdown -->
      <div class="competence-card mb-6">
        <h4 class="font-bold text-md mb-3 text-left">Kompetenzbereiche Breakdown</h4>
        <div class="competence-grid">
          <div v-for="(stats, name) in competenceStats" :key="name" class="competence-row flex justify-between items-center py-2 border-bottom">
            <span class="text-sm font-semibold capitalize">{{ formatCompetenceName(name) }}</span>
            <div class="flex items-center gap-2">
              <div class="comp-bar-bg">
                <div class="comp-bar-fill" :style="{ width: `${stats.pct}%`, backgroundColor: gradeColor }"></div>
              </div>
              <span class="text-xs font-bold">{{ stats.correct }} / {{ stats.total }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center gap-3">
        <button @click="resetQuiz" class="btn-secondary">🔄 Try Again</button>
        <button @click="goBack" class="btn-primary">🏠 Back to Dashboard</button>
      </div>
    </div>

    <div v-else-if="task" class="game-grid grid grid-cols-2 gap-4">
      <!-- Left side: Player & Transcript Panel -->
      <div class="audio-panel card flex flex-col gap-4">
        <!-- Scene description -->
        <div class="scene-info p-3 rounded-lg bg-hover">
          <span class="font-bold text-xs text-primary block mb-1">SCENE SETTING</span>
          <p class="text-sm text-secondary font-medium">{{ task.scene }}</p>
        </div>

        <!-- Image -->
        <div class="listening-image-container relative">
          <img 
            v-if="hasImage" 
            :src="task.imagePath" 
            @error="onImageError" 
            class="listening-image" 
            alt="Listening illustration"
          />
          <div v-else class="listening-image-placeholder flex flex-col items-center justify-center">
            <span class="text-4xl mb-2">🎧🇬🇧</span>
            <p class="text-xs font-bold text-muted">Listening Illustration</p>
            <p class="text-[10px] text-muted opacity-70">Placeholder: {{ task.imagePath.split('/').pop() }}</p>
          </div>
        </div>

        <!-- Custom Audio Player Card -->
        <div class="player-card glass-strong p-4 rounded-xl flex flex-col items-center gap-4 relative overflow-hidden">
          <div class="audio-waves flex gap-1 justify-center items-center h-12" :class="{ playing: isPlaying }">
            <span class="wave-bar" v-for="i in 12" :key="i" :style="{ animationDelay: `${i * 0.1}s` }"></span>
          </div>

          <!-- Hidden native audio element -->
          <audio 
            ref="audioRef" 
            :src="task.audioPath"
            @play="isPlaying = true"
            @pause="isPlaying = false"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata"
            @error="onAudioError"
          ></audio>

          <!-- Playback controls -->
          <div class="flex flex-col items-center gap-2 w-full">
            <div class="flex items-center gap-3">
              <button @click="rewind" class="btn-control">⏮ 10s</button>
              <button @click="togglePlay" class="btn-play-pause flex items-center justify-center">
                {{ isPlaying ? '⏸' : '▶️' }}
              </button>
              <button @click="forward" class="btn-control">10s ⏭</button>
            </div>
            
            <div class="time-slider-container w-full flex items-center gap-2 mt-2">
              <span class="text-xs text-secondary font-mono">{{ formatTime(currentTime) }}</span>
              <input 
                type="range" 
                min="0" 
                :max="duration || 100" 
                v-model="currentTime" 
                @input="onSliderInput"
                class="time-slider flex-1"
              />
              <span class="text-xs text-secondary font-mono">{{ formatTime(duration) }}</span>
            </div>
          </div>

          <!-- Missing audio alert -->
          <div v-if="audioError" class="audio-alert p-3 rounded-lg text-xs text-left bg-warning-light mt-2 border-warning">
            <p class="font-bold mb-1">⚠️ Audio track is not uploaded yet</p>
            <p>You can read the script in the **Transcript** tab below to solve the questions.</p>
          </div>
        </div>

        <!-- Transcript Tab / Expander -->
        <div class="transcript-expander border-top mt-2 pt-3">
          <button @click="showTranscript = !showTranscript" class="btn-secondary btn-sm w-full justify-between">
            <span>📄 {{ showTranscript ? 'Hide Transcript' : 'Show Transcript' }}</span>
            <span>{{ showTranscript ? '▲' : '▼' }}</span>
          </button>
          
          <div v-if="showTranscript" class="transcript-content mt-3 p-3 rounded-lg bg-hover fade-in leading-relaxed">
            <div v-if="task.type === 'monologue'">
              <p class="text-sm text-main whitespace-pre-wrap">{{ taskText }}</p>
            </div>
            <div v-else class="flex flex-col gap-3">
              <div 
                v-for="(line, lIdx) in parsedDialogue" 
                :key="lIdx" 
                class="dialogue-line text-sm"
                :class="line.speaker === 'Speaker 1' ? 'speaker-1-box' : 'speaker-2-box'"
              >
                <span class="font-bold block text-xs mb-1" :class="line.speaker === 'Speaker 1' ? 'text-primary' : 'text-success'">
                  {{ line.speaker }}
                </span>
                <p class="text-main">{{ line.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Quiz Panel -->
      <div class="quiz-panel card flex flex-col justify-between">
        <!-- Progress Bar -->
        <div class="quiz-progress-bar mb-4">
          <div class="quiz-progress-fill" :style="{ width: `${progressPercent}%` }"></div>
        </div>

        <!-- Question View -->
        <div v-if="currentQuestion" class="flex-1 flex flex-col justify-between">
          <div>
            <span class="badge mb-2" :class="compBadgeClass(currentQuestion.kompetenzbereich)">
              {{ formatCompetenceName(currentQuestion.kompetenzbereich) }}
            </span>
            <h3 class="text-lg font-bold mb-4">{{ currentQuestion.question }}</h3>

            <!-- Options -->
            <div class="options-list flex flex-col gap-2 mb-4">
              <button
                v-for="(opt, idx) in currentQuestion.options"
                :key="idx"
                class="option-btn text-left p-3 rounded-lg border flex justify-between items-center"
                :class="optionClass(idx)"
                :disabled="hasAnswered"
                @click="selectOption(idx)"
              >
                <span>{{ opt }}</span>
                <span class="option-feedback" v-if="hasAnswered">
                  <span v-if="idx === currentQuestion.correctIndex">✅</span>
                  <span v-else-if="idx === selectedOptionIdx">❌</span>
                </span>
              </button>
            </div>
          </div>

          <!-- Feedback & Navigation -->
          <div>
            <div v-if="hasAnswered" class="explanation-box p-3 rounded-lg mb-4 fade-in">
              <p class="text-sm font-semibold mb-1">
                {{ isCorrect ? '🎉 Correct!' : '❌ Incorrect' }}
              </p>
              <p class="text-xs text-secondary">{{ currentQuestion.explanation }}</p>
            </div>

            <div class="flex justify-end">
              <button 
                v-if="!hasAnswered"
                @click="submitAnswer"
                class="btn-primary w-full justify-center py-3"
                :disabled="selectedOptionIdx === null"
              >
                Check Answer
              </button>
              <button 
                v-else
                @click="nextQuestion"
                class="btn-success w-full justify-center py-3"
              >
                {{ currentQuestionIdx + 1 === task.questions.length ? 'Show Results' : 'Next Question' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getListeningTask, type ListeningTask, type ListeningQuestion } from '../data/listeningData'
import { api } from '../services/api'

const route = useRoute()
const router = useRouter()

const textbook = route.params.textbook as string
const unit = parseInt(route.params.unit as string)
const listeningId = route.params.listeningId as string

const loading = ref(true)
const error = ref<string | null>(null)
const task = ref<ListeningTask | null>(null)

// Audio elements
const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const audioError = ref(false)

// Game states
const currentQuestionIdx = ref(0)
const selectedOptionIdx = ref<number | null>(null)
const hasAnswered = ref(false)
const score = ref(0)
const completed = ref(false)
const userAnswers = ref<number[]>([])

// Panel tabs & transcript states
const showTranscript = ref(false)
const taskText = ref('')
const parsedDialogue = ref<{ speaker: string; text: string }[]>([])
const hasImage = ref(true)

function onImageError() {
  hasImage.value = false
}

onMounted(async () => {
  try {
    const found = getListeningTask(unit, listeningId)
    if (!found) {
      error.value = `Listening exercise not found for Unit ${unit}`
      loading.value = false
      return
    }
    task.value = found
    hasImage.value = true
    
    // Fetch the transcript text
    try {
      const response = await fetch(found.transcriptPath)
      if (response.ok) {
        const fullText = await response.text()
        // Strip the scene line
        const splitText = fullText.split('\n\n')
        const mainText = splitText.slice(1).join('\n\n')
        taskText.value = mainText
        
        // Parse Dialogue if dialogue type
        if (found.type === 'dialogue') {
          const lines = mainText.split('\n\n')
          parsedDialogue.value = lines.map(line => {
            const match = line.match(/^(Speaker \d): (.*)/s)
            if (match) {
              return { speaker: match[1], text: match[2] }
            }
            return { speaker: 'Speaker', text: line }
          })
        }
      }
    } catch (e) {
      console.error('Failed to load text transcript', e)
    }

    loading.value = false
  } catch (err: any) {
    error.value = 'Failed to load listening exercise data.'
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
})

const currentQuestion = computed(() => {
  if (!task.value) return null
  return task.value.questions[currentQuestionIdx.value]
})

const progressPercent = computed(() => {
  if (!task.value) return 0
  return (currentQuestionIdx.value / task.value.questions.length) * 100
})

const isCorrect = computed(() => {
  if (!currentQuestion.value) return false
  return selectedOptionIdx.value === currentQuestion.value.correctIndex
})

const percentage = computed(() => {
  if (!task.value) return 0
  return Math.round((score.value / task.value.questions.length) * 100)
})

const competenceStats = computed(() => {
  if (!task.value) return {}
  const stats: Record<string, { total: number; correct: number; pct: number }> = {}
  
  task.value.questions.forEach((q, idx) => {
    const comp = q.kompetenzbereich
    if (!stats[comp]) {
      stats[comp] = { total: 0, correct: 0, pct: 0 }
    }
    stats[comp].total++
    if (userAnswers.value[idx] === q.correctIndex) {
      stats[comp].correct++
    }
  })

  Object.keys(stats).forEach((k) => {
    stats[k].pct = Math.round((stats[k].correct / stats[k].total) * 100)
  })

  return stats
})

const letterGrade = computed(() => {
  const pct = percentage.value
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  if (pct >= 50) return 'E'
  return 'F'
})

const gradeColor = computed(() => {
  const g = letterGrade.value
  if (g === 'A') return '#10b981'
  if (g === 'B') return '#3b82f6'
  if (g === 'C') return '#f59e0b'
  if (g === 'D') return '#f97316'
  return '#ef4444'
})

const tierClass = computed(() => {
  const tier = task.value?.tier
  if (tier === 'Starter') return 'badge-success'
  if (tier === 'Practice') return 'badge-info'
  if (tier === 'Challenge') return 'badge-warning'
  return 'badge-danger'
})

function formatCompetenceName(comp: string) {
  return comp.replace(/_/g, ' ')
}

function compBadgeClass(comp: string) {
  if (comp === 'global_understanding') return 'badge-info'
  if (comp === 'specific_information') return 'badge-primary'
  if (comp === 'digital_reading') return 'badge-success'
  return 'badge-warning'
}

// Audio logic helpers
function togglePlay() {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play().catch(() => {
      audioError.value = true
    })
  }
}

function rewind() {
  if (!audioRef.value) return
  audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - 10)
}

function forward() {
  if (!audioRef.value) return
  audioRef.value.currentTime = Math.min(duration.value, audioRef.value.currentTime + 10)
}

function onTimeUpdate() {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
  }
}

function onLoadedMetadata() {
  if (audioRef.value) {
    duration.value = audioRef.value.duration
  }
}

function onSliderInput() {
  if (audioRef.value) {
    audioRef.value.currentTime = currentTime.value
  }
}

function onAudioError() {
  audioError.value = true
}

function formatTime(secs: number) {
  if (isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

function selectOption(idx: number) {
  selectedOptionIdx.value = idx
}

function optionClass(idx: number) {
  if (!hasAnswered.value) {
    return selectedOptionIdx.value === idx ? 'option-selected' : 'option-default'
  }
  if (idx === currentQuestion.value?.correctIndex) {
    return 'option-correct'
  }
  if (selectedOptionIdx.value === idx) {
    return 'option-wrong'
  }
  return 'option-disabled'
}

function submitAnswer() {
  if (selectedOptionIdx.value === null) return
  hasAnswered.value = true
  userAnswers.value.push(selectedOptionIdx.value)
  if (isCorrect.value) {
    score.value++
  }
}

async function nextQuestion() {
  if (!task.value) return
  
  if (currentQuestionIdx.value + 1 < task.value.questions.length) {
    currentQuestionIdx.value++
    selectedOptionIdx.value = null
    hasAnswered.value = false
  } else {
    // Finished all questions! Save to DB
    completed.value = true
    try {
      await api.post('/english/listening/complete', {
        textbook,
        unit,
        listeningId,
        score: score.value,
        maxScore: task.value.questions.length
      })
    } catch (err) {
      console.error('Failed to save progress to server', err)
    }
  }
}

function resetQuiz() {
  currentQuestionIdx.value = 0
  selectedOptionIdx.value = null
  hasAnswered.value = false
  score.value = 0
  completed.value = false
  userAnswers.value = []
  isPlaying.value = false
  hasImage.value = true
  if (audioRef.value) {
    audioRef.value.currentTime = 0
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.listening-play-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.game-grid {
  min-height: 520px;
}

.audio-panel {
  max-height: 620px;
  overflow-y: auto;
}

.player-card {
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-hover) 0%, var(--bg-card) 100%);
}

.audio-waves {
  width: 100%;
}

.wave-bar {
  width: 4px;
  height: 8px;
  background: var(--primary);
  border-radius: 99px;
  transition: height 0.15s ease;
}

.audio-waves.playing .wave-bar {
  animation: wavePulse 1.2s ease-in-out infinite alternate;
}

@keyframes wavePulse {
  0% { height: 8px; }
  100% { height: 40px; }
}

.btn-play-pause {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);
}

.btn-play-pause:hover {
  transform: scale(1.05);
}

.btn-control {
  background: none;
  border: none;
  font-size: 0.85rem;
  color: var(--text-muted);
  cursor: pointer;
}

.btn-control:hover {
  color: var(--primary);
}

.time-slider {
  accent-color: var(--primary);
  height: 4px;
  cursor: pointer;
}

.audio-alert {
  border-left: 4px solid #f59e0b;
}

.transcript-content {
  border: 1.5px dashed var(--border-color);
}

.speaker-1-box {
  background: rgba(59, 130, 246, 0.05);
  border-left: 3px solid var(--primary);
  padding: 0.5rem 0.75rem;
  border-radius: 0 6px 6px 0;
}

.speaker-2-box {
  background: rgba(34, 197, 94, 0.05);
  border-left: 3px solid var(--success);
  padding: 0.5rem 0.75rem;
  border-radius: 0 6px 6px 0;
}

.option-btn {
  font-weight: 500;
  transition: all 0.2s ease;
}

.option-default {
  background: var(--bg-card);
  border-color: var(--border-color);
}

.option-default:hover {
  background: var(--bg-hover);
  border-color: var(--primary);
}

.option-selected {
  background: rgba(59, 130, 246, 0.08);
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.option-correct {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--success);
  color: var(--success-dark);
}

.option-wrong {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger);
  color: var(--danger-dark);
}

.option-disabled {
  background: var(--bg-hover);
  border-color: var(--border-color);
  opacity: 0.6;
  cursor: not-allowed;
}

.explanation-box {
  background: var(--bg-hover);
  border-left: 4px solid var(--primary);
}

.quiz-progress-bar {
  height: 6px;
  background: var(--border-color);
  border-radius: 999px;
  overflow: hidden;
}

.quiz-progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s ease;
}

.results-card {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2.5rem;
}

.results-icon {
  font-size: 3.5rem;
}

.score-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 8px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-num {
  font-size: 1.5rem;
  font-weight: 800;
}

.score-pct {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
}

.score-grade {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 4px;
}

.comp-bar-bg {
  width: 120px;
  height: 8px;
  background: var(--border-color);
  border-radius: 999px;
  overflow: hidden;
}

.comp-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease-out;
}

.listening-image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
}

.listening-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.listening-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--bg-hover) 0%, var(--bg-card) 100%);
  border: 2px dashed var(--border-color);
  border-radius: 8px;
}
</style>
