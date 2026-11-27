import { renderSettings } from '../../src/ui/screens/settings';
import { createDefaultSave } from '../../src/core/save/schema';
import { exportSave } from '../../src/core/save/storage';
import { theme } from '../../src/theme';
import { click, flush, storeWith } from './helpers';

beforeEach(() => { document.body.innerHTML = ''; });
const paste = (text: string) => {
  (document.querySelector('[data-import-text]') as HTMLTextAreaElement).value = text;
  click('[data-import]');
};

test('geçersiz içe aktarma mevcut kaydı bozmaz', async () => {
  const store = await storeWith({ kor: 77 });
  renderSettings(document.body, { store, go: vi.fn(), now: () => 0 });
  paste('{"bozuk": true}');
  await flush();
  expect(store.get().kor).toBe(77);
  expect(document.body.textContent).toContain(theme.ui.importError);
});
test('geçerli içe aktarma onaydan sonra kaydı değiştirir', async () => {
  const store = await storeWith({ kor: 77 });
  renderSettings(document.body, { store, go: vi.fn(), now: () => 0 });
  paste(exportSave({ ...createDefaultSave(0), kor: 5 }));
  await flush();
  expect(store.get().kor).toBe(77);
  click('[data-import-confirm]');
  await flush();
  expect(store.get().kor).toBe(5);
});
test('dışa aktarma metni kaydı içerir', async () => {
  renderSettings(document.body, { store: await storeWith({ kor: 31 }), go: vi.fn(), now: () => 0 });
  click('[data-export]');
  expect((document.querySelector('[data-export-text]') as HTMLTextAreaElement).value).toContain('"kor":31');
});

test('titreşim ayarı açılıp kapanır', async () => {
  const store = await storeWith();
  renderSettings(document.body, { store, go: vi.fn(), now: () => 0 });
  expect(store.get().settings.vibration).toBe(true);
  click('[data-vibration]');
  await flush();
  expect(store.get().settings.vibration).toBe(false);
});
