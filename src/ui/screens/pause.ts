import { theme } from '../../theme';
import { h, mount } from '../dom';

export function showPausePanel(root: HTMLElement, opts: { onContinue(): void; onEnd(): void }): () => void {
  return mount(root, h('div', { class: 'overlay modal' },
    h('div', { class: 'sheet' },
      h('h2', {}, 'Duraklatıldı'),
      h('button', { class: 'primary', 'data-continue': '', onclick: () => opts.onContinue() }, theme.ui.continue),
      h('button', { class: 'ghost', 'data-end': '', onclick: () => opts.onEnd() }, theme.ui.endRun))));
}
