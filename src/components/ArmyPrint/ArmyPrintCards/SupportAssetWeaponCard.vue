<script setup lang="ts">
import { computed } from 'vue';
import type { SUPPORT_ASSET_WEAPON } from '../../../data/support-asset-weapons';
import { WEAPON_TRAIT } from '../../../data/weapon-traits.js';
import { findById } from '../../../store/helpers/collection-helper';
import { useSupportAssetWeaponsStore } from '../../../store/support-asset-weapons-store';
import SvgIcon from '../../UI/Icon.vue';
import SupportAssetWeaponDamageFormatter from '../../UI/SupportAssetWeaponDamageFormatter.vue';
import CardFooter from './CardParts/CardFooter.vue';
import CardHeader from './CardParts/CardHeader.vue';
import CardTraitToolTip from './CardParts/CardTraitToolTip.vue';
import CardToolTip from './CardParts/CardToolTip.vue';

const supportAssetStore = useSupportAssetWeaponsStore();

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
  if (limitedTrait) {
    return limitedTrait.X;
  }
});
</script>
<template>
  <div class="game-card card-support-asset-size-1">
    <div class="card-content-container">
      <CardHeader
        :title="info.display_name"
        :sub-title="`(Support Asset ${info.cost} Tons)`"
      />

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
              <span class="use use-weapon" v-for="i in Array(max_uses)">&nbsp;</span>
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
    </div>
  </div>
</template>