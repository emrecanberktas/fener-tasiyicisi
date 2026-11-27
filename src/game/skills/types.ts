import type Phaser from 'phaser';
import type { PlayerStats } from '../../data/types';

export interface EnemyRef { id: number; x: number; y: number }

export interface SkillContext {
  player: { x: number; y: number };
  level: number;
  stats: PlayerStats;
  enemiesNear(x: number, y: number, r: number): EnemyRef[];
  nearestEnemy(x: number, y: number, maxR: number): EnemyRef | null;
  damage(e: EnemyRef, amount: number): void;
  scene: Phaser.Scene;
}

export interface SkillBehavior {
  update(dtSec: number, ctx: SkillContext): void;
  destroy(): void;
}
