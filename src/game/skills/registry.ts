import type Phaser from 'phaser';
import type { SkillId } from '../../data/types';
import { createLightRing } from './lightRing';
import type { SkillBehavior } from './types';

type Factory = (scene: Phaser.Scene) => SkillBehavior;

const FACTORIES: Partial<Record<SkillId, Factory>> = {
  lightRing: createLightRing,
};

/** Pasif yetenekler ve henüz davranışı olmayanlar için null. */
export function createSkillBehavior(id: SkillId, scene: Phaser.Scene): SkillBehavior | null {
  return FACTORIES[id]?.(scene) ?? null;
}
