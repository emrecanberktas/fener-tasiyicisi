import { createRng } from '../core/rng';
import type { RunResult } from '../core/run/rewards';
import type { ScreenCtx } from './router';
import { finishRun, resultFromState, type FinishedRun } from './runFlow';

export const newId = (): string => (globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`);

/** Turu sonlandırır, kaydı günceller ve tur sonu ekranına geçer. */
export async function completeRun(ctx: ScreenCtx, result: RunResult): Promise<FinishedRun> {
  let finished!: FinishedRun;
  await ctx.store.update(s => {
    finished = finishRun(s, result, createRng(ctx.now() >>> 0), newId);
    return finished.save;
  });
  ctx.go('runEnd', { result, finished });
  return finished;
}

/** Devam istemindeki "Turu bırak": yarım turu ölüm gibi bitirir. */
export async function abandonActiveRun(ctx: ScreenCtx): Promise<void> {
  const run = ctx.store.get().activeRun;
  if (!run) return;
  await completeRun(ctx, resultFromState(run));
}

