import type Phaser from 'phaser';
import { ENEMY_SPRITES, SPRITES } from '../art/grids';
import { bossGrid, groundTile, vignetteGrid } from '../art/procedural';
import { dashedRing, ditherDisc, gridToCanvas, type Grid } from '../art/render';

/** Ekranda bir sprite pikselinin kaç CSS pikseli olduğu. */
export const PIXEL = 3;
export const LIGHT_SIZE = 64;
export const GLOW_SIZE = 24;

export const TEX = {
  player: 'player', spark: 'spark', bolt: 'bolt', flame: 'flame', spear: 'spear',
  light: 'light', ring: 'ring', glow: 'glow', mistGlow: 'mistGlow', ground: 'ground', boss: 'mistHeart', puff: 'puff',
} as const;

const add = (scene: Phaser.Scene, key: string, g: Grid) => {
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, gridToCanvas(g));
};

export function makeTextures(scene: Phaser.Scene): void {
  for (const [k, g] of Object.entries(SPRITES)) add(scene, k, g);
  for (const [k, g] of Object.entries(ENEMY_SPRITES)) add(scene, k, g);
  add(scene, TEX.boss, bossGrid());
  add(scene, TEX.light, ditherDisc(LIGHT_SIZE, 'E', 0.15));
  add(scene, TEX.ring, dashedRing(LIGHT_SIZE, 'Y'));
  add(scene, TEX.glow, ditherDisc(GLOW_SIZE, 'E', 0.35, 'Y', 0.2));
  add(scene, TEX.mistGlow, ditherDisc(GLOW_SIZE, 'C', 0.35));
  add(scene, TEX.ground, groundTile());
  add(scene, TEX.puff, ditherDisc(12, 'F', 0.25));
}

/** Ekran boyutuna göre sis çerçevesi dokusu (her boyut için bir kez). */
export function vignetteTexture(scene: Phaser.Scene, width: number, height: number): string {
  const w = Math.ceil(width / PIXEL), h = Math.ceil(height / PIXEL);
  const key = `vignette-${w}x${h}`;
  add(scene, key, vignetteGrid(w, h));
  return key;
}
