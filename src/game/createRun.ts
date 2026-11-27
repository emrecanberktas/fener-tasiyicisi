import Phaser from 'phaser';
import type { LevelUpChoice } from '../core/run/runState';
import { RunScene, type RunOptions } from './RunScene';

export type { HudState, RunOptions } from './RunScene';

export interface RunHandle {
  pause(): void;
  resume(): void;
  chooseLevelUp(c: LevelUpChoice): void;
  reroll(): void;
  forfeit(): void;
  destroy(): void;
}

export function startRun(container: HTMLElement, opts: RunOptions): RunHandle {
  const scene = new RunScene(opts);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: container.clientWidth || 390,
    height: container.clientHeight || 844,
    backgroundColor: '#000000',
    scale: { mode: Phaser.Scale.RESIZE },
    input: { activePointers: 1 },
    render: { antialias: true, powerPreference: 'high-performance' },
    scene,
  });
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      scene.pauseRun();
      opts.onAutosave(scene.getState());
    }
  };
  document.addEventListener('visibilitychange', onVisibility);
  return {
    pause: () => scene.pauseRun(),
    resume: () => scene.resumeRun(),
    chooseLevelUp: c => scene.chooseLevelUp(c),
    reroll: () => scene.reroll(),
    forfeit: () => scene.forfeit(),
    destroy: () => {
      document.removeEventListener('visibilitychange', onVisibility);
      game.destroy(true);
    },
  };
}
