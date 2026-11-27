import { addToInventory, equip } from '../../../src/core/progression/gear';
import { getRecommendation } from '../../../src/core/progression/recommend';
import { createDefaultSave } from '../../../src/core/save/schema';
import { TREE } from '../../../src/data/tree';

test('hiçbir şey yoksa null', () => expect(getRecommendation(createDefaultSave(0))).toBeNull());
test('daha iyi parça ve açılabilir düğüm birlikte varsa betterGear', () => {
  const s = addToInventory({ ...createDefaultSave(0), kor: 100 }, { id: 'g', slot: 'cam', rarity: 1, stats: { areaPct: 5 } }).save;
  expect(getRecommendation(s)).toEqual({ kind: 'betterGear', itemId: 'g' });
});
test('yalnızca Kor varsa unlockNode', () => {
  expect(getRecommendation({ ...createDefaultSave(0), kor: 60 })).toEqual({ kind: 'unlockNode', nodeId: TREE[0]!.id });
});
test('takılı parça öneri üretmez', () => {
  const s = equip(addToInventory(createDefaultSave(0), { id: 'g', slot: 'cam', rarity: 1, stats: { areaPct: 5 } }).save, 'g');
  expect(getRecommendation(s)).toBeNull();
});
test('yeni açılan ama hiç denenmemiş bölge önerilir', () => {
  const s = { ...createDefaultSave(0), zones: { unlockedIndex: 1, bossesDefeated: [0] } };
  expect(getRecommendation(s)).toEqual({ kind: 'newZone', zoneIndex: 1 });
});
