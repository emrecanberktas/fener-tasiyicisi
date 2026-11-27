import { applyRunRewards, computeRunRewards, type RunResult } from '../../../src/core/run/rewards';
import { createRng } from '../../../src/core/rng';
import { createDefaultSave } from '../../../src/core/save/schema';
import { createRunState } from '../../../src/core/run/runState';

let n = 0; const id = () => `g${n++}`;
const res = (o: Partial<RunResult>): RunResult => ({ zoneIndex: 0, survivedSec: 300, kills: 400, bossDefeated: false, skills: {}, bonusKor: 0, ...o });

test('ölüm: boss ödülü hariç her şey korunur', () => {
  const r = computeRunRewards(res({}), createRng(1), id);
  expect(r.kor).toBe(200 + 50); expect(r.accountXp).toBe(700); expect(r.gear).toHaveLength(3);
});
test('bölge çarpanı ve bonus Kor', () => {
  expect(computeRunRewards(res({ zoneIndex: 2, bonusKor: 20 }), createRng(1), id).kor).toBe(600 + 150 + 20);
});
test('boss yenilince bonus, nadir parça ve sonraki bölge', () => {
  const r = res({ survivedSec: 480, bossDefeated: true });
  const rw = computeRunRewards(r, createRng(1), id);
  expect(rw.kor).toBe(200 + 80 + 100);
  expect(rw.gear).toHaveLength(6);
  expect(rw.gear.some(g => g.rarity >= 2)).toBe(true);
  const after = applyRunRewards(createDefaultSave(0), r, rw).save;
  expect(after.zones).toEqual({ unlockedIndex: 1, bossesDefeated: [0] });
});
test('ödüller kayda işlenir, en iyi tur güncellenir, aktif tur temizlenir', () => {
  const r = res({});
  const rw = computeRunRewards(r, createRng(1), id);
  const s0 = { ...createDefaultSave(0), bestRunKor: 999, activeRun: createRunState(1, 0, { maxHp: 100, regen: 0, damageMult: 1, areaMult: 1, moveSpeedMult: 1, xpGainMult: 1, pickupRangeMult: 1, rules: [] }, ['lightRing']) };
  const { save } = applyRunRewards(s0, r, rw);
  expect(save.kor).toBe(250); expect(save.bestRunKor).toBe(999); expect(save.activeRun).toBeNull();
  expect(save.gear.inventory).toHaveLength(3); expect(save.account.level).toBe(3);
});
test('son bölgenin boss u unlockedIndex i 2 de tutar', () => {
  const r = res({ zoneIndex: 2, survivedSec: 480, bossDefeated: true });
  const s0 = { ...createDefaultSave(0), zones: { unlockedIndex: 2, bossesDefeated: [0, 1] } };
  expect(applyRunRewards(s0, r, computeRunRewards(r, createRng(1), id)).save.zones).toEqual({ unlockedIndex: 2, bossesDefeated: [0, 1, 2] });
});
