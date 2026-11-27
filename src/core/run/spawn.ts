import { ENEMIES } from '../../data/enemies';
import { zoneMult } from '../../data/zones';
import type { EnemyDef, EnemyId } from '../../data/types';
import type { Rng } from '../rng';

export const MAX_ALIVE = 300;
export const BOSS_AT_SEC = 480;

export const spawnRatePerSec = (elapsedSec: number, zoneIndex: number): number =>
  (1 + elapsedSec / 40) * zoneMult(zoneIndex);

const REGULAR: EnemyDef[] = Object.values(ENEMIES).filter(e => !e.isBoss);

export function pickEnemyType(rng: Rng, elapsedSec: number): EnemyId {
  const weights = REGULAR.map(e => (e.appearsAfterSec <= elapsedSec ? e.spawnWeight : 0));
  return REGULAR[rng.weightedIndex(weights)]!.id;
}
