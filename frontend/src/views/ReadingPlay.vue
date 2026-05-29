<template>
  <div class="reading-play-container page-wide">
    <!-- Header -->
    <div class="reading-header flex justify-between items-center mb-4">
      <div class="flex items-center gap-3">
        <button @click="goBack" class="btn-secondary btn-sm">← Zurück</button>
        <div>
          <h2 class="text-xl font-bold flex items-center gap-2">
            <span>📖</span> {{ story?.title || 'Reading Exercise' }}
          </h2>
          <p class="text-xs text-secondary">
            Unit {{ unit }} • Level: <span class="badge" :class="tierClass">{{ story?.tier }}</span>
          </p>
        </div>
      </div>
      <div class="progress-indicator" v-if="story && !completed">
        Question {{ currentQuestionIdx + 1 }} of {{ story.questions.length }}
      </div>
    </div>

    <!-- Main View: Loading / Error / Game / Results -->
    <div v-if="loading" class="text-center py-6">
      <div class="loading-spinner"></div>
      <p class="text-secondary mt-2">Loading reading exercise...</p>
    </div>

    <div v-else-if="error" class="card text-center py-6 text-danger">
      <p class="font-bold text-lg">⚠️ Error</p>
      <p class="text-sm mt-1">{{ error }}</p>
      <button @click="goBack" class="btn-secondary mt-3">Go Back</button>
    </div>

    <div v-else-if="completed" class="results-card card fade-in text-center">
      <div class="results-icon">🏆</div>
      <h3 class="text-2xl font-bold">Exercise Completed!</h3>
      <p class="text-secondary mb-4">Well done! You finished the reading quiz.</p>

      <!-- Score Circle -->
      <div class="score-circle-container flex justify-center mb-6">
        <div class="score-circle" :style="{ borderColor: gradeColor }">
          <span class="score-num">{{ score }} / {{ story?.questions.length }}</span>
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

    <div v-else-if="story" class="game-grid grid grid-cols-2 gap-4">
      <!-- Left side: Story Panel -->
      <div class="story-panel card flex flex-col">
        <!-- Panel Tabs -->
        <div class="panel-tabs flex border-bottom mb-3">
          <button 
            class="panel-tab-btn" 
            :class="{ active: activeLeftTab === 'story' }"
            @click="activeLeftTab = 'story'"
          >
            📄 Story Text
          </button>
          <button 
            class="panel-tab-btn" 
            :class="{ active: activeLeftTab === 'vocab' }"
            @click="activeLeftTab = 'vocab'"
          >
            💡 Vocabulary Helper
          </button>
        </div>

        <div v-if="activeLeftTab === 'story'" class="flex-1 flex flex-col gap-4">
          <!-- Image -->
          <div class="story-image-container relative">
            <img 
              v-if="hasImage" 
              :src="story.imagePath" 
              @error="onImageError" 
              class="story-image" 
              alt="Story illustration"
            />
            <div v-else class="story-image-placeholder flex flex-col items-center justify-center">
              <span class="text-4xl mb-2">🇬🇧📖</span>
              <p class="text-xs font-bold text-muted">Reading Story Illustration</p>
              <p class="text-[10px] text-muted opacity-70">Placeholder: {{ story.imagePath.split('/').pop() }}</p>
            </div>
          </div>

          <!-- Highlighted Text -->
          <div class="story-text-container leading-relaxed">
            <p v-html="highlightedText"></p>
          </div>
        </div>

        <div v-else class="vocab-tab-panel flex-1">
          <p class="text-sm text-secondary mb-3">Learn these key vocabulary words to understand the story better:</p>
          <div class="vocab-words-list flex flex-col gap-2">
            <div v-for="word in story.vocabWords" :key="word.en" class="vocab-word-row flex justify-between p-3 rounded-lg bg-hover">
              <span class="font-bold text-primary-dark">{{ word.en }}</span>
              <span class="text-secondary font-medium">{{ word.de }}</span>
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
                {{ currentQuestionIdx + 1 === story.questions.length ? 'Show Results' : 'Next Question' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Word Hover tooltip modal -->
    <div v-if="activeTooltip" class="vocab-tooltip-overlay" @click="activeTooltip = null">
      <div class="vocab-tooltip card p-3 fade-in" :style="tooltipStyle">
        <h4 class="font-bold text-primary">{{ activeTooltip.en }}</h4>
        <p class="text-sm text-secondary">{{ activeTooltip.de }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getReadingStory, type ReadingStory, type ReadingQuestion } from '../data/readingData'
import { getSupplementStory } from '../data/readingDataSupplement'
import { api } from '../services/api'

const route = useRoute()
const router = useRouter()

const textbook = route.params.textbook as string
const unit = parseInt(route.params.unit as string)
const storyId = route.params.storyId as string

const loading = ref(true)
const error = ref<string | null>(null)
const story = ref<ReadingStory | null>(null)

// Game states
const currentQuestionIdx = ref(0)
const selectedOptionIdx = ref<number | null>(null)
const hasAnswered = ref(false)
const score = ref(0)
const completed = ref(false)
const userAnswers = ref<number[]>([])

// Panel states
const activeLeftTab = ref<'story' | 'vocab'>('story')
const hasImage = ref(true)

// Word Translation Tooltip state
const activeTooltip = ref<{ en: string; de: string } | null>(null)
const tooltipStyle = ref({ top: '0px', left: '0px' })

onMounted(async () => {
  try {
    const found = getReadingStory(unit, storyId) || getSupplementStory(unit, storyId)
    if (!found) {
      error.value = `Story not found for Unit ${unit}`
      loading.value = false
      return
    }
    story.value = found
    loading.value = false
  } catch (err: any) {
    error.value = 'Failed to load reading data.'
    loading.value = false
  }
})

// Highlight vocab words in text
const highlightedText = computed(() => {
  if (!story.value) return ''
  let txt = story.value.text
  
  // Highlight each vocabulary word in the text with a click event
  story.value.vocabWords.forEach((word) => {
    // Case insensitive regex boundary check
    const regex = new RegExp(`\\b(${word.en})\\b`, 'gi')
    txt = txt.replace(regex, (match) => {
      return `<span class="vocab-highlight cursor-pointer underline decoration-dotted decoration-primary font-semibold text-primary" data-en="${word.en}" data-de="${word.de}">${match}</span>`
    })
  })

  return txt
})

// Capture clicks on the text container to trigger translations
onMounted(() => {
  document.addEventListener('click', handleTextClick)
})

function handleTextClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target && target.classList.contains('vocab-highlight')) {
    const en = target.getAttribute('data-en') || ''
    const de = target.getAttribute('data-de') || ''
    activeTooltip.value = { en, de }
    
    // Position tooltip near the word click
    const rect = target.getBoundingClientRect()
    tooltipStyle.value = {
      top: `${rect.bottom + window.scrollY + 8}px`,
      left: `${Math.min(rect.left + window.scrollX, window.innerWidth - 220)}px`
    }
    e.stopPropagation()
  }
}

const currentQuestion = computed(() => {
  if (!story.value) return null
  return story.value.questions[currentQuestionIdx.value]
})

const progressPercent = computed(() => {
  if (!story.value) return 0
  return (currentQuestionIdx.value / story.value.questions.length) * 100
})

const isCorrect = computed(() => {
  if (!currentQuestion.value) return false
  return selectedOptionIdx.value === currentQuestion.value.correctIndex
})

// Score percentage
const percentage = computed(() => {
  if (!story.value) return 0
  return Math.round((score.value / story.value.questions.length) * 100)
})

// Competence areas breakdown
const competenceStats = computed(() => {
  if (!story.value) return {}
  const stats: Record<string, { total: number; correct: number; pct: number }> = {}
  
  story.value.questions.forEach((q, idx) => {
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

// Letter Grade mapping
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
  if (g === 'A') return '#10b981' // emerald
  if (g === 'B') return '#3b82f6' // blue
  if (g === 'C') return '#f59e0b' // amber
  if (g === 'D') return '#f97316' // orange
  return '#ef4444' // red
})

const tierClass = computed(() => {
  const tier = story.value?.tier
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

function onImageError() {
  hasImage.value = false
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
  if (!story.value) return
  
  if (currentQuestionIdx.value + 1 < story.value.questions.length) {
    currentQuestionIdx.value++
    selectedOptionIdx.value = null
    hasAnswered.value = false
  } else {
    // Finished all questions! Save to DB
    completed.value = true
    try {
      await api.post('/english/reading/complete', {
        textbook,
        unit,
        storyId,
        score: score.value,
        maxScore: story.value.questions.length
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
  activeLeftTab.value = 'story'
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.reading-play-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.game-grid {
  min-height: 520px;
}

.story-panel {
  max-height: 620px;
  overflow-y: auto;
}

.story-image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
}

.story-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--bg-hover) 0%, var(--bg-card) 100%);
  border: 2px dashed var(--border-color);
  border-radius: 8px;
}

.story-text-container {
  font-size: 1.05rem;
  line-height: 1.7;
}

.panel-tab-btn {
  padding: 0.5rem 1rem;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.panel-tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.vocab-highlight {
  transition: background-color 0.2s ease;
}

.vocab-highlight:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.vocab-tooltip-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

.vocab-tooltip {
  position: absolute;
  min-width: 180px;
  max-width: 260px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  z-index: 1000;
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
</style>
