import { applyQuestEvents, type QuestEvent } from '../core/quests';
import type { Rng } from '../core/rng';
import { applyRunRewards, computeRunRewards, type RunResult, type RunRewards } from '../core/run/rewards';
import type { RunState } from '../core/run/runState';
import type { Quest, SaveData } from '../core/save/schema';
import type { GearItem, SkillId } from '../data/types';

export interface FinishedRun { save: SaveData; rewards: RunRewards; completedQuests: Quest[]; autoMelted: GearItem[] }

export function finishRun(save: SaveData, result: RunResult, rng: Rng, newId: () => string): FinishedRun {
  const rewards = computeRunRewards(result, rng, newId);
  const applied = applyRunRewards(save, result, rewards);
  const events: QuestEvent[] = [
    { type: 'kills', count: result.kills },
    { type: 'reachedSec', sec: result.survivedSec },
    ...(Object.entries(result.skills) as [SkillId, number][]).map(([skillId, level]): QuestEvent => ({ type: 'skillLevel', skillId, level })),
  ];
  if (result.bossDefeated) events.push({ type: 'bossDefeated', zoneIndex: result.zoneIndex });
  const q = applyQuestEvents(applied.save, events, rng, newId);
  return { save: q.save, rewards, completedQuests: q.completed, autoMelted: applied.autoMelted };
}

/** Yarım kalan turu ölüm gibi bitirirken kullanılır. */
export function resultFromState(s: RunState): RunResult {
  return { zoneIndex: s.zoneIndex, survivedSec: Math.floor(s.elapsedSec), kills: s.kills, bossDefeated: false, skills: { ...s.skills }, bonusKor: s.bonusKor ?? 0 };
}
