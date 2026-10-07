<script setup lang="ts">
import { BModal } from 'bootstrap-vue-next';

import { onBeforeRouteLeave, type RouteLocationNormalized, useRouter } from 'vue-router';
import { ref } from 'vue';
import { usePlayStore } from '../../store/play-store';

const playStore = usePlayStore();

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
</template>