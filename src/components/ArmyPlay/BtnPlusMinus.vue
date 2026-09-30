<script setup lang="ts">

const emit = defineEmits<{
  (e: 'add'): void,
  (e: 'remove'): void,
}>();

</script>
<template>
  <div class="d-flex gap-1">
    <button
      role="button"
      class="btn btn-primary btn-sm w-100 fw-bold"
      @click="emit('remove')"
    >
      -
    </button>
    <button
      role="button"
      class="btn btn-primary btn-sm w-100 fw-bold"
      @click="emit('add')"
    >
      +
    </button>
  </div>
</template>