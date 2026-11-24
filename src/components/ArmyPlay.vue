<script setup lang="ts">
import { BButton } from 'bootstrap-vue-next';
import HEVCard from './ArmyPrint/ArmyPrintCards/HEVCard.vue';
import MineDroneCard from './ArmyPrint/ArmyPrintCards/MineDroneCard.vue';
import SupportAssetWeaponCard from './ArmyPrint/ArmyPrintCards/SupportAssetWeaponCard.vue';
import SupportAssetUnitCard from './ArmyPrint/ArmyPrintCards/SupportAssetUnitCard.vue';
import { computed, provide } from 'vue';
import { type SupportAssetUnitCardType, type SupportAssetWeaponCardType, useCardStore } from '../store/card-store';
import { MECH_TEAM, MECH_TEAMS } from '../data/mech-teams';
import { useArmyListStore } from '../store/army-list-store';
import { usePlayStore } from '../store/play-store';
import BtnClearPlay from './ArmyPlay/BtnClearPlay.vue';
import PlayLeaveModal from './ArmyPlay/PlayLeaveModal.vue';
import BtnTogglePlusMinus from './ArmyPlay/BtnTogglePlusMinus.vue';
import BtnToggleCritReference from './ArmyPlay/BtnToggleCritReference.vue';
import PlayRulesReference from './ArmyPlay/PlayRulesReference.vue';
import { type BootstrapBreakpoint, useBootstrapBreakpoints } from '../composables/bootstrap-helpers';
import { clamp } from '../data/data-helpers';

const cardStore = useCardStore();
const armyStore = useArmyListStore();
const playStore = usePlayStore();

const MIN_COLUMNS = 1;
const BREAK_POINT_COLUMNS: Record<BootstrapBreakpoint, { auto: number; max: number }> = {
  xs: { auto: 1, max: 1 },
  sm: { auto: 2, max: 3 },
  md: { auto: 3, max: 4 },
  lg: { auto: 4, max: 5 },
  xl: { auto: 4, max: 5 },
  xxl: { auto: 4, max: 5 },
};

const breakpoint = useBootstrapBreakpoints();

const autoColumnCount = computed(() => BREAK_POINT_COLUMNS[breakpoint.value].auto);
const maxColumnCount = computed(() => BREAK_POINT_COLUMNS[breakpoint.value].max);
const canChangeColumns = computed(() => maxColumnCount.value > MIN_COLUMNS);
const effectiveColumnCount = computed(() => {
  if (playStore.columnCount === null) {
    return autoColumnCount.value;
  }

  return clamp(playStore.columnCount, MIN_COLUMNS, maxColumnCount.value);
});

// a saved manual count that works out to the auto count at this breakpoint displays as auto (the saved preference is kept)
const isManualColumns = computed(() => playStore.columnCount !== null && effectiveColumnCount.value !== autoColumnCount.value);
const columnVariant = computed(() => isManualColumns.value ? 'danger-light' : 'success-light');

function changeColumns(change: number) {
  const current = effectiveColumnCount.value;
  const next = clamp(current + change, MIN_COLUMNS, maxColumnCount.value);
  if (next === current) return;

  if (next === autoColumnCount.value) {
    playStore.columnCount = null;
  } else {
    playStore.columnCount = next;
  }
}

const hevCardsByTeam = computed(() => {
  const mechCardsByTeam = cardStore.mech_cards_by_team;

  return Object.entries(mechCardsByTeam).map(([teamId, val]: [string, any]) => {
    return {
      teamName: MECH_TEAMS[teamId as MECH_TEAM].display_name,
      cards: val
    };
  });
});

const supportAssetCards = computed((): (SupportAssetUnitCardType | SupportAssetWeaponCardType)[] => {
  return [
    ...cardStore.support_asset_unit_cards,
    ...cardStore.support_asset_weapon_cards,
  ];
});

provide('play', true);
</script>
<template>
  <div
    class="page-previews-container play-container"
    :style="{ '--play-columns': effectiveColumnCount }"
  >
    <div class="output-container">
      <div class="container-fluid gx-0">
        <div class="d-flex flex-wrap align-items-center gap-1 px-3 mb-2">
          <BtnClearPlay />
          <PlayLeaveModal />
          <BtnTogglePlusMinus />
          <BtnToggleCritReference />
          <div
            v-if="canChangeColumns"
            class="btn-group"
            role="group"
            aria-label="Play columns"
          >
            <BButton
              size="sm"
              :variant="columnVariant"
              :aria-pressed="!isManualColumns"
              :title="isManualColumns ? 'Reset columns to auto' : 'Columns follow screen width'"
              @click="playStore.columnCount = null"
            >
              <span class="material-symbols-outlined">{{ isManualColumns ? 'restart_alt' : 'check' }}</span>
              <template v-if="!isManualColumns">
                Columns Auto: {{ effectiveColumnCount }}
              </template>
              <template v-else>
                Columns: {{ effectiveColumnCount }}
              </template>
            </BButton>
            <BButton
              size="sm"
              variant="secondary"
              aria-label="Fewer columns"
              :disabled="effectiveColumnCount === MIN_COLUMNS"
              @click="changeColumns(-1)"
            >
              <span class="material-symbols-outlined">remove</span>
            </BButton>
            <BButton
              size="sm"
              variant="secondary"
              aria-label="More columns"
              :disabled="effectiveColumnCount === maxColumnCount"
              @click="changeColumns(1)"
            >
              <span class="material-symbols-outlined">add</span>
            </BButton>
          </div>
        </div>

        <h4 class="px-3">{{ armyStore.name || 'Unnamed Army List' }}</h4>

        <div
          v-for="team in hevCardsByTeam"
          :key="team.teamName"
          class="section-container"
        >
          <h5 class="play-header">{{ team.teamName }}</h5>

          <div class="play-card-grid">
            <div
              v-for="item in team.cards"
              :key="item.mechId"
            >
              <HEVCard :mech-id="item.mechId" />
            </div>
          </div>
        </div>

        <div
          class="section-container"
          v-if="armyStore.includes_mine_drones"
        >
          <h5 class="play-header">Reference</h5>
          <div class="play-card-grid">
            <div>
              <MineDroneCard :hidden="playStore.mineDroneCardHidden">
                <template #after-title>
                  <BButton
                    size="sm"
                    :variant="playStore.mineDroneCardHidden ? 'secondary' : 'danger'"
                    class="me-1 py-0"
                    @click="playStore.mineDroneCardHidden = !playStore.mineDroneCardHidden"
                  >
                    {{ playStore.mineDroneCardHidden ? 'Show' : 'Hide' }}
                  </BButton>
                </template>
              </MineDroneCard>
            </div>
          </div>
        </div>

        <div
          class="section-container"
          v-if="supportAssetCards.length"
        >
          <h5 class="play-header">Support Assets</h5>
          <div class="page-card-grid-flex flex-wrap justify-content-center">
            <template v-for="item in supportAssetCards">
              <SupportAssetWeaponCard
                v-if="item.type === 'support_asset_weapon'"
                :key="`weapon-${item.supportAssetId}`"
                :support-asset-id="item.supportAssetId"
              />
              <SupportAssetUnitCard
                v-if="item.type === 'support_asset_unit'"
                :key="`unit-${item.unitAttachmentId}`"
                :unit-attachment-id="item.unitAttachmentId"
              />
            </template>
          </div>
        </div>
        <PlayRulesReference />
      </div>
    </div>
  </div>
</template>
