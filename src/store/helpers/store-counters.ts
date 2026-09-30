import { reactive } from 'vue';


export function makeCounter<ItemId extends string | number>(max: (itemId: ItemId) => number) {
    const counterData: Partial<Record<ItemId, number>> = reactive({});

    function init(itemId: ItemId) {
        counterData[itemId] ??= 0;
    }

    function add(itemId: ItemId) {
        if (get(itemId) >= max(itemId)) return;
        init(itemId);
        counterData[itemId]!++;
    }

    function remove(itemId: ItemId) {
        if (get(itemId) <= 0) return;
        init(itemId);
        counterData[itemId]!--;
    }

    function get(itemId: ItemId) {
        return counterData[itemId] ?? 0;
    }

    function hasValues() {
        return Object.values(counterData as Record<string, number>).some((val) => val > 0)
    }

    function clear() {
        clearObject(counterData);
    }

    return {
        counterData,
        add,
        remove,
        get,
        hasValues,
        clear,
    };
}

export function make2KeyCounter<ItemId extends string | number, Key extends string | number>(max: (itemId: ItemId, key: Key) => number) {
    const counterData: Partial<Record<ItemId, Partial<Record<Key, number>>>> = reactive({});

    function init(itemId: ItemId, key: Key) {
        const item: Partial<Record<Key, number>> = counterData[itemId] ??= {};
        item[key] ??= 0;
        return item as Record<Key, number>;
    }

    function add(itemId: ItemId, key: Key) {
        if (get(itemId, key) >= max(itemId, key)) return;
        init(itemId, key)[key]++;
    }

    function remove(itemId: ItemId, key: Key) {
        if (get(itemId, key) <= 0) return;
        init(itemId, key)[key]--;
    }

    function get(itemId: ItemId, key: Key) {
        return counterData[itemId]?.[key] ?? 0;
    }

    function hasValues() {
        return Object.values(counterData).some(item => Object.values(item as object).some(uses => uses > 0));
    }

    function clear() {
        clearObject(counterData);
    }

    return {
        counterData,
        add,
        remove,
        get,
        hasValues,
        clear,
    };
}


export function makeMultiKeyCounter<Keys extends (string | number)[]>(max: (...keys: Keys) => number) {
    const counterData: Record<string, number> = reactive({});

    function makeKey(keys: Keys) {
        return keys.join('-');
    }

    function add(...keys: Keys) {
        if (get(...keys) >= max(...keys)) return;
        const key = makeKey(keys);
        counterData[key] = (counterData[key] ?? 0) + 1;
    }

    function remove(...keys: Keys) {
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

    return {
        counterData,
        add,
        remove,
        get,
        hasValues,
        clear,
    };
}

export function clearObject(obj: object) {
    Object.keys(obj).forEach(key => delete obj[key as keyof typeof obj]);
}