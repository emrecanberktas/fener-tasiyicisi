import { renderCamp } from '../../src/ui/screens/camp';
import { createRunState } from '../../src/core/run/runState';
import { theme } from '../../src/theme';
import { click, flush, H, storeWith } from './helpers';

beforeEach(() => { document.body.innerHTML = ''; });
const stats = { maxHp: 100, regen: 0, damageMult: 1, areaMult: 1, moveSpeedMult: 1, xpGainMult: 1, pickupRangeMult: 1, rules: [] };

test('birikim varsa topla düğmesi Kor ekler', async () => {
  const store = await storeWith({ bestRunKor: 200, idle: { lastCollectedAt: 0 } });
  renderCamp(document.body, { store, go: vi.fn(), now: () => 48 * H });
  click('[data-collect]');
  await flush();
  expect(store.get().kor).toBe(700);
  expect(document.querySelector('[data-collect]')).toBeNull();
});
test('birikim yoksa topla düğmesi yok', async () => {
  renderCamp(document.body, { store: await storeWith(), go: vi.fn(), now: () => 0 });
  expect(document.querySelector('[data-collect]')).toBeNull();
});
test('öneri satırı tektir ve dokununca ilgili ekrana gider', async () => {
  const go = vi.fn();
  renderCamp(document.body, { store: await storeWith({ kor: 60 }), go, now: () => 0 });
  expect(document.querySelectorAll('[data-recommendation]')).toHaveLength(1);
  click('[data-recommendation]');
  expect(go).toHaveBeenCalledWith('tree', expect.anything());
});
test('Sise Dal seçili bölgeyle tura gider', async () => {
  const go = vi.fn();
  renderCamp(document.body, { store: await storeWith({ zones: { unlockedIndex: 1, bossesDefeated: [0] } }), go, now: () => 0 });
  expect(document.body.textContent).toContain(theme.zones[1].name);
  click('[data-zone="0"]');
  click('[data-dive]');
  expect(go).toHaveBeenCalledWith('run', { zoneIndex: 0 });
});
test('sekmeler ilgili ekranlara gider', async () => {
  const go = vi.fn();
  renderCamp(document.body, { store: await storeWith(), go, now: () => 0 });
  click('[data-tab="gear"]'); click('[data-tab="tree"]'); click('[data-tab="quests"]'); click('[data-settings]');
  expect(go.mock.calls.map(c => c[0])).toEqual(['gear', 'tree', 'quests', 'settings']);
});
test('yarım tur varsa devam istemi çıkar', async () => {
  const go = vi.fn();
  renderCamp(document.body, { store: await storeWith({ activeRun: createRunState(1, 0, stats, ['lightRing']) }), go, now: () => 0 });
  click('[data-resume]');
  expect(go).toHaveBeenCalledWith('run', { resume: true });
});

test('kamp açıkken birikim kendiliğinden güncellenir', async () => {
  vi.useFakeTimers();
  let now = 0;
  const store = await storeWith({ bestRunKor: 200, idle: { lastCollectedAt: 0 } });
  const cleanup = renderCamp(document.body, { store, go: vi.fn(), now: () => now });
  expect(document.querySelector('[data-collect]')).toBeNull();
  now = 12 * H;
  vi.advanceTimersByTime(30_000);
  expect(document.querySelector('[data-collect]')?.textContent).toContain('175');
  cleanup();
  vi.useRealTimers();
});
