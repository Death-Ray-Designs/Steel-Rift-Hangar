<script setup lang="ts">

const { inline = false } = defineProps<{
  inline?: boolean
}>();

const emit = defineEmits<{
  (e: 'add'): void,
  (e: 'remove'): void,
}>();

</script>
<template>
  <div class="btn-group">
    <button
      role="button"
      class="btn btn-primary btn-sm fw-bold btn-plus-minus"
      :class="{'w-100': !inline}"
      @click="emit('remove')"
    >
      <span class="material-symbols-outlined">remove</span>
    </button>
    <button
      role="button"
      class="btn btn-danger-light btn-sm fw-bold btn-plus-minus text-black"
      :class="{'w-100': !inline}"
      @click="emit('add')"
    >
      <span class="material-symbols-outlined">add</span>
    </button>
  </div>
</template>
<style lang="scss">
.btn-plus-minus {
  min-width: 2rem;

  .material-symbols-outlined {
    font-size: 0.75rem;
    font-weight: bold;
  }
}
</style>