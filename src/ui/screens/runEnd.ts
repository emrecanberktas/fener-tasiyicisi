import type { RunResult, RunRewards } from '../../core/run/rewards';
import type { Quest } from '../../core/save/schema';
import type { StatKey } from '../../data/types';
import { theme } from '../../theme';
import { h, hex, mount } from '../dom';
import { formatTime } from './hud';

export function showRunEnd(
  root: HTMLElement,
  data: { result: RunResult; rewards: RunRewards; completedQuests: Quest[] },
  opts: { onCamp(): void; onAgain(): void },
): () => void {
  const { result, rewards } = data;
  const stat = (label: string, value: string) => h('div', { class: 'stat' }, h('span', { class: 'muted' }, label), h('strong', {}, value));
  const gear = rewards.gear.map(g => h('li', { class: 'gear-row', style: { borderLeftColor: hex(theme.rarityColors[g.rarity]) } },
    h('span', { style: { color: hex(theme.rarityColors[g.rarity]) } }, `${theme.rarities[g.rarity]} ${theme.slots[g.slot]}`),
    h('span', { class: 'muted' }, (Object.entries(g.stats) as [StatKey, number][]).map(([k, v]) => `${theme.stats[k]} +${v}`).join(' · '))));
  const title = result.bossDefeated ? `${theme.enemies.mistHeart.name} söndü` : 'Işığın söndü';
  return mount(root, h('div', { class: 'screen run-end' },
    h('div', { class: 'screen-body' },
      h('span', { class: 'eyebrow' }, theme.zones[result.zoneIndex as 0 | 1 | 2].name),
      h('h1', {}, title),
      h('div', { class: 'stats' },
        stat('Süre', formatTime(result.survivedSec)),
        stat('Öldürülen', String(result.kills)),
        stat('Kor', `+${rewards.kor}`),
        stat('Hesap XP', `+${rewards.accountXp}`)),
      gear.length ? h('h3', {}, 'Bulunan parçalar') : null,
      gear.length ? h('ul', { class: 'list' }, ...gear) : null,
      data.completedQuests.length ? h('p', { class: 'muted' }, `${data.completedQuests.length} görev tamamlandı`) : null),
    h('div', { class: 'screen-actions' },
      h('button', { class: 'primary', 'data-again': '', onclick: () => opts.onAgain() }, theme.ui.again),
      h('button', { class: 'ghost', 'data-camp': '', onclick: () => opts.onCamp() }, theme.ui.camp))));
}
