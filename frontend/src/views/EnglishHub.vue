<template>
  <div class="english-hub page-wide">
    <div class="hub-header glass-strong flex items-center justify-between p-4 mb-4">
      <div class="flex items-center gap-3">
        <span class="text-2xl">🇬🇧</span>
        <div>
          <h2 class="text-xl font-bold">English Hub</h2>
          <p class="text-sm text-secondary">MORE! Lehrplan — Unterrichtsinhalte verwalten</p>
        </div>
      </div>
      <select v-if="classes.length > 0" v-model="selectedClass" class="class-select">
        <option value="">Alle Klassen</option>
        <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <!-- Level 1: Textbook Selector -->
    <div v-if="level === 1" class="textbook-grid">
      <div class="textbook-card card" @click="selectTextbook('more1')">
        <span class="text-3xl">📘</span>
        <h3>MORE! 1</h3>
        <p class="text-sm text-secondary">Klasse 1 (5. Schulstufe)</p>
        <span class="badge badge-success">15 Units — Vollständig</span>
      </div>
      <div class="textbook-card card disabled">
        <span class="text-3xl">📙</span>
        <h3>MORE! 2</h3>
        <p class="text-sm text-secondary">Klasse 2 (6. Schulstufe)</p>
        <span class="badge badge-warning">Coming Soon</span>
      </div>
      <div class="textbook-card card disabled">
        <span class="text-3xl">📗</span>
        <h3>MORE! 3</h3>
        <p class="text-sm text-secondary">Klasse 3 (7. Schulstufe)</p>
        <span class="badge badge-warning">Coming Soon</span>
      </div>
      <div class="textbook-card card disabled">
        <span class="text-3xl">📕</span>
        <h3>MORE! 4</h3>
        <p class="text-sm text-secondary">Klasse 4 (8. Schulstufe)</p>
        <span class="badge badge-warning">Coming Soon</span>
      </div>
    </div>

    <!-- Level 2: Unit List -->
    <div v-if="level === 2">
      <button @click="level = 1" class="btn-secondary btn-sm mb-3">← Lehrwerke</button>
      <div class="unit-grid">
        <div v-for="u in units" :key="u.unit" class="unit-card card" @click="selectedUnit = u; level = 3">
          <div class="flex items-center justify-between">
            <span class="unit-badge">Unit {{ u.unit }}</span>
            <span class="text-xs text-secondary">{{ u.theme }}</span>
          </div>
          <h4 class="mt-2">{{ u.title }}</h4>
          <div class="unit-chips mt-2 flex flex-wrap gap-1">
            <span class="chip">🔤 Grammar</span>
            <span class="chip">📚 Vocabulary</span>
            <span class="chip">✍️ Writing</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Level 3: Unit Detail -->
    <div v-if="level === 3 && selectedUnit">
      <button @click="level = 2" class="btn-secondary btn-sm mb-3">← Units</button>
      <h3 class="text-lg font-bold mb-3">{{ selectedUnit.title }}</h3>

      <div class="detail-tabs flex gap-2 mb-3">
        <button class="tab-btn" :class="{ active: detailTab === 'grammar' }" @click="detailTab = 'grammar'">🔤 Grammar</button>
        <button class="tab-btn" :class="{ active: detailTab === 'vocab' }" @click="detailTab = 'vocab'">📚 Vocabulary</button>
        <button class="tab-btn" :class="{ active: detailTab === 'writing' }" @click="detailTab = 'writing'">✍️ Writing</button>
      </div>

      <!-- Grammar Tab -->
      <div v-if="detailTab === 'grammar'" class="detail-panel">
        <div class="level-card card" v-for="lvl in ['Explorer', 'Pioneer', 'Master', 'AI Quiz']" :key="lvl">
          <div class="flex items-center justify-between">
            <span class="font-bold">{{ lvl }}</span>
            <button class="btn-secondary btn-sm" @click="viewResults(selectedUnit.unit, lvl)">📊 Ergebnisse</button>
          </div>
        </div>
      </div>

      <!-- Vocabulary Tab -->
      <div v-if="detailTab === 'vocab'" class="detail-panel">
        <div class="level-card card" v-for="tier in ['Starter 🌱', 'Practice 🔥', 'Challenge ⚡']" :key="tier">
          <div class="flex items-center justify-between">
            <span class="font-bold">{{ tier }}</span>
            <button class="btn-secondary btn-sm" @click="viewVocabResults(selectedUnit.unit, tier)">📊 Ergebnisse</button>
          </div>
        </div>
        <div class="level-card card mt-2">
          <div class="flex items-center justify-between">
            <span class="font-bold">🧠 Final Quiz</span>
            <button class="btn-secondary btn-sm" @click="viewVocabResults(selectedUnit.unit, 'final')">📊 Ergebnisse</button>
          </div>
        </div>
      </div>

      <!-- Writing Tab -->
      <div v-if="detailTab === 'writing'" class="detail-panel">
        <p class="text-sm text-secondary">✍️ Writing-Aufgaben für diese Unit werden im Writing Coach verwaltet.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const level = ref(1)
const selectedUnit = ref<any>(null)
const detailTab = ref('grammar')
const selectedClass = ref('')
const classes = ref<any[]>([])
const units = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await fetch('/api/english/more1/units')
    if (res.ok) {
      const data = await res.json()
      units.value = data.units || []
    }
  } catch (_e) {}
  try {
    const res = await fetch('/api/classes') // Assumes a /api/classes endpoint exists
    if (res.ok) {
      const data = await res.json()
      classes.value = data.classes || []
    }
  } catch (_e) {}
})

function selectTextbook(textbook: string) {
  if (textbook === 'more1') level.value = 2
}

function viewResults(unit: number, levelName: string) {
  router.push(`/teacher/english/more1/${unit}?tab=grammar`)
}

function viewVocabResults(unit: number, tier: string) {
  router.push(`/teacher/english/more1/${unit}?tab=vocab`)
}
</script>

<style scoped>
.english-hub {
  padding: 1.5rem 1rem;
  min-height: calc(100vh - 56px);
}
.hub-header {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
.class-select {
  padding: 0.4rem 0.7rem;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-xs);
  background: var(--bg-card);
  font-size: var(--font-size-sm);
}
.textbook-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}
.textbook-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
}
.textbook-card.disabled {
  opacity: 0.5;
  cursor: default;
}
.unit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
.unit-card {
  padding: 1.25rem;
  cursor: pointer;
}
.unit-badge {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--primary-dark);
  background: var(--primary-light);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
}
.chip {
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  background: var(--bg-hover);
  color: var(--text-muted);
}
.detail-tabs {
  display: flex;
  gap: 0.5rem;
}
.tab-btn {
  padding: 0.4rem 1rem;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  font-size: var(--font-size-sm);
  cursor: pointer;
  font-weight: 600;
}
.tab-btn.active {
  border-color: var(--primary);
  background: var(--primary-light);
  color: var(--primary-dark);
}
.detail-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.level-card {
  padding: 1rem;
}
</style>
