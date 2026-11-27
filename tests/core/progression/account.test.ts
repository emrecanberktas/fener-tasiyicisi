import { accountXpToNext, addAccountXp, unlockedSkills } from '../../../src/core/progression/account';
import { createDefaultSave } from '../../../src/core/save/schema';

test('XP eğrisi', () => { expect(accountXpToNext(1)).toBe(100); expect(accountXpToNext(4)).toBe(800); });
test('tek seferde birden çok seviye', () => {
  const s = addAccountXp(createDefaultSave(0), 100 + 283 + 50);
  expect(s.account).toEqual({ level: 3, xp: 50 });
});
test('seviye 2 attraction yeteneğini açar', () => {
  const s = addAccountXp(createDefaultSave(0), 100);
  expect(unlockedSkills(s)).toContain('attraction');
  expect(unlockedSkills(createDefaultSave(0))).not.toContain('attraction');
});
