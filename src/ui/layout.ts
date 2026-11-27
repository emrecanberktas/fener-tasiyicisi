import { h } from './dom';

/** Alt ekran iskeleti: başlık, kaydırılabilir gövde, başparmak bölgesinde eylemler + geri. */
export function subScreen(title: string, body: (Node | null)[], actions: (Node | null)[], onBack: () => void): HTMLElement {
  return h('div', { class: 'screen' },
    h('header', { class: 'screen-head' }, h('h1', {}, title)),
    h('div', { class: 'screen-body' }, ...body),
    h('div', { class: 'screen-actions' }, ...actions,
      h('button', { class: 'ghost', 'data-back': '', onclick: onBack }, '← Kamp')));
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
