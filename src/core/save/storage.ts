import { get, set } from 'idb-keyval';
import { migrateSave, SaveFormatError, type SaveData } from './schema';

export { SaveFormatError };

export const SAVE_KEY = 'fener.save';

export interface SaveStore {
  load(): Promise<SaveData | null>;
  save(data: SaveData): Promise<void>;
}

/** Okunamayan kaydın ham halini kaybetmemek için ayrı bir anahtara kopyalar. */
function parseOrBackup(raw: string): SaveData {
  try {
    return importSave(raw);
  } catch (e) {
    try { localStorage.setItem(`${SAVE_KEY}.corrupt-${Date.now()}`, raw); } catch { /* depolama dolu */ }
    throw e;
  }
}

const localStore: SaveStore = {
  async load() {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? parseOrBackup(raw) : null;
  },
  async save(data) {
    localStorage.setItem(SAVE_KEY, exportSave(data));
  },
};

export function createSaveStore(backend: { idb?: boolean } = {}): SaveStore {
  const useIdb = backend.idb ?? typeof indexedDB !== 'undefined';
  if (!useIdb) return localStore;
  return {
    async load() {
      let raw: string | undefined;
      try {
        raw = await get<string>(SAVE_KEY);
      } catch {
        return localStore.load();
      }
      return raw ? parseOrBackup(raw) : localStore.load();
    },
    async save(data) {
      const json = exportSave(data);
      try {
        await set(SAVE_KEY, json);
      } catch {
        localStorage.setItem(SAVE_KEY, json);
      }
    },
  };
}

export function exportSave(data: SaveData): string {
  return JSON.stringify(data);
}

export function importSave(json: string): SaveData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new SaveFormatError('JSON okunamadı');
  }
  return migrateSave(parsed);
}
