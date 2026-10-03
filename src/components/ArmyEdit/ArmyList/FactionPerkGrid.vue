<script setup lang="ts">
import { BButton, BModal } from 'bootstrap-vue-next';
import { storeToRefs } from 'pinia';
import type { FACTION } from '../../../data/factions';
import { useFactionStore } from '../../../store/faction-store';

const model = defineModel<boolean>();
const store = useFactionStore();

const {
  faction_id,
  factions_info,
  perk_grid,
  faction,
} = storeToRefs(store);

const { addPerk, removePerk, hasPerk, canAddPerk, clearInvalidPerks } = store;

function setFactionId(factionId: FACTION) {
  faction_id.value = factionId;
  clearInvalidPerks();
}
</script>
<template>
  <BModal
    v-model="model"
    :autofocus="false"
    no-trap
    centered
    ok-variant="secondary"
    size="xl"
  >
    <template #title>
      Faction Perks <span class="fw-light">(Pick 2)</span>
    </template>


    <ul class="nav nav-tabs nav-tabs-factions">
      <li class="nav-link disabled tab-select-faction" role="presentation">Select Faction:</li>
      <li class="nav-item" v-for="factionInfo in factions_info" :key="factionInfo.id">
        <button :class="{'nav-link': true, 'active': factionInfo.id === faction_id}" @click="setFactionId(factionInfo.id)">
          {{ factionInfo.display_name }}
        </button>
      </li>
    </ul>

    <p v-if="faction.rules_description" class="mt-3 px-3">
      {{ faction.rules_description }}
    </p>


    <div
      class="my-4"
      v-for="group in perk_grid"
      :key="group.id"
    >
      <h4 class="fw-bold ps-3">
        {{ group.display_name }}
      </h4>

      <template v-for="section in group.sections" :key="section.key">
        <h5 class="ps-3 mb-2" v-if="section.copied_from">
          <strong>{{ section.prefix }}</strong>
          <span class="fw-light"> &mdash; </span>
          <span class="fw-bold text-primary">{{ section.copied_from.faction?.display_name }}: </span>
          <span class="text-muted">
          {{ section.copied_from.group?.display_name }}
          </span>
        </h5>

        <div class="row row-cols-1 row-cols-lg-3">

          <div
            class="col pb-3"
            v-for="perk in section.perks"
            :key="perk.id"
          >
            <div :class="{'card card-faction-perk h-100': true, 'border border-primary': hasPerk(perk.id)}">

              <div class="card-header ps-3 fw-bold">
                {{ perk.copied_from ? perk.copied_from.perk.display_name : perk.display_name }}
              </div>
              <div class="card-body">
                {{ perk.description }}
              </div>
              <div class="card-footer text-end">
                <BButton
                  class="btn"
                  variant="secondary"
                  :disabled="!canAddPerk(perk.id)"
                  v-if="!hasPerk(perk.id)"
                  @click="addPerk(perk.id)"
                >
                  Add Perk
                </BButton>
                <BButton
                  class="btn"
                  variant="danger"
                  v-if="hasPerk(perk.id)"
                  @click="removePerk(perk.id)"
                >
                  Remove Perk
                </BButton>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <template #cancel>&nbsp;</template>
  </BModal>
</template>