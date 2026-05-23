<template>
  <div>
    <div
      v-for="(w, wi) in block.words || []"
      :key="wi"
      style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem"
    >
      <span style="font-family: monospace; letter-spacing: 3px">{{ scramble(w.word) }}</span>
      <input
        v-if="!readonly"
        :value="(modelValue || [])[wi] || ''"
        placeholder="Unscramble"
        style="width: 200px"
        @input="update(wi, $event.target.value)"
      />
      <span v-else>{{ (modelValue || [])[wi] || '___' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ block: Object, modelValue: Array, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])

function scramble(word) {
  const arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

function update(wi, value) {
  const updated = [...(props.modelValue || [])]
  updated[wi] = value
  emit('update:modelValue', updated)
}
</script>
