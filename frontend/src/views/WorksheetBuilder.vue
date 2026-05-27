<template>
  <div class="page" style="padding-left: 0">
    <div style="display: flex; gap: 1.5rem">
      <div class="builder-sidebar">
        <!-- AI Generator — always visible at top -->
        <h3
          style="
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
          "
        >
          🤖 AI Generator
        </h3>
        <textarea
          v-model="aiPrompt"
          rows="3"
          placeholder="Describe the worksheet..."
          style="font-size: 0.75rem; margin-bottom: 0.35rem"
        ></textarea>
        <textarea
          v-model="aiLernziele"
          rows="2"
          placeholder="Lernziele (optional)"
          style="font-size: 0.7rem; margin-bottom: 0.35rem"
        ></textarea>
        <div style="display: flex; gap: 0.25rem; margin-bottom: 0.35rem; flex-wrap: wrap">
          <select v-model="aiStyle" style="font-size: 0.65rem; padding: 0.2rem; flex: 1; min-width: 60px">
            <option value="practice">Practice</option>
            <option value="test">Test</option>
            <option value="revision">Revision</option>
            <option value="challenge">Challenge</option>
          </select>
          <select v-model="aiDifficulty" style="font-size: 0.65rem; padding: 0.2rem; flex: 1; min-width: 50px">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select v-model="aiLength" style="font-size: 0.65rem; padding: 0.2rem; flex: 1; min-width: 50px">
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
          <select v-model="aiProvider" style="font-size: 0.65rem; padding: 0.2rem; flex: 1; min-width: 60px">
            <option value="opencode">OpenCode</option>
            <option value="ollama">Ollama</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
        <button
          class="btn-primary"
          :disabled="aiLoading"
          @click="sidebarGenerate()"
          style="width: 100%; font-size: 0.75rem; padding: 0.35rem"
        >
          {{ aiLoading ? 'Generating...' : 'Generate' }}
        </button>

        <div style="margin: 0.75rem 0; border-top: 1px solid var(--border-color)"></div>

        <!-- Info Box -->
        <button class="sidebar-btn" @click="addBlock('info_box')">
          <span style="font-size: 1.1rem">💡</span> Info Box
        </button>

        <div style="margin: 0.5rem 0; border-top: 1px solid var(--border-color)"></div>

        <!-- Blocks -->
        <h3
          style="
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
          "
        >
          Blocks
        </h3>

        <button class="sidebar-btn" @click="addBlock('text')">
          <span style="font-size: 1.1rem">📄</span> Text
        </button>
        <button class="sidebar-btn" @click="addBlock('gap_fill')">
          <span style="font-size: 1.1rem">✏️</span> Gap
        </button>
        <button class="sidebar-btn" @click="addBlock('multiple_choice')">
          <span style="font-size: 1.1rem">✅</span> MC
        </button>
        <button class="sidebar-btn" @click="addBlock('single_choice')">
          <span style="font-size: 1.1rem">☑️</span> SC
        </button>
        <button class="sidebar-btn" @click="addBlock('short_answer')">
          <span style="font-size: 1.1rem">📝</span> Short
        </button>
        <button class="sidebar-btn" @click="addBlock('matching')">
          <span style="font-size: 1.1rem">🔗</span> Match
        </button>
        <button class="sidebar-btn" @click="addBlock('word_scramble')">
          <span style="font-size: 1.1rem">🔤</span> Scramble
        </button>
        <button class="sidebar-btn" @click="addBlock('read_aloud')">
          <span style="font-size: 1.1rem">🔊</span> Read
        </button>

        <div style="margin: 0.5rem 0; border-top: 1px solid var(--border-color)"></div>
        <h3
          style="
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
          "
        >
          Math
        </h3>

        <button class="sidebar-btn" @click="addBlock('arithmetic_grid')">
          <span style="font-size: 1.1rem">➕</span> Arith
        </button>
        <button class="sidebar-btn" @click="addBlock('equation_entry')">
          <span style="font-size: 1.1rem">📐</span> Eqn
        </button>
        <button class="sidebar-btn" @click="addBlock('fraction_input')">
          <span style="font-size: 1.1rem">🧮</span> Frac
        </button>
        <button class="sidebar-btn" @click="addBlock('number_line')">
          <span style="font-size: 1.1rem">📏</span> #Line
        </button>
        <button class="sidebar-btn" @click="addBlock('word_problem')">
          <span style="font-size: 1.1rem">📖</span> Word
        </button>
        <button class="sidebar-btn" @click="addBlock('graph_plot')">
          <span style="font-size: 1.1rem">📊</span> Graph
        </button>
        <button class="sidebar-btn" @click="addBlock('geometry_shape')">
          <span style="font-size: 1.1rem">🔷</span> Geo
        </button>

        <div style="margin: 0.5rem 0; border-top: 1px solid var(--border-color)"></div>
        <h3
          style="
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
          "
        >
          Media
        </h3>

        <button class="sidebar-btn" @click="addBlock('media')">
          <span style="font-size: 1.1rem">🖼️</span> Image
        </button>
        <button class="sidebar-btn" @click="addBlock('audio')">
          <span style="font-size: 1.1rem">🎵</span> Audio
        </button>
        <button class="sidebar-btn" @click="addBlock('video')">
          <span style="font-size: 1.1rem">🎬</span> Video
        </button>
        <button class="sidebar-btn" @click="addBlock('youtube')">
          <span style="font-size: 1.1rem">📺</span> YouTube
        </button>

      </div>

      <div style="flex: 1; min-width: 0">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          "
        >
          <h2 style="margin: 0">{{ isEditing ? 'Edit Worksheet' : 'New Worksheet' }}</h2>
          <button class="btn-primary" @click="save">Save</button>
        </div>

        <div class="card" style="margin-bottom: 1rem">
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
          style="text-align: center; color: var(--text-muted); padding: 3rem"
        >
          <div style="font-size: 3rem; margin-bottom: 0.5rem; opacity: 0.3">📝</div>
          <p>Add exercise blocks from the sidebar to start building your worksheet</p>
        </div>

        <div
          v-for="(block, idx) in blocks"
          :key="block.id"
          class="card"
          style="margin-bottom: 0.75rem"
        >
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 0.75rem;
            "
          >
            <strong
              >{{ blockIcons[block.type] || '📄' }} {{ block.type.replace(/_/g, ' ') }}</strong
            >
            <div style="display: flex; gap: 0.25rem; align-items: center">
              <label style="font-size: 0.8rem; margin: 0">Pts:</label>
              <input v-model.number="block.points" type="number" style="width: 60px" min="0" />
              <button class="btn-sm" :disabled="idx === 0" @click="moveBlock(idx, -1)">↑</button>
              <button
                class="btn-sm"
                :disabled="idx === blocks.length - 1"
                @click="moveBlock(idx, 1)"
              >
                ↓
              </button>
              <button class="btn-sm btn-danger" @click="removeBlock(idx)">×</button>
            </div>
          </div>
            <div style="display:flex;gap:0.25rem;margin-top:0.25rem">
              <button class="btn-sm" style="font-size:0.65rem;padding:0.15rem 0.4rem" @click="regenerateBlock(idx)" :disabled="aiLoading" title="Regenerate this block with AI">🔄 AI Regenerate</button>
              <button class="btn-sm" style="font-size:0.65rem;padding:0.15rem 0.4rem" @click="regenerateBlockWithInstruction(idx, 'easier')" :disabled="aiLoading" title="Make this easier">🔽 Easier</button>
              <button class="btn-sm" style="font-size:0.65rem;padding:0.15rem 0.4rem" @click="regenerateBlockWithInstruction(idx, 'harder')" :disabled="aiLoading" title="Make this harder">🔼 Harder</button>
            </div>

          <div class="form-group" v-if="block.type !== 'text' && block.type !== 'read_aloud'">
            <textarea
              v-model="block.text"
              rows="2"
              :placeholder="'Write your question for this ' + block.type.replace(/_/g, ' ') + '...'"
            ></textarea>
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
              style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem"
            >
              <input
                v-if="block.type === 'multiple_choice'"
                v-model="block.correct"
                type="checkbox"
                :value="oi"
                style="width: auto; flex-shrink: 0"
              />
              <input
                v-else
                v-model="block.correct"
                type="radio"
                :value="oi"
                name="correct"
                style="width: auto; flex-shrink: 0"
              />
              <input
                v-model="block.options[oi]"
                :placeholder="`Option ${oi + 1}`"
                style="flex: 1"
              />
              <button class="btn-sm btn-danger" @click="block.options.splice(oi, 1)">×</button>
            </div>
            <button class="btn-sm" @click="block.options = [...(block.options || []), '']">
              + Option
            </button>
          </template>

          <template v-if="block.type === 'matching'">
            <div
              v-for="(pair, pi) in block.pairs || []"
              :key="pi"
              style="display: flex; gap: 0.5rem; margin-bottom: 0.25rem"
            >
              <input v-model="pair[0]" placeholder="Left" style="flex: 1" />
              <span style="color: var(--text-muted)">→</span>
              <input v-model="pair[1]" placeholder="Right" style="flex: 1" />
              <button class="btn-sm btn-danger" @click="block.pairs.splice(pi, 1)">×</button>
            </div>
            <button class="btn-sm" @click="block.pairs = [...(block.pairs || []), ['', '']]">
              + Pair
            </button>
          </template>

          <template v-if="block.type === 'short_answer'">
            <div class="form-group">
              <label>Keywords (comma-separated)</label>
              <input v-model="block.keywordsStr" placeholder="keyword1, keyword2" />
            </div>
          </template>

          <template v-if="block.type === 'text' || block.type === 'read_aloud'">
            <textarea v-model="block.text" rows="3" placeholder="Enter text content..."></textarea>
          </template>

          <template v-if="block.type === 'info_box'">
            <input v-model="block.title" placeholder="Clickable headline (e.g. 'Did you know?')" style="font-weight:600;margin-bottom:0.35rem" />
            <textarea v-model="block.text" rows="3" placeholder="Info content shown when clicked..." style="margin-bottom:0.35rem"></textarea>
            <input v-model="block.mermaid" placeholder="Mermaid.js diagram code (optional)" style="font-size:0.7rem;margin-bottom:0.25rem" />
            <input v-model="block.alt_text" placeholder="Alt text for diagram (optional)" style="font-size:0.7rem" />
          </template>

          <template v-if="block.type === 'word_scramble'">
            <label
              style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.25rem;
                font-size: 0.8rem;
              "
            >
              <input type="checkbox" v-model="block.sentence_mode" /> Sentence mode (scramble word
              order)
            </label>
            <div
              v-for="(w, wi) in block.words || []"
              :key="wi"
              style="display: flex; gap: 0.25rem; margin-bottom: 0.25rem"
            >
              <input
                v-model="block.words[wi].word"
                :placeholder="block.sentence_mode ? 'Sentence' : 'Word'"
                style="flex: 1"
              />
              <button class="btn-sm btn-danger" @click="block.words.splice(wi, 1)">×</button>
            </div>
            <button class="btn-sm" @click="block.words = [...(block.words || []), { word: '' }]">
              + {{ block.sentence_mode ? 'Sentence' : 'Word' }}
            </button>
          </template>

          <template v-if="block.type === 'number_line'">
            <div style="display: flex; gap: 0.5rem">
              <input v-model.number="block.min_value" type="number" placeholder="Min" />
              <input v-model.number="block.max_value" type="number" placeholder="Max" />
              <input v-model="block.markers[0]" type="number" placeholder="Correct value" />
            </div>
          </template>

          <template v-if="block.type === 'equation_entry'">
            <input v-model="block.equation" placeholder="Equation (e.g. 3*x + 5 = 14)" />
            <input
              v-model="block.final_answer"
              placeholder="Expected answer"
              style="margin-top: 0.25rem"
            />
          </template>

          <template v-if="block.type === 'fraction_input'">
            <div style="display: flex; gap: 0.5rem; align-items: center">
              <input
                v-model.number="block.numerator"
                type="number"
                placeholder="Num"
                style="width: 80px"
              />
              <span>/</span>
              <input
                v-model.number="block.denominator"
                type="number"
                placeholder="Den"
                style="width: 80px"
              />
            </div>
          </template>

          <template v-if="block.type === 'arithmetic_grid'">
            <div style="display: flex; gap: 0.5rem; align-items: center">
              <input
                v-model.number="block.operand1"
                type="number"
                placeholder="A"
                style="width: 80px"
              />
              <select v-model="block.operation" style="width: 60px">
                <option value="add">+</option>
                <option value="subtract">−</option>
                <option value="multiply">×</option>
                <option value="divide">÷</option>
              </select>
              <input
                v-model.number="block.operand2"
                type="number"
                placeholder="B"
                style="width: 80px"
              />
            </div>
          </template>

          <template v-if="block.type === 'graph_plot'">
            <textarea
              v-model="block.pointsStr"
              rows="2"
              placeholder="[[x,y],[x,y]]"
              @blur="tryParsePoints(block)"
            ></textarea>
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
            <textarea
              v-model="block.problem_text"
              rows="2"
              placeholder="Problem description..."
            ></textarea>
            <div
              v-for="(step, si) in block.steps || []"
              :key="si"
              style="display: flex; gap: 0.25rem; margin-top: 0.25rem"
            >
              <input v-model="step.description" placeholder="Step" style="flex: 1" />
              <input v-model="step.expected" placeholder="Expected" style="flex: 1" />
              <button class="btn-sm btn-danger" @click="block.steps.splice(si, 1)">×</button>
            </div>
            <button
              class="btn-sm"
              @click="block.steps = [...(block.steps || []), { description: '', expected: '' }]"
              style="margin-top: 0.25rem"
            >
              + Step
            </button>
            <input
              v-model="block.final_answer"
              placeholder="Final answer"
              style="margin-top: 0.25rem"
            />
          </template>

          <template
            v-if="block.type === 'media' || block.type === 'audio' || block.type === 'video'"
          >
            <div style="display: flex; gap: 0.5rem; align-items: center">
              <input
                v-model="block.src"
                :placeholder="
                  block.type === 'media'
                    ? 'Image URL'
                    : block.type === 'audio'
                      ? 'Audio URL (.mp3)'
                      : 'Video URL (.mp4)'
                "
                style="flex: 1"
              />
              <label class="btn-sm" style="cursor: pointer; margin: 0; white-space: nowrap">
                Upload
                <input
                  type="file"
                  :accept="
                    block.type === 'media'
                      ? 'image/*'
                      : block.type === 'audio'
                        ? 'audio/*'
                        : 'video/*'
                  "
                  style="display: none"
                  @change="uploadFile($event, block)"
                />
              </label>
            </div>
            <input
              v-model="block.caption"
              placeholder="Caption (optional)"
              style="margin-top: 0.25rem"
            />
            <div v-if="block.src" style="margin-top: 0.5rem">
              <img
                v-if="block.type === 'media'"
                :src="block.src"
                style="max-width: 100%; max-height: 200px; border-radius: 4px"
              />
              <audio
                v-else-if="block.type === 'audio'"
                :src="block.src"
                controls
                style="width: 100%"
              ></audio>
              <video
                v-else
                :src="block.src"
                controls
                style="max-width: 100%; max-height: 200px; border-radius: 4px"
              ></video>
            </div>
          </template>

          <template v-if="block.type === 'youtube'">
            <input
              v-model="block.src"
              placeholder="YouTube URL (e.g. https://youtube.com/watch?v=...)"
            />
            <div
              v-if="block.src && isYoutube(block.src)"
              style="margin-top: 0.5rem; position: relative; padding-bottom: 56.25%; height: 0"
            >
              <iframe
                :src="youtubeEmbed(block.src)"
                style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  border-radius: 4px;
                "
                frameborder="0"
                allowfullscreen
              ></iframe>
            </div>
          </template>

          <details style="margin-top: 0.75rem; font-size: 0.8rem">
            <summary>+ Mermaid Diagram</summary>
            <textarea
              v-model="block.mermaid"
              rows="3"
              placeholder="graph TD; A[Concept] --> B[Outcome]"
              style="font-family: monospace; font-size: 0.75rem; margin-top: 0.25rem"
            ></textarea>
            <input v-model="block.alt_text" placeholder="Alt text" style="margin-top: 0.25rem" />
          </details>
        </div>
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
const aiLernziele = ref('')
const aiDifficulty = ref('medium')
const aiLength = ref('medium')
const aiProvider = ref('ollama')
const aiStyle = ref('practice')
const aiLoading = ref(false)

const blockIcons = {
  text: '📄',
  read_aloud: '🔊',
  gap_fill: '✏️',
  multiple_choice: '✅',
  single_choice: '☑️',
  short_answer: '📝',
  matching: '🔗',
  word_scramble: '🔤',
  arithmetic_grid: '➕',
  equation_entry: '📐',
  fraction_input: '🧮',
  number_line: '📏',
  word_problem: '📖',
  graph_plot: '📊',
  geometry_shape: '🔷',
  media: '🖼️',
  audio: '🎵',
  video: '🎬',
  youtube: '📺',
}

function getRouteWorksheetId() {
  if (!route.params.id) return null
  return Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
}

function mapLoadedBlocks(rawBlocks) {
  return (rawBlocks || []).map((block) => {
    const loaded = { ...block }
    loaded.text = loaded.text || ''
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
      loaded.pairs = loaded.pairs || [
        ['', ''],
        ['', ''],
      ]
    }
    if (loaded.type === 'multiple_choice' || loaded.type === 'single_choice') {
      loaded.options = loaded.options || ['', '', '']
      loaded.correct =
        loaded.type === 'single_choice' ? (loaded.correct ?? 0) : loaded.correct || []
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
    resetBuilder()
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
  } catch {
    /* */
  }
  await syncBuilderToRoute()
})

watch(
  () => route.fullPath,
  () => {
    syncBuilderToRoute()
  },
)

function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)
}

function tryParsePoints(block) {
  try {
    block.points_to_plot = JSON.parse(block.pointsStr)
  } catch {
    /* */
  }
}

function addBlock(type) {
  const block = {
    id: genId(),
    type,
    points:
      type === 'media' ||
      type === 'audio' ||
      type === 'video' ||
      type === 'youtube' ||
      type === 'text' ||
      type === 'read_aloud'
        ? 0
        : 10,
    text: '',
  }
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
  if (type === 'word_scramble') block.words = [{ word: '' }, { word: '' }]
  if (type === 'number_line') {
    block.min_value = 0
    block.max_value = 100
    block.markers = [50]
  }
  if (type === 'equation_entry') {
    block.equation = ''
    block.final_answer = ''
  }
  if (type === 'fraction_input') {
    block.numerator = 1
    block.denominator = 2
  }
  if (type === 'arithmetic_grid') {
    block.operand1 = 23
    block.operand2 = 15
    block.operation = 'add'
  }
  if (type === 'graph_plot') {
    block.points_to_plot = [[0, 0]]
    block.pointsStr = '[[0,0]]'
  }
  if (type === 'geometry_shape') block.shape_type = 'triangle'
  if (type === 'word_problem') {
    block.problem_text = ''
    block.steps = [{ description: '', expected: '' }]
    block.final_answer = ''
  }
  if (type === 'info_box') {
    block.points = 0
    block.title = 'Click to learn more'
    block.text = 'Your explanation here...'
    block.mermaid = ''
    block.alt_text = ''
  }
  if (type === 'media' || type === 'audio' || type === 'video' || type === 'youtube') {
    block.src = ''
    block.caption = ''
  }
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
  if (!form.value.subject || !form.value.grade_level) {
    uiStore.showToast('Please select subject and grade level first', 'error')
    return
  }
  aiLoading.value = true
  try {
    const data = await store.aiGenerate(aiPrompt.value, aiProvider.value, {
      difficulty: aiDifficulty.value,
      length: aiLength.value,
      lernziele: aiLernziele.value.trim() || undefined,
      subject: form.value.subject,
      grade_level: form.value.grade_level,
      title: form.value.title || undefined,
      description: form.value.description || undefined,
      style: aiStyle.value,
    })
    blocks.value.push(...mapLoadedBlocks(data.blocks))
    uiStore.showToast(`Generated ${data.blocks.length} blocks`, 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    aiLoading.value = false
  }
}

async function sidebarGenerate() {
  await generateAI()
}

async function regenerateBlock(idx) {
  const block = blocks.value[idx]
  if (!block) return
  aiLoading.value = true
  try {
    const data = await store.aiRegenerateBlock({
      blockType: block.type,
      prompt: aiPrompt.value || undefined,
      provider: aiProvider.value,
      difficulty: aiDifficulty.value,
      subject: form.value.subject || undefined,
      grade_level: form.value.grade_level || undefined,
      lernziele: aiLernziele.value.trim() || undefined,
      style: aiStyle.value,
    })
    const mapped = mapLoadedBlocks([data.block])[0]
    blocks.value[idx] = { ...blocks.value[idx], ...mapped }
    uiStore.showToast(`Block "${block.type}" regenerated`, 'success')
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to regenerate block', 'error')
  } finally {
    aiLoading.value = false
  }
}

async function regenerateBlockWithInstruction(idx, instruction) {
  const block = blocks.value[idx]
  if (!block) return
  aiLoading.value = true
  try {
    const prompt = `${aiPrompt.value ? aiPrompt.value + '. ' : ''}Regenerate to be ${instruction}. ${block.text || block.template || ''}`
    const data = await store.aiRegenerateBlock({
      blockType: block.type,
      prompt,
      provider: aiProvider.value,
      difficulty: instruction === 'easier' ? 'easy' : instruction === 'harder' ? 'hard' : aiDifficulty.value,
      subject: form.value.subject || undefined,
      grade_level: form.value.grade_level || undefined,
      lernziele: aiLernziele.value.trim() || undefined,
      style: aiStyle.value,
    })
    const mapped = mapLoadedBlocks([data.block])[0]
    blocks.value[idx] = { ...blocks.value[idx], ...mapped }
    uiStore.showToast(`Block made ${instruction}`, 'success')
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to regenerate block', 'error')
  } finally {
    aiLoading.value = false
  }
}

function isYoutube(url) {
  return /youtube\.com|youtu\.be/.test(url)
}
function youtubeEmbed(url) {
  const id = url.match(/(?:v=|\/)([\w-]{11})/)
  return id ? `https://www.youtube.com/embed/${id[1]}` : ''
}

async function uploadFile(event, block) {
  const file = event.target.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  try {
    const data = await api.upload('/media/upload', formData)
    block.src = data.media.url
    uiStore.showToast('Uploaded', 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}
</script>
