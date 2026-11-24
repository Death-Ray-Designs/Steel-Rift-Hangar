import { computed, type ComputedRef, effectScope, getCurrentScope, onScopeDispose, ref } from 'vue';

export const BOOTSTRAP_BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

export type BootstrapBreakpoint = typeof BOOTSTRAP_BREAKPOINTS[number];

type BreakpointQuery = {
    name: BootstrapBreakpoint;
    query: MediaQueryList;
};

function getBreakpointQueries(): BreakpointQuery[] {
    const rootStyle = getComputedStyle(document.documentElement);

    return BOOTSTRAP_BREAKPOINTS.flatMap(name => {
        const width = rootStyle.getPropertyValue(`--bs-breakpoint-${name}`).trim();
        if (width === '') {
            return [];
        }

        return [{ name, query: window.matchMedia(`(min-width: ${width})`) }];
    });
}

type SharedBreakpointState = {
    breakpoint: ComputedRef<BootstrapBreakpoint>;
    subscribers: number;
    dispose: () => void;
};

function createSharedState(): SharedBreakpointState {
    const queries = getBreakpointQueries();

    function findCurrent(): BootstrapBreakpoint {
        let current: BootstrapBreakpoint = 'xs';
        queries.forEach(({ name, query }) => {
            if (query.matches) {
                current = name;
            }
        });

        return current;
    }

    function update() {
        current.value = findCurrent();
    }

    const scope = effectScope(true);
    const current = ref<BootstrapBreakpoint>(findCurrent());
    const breakpoint = scope.run(() => computed(() => current.value))!;

    queries.forEach(({ query }) => query.addEventListener('change', update));

    return {
        breakpoint,
        subscribers: 0,
        dispose() {
            queries.forEach(({ query }) => query.removeEventListener('change', update));
            scope.stop();
        },
    };
}

let shared: SharedBreakpointState | null = null;

export function useBootstrapBreakpoints(): ComputedRef<BootstrapBreakpoint> {
    if (!shared) {
        shared = createSharedState();
    }

    const state = shared;
    state.subscribers++;

    if (getCurrentScope()) {
        onScopeDispose(() => {
            state.subscribers--;
            if (state.subscribers === 0 && shared === state) {
                state.dispose();
                shared = null;
            }
        });
    }

    return state.breakpoint;
}
