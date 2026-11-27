import Phaser from 'phaser';
import { ENEMIES } from '../data/enemies';
import { PLAYER_BASE } from '../data/player';
import { zoneMult } from '../data/zones';
import type { EnemyDef, EnemyId, PlayerStats, SkillId } from '../data/types';
import { createRng, type Rng } from '../core/rng';
import type { RunResult } from '../core/run/rewards';
import { addRunXp, applyLevelUpChoice, rollLevelUpChoices, xpToNextLevel, type LevelUpChoice, type RunState } from '../core/run/runState';
import { BOSS_AT_SEC, MAX_ALIVE, pickEnemyType, spawnRatePerSec } from '../core/run/spawn';
import { SpatialGrid } from '../core/spatialGrid';
import { theme } from '../theme';
import { isInJoystickZone, joystickVector, type Vec } from './joystick';
import { createSkillBehavior } from './skills/registry';
import type { EnemyRef, SkillBehavior, SkillContext } from './skills/types';
import { CIRCLE_SIZE, makeTextures, TEX } from './textures';

export const VIEW_W = 540;
export const VIEW_H = 960;
const PLAYER_RADIUS = 12;
const SPAWN_DISTANCE = 560;
const DESPAWN_DISTANCE = 1100;
const INVULN_SEC = 0.5;
const JOYSTICK_RADIUS = 60;
const COLLECT_RADIUS = 14;
const SPARK_PULL_SPEED = 420;
const PROJECTILE_SPEED = 160;
const PROJECTILE_LIFE = 3;
const HUD_INTERVAL = 0.1;
const GRID_CELL = 64;

export interface HudState { elapsedSec: number; level: number; xpRatio: number; hpRatio: number; bossHpRatio: number | null }

export interface RunOptions {
  state: RunState;
  stats: PlayerStats;
  unlocked: SkillId[];
  /** Tur içi pasiflerle güncellenmiş istatistikler (G13). Verilmezse stats kullanılır. */
  statsFor?: (state: RunState) => PlayerStats;
  /** ?perf=1: 300 düşmanla başla ve FPS göster. */
  perf?: boolean;
  onHud(h: HudState): void;
  onLevelUp(choices: LevelUpChoice[], state: RunState): void;
  onAutosave(s: RunState): void;
  onEnd(result: RunResult): void;
  /** Uygulama arka plana geçti; tur duraklatıldı ve kaydedildi. */
  onBackground?(): void;
}

interface Enemy {
  id: number;
  def: EnemyDef;
  hp: number;
  maxHp: number;
  damage: number;
  x: number;
  y: number;
  radius: number;
  shootCd: number;
  img: Phaser.GameObjects.Image;
  alive: boolean;
}
interface Spark { x: number; y: number; value: number; pulled: boolean; img: Phaser.GameObjects.Image; alive: boolean }
interface Projectile { x: number; y: number; vx: number; vy: number; dmg: number; life: number; img: Phaser.GameObjects.Image; alive: boolean }

export class RunScene extends Phaser.Scene {
  private opts!: RunOptions;
  private state!: RunState;
  private stats!: PlayerStats;
  private rng!: Rng;
  private enemies: Enemy[] = [];
  private byId = new Map<number, Enemy>();
  private sparks: Spark[] = [];
  private projectiles: Projectile[] = [];
  private grid = new SpatialGrid(GRID_CELL);
  private behaviors = new Map<SkillId, SkillBehavior>();
  private player!: Phaser.GameObjects.Image;
  private playerGlow!: Phaser.GameObjects.Image;
  private joyBase!: Phaser.GameObjects.Image;
  private joyKnob!: Phaser.GameObjects.Image;
  private joyOrigin: Vec | null = null;
  private joyPointer: Vec = { x: 0, y: 0 };
  private spawnAcc = 0;
  private invuln = 0;
  private hudAcc = 0;
  private autosaveAcc = 0;
  private bonusKor = 0;
  private paused = false;
  private inLevelUp = false;
  private ended = false;
  private nextEnemyId = 1;
  private boss: Enemy | null = null;
  private ctx!: SkillContext;

  constructor(opts: RunOptions) {
    super('run');
    this.opts = opts;
  }

  create(): void {
    this.state = { ...this.opts.state };
    this.rng = createRng(this.state.seed ^ Math.floor(this.state.elapsedSec * 1000));
    this.refreshStats();
    makeTextures(this);
    const zone = theme.zones[(this.state.zoneIndex as 0 | 1 | 2)] ?? theme.zones[0];
    this.cameras.main.setBackgroundColor(zone.bg);
    try { this.cameras.main.postFX?.addVignette(0.5, 0.5, 0.9, 0.35); } catch { /* canvas modunda yok */ }

    this.playerGlow = this.add.image(0, 0, TEX.glow).setTint(theme.player.light).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.35).setScale(1.2).setDepth(2);
    this.player = this.add.image(this.state.playerX, this.state.playerY, TEX.circle).setTint(theme.player.color).setScale((PLAYER_RADIUS * 2) / CIRCLE_SIZE).setDepth(5);

    this.joyBase = this.add.image(0, 0, TEX.circle).setScrollFactor(0).setAlpha(0.12).setScale((JOYSTICK_RADIUS * 2) / CIRCLE_SIZE).setVisible(false).setDepth(20);
    this.joyKnob = this.add.image(0, 0, TEX.circle).setScrollFactor(0).setAlpha(0.3).setScale(0.9).setVisible(false).setDepth(21);
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.paused || !isInJoystickZone(p.y, this.scale.height)) return;
      this.joyOrigin = { x: p.x, y: p.y };
      this.joyPointer = { x: p.x, y: p.y };
      this.joyBase.setPosition(p.x, p.y).setVisible(true);
      this.joyKnob.setPosition(p.x, p.y).setVisible(true);
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!this.joyOrigin) return;
      this.joyPointer = { x: p.x, y: p.y };
      const v = joystickVector(this.joyOrigin, this.joyPointer, JOYSTICK_RADIUS);
      this.joyKnob.setPosition(this.joyOrigin.x + v.x * JOYSTICK_RADIUS, this.joyOrigin.y + v.y * JOYSTICK_RADIUS);
    });
    const release = () => {
      this.joyOrigin = null;
      this.joyBase.setVisible(false);
      this.joyKnob.setVisible(false);
    };
    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);

    this.ctx = {
      player: { x: this.state.playerX, y: this.state.playerY },
      level: 1,
      stats: this.stats,
      enemiesNear: (x, y, r) => this.enemiesNear(x, y, r),
      nearestEnemy: (x, y, r) => this.nearestEnemy(x, y, r),
      damage: (e, amount) => this.damageEnemy(e.id, amount),
      scene: this,
    };
    this.syncBehaviors();
    this.cameras.main.centerOn(this.state.playerX, this.state.playerY);
    this.emitHud();
    if (this.opts.perf) this.startPerfMode();
    if (this.state.pendingLevelUps > 0) this.openLevelUp();
  }

  private startPerfMode(): void {
    for (let i = 0; i < MAX_ALIVE; i++) {
      const e = this.spawnEnemy(pickEnemyType(this.rng, 300));
      const a = this.rng.next() * Math.PI * 2, d = 150 + this.rng.next() * 500;
      e.x = this.player.x + Math.cos(a) * d; e.y = this.player.y + Math.sin(a) * d;
    }
    const txt = this.add.text(12, 120, '', { fontFamily: 'monospace', fontSize: '16px', color: '#9fffb0' }).setScrollFactor(0).setDepth(50);
    this.time.addEvent({ delay: 500, loop: true, callback: () => {
      const alive = this.enemies.filter(e => e.alive).length;
      txt.setText(`FPS ${this.game.loop.actualFps.toFixed(0)} · düşman ${alive}`);
    } });
  }

  // ---- dış kontrol ----

  pauseRun(): void { this.paused = true; }
  resumeRun(): void { if (!this.inLevelUp && !this.ended) this.paused = false; }
  getState(): RunState { return { ...this.state, playerX: this.player.x, playerY: this.player.y }; }

  chooseLevelUp(choice: LevelUpChoice): void {
    if (!this.inLevelUp) return;
    const r = applyLevelUpChoice(this.state, choice, this.stats);
    this.state = r.state;
    this.bonusKor += r.bonusKor;
    this.refreshStats();
    this.syncBehaviors();
    this.inLevelUp = false;
    if (this.state.pendingLevelUps > 0) this.openLevelUp();
    else this.paused = false;
  }

  reroll(): void {
    if (!this.inLevelUp || this.state.rerollsLeft <= 0) return;
    this.state = { ...this.state, rerollsLeft: this.state.rerollsLeft - 1 };
    this.opts.onLevelUp(this.rollChoices(), this.getState());
  }

  /** Oyuncunun isteğiyle tur bitirme: ölüm gibi işlenir. */
  forfeit(): void { this.endRun(false); }

  // ---- döngü ----

  update(_time: number, deltaMs: number): void {
    if (this.paused || this.ended) return;
    const dt = Math.min(deltaMs / 1000, 0.05);
    this.state.elapsedSec += dt;

    this.movePlayer(dt);
    this.spawn(dt);
    this.rebuildGrid();
    this.updateEnemies(dt);
    this.updateProjectiles(dt);

    this.ctx.player.x = this.player.x;
    this.ctx.player.y = this.player.y;
    this.ctx.stats = this.stats;
    for (const [id, b] of this.behaviors) {
      this.ctx.level = this.state.skills[id] ?? 1;
      b.update(dt, this.ctx);
    }
    if (this.ended) return;

    this.updateSparks(dt);
    if (this.stats.regen > 0) this.state.hp = Math.min(this.stats.maxHp, this.state.hp + this.stats.regen * dt);
    this.invuln = Math.max(0, this.invuln - dt);
    if (this.state.hp <= 0) { this.endRun(false); return; }

    this.cameras.main.centerOn(this.player.x, this.player.y);
    this.playerGlow.setPosition(this.player.x, this.player.y);

    this.hudAcc += dt;
    if (this.hudAcc >= HUD_INTERVAL) { this.hudAcc = 0; this.emitHud(); }
    this.autosaveAcc += dt;
    if (this.autosaveAcc >= 5) { this.autosaveAcc = 0; this.opts.onAutosave(this.getState()); }

    if (this.state.pendingLevelUps > 0 && !this.inLevelUp) this.openLevelUp();
  }

  // ---- parçalar ----

  private refreshStats(): void {
    this.stats = this.opts.statsFor ? this.opts.statsFor(this.state) : this.opts.stats;
  }

  private syncBehaviors(): void {
    for (const id of Object.keys(this.state.skills) as SkillId[]) {
      if (this.behaviors.has(id)) continue;
      const b = createSkillBehavior(id, this);
      if (b) this.behaviors.set(id, b);
    }
  }

  private movePlayer(dt: number): void {
    if (!this.joyOrigin) return;
    const v = joystickVector(this.joyOrigin, this.joyPointer, JOYSTICK_RADIUS);
    const speed = PLAYER_BASE.moveSpeed * this.stats.moveSpeedMult;
    this.player.x += v.x * speed * dt;
    this.player.y += v.y * speed * dt;
  }

  private spawn(dt: number): void {
    const alive = this.enemies.filter(e => e.alive).length;
    this.spawnAcc += spawnRatePerSec(this.state.elapsedSec, this.state.zoneIndex) * dt;
    let room = MAX_ALIVE - alive;
    while (this.spawnAcc >= 1 && room > 0) {
      this.spawnAcc -= 1;
      room -= 1;
      this.spawnEnemy(pickEnemyType(this.rng, this.state.elapsedSec));
    }
    if (this.spawnAcc > 1) this.spawnAcc = 1;
    if (this.state.elapsedSec >= BOSS_AT_SEC && !this.state.bossSpawned) {
      this.state.bossSpawned = true;
      this.boss = this.spawnEnemy('mistHeart');
    } else if (this.state.bossSpawned && !this.boss) {
      // Devam edilen turda boss yeniden doğar.
      this.boss = this.spawnEnemy('mistHeart');
    }
  }

  private spawnEnemy(type: EnemyId): Enemy {
    const def = ENEMIES[type];
    const m = zoneMult(this.state.zoneIndex);
    const look = theme.enemies[type];
    const a = this.rng.next() * Math.PI * 2;
    const x = this.player.x + Math.cos(a) * SPAWN_DISTANCE;
    const y = this.player.y + Math.sin(a) * SPAWN_DISTANCE;
    let e = this.enemies.find(en => !en.alive);
    if (!e) {
      e = { id: 0, def, hp: 0, maxHp: 0, damage: 0, x, y, radius: 0, shootCd: 0, img: this.add.image(x, y, TEX.circle).setDepth(4), alive: false };
      this.enemies.push(e);
    }
    this.byId.delete(e.id);
    e.id = this.nextEnemyId++;
    this.byId.set(e.id, e);
    e.def = def;
    e.maxHp = def.hp * m;
    e.hp = e.maxHp;
    e.damage = def.contactDamage * (1 + (m - 1) * 0.5);
    e.x = x; e.y = y;
    e.radius = look.radius;
    e.shootCd = def.ranged?.cooldownSec ?? 0;
    e.alive = true;
    e.img.setPosition(x, y).setTint(look.color).setScale((look.radius * 2) / CIRCLE_SIZE).setVisible(true).setAlpha(1);
    return e;
  }

  private rebuildGrid(): void {
    this.grid.clear();
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i]!;
      if (e.alive) this.grid.insert(i, e.x, e.y);
    }
  }

  private enemiesNear(x: number, y: number, r: number): EnemyRef[] {
    const out: EnemyRef[] = [];
    for (const i of this.grid.queryRadius(x, y, r + 50)) {
      const e = this.enemies[i]!;
      if (!e.alive) continue;
      const rr = r + e.radius;
      if ((e.x - x) ** 2 + (e.y - y) ** 2 <= rr * rr) out.push({ id: e.id, x: e.x, y: e.y });
    }
    return out;
  }

  private nearestEnemy(x: number, y: number, maxR: number): EnemyRef | null {
    let best: Enemy | null = null;
    let bestD = maxR * maxR;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d = (e.x - x) ** 2 + (e.y - y) ** 2;
      if (d < bestD) { bestD = d; best = e; }
    }
    return best ? { id: best.id, x: best.x, y: best.y } : null;
  }

  private damageEnemy(id: number, amount: number): void {
    const e = this.byId.get(id);
    if (!e || !e.alive) return;
    e.hp -= amount;
    if (e.hp > 0) return;
    e.alive = false;
    e.img.setVisible(false);
    this.state.kills += 1;
    if (e.def.xpValue > 0) this.dropSpark(e.x, e.y, e.def.xpValue);
    if (e.def.isBoss) { this.boss = null; this.endRun(true); }
  }

  private dropSpark(x: number, y: number, value: number): void {
    let s = this.sparks.find(sp => !sp.alive);
    if (!s) {
      s = { x, y, value, pulled: false, img: this.add.image(x, y, TEX.spark).setTint(theme.player.light).setBlendMode(Phaser.BlendModes.ADD).setDepth(3), alive: false };
      this.sparks.push(s);
    }
    s.x = x; s.y = y; s.value = value; s.pulled = false; s.alive = true;
    s.img.setPosition(x, y).setVisible(true);
  }

  private updateEnemies(dt: number): void {
    const px = this.player.x, py = this.player.y;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const dx = px - e.x, dy = py - e.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist > DESPAWN_DISTANCE && !e.def.isBoss) {
        // Çok uzakta kalanı oyuncunun yakınına geri getir.
        const a = this.rng.next() * Math.PI * 2;
        e.x = px + Math.cos(a) * SPAWN_DISTANCE;
        e.y = py + Math.sin(a) * SPAWN_DISTANCE;
      }
      const ranged = e.def.ranged;
      const keepDistance = ranged && dist < ranged.range * 0.8;
      if (!keepDistance) {
        e.x += (dx / dist) * e.def.speed * dt;
        e.y += (dy / dist) * e.def.speed * dt;
      }
      if (ranged) {
        e.shootCd -= dt;
        if (e.shootCd <= 0 && dist <= ranged.range) {
          e.shootCd = ranged.cooldownSec;
          this.fireProjectile(e.x, e.y, dx / dist, dy / dist, ranged.projectileDamage * (1 + (zoneMult(this.state.zoneIndex) - 1) * 0.5));
        }
      }
      e.img.setPosition(e.x, e.y);
      if (dist < e.radius + PLAYER_RADIUS) this.hurtPlayer(e.damage);
    }
  }

  private fireProjectile(x: number, y: number, nx: number, ny: number, dmg: number): void {
    let p = this.projectiles.find(pr => !pr.alive);
    if (!p) {
      p = { x, y, vx: 0, vy: 0, dmg, life: 0, img: this.add.image(x, y, TEX.spark).setTint(theme.enemies.mistSpirit.color).setDepth(4), alive: false };
      this.projectiles.push(p);
    }
    Object.assign(p, { x, y, vx: nx * PROJECTILE_SPEED, vy: ny * PROJECTILE_SPEED, dmg, life: PROJECTILE_LIFE, alive: true });
    p.img.setPosition(x, y).setVisible(true);
  }

  private updateProjectiles(dt: number): void {
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      p.img.setPosition(p.x, p.y);
      const hit = Math.hypot(p.x - this.player.x, p.y - this.player.y) < PLAYER_RADIUS + 6;
      if (hit) this.hurtPlayer(p.dmg);
      if (hit || p.life <= 0) { p.alive = false; p.img.setVisible(false); }
    }
  }

  private hurtPlayer(amount: number): void {
    if (this.invuln > 0) return;
    this.state.hp -= amount;
    this.invuln = INVULN_SEC;
    this.player.setAlpha(0.4);
    this.time.delayedCall(INVULN_SEC * 1000, () => this.player.setAlpha(1));
  }

  private updateSparks(dt: number): void {
    const range = PLAYER_BASE.pickupRange * this.stats.pickupRangeMult;
    for (const s of this.sparks) {
      if (!s.alive) continue;
      const dx = this.player.x - s.x, dy = this.player.y - s.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= range) s.pulled = true;
      if (s.pulled && dist > 0) {
        const step = Math.min(dist, SPARK_PULL_SPEED * dt);
        s.x += (dx / dist) * step; s.y += (dy / dist) * step;
        s.img.setPosition(s.x, s.y);
      }
      if (dist <= COLLECT_RADIUS) {
        s.alive = false;
        s.img.setVisible(false);
        this.state = addRunXp(this.state, s.value * this.stats.xpGainMult);
      }
    }
  }

  private rollChoices(): LevelUpChoice[] {
    return rollLevelUpChoices(this.state, this.rng, this.opts.unlocked, this.stats.rules.includes('fourChoices') ? 4 : 3);
  }

  private openLevelUp(): void {
    this.inLevelUp = true;
    this.paused = true;
    this.joyOrigin = null;
    this.joyBase.setVisible(false);
    this.joyKnob.setVisible(false);
    this.emitHud();
    this.opts.onLevelUp(this.rollChoices(), this.getState());
  }

  private emitHud(): void {
    const need = xpToNextLevel(this.state.level);
    this.opts.onHud({
      elapsedSec: this.state.elapsedSec,
      level: this.state.level,
      xpRatio: Math.min(1, this.state.xp / need),
      hpRatio: Math.max(0, this.state.hp / this.stats.maxHp),
      bossHpRatio: this.boss ? Math.max(0, this.boss.hp / this.boss.maxHp) : null,
    });
  }

  private endRun(bossDefeated: boolean): void {
    if (this.ended) return;
    this.ended = true;
    this.paused = true;
    this.opts.onEnd({
      zoneIndex: this.state.zoneIndex,
      survivedSec: Math.floor(this.state.elapsedSec),
      kills: this.state.kills,
      bossDefeated,
      skills: { ...this.state.skills },
      bonusKor: this.bonusKor,
    });
  }
}
