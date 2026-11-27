import { theme } from '../theme';
import { h } from './dom';

/** Alt ekran iskeleti: başlık (+ sağda sayaç), kaydırılabilir gövde, başparmak bölgesinde eylemler. */
export function subScreen(title: string, body: (Node | null)[], actions: (Node | null)[], onBack: () => void, count?: Node | string): HTMLElement {
  return h('div', { class: 'screen' },
    h('header', { class: 'screen-head' }, h('h1', {}, title), count ? (typeof count === 'string' ? h('span', { class: 'count' }, count) : Object.assign(count as HTMLElement, { className: 'count' })) : null),
    h('div', { class: 'screen-body' }, ...body),
    h('div', { class: 'screen-actions' }, ...actions,
      h('button', { class: 'btn-quiet', 'data-back': '', onclick: onBack }, theme.ui.camp)));
}

/** Store değiştikçe yeniden çizen ekran yardımcısı. */
export function reactive(root: HTMLElement, subscribe: (fn: () => void) => () => void, draw: () => HTMLElement): () => void {
  let el = draw();
  root.append(el);
  const unsub = subscribe(() => {
    const next = draw();
    el.replaceWith(next);
    el = next;
  });
  return () => { unsub(); el.remove(); };
}
