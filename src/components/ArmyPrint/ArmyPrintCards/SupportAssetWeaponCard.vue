<script setup lang="ts">
import { BButton } from 'bootstrap-vue-next';
import { computed, inject } from 'vue';
import type { SUPPORT_ASSET_WEAPON } from '../../../data/support-asset-weapons';
import { WEAPON_TRAIT } from '../../../data/weapon-traits.js';
import { findById } from '../../../store/helpers/collection-helper';
import { clickedBoxValue } from '../../../store/helpers/store-counters';
import { usePlayStore } from '../../../store/play-store';
import { useSupportAssetWeaponsStore } from '../../../store/support-asset-weapons-store';
import SvgIcon from '../../UI/Icon.vue';
import SupportAssetWeaponDamageFormatter from '../../UI/SupportAssetWeaponDamageFormatter.vue';
import CardFooter from './CardParts/CardFooter.vue';
import CardHeader from './CardParts/CardHeader.vue';
import CardTraitToolTip from './CardParts/CardTraitToolTip.vue';
import CardToolTip from './CardParts/CardToolTip.vue';

const supportAssetStore = useSupportAssetWeaponsStore();
const {
  getSupportAssetWeaponTimesUsed,
  setSupportAssetWeaponTimesUsed,
  isSupportAssetWeaponHidden,
  setSupportAssetWeaponHidden,
} = usePlayStore();

const play = inject('play', false);

const { supportAssetId } = defineProps<{
  supportAssetId: SUPPORT_ASSET_WEAPON,
}>();

const info = computed(() => supportAssetStore.getSupportAssetInfo(supportAssetId));

const weapon = computed(() => info.value.off_table_weapon);

const traits = computed(() => {
  return weapon.value.traits.filter(trait => trait.id !== WEAPON_TRAIT.LIMITED);
});

const max_uses = computed(() => {
  const limitedTrait = findById(weapon.value.traits, WEAPON_TRAIT.LIMITED);
  if (typeof limitedTrait?.X === 'number') {
    return limitedTrait.X;
  }
});

const hidden = computed(() => play && isSupportAssetWeaponHidden(supportAssetId));
const showHideBtn = computed(() => play && (hidden.value || (!!max_uses.value && getSupportAssetWeaponTimesUsed(supportAssetId) >= max_uses.value)));

function clickUse(i: number) {
  if (!play) return;
  const used = getSupportAssetWeaponTimesUsed(supportAssetId);
  setSupportAssetWeaponTimesUsed(clickedBoxValue(i, used), supportAssetId);
}
</script>
<template>
  <div class="game-card card-support-asset-size-1" :class="hidden ? 'pb-0' : ''">
    <div class="card-content-container">
      <CardHeader
        :title="info.display_name"
        :sub-title="`(Support Asset ${info.cost} Tons)`"
      >
        <template #after-title>
          <BButton
            v-if="showHideBtn"
            size="sm"
            :variant="hidden ? 'secondary' : 'danger'"
            class="me-1 py-0"
            @click="setSupportAssetWeaponHidden(supportAssetId, !hidden)"
          >
            {{ hidden ? 'Show Used' : 'Hide Used' }}
          </BButton>
        </template>
      </CardHeader>

      <template v-if="!hidden">
        <div class="section-heading">Support Asset</div>
        <div class="card-description">
          {{ info.description }}
        </div>

        <table class="table-stats">
          <thead>
          <tr>
            <th>Weapon</th>
            <th class="text-start" v-if="max_uses">Ltd</th>
            <th v-if="weapon.damage">Dmg</th>
            <th class="text-start">Traits</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>
              {{ info.display_name }}
            </td>
            <td class="text-start" v-if="max_uses">
              <span class="text-nowrap">
                <span
                  :class="{filled: play && i <= getSupportAssetWeaponTimesUsed(supportAssetId)}"
                  class="use use-weapon" v-for="i in max_uses"
                  :key="i"
                  @click="clickUse(i)"
                >&nbsp;</span>
              </span>
            </td>
            <td v-if="weapon.damage">
              <SupportAssetWeaponDamageFormatter
                :damage="weapon.damage"
                :damage-modifiers="weapon.damage_modifiers ?? []"
              />
            </td>
            <td class="text-start">
              <template v-for="(trait, index) in traits">
                <CardTraitToolTip :trait="trait" /><span v-if="index !== traits.length - 1">, </span>
              </template>
            </td>
          </tr>
          </tbody>
        </table>
        <template v-if="info.notes?.length">
          <div class="section-heading">
            Notes
          </div>
          <div class="card-description">
            <div v-for="note in info.notes">
              <CardToolTip :enabled="!!note.description">
                {{ note.display_name }}
                <template #title>
                  <template v-if="note.is_team_perk">Team Perk</template>
                  <template v-else-if="note.is_faction_perk">Faction Perk</template>
                </template>
                <template #content>{{ note.description }}</template>
              </CardToolTip>
              <SvgIcon v-if="note.is_team_perk" name="team-perk" size="14px" />
              <span class="material-symbols-outlined" v-if="note.is_faction_perk" style="font-size: 12px">flag</span>
            </div>
          </div>
        </template>

        <CardFooter />
      </template>
    </div>
  </div>
</template>