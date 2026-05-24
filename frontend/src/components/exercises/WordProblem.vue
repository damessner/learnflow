<template>
  <div>
    <div
      v-if="block.problem_text"
      class="card"
      style="background: var(--bg-main); margin-bottom: 0.75rem; font-style: italic"
    >
      {{ block.problem_text }}
    </div>
    <div v-for="(step, si) in block.steps || []" :key="si" style="margin-bottom: 0.5rem">
      <strong>Step {{ si + 1 }}:</strong> {{ step.description }}
      <input
        v-if="!readonly"
        :value="(modelValue || {})[si] || ''"
        @input="update(si, $event.target.value)"
        placeholder="Your answer..."
        style="margin-top: 0.25rem"
      />
      <span v-else style="display: block; margin-top: 0.25rem; color: var(--primary)">{{
        (modelValue || {})[si] || '___'
      }}</span>
    </div>
    <div style="margin-top: 0.75rem">
      <strong>Final Answer:</strong>
      <input
        v-if="!readonly"
        :value="(modelValue || {}).final_answer || ''"
        @input="update('final_answer', $event.target.value)"
        placeholder="Final answer..."
        style="margin-top: 0.25rem"
      />
      <span
        v-else
        style="display: block; margin-top: 0.25rem; color: var(--primary); font-weight: 600"
        >{{ (modelValue || {}).final_answer || '___' }}</span
      >
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ block: Object, modelValue: Object, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])

function update(key, value) {
  const val = { ...(props.modelValue || {}) }
  val[key] = value
  emit('update:modelValue', val)
}
</script>
