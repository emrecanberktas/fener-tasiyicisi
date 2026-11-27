import { theme } from '../../theme';
import { h, mount } from '../dom';

export function showPausePanel(root: HTMLElement, opts: { onContinue(): void; onEnd(): void }): () => void {
  return mount(root, h('div', { class: 'overlay modal' },
    h('div', { class: 'sheet px' },
      h('h2', {}, 'Duraklatıldı'),
      h('p', {}, 'Turu bitirirsen o ana kadar topladıkların seninle kalır.'),
      h('button', { class: 'btn-main', 'data-continue': '', onclick: () => opts.onContinue() }, theme.ui.continue),
      h('button', { class: 'btn-quiet', 'data-end': '', onclick: () => opts.onEnd() }, theme.ui.endRun))));
}
