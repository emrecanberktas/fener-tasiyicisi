import { zoneMult } from '../../data/zones';
import type { GearItem, SkillId } from '../../data/types';
import { addAccountXp } from '../progression/account';
import { addToInventory, rollGear } from '../progression/gear';
import type { Rng } from '../rng';
import type { SaveData } from '../save/schema';

export interface RunResult {
  zoneIndex: number;
  survivedSec: number;
  kills: number;
  bossDefeated: boolean;
  skills: Partial<Record<SkillId, number>>;
  bonusKor: number;
}

export interface RunRewards { kor: number; accountXp: number; gear: GearItem[] }

export const BOSS_KOR = 100;
export const LAST_ZONE = 2;

export function computeRunRewards(result: RunResult, rng: Rng, newId: () => string): RunRewards {
  const m = zoneMult(result.zoneIndex);
  const kor = Math.floor(
    Math.floor(result.kills * 0.5 * m) + Math.floor(result.survivedSec / 60) * 10 * m + result.bonusKor + (result.bossDefeated ? BOSS_KOR * m : 0),
  );
  const gear: GearItem[] = [];
  const drops = 1 + Math.floor(result.survivedSec / 120);
  for (let i = 0; i < drops; i++) gear.push(rollGear(rng, newId));
  if (result.bossDefeated) gear.push(rollGear(rng, newId, { minRarity: 2 }));
  return { kor, accountXp: result.kills + Math.floor(result.survivedSec), gear };
}

export function applyRunRewards(save: SaveData, result: RunResult, rewards: RunRewards): { save: SaveData; autoMelted: GearItem[] } {
  let s = addAccountXp({ ...save, kor: save.kor + rewards.kor, bestRunKor: Math.max(save.bestRunKor, rewards.kor), activeRun: null }, rewards.accountXp);
  const autoMelted: GearItem[] = [];
  for (const g of rewards.gear) {
    const r = addToInventory(s, g);
    s = r.save;
    if (r.autoMelted) autoMelted.push(r.autoMelted);
  }
  if (result.bossDefeated) {
    const defeated = s.zones.bossesDefeated.includes(result.zoneIndex) ? s.zones.bossesDefeated : [...s.zones.bossesDefeated, result.zoneIndex];
    s = { ...s, zones: { unlockedIndex: Math.min(LAST_ZONE, Math.max(s.zones.unlockedIndex, result.zoneIndex + 1)), bossesDefeated: defeated } };
  }
  return { save: s, autoMelted };
}
