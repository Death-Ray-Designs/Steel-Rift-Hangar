<script setup lang="ts">
import { BButton, BCollapse } from 'bootstrap-vue-next';
import { usePlayStore } from '../../store/play-store';
import ArmyPrintRefContent from '../ArmyPrint/ArmyPrintRefContent.vue';

const playStore = usePlayStore();
</script>
<template>
  <div class="section-container">
    <h5 class="play-header d-flex align-items-center justify-content-between">
      <span>Rules Reference</span>
      <BButton
        size="sm"
        class="py-0"
        :variant="playStore.showRulesReference ? 'danger' : 'secondary'"
        :aria-expanded="playStore.showRulesReference"
        :aria-label="playStore.showRulesReference ? 'Hide rules reference' : 'Show rules reference'"
        aria-controls="play-rules-reference"
        @click="playStore.showRulesReference = !playStore.showRulesReference"
      >
        {{ playStore.showRulesReference ? 'Hide' : 'Show' }}
      </BButton>
    </h5>
    <BCollapse id="play-rules-reference" v-model="playStore.showRulesReference" lazy>
      <ArmyPrintRefContent class="play-rules-reference" :show-header="false" />
    </BCollapse>
  </div>
</template>
