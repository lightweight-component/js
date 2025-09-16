<!-- components/MyButton.vue -->
<script setup lang="ts">
defineProps<{
  text?: string;
}>();

const emit = defineEmits(['click']);
</script>

<template>
  <button @click="$emit('click')">{{ text || 'Click me' }}</button>
</template>

<style scoped>
button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>