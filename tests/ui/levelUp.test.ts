import { showLevelUp } from '../../src/ui/screens/levelUp';
import { createRunState, type LevelUpChoice } from '../../src/core/run/runState';
import { theme } from '../../src/theme';
import type { PlayerStats, SkillId } from '../../src/data/types';

const stats: PlayerStats = { maxHp: 100, regen: 0, damageMult: 1, areaMult: 1, moveSpeedMult: 1, xpGainMult: 1, pickupRangeMult: 1, rules: [] };
const st = createRunState(1, 0, stats, ['lightRing']);
const skill = (skillId: SkillId, newLevel: number): LevelUpChoice => ({ type: 'skill', skillId, newLevel });
beforeEach(() => { document.body.innerHTML = ''; });

test('her seçim için bir kart, tıklayınca onChoose', () => {
  const onChoose = vi.fn();
  showLevelUp(document.body, [skill('sparkRain', 1), skill('wick', 2), skill('lightRing', 3)], st, { rerollsLeft: 0, onChoose, onReroll: vi.fn() });
  const cards = document.querySelectorAll('[data-choice]');
  expect(cards).toHaveLength(3);
  expect(cards[1]!.textContent).toContain(theme.skills.wick.name);
  expect(cards[1]!.querySelectorAll('.pip.on')).toHaveLength(1);
  expect(cards[1]!.querySelectorAll('.pip.new')).toHaveLength(1);
  expect(cards[1]!.querySelectorAll('.pip')).toHaveLength(5);
  expect(cards[1]!.querySelector('img')).not.toBeNull();
  (cards[1] as HTMLElement).click();
  expect(onChoose).toHaveBeenCalledWith(skill('wick', 2));
});
test('rerollsLeft 0 ise yenile düğmesi yok, varsa çağırır', () => {
  showLevelUp(document.body, [skill('sparkRain', 1)], st, { rerollsLeft: 0, onChoose: vi.fn(), onReroll: vi.fn() });
  expect(document.querySelector('[data-reroll]')).toBeNull();
  document.body.innerHTML = '';
  const onReroll = vi.fn();
  showLevelUp(document.body, [skill('sparkRain', 1)], st, { rerollsLeft: 1, onChoose: vi.fn(), onReroll });
  (document.querySelector('[data-reroll]') as HTMLElement).click();
  expect(onReroll).toHaveBeenCalled();
});
test('yedek kartlar metinle gösterilir ve kapatıcı overlay i kaldırır', () => {
  const close = showLevelUp(document.body, [{ type: 'fallback', kind: 'heal' }, { type: 'fallback', kind: 'kor' }], st, { rerollsLeft: 0, onChoose: vi.fn(), onReroll: vi.fn() });
  expect(document.body.textContent).toContain(theme.ui.heal);
  expect(document.body.textContent).toContain(theme.ui.bonusKor);
  close();
  expect(document.querySelectorAll('[data-choice]')).toHaveLength(0);
});
