import type { ScreenRenderer } from '../../app/router';
import { h } from '../dom';
import { icon } from '../icons';
import { fmtQuest } from '../format';
import { reactive, subScreen } from '../layout';

export const renderQuests: ScreenRenderer = (root, ctx) =>
  reactive(root, fn => ctx.store.subscribe(fn), () => {
    const rows = ctx.store.get().quests.active.map(q => {
      const f = fmtQuest(q);
      return h('li', { class: 'quest px', 'data-quest': q.id },
        h('div', { class: 'quest-row' }, h('span', {}, f.text), h('span', { class: 'reward' }, icon('kor' in q.reward ? 'kor' : 'lantern', 2), f.reward)),
        h('div', { class: 'bar' }, h('div', { class: 'bar-fill xp', style: { width: `${f.ratio * 100}%` } })));
    });
    return subScreen('Görevler', [
      h('p', { class: 'muted' }, 'Oynadıkça kendiliğinden ilerler. Biten görevin ödülü hemen verilir ve yerine yenisi gelir.'),
      h('ul', { class: 'list' }, ...rows),
    ], [], () => ctx.go('camp'));
  });
