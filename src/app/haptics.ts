export type HapticEvent = 'hurt' | 'levelUp' | 'death';

const PATTERNS: Record<HapticEvent, number[]> = {
  hurt: [18],
  levelUp: [12, 40, 12],
  death: [60, 40, 120],
};

export const hapticPattern = (e: HapticEvent): number[] => PATTERNS[e];

/** Ayar açıksa ve cihaz destekliyorsa kısa bir titreşim. iOS Safari desteklemez; sessizce geçer. */
export function vibrate(e: HapticEvent, enabled: boolean): void {
  if (!enabled || typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try { navigator.vibrate(PATTERNS[e]); } catch { /* yok say */ }
}
