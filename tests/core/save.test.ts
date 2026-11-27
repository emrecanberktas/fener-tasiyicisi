import { createDefaultSave, migrateSave, SaveFormatError } from '../../src/core/save/schema';
import { createSaveStore, exportSave, importSave } from '../../src/core/save/storage';

test('varsayılan kayıt geçerli ve sıfırdan başlar', () => {
  const s = createDefaultSave(1000);
  expect(s).toMatchObject({ version: 1, kor: 0, account: { level: 1, xp: 0 }, bestRunKor: 0, idle: { lastCollectedAt: 1000 }, activeRun: null });
  expect(s.gear.equipped).toEqual({ hazne: null, cam: null, fitil: null });
  expect(s.zones).toEqual({ unlockedIndex: 0, bossesDefeated: [] });
});
test('export → import gidiş-dönüş aynı veriyi verir', () => {
  const s = { ...createDefaultSave(5), kor: 321 };
  expect(importSave(exportSave(s))).toEqual(s);
});
test.each(['', 'not json', '{"version":99}', '{"version":1,"kor":"çok"}', '[]', 'null', '{"bozuk": true}'])(
  'geçersiz içe aktarma SaveFormatError fırlatır: %s',
  (bad) => expect(() => importSave(bad)).toThrow(SaveFormatError));
test('eksik isteğe bağlı alanlar varsayılanla dolar', () => {
  const raw: Record<string, unknown> = { ...createDefaultSave(0) };
  delete raw.settings;
  expect(migrateSave(raw).settings).toEqual({ vibration: true });
});
test('IndexedDB yoksa localStorage yedeğine yazar ve okur', async () => {
  localStorage.clear();
  const store = createSaveStore({ idb: false });
  expect(await store.load()).toBeNull();
  const s = { ...createDefaultSave(1), kor: 9 };
  await store.save(s);
  expect(await store.load()).toEqual(s);
});

test('bozuk kayıt okunamazsa ham hali yedeklenir, sonra hata fırlatılır', async () => {
  localStorage.clear();
  localStorage.setItem('fener.save', '{"version":1,"kor":"bozuk"}');
  const store = createSaveStore({ idb: false });
  await expect(store.load()).rejects.toThrow(SaveFormatError);
  const backups = Object.keys(localStorage).filter(k => k.startsWith('fener.save.corrupt-'));
  expect(backups).toHaveLength(1);
  expect(localStorage.getItem(backups[0]!)).toBe('{"version":1,"kor":"bozuk"}');
});
