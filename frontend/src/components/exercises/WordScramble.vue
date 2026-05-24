<template>
  <div>
    <p v-if="block.text" style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem">
      {{ block.text }}
    </p>
    <div
      v-for="(w, wi) in block.words || []"
      :key="wi"
      style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.3rem"
    >
      <span
        style="
          font-family: monospace;
          letter-spacing: 2px;
          padding: 0.25rem 0.5rem;
          background: var(--bg-main);
          border-radius: 4px;
          font-size: 0.95rem;
          min-width: 120px;
          text-align: center;
        "
        >{{
          block.sentence_mode
            ? w.word
                .split(' ')
                .sort(() => Math.random() - 0.5)
                .join(' ')
            : scrambleChars(w.word)
        }}</span
      >
      <input
        v-if="!readonly"
        :value="(modelValue || [])[wi] || ''"
        :placeholder="block.sentence_mode ? 'Reorder' : 'Unscramble'"
        @input="update(wi, $event.target.value)"
        style="flex: 1"
      />
      <span v-else :style="{ flex: 1, fontWeight: 500 }">{{
        (modelValue || [])[wi] || '___'
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ block: Object, modelValue: Array, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])

function scrambleChars(w) {
  const arr = String(w).split('')
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
