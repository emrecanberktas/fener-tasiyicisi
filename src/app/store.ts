import { ensureQuests } from '../core/quests';
import { createRng } from '../core/rng';
import { createDefaultSave, type SaveData } from '../core/save/schema';
import type { SaveStore } from '../core/save/storage';

export interface Store {
  get(): SaveData;
  update(fn: (s: SaveData) => SaveData): Promise<void>;
  subscribe(fn: (s: SaveData) => void): () => void;
}

export async function createStore(saveStore: SaveStore, now: () => number): Promise<Store> {
  let data: SaveData | null = null;
  try {
    data = await saveStore.load();
  } catch (e) {
    console.error('Kayıt okunamadı, yeni kayıt başlatılıyor', e);
  }
  let current = ensureQuests(data ?? createDefaultSave(now()), createRng(now() >>> 0));
  const subs = new Set<(s: SaveData) => void>();
  let chain = Promise.resolve();
  return {
    get: () => current,
    update(fn) {
      current = fn(current);
      const snapshot = current;
      subs.forEach(s => s(snapshot));
      chain = chain.then(() => saveStore.save(snapshot)).catch(e => console.error('Kayıt yazılamadı', e));
      return chain;
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}
