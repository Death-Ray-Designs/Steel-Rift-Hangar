export function splitHevStructureIntoCriticalChunkSizes(total: number) {
    const parts = 4;
    const base = Math.floor(total / parts);
    const remainder = total % parts;

    const chunks = Array(parts).fill(base);

    for (let i = 0; i < remainder; i++) {
        chunks[i] += 1;
    }

    return chunks;
}