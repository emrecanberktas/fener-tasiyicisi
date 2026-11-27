import type { SaveData } from '../../src/core/save/schema';
import type { SaveStore } from '../../src/core/save/storage';

export function memoryStore(initial: SaveData | null = null): SaveStore & { saved: number } {
  let data = initial ? structuredClone(initial) : null;
  const s = {
    saved: 0,
    async load() { return data ? structuredClone(data) : null; },
    async save(d: SaveData) { data = structuredClone(d); s.saved++; },
  };
  return s;
}

export const seqId = () => { let n = 0; return () => `id${n++}`; };
export const flush = () => new Promise(r => setTimeout(r, 0));
