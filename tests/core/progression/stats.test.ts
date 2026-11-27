import { computePlayerStats } from '../../../src/core/progression/stats';
import { createDefaultSave, type SaveData } from '../../../src/core/save/schema';

test('varsayılan istatistikler', () => {
  expect(computePlayerStats(createDefaultSave(0))).toEqual({
    maxHp: 100, regen: 0, damageMult: 1, areaMult: 1, moveSpeedMult: 1, xpGainMult: 1, pickupRangeMult: 1, rules: [],
  });
});
test('istatistikler seviye + parça + ağaçtan toplanır', () => {
  const base = createDefaultSave(0);
  const s: SaveData = { ...base, account: { level: 3, xp: 0 },
    gear: { inventory: [{ id: 'g1', slot: 'cam', rarity: 0, stats: { damagePct: 10 } }], equipped: { hazne: null, cam: 'g1', fitil: null } } };
  const st = computePlayerStats(s);
  expect(st.maxHp).toBe(110);
  expect(st.damageMult).toBeCloseTo(1.14);
});
test('takılı olmayan parça sayılmaz, ağaç stat ve kural düğümleri sayılır', () => {
  const base = createDefaultSave(0);
  const s: SaveData = { ...base,
    gear: { inventory: [{ id: 'g1', slot: 'cam', rarity: 0, stats: { damagePct: 10 } }], equipped: { hazne: null, cam: null, fitil: null } },
    tree: { unlocked: ['t01', 't02', 't07'] } };
  const st = computePlayerStats(s);
  expect(st.damageMult).toBeCloseTo(1.05);
  expect(st.maxHp).toBe(120);
  expect(st.rules).toEqual(['oneReroll']);
});
