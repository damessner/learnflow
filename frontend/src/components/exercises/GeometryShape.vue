<template>
  <div>
    <p style="margin-bottom: 0.5rem">Identify the shape:</p>
    <div
      v-if="block.shape_type === 'triangle'"
      style="
        margin: 1rem auto;
        width: 0;
        height: 0;
        border-left: 40px solid transparent;
        border-right: 40px solid transparent;
        border-bottom: 70px solid var(--primary);
      "
    ></div>
    <div
      v-else-if="block.shape_type === 'square'"
      style="
        margin: 1rem auto;
        width: 70px;
        height: 70px;
        background: var(--primary);
        border-radius: 4px;
      "
    ></div>
    <div
      v-else-if="block.shape_type === 'rectangle'"
      style="
        margin: 1rem auto;
        width: 100px;
        height: 60px;
        background: var(--primary);
        border-radius: 4px;
      "
    ></div>
    <div
      v-else-if="block.shape_type === 'circle'"
      style="
        margin: 1rem auto;
        width: 70px;
        height: 70px;
        background: var(--primary);
        border-radius: 50%;
      "
    ></div>
    <div
      v-else
      style="
        padding: 2rem;
        text-align: center;
        border: 1px dashed var(--border-color);
        border-radius: 4px;
        color: var(--text-muted);
      "
    >
      Shape: {{ block.shape_type || 'unknown' }}
    </div>
    <input
      v-if="!readonly"
      :value="(modelValue || {}).shape_name || ''"
      @input="emit('update:modelValue', { shape_name: $event.target.value })"
      placeholder="What shape is this?"
      style="margin-top: 0.5rem"
    />
    <p v-else style="margin-top: 0.25rem">{{ (modelValue || {}).shape_name || '___' }}</p>
  </div>
</template>

<script setup>
defineProps({ block: Object, modelValue: Object, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])
</script>
