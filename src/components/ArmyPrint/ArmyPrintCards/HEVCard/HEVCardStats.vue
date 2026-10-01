<script setup lang="ts">
import { computed, inject } from 'vue';
import { useMechStore } from '../../../../store/mech-store';
import { useTeamStore } from '../../../../store/team-store';
import FormatInches from '../../../functional/format-inches.vue';
import SvgIcon from '../../../UI/Icon.vue';
import { usePlayStore } from '../../../../store/play-store';

const mechStore = useMechStore();
const teamStore = useTeamStore();

const { mechId } = defineProps<{
  mechId: number
}>();
const info = computed(() => mechStore.getMechInfo(mechId)!);

const team = computed(() => {
  const { teamId } = teamStore.getMechTeamAndGroupIds(mechId);
  return teamStore.getTeamDef(teamId);
});
const play = inject('play', false);

const {
  getHevStructureCriticals
} = usePlayStore();

const hasMoveCritical = computed(() => {
  if (!play) return false;

  return getHevStructureCriticals(mechId).move;
});

const move = computed(() => {
  const stat = info.value.move;
  if (play && hasMoveCritical.value) {
    return stat - 1;
  }

  return stat;
});

const jump = computed(() => {
  const stat = info.value.jump;
  if (play && stat && hasMoveCritical.value) {
    return stat - 1;
  }

  return stat;
});

</script>
<template>
  <div class="row g-1">
    <div class="col-5">
      <div class="unit-info">
        <div class="hev-size">
          {{ info.size.display_name }} HE-V
        </div>
        <div class="hev-team" v-if="teamStore.isSpecialTeam(team.id)">
          {{ team.display_name_short }}
          <SvgIcon :name="team.icon" />
        </div>
      </div>
    </div>
    <div class="col-7">
      <table class="table-card-stats">
        <thead>
        <tr>
          <th>Tng</th>
          <th>Mov</th>
          <th>Jmp</th>
          <th>Def</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>{{ info.tonnage_stat }}</td>
          <td :class="{'number-damaged': hasMoveCritical}">
            <format-inches :value="move" />
          </td>
          <td :class="{'number-damaged': info.jump && hasMoveCritical}">
            <format-inches :value="jump" />
          </td>
          <td>{{ info.defense }}+</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>