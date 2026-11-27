import { createHud, formatTime } from '../../src/ui/screens/hud';
import { showResumePrompt } from '../../src/ui/screens/resume';

beforeEach(() => { document.body.innerHTML = ''; });

test('süre biçimi', () => { expect(formatTime(125)).toBe('02:05'); expect(formatTime(0)).toBe('00:00'); expect(formatTime(479.9)).toBe('07:59'); });
test('HUD süreyi ve seviyeyi gösterir, boss çubuğu yalnızca bossta', () => {
  const hud = createHud(document.body, { onPause: vi.fn() });
  hud.update({ elapsedSec: 125, level: 4, xpRatio: 0.5, hpRatio: 1, bossHpRatio: null });
  expect(document.body.textContent).toContain('02:05');
  expect(document.body.textContent).toContain('Seviye 4');
  expect((document.querySelector('[data-boss]') as HTMLElement).hidden).toBe(true);
  hud.update({ elapsedSec: 481, level: 4, xpRatio: 0.5, hpRatio: 1, bossHpRatio: 0.7 });
  expect((document.querySelector('[data-boss]') as HTMLElement).hidden).toBe(false);
});
test('duraklat düğmesi onPause çağırır', () => {
  const onPause = vi.fn();
  createHud(document.body, { onPause });
  (document.querySelector('[data-pause]') as HTMLElement).click();
  expect(onPause).toHaveBeenCalled();
});
test('devam istemi iki seçenek sunar', () => {
  const onResume = vi.fn(), onAbandon = vi.fn();
  showResumePrompt(document.body, { onResume, onAbandon });
  (document.querySelector('[data-resume]') as HTMLElement).click();
  expect(onResume).toHaveBeenCalled();
  showResumePrompt(document.body, { onResume, onAbandon });
  (document.querySelector('[data-abandon]') as HTMLElement).click();
  expect(onAbandon).toHaveBeenCalled();
});
import { showPausePanel } from '../../src/ui/screens/pause';
test('duraklat paneli devam ve bitir', () => {
  const onContinue = vi.fn(), onEnd = vi.fn();
  const close = showPausePanel(document.body, { onContinue, onEnd });
  (document.querySelector('[data-continue]') as HTMLElement).click();
  expect(onContinue).toHaveBeenCalled();
  (document.querySelector('[data-end]') as HTMLElement).click();
  expect(onEnd).toHaveBeenCalled();
  close();
  expect(document.querySelector('[data-continue]')).toBeNull();
});
