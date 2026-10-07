<script setup lang="ts">
import { BButton } from 'bootstrap-vue-next';
import { usePrintSettingsStore } from '../../../store/print-settings-store';

const printSettingsStore = usePrintSettingsStore();
</script>
<template>
  <BButton
    @click="printSettingsStore.edit_card_preview_dark_mode = !printSettingsStore.edit_card_preview_dark_mode"
    size="sm"
    variant="secondary"
  >
    <span class="material-symbols-outlined">
      {{ printSettingsStore.edit_card_preview_dark_mode ? 'dark_mode' : 'light_mode' }}
    </span>
    Preview: {{ printSettingsStore.edit_card_preview_dark_mode ? 'Dark' : 'Light' }}
  </BButton>
</template>
