import type { SaveData } from './save/schema';

export const IDLE_CAP_MS = 48 * 3600 * 1000;
export const IDLE_FULL_MULT = 3.5;

const elapsed = (save: SaveData, now: number): number =>
  Math.min(Math.max(now - save.idle.lastCollectedAt, 0), IDLE_CAP_MS);

export function computeIdleKor(save: SaveData, now: number): number {
  return Math.floor((save.bestRunKor * IDLE_FULL_MULT * elapsed(save, now)) / IDLE_CAP_MS);
}

export function idleFillRatio(save: SaveData, now: number): number {
  return elapsed(save, now) / IDLE_CAP_MS;
}

export function collectIdle(save: SaveData, now: number): SaveData {
  return { ...save, kor: save.kor + computeIdleKor(save, now), idle: { lastCollectedAt: now } };
}
