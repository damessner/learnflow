<template>
  <div class="vocab-unit-container page-wide">
    <div class="flex items-center gap-3 mb-4">
      <button @click="goBack" class="btn-secondary btn-sm">← Zurück</button>
      <h2 class="text-xl font-bold">📚 {{ unitData?.theme || 'Vocabulary' }}</h2>
      <span class="badge badge-primary" v-if="unitData">Unit {{ unitData.unit }}</span>
    </div>

    <!-- Tier Selection -->
    <div v-if="!activeTier && !showFinalQuiz" class="tier-grid">
      <div class="tier-card card" :class="{ completed: completedTiers.starter }">
        <div class="tier-icon">🌱</div>
        <h3>Starter</h3>
        <p class="text-sm text-secondary">Erkennungsübungen — finde die richtige Übersetzung</p>
        <span class="tier-badge">Flashcards + Matching</span>
        <button v-if="!completedTiers.starter" @click="startTier('starter')" class="btn-primary mt-auto">Starten</button>
        <span v-else class="completed-check">✅ Abgeschlossen</span>
      </div>

      <div class="tier-card card" :class="{ completed: completedTiers.practice, locked: !completedTiers.starter }">
        <div class="tier-icon">🔥</div>
        <h3>Practice</h3>
        <p class="text-sm text-secondary">Produktionsübungen — fülle die Lücken</p>
        <span class="tier-badge">Lückentexte + Wortbank</span>
        <button v-if="completedTiers.starter && !completedTiers.practice" @click="startTier('practice')" class="btn-primary mt-auto">Starten</button>
        <span v-else-if="completedTiers.practice" class="completed-check">✅ Abgeschlossen</span>
        <span v-else class="locked-label mt-auto">🔒 Starter abschließen</span>
      </div>

      <div class="tier-card card" :class="{ completed: completedTiers.challenge, locked: !completedTiers.practice }">
        <div class="tier-icon">⚡</div>
        <h3>Challenge</h3>
        <p class="text-sm text-secondary">Schreibübungen — tippe ohne Hilfestellung</p>
        <span class="tier-badge">Texteingabe + TTS</span>
        <button v-if="completedTiers.practice && !completedTiers.challenge" @click="startTier('challenge')" class="btn-primary mt-auto">Starten</button>
        <span v-else-if="completedTiers.challenge" class="completed-check">✅ Abgeschlossen</span>
        <span v-else class="locked-label mt-auto">🔒 Practice abschließen</span>
      </div>
    </div>

    <!-- Final Quiz Button -->
    <div v-if="allTiersDone && !showFinalQuiz && !finalQuizDone" class="text-center mt-4">
      <button @click="startFinalQuiz" class="btn-success btn-lg">🧠 Final Quiz starten!</button>
    </div>
    <div v-if="finalQuizDone" class="text-center mt-4">
      <p class="text-lg font-bold mb-2">🏆 Final Quiz abgeschlossen — Note: {{ finalGrade }}</p>
      <button @click="resetAll" class="btn-danger">🔄 Zurücksetzen & neu starten</button>
    </div>

    <!-- Exercise Modal -->
    <div class="modal-overlay" v-if="activeTier">
      <div class="modal vocab-modal">
        <div class="modal-header">
          <h3>{{ tierTitle }}</h3>
          <button @click="closeTier" class="btn-icon modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <VocabFlashcard
            v-if="activeTier === 'starter' && exercisePhase === 'flashcard'"
            v-for="w in flashcardWords" :key="w.en"
            :word="w"
            class="mb-3"
          />
          <VocabMatchingExercise
            v-if="activeTier === 'starter' && exercisePhase === 'matching'"
            :words="unitWords"
            @complete="onMatchComplete"
          />
          <VocabGapFill
            v-if="activeTier === 'practice'"
            :words="unitWords"
            :wordBank="unitWords.map(w => w.en)"
            @answer="onAnswer"
            :disabled="practiceDone"
          />
          <VocabTypingExercise
            v-if="activeTier === 'challenge'"
            :words="unitWords"
            @answer="onAnswer"
            :disabled="challengeDone"
          />
          <VocabFinalQuiz
            v-if="activeTier === 'final'"
            :words="unitWords"
            @complete="onQuizComplete"
          />
          <div v-if="showTierComplete && activeTier !== 'final'" class="text-center mt-4">
            <p class="text-lg font-bold text-success">✅ {{ tierTitle }} abgeschlossen!</p>
            <button @click="closeTier" class="btn-primary mt-2">Weiter</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MORE1_VOCABULARY, type VocabUnit } from '../data/vocabularyData'
import VocabFlashcard from '../components/vocab/VocabFlashcard.vue'
import VocabMatchingExercise from '../components/vocab/VocabMatchingExercise.vue'
import VocabGapFill from '../components/vocab/VocabGapFill.vue'
import VocabTypingExercise from '../components/vocab/VocabTypingExercise.vue'
import VocabFinalQuiz from '../components/vocab/VocabFinalQuiz.vue'

const route = useRoute()
const router = useRouter()

const unitData = ref<VocabUnit | null>(null)
const activeTier = ref<string | null>(null)
const exercisePhase = ref<'flashcard' | 'matching'>('flashcard')
const showTierComplete = ref(false)
const completedTiers = ref({ starter: false, practice: false, challenge: false })
const showFinalQuiz = ref(false)
const finalQuizDone = ref(false)
const finalGrade = ref('')
const practiceDone = ref(false)
const challengeDone = ref(false)

const unitWords = computed(() => {
  if (!unitData.value) return []
  const all: { en: string; de: string; phrase?: boolean }[] = []
  for (const cat of unitData.value.categories) {
    for (const w of cat.words) all.push(w)
  }
  for (const p of unitData.value.phrases) all.push(p)
  return all
})

const flashcardWords = computed(() => unitWords.value.slice(0, 5))
const allTiersDone = computed(() => completedTiers.value.starter && completedTiers.value.practice && completedTiers.value.challenge)

const tierTitle = computed(() => {
  const map: Record<string, string> = { starter: '🌱 Starter — Erkennung', practice: '🔥 Practice — Lückentexte', challenge: '⚡ Challenge — Schreiben', final: '🧠 Final Quiz' }
  return map[activeTier.value || ''] || ''
})

onMounted(() => {
  const textbook = route.params.textbook as string
  const unit = parseInt(route.params.unit as string)
  const found = MORE1_VOCABULARY.find(u => u.unit === unit)
  if (found) unitData.value = found
})

function goBack() { router.back() }

function startTier(tier: string) {
  activeTier.value = tier
  showTierComplete.value = false
  if (tier === 'starter') exercisePhase.value = 'flashcard'
}

function closeTier() {
  activeTier.value = null
  showTierComplete.value = false
}

function onMatchComplete() {
  completedTiers.value.starter = true
  showTierComplete.value = true
}

function onAnswer() {
  // Track per-word progress via API in production
}

function startFinalQuiz() {
  activeTier.value = 'final'
  showFinalQuiz.value = true
}

function onQuizComplete(payload: { score: number; maxScore: number; grade: string; results: any[] }) {
  finalQuizDone.value = true
  finalGrade.value = payload.grade
  activeTier.value = null
  showFinalQuiz.value = false
}

function resetAll() {
  completedTiers.value = { starter: false, practice: false, challenge: false }
  finalQuizDone.value = false
  finalGrade.value = ''
}
</script>

<style scoped>
.vocab-unit-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}
.tier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
}
.tier-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  align-items: center;
  min-height: 260px;
}
.tier-card.locked {
  opacity: 0.5;
}
.tier-card.completed {
  border-color: var(--success-light);
}
.tier-icon {
  font-size: 2.5rem;
}
.tier-badge {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: var(--bg-hover);
  color: var(--text-muted);
}
.completed-check {
  color: var(--success);
  font-weight: 700;
  font-size: 0.85rem;
}
.locked-label {
  color: var(--text-muted);
  font-size: 0.85rem;
}
.vocab-modal {
  max-width: 640px !important;
  width: calc(100% - 2rem);
}
</style>
