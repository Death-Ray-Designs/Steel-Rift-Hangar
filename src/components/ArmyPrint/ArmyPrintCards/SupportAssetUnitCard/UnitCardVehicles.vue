<script setup lang="ts">
import { chunk } from 'es-toolkit';
import { computed, inject } from 'vue';
import { UNIT_TRAIT, unitTraitDisplayName } from '../../../../data/unit-traits.js';
import { useSupportAssetUnitsStore } from '../../../../store/support-asset-units-store';
import type { Trait } from '../../../../types';
import FormatInches from '../../../functional/format-inches.vue';
import { formatCardRef } from '../../../functional/formatters.js';
import UnitCardHalfHeader from './UnitCardHalfHeader.vue';
import { usePlayStore } from '../../../../store/play-store';
import { clickedBoxValue } from '../../../../store/helpers/store-counters';

const { unitAttachmentId } = defineProps<{
  unitAttachmentId: number
}>();

const unitStore = useSupportAssetUnitsStore();
const unit = computed(() => unitStore.getUnitAttachmentInfo(unitAttachmentId)!);

const hasMove = computed(() => !!unit.value.vehicles.find((vehicle) => vehicle.move));
const hasJump = computed(() => !!unit.value.vehicles.find((vehicle) => vehicle.jump));
const hasArmor = computed(() => !!unit.value.vehicles.find((vehicle) => vehicle.armor));
const hasGarrison = computed(() => !!unit.value.vehicles.find((vehicle) => vehicle.garrison_units?.length));
const hasTraits = computed(() => !!unit.value.vehicles.find((vehicle) => vehicle.traits.find(t => t.id !== UNIT_TRAIT.GARRISON)));

const hasGarrisonWithRefIds = computed(() => {
  return unit.value.vehicles.find((vehicle) => vehicle.garrison_units?.find(g => g.card_ref_id));
});

const statArray = (stat: number) => {
  return chunk(Array(stat).fill(0), 4);
};

function filterTraits(traits: Trait<UNIT_TRAIT>[]) {
  return traits.filter(t => t.id !== UNIT_TRAIT.GARRISON);
}

const play = inject('play', false);

const {
  setUnitWeaponTimesUsed,
  getUnitWeaponTimesUsed,
  setUnitArmorDamage,
  getUnitArmorDamage,
  setUnitStructureDamage,
  getUnitStructureDamage,
} = usePlayStore();

function isStructureDamaged(damageKey: number, chunkIndex: number, index: number) {
  return chunkIndex * 4 + index < getUnitStructureDamage(unitAttachmentId, damageKey);
}

function isArmorDamaged(damageKey: number, chunkIndex: number, index: number) {
  return chunkIndex * 4 + index < getUnitArmorDamage(unitAttachmentId, damageKey);
}

function clickArmorDamaged(itemId: number, chunkIndex: number, index: number) {
  if (!play) return;
  const damage = getUnitArmorDamage(unitAttachmentId, itemId);
  setUnitArmorDamage(clickedBoxValue(chunkIndex * 4 + index + 1, damage), unitAttachmentId, itemId);
}

function clickStructureDamaged(itemId: number, chunkIndex: number, index: number) {
  if (!play) return;
  const damage = getUnitStructureDamage(unitAttachmentId, itemId);
  setUnitStructureDamage(clickedBoxValue(chunkIndex * 4 + index + 1, damage), unitAttachmentId, itemId);
}

function clickWeaponUse(itemId: number, weaponIndex: number, i: number) {
  if (!play) return;
  const used = getUnitWeaponTimesUsed(unitAttachmentId, itemId, weaponIndex);
  setUnitWeaponTimesUsed(clickedBoxValue(i, used), unitAttachmentId, itemId, weaponIndex);
}

</script>
<template>
  <template v-if="unit.vehicles.length">
    <UnitCardHalfHeader
      label="Unit Models"
      :type-display-name="unit.unit_type.display_name"
      :defense="unit.defense"
    />

    <table class="table-stats">
      <thead>
      <tr>
        <th class="text-start text-nowrap">
          {{ unit.unit_type.display_name }}
        </th>
        <th class="text-end" v-if="hasMove">
          Mov
        </th>
        <th class="text-end" v-if="hasJump">
          Jmp
        </th>
        <th class="text-start" v-if="hasArmor">
          Arm
        </th>
        <th class="text-start">
          Str
        </th>
        <th class="text-start">
          Weapons
        </th>
        <th v-if="hasGarrison" class="text-start" :colspan="hasGarrisonWithRefIds ? 2: 1">
          Garrison
        </th>
        <th class="text-start" v-if="hasTraits">
          Traits
        </th>
      </tr>
      </thead>
      <tbody>
      <tr
        v-for="item in unit.vehicles" :key="item.id"
      >
        <td class="small text-start">
          {{ item.display_name }}
        </td>
        <td class="text-end" v-if="hasMove">
          <format-inches :value="item.move" />
        </td>
        <td class="text-end" v-if="hasJump">
          <format-inches :value="item.jump" />
        </td>
        <td class="text-start" v-if="hasArmor">
          <div class="use-group use-group-stat">
            <div class="text-nowrap" v-for="(chunk, chunkIndex) in statArray(item.armor)"><span
              class="use use-armor"
              :class="{filled: isArmorDamaged(item.id, chunkIndex, i)}"
              @click="clickArmorDamaged(item.id, chunkIndex, i)"
              v-for="(_, i) in chunk"
            >&nbsp;</span>
            </div>
          </div>
        </td>
        <td class="text-start">
          <div class="use-group use-group-stat">
            <div class="text-nowrap" v-for="(chunk, chunkIndex) in statArray(item.structure)"><span
              class="use use-structure"
              :class="{filled: isStructureDamaged(item.id, chunkIndex, i)}"
              @click="clickStructureDamaged(item.id, chunkIndex, i)"
              v-for="(_, i) in chunk"
            >&nbsp;</span>
            </div>
          </div>
        </td>
        <td class="text-start small">
          <div v-for="(weapon, index) in item.weapons">
            {{ weapon.display_name }}
            <template v-if="weapon.max_uses">&nbsp;<span class="text-nowrap"><span
              :class="{filled: i <= getUnitWeaponTimesUsed(unitAttachmentId, item.id, index)}"
              class="use use-weapon" v-for="i in weapon.max_uses"
              @click="clickWeaponUse(item.id, index, i)"
            >&nbsp;</span></span></template>
            <span
              v-if="index !== item.weapons.length - 1"
            >, </span>
          </div>
        </td>
        <td v-if="hasGarrisonWithRefIds" class="text-end small">
          <div
            v-for="squad in item.garrison_units"
            class="text-nowrap font-monospace"
          >
            {{ formatCardRef(squad.card_ref_id) }}
            <div v-if="!squad.card_ref_id">
              &nbsp;
            </div>
          </div>
        </td>
        <td v-if="hasGarrison" class="text-start small">
          <div
            v-for="squadDisplayName in item.garrison_units!.map(i => i.display_name)"
            class="text-nowrap"
          >
            {{ squadDisplayName }}
          </div>
        </td>
        <td class="text-start small" v-if="filterTraits(item.traits).length">
          {{ filterTraits(item.traits).map(t => unitTraitDisplayName(t)).join(', ') }}
        </td>
      </tr>
      </tbody>
    </table>
  </template>
</template>