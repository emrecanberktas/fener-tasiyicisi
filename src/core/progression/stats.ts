import { PLAYER_BASE } from '../../data/player';
import { SKILLS } from '../../data/skills';
import { treeNode } from '../../data/tree';
import type { PlayerStats, RuleId, SkillId, StatKey } from '../../data/types';
import type { SaveData } from '../save/schema';

export const LEVEL_BONUS = { maxHp: 5, damagePct: 2 } as const;

type Totals = Record<StatKey, number>;
const emptyTotals = (): Totals =>
  ({ damagePct: 0, areaPct: 0, moveSpeedPct: 0, maxHp: 0, regen: 0, xpGainPct: 0, pickupRangePct: 0 });

export function statsFromTotals(t: Totals, rules: RuleId[]): PlayerStats {
  return {
    maxHp: PLAYER_BASE.maxHp + t.maxHp,
    regen: PLAYER_BASE.regen + t.regen,
    damageMult: 1 + t.damagePct / 100,
    areaMult: 1 + t.areaPct / 100,
    moveSpeedMult: 1 + t.moveSpeedPct / 100,
    xpGainMult: 1 + t.xpGainPct / 100,
    pickupRangeMult: 1 + t.pickupRangePct / 100,
    rules,
  };
}

export function computePlayerStats(save: SaveData): PlayerStats {
  const t = emptyTotals();
  const lv = save.account.level - 1;
  t.maxHp += LEVEL_BONUS.maxHp * lv;
  t.damagePct += LEVEL_BONUS.damagePct * lv;

  const equippedIds = new Set(Object.values(save.gear.equipped).filter((x): x is string => x !== null));
  for (const item of save.gear.inventory) {
    if (!equippedIds.has(item.id)) continue;
    for (const [k, v] of Object.entries(item.stats) as [StatKey, number][]) t[k] += v;
  }
  const rules: RuleId[] = [];
  for (const id of save.tree.unlocked) {
    const n = treeNode(id);
    if (!n) continue;
    if (n.effect.type === 'stat') t[n.effect.stat] += n.effect.value;
    else rules.push(n.effect.rule);
  }
  return statsFromTotals(t, rules);
}

const PASSIVE_TO_FIELD: Partial<Record<StatKey, keyof Omit<PlayerStats, 'rules' | 'maxHp' | 'regen'>>> = {
  damagePct: 'damageMult', areaPct: 'areaMult', moveSpeedPct: 'moveSpeedMult', xpGainPct: 'xpGainMult', pickupRangePct: 'pickupRangeMult',
};

/** Tur içi pasif yetenekleri kalıcı istatistiklerin üstüne uygular. */
export function runStats(base: PlayerStats, skills: Partial<Record<SkillId, number>>): PlayerStats {
  const out: PlayerStats = { ...base, rules: [...base.rules] };
  for (const [id, lv] of Object.entries(skills) as [SkillId, number][]) {
    const def = SKILLS[id];
    if (def.kind !== 'passive' || !lv) continue;
    for (const [key, per] of Object.entries(def.perLevel) as [StatKey, number][]) {
      if (key === 'regen') out.regen += per * lv;
      else if (key === 'maxHp') out.maxHp += per * lv;
      else {
        const field = PASSIVE_TO_FIELD[key];
        if (field) out[field] *= 1 + (per * lv) / 100;
      }
    }
  }
  return out;
}
