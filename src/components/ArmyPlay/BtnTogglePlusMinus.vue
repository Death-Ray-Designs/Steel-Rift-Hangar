<script setup lang="ts">

import { BButton } from 'bootstrap-vue-next';
import { usePlayStore } from '../../store/play-store';

const playStore = usePlayStore();

</script>
<template>
  <BButton
    @click="playStore.enableBtnPlusMinus = !playStore.enableBtnPlusMinus"
    size="sm"
    :variant="playStore.enableBtnPlusMinus ? 'success-light' : 'danger-light'"
  >
    <template v-if="playStore.enableBtnPlusMinus">
      <span class="material-symbols-outlined">check</span>
    </template>
    <template v-else>
      <span class="material-symbols-outlined">close</span>
    </template>
    -/+ Buttons
  </BButton>
</template>