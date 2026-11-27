import { renderGear } from '../../src/ui/screens/gear';
import { renderTree } from '../../src/ui/screens/tree';
import { renderQuests } from '../../src/ui/screens/quests';
import { ensureQuests } from '../../src/core/quests';
import { createRng } from '../../src/core/rng';
import { createDefaultSave } from '../../src/core/save/schema';
import type { GearItem } from '../../src/data/types';
import { click, flush, storeWith } from './helpers';

beforeEach(() => { document.body.innerHTML = ''; });
const weak: GearItem = { id: 'weak', slot: 'cam', rarity: 0, stats: { damagePct: 5 } };
const strong: GearItem = { id: 'strong', slot: 'cam', rarity: 2, stats: { damagePct: 10, areaPct: 5 } };

test('fener: otomatik tak en güçlüyü yuvaya koyar', async () => {
  const store = await storeWith({ gear: { inventory: [weak, strong], equipped: { hazne: null, cam: 'weak', fitil: null } } });
  renderGear(document.body, { store, go: vi.fn(), now: () => 0 });
  click('[data-autoequip]');
  await flush();
  expect(store.get().gear.equipped.cam).toBe('strong');
});
test('fener: parçaya dokununca takılır', async () => {
  const store = await storeWith({ gear: { inventory: [weak, strong], equipped: { hazne: null, cam: null, fitil: null } } });
  renderGear(document.body, { store, go: vi.fn(), now: () => 0 });
  click('[data-item="weak"]');
  await flush();
  expect(store.get().gear.equipped.cam).toBe('weak');
});
test('fener: seçilenleri erit, takılı olan eritilmez', async () => {
  const store = await storeWith({ gear: { inventory: [weak, strong], equipped: { hazne: null, cam: 'strong', fitil: null } } });
  renderGear(document.body, { store, go: vi.fn(), now: () => 0 });
  expect(document.querySelector('[data-melt-toggle="strong"]')).toBeNull();
  click('[data-melt-toggle="weak"]');
  click('[data-melt]');
  await flush();
  expect(store.get().gear.inventory.map(g => g.id)).toEqual(['strong']);
  expect(store.get().kor).toBe(5);
});
test('ağaç: açılabilir düğüm tek dokunuşla açılır', async () => {
  const store = await storeWith({ kor: 60 });
  renderTree(document.body, { store, go: vi.fn(), now: () => 0 });
  expect(document.querySelector('[data-node="t02"]')?.getAttribute('data-state')).toBe('locked');
  click('[data-node="t01"]');
  await flush();
  expect(store.get().tree.unlocked).toEqual(['t01']);
  expect(document.querySelector('[data-node="t01"]')?.getAttribute('data-state')).toBe('unlocked');
});
test('görevler: 3 görev ilerlemeyle', async () => {
  const s = ensureQuests(createDefaultSave(0), createRng(1));
  renderQuests(document.body, { store: await storeWith({ quests: s.quests }), go: vi.fn(), now: () => 0 });
  expect(document.querySelectorAll('[data-quest]')).toHaveLength(3);
});
test('alt ekranlarda geri düğmesi kampa döner', async () => {
  const go = vi.fn();
  renderTree(document.body, { store: await storeWith(), go, now: () => 0 });
  click('[data-back]');
  expect(go).toHaveBeenCalledWith('camp');
});
