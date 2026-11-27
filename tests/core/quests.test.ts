import { ACTIVE_QUEST_COUNT, applyQuestEvents, ensureQuests } from '../../src/core/quests';
import { createRng } from '../../src/core/rng';
import { createDefaultSave, type Quest, type SaveData } from '../../src/core/save/schema';
import type { QuestTemplate } from '../../src/data/types';

const withQuest = (s: SaveData, template: QuestTemplate, reward: Quest['reward']): SaveData => ({
  ...s, quests: { ...s.quests, active: [{ id: 'fixed', template, progress: 0, reward }, ...s.quests.active.filter(q => q.template.kind !== template.kind).slice(0, 2)] },
});
let n = 0; const id = () => `g${n++}`;

test('her zaman tam 3 görev, kind tekrarı yok', () => {
  const q = ensureQuests(createDefaultSave(0), createRng(1)).quests.active;
  expect(q).toHaveLength(ACTIVE_QUEST_COUNT);
  expect(new Set(q.map(x => x.template.kind)).size).toBe(3);
});
test('ensureQuests mevcut görevleri korur', () => {
  const s = ensureQuests(createDefaultSave(0), createRng(1));
  expect(ensureQuests(s, createRng(2)).quests.active).toEqual(s.quests.active);
});
test('tamamlanan görevin yerine aynı anda yenisi gelir ve ödül verilir', () => {
  let s = ensureQuests(createDefaultSave(0), createRng(1));
  s = withQuest(s, { kind: 'kills', target: 100 }, { kor: 40 });
  const r = applyQuestEvents(s, [{ type: 'kills', count: 150 }], createRng(2), id);
  expect(r.completed.map(q => q.id)).toEqual(['fixed']);
  expect(r.save.quests.active).toHaveLength(3);
  expect(r.save.quests.active.some(q => q.id === 'fixed')).toBe(false);
  expect(r.save.kor).toBe(40);
});
test('ilerleme turlar arasında birikir', () => {
  let s = withQuest(ensureQuests(createDefaultSave(0), createRng(1)), { kind: 'kills', target: 100 }, { kor: 40 });
  s = applyQuestEvents(s, [{ type: 'kills', count: 60 }], createRng(2), id).save;
  expect(s.quests.active.find(q => q.id === 'fixed')?.progress).toBe(60);
  const r = applyQuestEvents(s, [{ type: 'kills', count: 60 }], createRng(3), id);
  expect(r.completed).toHaveLength(1);
});
test('reachMinute saniye olayıyla tamamlanır', () => {
  const s = withQuest(ensureQuests(createDefaultSave(0), createRng(1)), { kind: 'reachMinute', minute: 3 }, { kor: 40 });
  expect(applyQuestEvents(s, [{ type: 'reachedSec', sec: 170 }], createRng(2), id).completed).toHaveLength(0);
  expect(applyQuestEvents(s, [{ type: 'reachedSec', sec: 181 }], createRng(2), id).completed).toHaveLength(1);
});
test('parça ödülü envantere girer', () => {
  const s = withQuest(ensureQuests(createDefaultSave(0), createRng(1)), { kind: 'skillLevel', skillId: 'lightRing', level: 3 }, { gearMinRarity: 1 });
  const r = applyQuestEvents(s, [{ type: 'skillLevel', skillId: 'lightRing', level: 3 }], createRng(2), id);
  expect(r.gear).toHaveLength(1);
  expect(r.gear[0]!.rarity).toBeGreaterThanOrEqual(1);
  expect(r.save.gear.inventory).toHaveLength(1);
});
test('üretilen görevler sınırlara uyar', () => {
  for (let seed = 0; seed < 50; seed++) {
    const qs = ensureQuests(createDefaultSave(0), createRng(seed)).quests.active;
    for (const q of qs) {
      const t = q.template;
      if (t.kind === 'kills') expect(t.target).toBe(100);
      if (t.kind === 'reachMinute') { expect(t.minute).toBeGreaterThanOrEqual(1); expect(t.minute).toBeLessThanOrEqual(8); }
      if (t.kind === 'skillLevel') { expect(t.level).toBeGreaterThanOrEqual(3); expect(['lightRing', 'sparkRain', 'orbitFlames', 'wideLight', 'intenseFlame', 'lightStep']).toContain(t.skillId); }
      if (t.kind === 'bossDefeated') expect(t.zoneIndex).toBe(0);
    }
  }
});
