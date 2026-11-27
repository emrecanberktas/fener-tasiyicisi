import { SKILLS } from '../../data/skills';
import type { SkillId } from '../../data/types';
import type { SaveData } from '../save/schema';

export const accountXpToNext = (level: number): number => Math.round(100 * level ** 1.5);

export function addAccountXp(save: SaveData, xp: number): SaveData {
  let { level, xp: cur } = save.account;
  cur += Math.max(0, xp);
  while (cur >= accountXpToNext(level)) {
    cur -= accountXpToNext(level);
    level += 1;
  }
  return { ...save, account: { level, xp: cur } };
}

export const unlockedSkills = (save: SaveData): SkillId[] =>
  Object.values(SKILLS).filter(s => s.unlockAccountLevel <= save.account.level).map(s => s.id);
