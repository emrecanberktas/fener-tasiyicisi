import { watchVisibility } from '../../src/game/visibility';

const setState = (v: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => v });
  document.dispatchEvent(new Event('visibilitychange'));
};

test('arka plana geçince onHidden çağrılır, geri gelince çağrılmaz', () => {
  const onHidden = vi.fn();
  const stop = watchVisibility(document, onHidden);
  setState('hidden');
  setState('visible');
  expect(onHidden).toHaveBeenCalledTimes(1);
  stop();
  setState('hidden');
  expect(onHidden).toHaveBeenCalledTimes(1);
});
