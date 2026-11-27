import Phaser from 'phaser';
import { skillParam } from '../../data/skills';
import { theme } from '../../theme';
import { TEX } from '../textures';
import type { SkillBehavior } from './types';

const LIFE = 1.6;
const HIT_RADIUS = 10;
const TARGET_RANGE = 480;

interface Spear { x: number; y: number; vx: number; vy: number; life: number; pierce: number; hit: Set<number>; img: Phaser.GameObjects.Image; alive: boolean }

export function createLightSpear(scene: Phaser.Scene): SkillBehavior {
  const spears: Spear[] = [];
  let cd = 0.4;
  return {
    update(dt, ctx) {
      cd -= dt;
      if (cd <= 0) {
        const target = ctx.nearestEnemy(ctx.player.x, ctx.player.y, TARGET_RANGE);
        if (target) {
          cd = Math.max(0.3, skillParam('lightSpear', 'cooldown', ctx.level));
          const dx = target.x - ctx.player.x, dy = target.y - ctx.player.y;
          const len = Math.hypot(dx, dy) || 1;
          const speed = skillParam('lightSpear', 'speed', ctx.level);
          let s = spears.find(sp => !sp.alive);
          if (!s) {
            s = { x: 0, y: 0, vx: 0, vy: 0, life: 0, pierce: 0, hit: new Set(), img: scene.add.image(0, 0, TEX.spark).setTint(theme.player.light).setBlendMode(Phaser.BlendModes.ADD).setDepth(6), alive: false };
            spears.push(s);
          }
          Object.assign(s, { x: ctx.player.x, y: ctx.player.y, vx: (dx / len) * speed, vy: (dy / len) * speed, life: LIFE, pierce: skillParam('lightSpear', 'pierce', ctx.level), alive: true });
          s.hit.clear();
          s.img.setVisible(true).setScale(2.2, 0.8).setRotation(Math.atan2(dy, dx));
        } else {
          cd = 0.2;
        }
      }
      const dmg = skillParam('lightSpear', 'damage', ctx.level) * ctx.stats.damageMult;
      for (const s of spears) {
        if (!s.alive) continue;
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
        s.img.setPosition(s.x, s.y);
        for (const e of ctx.enemiesNear(s.x, s.y, HIT_RADIUS)) {
          if (s.hit.has(e.id)) continue;
          s.hit.add(e.id);
          ctx.damage(e, dmg);
          s.pierce -= 1;
          if (s.pierce <= 0) break;
        }
        if (s.life <= 0 || s.pierce <= 0) { s.alive = false; s.img.setVisible(false); }
      }
    },
    destroy() { spears.forEach(s => s.img.destroy()); },
  };
}
