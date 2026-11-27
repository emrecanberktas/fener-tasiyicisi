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
  const hud = createHud(root, {
    onPause: () => {
      run?.pause();
      closeOverlay();
      closeOverlay = showPausePanel(root, {
        onContinue: () => { closeOverlay(); run?.resume(); },
        onEnd: () => { closeOverlay(); run?.forfeit(); },
      });
    },
  });
  run = startRun(gameEl, {
    state, stats, unlocked,
    statsFor: s => runStats(stats, s.skills),
    onHud: hs => hud.update(hs),
    onLevelUp: (choices, cur) => {
      closeOverlay();
      closeOverlay = showLevelUp(root, choices, cur, {
        rerollsLeft: cur.rerollsLeft,
        onChoose: c => { closeOverlay(); closeOverlay = () => {}; run?.chooseLevelUp(c); },
        onReroll: () => run?.reroll(),
      });
    },
    onAutosave: s => { if (!ended) void ctx.store.update(sv => ({ ...sv, activeRun: s })); },
    onEnd: result => {
      ended = true;
      void completeRun(ctx, result);
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
