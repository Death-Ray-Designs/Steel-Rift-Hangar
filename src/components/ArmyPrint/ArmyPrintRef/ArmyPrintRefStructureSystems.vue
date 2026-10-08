<script setup lang="ts">
import { computed } from 'vue';
import { BACKUP_SYSTEMS, FRAGILE_INTERNALS } from '../../../data/mech-structure-systems';
import { useMechStore } from '../../../store/mech-store';

const mechStore = useMechStore();

const systems = computed(() => {
  const infos = mechStore.mechs.map(mech => mechStore.getMechInfo(mech.id)!);
  const results = [];

  if (infos.some(info => info.has_backup_systems)) {
    results.push(BACKUP_SYSTEMS);
  }

  if (infos.some(info => info.has_fragile_internals)) {
    results.push(FRAGILE_INTERNALS);
  }

  return results;
});
</script>
<template>
  <div v-if="systems.length">
    <div class="divider"></div>
    <div class="ref-heading">Structure Systems</div>
    <p v-for="item in systems" :key="item.display_name" class="p-gap">
      <span class="fw-bold">
        {{ item.display_name }}:
      </span>
      {{ item.description }}
    </p>
  </div>
</template>
