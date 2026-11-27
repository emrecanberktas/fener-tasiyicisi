import Phaser from 'phaser';
import { GLOW_SIZE, TEX } from '../textures';

/** Kısa ömürlü ışık parlaması (havuzsuz; düşük frekanslı efektler için). */
export function flash(scene: Phaser.Scene, x: number, y: number, radius: number, color: number, durationMs = 250, grow = 1): void {
  const img = scene.add.image(x, y, TEX.glow).setTint(color).setBlendMode(Phaser.BlendModes.ADD).setDepth(6)
    .setScale((radius * 2.2) / GLOW_SIZE / grow).setAlpha(0.9);
  scene.tweens.add({ targets: img, alpha: 0, scale: (radius * 2.2) / GLOW_SIZE, duration: durationMs, onComplete: () => img.destroy() });
}
