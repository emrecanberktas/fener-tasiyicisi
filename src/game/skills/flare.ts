import type Phaser from 'phaser';
import { skillParam } from '../../data/skills';
import { theme } from '../../theme';
import { flash } from './fx';
import type { SkillBehavior } from './types';

export function createFlare(scene: Phaser.Scene): SkillBehavior {
  let cd = 1;
  return {
    update(dt, ctx) {
      cd -= dt;
      if (cd > 0) return;
      cd = Math.max(1, skillParam('flare', 'cooldown', ctx.level));
      const radius = skillParam('flare', 'radius', ctx.level) * ctx.stats.areaMult;
      const dmg = skillParam('flare', 'damage', ctx.level) * ctx.stats.damageMult;
      flash(scene, ctx.player.x, ctx.player.y, radius, theme.player.light, 400, 3);
      for (const e of ctx.enemiesNear(ctx.player.x, ctx.player.y, radius)) ctx.damage(e, dmg);
    },
    destroy() {},
  };
}
