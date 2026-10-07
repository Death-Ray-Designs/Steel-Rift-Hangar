<script setup lang="ts">
import type { TraitInfo } from '../../../../types';
import GrantedOrders from '../../../UI/GrantedOrders.vue';
import CardToolTip from './CardToolTip.vue';

const { trait } = defineProps<{
  trait: TraitInfo<any>,
}>();
</script>
<template>
  <CardToolTip :enabled="!!(trait.description || trait.granted_order_ids?.length)">
    <slot>{{ trait.display_name }}</slot>
    <template #content>
      {{ trait.description }}
      <GrantedOrders :order-ids="trait.granted_order_ids ?? []" />
    </template>
  </CardToolTip>
</template>
