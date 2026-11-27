import { QUEST_GEAR_CHANCE, QUEST_KILLS_MAX, QUEST_KILLS_PER_LEVEL, QUEST_KOR_BASE } from '../data/quests';
import { zoneMult } from '../data/zones';
import type { GearItem, QuestTemplate, SkillId } from '../data/types';
import { unlockedSkills } from './progression/account';
import { addToInventory, rollGear } from './progression/gear';
import type { Rng } from './rng';
import type { Quest, SaveData } from './save/schema';

export const ACTIVE_QUEST_COUNT = 3;

export type QuestEvent =
  | { type: 'kills'; count: number }
  | { type: 'reachedSec'; sec: number }
  | { type: 'skillLevel'; skillId: SkillId; level: number }
  | { type: 'bossDefeated'; zoneIndex: number };

type Kind = QuestTemplate['kind'];
const KINDS: readonly Kind[] = ['kills', 'reachMinute', 'skillLevel', 'bossDefeated'];

export const questTarget = (t: QuestTemplate): number => {
  switch (t.kind) {
    case 'kills': return t.target;
    case 'reachMinute': return t.minute * 60;
    case 'skillLevel': return t.level;
    case 'bossDefeated': return 1;
  }
};

export function generateQuest(save: SaveData, rng: Rng, id: string, excludeKinds: readonly Kind[] = []): Quest {
  const kinds = KINDS.filter(k => !excludeKinds.includes(k));
  const kind = rng.pick(kinds.length ? kinds : KINDS);
  let template: QuestTemplate;
  switch (kind) {
    case 'kills':
      template = { kind, target: Math.min(QUEST_KILLS_PER_LEVEL * save.account.level, QUEST_KILLS_MAX) };
      break;
    case 'reachMinute':
      template = { kind, minute: rng.int(1, 8) };
      break;
    case 'skillLevel':
      template = { kind, skillId: rng.pick(unlockedSkills(save)), level: rng.int(3, 5) };
      break;
    case 'bossDefeated':
      template = { kind, zoneIndex: rng.int(0, save.zones.unlockedIndex) };
      break;
  }
  const reward: Quest['reward'] = rng.next() < QUEST_GEAR_CHANCE
    ? { gearMinRarity: 1 }
    : { kor: Math.round(QUEST_KOR_BASE * zoneMult(save.zones.unlockedIndex)) };
  return { id, template, progress: 0, reward };
}

export function ensureQuests(save: SaveData, rng: Rng): SaveData {
  const active = [...save.quests.active];
  let counter = save.quests.counter;
  while (active.length < ACTIVE_QUEST_COUNT) {
    active.push(generateQuest(save, rng, `q${counter++}`, active.map(q => q.template.kind)));
  }
  return { ...save, quests: { active, counter } };
}

function progressFor(q: Quest, e: QuestEvent): number {
  const t = q.template;
  if (t.kind === 'kills' && e.type === 'kills') return q.progress + e.count;
  if (t.kind === 'reachMinute' && e.type === 'reachedSec') return Math.max(q.progress, e.sec);
  if (t.kind === 'skillLevel' && e.type === 'skillLevel' && e.skillId === t.skillId) return Math.max(q.progress, e.level);
  if (t.kind === 'bossDefeated' && e.type === 'bossDefeated' && e.zoneIndex >= t.zoneIndex) return 1;
  return q.progress;
}

export function applyQuestEvents(
  save: SaveData, events: QuestEvent[], rng: Rng, newId: () => string,
): { save: SaveData; completed: Quest[]; gear: GearItem[] } {
  const completed: Quest[] = [];
  const remaining: Quest[] = [];
  for (const q of save.quests.active) {
    const progress = events.reduce((p, e) => progressFor({ ...q, progress: p }, e), q.progress);
    const updated = { ...q, progress };
    (progress >= questTarget(q.template) ? completed : remaining).push(updated);
  }
  let s: SaveData = { ...save, quests: { ...save.quests, active: remaining } };
  const gear: GearItem[] = [];
  for (const q of completed) {
    if ('kor' in q.reward) {
      s = { ...s, kor: s.kor + q.reward.kor };
    } else {
      const g = rollGear(rng, newId, { minRarity: q.reward.gearMinRarity });
      gear.push(g);
      s = addToInventory(s, g).save;
    }
  }
  return { save: ensureQuests(s, rng), completed, gear };
}
