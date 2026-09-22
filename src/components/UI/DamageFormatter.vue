<script setup lang="ts">

const {
  meleeTotalDamage,
  meleeModifierDamage,
  meleeBaseDamage,
  rangedBaseDamage,
  combatShieldDamagePenalty,
  rangedTotalDamage,
  suffix = '',
} = defineProps<{
  meleeBaseDamage?: number | null,
  meleeModifierDamage?: number,
  meleeTotalDamage?: number,
  rangedBaseDamage: number | null,
  rangedTotalDamage: number | null,
  combatShieldDamagePenalty: number,
  suffix?: string
}>();
</script>
<template>
  <div v-if="meleeBaseDamage" class="text-end">
    <small class="fw-light">
      {{ meleeBaseDamage }}+{{ meleeModifierDamage }} =
    </small>
    {{ meleeTotalDamage }}
  </div>
  <template v-else-if="rangedBaseDamage && combatShieldDamagePenalty">
    <small class="fw-light">
      {{ rangedBaseDamage }}-{{ combatShieldDamagePenalty }} =
    </small>
    {{ rangedTotalDamage }}
    {{ suffix }}
  </template>
  <template v-else>
    {{ rangedTotalDamage }}{{ suffix }}
  </template>
</template>