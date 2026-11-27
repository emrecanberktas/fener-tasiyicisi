import { unlockedSkills } from '../core/progression/account';
import { computePlayerStats, runStats } from '../core/progression/stats';
import type { RunResult } from '../core/run/rewards';
import { createRunState, type RunState } from '../core/run/runState';
import { startRun, type RunHandle } from '../game/createRun';
import { h } from '../ui/dom';
import { createHud } from '../ui/screens/hud';
import { showLevelUp } from '../ui/screens/levelUp';
import { showPausePanel } from '../ui/screens/pause';
import { showRunEnd } from '../ui/screens/runEnd';
import type { FinishedRun } from './runFlow';
import { vibrate } from './haptics';
import { completeRun } from './actions';
export { abandonActiveRun, completeRun, newId } from './actions';
import type { Store } from './store';

export type Screen = 'camp' | 'gear' | 'tree' | 'quests' | 'settings' | 'run' | 'runEnd';

export interface ScreenCtx {
  store: Store;
  go: (screen: Screen, params?: unknown) => void;
  now: () => number;
}

export type ScreenRenderer = (root: HTMLElement, ctx: ScreenCtx, params?: unknown) => () => void;

export const renderRun: ScreenRenderer = (root, ctx, params) => {
  const p = (params ?? {}) as { zoneIndex?: number; resume?: boolean };
  const save = ctx.store.get();
  const stats = computePlayerStats(save);
  const unlocked = unlockedSkills(save);
  const state: RunState = p.resume && save.activeRun
    ? save.activeRun
    : createRunState(ctx.now() >>> 0, Math.min(p.zoneIndex ?? save.zones.unlockedIndex, save.zones.unlockedIndex), stats, unlocked);
  void ctx.store.update(s => ({ ...s, activeRun: state }));

  const gameEl = h('div', { class: 'game' });
  root.append(gameEl);
  let run: RunHandle | null = null;
  let closeOverlay = () => {};
  let ended = false;
  let levelUpOpen = false;
  let pauseOpen = false;
  const openPause = () => {
    if (pauseOpen || ended) return;
    run?.pause();
    closeOverlay();
    pauseOpen = true;
    const close = showPausePanel(root, {
      onContinue: () => { close(); pauseOpen = false; closeOverlay = () => {}; run?.resume(); },
      onEnd: () => { close(); pauseOpen = false; closeOverlay = () => {}; run?.forfeit(); },
    });
    closeOverlay = () => { close(); pauseOpen = false; };
  };
  const hud = createHud(root, { onPause: openPause });
  run = startRun(gameEl, {
    state, stats, unlocked,
    statsFor: s => runStats(stats, s.skills),
    perf: new URLSearchParams(location.search).get('perf') === '1',
    onHud: hs => hud.update(hs),
    onLevelUp: (choices, cur) => {
      closeOverlay();
      levelUpOpen = true;
      const close = showLevelUp(root, choices, cur, {
        rerollsLeft: cur.rerollsLeft,
        onChoose: c => { closeOverlay(); closeOverlay = () => {}; run?.chooseLevelUp(c); },
        onReroll: () => run?.reroll(),
      });
      closeOverlay = () => { close(); levelUpOpen = false; };
    },
    onAutosave: s => { if (!ended) void ctx.store.update(sv => ({ ...sv, activeRun: s })); },
    // Arka plandan dönüşte tur donmuş görünmesin: duraklatma paneli açık beklesin.
    // Seviye kartı açıksa o zaten bekliyor; onu kapatmıyoruz.
    onBackground: () => { if (!levelUpOpen) openPause(); },
    onHaptic: e => vibrate(e, ctx.store.get().settings.vibration),
    onEnd: result => {
      ended = true;
      // Phaser güncelleme döngüsünün içinden çağrılabilir; oyunu bu karede yok etmemek için ertele.
      setTimeout(() => void completeRun(ctx, result), 0);
    },
  });
  return () => {
    closeOverlay();
    hud.destroy();
    run?.destroy();
    gameEl.remove();
  };
};

export const renderRunEnd: ScreenRenderer = (root, ctx, params) => {
  const { result, finished } = params as { result: RunResult; finished: FinishedRun };
  return showRunEnd(root, { result, rewards: finished.rewards, completedQuests: finished.completedQuests }, {
    onCamp: () => ctx.go('camp'),
    onAgain: () => ctx.go('run', { zoneIndex: result.zoneIndex }),
  });
};

export function createRouter(root: HTMLElement, store: Store, screens: Partial<Record<Screen, ScreenRenderer>>, now: () => number = Date.now): { go(screen: Screen, params?: unknown): void } {
  let cleanup = () => {};
  const all: Partial<Record<Screen, ScreenRenderer>> = { run: renderRun, runEnd: renderRunEnd, ...screens };
  const ctx: ScreenCtx = {
    store,
    now,
    go(screen, params) {
      cleanup();
      root.replaceChildren();
      const render = all[screen];
      cleanup = render ? render(root, ctx, params) : () => {};
    },
  };
  return { go: ctx.go };
}
