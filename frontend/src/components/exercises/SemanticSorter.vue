<template>
  <div>
    <div v-for="(cat, ci) in block.categories || []" :key="ci" style="margin-bottom: 0.5rem">
      <strong>{{ cat.name }}</strong>
      <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.25rem">
        <span
          v-for="word in cat.words || []"
          :key="word"
          class="badge"
          :style="{
            background: selectedCat(ci, word) ? 'var(--primary)' : 'var(--text-muted)',
            cursor: readonly ? 'default' : 'pointer',
          }"
          @click="!readonly && toggleWord(ci, cat.name, word)"
          >{{ word }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ block: Object, modelValue: Object, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])

function selectedCat(ci, word) {
  const val = props.modelValue || {}
  const catName = props.block.categories?.[ci]?.name
  return (val[catName] || []).includes(word)
}

function toggleWord(ci, catName, word) {
  const val = { ...(props.modelValue || {}) }
  const words = [...(val[catName] || [])]
  if (words.includes(word)) {
    val[catName] = words.filter((w) => w !== word)
  } else {
    val[catName] = [...words, word]
  }
  emit('update:modelValue', val)
}
</script>
