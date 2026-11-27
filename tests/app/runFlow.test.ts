import { finishRun, resultFromState } from '../../src/app/runFlow';
import { ensureQuests } from '../../src/core/quests';
import { createRng } from '../../src/core/rng';
import { createRunState } from '../../src/core/run/runState';
import { createDefaultSave } from '../../src/core/save/schema';
import { seqId } from './helpers';

test('finishRun ödülleri, en iyi turu ve görev ilerlemesini tek seferde uygular', () => {
  const s0 = ensureQuests(createDefaultSave(0), createRng(1));
  const r = finishRun(s0, { zoneIndex: 0, survivedSec: 480, kills: 400, bossDefeated: true, skills: { lightRing: 5 }, bonusKor: 0 }, createRng(2), seqId());
  expect(r.save.kor).toBeGreaterThanOrEqual(380);
  expect(r.save.bestRunKor).toBe(r.rewards.kor);
  expect(r.save.zones.unlockedIndex).toBe(1);
  expect(r.save.activeRun).toBeNull();
  expect(r.save.quests.active).toHaveLength(3);
});
test('öldürme görevi tur sonunda ilerler', () => {
  const s0 = ensureQuests(createDefaultSave(0), createRng(1));
  const killQuest = s0.quests.active.find(q => q.template.kind === 'kills');
  const r = finishRun(s0, { zoneIndex: 0, survivedSec: 60, kills: 30, bossDefeated: false, skills: {}, bonusKor: 0 }, createRng(2), seqId());
  if (killQuest) expect(r.save.quests.active.find(q => q.id === killQuest.id)?.progress).toBe(30);
});
test('yarım turdan sonuç: boss yok, süre tam sayı', () => {
  const st = { ...createRunState(1, 1, { maxHp: 100, regen: 0, damageMult: 1, areaMult: 1, moveSpeedMult: 1, xpGainMult: 1, pickupRangeMult: 1, rules: [] }, ['lightRing']), elapsedSec: 130.7, kills: 55 };
  expect(resultFromState(st)).toEqual({ zoneIndex: 1, survivedSec: 130, kills: 55, bossDefeated: false, skills: { lightRing: 1 }, bonusKor: 0 });
});
