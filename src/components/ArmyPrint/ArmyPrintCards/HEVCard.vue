<script setup lang="ts">
import { setComponentScope } from 'pinia-scope';
import { computed, inject, onMounted, useTemplateRef } from 'vue';
import { useMechStore } from '../../../store/mech-store';
import { usePlayStore } from '../../../store/play-store';
import { BButton } from 'bootstrap-vue-next';
import CardFooter from './CardParts/CardFooter.vue';
import CardHeader from './CardParts/CardHeader.vue';
import HEVCardHp from './HEVCard/HEVCardHp.vue';
import HEVCardStats from './HEVCard/HEVCardStats.vue';
import HEVCardUpgrades from './HEVCard/HEVCardUpgrades.vue';
import HEVCardWeapons from './HEVCard/HEVCardWeapons.vue';

const { mechId, storeScope = '' } = defineProps<{
  mechId: number,
  storeScope?: string
}>();

const play = inject('play', false);

setComponentScope(storeScope);
const mechStore = useMechStore(storeScope);

const playStore = usePlayStore(storeScope);

const info = computed(() => mechStore.getMechInfo(mechId)!);

const destroyed = computed(() => play && playStore.isHevDestroyed(mechId));
const showDestroyedBtn = computed(() => play && (destroyed.value || playStore.isHevStructureFull(mechId)));

const adjustableRef = useTemplateRef<HTMLElement | null>('adjustableSize');

// 3.6in card = 336px
const MAX_CONTAINER_HEIGHT = 336;
// matches .output-container font-size; children use % so they scale proportionally
const BASE_FONT_SIZE_PT = 10;
const MIN_FONT_SIZE_PT = 6;
const STEP_PT = 0.25;

function adjustFontSize() {
  if (play) return;
  const el = adjustableRef.value;
  if (!el) return;
  const container = el.closest('.card-content-container') as HTMLElement | null;
  if (!container) return;

  el.style.fontSize = '';
  if (container.scrollHeight <= MAX_CONTAINER_HEIGHT) return;

  let size = BASE_FONT_SIZE_PT;
  while (container.scrollHeight > MAX_CONTAINER_HEIGHT && size > MIN_FONT_SIZE_PT) {
    size -= STEP_PT;
    el.style.fontSize = `${size}pt`;
  }
}

onMounted(adjustFontSize);
</script>
<template>
  <div class="game-card" :class="destroyed? 'pb-0' : ''">
    <div class="card-content-container">

      <CardHeader :title="info.display_name">
        <template #after-title>
          <BButton
            v-if="showDestroyedBtn"
            size="sm"
            :variant="destroyed ? 'secondary' : 'danger'"
            class="me-1 py-0"
            @click="playStore.setHevDestroyed(mechId, !destroyed)"
          >
            {{ destroyed ? 'Show Destroyed' : 'Hide Destroyed' }}
          </BButton>
        </template>
      </CardHeader>
      <HEVCardStats v-if="!destroyed" :mech-id="mechId" />
      <HEVCardHp v-if="!destroyed" :mech-id="mechId" />
      <div v-if="!destroyed" ref="adjustableSize">
        <HEVCardWeapons
          :mech-id="mechId"
          @content-changed="adjustFontSize"
        />
        <HEVCardUpgrades
          :mech-id="mechId"
          @content-changed="adjustFontSize"
        />
      </div>
      <CardFooter v-if="!destroyed" />
    </div>
  </div>
</template>