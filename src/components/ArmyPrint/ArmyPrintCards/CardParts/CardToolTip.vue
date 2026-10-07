<script setup lang="ts">
import { inject } from 'vue';
import BtnToolTip from '../../../UI/BtnToolTip.vue';

// tooltips are only shown in play mode, printed cards render the plain text
const { enabled = true } = defineProps<{
  enabled?: boolean,
}>();

const play = inject('play', false);
</script>
<template>
  <BtnToolTip v-if="play && enabled">
    <template #target>
      <span class="text-tooltip"><slot /></span>
    </template>
    <template #title>
      <slot name="title" />
    </template>
    <template #content>
      <slot name="content" />
    </template>
  </BtnToolTip>
  <slot v-else />
</template>
