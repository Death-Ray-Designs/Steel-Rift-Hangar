<script setup lang="ts">
import { BButton } from 'bootstrap-vue-next';
import { usePlayStore } from '../../store/play-store';

const playStore = usePlayStore();

</script>
<template>
  <BButton
    @click="playStore.showCritReference = !playStore.showCritReference"
    size="sm"
    :variant="playStore.showCritReference ? 'success-light' : 'danger-light'"
  >
    <template v-if="playStore.showCritReference">
      <span class="material-symbols-outlined">check</span>
    </template>
    <template v-else>
      <span class="material-symbols-outlined">close</span>
    </template>
    Crit Reference
  </BButton>
</template>
