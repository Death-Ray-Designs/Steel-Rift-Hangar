<script setup lang="ts">
import HEVCard from './ArmyPrint/ArmyPrintCards/HEVCard.vue';
import SupportAssetWeaponCard from './ArmyPrint/ArmyPrintCards/SupportAssetWeaponCard.vue';
import SupportAssetUnitCard from './ArmyPrint/ArmyPrintCards/SupportAssetUnitCard.vue';
import { computed, provide } from 'vue';
import { type SupportAssetUnitCardType, type SupportAssetWeaponCardType, useCardStore } from '../store/card-store';
import { MECH_TEAM, MECH_TEAMS } from '../data/mech-teams';
import { useArmyListStore } from '../store/army-list-store';
import BtnClearPlay from './ArmyPlay/BtnClearPlay.vue';
import PlayLeaveModal from './ArmyPlay/PlayLeaveModal.vue';
import BtnTogglePlusMinus from './ArmyPlay/BtnTogglePlusMinus.vue';
import BtnToggleCritReference from './ArmyPlay/BtnToggleCritReference.vue';

const cardStore = useCardStore();
const armyStore = useArmyListStore();

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
  <div class="page-previews-container play-container">
    <div class="output-container">
      <div class="container-fluid gx-0">
        <div class="mb-2">
          <BtnClearPlay />
          <PlayLeaveModal />
          <BtnTogglePlusMinus />
          <BtnToggleCritReference class="ms-1" />
        </div>

        <h4 class="px-3">{{ armyStore.name || 'Unnamed Army List' }}</h4>

        <div
          v-for="team in hevCardsByTeam"
          :key="team.teamName"
          class="section-container"
        >
          <h5 class="play-header">{{ team.teamName }}</h5>

          <div class="row gx-1 row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-1">
            <div
              class="col"
              v-for="item in team.cards"
              :key="item.mechId"
            >
              <HEVCard :mech-id="item.mechId" />
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
      </div>
    </div>
  </div>
</template>