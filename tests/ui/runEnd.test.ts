import { showRunEnd } from '../../src/ui/screens/runEnd';
import { theme } from '../../src/theme';

beforeEach(() => { document.body.innerHTML = ''; });
test('tur sonu özeti ve düğmeler', () => {
  const onCamp = vi.fn(), onAgain = vi.fn();
  showRunEnd(document.body, {
    result: { zoneIndex: 0, survivedSec: 312, kills: 401, bossDefeated: false, skills: {}, bonusKor: 0 },
    rewards: { kor: 250, accountXp: 713, gear: [{ id: 'g', slot: 'cam', rarity: 2, stats: { areaPct: 11 } }] },
    completedQuests: [],
  }, { onCamp, onAgain });
  const text = document.body.textContent ?? '';
  expect(text).toContain('05:12'); expect(text).toContain('401'); expect(text).toContain('250');
  expect(text).toContain(theme.rarities[2]);
  (document.querySelector('[data-camp]') as HTMLElement).click();
  (document.querySelector('[data-again]') as HTMLElement).click();
  expect(onCamp).toHaveBeenCalled(); expect(onAgain).toHaveBeenCalled();
});
