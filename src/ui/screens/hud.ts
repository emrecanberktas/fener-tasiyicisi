import type { HudState } from '../../game/createRun';
import { theme } from '../../theme';
import { h } from '../dom';

export const formatTime = (sec: number): string => {
  const s = Math.floor(Math.max(0, sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export function createHud(root: HTMLElement, opts: { onPause(): void }): { update(hs: HudState): void; destroy(): void } {
  const time = h('span', { class: 'hud-time' }, '00:00');
  const level = h('span', { class: 'hud-level' }, 'Seviye 1');
  const xpFill = h('div', { class: 'bar-fill xp' });
  const hpFill = h('div', { class: 'bar-fill hp' });
  const bossFill = h('div', { class: 'bar-fill boss' });
  const boss = h('div', { class: 'bar boss-bar', 'data-boss': '', hidden: true }, bossFill);
  const top = h('div', { class: 'hud' }, level, time,
    h('div', { class: 'bar' }, xpFill),
    h('div', { class: 'bar hp-bar' }, hpFill),
    boss);
  const pause = h('button', { class: 'pause-btn px', 'data-pause': '', 'aria-label': theme.ui.pause, onclick: () => opts.onPause() });
  root.append(top, pause);
  return {
    update(s) {
      time.textContent = formatTime(s.elapsedSec);
      level.textContent = `Seviye ${s.level}`;
      xpFill.style.width = `${(s.xpRatio * 100).toFixed(1)}%`;
      hpFill.style.width = `${(s.hpRatio * 100).toFixed(1)}%`;
      boss.hidden = s.bossHpRatio === null;
      if (s.bossHpRatio !== null) bossFill.style.width = `${(s.bossHpRatio * 100).toFixed(1)}%`;
    },
    destroy() { top.remove(); pause.remove(); },
  };
}
