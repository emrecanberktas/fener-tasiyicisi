import type { ScreenRenderer } from '../../app/router';
import { canUnlockNode, unlockNode } from '../../core/progression/tree';
import { TREE } from '../../data/tree';
import { theme } from '../../theme';
import { h } from '../dom';
import { icon } from '../icons';
import { fmtNodeEffect } from '../format';
import { reactive, subScreen } from '../layout';

export const renderTree: ScreenRenderer = (root, ctx, params) => {
  const highlight = (params as { highlight?: string } | undefined)?.highlight;
  return reactive(root, fn => ctx.store.subscribe(fn), () => {
    const s = ctx.store.get();
    const unlocked = new Set(s.tree.unlocked);
    const rows = TREE.map(n => {
      const state = unlocked.has(n.id) ? 'unlocked' : canUnlockNode(s, n.id) ? 'available' : 'locked';
      return h('li', {},
        h('button', {
          class: `node px ${state}${n.id === highlight ? ' hl' : ''}${n.effect.type === 'rule' ? ' rule' : ''}`,
          'data-node': n.id, 'data-state': state, disabled: state !== 'available',
          onclick: () => void ctx.store.update(sv => (canUnlockNode(sv, n.id) ? unlockNode(sv, n.id) : sv)),
        },
          h('span', { class: 'node-name' }, theme.treeNodes[n.id] ?? n.id),
          h('span', { class: 'small' }, fmtNodeEffect(n)),
          h('span', { class: 'node-cost' }, ...(state === 'unlocked' ? ['Açık'] : [icon('kor', 2), String(n.cost)]))));
    });
    const kor = h('span', {}, icon('kor', 2), `${s.kor} Kor`);
    return subScreen('Ağaç', [h('ul', { class: 'list tree' }, ...rows)], [], () => ctx.go('camp'), kor);
  });
};
