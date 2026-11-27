import Phaser from 'phaser';
import { skillParam } from '../../data/skills';
import { LIGHT_SIZE, TEX } from '../textures';
import type { SkillBehavior, SkillContext } from './types';

export function createLightRing(scene: Phaser.Scene): SkillBehavior {
  const disc = scene.add.image(0, 0, TEX.light).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.28).setDepth(1);
  const ring = scene.add.image(0, 0, TEX.ring).setAlpha(0.55).setDepth(1);
  let t = 0;
  return {
    update(dt: number, ctx: SkillContext) {
      t += dt;
      const radius = skillParam('lightRing', 'radius', ctx.level) * ctx.stats.areaMult;
      const dps = skillParam('lightRing', 'dps', ctx.level) * ctx.stats.damageMult;
      const s = (radius * 2) / LIGHT_SIZE;
      disc.setPosition(ctx.player.x, ctx.player.y).setScale(s * 1.25);
      ring.setPosition(ctx.player.x, ctx.player.y).setScale(s).setRotation(Math.floor(t * 4) * 0.08);
      for (const e of ctx.enemiesNear(ctx.player.x, ctx.player.y, radius)) ctx.damage(e, dps * dt);
    },
    destroy() { disc.destroy(); ring.destroy(); },
  };
}
