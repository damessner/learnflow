<template>
  <div class="page">
    <div style="display: flex; justify-content: space-between; align-items: center">
      <h2>{{ isEditing ? 'Edit Worksheet' : 'New Worksheet' }}</h2>
      <div style="display: flex; gap: 0.5rem">
        <button @click="addBlock('gap_fill')">Gap Fill</button>
        <button @click="addBlock('multiple_choice')">MC</button>
        <button @click="addBlock('single_choice')">SC</button>
        <button @click="addBlock('short_answer')">Short</button>
        <button @click="addBlock('matching')">Match</button>
        <button @click="addBlock('text')">Text</button>
        <button @click="addBlock('arithmetic_grid')" title="Column arithmetic">Arith</button>
        <button @click="addBlock('equation_entry')" title="Math equation">Eqn</button>
        <button @click="addBlock('fraction_input')" title="Fraction builder">Frac</button>
        <button @click="addBlock('number_line')" title="Number line">#Line</button>
        <button @click="addBlock('word_problem')" title="Word problem">Word</button>
        <button @click="addBlock('graph_plot')" title="Graph">Graph</button>
        <button @click="addBlock('geometry_shape')" title="Geometry">Geo</button>
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
          <select v-model="form.subject">
            <option value="">-- Select --</option>
            <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="form-group" style="flex: 1">
          <label>Grade Level</label>
          <select v-model="form.grade_level">
            <option value="">-- Select --</option>
            <option v-for="g in gradeLevels" :key="g" :value="g">Grade {{ g }}</option>
          </select>
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

      <template v-if="block.type === 'number_line'">
        <div style="display:flex;gap:0.5rem">
          <input v-model.number="block.min_value" type="number" placeholder="Min" style="width:80px" />
          <input v-model.number="block.max_value" type="number" placeholder="Max" style="width:80px" />
          <input v-model="block.markers[0]" type="number" placeholder="Correct value" style="width:100px" />
        </div>
      </template>

      <template v-if="block.type === 'equation_entry'">
        <input v-model="block.equation" placeholder="Equation (e.g. 3*x + 5 = 14)" />
        <input v-model="block.final_answer" placeholder="Expected answer" style="margin-top:0.25rem" />
      </template>

      <template v-if="block.type === 'fraction_input'">
        <div style="display:flex;gap:0.5rem">
          <input v-model.number="block.numerator" type="number" placeholder="Numerator" style="width:100px" />
          <span>/</span>
          <input v-model.number="block.denominator" type="number" placeholder="Denominator" style="width:100px" />
        </div>
      </template>

      <template v-if="block.type === 'arithmetic_grid'">
        <div style="display:flex;gap:0.5rem">
          <input v-model.number="block.operand1" type="number" placeholder="Operand 1" style="width:100px" />
          <select v-model="block.operation" style="width:80px">
            <option value="add">+</option>
            <option value="subtract">-</option>
            <option value="multiply">x</option>
            <option value="divide">/</option>
          </select>
          <input v-model.number="block.operand2" type="number" placeholder="Operand 2" style="width:100px" />
        </div>
      </template>

      <template v-if="block.type === 'graph_plot'">
        <p style="font-size:0.8rem">Points to plot (x,y pairs in [[x,y],[x,y]] format):</p>
        <textarea v-model="block.pointsStr" rows="2" placeholder="[[1,2],[3,4]]" @blur="tryParsePoints(block)"></textarea>
      </template>

      <template v-if="block.type === 'geometry_shape'">
        <select v-model="block.shape_type">
          <option value="triangle">Triangle</option>
          <option value="square">Square</option>
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
        </select>
      </template>

      <template v-if="block.type === 'word_problem'">
        <textarea v-model="block.problem_text" rows="2" placeholder="Problem description..."></textarea>
        <div v-for="(step, si) in (block.steps || [])" :key="si" style="display:flex;gap:0.25rem;margin-top:0.25rem">
          <input v-model="step.description" placeholder="Step description" style="flex:1" />
          <input v-model="step.expected" placeholder="Expected answer" style="flex:1" />
          <button class="btn-sm btn-danger" @click="block.steps.splice(si, 1)">X</button>
        </div>
        <button class="btn-sm" @click="block.steps = [...(block.steps||[]), { description: '', expected: '' }]" style="margin-top:0.25rem">Add Step</button>
        <input v-model="block.final_answer" placeholder="Final answer" style="margin-top:0.25rem" />
      </template>

      <details style="margin-top: 0.5rem; font-size: 0.85rem">
        <summary>+ Dual Coding (Mermaid Diagram)</summary>
        <textarea
          v-model="block.mermaid"
          rows="4"
          placeholder="graph TD; A[Concept] --> B[Outcome]; ..."
          style="font-family: monospace; font-size: 0.8rem; margin-top: 0.25rem"
        ></textarea>
        <input
          v-model="block.alt_text"
          placeholder="Alt text for accessibility"
          style="margin-top: 0.25rem"
        />
      </details>
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
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorksheetsStore } from '../stores/worksheets'
import { useUiStore } from '../stores/ui'
import { api } from '../services/api'

const route = useRoute()
const router = useRouter()
const store = useWorksheetsStore()
const uiStore = useUiStore()

const emptyForm = () => ({ title: '', subject: '', grade_level: '', description: '' })

const isEditing = ref(false)
const blocks = ref([])
const form = ref(emptyForm())
const subjects = ref([])
const gradeLevels = ref([])
const aiPrompt = ref('')
const aiProvider = ref('ollama')
const aiLoading = ref(false)

function getRouteWorksheetId() {
  if (!route.params.id) return null
  return Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
}

function mapLoadedBlocks(rawBlocks) {
  return (rawBlocks || []).map((block) => {
    const loaded = { ...block }
    if (loaded.type === 'short_answer') {
      loaded.keywordsStr = loaded.keywords ? loaded.keywords.join(', ') : ''
    }
    if (loaded.type === 'graph_plot') {
      loaded.pointsStr = JSON.stringify(loaded.points_to_plot || [])
    }
    if (loaded.type === 'number_line') {
      loaded.min_value = loaded.min_value ?? 0
      loaded.max_value = loaded.max_value ?? 100
      loaded.markers = loaded.markers ?? [50]
    }
    if (loaded.type === 'equation_entry') {
      loaded.equation = loaded.equation || ''
      loaded.final_answer = loaded.final_answer || ''
    }
    if (loaded.type === 'fraction_input') {
      loaded.numerator = loaded.numerator ?? 1
      loaded.denominator = loaded.denominator ?? 2
    }
    if (loaded.type === 'arithmetic_grid') {
      loaded.operand1 = loaded.operand1 ?? 0
      loaded.operand2 = loaded.operand2 ?? 0
      loaded.operation = loaded.operation || 'add'
    }
    if (loaded.type === 'geometry_shape') {
      loaded.shape_type = loaded.shape_type || 'triangle'
    }
    if (loaded.type === 'word_problem') {
      loaded.problem_text = loaded.problem_text || ''
      loaded.steps = loaded.steps || [{ description: '', expected: '' }]
      loaded.final_answer = loaded.final_answer || ''
    }
    if (loaded.type === 'matching') {
      loaded.pairs = loaded.pairs || [['', ''], ['', '']]
    }
    if (loaded.type === 'multiple_choice' || loaded.type === 'single_choice') {
      loaded.options = loaded.options || ['', '', '']
      if (loaded.type === 'single_choice') loaded.correct = loaded.correct ?? 0
      else loaded.correct = loaded.correct || []
    }
    return loaded
  })
}

async function syncBuilderToRoute() {
  const worksheetId = getRouteWorksheetId()
  if (!worksheetId) {
    isEditing.value = false
    form.value = emptyForm()
    blocks.value = []
    return
  }

  isEditing.value = true
  try {
    await store.fetchWorksheet(worksheetId)
    if (!store.current) {
      form.value = emptyForm()
      blocks.value = []
      isEditing.value = false
      return
    }

    form.value = {
      title: store.current.title || '',
      subject: store.current.subject || '',
      grade_level: store.current.grade_level || '',
      description: store.current.description || '',
    }

    try {
      const content = JSON.parse(store.current.content || '{}')
      blocks.value = mapLoadedBlocks(content.blocks)
    } catch {
      blocks.value = []
    }
  } catch {
    uiStore.showToast('Failed to load worksheet', 'error')
    isEditing.value = false
    form.value = emptyForm()
    blocks.value = []
  }
}

onMounted(async () => {
  try {
    const [subData, gradeData] = await Promise.all([
      api.get('/worksheets/subjects'),
      api.get('/worksheets/grade-levels'),
    ])
    subjects.value = subData.subjects || []
    gradeLevels.value = gradeData.gradeLevels || []
  } catch { /* */ }
})

watch(() => route.params.id, syncBuilderToRoute, { immediate: true })

function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)
}

function tryParsePoints(block) {
  try { block.points_to_plot = JSON.parse(block.pointsStr) } catch { /* */ }
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
  if (type === 'number_line') { block.min_value = 0; block.max_value = 100; block.markers = [50] }
  if (type === 'equation_entry') { block.equation = ''; block.final_answer = '' }
  if (type === 'fraction_input') { block.numerator = 1; block.denominator = 2 }
  if (type === 'arithmetic_grid') { block.operand1 = 23; block.operand2 = 15; block.operation = 'add' }
  if (type === 'graph_plot') {
    block.points_to_plot = [[0, 0]]
    block.pointsStr = '[[0,0]]'
  }
  if (type === 'geometry_shape') { block.shape_type = 'triangle' }
  if (type === 'word_problem') { block.problem_text = ''; block.steps = [{ description: '', expected: '' }]; block.final_answer = '' }
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
  const worksheetId = getRouteWorksheetId()
  const mappedBlocks = blocks.value.map((b) => {
    const copy = { ...b }
    if (copy.type === 'short_answer') {
      copy.keywords = (copy.keywordsStr || '')
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
    }
    return copy
  })
  const content = JSON.stringify({ blocks: mappedBlocks })
  const totalPoints = blocks.value.reduce((s, b) => s + (b.points || 0), 0)
  const payload = { ...form.value, content, total_points: totalPoints }

  try {
    if (isEditing.value && worksheetId) {
      await store.updateWorksheet(worksheetId, payload)
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
    blocks.value.push(...mapLoadedBlocks(data.blocks))
    uiStore.showToast(`Generated ${data.blocks.length} blocks`, 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    aiLoading.value = false
  }
}
</script>
