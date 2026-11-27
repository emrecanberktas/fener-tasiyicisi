import Phaser from 'phaser';
import { skillParam } from '../../data/skills';
import { GLOW_SIZE, TEX } from '../textures';
import type { SkillBehavior } from './types';

const COLOR = 0xff8a3d;
const FLAME_RADIUS = 14;
const HIT_COOLDOWN = 0.5;

export function createOrbitFlames(scene: Phaser.Scene): SkillBehavior {
  const flames: Phaser.GameObjects.Image[] = [];
  const lastHit = new Map<number, number>();
  let angle = 0;
  let clock = 0;
  return {
    update(dt, ctx) {
      clock += dt;
      const count = skillParam('orbitFlames', 'count', ctx.level);
      while (flames.length < count) {
        flames.push(scene.add.image(0, 0, TEX.glow).setTint(COLOR).setBlendMode(Phaser.BlendModes.ADD).setScale((FLAME_RADIUS * 3) / GLOW_SIZE).setDepth(6));
      }
      const radius = skillParam('orbitFlames', 'radius', ctx.level) * ctx.stats.areaMult;
      const dmg = skillParam('orbitFlames', 'damage', ctx.level) * ctx.stats.damageMult;
      angle += skillParam('orbitFlames', 'rps', ctx.level) * Math.PI * 2 * dt;
      flames.forEach((f, i) => {
        const a = angle + (i / flames.length) * Math.PI * 2;
        const x = ctx.player.x + Math.cos(a) * radius;
        const y = ctx.player.y + Math.sin(a) * radius;
        f.setPosition(x, y);
        for (const e of ctx.enemiesNear(x, y, FLAME_RADIUS)) {
          if (clock - (lastHit.get(e.id) ?? -1) < HIT_COOLDOWN) continue;
          lastHit.set(e.id, clock);
          ctx.damage(e, dmg);
        }
      });
      if (lastHit.size > 2000) lastHit.clear();
    },
    destroy() { flames.forEach(f => f.destroy()); },
  };
}
