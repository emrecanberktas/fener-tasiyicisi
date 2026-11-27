import type Phaser from 'phaser';

export const TEX = { glow: 'glow', circle: 'circle', spark: 'spark' } as const;
export const GLOW_SIZE = 128;
export const CIRCLE_SIZE = 32;

/** Tüm dokular prosedürel: parlayan daire, düz daire, kıvılcım. */
export function makeTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEX.glow)) return;
  const g = scene.add.graphics();
  const steps = 24;
  for (let i = 0; i < steps; i++) {
    g.fillStyle(0xffffff, 0.06);
    g.fillCircle(GLOW_SIZE / 2, GLOW_SIZE / 2, (GLOW_SIZE / 2) * (1 - i / steps));
  }
  g.generateTexture(TEX.glow, GLOW_SIZE, GLOW_SIZE);
  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(CIRCLE_SIZE / 2, CIRCLE_SIZE / 2, CIRCLE_SIZE / 2);
  g.generateTexture(TEX.circle, CIRCLE_SIZE, CIRCLE_SIZE);
  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(6, 6, 6);
  g.generateTexture(TEX.spark, 12, 12);
  g.destroy();
}
