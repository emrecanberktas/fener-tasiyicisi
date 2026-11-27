import type Phaser from 'phaser';
import { skillParam } from '../../data/skills';
import { PIXEL } from '../textures';
import type { EnemyRef, SkillBehavior } from './types';

const COLOR = 0xb6ece6;
const JAG = 7;

export function createChainLightning(scene: Phaser.Scene): SkillBehavior {
  let cd = 0.3;
  const g = scene.add.graphics().setDepth(7);
  let fade = 0;
  return {
    update(dt, ctx) {
      fade = Math.max(0, fade - dt);
      g.setAlpha(fade / 0.2);
      cd -= dt;
      if (cd > 0) return;
      const range = skillParam('chainLightning', 'range', ctx.level) * ctx.stats.areaMult;
      const first = ctx.nearestEnemy(ctx.player.x, ctx.player.y, range);
      if (!first) { cd = 0.2; return; }
      cd = skillParam('chainLightning', 'cooldown', ctx.level);
      const dmg = skillParam('chainLightning', 'damage', ctx.level) * ctx.stats.damageMult;
      const jumps = skillParam('chainLightning', 'jumps', ctx.level);
      const hit = new Set<number>();
      const points: { x: number; y: number }[] = [{ x: ctx.player.x, y: ctx.player.y }];
      let cur: EnemyRef | null = first;
      for (let i = 0; i < jumps && cur; i++) {
        hit.add(cur.id);
        points.push({ x: cur.x, y: cur.y });
        ctx.damage(cur, dmg);
        const from: EnemyRef = cur;
        cur = ctx.enemiesNear(from.x, from.y, range)
          .filter(e => !hit.has(e.id))
          .reduce<EnemyRef | null>((b, e) => {
            const d = (e.x - from.x) ** 2 + (e.y - from.y) ** 2;
            return !b || d < (b.x - from.x) ** 2 + (b.y - from.y) ** 2 ? e : b;
          }, null);
      }
      g.clear().lineStyle(PIXEL, COLOR, 1).beginPath();
      points.forEach((p, i) => {
        if (i === 0) { g.moveTo(p.x, p.y); return; }
        const prev = points[i - 1]!;
        const mx = (prev.x + p.x) / 2 + (Math.random() - 0.5) * JAG * 2, my = (prev.y + p.y) / 2 + (Math.random() - 0.5) * JAG * 2;
        g.lineTo(mx, my);
        g.lineTo(p.x, p.y);
      });
      g.strokePath();
      fade = 0.2;
    },
    destroy() { g.destroy(); },
  };
}
