import type { LevelUpChoice, RunState } from '../../core/run/runState';
import { SKILLS } from '../../data/skills';
import { theme } from '../../theme';
import { h, mount } from '../dom';

export function showLevelUp(
  root: HTMLElement, choices: LevelUpChoice[], state: RunState,
  opts: { rerollsLeft: number; onChoose(c: LevelUpChoice): void; onReroll(): void },
): () => void {
  const card = (c: LevelUpChoice) => {
    if (c.type === 'fallback') {
      const label = c.kind === 'heal' ? theme.ui.heal! : theme.ui.bonusKor!;
      return h('button', { class: 'card', 'data-choice': '', onclick: () => opts.onChoose(c) },
        h('span', { class: 'card-title' }, label));
    }
    const owned = (state.skills[c.skillId] ?? 0) > 0;
    const kind = SKILLS[c.skillId].kind === 'active' ? 'Aktif' : 'Pasif';
    return h('button', { class: `card ${SKILLS[c.skillId].kind}`, 'data-choice': '', onclick: () => opts.onChoose(c) },
      h('span', { class: 'card-tag' }, owned ? `${kind} · Sv ${c.newLevel}` : `${kind} · Yeni · Sv ${c.newLevel}`),
      h('span', { class: 'card-title' }, theme.skills[c.skillId].name),
      h('span', { class: 'card-desc' }, theme.skills[c.skillId].desc(c.newLevel)));
  };
  const el = h('div', { class: 'overlay levelup' },
    h('div', { class: 'levelup-head' }, h('span', { class: 'eyebrow' }, `Seviye ${state.level}`), h('span', {}, 'Bir güç seç')),
    h('div', { class: 'cards' }, ...choices.map(card)),
    opts.rerollsLeft > 0 ? h('button', { class: 'ghost', 'data-reroll': '', onclick: () => opts.onReroll() }, `${theme.ui.reroll} (${opts.rerollsLeft})`) : null);
  return mount(root, el);
}
