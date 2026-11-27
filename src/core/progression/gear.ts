import { GEAR_SLOT_STATS, GEAR_SLOTS, GEAR_STAT_BASE } from '../../data/gear';
import type { GearItem, Rarity, StatKey } from '../../data/types';
import type { Rng } from '../rng';
import type { SaveData } from '../save/schema';

export const INVENTORY_CAP = 30;
export const RARITY_WEIGHTS = [60, 28, 10, 2] as const;
export const RARITY_MULT = [1, 1.5, 2.2, 3.2] as const;
export const MELT_VALUE = [5, 12, 30, 80] as const;

export function rollGear(rng: Rng, newId: () => string, opts: { minRarity?: Rarity } = {}): GearItem {
  const min = opts.minRarity ?? 0;
  const weights = RARITY_WEIGHTS.map((w, i) => (i >= min ? w : 0));
  const rarity = rng.weightedIndex(weights) as Rarity;
  const slot = rng.pick(GEAR_SLOTS);
  const pool = [...GEAR_SLOT_STATS[slot]];
  const count = rarity < 2 ? 1 : 2;
  const stats: Partial<Record<StatKey, number>> = {};
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = rng.int(0, pool.length - 1);
    const stat = pool.splice(idx, 1)[0]!;
    const value = GEAR_STAT_BASE[stat] * RARITY_MULT[rarity] * (0.8 + rng.next() * 0.4);
    stats[stat] = Math.round(value * 10) / 10;
  }
  return { id: newId(), slot, rarity, stats };
}

export function gearPower(item: GearItem): number {
  return (Object.entries(item.stats) as [StatKey, number][])
    .reduce((sum, [k, v]) => sum + v / GEAR_STAT_BASE[k], 0);
}

const equippedIds = (save: SaveData): Set<string> =>
  new Set(Object.values(save.gear.equipped).filter((x): x is string => x !== null));

export function addToInventory(save: SaveData, item: GearItem): { save: SaveData; autoMelted: GearItem | null } {
  const inventory = [...save.gear.inventory, item];
  if (inventory.length <= INVENTORY_CAP) return { save: { ...save, gear: { ...save.gear, inventory } }, autoMelted: null };
  const equipped = equippedIds(save);
  let weakest: GearItem | null = null;
  for (const g of inventory) {
    if (equipped.has(g.id)) continue;
    if (!weakest || gearPower(g) < gearPower(weakest)) weakest = g;
  }
  if (!weakest) return { save: { ...save, gear: { ...save.gear, inventory } }, autoMelted: null };
  const w = weakest;
  return {
    save: { ...save, kor: save.kor + MELT_VALUE[w.rarity], gear: { ...save.gear, inventory: inventory.filter(g => g !== w) } },
    autoMelted: w,
  };
}

export function equip(save: SaveData, itemId: string): SaveData {
  const item = save.gear.inventory.find(g => g.id === itemId);
  if (!item) return save;
  return { ...save, gear: { ...save.gear, equipped: { ...save.gear.equipped, [item.slot]: item.id } } };
}

export function autoEquip(save: SaveData): SaveData {
  const equipped = { ...save.gear.equipped };
  for (const slot of GEAR_SLOTS) {
    const best = save.gear.inventory
      .filter(g => g.slot === slot)
      .reduce<GearItem | null>((b, g) => (!b || gearPower(g) > gearPower(b) ? g : b), null);
    if (best) equipped[slot] = best.id;
  }
  return { ...save, gear: { ...save.gear, equipped } };
}

export function meltItems(save: SaveData, itemIds: string[]): SaveData {
  const equipped = equippedIds(save);
  const toMelt = new Set(itemIds.filter(id => !equipped.has(id)));
  let kor = save.kor;
  const inventory = save.gear.inventory.filter(g => {
    if (!toMelt.has(g.id)) return true;
    kor += MELT_VALUE[g.rarity];
    return false;
  });
  return { ...save, kor, gear: { ...save.gear, inventory } };
}

export function bestUpgradeFor(save: SaveData): GearItem | null {
  const equipped = equippedIds(save);
  let best: { item: GearItem; gain: number } | null = null;
  for (const g of save.gear.inventory) {
    if (equipped.has(g.id)) continue;
    const curId = save.gear.equipped[g.slot];
    const cur = curId ? save.gear.inventory.find(x => x.id === curId) : undefined;
    const gain = gearPower(g) - (cur ? gearPower(cur) : 0);
    if (gain > 0 && (!best || gain > best.gain)) best = { item: g, gain };
  }
  return best?.item ?? null;
}
