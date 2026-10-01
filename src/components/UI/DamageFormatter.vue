<script setup lang="ts">

import { computed } from 'vue';

const {
  meleeTotalDamage,
  meleeModifierDamage,
  meleeBaseDamage,
  rangedBaseDamage,
  combatShieldDamagePenalty,
  rangedTotalDamage,
  suffix = '',
  hasDamageCritical = false
} = defineProps<{
  meleeBaseDamage?: number | null,
  meleeModifierDamage?: number,
  meleeTotalDamage?: number,
  rangedBaseDamage: number | null,
  rangedTotalDamage: number | null,
  combatShieldDamagePenalty: number,
  suffix?: string
  hasDamageCritical?: boolean
}>();

const meleeTotalDamageValue = computed(() => {
  if (hasDamageCritical && meleeTotalDamage) {
    return meleeTotalDamage - 1;
  }
  return meleeTotalDamage;
});

const meleeDamagePenalty = computed(() => (hasDamageCritical ? 1 : 0));
const rangedDamagePenalty = computed(() => combatShieldDamagePenalty + (hasDamageCritical ? 1 : 0));

const rangedTotalDamageValue = computed(() => {
  if (!rangedTotalDamage) return null;
  if (hasDamageCritical) {
    return rangedTotalDamage - 1;
  }
  return rangedTotalDamage;
});
</script>
<template>
  <div v-if="meleeBaseDamage" class="text-end">
    <small class="fw-light">
      {{ meleeBaseDamage }} + {{ meleeModifierDamage }}
      <template v-if="meleeDamagePenalty"> - {{ meleeDamagePenalty }}</template>
      =
    </small>
    {{ meleeTotalDamageValue }}
  </div>
  <!--  damage cannot be zero  -->
  <template v-else-if="rangedTotalDamageValue === 0">
    1{{ suffix }}
  </template>
  <template v-else-if="rangedBaseDamage && rangedDamagePenalty">
    <small class="fw-light">
      {{ rangedBaseDamage }} - {{ rangedDamagePenalty }} =
    </small>
    {{ rangedTotalDamageValue }}{{ suffix }}
  </template>
  <template v-else>
    {{ rangedTotalDamageValue }}{{ suffix }}
  </template>
</template>