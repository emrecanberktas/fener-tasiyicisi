import type { EnemyId, GearSlot, SkillId, StatKey } from '../data/types';

export interface Theme {
  name: string;
  skills: Record<SkillId, { name: string; desc: (level: number) => string }>;
  enemies: Record<EnemyId, { name: string; color: number; radius: number }>;
  zones: Record<0 | 1 | 2, { name: string; bg: number; fog: number; groundTint: number }>;
  slots: Record<GearSlot, string>;
  rarities: [string, string, string, string];
  rarityColors: [number, number, number, number];
  stats: Record<StatKey, string>;
  treeNodes: Record<string, string>;
  ui: Record<string, string>;
  player: { color: number; light: number };
}
