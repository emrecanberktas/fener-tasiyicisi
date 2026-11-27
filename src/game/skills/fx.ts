import Phaser from 'phaser';
import { GLOW_SIZE, PIXEL, TEX } from '../textures';

/** Kısa ömürlü dither'lı parlama: büyüyerek söner. */
export function flash(scene: Phaser.Scene, x: number, y: number, radius: number, _color: number, durationMs = 250, grow = 1, tex: string = TEX.glow): void {
  const end = (radius * 2) / GLOW_SIZE;
  const img = scene.add.image(x, y, tex).setBlendMode(Phaser.BlendModes.ADD).setDepth(6).setScale(end / grow).setAlpha(0.95);
  scene.tweens.add({ targets: img, alpha: 0, scale: end, duration: durationMs, ease: 'Stepped', easeParams: [4], onComplete: () => img.destroy() });
}

export { PIXEL };
