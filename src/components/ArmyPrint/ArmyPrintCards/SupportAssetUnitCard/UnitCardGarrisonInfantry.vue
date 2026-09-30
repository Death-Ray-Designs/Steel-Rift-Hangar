<script setup lang="ts">
import { computed, inject } from 'vue';
import { unitTraitDisplayName } from '../../../../data/unit-traits.js';
import { useSupportAssetUnitsStore } from '../../../../store/support-asset-units-store';
import FormatInches from '../../../functional/format-inches.vue';
import { formatCardRef } from '../../../functional/formatters.js';
import UnitCardHalfHeader from './UnitCardHalfHeader.vue';
import BtnPlusMinus from '../../../ArmyPlay/BtnPlusMinus.vue';
import { usePlayStore } from '../../../../store/play-store';

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
  addGarrisonWeaponTimesUsed,
  removeGarrisonWeaponTimesUsed,
  getGarrisonWeaponTimesUsed,
  addGarrisonArmorDamage,
  removeGarrisonArmorDamage,
  getGarrisonArmorDamage,
  addGarrisonStructureDamage,
  removeGarrisonStructureDamage,
  getGarrisonStructureDamage,
} = usePlayStore();

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
          <format-inches :value="item.move"/>
        </td>
        <td
          v-if="hasArmor"
          class="text-start"
        >
          <BtnPlusMinus
            v-if="play && item.armor"
            class="mb-1"
            @add="addGarrisonArmorDamage(unitAttachmentId, item.vehicle_id, item.garrison_index)"
            @remove="removeGarrisonArmorDamage(unitAttachmentId, item.vehicle_id, item.garrison_index)"
          />
          <div class="text-nowrap" v-if="item.armor"><span
            class="use use-armor"
            :class="{used: i <= getGarrisonArmorDamage(unitAttachmentId, item.vehicle_id, item.garrison_index)}"
            v-for="i in item.armor"
          >&nbsp;</span>
          </div>
        </td>
        <td class="text-start">
          <BtnPlusMinus
            v-if="play && item.structure"
            class="mb-1"
            @add="addGarrisonStructureDamage(unitAttachmentId, item.vehicle_id, item.garrison_index)"
            @remove="removeGarrisonStructureDamage(unitAttachmentId, item.vehicle_id, item.garrison_index)"
          />
          <div class="text-nowrap" v-if="item.structure"><span
            class="use use-structure"
            :class="{used: i <= getGarrisonStructureDamage(unitAttachmentId, item.vehicle_id, item.garrison_index)}"
            v-for="i in item.structure"
          >&nbsp;</span>
          </div>
        </td>
        <td class="text-start small">
          <div
            class="d-inline text-nowrap"
            v-for="(weapon, index) in item.weapons"
          >
            {{ weapon.display_name }}
            <BtnPlusMinus
              v-if="play && weapon.max_uses"
              @add="addGarrisonWeaponTimesUsed(unitAttachmentId, item.vehicle_id, item.garrison_index, index)"
              @remove="removeGarrisonWeaponTimesUsed(unitAttachmentId, item.vehicle_id, item.garrison_index, index)"
            />
            <span class="text-nowrap" v-if="weapon.max_uses">&nbsp;<span
              :class="{used: i <= getGarrisonWeaponTimesUsed(unitAttachmentId, item.vehicle_id, item.garrison_index, index)}"
              class="use use-weapon" v-for="i in weapon.max_uses"
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