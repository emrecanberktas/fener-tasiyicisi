export type SkillId =
  | 'lightRing' | 'sparkRain' | 'chainLightning' | 'orbitFlames' | 'lightSpear' | 'flare'
  | 'wideLight' | 'intenseFlame' | 'lightStep' | 'attraction' | 'wick' | 'amber';

export interface SkillDef {
  id: SkillId;
  kind: 'active' | 'passive';
  maxLevel: 5;
  unlockAccountLevel: number;
  base: Record<string, number>;
  perLevel: Record<string, number>;
}

export type EnemyId = 'mistBug' | 'shadowWolf' | 'mistGiant' | 'mistSpirit' | 'mistHeart';

export interface EnemyDef {
  id: EnemyId;
  hp: number;
  speed: number;
  contactDamage: number;
  xpValue: number;
  isBoss: boolean;
  appearsAfterSec: number;
  spawnWeight: number;
  ranged?: { range: number; projectileDamage: number; cooldownSec: number };
}

export interface ZoneDef { index: 0 | 1 | 2; mult: number }

export type GearSlot = 'hazne' | 'cam' | 'fitil';
export type Rarity = 0 | 1 | 2 | 3;
export type StatKey = 'damagePct' | 'areaPct' | 'moveSpeedPct' | 'maxHp' | 'regen' | 'xpGainPct' | 'pickupRangePct';

export interface GearItem {
  id: string;
  slot: GearSlot;
  rarity: Rarity;
  stats: Partial<Record<StatKey, number>>;
}

export type RuleId = 'startWithTwoSkills' | 'fourChoices' | 'oneReroll';

export interface TreeNodeDef {
  id: string;
  cost: number;
  requires: string[];
  effect: { type: 'stat'; stat: StatKey; value: number } | { type: 'rule'; rule: RuleId };
}

export type QuestTemplate =
  | { kind: 'kills'; target: number }
  | { kind: 'reachMinute'; minute: number }
  | { kind: 'skillLevel'; skillId: SkillId; level: number }
  | { kind: 'bossDefeated'; zoneIndex: number };

export interface PlayerStats {
  maxHp: number;
  regen: number;
  damageMult: number;
  areaMult: number;
  moveSpeedMult: number;
  xpGainMult: number;
  pickupRangeMult: number;
  rules: RuleId[];
}
