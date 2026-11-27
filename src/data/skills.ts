import type { SkillDef, SkillId } from './types';

const active = (id: SkillId, unlockAccountLevel: number, base: Record<string, number>, perLevel: Record<string, number>): SkillDef =>
  ({ id, kind: 'active', maxLevel: 5, unlockAccountLevel, base, perLevel });
const passive = (id: SkillId, unlockAccountLevel: number, perLevel: Record<string, number>): SkillDef =>
  ({ id, kind: 'passive', maxLevel: 5, unlockAccountLevel, base: {}, perLevel });

export const SKILLS: Record<SkillId, SkillDef> = {
  lightRing: active('lightRing', 1, { dps: 12, radius: 70 }, { dps: 4, radius: 8 }),
  sparkRain: active('sparkRain', 1, { damage: 20, count: 2, cooldown: 1.6, radius: 40 }, { damage: 6, count: 1, cooldown: -0.1 }),
  orbitFlames: active('orbitFlames', 1, { damage: 10, count: 2, radius: 90, rps: 0.8 }, { damage: 3, count: 1 }),
  lightSpear: active('lightSpear', 3, { damage: 30, cooldown: 1.2, pierce: 2, speed: 420 }, { damage: 8, pierce: 1, cooldown: -0.08 }),
  chainLightning: active('chainLightning', 5, { damage: 18, jumps: 3, cooldown: 1.4, range: 160 }, { damage: 5, jumps: 1 }),
  flare: active('flare', 8, { damage: 40, cooldown: 4, radius: 120 }, { damage: 12, radius: 12, cooldown: -0.3 }),
  wideLight: passive('wideLight', 1, { areaPct: 10 }),
  intenseFlame: passive('intenseFlame', 1, { damagePct: 10 }),
  lightStep: passive('lightStep', 1, { moveSpeedPct: 8 }),
  attraction: passive('attraction', 2, { pickupRangePct: 25 }),
  wick: passive('wick', 4, { regen: 0.5 }),
  amber: passive('amber', 6, { xpGainPct: 10 }),
};

/** Seviye N'deki parametre: base + perLevel * (N - 1). */
export function skillParam(id: SkillId, key: string, level: number): number {
  const def = SKILLS[id];
  return (def.base[key] ?? 0) + (def.perLevel[key] ?? 0) * (level - 1);
}
