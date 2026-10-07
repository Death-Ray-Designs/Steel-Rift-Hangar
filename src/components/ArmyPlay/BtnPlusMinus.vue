<script setup lang="ts">
import { inject } from 'vue';
import { usePlayStore } from '../../store/play-store';

const play = inject('play', false);
const playStore = usePlayStore();

const emit = defineEmits<{
  (e: 'add'): void,
  (e: 'remove'): void,
}>();

</script>
<template>
  <div v-if="play && playStore.enableBtnPlusMinus" class="btn-group">
    <button
      type="button"
      class="btn btn-primary btn-sm fw-bold btn-plus-minus w-100"
      @click="emit('remove')"
    >
      <span class="material-symbols-outlined">remove</span>
    </button>
    <button
      type="button"
      class="btn btn-danger-light btn-sm fw-bold btn-plus-minus text-black w-100"
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
