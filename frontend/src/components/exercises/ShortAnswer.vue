<template>
  <div>
    <p v-if="block.sample_answer" style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.5rem">
      Sample: {{ block.sample_answer }}
    </p>
    <textarea v-if="!readonly" :value="modelValue || ''" @input="$emit('update:modelValue', $event.target.value)" rows="3" placeholder="Your answer..."></textarea>
    <p v-else>{{ modelValue || '(no answer)' }}</p>
  </div>
</template>

<script setup>
defineProps({ block: Object, modelValue: String, readonly: Boolean })
defineEmits(['update:modelValue'])
</script>
