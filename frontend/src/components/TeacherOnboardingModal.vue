<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal onboarding-modal">
      <div class="modal-header">
        <h3>👋 Willkommen bei LearnFlow!</h3>
        <p class="text-sm text-secondary">Lass uns kurz einrichten, damit alles passt.</p>
      </div>

      <div class="modal-body">
        <div v-if="step === 1" class="onboarding-step">
          <h4 class="font-bold mb-3">Schritt 1: Wähle deine Klasse</h4>
          <div class="class-list">
            <button
              v-for="c in classes"
              :key="c.id"
              class="class-option"
              :class="{ selected: selectedClassId === c.id }"
              @click="selectedClassId = c.id"
            >
              <span class="class-emoji">🏫</span>
              <span>{{ c.name }}</span>
            </button>
          </div>
          <button v-if="classes.length === 0" class="btn-secondary btn-sm mt-2" @click="showCustomClass = true">
            ➕ Eigene Klasse erstellen
          </button>
          <div v-if="showCustomClass" class="mt-2 flex gap-2">
            <input v-model="customClassName" placeholder="Klassenname (z.B. 1A)" class="input-field" />
            <button class="btn-primary btn-sm" @click="addCustomClass">Hinzufügen</button>
          </div>
        </div>

        <div v-if="step === 2" class="onboarding-step text-center">
          <h4 class="font-bold mb-3">Schritt 2: Welche Schulstufe unterrichtest du?</h4>
          <div class="grade-options flex justify-center gap-3">
            <button
              v-for="g in [1, 2, 3, 4]"
              :key="g"
              class="grade-btn"
              :class="{ selected: selectedGrade === g }"
              @click="selectedGrade = g"
            >
              <span class="grade-num">{{ g }}</span>
              <span class="grade-label">Klasse {{ g }}</span>
            </button>
          </div>
        </div>

        <div v-if="step === 3" class="onboarding-step text-center">
          <span class="text-5xl">🎉</span>
          <h4 class="font-bold mt-3">Fertig!</h4>
          <p class="text-sm text-secondary mt-2">
            Du hast Klasse <strong>{{ selectedClassName }}</strong> und Schulstufe <strong>{{ selectedGrade }}</strong> ausgewählt.
            Du kannst diese Einstellungen jederzeit ändern.
          </p>
        </div>
      </div>

      <div class="modal-footer flex justify-between gap-3">
        <button v-if="step > 1" @click="step--" class="btn-secondary">← Zurück</button>
        <button v-else @click="$emit('skip')" class="btn-secondary">Später einrichten ⏭️</button>
        <button @click="nextStep" class="btn-primary" :disabled="!canProceed">
          {{ step < 3 ? 'Weiter ➔' : 'Los geht\'s! 🚀' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  complete: [payload: { classId: string; gradeLevel: string }]
  skip: []
}>()

const step = ref(1)
const classes = ref<any[]>([])
const selectedClassId = ref('')
const customClassName = ref('')
const showCustomClass = ref(false)
const selectedGrade = ref<number>(0)

const selectedClassName = computed(() => {
  const c = classes.value.find(x => x.id === selectedClassId.value)
  return c?.name || customClassName.value || '—'
})

const canProceed = computed(() => {
  if (step.value === 1) return selectedClassId.value !== '' || customClassName.value !== ''
  if (step.value === 2) return selectedGrade.value > 0
  return true
})

onMounted(async () => {
  try {
    const res = await fetch('/api/classes')
    if (res.ok) {
      const data = await res.json()
      classes.value = data.classes || []
    }
  } catch (_e) {}
})

function addCustomClass() {
  if (!customClassName.value.trim()) return
  selectedClassId.value = `custom_${Date.now()}`
  classes.value.push({ id: selectedClassId.value, name: customClassName.value.trim() })
  showCustomClass.value = false
}

function nextStep() {
  if (step.value < 3) {
    step.value++
  } else {
    emit('complete', {
      classId: selectedClassId.value,
      gradeLevel: String(selectedGrade.value),
    })
  }
}
</script>

<style scoped>
.onboarding-modal {
  max-width: 500px !important;
  width: calc(100% - 2rem);
}
.onboarding-step {
  padding: 1rem 0;
}
.class-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 240px;
  overflow-y: auto;
}
.class-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}
.class-option:hover {
  border-color: var(--primary);
}
.class-option.selected {
  border-color: var(--primary);
  background: var(--primary-light);
}
.class-emoji {
  font-size: 1.3rem;
}
.grade-options {
  display: flex;
  gap: 0.75rem;
}
.grade-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 1.5rem 1.25rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
}
.grade-btn:hover {
  border-color: var(--primary);
}
.grade-btn.selected {
  border-color: var(--primary);
  background: var(--primary-light);
}
.grade-num {
  font-size: 2rem;
  font-weight: 900;
  color: var(--text-main);
}
.grade-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}
.input-field {
  flex: 1;
  padding: 0.4rem 0.7rem;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-xs);
  font-size: var(--font-size-sm);
  outline: none;
}
.input-field:focus {
  border-color: var(--primary);
}
</style>
