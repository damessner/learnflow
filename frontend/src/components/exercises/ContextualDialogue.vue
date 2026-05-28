<template>
  <div>
    <div v-for="(msg, mi) in block.messages || []" :key="mi" style="margin-bottom: 0.5rem">
      <div v-if="!msg.isGap" :style="{ textAlign: Number(mi) % 2 === 0 ? 'left' : 'right' }">
        <span
          style="
            background: var(--primary-light);
            color: #fff;
            padding: 0.25rem 0.75rem;
            border-radius: 8px;
            display: inline-block;
          "
          >{{ msg.text }}</span
        >
      </div>
      <div v-else>
        <span style="color: var(--text-muted)">{{ msg.text }}</span>
        <input
          v-if="!readonly"
          :value="(modelValue || {})[mi] || ''"
          placeholder="Your response..."
          style="margin-top: 0.25rem"
          @input="update(mi, ($event.target as HTMLInputElement).value)"
        />
        <span v-else style="color: var(--primary)">{{ (modelValue || {})[mi] || '___' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ block: Object, modelValue: Object, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])

function update(mi, value) {
  const updated = { ...(props.modelValue || {}) }
  updated[mi] = value
  emit('update:modelValue', updated)
}
</script>
