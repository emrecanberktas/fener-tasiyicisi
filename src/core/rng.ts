export interface Rng {
  next(): number;
  int(min: number, maxInclusive: number): number;
  pick<T>(items: readonly T[]): T;
  weightedIndex(weights: readonly number[]): number;
}

/** mulberry32 tabanlı tohumlu RNG. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: <T>(items: readonly T[]): T => {
      if (items.length === 0) throw new Error('pick: boş liste');
      return items[Math.floor(next() * items.length)] as T;
    },
    weightedIndex: (weights) => {
      const total = weights.reduce((s, w) => s + Math.max(0, w), 0);
      if (total <= 0) throw new Error('weightedIndex: toplam ağırlık 0');
      let roll = next() * total;
      for (let i = 0; i < weights.length; i++) {
        const w = Math.max(0, weights[i] ?? 0);
        if (w === 0) continue;
        if (roll < w) return i;
        roll -= w;
      }
      for (let i = weights.length - 1; i >= 0; i--) if ((weights[i] ?? 0) > 0) return i;
      return 0;
    },
  };
}
