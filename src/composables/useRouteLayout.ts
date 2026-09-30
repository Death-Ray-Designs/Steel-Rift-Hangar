import { useRoute } from 'vue-router';
import { ROUTE_LAYOUT_PLAY } from '../router';
import { computed } from 'vue';


export function useRouteLayout() {
    const route = useRoute();
    const layout = computed(() => route.meta.layout);
    const isPlayLayout = computed(() => route.meta.layout === ROUTE_LAYOUT_PLAY);

    return {
        layout,
        isPlayLayout,
    };
}