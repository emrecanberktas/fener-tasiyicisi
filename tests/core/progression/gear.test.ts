import { addToInventory, autoEquip, bestUpgradeFor, equip, gearPower, INVENTORY_CAP, meltItems, rollGear } from '../../../src/core/progression/gear';
import { createRng } from '../../../src/core/rng';
import { createDefaultSave } from '../../../src/core/save/schema';
import type { GearItem, GearSlot, Rarity, StatKey } from '../../../src/data/types';

const item = (id: string, rarity: Rarity, stats: Partial<Record<StatKey, number>>, slot: GearSlot = 'cam'): GearItem => ({ id, slot, rarity, stats });

test('minRarity uyulur, nadirlik 2+ iki farklı özellik taşır', () => {
  const r = createRng(3); let n = 0;
  for (let i = 0; i < 100; i++) {
    const g = rollGear(r, () => `g${n++}`, { minRarity: 2 });
    expect(g.rarity).toBeGreaterThanOrEqual(2);
    expect(Object.keys(g.stats)).toHaveLength(2);
  }
});
test('nadirlik 0-1 tek özellik, özellik yuvaya ait', () => {
  const r = createRng(11); let n = 0;
  for (let i = 0; i < 200; i++) {
    const g = rollGear(r, () => `g${n++}`);
    if (g.rarity < 2) expect(Object.keys(g.stats)).toHaveLength(1);
  }
});
test('envanter doluyken en zayıf takılı olmayan parça eritilir ve Kor eklenir', () => {
  let s = createDefaultSave(0);
  for (let i = 0; i < 30; i++) s = addToInventory(s, item(`g${i}`, 1, { maxHp: 10 + i })).save;
  s = equip(s, 'g0');
  const { save, autoMelted } = addToInventory(s, item('new', 1, { maxHp: 100 }));
  expect(autoMelted?.id).toBe('g1');
  expect(save.gear.inventory).toHaveLength(INVENTORY_CAP);
  expect(save.kor).toBe(12);
});
test('yeni parça en zayıfsa kendisi eritilir', () => {
  let s = createDefaultSave(0);
  for (let i = 0; i < 30; i++) s = addToInventory(s, item(`g${i}`, 1, { maxHp: 50 })).save;
  const { save, autoMelted } = addToInventory(s, item('weak', 0, { maxHp: 1 }));
  expect(autoMelted?.id).toBe('weak');
  expect(save.kor).toBe(5);
});
test('takılı parça eritilmez', () => {
  let s = addToInventory(createDefaultSave(0), item('a', 0, { maxHp: 5 })).save;
  s = meltItems(equip(s, 'a'), ['a']);
  expect(s.gear.inventory.map(i => i.id)).toEqual(['a']);
});
test('eritme Kor verir', () => {
  const s = addToInventory(createDefaultSave(0), item('a', 3, { maxHp: 5 })).save;
  expect(meltItems(s, ['a']).kor).toBe(80);
});
test('autoEquip her yuvaya en güçlüsünü takar', () => {
  let s = createDefaultSave(0);
  s = addToInventory(s, item('weak', 0, { damagePct: 5 })).save;
  s = addToInventory(s, item('strong', 2, { damagePct: 10, areaPct: 5 })).save;
  expect(autoEquip(s).gear.equipped.cam).toBe('strong');
});
test('bestUpgradeFor takılıdan güçlü parçayı bulur', () => {
  let s = addToInventory(createDefaultSave(0), item('weak', 0, { damagePct: 5 })).save;
  s = equip(s, 'weak');
  expect(bestUpgradeFor(s)).toBeNull();
  s = addToInventory(s, item('strong', 2, { damagePct: 10 })).save;
  expect(bestUpgradeFor(s)?.id).toBe('strong');
  expect(gearPower(item('x', 0, { damagePct: 10, maxHp: 15 }))).toBeCloseTo(3);
});
