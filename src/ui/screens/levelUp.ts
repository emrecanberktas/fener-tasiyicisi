import type { LevelUpChoice, RunState } from '../../core/run/runState';
import { SKILLS } from '../../data/skills';
import { theme } from '../../theme';
import { h, mount } from '../dom';
import { icon } from '../icons';

/** Seviye noktaları: dolu olanlar mevcut seviye, yanıp sönen bu seçimle gelecek olan. */
function pips(current: number, next: number, max = 5): HTMLElement {
  return h('span', { class: 'pips', 'aria-label': `Seviye ${next} / ${max}` },
    ...Array.from({ length: max }, (_, i) => h('span', { class: `pip${i < current ? ' on' : i < next ? ' new' : ''}` })));
}

export function showLevelUp(
  root: HTMLElement, choices: LevelUpChoice[], state: RunState,
  opts: { rerollsLeft: number; onChoose(c: LevelUpChoice): void; onReroll(): void },
): () => void {
  const card = (c: LevelUpChoice) => {
    if (c.type === 'fallback') {
      return h('button', { class: 'card px', 'data-choice': '', onclick: () => opts.onChoose(c) },
        h('span', { class: 'slot-box' }, icon(c.kind === 'heal' ? 'wick' : 'kor', 4)),
        h('span', { class: 'card-title' }, c.kind === 'heal' ? theme.ui.heal! : theme.ui.bonusKor!),
        h('span', { class: 'card-desc' }, c.kind === 'heal' ? 'Canının bir kısmını geri al.' : 'Tur sonunda fazladan Kor.'));
    }
    const def = SKILLS[c.skillId];
    const current = c.newLevel - 1;
    return h('button', { class: `card px ${def.kind}`, 'data-choice': '', onclick: () => opts.onChoose(c) },
      h('span', { class: 'slot-box' }, icon(c.skillId, 4)),
      h('span', { class: 'card-title' }, theme.skills[c.skillId].name),
      h('span', { class: 'pips-row' }, (() => {
        const p = pips(current, c.newLevel);
        p.append(h('span', { class: 'tag' }, current === 0 ? (def.kind === 'passive' ? 'yeni pasif' : 'yeni') : (def.kind === 'passive' ? 'pasif' : '')));
        return p;
      })()),
      h('span', { class: 'card-desc' }, theme.skills[c.skillId].desc(c.newLevel)));
  };
  const el = h('div', { class: 'overlay levelup' },
    h('div', { class: 'levelup-head' }, h('h2', {}, `Seviye ${state.level}`), h('p', {}, 'Fenerine bir güç ekle.')),
    h('div', { class: 'cards' }, ...choices.map(card)),
    opts.rerollsLeft > 0 ? h('button', { class: 'btn-quiet', 'data-reroll': '', onclick: () => opts.onReroll() }, `${theme.ui.reroll} (${opts.rerollsLeft})`) : null);
  return mount(root, el);
}
