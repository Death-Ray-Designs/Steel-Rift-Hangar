import { reactive } from 'vue';


export function makeMultiKeyCounter<Keys extends (string | number)[]>(max: (...keys: Keys) => number) {
    const counterData: Record<string, number> = reactive({});

    function makeKey(keys: Keys) {
        return keys.join('-');
    }

    // a stored value can exceed its max if the record changed after it was set (e.g. HEV size reduced)
    // it is only capped when interacted with
    function capToMax(keys: Keys) {
        const maxValue = max(...keys);
        if (get(...keys) > maxValue) counterData[makeKey(keys)] = maxValue;
    }

    function add(...keys: Keys) {
        capToMax(keys);
        if (get(...keys) >= max(...keys)) return;
        const key = makeKey(keys);
        counterData[key] = (counterData[key] ?? 0) + 1;
    }

    function remove(...keys: Keys) {
        capToMax(keys);
        if (get(...keys) <= 0) return;
        counterData[makeKey(keys)]--;
    }

    function set(value: number, ...keys: Keys) {
        counterData[makeKey(keys)] = Math.max(0, Math.min(value, max(...keys)));
    }

    function get(...keys: Keys) {
        return counterData[makeKey(keys)] ?? 0;
    }

    function hasValues() {
        return Object.values(counterData).some(val => val > 0);
    }

    function clear() {
        clearObject(counterData);
    }

    function prune(shouldPrune: (key: string) => boolean) {
        Object.keys(counterData).forEach(key => {
            if (shouldPrune(key)) delete counterData[key];
        });
    }

    return {
        counterData,
        add,
        remove,
        set,
        get,
        hasValues,
        clear,
        prune,
    };
}

// clicking box n fills boxes 1..n, except clicking the first box while it is the only one filled clears it
export function clickedBoxValue(clicked: number, current: number) {
    return clicked === 1 && current === 1 ? 0 : clicked;
}

export function clearObject(obj: object) {
    Object.keys(obj).forEach(key => delete obj[key as keyof typeof obj]);
}