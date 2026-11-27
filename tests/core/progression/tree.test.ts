import { canUnlockNode, cheapestUnlockable, unlockNode } from '../../../src/core/progression/tree';
import { createDefaultSave } from '../../../src/core/save/schema';
import { TREE } from '../../../src/data/tree';

const withKor = (kor: number, unlocked: string[] = []) => ({ ...createDefaultSave(0), kor, tree: { unlocked } });

test('Kor yetmezse açılamaz', () => expect(canUnlockNode(withKor(49), 't01')).toBe(false));
test('gereksinim açık değilse açılamaz', () => expect(canUnlockNode(withKor(1000), 't02')).toBe(false));
test('açınca Kor düşer ve düğüm eklenir', () => {
  const s = unlockNode(withKor(60), 't01');
  expect(s.kor).toBe(10); expect(s.tree.unlocked).toEqual(['t01']);
});
test('aynı düğüm iki kez açılamaz', () => {
  expect(canUnlockNode(withKor(1000, ['t01']), 't01')).toBe(false);
  expect(() => unlockNode(withKor(1000, ['t01']), 't01')).toThrow();
});
test('bilinmeyen düğüm açılamaz', () => expect(canUnlockNode(withKor(9999), 'yok')).toBe(false));
test('cheapestUnlockable', () => {
  expect(cheapestUnlockable(withKor(60))?.id).toBe(TREE[0]!.id);
  expect(cheapestUnlockable(withKor(10))).toBeNull();
});
