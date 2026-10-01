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
        get,
        hasValues,
        clear,
        prune,
    };
}

export function clearObject(obj: object) {
    Object.keys(obj).forEach(key => delete obj[key as keyof typeof obj]);
}