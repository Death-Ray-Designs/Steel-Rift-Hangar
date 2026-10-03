import { defineScopeableStore } from 'pinia-scope';
import { computed, readonly, ref } from 'vue';
import { FACTION_PERK, FACTION_PERKS, type FactionPerkInfo, isMatchingPerkOrCopy } from '../data/faction-perks';
import {
    DWC_TOP_END_HARDWARE_BONUS_TONS,
    FACTION,
    FACTION_PERK_LOCATIONS,
    FACTIONS,
    getValidFactionPerkIds,
    perksConflict,
    RD_ADVANCED_HARDPOINT_DESIGN_BONUS_SLOTS,
} from '../data/factions';
import { ifEmptyString } from './helpers/helpers';

export const useFactionStore = defineScopeableStore('faction', ({ scope }: { scope: string }) => {

        const defaultFactionId = FACTION.NO_FACTION;

        const perk_1_id = ref<FACTION_PERK | null>(null);
        const perk_2_id = ref<FACTION_PERK | null>(null);
        const faction_id = ref<FACTION>(defaultFactionId);

        function $reset() {
            faction_id.value = defaultFactionId;
            perk_1_id.value = null;
            perk_2_id.value = null;
        }

        const faction_display_name = computed(() => FACTIONS[faction_id.value].display_name);

        const faction = computed(() => FACTIONS[faction_id.value]);


        function hasPerk(perkId: FACTION_PERK) {
            return isMatchingPerkOrCopy(perkId, perk_1_id.value) || isMatchingPerkOrCopy(perkId, perk_2_id.value);
        }

        function getMatchingPerkOrCopyInfo(perkId: FACTION_PERK) {
            if (isMatchingPerkOrCopy(perkId, perk_1_id.value)) {
                return FACTION_PERKS[perk_1_id.value!];
            }

            if (isMatchingPerkOrCopy(perkId, perk_2_id.value)) {
                return FACTION_PERKS[perk_2_id.value!];
            }
        }

        function addPerk(perkId: FACTION_PERK) {
            if (!canAddPerk(perkId)) return;

            if (perk_1_id.value === null) {
                perk_1_id.value = perkId;
                return;
            }
            if (perk_2_id.value === null) {
                perk_2_id.value = perkId;
            }
        }

        function removePerk(perkId: string) {
            if (perk_1_id.value === perkId) {
                perk_1_id.value = null;
                return;
            }
            if (perk_2_id.value === perkId) {
                perk_2_id.value = null;
            }
        }

        function clearInvalidPerks() {
            [perk_1_id.value, perk_2_id.value] = getValidFactionPerkIds(faction_id.value, perk_1_id.value, perk_2_id.value);
        }

        // stored state may be from before perk rules changed or reference removed factions / perks
        function afterHydrate() {
            if (!FACTIONS[faction_id.value]) {
                faction_id.value = defaultFactionId;
            }
            clearInvalidPerks();
        }

        function getPerkInfo(perkId: FACTION_PERK | null): null | FactionPerkInfo {
            if (!perkId || !FACTION_PERKS[perkId]) {
                return null;
            }
            const perk = FACTION_PERKS[perkId];
            const optional_perks = perk.optional_perks?.map((p) => FACTION_PERKS[p]) ?? [];
            return { ...perk, optional_perks };
        }

        const perk_1_info = computed(() => getPerkInfo(perk_1_id.value));
        const perk_2_info = computed(() => getPerkInfo(perk_2_id.value));

        const perks_full = computed(() => {
            return !!(perk_1_id.value && perk_2_id.value);
        });

        function canAddPerk(perkId: FACTION_PERK) {
            if (perks_full.value) return false;

            return ![perk_1_id.value, perk_2_id.value].some((selectedPerkId) => {
                return selectedPerkId && perksConflict(selectedPerkId, perkId);
            });
        }

        const perk_grid = computed(() => {
            let perkGroups = FACTIONS[faction_id.value].faction_perk_groups;

            return Object.values(perkGroups).map(({ id, display_name, perk_ids }) => {
                const perks = perk_ids.map((perkId: FACTION_PERK) => {
                    const {
                        id,
                        display_name,
                        description,
                        prefix,
                        copied_perk_id,
                    } = FACTION_PERKS[perkId];

                    let copied_from = null;

                    if (copied_perk_id) {
                        copied_from = {
                            ...FACTION_PERK_LOCATIONS[copied_perk_id],
                            perk: FACTION_PERKS[copied_perk_id],
                        };
                    }

                    return {
                        id,
                        prefix,
                        display_name,
                        description,
                        copied_from,
                    };
                });

                // consecutive perks copied from the same source are grouped into one section
                const sections: {
                    key: string,
                    source_key: string,
                    prefix?: string,
                    copied_from: typeof perks[number]['copied_from'],
                    perks: typeof perks,
                }[] = [];

                perks.forEach((perk) => {
                    const sourceKey = perk.copied_from
                        ? [perk.prefix, perk.copied_from.faction?.id, perk.copied_from.group?.id].join('|')
                        : '';
                    const last = sections[sections.length - 1];

                    if (last && last.source_key === sourceKey) {
                        last.perks.push(perk);
                        return;
                    }

                    sections.push({
                        // index keeps keys unique if the same source appears in non-consecutive sections
                        key: sections.length + ':' + sourceKey,
                        source_key: sourceKey,
                        prefix: perk.prefix,
                        copied_from: perk.copied_from,
                        perks: [perk],
                    });
                });

                return {
                    id,
                    display_name,
                    sections,
                };
            });
        });

        const hasAdvancedHardPoints = computed(() => hasPerk(FACTION_PERK.RD_ADVANCED_HARDPOINT_DESIGN));
        const hasOutrageousSupportBudget = computed(() => hasPerk(FACTION_PERK.DWC_OUTRAGEOUS_SUPPORT_BUDGET));

        const advancedHardPointsInfo = computed(() => getMatchingPerkOrCopyInfo(FACTION_PERK.RD_ADVANCED_HARDPOINT_DESIGN));

        const hasTopEndHardware = computed(() => hasPerk(FACTION_PERK.DWC_TOP_END_HARDWARE));
        const topEndHardwareInfo = computed(() => getMatchingPerkOrCopyInfo(FACTION_PERK.DWC_TOP_END_HARDWARE));

        const advancedHardPointsBonusSlots = computed(() => RD_ADVANCED_HARDPOINT_DESIGN_BONUS_SLOTS);
        const topEndHardwareBonusTons = computed(() => DWC_TOP_END_HARDWARE_BONUS_TONS);

        const hasMaterielStockpilesInfo = computed(() => getMatchingPerkOrCopyInfo(FACTION_PERK.OI_MATERIEL_STOCKPILES));

        const factions_info = computed(() => {
            return readonly(Object.values(FACTIONS).map(({ id, display_name }) => {
                return {
                    id, display_name,
                };
            }));
        });

        return {
            perk_1_id,
            perk_2_id,
            perk_1_info,
            perk_2_info,
            faction_id,
            faction_display_name,
            faction,
            perks_full,
            factions_info,
            perk_grid,

            addPerk,
            removePerk,
            clearInvalidPerks,
            afterHydrate,
            canAddPerk,
            hasPerk,

            hasAdvancedHardPoints,
            advancedHardPointsInfo,
            advancedHardPointsBonusSlots,
            topEndHardwareBonusTons,
            hasTopEndHardware,
            topEndHardwareInfo,
            hasMaterielStockpilesInfo,
            hasOutrageousSupportBudget,

            $reset,
        };
    }, (scope: string) => {
        return {
            persist: ifEmptyString(scope, {
                afterHydrate: (ctx) => {
                    ctx.store.afterHydrate();
                },
            }),
        };
    },
);
