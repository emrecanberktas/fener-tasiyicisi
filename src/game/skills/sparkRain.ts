import type Phaser from 'phaser';
import { skillParam } from '../../data/skills';
import { theme } from '../../theme';
import { flash } from './fx';
import type { SkillBehavior } from './types';

const SPREAD = 240;

export function createSparkRain(scene: Phaser.Scene): SkillBehavior {
  let cd = 0.5;
  return {
    update(dt, ctx) {
      cd -= dt;
      if (cd > 0) return;
      cd = Math.max(0.4, skillParam('sparkRain', 'cooldown', ctx.level));
      const count = skillParam('sparkRain', 'count', ctx.level);
      const radius = skillParam('sparkRain', 'radius', ctx.level) * ctx.stats.areaMult;
      const dmg = skillParam('sparkRain', 'damage', ctx.level) * ctx.stats.damageMult;
      for (let i = 0; i < count; i++) {
        // Önce bir düşmanın yakınına, yoksa rastgele bir noktaya düş.
        const target = ctx.nearestEnemy(ctx.player.x + (Math.random() - 0.5) * SPREAD, ctx.player.y + (Math.random() - 0.5) * SPREAD, SPREAD);
        const x = target ? target.x : ctx.player.x + (Math.random() - 0.5) * SPREAD;
        const y = target ? target.y : ctx.player.y + (Math.random() - 0.5) * SPREAD;
        flash(scene, x, y, radius, theme.player.light, 300, 2);
        for (const e of ctx.enemiesNear(x, y, radius)) ctx.damage(e, dmg);
      }
    },
    destroy() {},
  };
}
