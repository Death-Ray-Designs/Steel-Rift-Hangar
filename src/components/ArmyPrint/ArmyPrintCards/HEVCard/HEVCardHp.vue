<script setup lang="ts">
import { chunk, sumBy } from 'es-toolkit';
import { computed, inject } from 'vue';
import { FACTION_PERK } from '../../../../data/faction-perks.js';
import { MECH_ARMOR_UPGRADE } from '../../../../data/mech-armor-upgrades';
import { useFactionStore } from '../../../../store/faction-store';
import { useMechStore } from '../../../../store/mech-store';
import { usePlayStore } from '../../../../store/play-store';

const mechStore = useMechStore();
const factionStore = useFactionStore();

const { mechId } = defineProps<{
  mechId: number,
}>();

const info = computed(() => mechStore.getMechInfo(mechId)!);

const structureSystem = computed(() => {
  if (info.value.has_fragile_internals) {
    return 'Fragile Internals';
  }
  if (info.value.has_backup_systems) {
    return 'Backup Systems';
  }
});

const armor6PerRow = computed(() => {
  const armorStat = info.value.armor_stat;
  return armorStat > 15;
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

  if (armor6PerRow.value) {
    return chunk(points, 6);
  }
  return chunk(points, 5);
});

function splitIntoChunkCounts(total: number) {
  const parts = 4;
  const base = Math.floor(total / parts);
  const remainder = total % parts;

  const chunks = Array(parts).fill(base);

  for (let i = 0; i < remainder; i++) {
    chunks[i] += 1;
  }

  return chunks;
}

const structureHp = computed(() => {
  const structure = info.value.structure_stat;

  const chunkCounts = splitIntoChunkCounts(structure);

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

const {
  addHevStructureDamage,
  addHevArmorDamage,
  removeHevStructureDamage,
  removeHevArmorDamage,
  getHevStructureDamage,
  getHevArmorDamage
} = usePlayStore();

const armorDamage = computed(() => getHevArmorDamage(mechId));
const structureDamage = computed(() => getHevStructureDamage(mechId));

function isArmorDamaged(index: number) {
  return index + 1 <= armorDamage.value;
}

function isStructureDamaged(index: number) {
  return index + 1 <= structureDamage.value;
}

function clickStructure(index: number) {
  if (!play) return;
  isStructureDamaged(index) ? removeHevStructureDamage(mechId) : addHevStructureDamage(mechId);
}

function clickArmor(index: number) {
  if (!play) return;
  isArmorDamaged(index) ? removeHevArmorDamage(mechId) : addHevArmorDamage(mechId);
}
</script>
<template>
  <div class="row g-1 row-damage">
    <div class="col-5">
      <div class="hp-heading">
        ARMOR <small
        class="fw-light"
        v-if="armorUpgrades"
      >
        <template v-if="armorUpgrades.length === 1">
          ({{ armorUpgrades[0].display_name }})
        </template>
        <template v-else-if="armorUpgrades.length > 1">
          Multiple ({{ armorUpgrades.length }})
        </template>
      </small>
      </div>
      <div class="hp-container">
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
    <div class="col-7">
      <div class="d-flex">
        <div class="hp-structure flex-grow-1">
          <div class="hp-heading ps-0">
            STRUCTURE
          </div>
          <div class="hp-container">
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
            {{ structureSystem }}
          </div>
        </div>
        <div class="crit-container">
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