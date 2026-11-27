import { PALETTE } from '../../src/art/palette';
import { ENEMY_SPRITES, FIRE_FRAMES, ICONS, SPRITES } from '../../src/art/grids';
import { ditherDisc, gridToSvg, parseGrid, type Grid } from '../../src/art/render';
import { SKILLS } from '../../src/data/skills';
import { ENEMIES } from '../../src/data/enemies';

const all: [string, Grid][] = [
  ...Object.entries(SPRITES), ...Object.entries(ENEMY_SPRITES), ...Object.entries(ICONS),
  ...FIRE_FRAMES.map((f, i) => [`fire${i}`, f] as [string, Grid]),
];

test.each(all)('%s dikdörtgen ve yalnızca paletteki karakterleri kullanır', (_name, g) => {
  const rows = parseGrid(g);
  expect(rows.length).toBeGreaterThan(0);
  rows.forEach(r => expect(r.length).toBe(rows[0]!.length));
  rows.join('').split('').forEach(ch => expect(ch === '.' || ch in PALETTE).toBe(true));
});
test('her yeteneğin ve düşmanın görseli var', () => {
  Object.keys(SKILLS).forEach(id => expect(ICONS[id]).toBeDefined());
  Object.keys(ENEMIES).filter(id => id !== 'mistHeart').forEach(id => expect(ENEMY_SPRITES[id]).toBeDefined());
});
test('ateş kareleri aynı boyutta', () => {
  const sizes = FIRE_FRAMES.map(f => { const r = parseGrid(f); return `${r[0]!.length}x${r.length}`; });
  expect(new Set(sizes).size).toBe(1);
});
test('gridToSvg piksel başına dikdörtgen üretir ve yatay koşuları birleştirir', () => {
  const svg = gridToSvg(['ee.', '.b.']);
  expect(svg).toContain('viewBox="0 0 3 2"');
  expect(svg.match(/<rect/g)).toHaveLength(2);
  expect(svg).toContain('width="2"');
  expect(svg).toContain(PALETTE.e);
});
test('ditherDisc merkezde dolu, kenara doğru seyrelir, köşe boş', () => {
  const rows = ditherDisc(32, 'e');
  expect(rows).toHaveLength(32);
  expect(rows[16]![16]).toBe('e');
  expect(rows[0]![0]).toBe('.');
  const density = (r0: number, r1: number) => {
    let on = 0, n = 0;
    rows.forEach((row, y) => row.split('').forEach((c, x) => {
      const d = Math.hypot(x + 0.5 - 16, y + 0.5 - 16);
      if (d >= r0 && d < r1) { n++; if (c !== '.') on++; }
    }));
    return on / n;
  };
  expect(density(0, 5)).toBeGreaterThan(density(10, 14));
});
