import { SKILLS } from '../../data/skills';
import type { PlayerStats, SkillId } from '../../data/types';
import { createRng, type Rng } from '../rng';

export const RUN_TARGET_SEC = 480;
export const MAX_ACTIVE = 4;
export const MAX_PASSIVE = 4;
export const FALLBACK_HEAL_RATIO = 0.3;
export const FALLBACK_KOR = 20;

export interface RunState {
  seed: number;
  zoneIndex: number;
  elapsedSec: number;
  level: number;
  xp: number;
  hp: number;
  kills: number;
  skills: Partial<Record<SkillId, number>>;
  pendingLevelUps: number;
  rerollsLeft: number;
  bossSpawned: boolean;
  playerX: number;
  playerY: number;
  /** Yedek karttan (+Kor) bu turda kazanılan Kor. */
  bonusKor: number;
  /** Boss çıktıysa kalan canı (0..1); devam edilen turda boss bu canla döner. */
  bossHpRatio: number | null;
}

export type LevelUpChoice =
  | { type: 'skill'; skillId: SkillId; newLevel: number }
  | { type: 'fallback'; kind: 'heal' | 'kor' };

export function createRunState(seed: number, zoneIndex: number, stats: PlayerStats, unlocked: SkillId[]): RunState {
  const skills: RunState['skills'] = { lightRing: 1 };
  if (stats.rules.includes('startWithTwoSkills')) {
    const extra = unlocked.filter(id => id !== 'lightRing' && SKILLS[id].kind === 'active');
    if (extra.length) skills[createRng(seed ^ 0x9e3779b9).pick(extra)] = 1;
  }
  return {
    seed, zoneIndex, elapsedSec: 0, level: 1, xp: 0, hp: stats.maxHp, kills: 0, skills,
    pendingLevelUps: 0, rerollsLeft: stats.rules.includes('oneReroll') ? 1 : 0, bossSpawned: false, playerX: 0, playerY: 0,
    bonusKor: 0, bossHpRatio: null,
  };
}

export const xpToNextLevel = (level: number): number => 5 + 4 * level;

export function addRunXp(state: RunState, amount: number): RunState {
  let { level, xp, pendingLevelUps } = state;
  xp += Math.max(0, amount);
  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level += 1;
    pendingLevelUps += 1;
  }
  return { ...state, level, xp, pendingLevelUps };
}

export function rollLevelUpChoices(state: RunState, rng: Rng, unlocked: SkillId[], count: 3 | 4): LevelUpChoice[] {
  const owned = Object.keys(state.skills) as SkillId[];
  const activeCount = owned.filter(id => SKILLS[id].kind === 'active').length;
  const passiveCount = owned.length - activeCount;
  const eligible: LevelUpChoice[] = [];
  for (const id of new Set<SkillId>([...owned, ...unlocked])) {
    const lv = state.skills[id] ?? 0;
    if (lv >= SKILLS[id].maxLevel) continue;
    if (lv === 0) {
      const kind = SKILLS[id].kind;
      if (kind === 'active' && activeCount >= MAX_ACTIVE) continue;
      if (kind === 'passive' && passiveCount >= MAX_PASSIVE) continue;
    }
    eligible.push({ type: 'skill', skillId: id, newLevel: lv + 1 });
  }
  if (eligible.length === 0) return [{ type: 'fallback', kind: 'heal' }, { type: 'fallback', kind: 'kor' }];
  const picked: LevelUpChoice[] = [];
  while (picked.length < count && eligible.length > 0) {
    picked.push(eligible.splice(rng.int(0, eligible.length - 1), 1)[0]!);
  }
  return picked;
}

export function applyLevelUpChoice(state: RunState, choice: LevelUpChoice, stats: PlayerStats): { state: RunState; bonusKor: number } {
  const next = { ...state, pendingLevelUps: Math.max(0, state.pendingLevelUps - 1) };
  if (choice.type === 'skill') return { state: { ...next, skills: { ...next.skills, [choice.skillId]: choice.newLevel } }, bonusKor: 0 };
  if (choice.kind === 'heal') return { state: { ...next, hp: Math.min(stats.maxHp, next.hp + stats.maxHp * FALLBACK_HEAL_RATIO) }, bonusKor: 0 };
  return { state: { ...next, bonusKor: (next.bonusKor ?? 0) + FALLBACK_KOR }, bonusKor: FALLBACK_KOR };
}

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);

export function isRunState(x: unknown): x is RunState {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  const nums = ['seed', 'zoneIndex', 'elapsedSec', 'level', 'xp', 'hp', 'kills', 'pendingLevelUps', 'rerollsLeft', 'playerX', 'playerY'];
  if (!nums.every(k => isNum(r[k]))) return false;
  if (typeof r.bossSpawned !== 'boolean') return false;
  // Sonradan eklenen alanlar: eski kayıtlarda olmayabilir.
  if (r.bonusKor !== undefined && !isNum(r.bonusKor)) return false;
  if (r.bossHpRatio !== undefined && r.bossHpRatio !== null && !isNum(r.bossHpRatio)) return false;
  if (typeof r.skills !== 'object' || r.skills === null) return false;
  return Object.entries(r.skills).every(([k, v]) => k in SKILLS && isNum(v));
}

/** Eski kayıtlardan gelen turu güncel alanlarla tamamlar. */
export function normalizeRunState(s: RunState): RunState {
  return { ...s, bonusKor: s.bonusKor ?? 0, bossHpRatio: s.bossHpRatio ?? null };
}
