import { SKILLS } from '../../src/data/skills';
import { ENEMIES } from '../../src/data/enemies';
import { ZONES } from '../../src/data/zones';
import { TREE } from '../../src/data/tree';
import { GEAR_SLOT_STATS, GEAR_STAT_BASE } from '../../src/data/gear';
import { theme } from '../../src/theme';
import type { EnemyId, SkillId } from '../../src/data/types';

test('tam 12 yetenek, 6 aktif 6 pasif', () => {
  const all = Object.values(SKILLS);
  expect(all).toHaveLength(12);
  expect(all.filter(s => s.kind === 'active')).toHaveLength(6);
  all.forEach(s => expect(s.maxLevel).toBe(5));
});
test('başlangıçta 6 yetenek açık, Işık Halkası dahil', () => {
  const start = Object.values(SKILLS).filter(s => s.unlockAccountLevel <= 1).map(s => s.id);
  expect(start.sort()).toEqual(['intenseFlame', 'lightRing', 'lightStep', 'orbitFlames', 'sparkRain', 'wideLight']);
});
test('ağaç 20 düğüm, 3 kural düğümü, gereksinimler var olan düğümleri gösterir', () => {
  expect(TREE).toHaveLength(20);
  expect(TREE.filter(n => n.effect.type === 'rule').map(n => n.effect.type === 'rule' && n.effect.rule).sort())
    .toEqual(['fourChoices', 'oneReroll', 'startWithTwoSkills']);
  const ids = new Set(TREE.map(n => n.id));
  expect(ids.size).toBe(20);
  TREE.forEach(n => n.requires.forEach(r => expect(ids.has(r)).toBe(true)));
});
test('ilk 5 düğüm ortalama bir bölge-1 turundan (≈280 Kor) ucuz', () => {
  expect(TREE.slice(0, 5).map(n => n.cost)).toEqual([50, 80, 120, 160, 200]);
});
test('ağaç maliyetleri artan ve 1500 sınırında', () => {
  const costs = TREE.map(n => n.cost);
  costs.forEach((c, i) => i > 0 && expect(c).toBeGreaterThanOrEqual(costs[i - 1]!));
  expect(Math.max(...costs)).toBeLessThanOrEqual(1500);
});
test('bölge çarpanları', () => expect(ZONES.map(z => z.mult)).toEqual([1, 1.8, 3]));
test('düşman tablosu', () => {
  expect(ENEMIES.mistHeart).toMatchObject({ hp: 3000, isBoss: true, appearsAfterSec: 480, spawnWeight: 0 });
  expect(ENEMIES.mistSpirit.ranged).toEqual({ range: 220, projectileDamage: 6, cooldownSec: 2 });
});
test('her yuvanın özellikleri tanımlı', () => {
  (['hazne', 'cam', 'fitil'] as const).forEach(s => {
    expect(GEAR_SLOT_STATS[s].length).toBeGreaterThanOrEqual(2);
    GEAR_SLOT_STATS[s].forEach(k => expect(GEAR_STAT_BASE[k]).toBeGreaterThan(0));
  });
});
test('her veri kimliğinin tema karşılığı var', () => {
  Object.keys(SKILLS).forEach(id => {
    expect(theme.skills[id as SkillId].name).toBeTruthy();
    expect(theme.skills[id as SkillId].desc(1)).toBeTruthy();
  });
  Object.keys(ENEMIES).forEach(id => expect(theme.enemies[id as EnemyId]).toBeDefined());
  TREE.forEach(n => expect(theme.treeNodes[n.id]).toBeTruthy());
  expect(Object.keys(theme.zones)).toHaveLength(3);
  expect(theme.zones[0].name).toBe('Sisli Orman');
  expect(theme.slots).toEqual({ hazne: 'Hazne', cam: 'Cam', fitil: 'Fitil' });
});
