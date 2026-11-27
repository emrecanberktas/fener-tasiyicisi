import { theme } from '../../theme';
import { h, mount } from '../dom';

export function showResumePrompt(root: HTMLElement, opts: { onResume(): void; onAbandon(): void }): () => void {
  let close = () => {};
  close = mount(root, h('div', { class: 'overlay modal' },
    h('div', { class: 'sheet px' },
      h('h2', {}, 'Yarım kalan bir turun var'),
      h('p', {}, 'Sis seni bekliyor. İstersen turu burada bitirip topladıklarını alabilirsin.'),
      h('button', { class: 'btn-main', 'data-resume': '', onclick: () => { close(); opts.onResume(); } }, theme.ui.resume),
      h('button', { class: 'btn-quiet', 'data-abandon': '', onclick: () => { close(); opts.onAbandon(); } }, theme.ui.abandon))));
  return close;
}
