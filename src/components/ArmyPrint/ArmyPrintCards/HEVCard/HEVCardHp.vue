<script setup lang="ts">
import { chunk, sumBy } from 'es-toolkit';
import { computed, inject } from 'vue';
import { FACTION_PERK } from '../../../../data/faction-perks.js';
import { MECH_ARMOR_UPGRADE } from '../../../../data/mech-armor-upgrades';
import { useFactionStore } from '../../../../store/faction-store';
import { useMechStore } from '../../../../store/mech-store';
import { usePlayStore } from '../../../../store/play-store';
import { clickedBoxValue } from '../../../../store/helpers/store-counters';
import { splitHevStructureIntoCriticalChunkSizes } from '../../../../data/hev-helpers';
import BtnPlusMinus from '../../../ArmyPlay/BtnPlusMinus.vue';
import CardToolTip from '../CardParts/CardToolTip.vue';
import { BACKUP_SYSTEMS, FRAGILE_INTERNALS } from '../../../../data/mech-structure-systems';

const mechStore = useMechStore();
const factionStore = useFactionStore();

const { mechId } = defineProps<{
  mechId: number,
}>();

const info = computed(() => mechStore.getMechInfo(mechId)!);

const structureSystem = computed(() => {
  if (info.value.has_fragile_internals) {
    return FRAGILE_INTERNALS;
  }
  if (info.value.has_backup_systems) {
    return BACKUP_SYSTEMS;
  }
});

const armorPerRow = computed(() => {
  const armorStat = info.value.armor_stat;
  if (armorStat > 18) {
    return 7;
  }
  if (armorStat > 15) {
    return 6;
  }
  return 5;
});

const structure6PerRow = computed(() => {
  const structureStat = info.value.structure_stat;
  return structureStat > 10;
});

const armorHp = computed(() => {
  const armorStat = info.value.armor_stat;
  const armorUpgrades = mechStore.getMechAllArmorUpgradesInfo(mechId);
  const extraArmor = sumBy(armorUpgrades, (v) => v.armor_mod ?? 0);
  const baseArmor = armorStat - extraArmor;

  type ArmorHP = {
    type: 'armor' | 'extra_armor',
    index: number
  }

  const points = [
    ...new Array(baseArmor).fill(0).map((v, index) => ({ type: 'armor', index })),
    ...new Array(extraArmor).fill(0).map((v, index) => ({ type: 'extra_armor', index: baseArmor + index })),
  ] as ArmorHP[];

  return chunk(points, armorPerRow.value);
});

const structureHp = computed(() => {
  const structure = info.value.structure_stat;

  const chunkCounts = splitHevStructureIntoCriticalChunkSizes(structure);

  type StructureHP = {
    type: 'M' | 'D' | 'Ø' | '-' | null
    index: number,
  }

  let points: string[] = [];
  const map = [
    'M',
    'D',
    'Ø',
  ];

  chunkCounts.forEach((count, index) => {
    const items = Array(count).fill(0);

    items[items.length - 1] = map[index];
    points = points.concat(items);
  });

  if (factionStore.hasPerk(FACTION_PERK.RD_ADVANCED_STRUCTURAL_COMPONENTS)) {
    points = ['-', '-'].concat(points);
    points.splice(points.length - 2, 2);
  }

  const result = points.map((v, index) => ({ type: v, index })) as StructureHP[];
  if (structure6PerRow.value) {
    return chunk(result, 6);
  }
  return chunk(result, 5);
});

const armorUpgrades = computed(() => {
  const armorUpgrades = mechStore.getMechAllArmorUpgradesInfo(mechId);

  const exclude: string[] = [
    MECH_ARMOR_UPGRADE.NO_ARMOR_UPGRADE,
    MECH_ARMOR_UPGRADE.EXTRA_PLATING_ARMOR_UPGRADE,
    MECH_ARMOR_UPGRADE.HEAVY_PLATING_ARMOR_UPGRADE,
    MECH_ARMOR_UPGRADE.REDUNDANT_INTERNALS,
  ];

  return armorUpgrades.filter(armorUpgrade => !exclude.includes(armorUpgrade.id ?? ''));
});

const play = inject('play', false);

const playStore = usePlayStore();
// in play mode the crit reference can be hidden to give the damage boxes more room
const hideCritReference = computed(() => play && !playStore.showCritReference);
const {
  addHevStructureDamage,
  addHevArmorDamage,
  removeHevStructureDamage,
  removeHevArmorDamage,
  setHevArmorDamage,
  setHevStructureDamage,
  getHevStructureDamage,
  getHevArmorDamage,
} = playStore;

const armorDamage = computed(() => getHevArmorDamage(mechId));
const structureDamage = computed(() => getHevStructureDamage(mechId));

function isArmorDamaged(index: number) {
  return play && index + 1 <= armorDamage.value;
}

function isStructureDamaged(index: number) {
  return play && index + 1 <= structureDamage.value;
}

function clickStructure(index: number) {
  if (!play) return;
  setHevStructureDamage(clickedBoxValue(index + 1, structureDamage.value), mechId);
}

function clickArmor(index: number) {
  if (!play) return;
  setHevArmorDamage(clickedBoxValue(index + 1, armorDamage.value), mechId);
}
</script>
<template>
  <div class="row row-damage" :class="play ? 'g-2' : 'g-1'">
    <div :class="hideCritReference ? 'col-6' : 'col-5'">
      <div class="hp-heading">
        ARMOR <small
        class="fw-light"
        v-if="armorUpgrades"
      >
        <template v-if="armorUpgrades.length === 1">
          (<CardToolTip :enabled="!!armorUpgrades[0].description">{{ armorUpgrades[0].display_name }}<template #content>{{ armorUpgrades[0].description }}</template></CardToolTip>)
        </template>
        <template v-else-if="armorUpgrades.length > 1">
          <CardToolTip>Multiple ({{ armorUpgrades.length }})<template #content>
            <div v-for="armor in armorUpgrades" :key="armor.id">
              <span class="fw-bold">{{ armor.display_name }}:</span> {{ armor.description }}
            </div>
          </template></CardToolTip>
        </template>
      </small>
      </div>
      <BtnPlusMinus
        @add="addHevArmorDamage(mechId)"
        @remove="removeHevArmorDamage(mechId)"
        class="mb-1 d-inline-flex w-100"
      />

      <div class="hp-container" :class="`hp-${armorPerRow}-per-row`">
        <div class="hp-row" v-for="row in armorHp">
          <span
            class="hp hp-armor"
            :class="{filled: isArmorDamaged(item.index)}"
            v-for="item in row"
            @click="clickArmor(item.index)"
          >
            <template v-if="item.type === 'extra_armor'">+</template>
          </span>
        </div>
      </div>
    </div>
    <div :class="hideCritReference ? 'col-6' : 'col-7'">
      <div class="d-flex">
        <div class="hp-structure flex-grow-1">
          <div class="hp-heading ps-0">
            STRUCTURE
          </div>

          <BtnPlusMinus
            @add="addHevStructureDamage(mechId)"
            @remove="removeHevStructureDamage(mechId)"
            class="mb-1 d-inline-flex w-100"
            :class="hideCritReference ? '' : 'pe-2'"
          />

          <div class="hp-container" :class="play && !hideCritReference ? 'pe-2' : ''">
            <div class="hp-row" v-for="row in structureHp">
              <span
                class="hp hp-structure"
                :class="{filled: isStructureDamaged(item.index)}"
                v-for="item in row"
                @click="clickStructure(item.index)"
              >
                <span v-if="item.type">{{ item.type }}</span>
                <span v-else>&nbsp;</span>
              </span>
            </div>
          </div>
          <div class="structure-systems" v-if="structureSystem">
            <CardToolTip>{{ structureSystem.display_name }}<template #content>{{ structureSystem.description }}</template></CardToolTip>
          </div>
        </div>
        <div class="crit-container" v-if="!hideCritReference">
          <div class="crit-heading">
            CRIT
          </div>
          <div class="crit-content">
            <table class="table-crit">
              <tbody>
              <tr>
                <td>
                  <strong>(M)</strong>ove
                </td>
                <td class="text-end">
                  -1
                </td>
              </tr>
              <tr>
                <td>
                  <strong>(D)</strong>mg
                </td>
                <td class="text-end">
                  -1
                </td>
              </tr>
              <tr>
                <td>
                  <strong>(Ø)</strong>rders
                </td>
                <td class="text-end">
                  -1
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>