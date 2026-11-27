import { BOSS_AT_SEC, MAX_ALIVE, pickEnemyType, spawnRatePerSec } from '../../../src/core/run/spawn';
import { createRng } from '../../../src/core/rng';

test('sabitler', () => { expect(MAX_ALIVE).toBe(300); expect(BOSS_AT_SEC).toBe(480); });
test('ilk dakikada yalnızca Sis Böceği', () => {
  const r = createRng(1);
  for (let i = 0; i < 200; i++) expect(pickEnemyType(r, 30)).toBe('mistBug');
});
test('300. saniyede boss asla, Sis Ruhu en az bir kez', () => {
  const r = createRng(2);
  const got = Array.from({ length: 500 }, () => pickEnemyType(r, 300));
  expect(got).not.toContain('mistHeart');
  expect(got).toContain('mistSpirit');
});
test('çıkış hızı', () => { expect(spawnRatePerSec(40, 2)).toBe(6); expect(spawnRatePerSec(0, 0)).toBe(1); });
