import { createStore, type Store } from '../../src/app/store';
import { createDefaultSave, type SaveData } from '../../src/core/save/schema';
import { memoryStore } from '../app/helpers';

export const H = 3600_000;
export async function storeWith(o: Partial<SaveData> = {}): Promise<Store> {
  return createStore(memoryStore({ ...createDefaultSave(0), ...o }), () => 0);
}
export const click = (sel: string) => (document.querySelector(sel) as HTMLElement).click();
export { flush } from '../app/helpers';
