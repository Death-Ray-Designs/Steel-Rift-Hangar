import { defineScopeableStore } from 'pinia-scope';
import { computed } from 'vue';
import { useMechStore } from './mech-store';
import { useSupportAssetUnitsStore } from './support-asset-units-store';
import { make2KeyCounter, makeCounter, makeMultiKeyCounter } from './helpers/store-counters';
import { FACTION_PERK } from '../data/faction-perks';
import { useFactionStore } from './faction-store';
import { splitHevStructureIntoCriticalChunkSizes } from '../data/hev-helpers';

export const usePlayStore = defineScopeableStore('play-store', ({ scope }: { scope: string }) => {
        const mechStore = useMechStore(scope);
        const unitStore = useSupportAssetUnitsStore(scope);
        const factionStore = useFactionStore(scope);

        const {
            counterData: hevWeaponUses,
            add: addHevWeaponTimesUsed,
            remove: removeHevWeaponTimesUsed,
            get: getHevWeaponTimesUsed,
            hasValues: hevHasWeaponUses,
            clear: clearHevWeaponUses,
        } = make2KeyCounter<number, number>((mechId, weaponAttachmentId) => {
            return mechStore.getMechWeaponAttachmentInfo(mechId, weaponAttachmentId)?.max_uses ?? 0;
        });

        const {
            counterData: hevUpgradeUses,
            add: addHevUpgradeTimesUsed,
            remove: removeHevUpgradeTimesUsed,
            get: getHevUpgradeTimesUsed,
            hasValues: hevHasUpgradeUses,
            clear: clearHevUpgradeUses,
        } = make2KeyCounter<number, number>((mechId, upgradeAttachmentId) => {
            return mechStore.getMechUpgradeAttachmentInfo(mechId, upgradeAttachmentId)?.max_uses ?? 0;
        });

        const {
            counterData: unitWeaponUses,
            add: addUnitWeaponTimesUsed,
            remove: removeUnitWeaponTimesUsed,
            get: getUnitWeaponTimesUsed,
            hasValues: unitHasWeaponUses,
            clear: clearUnitWeaponUses,
        } = makeMultiKeyCounter<[number, number, number]>((unitAttachmentId, vehicleAttachmentId, weaponIndex) => {
            const vehicle = unitStore.getUnitAttachmentVehicleInfo(unitAttachmentId, vehicleAttachmentId);
            return vehicle?.weapons[weaponIndex]?.max_uses ?? 0;
        });

        const {
            counterData: hevStructureDamage,
            add: addHevStructureDamage,
            remove: removeHevStructureDamage,
            get: getHevStructureDamage,
            hasValues: hevHasStructureDamage,
            clear: clearHevStructureDamage,
        } = makeCounter<number>((mechId) => {
            return mechStore.getMechInfo(mechId)?.structure_stat ?? 0;
        });

        const {
            counterData: hevArmorDamage,
            add: addHevArmorDamage,
            remove: removeHevArmorDamage,
            get: getHevArmorDamage,
            hasValues: hevHasArmorDamage,
            clear: clearHevArmorDamage,
        } = makeCounter<number>((mechId) => {
            return mechStore.getMechInfo(mechId)?.armor_stat ?? 0;
        });

        const {
            counterData: unitStructureDamage,
            add: addUnitStructureDamage,
            remove: removeUnitStructureDamage,
            get: getUnitStructureDamage,
            hasValues: unitHasStructureDamage,
            clear: clearUnitStructureDamage,
        } = make2KeyCounter<number, number>((unitAttachmentId, vehicleAttachmentId) => {
            return unitStore.getUnitAttachmentVehicleInfo(unitAttachmentId, vehicleAttachmentId)?.structure ?? 0;
        });

        const {
            counterData: unitArmorDamage,
            add: addUnitArmorDamage,
            remove: removeUnitArmorDamage,
            get: getUnitArmorDamage,
            hasValues: unitHasArmorDamage,
            clear: clearUnitArmorDamage,
        } = make2KeyCounter<number, number>((unitAttachmentId, vehicleAttachmentId) => {
            return unitStore.getUnitAttachmentVehicleInfo(unitAttachmentId, vehicleAttachmentId)?.armor ?? 0;
        });

        function getGarrisonUnit(unitAttachmentId: number, vehicleAttachmentId: number, garrisonIndex: number) {
            return unitStore.getUnitAttachmentVehicleInfo(unitAttachmentId, vehicleAttachmentId)?.garrison_units[garrisonIndex];
        }

        const {
            counterData: garrisonWeaponUses,
            add: addGarrisonWeaponTimesUsed,
            remove: removeGarrisonWeaponTimesUsed,
            get: getGarrisonWeaponTimesUsed,
            hasValues: garrisonHasWeaponUses,
            clear: clearGarrisonWeaponUses,
        } = makeMultiKeyCounter<[number, number, number, number]>((unitAttachmentId, vehicleAttachmentId, garrisonIndex, weaponIndex) => {
            return getGarrisonUnit(unitAttachmentId, vehicleAttachmentId, garrisonIndex)?.weapons[weaponIndex]?.max_uses ?? 0;
        });

        const {
            counterData: garrisonStructureDamage,
            add: addGarrisonStructureDamage,
            remove: removeGarrisonStructureDamage,
            get: getGarrisonStructureDamage,
            hasValues: garrisonHasStructureDamage,
            clear: clearGarrisonStructureDamage,
        } = makeMultiKeyCounter<[number, number, number]>((unitAttachmentId, vehicleAttachmentId, garrisonIndex) => {
            return getGarrisonUnit(unitAttachmentId, vehicleAttachmentId, garrisonIndex)?.structure ?? 0;
        });

        const {
            counterData: garrisonArmorDamage,
            add: addGarrisonArmorDamage,
            remove: removeGarrisonArmorDamage,
            get: getGarrisonArmorDamage,
            hasValues: garrisonHasArmorDamage,
            clear: clearGarrisonArmorDamage,
        } = makeMultiKeyCounter<[number, number, number]>((unitAttachmentId, vehicleAttachmentId, garrisonIndex) => {
            return getGarrisonUnit(unitAttachmentId, vehicleAttachmentId, garrisonIndex)?.armor ?? 0;
        });

        // @TODO when navigating to edit mode and gameStarted show warning modal about play state
        const gameStarted = computed(() => {
            return hevHasWeaponUses()
                || hevHasUpgradeUses()
                || unitHasWeaponUses()
                || hevHasStructureDamage()
                || hevHasArmorDamage()
                || unitHasStructureDamage()
                || unitHasArmorDamage()
                || garrisonHasWeaponUses()
                || garrisonHasStructureDamage()
                || garrisonHasArmorDamage();
        });


        function getHevStructureCriticals(mechId: number) {
            const structure = mechStore.getMechInfo(mechId)!.structure_stat;
            const offset = factionStore.hasPerk(FACTION_PERK.RD_ADVANCED_STRUCTURAL_COMPONENTS) ? 2 : 0;
            const criticals = {
                move: false,
                damage: false,
                orders: false,
            };

            const structureDamage = getHevStructureDamage(mechId);
            let start = offset;
            splitHevStructureIntoCriticalChunkSizes(structure).forEach((count, index) => {
                const end = start + count;
                if (count > 0 && end <= structure && structureDamage >= end) {
                    if (index === 0) {
                        criticals.move = true;
                    } else if (index === 1) {
                        criticals.damage = true;
                    } else if (index === 2) {
                        criticals.orders = true;
                    }
                }
                start += count;
            });

            return criticals;
        }

        function $reset() {
            clearHevWeaponUses();
            clearHevUpgradeUses();
            clearUnitWeaponUses();
            clearHevStructureDamage();
            clearHevArmorDamage();
            clearUnitStructureDamage();
            clearUnitArmorDamage();
            clearGarrisonWeaponUses();
            clearGarrisonStructureDamage();
            clearGarrisonArmorDamage();
        }

        return {
            $reset,

            hevStructureDamage,
            hevArmorDamage,
            hevWeaponUses,
            hevUpgradeUses,

            unitStructureDamage,
            unitArmorDamage,
            unitWeaponUses,

            garrisonStructureDamage,
            garrisonArmorDamage,
            garrisonWeaponUses,

            gameStarted,

            getHevArmorDamage,
            addHevArmorDamage,
            removeHevArmorDamage,

            getHevStructureDamage,
            addHevStructureDamage,
            removeHevStructureDamage,

            addHevWeaponTimesUsed,
            removeHevWeaponTimesUsed,
            getHevWeaponTimesUsed,

            addHevUpgradeTimesUsed,
            removeHevUpgradeTimesUsed,
            getHevUpgradeTimesUsed,

            addUnitWeaponTimesUsed,
            removeUnitWeaponTimesUsed,
            getUnitWeaponTimesUsed,

            getUnitStructureDamage,
            addUnitStructureDamage,
            removeUnitStructureDamage,

            getUnitArmorDamage,
            addUnitArmorDamage,
            removeUnitArmorDamage,

            addGarrisonWeaponTimesUsed,
            removeGarrisonWeaponTimesUsed,
            getGarrisonWeaponTimesUsed,

            getGarrisonStructureDamage,
            addGarrisonStructureDamage,
            removeGarrisonStructureDamage,

            getGarrisonArmorDamage,
            addGarrisonArmorDamage,
            removeGarrisonArmorDamage,

            getHevStructureCriticals,
        };
    }, (scope: string) => {
        return {
            persist: scope === '',
        };
    },
);

