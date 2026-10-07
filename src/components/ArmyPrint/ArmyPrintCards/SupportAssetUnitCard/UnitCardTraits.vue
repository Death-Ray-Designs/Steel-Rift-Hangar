<script setup lang="ts">
import type { Order } from '../../../../data/orders';
import { UNIT_TRAIT, unitTraitInfo } from '../../../../data/unit-traits.js';
import CardTraitToolTip from '../CardParts/CardTraitToolTip.vue';
import CardToolTip from '../CardParts/CardToolTip.vue';
import type { Trait } from '../../../../types';

const { traits, orders } = defineProps<{
  traits: Trait<UNIT_TRAIT>[],
  orders: Order[],
}>();
</script>

<template>
  <template v-if="traits.length">
    <div class="section-heading">
      Traits
    </div>
    <div class="card-description">
      <template v-for="(trait, index) in traits">
        <CardTraitToolTip :trait="unitTraitInfo(trait)" /><span v-if="index !== traits.length - 1">, </span>
      </template>
      <span v-if="orders.length">
        <span class="fw-bold"> Special Orders: </span>
        <template v-for="(order, index) in orders">
          <CardToolTip :enabled="!!order.description">{{ order.display_name }}<template #content>{{ order.description }}</template></CardToolTip><span v-if="index !== orders.length - 1">, </span>
        </template>
      </span>
    </div>
  </template>
</template>
