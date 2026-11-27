import { theme } from '../../theme';
import { h, mount } from '../dom';

export function showResumePrompt(root: HTMLElement, opts: { onResume(): void; onAbandon(): void }): () => void {
  let close = () => {};
  close = mount(root, h('div', { class: 'overlay modal' },
    h('div', { class: 'sheet' },
      h('h2', {}, 'Yarım kalan bir turun var'),
      h('p', { class: 'muted' }, 'Kaldığın yerden devam edebilir ya da turu bitirip ödüllerini alabilirsin.'),
      h('button', { class: 'primary', 'data-resume': '', onclick: () => { close(); opts.onResume(); } }, theme.ui.resume),
      h('button', { class: 'ghost', 'data-abandon': '', onclick: () => { close(); opts.onAbandon(); } }, theme.ui.abandon))));
  return close;
}
