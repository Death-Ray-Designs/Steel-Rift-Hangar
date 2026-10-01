<script setup lang="ts">
import { chunk, flatMap } from 'es-toolkit';
import { computed } from 'vue';
import FactionPerkCard from './ArmyPrintCards/FactionPerkCard.vue';
import HEVCard from './ArmyPrintCards/HEVCard.vue';
import MineDroneCard from './ArmyPrintCards/MineDroneCard.vue';
import MSOECard from './ArmyPrintCards/MSOECard.vue';
import SupportAssetUnitCard from './ArmyPrintCards/SupportAssetUnitCard.vue';
import SupportAssetWeaponCard from './ArmyPrintCards/SupportAssetWeaponCard.vue';
import {
  type CardItem,
  type SupportAssetUnitCardType,
  type SupportAssetWeaponCardType,
  useCardStore
} from '../../store/card-store';
import { usePrintSettingsStore } from '../../store/print-settings-store';

const printSettingsStore = usePrintSettingsStore();
const cardStore = useCardStore();

const pages = computed(() => {

  const mechCardsByTeam = cardStore.mech_cards_by_team;

  if (printSettingsStore.one_team_per_page) {
    let cardPages: CardItem[][] = [];
    Object.values(mechCardsByTeam).forEach(mechCards => {
      const teamPages = chunk(mechCards, 9);
      cardPages = [...cardPages, ...teamPages];
    });

    const refPages = chunk(cardStore.reference_cards, 9);
    return [
      ...cardPages,
      ...refPages,
    ];
  }

  let cards: CardItem[] = flatMap(Object.values(mechCardsByTeam), (cards) => cards);
  if (printSettingsStore.separate_reference_cards_page) {
    const cardPages = chunk(cards, 9);
    const refPages = chunk(cardStore.reference_cards, 9);
    return [
      ...cardPages,
      ...refPages,
    ];
  }

  cards = [
    ...cards,
    ...cardStore.reference_cards,
  ];

  return chunk(cards, 9);
});

const supportAssetPages = computed(() => {
  const cards: (SupportAssetUnitCardType | SupportAssetWeaponCardType)[] = [
    ...cardStore.support_asset_unit_cards,
    ...cardStore.support_asset_weapon_cards,
  ];

  const slotsPerPage = 6;
  const pages = [];

  let currentPage: CardItem[] = [];
  let currentPageSize = 0;

  cards.forEach(card => {

    if (currentPageSize === slotsPerPage || currentPageSize + card.cardSize > slotsPerPage) {
      pages.push(currentPage);
      currentPage = [];
      currentPageSize = 0;
    }

    currentPage.push(card);
    currentPageSize += card.cardSize;
  });

  if (currentPage.length) {
    pages.push(currentPage);
  }
  return pages;
});

</script>
<template>
  <div
    v-for="page in pages"
    class="page-preview page-letter"
    style="background-color:white"
  >
    <div class="page-card-grid">
      <template v-for="item in page">
        <HEVCard v-if="item.type === 'hev'" :mech-id="item.mechId" />
        <MineDroneCard v-if="item.type === 'mine_drone'" />
        <MSOECard v-if="item.type === 'msoe'" />
        <FactionPerkCard v-if="item.type === 'faction_perk'" :perk-id="item.perkId" />
      </template>
    </div>
  </div>

  <div
    v-for="page in supportAssetPages"
    class="page-preview page-letter"
    style="background-color:white"
  >
    <div class="page-card-grid-flex">
      <template v-for="item in page">
        <SupportAssetWeaponCard
          v-if="item.type === 'support_asset_weapon'"
          :support-asset-id="item.supportAssetId"
        />
        <SupportAssetUnitCard
          v-if="item.type === 'support_asset_unit'"
          :unit-attachment-id="item.unitAttachmentId"
        />
      </template>
    </div>
  </div>
</template>
