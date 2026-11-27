import type { GearSlot, StatKey } from './types';

export const GEAR_STAT_BASE: Record<StatKey, number> = {
  damagePct: 5, areaPct: 5, moveSpeedPct: 4, maxHp: 15, regen: 0.3, xpGainPct: 5, pickupRangePct: 10,
};

export const GEAR_SLOT_STATS: Record<GearSlot, StatKey[]> = {
  hazne: ['maxHp', 'regen', 'damagePct'],
  cam: ['areaPct', 'damagePct', 'pickupRangePct'],
  fitil: ['moveSpeedPct', 'xpGainPct', 'regen'],
};

export const GEAR_SLOTS: readonly GearSlot[] = ['hazne', 'cam', 'fitil'];
