<template>
  <div>
    <p
      style="
        font-size: 1.1rem;
        line-height: 1.8;
        background: var(--bg-main);
        padding: 1rem;
        border-radius: var(--radius-sm);
        margin-bottom: 0.5rem;
      "
    >
      <template v-if="glossedWords.length">
        <span
          v-for="(part, pi) in glossedWords"
          :key="pi"
          :style="part.isUnknown ? 'border-bottom:2px dashed var(--primary);cursor:pointer;position:relative' : ''"
          @click="part.isUnknown && toggleGloss(pi)"
        >
          {{ part.text }}{{ part.space }}
          <span
            v-if="part.isUnknown && activeGloss === pi"
            class="gloss-tooltip"
          >{{ part.translation }}</span>
        </span>
      </template>
      <template v-else>
        {{ block.text }}
      </template>
    </p>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
      <button v-if="!readonly" class="btn-sm" :disabled="speaking" @click="speak">
        {{ speaking ? 'Speaking...' : '🔊 Listen' }}
      </button>
      <button v-if="!readonly && !recording" class="btn-sm" @click="startRecord">🎤 Record</button>
      <button v-if="recording" class="btn-sm btn-danger" @click="stopRecord">⏹ Stop</button>
      <button
        v-if="!readonly && !glossesLoaded && (block.source_lang || block.target_lang)"
        class="btn-sm"
        :disabled="glossesLoading"
        @click="loadGlosses"
      >
        {{ glossesLoading ? 'Loading...' : '🔍 Show Glosses' }}
      </button>
      <button
        v-if="glossesLoaded && unknownWords.length"
        class="btn-sm"
        @click="addAllToVocab"
        :disabled="addingToVocab"
      >
        {{ addingToVocab ? 'Adding...' : '📚 Study These Words' }}
      </button>
      <audio
        v-if="audioUrl"
        :src="audioUrl"
        controls
        style="height: 32px; max-width: 300px"
      ></audio>
    </div>
    <div v-if="unknownWords.length && glossesLoaded" style="margin-top:0.5rem;font-size:0.8rem">
      <div v-for="(w, wi) in unknownWords" :key="wi" style="display:inline-block;margin:0.15rem 0.35rem 0.15rem 0">
        <span class="badge">{{ w.word }}</span> → {{ w.translation }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { api } from '../../services/api'

const props = defineProps({ block: Object, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])
const speaking = ref(false)
const recording = ref(false)
const audioUrl = ref<string | null>(null)
let mediaRecorder: MediaRecorder | null = null
let chunks: Blob[] = []

const glossesLoading = ref(false)
const glossesLoaded = ref(false)
const addingToVocab = ref(false)
const unknownWords = ref<{ word: string; translation: string; base_form: string; add_to_study: boolean }[]>([])
const activeGloss = ref<number | null>(null)

interface GlossPart {
  text: string
  space: string
  isUnknown: boolean
  translation: string
}

const glossedWords = computed<GlossPart[]>(() => {
  if (!unknownWords.value.length) return []
  const text = props.block.text || ''
  const knownSet = new Set(unknownWords.value.map(w => w.word.toLowerCase()))
  const words = text.split(/(\s+)/)
  const result: GlossPart[] = []
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    if (!w.trim()) continue
    const clean = w.replace(/[.,!?;:()"']/g, '').toLowerCase()
    const next = words[i + 1]?.match(/^\s+$/) ? words[i + 1] : ''
    const match = unknownWords.value.find(u => u.word.toLowerCase() === clean)
    result.push({
      text: w,
      space: next,
      isUnknown: !!match,
      translation: match?.translation || '',
    })
    if (next && words[i + 1]?.match(/^\s+$/)) i++
  }
  return result
})

function toggleGloss(pi: number) {
  activeGloss.value = activeGloss.value === pi ? null : pi
}

onUnmounted(() => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
})

function speak() {
  if (!('speechSynthesis' in window)) return
  speaking.value = true
  const utterance = new SpeechSynthesisUtterance(props.block.text)
  utterance.onend = () => { speaking.value = false }
  speechSynthesis.speak(utterance)
}

async function startRecord() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    chunks = []
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      audioUrl.value = URL.createObjectURL(blob)
      emit('update:modelValue', { recorded: true, blobUrl: audioUrl.value })
    }
    mediaRecorder.start()
    recording.value = true
  } catch { /* mic denied */ }
}

function stopRecord() {
  if (mediaRecorder) {
    mediaRecorder.stop()
    mediaRecorder.stream.getTracks().forEach((t) => t.stop())
  }
  recording.value = false
}

async function loadGlosses() {
  glossesLoading.value = true
  try {
    const data = await api.post('/language/glosses', {
      text: props.block.text,
      target_lang: props.block.target_lang || 'de',
      cefr_level: props.block.cefr_level || 'A2',
    })
    unknownWords.value = data?.unknown_words || []
    glossesLoaded.value = true
  } catch (e) {
    console.warn('Failed to load glosses:', e)
  } finally {
    glossesLoading.value = false
  }
}

async function addAllToVocab() {
  addingToVocab.value = true
  let added = 0
  for (const w of unknownWords.value) {
    try {
      await api.post('/language/vocabulary', {
        source_lang: props.block.source_lang || 'en',
        target_lang: props.block.target_lang || 'de',
        word: w.word,
        translation: w.translation,
        base_form: w.base_form || undefined,
      })
      added++
    } catch { /* skip duplicates */ }
  }
  if (added) {
    emit('update:modelValue', { vocabularyAdded: true, addedCount: added })
  }
  addingToVocab.value = false
}
</script>

<style>
.gloss-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary);
  color: #fff;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 10;
  margin-bottom: 4px;
}
</style>
