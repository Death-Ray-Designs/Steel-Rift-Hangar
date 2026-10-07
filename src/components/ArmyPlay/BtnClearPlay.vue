<script setup lang="ts">
import { BButton, BModal } from 'bootstrap-vue-next';
import { ref } from 'vue';
import { usePlayStore } from '../../store/play-store';

const playStore = usePlayStore();
const resetModal = ref(false);

</script>
<template>
  <BButton
    @click="resetModal = !resetModal"
    size="sm"
    variant="danger"
    class="mx-3"
  >
    Clear
  </BButton>
  <BModal
    v-model="resetModal"
    centered
    @ok="playStore.$reset()"
    ok-variant="danger"
    title="Clear Play State"
  >
    <div class="lead">
      Are you sure you want to clear all game data?
    </div>
  </BModal>
</template>