<template>
  <div>
    <div
      v-for="(card, ci) in block.cards || []"
      :key="ci"
      style="
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
        margin-bottom: 0.5rem;
        background: var(--bg-card);
        cursor: pointer;
        min-height: 80px;
      "
      @click="flipCard(ci)"
    >
      <div v-if="flipped[ci]">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem">
          <div style="flex:1">
            <strong style="color:var(--text-muted);font-size:0.75rem">Back:</strong>
            <div style="font-size:1.1rem;font-weight:600;margin-top:0.15rem">{{ card.back }}</div>
          </div>
          <div v-if="card.audio_url" style="flex-shrink:0">
            <audio :src="card.audio_url" controls style="height:32px;width:180px"></audio>
          </div>
        </div>
        <div v-if="!readonly" style="margin-top:0.5rem">
          <button class="btn-sm" style="background:var(--success);color:#fff" @click.stop="markCardCorrect(ci)">✓ Got it</button>
          <button class="btn-sm" style="background:var(--danger);color:#fff;margin-left:0.25rem" @click.stop="markCardWrong(ci)">✗ Again</button>
        </div>
      </div>
      <div v-else style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem">
        <div style="flex:1">
          <strong style="color:var(--text-muted);font-size:0.75rem">Front:</strong>
          <div style="font-size:1.1rem;font-weight:600;margin-top:0.15rem">{{ card.front }}</div>
        </div>
        <div v-if="card.image_url" style="flex-shrink:0">
          <img :src="card.image_url" alt="card image" style="max-width:80px;max-height:60px;border-radius:4px" />
        </div>
      </div>
    </div>
    <div v-if="completionCount > 0 && !readonly" style="font-size:0.8rem;color:var(--text-muted);margin-top:0.35rem">
      {{ completionCount }}/{{ (block.cards || []).length }} reviewed
      <button v-if="completionCount === (block.cards || []).length" class="btn-sm" @click="markCompleted" style="margin-left:0.5rem">Complete Set</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({ block: Object, modelValue: null, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])

const flipped = ref<Record<number, boolean>>({})
const cardResults = ref<Record<number, boolean>>({})
const completionCount = ref(0)

function flipCard(ci: number) {
  flipped.value = { ...flipped.value, [ci]: !flipped.value[ci] }
}

function markCardCorrect(ci: number) {
  if (!cardResults.value[ci]) completionCount.value++
  cardResults.value = { ...cardResults.value, [ci]: true }
}

function markCardWrong(ci: number) {
  if (!cardResults.value[ci]) completionCount.value++
  cardResults.value = { ...cardResults.value, [ci]: false }
}

function markCompleted() {
  emit('update:modelValue', 'completed')
}
</script>
