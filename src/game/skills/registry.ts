import type Phaser from 'phaser';
import type { SkillId } from '../../data/types';
import { createChainLightning } from './chainLightning';
import { createFlare } from './flare';
import { createLightRing } from './lightRing';
import { createLightSpear } from './lightSpear';
import { createOrbitFlames } from './orbitFlames';
import { createSparkRain } from './sparkRain';
import type { SkillBehavior } from './types';

type Factory = (scene: Phaser.Scene) => SkillBehavior;

const FACTORIES: Partial<Record<SkillId, Factory>> = {
  lightRing: createLightRing,
  sparkRain: createSparkRain,
  chainLightning: createChainLightning,
  orbitFlames: createOrbitFlames,
  lightSpear: createLightSpear,
  flare: createFlare,
};

/** Pasif yetenekler için null: etkileri runStats ile istatistiklere yansır. */
export function createSkillBehavior(id: SkillId, scene: Phaser.Scene): SkillBehavior | null {
  return FACTORIES[id]?.(scene) ?? null;
}
