import { defineScopeableStore } from 'pinia-scope';
import { usePrintSettingsStore } from './print-settings-store';
import { useTeamStore } from './team-store';
import { useSupportAssetUnitsStore } from './support-asset-units-store';
import { useSupportAssetWeaponsStore } from './support-asset-weapons-store';
import { ref, watch } from 'vue';

export const usePlayStore = defineScopeableStore('play-store', ({ scope }: { scope: string }) => {
        const teamStore = useTeamStore(scope);
        const supportAssetUnitsStore = useSupportAssetUnitsStore(scope);
        const supportAssetWeaponsStore = useSupportAssetWeaponsStore(scope);
        const printSettingsStore = usePrintSettingsStore(scope);

        const gameStarted = ref(false);

        // @TODO watch for any play store state changes
        watch([], () => {
            gameStarted.value = true;
        });

        // @TODO when game started show link

        // @TODO when navigating from play mode (started game) to edit mode show confirmation modal to clear play state.

        function $reset() {
            gameStarted.value = false;
        }

        return {
            $reset
        };
    }
);
