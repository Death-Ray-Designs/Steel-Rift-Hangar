<script setup lang="ts">
import { computed, inject } from 'vue';
import { unitTraitDisplayName } from '../../../../data/unit-traits.js';
import { useSupportAssetUnitsStore } from '../../../../store/support-asset-units-store';
import FormatInches from '../../../functional/format-inches.vue';
import { formatCardRef } from '../../../functional/formatters.js';
import UnitCardHalfHeader from './UnitCardHalfHeader.vue';
import { usePlayStore } from '../../../../store/play-store';
import { clickedBoxValue } from '../../../../store/helpers/store-counters';

const { unitAttachmentId } = defineProps<{
  unitAttachmentId: number
}>();

const unitStore = useSupportAssetUnitsStore();
const units = computed(() => {
  const vehicles = unitStore.getUnitAttachmentInfo(unitAttachmentId)?.vehicles ?? [];
  return vehicles.flatMap((vehicle) => vehicle.garrison_units.map((unit, garrisonIndex) => ({
    ...unit,
    vehicle_id: vehicle.id,
    garrison_index: garrisonIndex,
  })));
});
const hasCardRefIds = computed(() => !!units.value.find((unit) => unit.card_ref_id));
const hasArmor = computed(() => !!units.value.find((unit) => unit.armor));

const play = inject('play', false);

const {
  setGarrisonWeaponTimesUsed,
  getGarrisonWeaponTimesUsed,
  setGarrisonArmorDamage,
  getGarrisonArmorDamage,
  setGarrisonStructureDamage,
  getGarrisonStructureDamage,
} = usePlayStore();

function clickArmor(vehicleId: number, garrisonIndex: number, i: number) {
  if (!play) return;
  const damage = getGarrisonArmorDamage(unitAttachmentId, vehicleId, garrisonIndex);
  setGarrisonArmorDamage(clickedBoxValue(i, damage), unitAttachmentId, vehicleId, garrisonIndex);
}

function clickStructure(vehicleId: number, garrisonIndex: number, i: number) {
  if (!play) return;
  const damage = getGarrisonStructureDamage(unitAttachmentId, vehicleId, garrisonIndex);
  setGarrisonStructureDamage(clickedBoxValue(i, damage), unitAttachmentId, vehicleId, garrisonIndex);
}

function clickWeapon(vehicleId: number, garrisonIndex: number, weaponIndex: number, i: number) {
  if (!play) return;
  const used = getGarrisonWeaponTimesUsed(unitAttachmentId, vehicleId, garrisonIndex, weaponIndex);
  setGarrisonWeaponTimesUsed(clickedBoxValue(i, used), unitAttachmentId, vehicleId, garrisonIndex, weaponIndex);
}

</script>
<template>
  <template v-if="units.length">
    <UnitCardHalfHeader
      label="Garrisoned Units"
      :type-display-name="units[0].unit_type.display_name"
      :defense="3"
    />
    <table class="table-stats table-stats-small">
      <thead>
      <tr>
        <th class="text-start text-nowrap" :colspan="hasCardRefIds ? 2 : 1">
          Inf. Squad
        </th>
        <th class="text-end">
          Mov
        </th>
        <th
          v-if="hasArmor"
          class="text-start"
        >
          Arm
        </th>
        <th class="text-start">
          Str
        </th>
        <th class="text-start">
          Weapons
        </th>
        <th class="text-start">
          Traits
        </th>
      </tr>
      </thead>
      <tbody>
      <tr
        v-for="item in units" :key="`${item.vehicle_id}-${item.garrison_index}`"
      >
        <td v-if="hasCardRefIds" class="text-end font-monospace small">
          {{ formatCardRef(item.card_ref_id) }}
        </td>
        <td class="text-start small">
          {{ item.display_name }}
        </td>
        <td class="text-end">
          <format-inches :value="item.move" />
        </td>
        <td
          v-if="hasArmor"
          class="text-start"
        >
          <div class="text-nowrap use-group use-group-stat" v-if="item.armor"><span
            class="use use-armor"
            :class="{filled: i <= getGarrisonArmorDamage(unitAttachmentId, item.vehicle_id, item.garrison_index)}"
            v-for="i in item.armor"
            @click="clickArmor(item.vehicle_id, item.garrison_index, i)"
          >&nbsp;</span>
          </div>
        </td>
        <td class="text-start">
          <div class="text-nowrap use-group use-group-stat" v-if="item.structure"><span
            class="use use-structure"
            :class="{filled: i <= getGarrisonStructureDamage(unitAttachmentId, item.vehicle_id, item.garrison_index)}"
            v-for="i in item.structure"
            @click="clickStructure(item.vehicle_id, item.garrison_index, i)"
          >&nbsp;</span>
          </div>
        </td>
        <td class="text-start small">
          <div
            class="d-inline text-nowrap"
            v-for="(weapon, index) in item.weapons"
          >
            {{ weapon.display_name }}
            <span class="text-nowrap" v-if="weapon.max_uses">&nbsp;<span
              :class="{filled: i <= getGarrisonWeaponTimesUsed(unitAttachmentId, item.vehicle_id, item.garrison_index, index)}"
              class="use use-weapon" v-for="i in weapon.max_uses"
              @click="clickWeapon(item.vehicle_id, item.garrison_index, index, i)"
            >&nbsp;</span></span><span
            v-if="index !== item.weapons.length - 1"
          >, </span>
          </div>
        </td>
        <td class="text-start small">
          {{ item.traits.map(t => unitTraitDisplayName(t)).join(', ') }}
        </td>
      </tr>
      </tbody>
    </table>
  </template>
</template>