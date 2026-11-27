import type { EnemyDef, EnemyId } from './types';

export const ENEMIES: Record<EnemyId, EnemyDef> = {
  mistBug: { id: 'mistBug', hp: 10, speed: 40, contactDamage: 5, xpValue: 1, isBoss: false, appearsAfterSec: 0, spawnWeight: 10 },
  shadowWolf: { id: 'shadowWolf', hp: 6, speed: 110, contactDamage: 4, xpValue: 1, isBoss: false, appearsAfterSec: 60, spawnWeight: 4 },
  mistGiant: { id: 'mistGiant', hp: 80, speed: 25, contactDamage: 15, xpValue: 5, isBoss: false, appearsAfterSec: 150, spawnWeight: 2 },
  mistSpirit: {
    id: 'mistSpirit', hp: 15, speed: 35, contactDamage: 3, xpValue: 2, isBoss: false, appearsAfterSec: 240, spawnWeight: 2,
    ranged: { range: 220, projectileDamage: 6, cooldownSec: 2 },
  },
  mistHeart: { id: 'mistHeart', hp: 3000, speed: 30, contactDamage: 25, xpValue: 0, isBoss: true, appearsAfterSec: 480, spawnWeight: 0 },
};
