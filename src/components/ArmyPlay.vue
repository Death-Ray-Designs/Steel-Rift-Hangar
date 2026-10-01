<script setup lang="ts">
import HEVCard from './ArmyPrint/ArmyPrintCards/HEVCard.vue';
import SupportAssetWeaponCard from './ArmyPrint/ArmyPrintCards/SupportAssetWeaponCard.vue';
import SupportAssetUnitCard from './ArmyPrint/ArmyPrintCards/SupportAssetUnitCard.vue';
import { computed, provide, ref } from 'vue';
import { type SupportAssetUnitCardType, type SupportAssetWeaponCardType, useCardStore } from '../store/card-store';
import { MECH_TEAM, MECH_TEAMS } from '../data/mech-teams';
import { useArmyListStore } from '../store/army-list-store';
import { BButton, BModal } from 'bootstrap-vue-next';
import { usePlayStore } from '../store/play-store';
import { onBeforeRouteLeave, type RouteLocationNormalized, useRouter } from 'vue-router';

const cardStore = useCardStore();

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
const armyStore = useArmyListStore();
const playStore = usePlayStore();

provide('play', true);
const resetModal = ref(false);

const router = useRouter();
const leaveModal = ref(false);
let leaveTarget: RouteLocationNormalized | null = null;
let leaveConfirmed = false;

onBeforeRouteLeave((to) => {
  if (leaveConfirmed || !playStore.gameStarted) return true;
  leaveTarget = to;
  leaveModal.value = true;
  return false;
});

function confirmLeave() {
  if (!leaveTarget) return;
  leaveConfirmed = true;
  router.push(leaveTarget.fullPath);
}

</script>
<template>
  <div
    class="page-previews-container play-container"
    data-bs-theme="light"
  >
    <div class="output-container">
      <div class="container-fluid gx-0">
        <BButton
          @click="resetModal = !resetModal"
          size="sm"
          variant="danger"
          class="mx-3"
        >
          Clear
        </BButton>
        <BModal
          v-model="resetModal"
          centered
          @ok="playStore.$reset()"
          ok-variant="danger"
          title="Clear Play State"
        >
          <div class="lead">
            Are you sure you want to clear all game data?
          </div>
        </BModal>

        <BModal
          v-model="leaveModal"
          centered
          @ok="confirmLeave"
          ok-title="Leave Play Mode"
          cancel-title="Stay"
          title="Game in Progress"
        >
          <p>
            Game data (damage and weapon/upgrade uses) is saved and will still be here when you come back.
            Changes to the army list may affect it:
          </p>
          <ul>
            <li>
              Removing an HEV, weapon, upgrade, support asset or vehicle clears its game data.
            </li>
            <li>
              Changing a vehicle's weapon choice, upgrade pod or garrison squad clears the game data for that weapon or
              squad.
            </li>
            <li>
              Changes that lower a maximum (e.g. HEV size, structure/armor mods or faction perks) keep the game data.
              If it is now over the maximum it is capped the next time you click it.
            </li>
            <li>
              Loading or resetting an army list clears all game data.
            </li>
          </ul>
        </BModal>

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