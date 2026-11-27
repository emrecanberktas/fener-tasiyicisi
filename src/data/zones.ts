import type { ZoneDef } from './types';

export const ZONES: readonly ZoneDef[] = [
  { index: 0, mult: 1 },
  { index: 1, mult: 1.8 },
  { index: 2, mult: 3 },
];

export const zoneMult = (zoneIndex: number): number => ZONES[zoneIndex]?.mult ?? 1;
