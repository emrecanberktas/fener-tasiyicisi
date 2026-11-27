import { addRunXp, applyLevelUpChoice, createRunState, isRunState, rollLevelUpChoices, xpToNextLevel, type RunState } from '../../../src/core/run/runState';
import { createRng } from '../../../src/core/rng';
import { SKILLS } from '../../../src/data/skills';
import type { PlayerStats, SkillId } from '../../../src/data/types';

const stats: PlayerStats = { maxHp: 100, regen: 0, damageMult: 1, areaMult: 1, moveSpeedMult: 1, xpGainMult: 1, pickupRangeMult: 1, rules: [] };
const ALL_SKILLS = Object.keys(SKILLS) as SkillId[];
const unlocked: SkillId[] = ['lightRing', 'sparkRain', 'orbitFlames', 'wideLight', 'intenseFlame', 'lightStep'];
const base = createRunState(1, 0, stats, unlocked);

test('başlangıç durumu', () => {
  expect(base).toMatchObject({ zoneIndex: 0, elapsedSec: 0, level: 1, xp: 0, hp: 100, kills: 0, skills: { lightRing: 1 }, pendingLevelUps: 0, rerollsLeft: 0, bossSpawned: false });
});
test('kurallar: iki yetenekle başla ve bir yenileme', () => {
  const s = createRunState(1, 0, { ...stats, rules: ['startWithTwoSkills', 'oneReroll'] }, unlocked);
  const ids = Object.keys(s.skills) as SkillId[];
  expect(ids).toHaveLength(2);
  ids.forEach(id => expect(SKILLS[id].kind).toBe('active'));
  expect(s.rerollsLeft).toBe(1);
});
test('XP eğrisi', () => { expect(xpToNextLevel(1)).toBe(9); expect(xpToNextLevel(2)).toBe(13); });
test('tek seferde çok XP birden çok seviye kartı kuyruğa alır', () => {
  const s = addRunXp(base, 9 + 13 + 1);
  expect(s.level).toBe(3); expect(s.pendingLevelUps).toBe(2); expect(s.xp).toBe(1);
});
test('seçimler tekrarsız ve istenen sayıda', () => {
  const ch = rollLevelUpChoices(base, createRng(4), unlocked, 4);
  expect(ch).toHaveLength(4);
  const keys = ch.map(c => (c.type === 'skill' ? c.skillId : c.kind));
  expect(new Set(keys).size).toBe(4);
});
test('sahip olunan yetenek bir üst seviyeyle önerilir, kilitli olan önerilmez', () => {
  for (let seed = 0; seed < 30; seed++) {
    for (const c of rollLevelUpChoices(base, createRng(seed), unlocked, 3)) {
      if (c.type !== 'skill') continue;
      expect(unlocked).toContain(c.skillId);
      expect(c.newLevel).toBe((base.skills[c.skillId] ?? 0) + 1);
    }
  }
});
test('aktif yuvalar doluysa yeni aktif önerilmez', () => {
  const st: RunState = { ...base, skills: { lightRing: 1, sparkRain: 1, orbitFlames: 1, lightSpear: 1 } };
  for (let seed = 0; seed < 30; seed++) {
    rollLevelUpChoices(st, createRng(seed), ALL_SKILLS, 3).forEach(c => {
      if (c.type === 'skill' && !(c.skillId in st.skills)) expect(SKILLS[c.skillId].kind).toBe('passive');
    });
  }
});
test('uygun yetenek azsa yalnızca onlar döner', () => {
  const st: RunState = { ...base, skills: { lightRing: 5 } };
  const ch = rollLevelUpChoices(st, createRng(1), ['lightRing', 'wick'], 3);
  expect(ch).toEqual([{ type: 'skill', skillId: 'wick', newLevel: 1 }]);
});
test('her şey max ise yedek kartlar gelir, asla boş liste dönmez', () => {
  const eight: SkillId[] = ['lightRing', 'sparkRain', 'orbitFlames', 'lightSpear', 'wideLight', 'intenseFlame', 'lightStep', 'wick'];
  const maxed: RunState = { ...base, skills: Object.fromEntries(eight.map(id => [id, 5])) };
  expect(rollLevelUpChoices(maxed, createRng(1), ALL_SKILLS, 3)).toEqual([{ type: 'fallback', kind: 'heal' }, { type: 'fallback', kind: 'kor' }]);
});
test('seçim uygulama', () => {
  const s = { ...addRunXp(base, 9), hp: 50 };
  const a = applyLevelUpChoice(s, { type: 'skill', skillId: 'sparkRain', newLevel: 1 }, stats);
  expect(a.state.skills.sparkRain).toBe(1); expect(a.state.pendingLevelUps).toBe(0); expect(a.bonusKor).toBe(0);
  expect(applyLevelUpChoice(s, { type: 'fallback', kind: 'heal' }, stats).state.hp).toBe(80);
  expect(applyLevelUpChoice({ ...s, hp: 95 }, { type: 'fallback', kind: 'heal' }, stats).state.hp).toBe(100);
  expect(applyLevelUpChoice(s, { type: 'fallback', kind: 'kor' }, stats).bonusKor).toBe(20);
  expect(applyLevelUpChoice(s, { type: 'fallback', kind: 'kor' }, stats).state.bonusKor).toBe(20);
});
test('serialize gidiş-dönüş', () => {
  const s = createRunState(9, 1, stats, unlocked);
  const back = JSON.parse(JSON.stringify(s));
  expect(isRunState(back)).toBe(true); expect(back).toEqual(s);
  expect(isRunState({ ...back, level: 'x' })).toBe(false);
  expect(isRunState(null)).toBe(false);
});

test('yeni alanlar başlangıçta boş, eski kayıttaki tur da kabul edilir', () => {
  expect(base.bonusKor).toBe(0);
  expect(base.bossHpRatio).toBeNull();
  const legacy: Record<string, unknown> = JSON.parse(JSON.stringify(base));
  delete legacy.bonusKor; delete legacy.bossHpRatio;
  expect(isRunState(legacy)).toBe(true);
});
