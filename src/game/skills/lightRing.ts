import Phaser from 'phaser';
import { skillParam } from '../../data/skills';
import { theme } from '../../theme';
import { GLOW_SIZE, TEX } from '../textures';
import type { SkillBehavior, SkillContext } from './types';

export function createLightRing(scene: Phaser.Scene): SkillBehavior {
  const img = scene.add.image(0, 0, TEX.glow).setTint(theme.player.light).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.55).setDepth(1);
  return {
    update(dt: number, ctx: SkillContext) {
      const radius = skillParam('lightRing', 'radius', ctx.level) * ctx.stats.areaMult;
      const dps = skillParam('lightRing', 'dps', ctx.level) * ctx.stats.damageMult;
      img.setPosition(ctx.player.x, ctx.player.y).setScale((radius * 2.4) / GLOW_SIZE);
      for (const e of ctx.enemiesNear(ctx.player.x, ctx.player.y, radius)) ctx.damage(e, dps * dt);
    },
    destroy() { img.destroy(); },
  };
}
