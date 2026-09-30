<script setup lang="ts">
import { computed, inject, watch } from 'vue';
import { MECH_UPGRADE } from '../../../../data/mech-upgrades.js';
import { UPGRADE_TRAIT } from '../../../../data/upgrade-traits.js';
import { WEAPON_TRAIT } from '../../../../data/weapon-traits.js';
import { findBy } from '../../../../store/helpers/collection-helper';
import { useMechStore } from '../../../../store/mech-store';
import type { MechWeaponAttachmentInfo, TraitInfo } from '../../../../types';
import DamageFormatter from '../../../UI/DamageFormatter.vue';
import RangeFormatter from '../../../UI/RangeFormatter.vue';
import BtnPlusMinus from '../../../ArmyPlay/BtnPlusMinus.vue';
import { usePlayStore } from '../../../../store/play-store';

const mechStore = useMechStore();
const emit = defineEmits<{
  (e: 'contentChanged'): void,
}>();
const { mechId } = defineProps<{
  mechId: number,
}>();

const weapons = computed(() => {
  let results: (MechWeaponAttachmentInfo & { is_mine_drone?: boolean })[] = mechStore.getMechWeaponsAttachmentInfo(mechId);
  let mineDroneUpgrade = findBy(mechStore.getMechUpgradesAttachmentInfo(mechId), 'upgrade_id', MECH_UPGRADE.MINEFIELD_DRONE_CARRIER_SYSTEM);

  if (mineDroneUpgrade) {
    const mineDroneWeapon: MechWeaponAttachmentInfo = {
      ...mineDroneUpgrade,
      display_name: 'Mine Drones',
      traits: mineDroneUpgrade.traits.filter(trait => trait.id !== UPGRADE_TRAIT.LIMITED) as unknown as TraitInfo<WEAPON_TRAIT>[],
      range: null,
      range_modifier: 0,
      range_total: 0,
      ranged_base_damage: null,
      is_mine_drone: true,
    } as unknown as MechWeaponAttachmentInfo;

    results.push(mineDroneWeapon as unknown as MechWeaponAttachmentInfo);
  }

  const excludeTraitIds = [
    WEAPON_TRAIT.LIMITED,
    WEAPON_TRAIT.SHORT,
  ];
  const droneTraitIds = [
    WEAPON_TRAIT.DRONE_TACTICAL_AWARENESS_ATTACHED,
    WEAPON_TRAIT.DRONE_TARGETING_SUPPORT_ATTACHED,
    UPGRADE_TRAIT.DRONE_MINE_DIRECTOR_ATTACHED,
  ];

  return results.map(item => {
    const traits = item.traits.filter((trait) => !excludeTraitIds.includes(trait.id));
    return {
      ...item,
      shouldShrinkTraits: traits.length > 3 || traits.some(t => droneTraitIds.includes(t.id)),
      traits,
    };
  });
});

const hasUses = computed(() => weapons.value.find(weapon => !!weapon.max_uses));

watch([hasUses, weapons], () => emit('contentChanged'), { flush: 'post' });
const play = inject('play', false);

const playStore = usePlayStore();

// mine drone uses are tracked against the upgrade attachment, not a weapon attachment
function addUse(weapon: typeof weapons.value[number]) {
  if (weapon.is_mine_drone) {
    playStore.addHevUpgradeTimesUsed(mechId, weapon.id);
  } else {
    playStore.addHevWeaponTimesUsed(mechId, weapon.id);
  }
}

function removeUse(weapon: typeof weapons.value[number]) {
  if (weapon.is_mine_drone) {
    playStore.removeHevUpgradeTimesUsed(mechId, weapon.id);
  } else {
    playStore.removeHevWeaponTimesUsed(mechId, weapon.id);
  }
}

function getUses(weapon: typeof weapons.value[number]) {
  if (weapon.is_mine_drone) {
    return playStore.getHevUpgradeTimesUsed(mechId, weapon.id);
  }
  return playStore.getHevWeaponTimesUsed(mechId, weapon.id);
}

</script>
<template>
  <table class="table-stats">
    <thead>
    <tr>
      <th>Weapon</th>
      <th
        class="text-start"
        v-if="hasUses"
      >Ltd
      </th>
      <th>Dmg</th>
      <th>Rng</th>
      <th class="text-start">Traits</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="weapon in weapons">
      <td>
        <div>
          {{ weapon.display_name }}
        </div>
        <BtnPlusMinus
          v-if="play && weapon.max_uses"
          @add="addUse(weapon)"
          @remove="removeUse(weapon)"
        />

      </td>
      <td
        class="text-start"
        v-if="hasUses"
      >
        <span
          class="text-nowrap"
          v-if="weapon.max_uses"
        >
          <span
            class="use use-weapon"
            :class="{used: i <= getUses(weapon)}"
            v-for="i in weapon.max_uses"
            :key="i"
          >&nbsp;</span>
        </span>
      </td>
      <td class="text-nowrap">
        <DamageFormatter
          :ranged-base-damage="weapon.ranged_base_damage"
          :ranged-total-damage="weapon.ranged_total_damage"
          :combat-shield-damage-penalty="weapon.combat_shield_damage_penalty"
          :melee-base-damage="weapon.melee_base_damage"
          :melee-modifier-damage="weapon.melee_trait_damage"
          :melee-total-damage="weapon.melee_total_damage"
        />
      </td>
      <td class="text-nowrap">
        <RangeFormatter
          :range="weapon.range"
          :modifier="weapon.range_modifier"
          :total="weapon.range_total"
        />
      </td>
      <td
        class="text-start"
        :class="weapon.shouldShrinkTraits ? 'small-traits' : ''"
      >
        <div v-for="(trait, index) in weapon.traits">
          {{ trait.card_display_name ?? trait.display_name }}<span v-if="index !== weapon.traits.length - 1">, </span>
        </div>
      </td>
    </tr>
    </tbody>
  </table>
</template>