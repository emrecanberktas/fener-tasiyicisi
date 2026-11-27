import type { ScreenRenderer } from '../../app/router';
import { h } from '../dom';
import { fmtQuest } from '../format';
import { reactive, subScreen } from '../layout';

export const renderQuests: ScreenRenderer = (root, ctx) =>
  reactive(root, fn => ctx.store.subscribe(fn), () => {
    const rows = ctx.store.get().quests.active.map(q => {
      const f = fmtQuest(q);
      return h('li', { class: 'quest', 'data-quest': q.id },
        h('div', { class: 'quest-row' }, h('span', {}, f.text), h('span', { class: 'muted small' }, f.reward)),
        h('div', { class: 'bar thin' }, h('div', { class: 'bar-fill xp', style: { width: `${f.ratio * 100}%` } })));
    });
    return subScreen('Görevler', [
      h('p', { class: 'muted small' }, 'Görevler oynarken kendiliğinden ilerler. Biten görevin ödülü hemen verilir, yerine yenisi gelir.'),
      h('ul', { class: 'list' }, ...rows),
    ], [], () => ctx.go('camp'));
  });
