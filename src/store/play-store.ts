import { defineScopeableStore } from 'pinia-scope';
import { computed, watch } from 'vue';
import { useMechStore } from './mech-store';
import { useSupportAssetUnitsStore } from './support-asset-units-store';
import { makeMultiKeyCounter } from './helpers/store-counters';
import { FACTION_PERK } from '../data/faction-perks';
import { useFactionStore } from './faction-store';
import { splitHevStructureIntoCriticalChunkSizes } from '../data/hev-helpers';
import type { UnitAttachmentVehicleInfo } from '../data/support-assets/_support-asset-types';

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
            prune: pruneHevWeaponUses,
        } = makeMultiKeyCounter<[number, number]>((mechId, weaponAttachmentId) => {
            return mechStore.getMechWeaponAttachmentInfo(mechId, weaponAttachmentId)?.max_uses ?? 0;
        });

        const {
            counterData: hevUpgradeUses,
            add: addHevUpgradeTimesUsed,
            remove: removeHevUpgradeTimesUsed,
            get: getHevUpgradeTimesUsed,
            hasValues: hevHasUpgradeUses,
            clear: clearHevUpgradeUses,
            prune: pruneHevUpgradeUses,
        } = makeMultiKeyCounter<[number, number]>((mechId, upgradeAttachmentId) => {
            return mechStore.getMechUpgradeAttachmentInfo(mechId, upgradeAttachmentId)?.max_uses ?? 0;
        });

        const {
            counterData: unitWeaponUses,
            add: addUnitWeaponTimesUsed,
            remove: removeUnitWeaponTimesUsed,
            get: getUnitWeaponTimesUsed,
            hasValues: unitHasWeaponUses,
            clear: clearUnitWeaponUses,
            prune: pruneUnitWeaponUses,
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
            prune: pruneHevStructureDamage,
        } = makeMultiKeyCounter<[number]>((mechId) => {
            return mechStore.getMechInfo(mechId)?.structure_stat ?? 0;
        });

        const {
            counterData: hevArmorDamage,
            add: addHevArmorDamage,
            remove: removeHevArmorDamage,
            get: getHevArmorDamage,
            hasValues: hevHasArmorDamage,
            clear: clearHevArmorDamage,
            prune: pruneHevArmorDamage,
        } = makeMultiKeyCounter<[number]>((mechId) => {
            return mechStore.getMechInfo(mechId)?.armor_stat ?? 0;
        });

        const {
            counterData: unitStructureDamage,
            add: addUnitStructureDamage,
            remove: removeUnitStructureDamage,
            get: getUnitStructureDamage,
            hasValues: unitHasStructureDamage,
            clear: clearUnitStructureDamage,
            prune: pruneUnitStructureDamage,
        } = makeMultiKeyCounter<[number, number]>((unitAttachmentId, vehicleAttachmentId) => {
            return unitStore.getUnitAttachmentVehicleInfo(unitAttachmentId, vehicleAttachmentId)?.structure ?? 0;
        });

        const {
            counterData: unitArmorDamage,
            add: addUnitArmorDamage,
            remove: removeUnitArmorDamage,
            get: getUnitArmorDamage,
            hasValues: unitHasArmorDamage,
            clear: clearUnitArmorDamage,
            prune: pruneUnitArmorDamage,
        } = makeMultiKeyCounter<[number, number]>((unitAttachmentId, vehicleAttachmentId) => {
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
            prune: pruneGarrisonWeaponUses,
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
            prune: pruneGarrisonStructureDamage,
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
            prune: pruneGarrisonArmorDamage,
        } = makeMultiKeyCounter<[number, number, number]>((unitAttachmentId, vehicleAttachmentId, garrisonIndex) => {
            return getGarrisonUnit(unitAttachmentId, vehicleAttachmentId, garrisonIndex)?.armor ?? 0;
        });

        // each slot map is key => tag of what currently occupies that slot
        // play state is pruned when its slot is removed or the slot's tag changes (e.g. a unit weapon choice is swapped)
        function pruneOnSlotChange(getSlots: () => Record<string, string>, prune: (shouldPrune: (key: string) => boolean) => void) {
            watch(getSlots, (current, previous) => {
                prune(key => {
                    const slotRemoved = !(key in current);
                    const slotChanged = key in previous && previous[key] !== current[key];
                    return slotRemoved || slotChanged;
                });
            });
        }

        function hevSlots() {
            const slots: Record<string, string> = {};
            mechStore.mechs.forEach(mech => {
                slots[mech.id] = '';
            });
            return slots;
        }

        function hevWeaponSlots() {
            const slots: Record<string, string> = {};
            mechStore.mechs.forEach(mech => {
                mech.weapons.forEach(weapon => {
                    slots[`${mech.id}-${weapon.id}`] = weapon.weapon_id;
                });
            });
            return slots;
        }

        function hevUpgradeSlots() {
            const slots: Record<string, string> = {};
            mechStore.mechs.forEach(mech => {
                mech.upgrades.forEach(upgrade => {
                    slots[`${mech.id}-${upgrade.id}`] = upgrade.upgrade_id;
                });
            });
            return slots;
        }

        function forEachUnitVehicle(callback: (unitAttachmentId: number, vehicle: UnitAttachmentVehicleInfo) => void) {
            unitStore.support_asset_units.forEach(unit => {
                unit.vehicles.forEach(vehicleAttachment => {
                    const vehicle = unitStore.getUnitAttachmentVehicleInfo(unit.id, vehicleAttachment.id);
                    if (vehicle) callback(unit.id, vehicle);
                });
            });
        }

        function unitSlots() {
            const slots: Record<string, string> = {};
            forEachUnitVehicle((unitAttachmentId, vehicle) => {
                slots[`${unitAttachmentId}-${vehicle.id}`] = vehicle.vehicle_id;
            });
            return slots;
        }

        function unitWeaponSlots() {
            const slots: Record<string, string> = {};
            forEachUnitVehicle((unitAttachmentId, vehicle) => {
                vehicle.weapons.forEach((weapon, weaponIndex) => {
                    slots[`${unitAttachmentId}-${vehicle.id}-${weaponIndex}`] = weapon.id;
                });
            });
            return slots;
        }

        function garrisonSlots() {
            const slots: Record<string, string> = {};
            forEachUnitVehicle((unitAttachmentId, vehicle) => {
                vehicle.garrison_units.forEach((garrisonUnit, garrisonIndex) => {
                    slots[`${unitAttachmentId}-${vehicle.id}-${garrisonIndex}`] = garrisonUnit.id;
                });
            });
            return slots;
        }

        function garrisonWeaponSlots() {
            const slots: Record<string, string> = {};
            forEachUnitVehicle((unitAttachmentId, vehicle) => {
                vehicle.garrison_units.forEach((garrisonUnit, garrisonIndex) => {
                    garrisonUnit.weapons.forEach((_, weaponIndex) => {
                        slots[`${unitAttachmentId}-${vehicle.id}-${garrisonIndex}-${weaponIndex}`] = garrisonUnit.id;
                    });
                });
            });
            return slots;
        }

        pruneOnSlotChange(hevSlots, pruneHevStructureDamage);
        pruneOnSlotChange(hevSlots, pruneHevArmorDamage);
        pruneOnSlotChange(hevWeaponSlots, pruneHevWeaponUses);
        pruneOnSlotChange(hevUpgradeSlots, pruneHevUpgradeUses);

        pruneOnSlotChange(unitSlots, pruneUnitStructureDamage);
        pruneOnSlotChange(unitSlots, pruneUnitArmorDamage);
        pruneOnSlotChange(unitWeaponSlots, pruneUnitWeaponUses);

        pruneOnSlotChange(garrisonSlots, pruneGarrisonStructureDamage);
        pruneOnSlotChange(garrisonSlots, pruneGarrisonArmorDamage);
        pruneOnSlotChange(garrisonWeaponSlots, pruneGarrisonWeaponUses);

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

