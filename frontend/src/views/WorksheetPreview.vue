<template>
  <div class="page">
    <h2 v-if="worksheet">{{ worksheet.title }} (Preview)</h2>
    <p v-if="worksheet" style="color: var(--text-muted)">{{ worksheet.description }}</p>

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
    </div>

    <div class="card" style="margin-top: 1rem">
      <strong>Total Points: {{ totalPoints }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWorksheetsStore } from '../stores/worksheets'
import MermaidDiagram from '../components/exercises/MermaidDiagram.vue'

const route = useRoute()
const store = useWorksheetsStore()
const worksheet = ref(null)
const blocks = ref([])

const totalPoints = computed(() => blocks.value.reduce((s, b) => s + (b.points || 0), 0))

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
</script>
