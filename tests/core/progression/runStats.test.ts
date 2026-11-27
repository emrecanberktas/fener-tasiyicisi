import { runStats } from '../../../src/core/progression/stats';
import type { PlayerStats } from '../../../src/data/types';

const baseStats: PlayerStats = { maxHp: 120, regen: 0.5, damageMult: 1.1, areaMult: 1.05, moveSpeedMult: 1, xpGainMult: 1, pickupRangeMult: 1.2, rules: ['oneReroll'] };

test('pasifler tur içi çarpanlara eklenir', () => {
  const s = runStats(baseStats, { intenseFlame: 3, wideLight: 2, wick: 2 });
  expect(s.damageMult).toBeCloseTo(baseStats.damageMult * 1.3);
  expect(s.areaMult).toBeCloseTo(baseStats.areaMult * 1.2);
  expect(s.regen).toBeCloseTo(baseStats.regen + 1);
});
test('hız, toplama ve XP pasifleri', () => {
  const s = runStats(baseStats, { lightStep: 5, attraction: 2, amber: 1 });
  expect(s.moveSpeedMult).toBeCloseTo(1.4);
  expect(s.pickupRangeMult).toBeCloseTo(1.2 * 1.5);
  expect(s.xpGainMult).toBeCloseTo(1.1);
});
test('aktif yetenekler istatistik değiştirmez, kurallar korunur', () => {
  expect(runStats(baseStats, { lightRing: 5, sparkRain: 3 })).toEqual(baseStats);
});
