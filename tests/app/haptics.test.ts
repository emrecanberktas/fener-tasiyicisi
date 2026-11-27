import { hapticPattern, vibrate } from '../../src/app/haptics';

test('olay başına titreşim deseni', () => {
  expect(hapticPattern('hurt')).toEqual([18]);
  expect(hapticPattern('levelUp')).toEqual([12, 40, 12]);
  expect(hapticPattern('death')).toEqual([60, 40, 120]);
});
test('ayar kapalıysa titreşmez, açıksa navigator.vibrate çağrılır', () => {
  const fn = vi.fn(() => true);
  Object.defineProperty(navigator, 'vibrate', { configurable: true, value: fn });
  vibrate('hurt', false);
  expect(fn).not.toHaveBeenCalled();
  vibrate('hurt', true);
  expect(fn).toHaveBeenCalledWith([18]);
});
