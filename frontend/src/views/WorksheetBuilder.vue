<template>
  <div class="page">
    <div style="display: flex; justify-content: space-between; align-items: center">
      <h2>{{ isEditing ? 'Edit Worksheet' : 'New Worksheet' }}</h2>
      <div style="display: flex; gap: 0.5rem">
        <button @click="addBlock('gap_fill')">Gap Fill</button>
        <button @click="addBlock('multiple_choice')">Multiple Choice</button>
        <button @click="addBlock('single_choice')">Single Choice</button>
        <button @click="addBlock('short_answer')">Short Answer</button>
        <button @click="addBlock('matching')">Matching</button>
        <button @click="addBlock('text')">Text</button>
        <button class="btn-primary" @click="save">Save</button>
      </div>
    </div>

    <div class="card" style="margin: 1rem 0">
      <div class="form-group">
        <label>Title</label>
        <input v-model="form.title" placeholder="Worksheet title" />
      </div>
      <div style="display: flex; gap: 0.5rem">
        <div class="form-group" style="flex: 1">
          <label>Subject</label>
          <input v-model="form.subject" placeholder="Subject" />
        </div>
        <div class="form-group" style="flex: 1">
          <label>Grade Level</label>
          <input v-model="form.grade_level" placeholder="Grade" />
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea v-model="form.description" rows="2" placeholder="Description"></textarea>
      </div>
    </div>

    <div
      v-if="blocks.length === 0"
      class="card"
      style="text-align: center; color: var(--text-muted); padding: 2rem"
    >
      Click a block type above to add your first exercise
    </div>

    <div v-for="(block, idx) in blocks" :key="block.id" class="card" style="margin-bottom: 0.5rem">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        "
      >
        <strong>{{ block.type.replace(/_/g, ' ') }}</strong>
        <div style="display: flex; gap: 0.25rem">
          <label>Points:</label>
          <input v-model.number="block.points" type="number" style="width: 80px" min="0" />
          <button class="btn-sm" :disabled="idx === 0" @click="moveBlock(idx, -1)">Up</button>
          <button class="btn-sm" :disabled="idx === blocks.length - 1" @click="moveBlock(idx, 1)">
            Down
          </button>
          <button class="btn-sm btn-danger" @click="removeBlock(idx)">Remove</button>
        </div>
      </div>

      <template v-if="block.type === 'gap_fill'">
        <textarea
          v-model="block.template"
          rows="3"
          placeholder="Text with ((answer)) placeholders"
        ></textarea>
      </template>

      <template v-if="block.type === 'multiple_choice' || block.type === 'single_choice'">
        <div
          v-for="(opt, oi) in block.options || []"
          :key="oi"
          style="display: flex; gap: 0.5rem; margin-bottom: 0.25rem"
        >
          <input v-model="block.options[oi]" :placeholder="`Option ${oi + 1}`" />
          <label v-if="block.type === 'multiple_choice'">
            <input v-model="block.correct" type="checkbox" :value="oi" /> Correct
          </label>
          <label v-else> <input v-model="block.correct" type="radio" :value="oi" /> Correct </label>
          <button class="btn-sm btn-danger" @click="block.options.splice(oi, 1)">X</button>
        </div>
        <button class="btn-sm" @click="block.options = [...(block.options || []), '']">
          Add Option
        </button>
      </template>

      <template v-if="block.type === 'matching'">
        <div
          v-for="(pair, pi) in block.pairs || []"
          :key="pi"
          style="display: flex; gap: 0.5rem; margin-bottom: 0.25rem"
        >
          <input v-model="pair[0]" placeholder="Left" />
          <span>→</span>
          <input v-model="pair[1]" placeholder="Right" />
          <button class="btn-sm btn-danger" @click="block.pairs.splice(pi, 1)">X</button>
        </div>
        <button class="btn-sm" @click="block.pairs = [...(block.pairs || []), ['', '']]">
          Add Pair
        </button>
      </template>

      <template v-if="block.type === 'short_answer'">
        <div class="form-group">
          <label>Sample Answer</label>
          <input v-model="block.sample_answer" />
        </div>
        <div class="form-group">
          <label>Keywords (comma-separated)</label>
          <input v-model="block.keywordsStr" placeholder="keyword1, keyword2" />
        </div>
      </template>

      <template v-if="block.type === 'text' || block.type === 'read_aloud'">
        <textarea v-model="block.text" rows="3" placeholder="Enter text content..."></textarea>
      </template>
    </div>

    <div class="card" style="margin-top: 1rem">
      <h4>AI Generation</h4>
      <div style="display: flex; gap: 0.5rem">
        <textarea
          v-model="aiPrompt"
          rows="2"
          placeholder="Describe the worksheet you want..."
          style="flex: 1"
        ></textarea>
        <select v-model="aiProvider" style="width: 120px">
          <option value="ollama">Ollama</option>
          <option value="gemini">Gemini</option>
        </select>
        <button class="btn-primary" :disabled="aiLoading" @click="generateAI">Generate</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorksheetsStore } from '../stores/worksheets'
import { useUiStore } from '../stores/ui'

const route = useRoute()
const router = useRouter()
const store = useWorksheetsStore()
const uiStore = useUiStore()

const isEditing = ref(false)
const blocks = ref([])
const form = ref({ title: '', subject: '', grade_level: '', description: '' })
const aiPrompt = ref('')
const aiProvider = ref('ollama')
const aiLoading = ref(false)

onMounted(async () => {
  if (route.params.id) {
    isEditing.value = true
    await store.fetchWorksheet(route.params.id)
    if (store.current) {
      form.value = {
        title: store.current.title,
        subject: store.current.subject,
        grade_level: store.current.grade_level,
        description: store.current.description,
      }
      try {
        const content = JSON.parse(store.current.content)
        blocks.value = content.blocks || []
      } catch {
        blocks.value = []
      }
    }
  }
})

function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)
}

function addBlock(type) {
  const block = { id: genId(), type, points: 10 }
  if (type === 'gap_fill') block.template = ''
  if (type === 'multiple_choice' || type === 'single_choice') {
    block.options = ['', '', '']
    block.correct = type === 'single_choice' ? 0 : []
  }
  if (type === 'matching')
    block.pairs = [
      ['', ''],
      ['', ''],
    ]
  if (type === 'short_answer') {
    block.sample_answer = ''
    block.keywordsStr = ''
  }
  if (type === 'text' || type === 'read_aloud') block.text = ''
  blocks.value.push(block)
}

function removeBlock(idx) {
  blocks.value.splice(idx, 1)
}

function moveBlock(idx, delta) {
  const newIdx = idx + delta
  ;[blocks.value[idx], blocks.value[newIdx]] = [blocks.value[newIdx], blocks.value[idx]]
}

async function save() {
  const content = JSON.stringify({ blocks: blocks.value })
  const totalPoints = blocks.value.reduce((s, b) => s + (b.points || 0), 0)
  const payload = { ...form.value, content, total_points: totalPoints }

  try {
    if (isEditing.value) {
      await store.updateWorksheet(route.params.id, payload)
    } else {
      const ws = await store.createWorksheet(payload)
      router.push(`/teacher/builder/${ws.id}`)
    }
    uiStore.showToast('Saved', 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function generateAI() {
  if (!aiPrompt.value.trim()) return
  aiLoading.value = true
  try {
    const data = await store.aiGenerate(aiPrompt.value, aiProvider.value)
    blocks.value.push(...data.blocks)
    uiStore.showToast(`Generated ${data.blocks.length} blocks`, 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    aiLoading.value = false
  }
}
</script>
