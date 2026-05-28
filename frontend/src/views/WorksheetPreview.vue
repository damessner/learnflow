<template>
  <div class="page">
    <h2 v-if="worksheet">{{ worksheet.title }} (Preview)</h2>
    <p v-if="worksheet" style="color: var(--text-muted)">{{ worksheet.description }}</p>

    <div v-if="worksheet" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; align-items: center; flex-wrap: wrap">
      <button v-if="isTeacher" class="btn-primary btn-lg" style="display: flex; align-items: center; gap: 0.25rem" @click="cloneWorksheet">
        <span>📥</span> Clone to my Worksheets
      </button>
      <button class="btn btn-lg" @click="goBack">Go Back</button>
      <span v-if="worksheet.subject" class="badge" style="background: rgba(79, 70, 229, 0.1); color: var(--primary); padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600">
        {{ worksheet.subject }}
      </span>
      <span v-if="worksheet.grade_level" class="badge" style="background: rgba(107, 114, 128, 0.1); color: var(--text-main); padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600">
        Grade {{ worksheet.grade_level }}
      </span>
    </div>

    <div v-for="block in blocks" :key="block.id" class="card" style="margin-bottom: 0.5rem">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem">
        <strong>{{ block.type.replace(/_/g, ' ') }}</strong>
        <span class="badge">{{ block.points }} pts</span>
      </div>

      <template v-if="block.type === 'gap_fill'">
        <div>
          <template v-for="seg in getGapPreviewSegments(block.template)" :key="seg.key">
            <span v-if="seg.type === 'text'" style="white-space: pre-wrap">{{ seg.text }}</span>
            <u v-else-if="seg.type === 'gap'" style="color: var(--primary)">{{ seg.answer }}</u>
          </template>
        </div>
      </template>

      <template v-if="block.type === 'multiple_choice'">
        <div v-for="(opt, oi) in block.options" :key="oi" style="padding: 0.25rem 0">
          <span v-if="block.correct && block.correct.includes(oi)" style="color: var(--success)"
            >[x]</span
          >
          <span v-else>[ ]</span>
          {{ opt }}
        </div>
      </template>

      <template v-if="block.type === 'single_choice'">
        <div v-for="(opt, oi) in block.options" :key="oi" style="padding: 0.25rem 0">
          <span v-if="block.correct === oi" style="color: var(--success)">(o)</span>
          <span v-else>( )</span>
          {{ opt }}
        </div>
      </template>

      <template v-if="block.type === 'matching'">
        <div v-for="(pair, pi) in block.pairs" :key="pi">
          [{{ pi }}] {{ pair[0] }} → {{ pair[1] }}
        </div>
      </template>

      <template v-if="block.type === 'short_answer'">
        <div>Keywords: {{ (block.keywords || []).join(', ') }}</div>
        <div>Sample: {{ block.sample_answer }}</div>
        <textarea
          rows="2"
          disabled
          placeholder="Student answer..."
          style="margin-top: 0.5rem"
        ></textarea>
      </template>

      <template v-if="block.type === 'info_box'">
        <div style="background:var(--primary-light);border:1px solid var(--primary-soft);border-radius:var(--radius-md);padding:0.75rem 1rem">
          <div style="display:flex;align-items:center;gap:0.5rem;font-weight:600;color:var(--primary)">
            <span>💡</span>
            <span>{{ block.title || 'Click to learn more' }}</span>
          </div>
          <div style="margin-top:0.5rem;font-size:0.9rem;color:var(--text-main);white-space:pre-wrap">{{ block.text }}</div>
          <MermaidDiagram v-if="block.mermaid" :code="block.mermaid" :alt-text="block.alt_text" style="margin-top:0.5rem" />
        </div>
      </template>

      <template v-if="block.type === 'text'">
        <div style="white-space: pre-wrap">{{ block.text }}</div>
      </template>

      <!-- Media / Image Block -->
      <template v-if="block.type === 'media'">
        <div style="text-align: center; margin-top: 0.5rem">
          <img :src="block.src" style="max-width:100%; max-height:400px; border-radius:8px; border:1px solid var(--border-color)" />
          <p v-if="block.caption" style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem">{{ block.caption }}</p>
        </div>
      </template>

      <!-- Audio Block -->
      <template v-if="block.type === 'audio'">
        <div style="margin-top: 0.5rem">
          <audio :src="block.src" controls style="width:100%"></audio>
          <p v-if="block.caption" style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem">{{ block.caption }}</p>
        </div>
      </template>

      <!-- Video Block -->
      <template v-if="block.type === 'video'">
        <div style="text-align: center; margin-top: 0.5rem">
          <video :src="block.src" controls style="max-width:100%; max-height:400px; border-radius:8px"></video>
          <p v-if="block.caption" style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem">{{ block.caption }}</p>
        </div>
      </template>

      <!-- YouTube Block -->
      <template v-if="block.type === 'youtube'">
        <div style="text-align: center; margin-top: 0.5rem">
          <iframe
            v-if="youtubeEmbed(block.src)"
            width="560"
            height="315"
            :src="youtubeEmbed(block.src)"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            style="max-width:100%; border-radius:8px"
          ></iframe>
          <div v-else style="color:var(--text-muted)">Invalid YouTube Link</div>
          <p v-if="block.caption" style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem">{{ block.caption }}</p>
        </div>
      </template>

      <!-- Drawing Block -->
      <template v-if="block.type === 'drawing'">
        <div style="margin-top: 0.5rem">
          <div style="font-weight: 500; margin-bottom: 0.25rem">{{ block.text || 'Draw here:' }}</div>
          <ScratchpadCanvas />
        </div>
      </template>

      <template v-if="block.type === 'vocabulary'">
        <Vocabulary :block="block" :readonly="true" />
      </template>

      <template v-if="block.type === 'semantic_sorter'">
        <SemanticSorter :block="block" :readonly="true" />
      </template>

      <template v-if="block.type === 'flashcards'">
        <Flashcards :block="block" :readonly="true" />
      </template>

      <!-- Drag Words -->
      <template v-if="block.type === 'drag_words'">
        <div>
          <template v-for="seg in getGapPreviewSegments(block.template)" :key="seg.key">
            <span v-if="seg.type === 'text'" style="white-space: pre-wrap">{{ seg.text }}</span>
            <u v-else-if="seg.type === 'gap'" style="color: var(--primary)">{{ seg.answer }}</u>
          </template>
        </div>
      </template>

      <!-- Correct Words -->
      <template v-if="block.type === 'correct_words'">
        <div>
          <template v-for="(seg, si) in getCorrectWordsSegments(block.template)" :key="si">
            <span v-if="seg.type === 'text'">{{ seg.text }}</span>
            <span v-else-if="seg.type === 'word'" style="color:var(--text-muted)">
              <del style="color:red">{{ seg.wrong }}</del> (<ins style="color:green;text-decoration:none">{{ seg.correct }}</ins>)
            </span>
          </template>
        </div>
      </template>

      <!-- Question Table -->
      <template v-if="block.type === 'question_table'">
        <table style="width:100%;border-collapse:collapse;margin-top:0.25rem;border:1px solid var(--border-color)">
          <thead>
            <tr style="border-bottom:1px solid var(--border-color);background:var(--bg-main)">
              <th style="text-align:left;padding:0.25rem 0.5rem">Statement</th>
              <th style="text-align:center;padding:0.25rem 0.5rem;width:120px">Answer</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in block.rows || []" :key="ri" style="border-bottom:1px solid var(--border-color)">
              <td style="padding:0.25rem 0.5rem">{{ row.split('##')[0] }}</td>
              <td style="text-align:center;padding:0.25rem 0.5rem;font-weight:600;color:var(--primary)">{{ row.split('##')[1] }}</td>
            </tr>
          </tbody>
        </table>
      </template>

      <!-- Crossword -->
      <template v-if="block.type === 'crossword'">
        <div v-for="(item, idx) in block.words || []" :key="idx" style="margin-bottom:0.25rem">
          <strong>{{ idx + 1 }}. {{ item.word }}</strong>: {{ item.description }}
        </div>
      </template>

      <!-- Audio Match -->
      <template v-if="block.type === 'audio_match'">
        <div v-for="(pair, pi) in block.pairs || []" :key="pi" style="margin-bottom:0.25rem">
          🔊 {{ pair[0] }} → {{ pair[1] }}
        </div>
      </template>

      <!-- Dictation -->
      <template v-if="block.type === 'dictation'">
        <div><strong>Spoken Transcript:</strong> {{ block.audioText }}</div>
      </template>

      <!-- Word Search -->
      <template v-if="block.type === 'word_search'">
        <div><strong>Words to Find:</strong> {{ (block.words || []).join(', ') }}</div>
      </template>

      <!-- Sentence Builder -->
      <template v-if="block.type === 'sentence_builder'">
        <div><strong>Sentence:</strong> {{ block.sentence }}</div>
      </template>

      <!-- Odd One Out -->
      <template v-if="block.type === 'odd_one_out'">
        <div>
          <span v-for="(item, idx) in block.items || []" :key="idx" style="margin-right:0.75rem">
            <span v-if="block.correct === idx" style="color:green;font-weight:bold">✓ {{ item }}</span>
            <span v-else>{{ item }}</span>
          </span>
          <div style="margin-top:0.25rem;font-size:0.85rem;color:var(--text-muted)">Reason: {{ block.reason }}</div>
        </div>
      </template>
    </div>

    <div class="card" style="margin-top: 1rem">
      <strong>Total Points: {{ totalPoints }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorksheetsStore } from '../stores/worksheets'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import MermaidDiagram from '../components/exercises/MermaidDiagram.vue'
import Vocabulary from '../components/exercises/Vocabulary.vue'
import SemanticSorter from '../components/exercises/SemanticSorter.vue'
import Flashcards from '../components/exercises/Flashcards.vue'
import ScratchpadCanvas from '../components/exercises/ScratchpadCanvas.vue'

function youtubeEmbed(url: string) {
  if (!url) return ''
  const id = url.match(/(?:v=|\/)([\w-]{11})/)
  return id ? `https://www.youtube.com/embed/${id[1]}` : ''
}

const route = useRoute()
const router = useRouter()
const store = useWorksheetsStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const worksheet = ref(null)
const blocks = ref([])

const isTeacher = computed(() => authStore.role === 'teacher' || authStore.role === 'admin')
const totalPoints = computed(() => blocks.value.reduce((s, b) => s + (b.points || 0), 0))

async function cloneWorksheet() {
  if (!worksheet.value) return
  try {
    let cloned
    if (worksheet.value.in_library) {
      cloned = await store.cloneLibraryWorksheet(worksheet.value.id)
    } else {
      cloned = await store.duplicateWorksheet(worksheet.value.id)
    }
    uiStore.showToast('Worksheet duplicated successfully!', 'success')
    router.push(`/teacher/builder/${cloned.id}`)
  } catch (err: any) {
    uiStore.showToast(err.message || 'Failed to clone worksheet', 'error')
  }
}

function goBack() {
  if (route.query.from === 'bank') {
    router.push('/teacher/bank')
  } else {
    router.push('/teacher')
  }
}

onMounted(async () => {
  await store.fetchWorksheet(route.params.id)
  worksheet.value = store.current
  if (store.current) {
    try {
      const content = JSON.parse(store.current.content)
      blocks.value = content.blocks || []
    } catch {
      blocks.value = []
    }
  }
})

function parseGapPreviewTemplate(template: string): Array<
  | { type: 'text'; text: string; key: string }
  | { type: 'gap'; answer: string; key: string }
> {
  const segments: Array<
    | { type: 'text'; text: string; key: string }
    | { type: 'gap'; answer: string; key: string }
  > = []
  if (!template) return segments
  let lastIndex = 0
  const regex = /\(\((.*?)\)\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: template.slice(lastIndex, match.index),
        key: `t_${lastIndex}_${match.index}`,
      })
    }
    segments.push({
      type: 'gap',
      answer: match[1],
      key: `g_${match.index}`,
    })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < template.length) {
    segments.push({
      type: 'text',
      text: template.slice(lastIndex),
      key: `t_${lastIndex}_${template.length}`,
    })
  }
  return segments
}

function getGapPreviewSegments(template: string) {
  return parseGapPreviewTemplate(template)
}

function getCorrectWordsSegments(template: string) {
  const segments: Array<{ type: 'text'; text: string } | { type: 'word'; index: number; wrong: string; correct: string }> = []
  if (!template) return segments
  let lastIndex = 0
  let wordIndex = 0
  const regex = /\(\((.*?)\)\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: template.slice(lastIndex, match.index),
      })
    }
    const parts = match[1].split('/')
    segments.push({
      type: 'word',
      index: wordIndex++,
      wrong: parts[0] || '',
      correct: parts[1] || parts[0] || '',
    })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < template.length) {
    segments.push({
      type: 'text',
      text: template.slice(lastIndex),
    })
  }
  return segments
}
</script>
