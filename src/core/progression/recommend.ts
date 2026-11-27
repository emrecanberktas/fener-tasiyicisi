import type { SaveData } from '../save/schema';
import { bestUpgradeFor } from './gear';
import { cheapestUnlockable } from './tree';

export type Recommendation =
  | { kind: 'betterGear'; itemId: string }
  | { kind: 'unlockNode'; nodeId: string }
  | { kind: 'newZone'; zoneIndex: number };

export function getRecommendation(save: SaveData): Recommendation | null {
  const gear = bestUpgradeFor(save);
  if (gear) return { kind: 'betterGear', itemId: gear.id };
  const node = cheapestUnlockable(save);
  if (node) return { kind: 'unlockNode', nodeId: node.id };
  const z = save.zones.unlockedIndex;
  if (z > 0 && !save.zones.bossesDefeated.includes(z)) return { kind: 'newZone', zoneIndex: z };
  return null;
}
