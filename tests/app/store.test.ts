import { createStore } from '../../src/app/store';
import { createDefaultSave } from '../../src/core/save/schema';
import { memoryStore } from './helpers';

test('kayıt yoksa varsayılan + 3 görevle başlar', async () => {
  const st = await createStore(memoryStore(), () => 1000);
  expect(st.get().idle.lastCollectedAt).toBe(1000);
  expect(st.get().quests.active).toHaveLength(3);
});
test('mevcut kaydı yükler', async () => {
  const st = await createStore(memoryStore({ ...createDefaultSave(0), kor: 42 }), () => 0);
  expect(st.get().kor).toBe(42);
});
test('store.update kalıcı hale getirir ve aboneleri çağırır', async () => {
  const mem = memoryStore();
  const st = await createStore(mem, () => 0);
  const seen: number[] = [];
  st.subscribe(s => seen.push(s.kor));
  await st.update(s => ({ ...s, kor: 5 }));
  expect((await mem.load())?.kor).toBe(5);
  expect(seen).toEqual([5]);
});
