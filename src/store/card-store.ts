import { storeToRefs } from 'pinia';
import { defineScopeableStore } from 'pinia-scope';
import { computed } from 'vue';
import { useFactionStore } from './faction-store';
import { usePrintSettingsStore } from './print-settings-store';
import type { FACTION_PERK } from '../data/faction-perks';
import type { MECH_TEAM } from '../data/mech-teams';
import type { SUPPORT_ASSET_WEAPON } from '../data/support-asset-weapons';
import { useTeamStore } from './team-store';
import { sortBy } from 'es-toolkit';
import { useSupportAssetUnitsStore } from './support-asset-units-store';
import { useSupportAssetWeaponsStore } from './support-asset-weapons-store';

export type RefCardType = {
    type: 'mine_drone' | 'msoe',
}

export type FactionPerkCardType = {
    type: 'faction_perk',
    perkId: FACTION_PERK,
}

export type HevCardType = {
    type: 'hev',
    mechId: number
}

export type SupportAssetUnitCardType = {
    type: 'support_asset_unit',
    unitAttachmentId: number,
    cardSize: number,
}

export type SupportAssetWeaponCardType = {
    type: 'support_asset_weapon',
    supportAssetId: SUPPORT_ASSET_WEAPON,
    cardSize: number,
}

export type CardItem =
    | HevCardType
    | RefCardType
    | FactionPerkCardType
    | SupportAssetUnitCardType
    | SupportAssetWeaponCardType;

export const useCardStore = defineScopeableStore('card-store', ({ scope }: { scope: string }) => {

        const teamStore = useTeamStore(scope);
        const supportAssetUnitsStore = useSupportAssetUnitsStore(scope);
        const supportAssetWeaponsStore = useSupportAssetWeaponsStore(scope);
        const printSettingsStore = usePrintSettingsStore(scope);

        const { perk_1_id, perk_2_id } = storeToRefs(useFactionStore(scope));

        const reference_cards = computed(() => {
            const cards: (RefCardType | FactionPerkCardType)[] = [];

            if (printSettingsStore.include_mine_drone_card) {
                cards.push({
                    type: 'mine_drone',
                });
            }

            if (printSettingsStore.include_msoe_card) {
                cards.push({
                    type: 'msoe',
                });
            }

            if (printSettingsStore.include_faction_perk_1_card && perk_1_id.value) {
                cards.push({
                    type: 'faction_perk',
                    perkId: perk_1_id.value,
                });
            }

            if (printSettingsStore.include_faction_perk_2_card && perk_2_id.value) {
                cards.push({
                    type: 'faction_perk',
                    perkId: perk_2_id.value,
                });
            }

            return cards;
        });

        const mech_cards_by_team = computed(() => {
            let results: Partial<Record<MECH_TEAM, HevCardType[]>> = {};

            teamStore.non_shelf_teams.forEach(team => {
                const teamMechIds = teamStore.getTeamMechIds(team.id);
                if (teamMechIds.length) {
                    results[team.id] = teamMechIds.map(
                        mechId => ({
                            type: 'hev',
                            mechId,
                        })
                    );
                }
            });

            return results;
        });

        const support_asset_unit_cards = computed(() => {
            let cards: SupportAssetUnitCardType[] = [];
            supportAssetUnitsStore.support_asset_units.forEach(unit => {
                const hasGarrison = supportAssetUnitsStore.getUnitAttachmentHasGarrisonUnits(unit.id);

                cards.push({
                    type: 'support_asset_unit',
                    unitAttachmentId: unit.id,
                    cardSize: hasGarrison ? 2 : 1,
                });
            });

            cards = sortBy(cards, ['cardSize']);

            return cards;
        });


        const support_asset_weapon_cards = computed(() => {
            return supportAssetWeaponsStore.support_asset_weapon_ids.map(
                supportAssetId => ({
                    type: 'support_asset_weapon',
                    supportAssetId,
                    cardSize: 1,
                })
            ) as SupportAssetWeaponCardType[];
        });

        return {
            reference_cards,
            mech_cards_by_team,

            support_asset_unit_cards,
            support_asset_weapon_cards,
        };
    }
);
