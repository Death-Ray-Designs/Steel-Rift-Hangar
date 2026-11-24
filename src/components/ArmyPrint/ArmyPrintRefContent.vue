<script setup lang="ts">
import ArmyPrintRefFaction from './ArmyPrintRef/ArmyPrintRefFaction.vue';
import ArmyPrintRefHeader from './ArmyPrintRef/ArmyPrintRefHeader.vue';
import ArmyPrintRefSecondaryAgendas from './ArmyPrintRef/ArmyPrintRefSecondaryAgendas.vue';
import ArmyPrintRefSpecialOrders from './ArmyPrintRef/ArmyPrintRefSpecialOrders.vue';
import ArmyPrintRefStructureSystems from './ArmyPrintRef/ArmyPrintRefStructureSystems.vue';
import ArmyPrintRefTeams from './ArmyPrintRef/ArmyPrintRefTeams.vue';
import ArmyPrintRefTraits from './ArmyPrintRef/ArmyPrintRefTraits.vue';
import ArmyPrintRefUpgrades from './ArmyPrintRef/ArmyPrintRefUpgrades.vue';

const { showHeader = true } = defineProps<{
  showHeader?: boolean
}>();
</script>
<template>
  <div class="page-army-reference">
    <ArmyPrintRefHeader v-if="showHeader" />
    <ArmyPrintRefFaction />
    <ArmyPrintRefTeams />
    <ArmyPrintRefSecondaryAgendas />
    <ArmyPrintRefUpgrades />
    <ArmyPrintRefStructureSystems />
    <ArmyPrintRefSpecialOrders />
    <ArmyPrintRefTraits />
  </div>
</template>
