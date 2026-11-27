import { PALETTE } from './palette';

/** Satır dizisi; '.' saydam, diğer karakterler PALETTE anahtarı. */
export type Grid = readonly string[];

export function parseGrid(g: Grid): string[] {
  return g.map(r => r.trim()).filter(r => r.length > 0);
}

/** Grid'i keskin kenarlı SVG'ye çevirir; yatay aynı renk koşuları tek dikdörtgen olur. */
export function gridToSvg(g: Grid, palette: Record<string, string> = PALETTE): string {
  const rows = parseGrid(g);
  const w = rows[0]?.length ?? 0;
  const rects: string[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x]!;
      let run = 1;
      while (x + run < row.length && row[x + run] === ch) run++;
      if (ch !== '.' && palette[ch]) rects.push(`<rect x="${x}" y="${y}" width="${run}" height="1" fill="${palette[ch]}"/>`);
      x += run;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${rows.length}" width="${w}" height="${rows.length}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
}

export const svgDataUri = (svg: string): string => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

/** Grid'i 1 piksel = 1 hücre olacak şekilde bir canvas'a çizer (yalnızca tarayıcıda). */
export function gridToCanvas(g: Grid, palette: Record<string, string> = PALETTE): HTMLCanvasElement {
  const rows = parseGrid(g);
  const c = document.createElement('canvas');
  c.width = rows[0]?.length ?? 1;
  c.height = rows.length || 1;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  rows.forEach((row, y) => row.split('').forEach((ch, x) => {
    if (ch === '.' || !palette[ch]) return;
    ctx.fillStyle = palette[ch]!;
    ctx.fillRect(x, y, 1, 1);
  }));
  return c;
}

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * Dither'lı ışık diski: merkezde dolu, kenara doğru Bayer deseniyle seyrelir.
 * `inner` (0..1) oranına kadar tamamen dolu, sonra 1'e kadar seyrelir.
 */
export function ditherDisc(size: number, ch: string, inner = 0.35, coreCh?: string, core = 0): string[] {
  const r = size / 2;
  const rows: string[] = [];
  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x + 0.5 - r, y + 0.5 - r) / r;
      if (d >= 1) { row += '.'; continue; }
      if (coreCh && d < core) { row += coreCh; continue; }
      const t = d <= inner ? 1 : 1 - (d - inner) / (1 - inner);
      row += t * 16 > BAYER4[y % 4]![x % 4]! ? ch : '.';
    }
    rows.push(row);
  }
  return rows;
}

/** 1 piksel kalınlığında, kesik kesik halka (alan göstergesi). */
export function dashedRing(size: number, ch: string, dash = 3): string[] {
  const r = size / 2 - 0.5;
  const grid = Array.from({ length: size }, () => Array<string>(size).fill('.'));
  const steps = Math.ceil(Math.PI * 2 * r * 1.5);
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const x = Math.round(r + Math.cos(a) * r), y = Math.round(r + Math.sin(a) * r);
    const arc = Math.floor((a * r) / dash);
    if (arc % 2 === 0 && grid[y] && x >= 0 && x < size) grid[y]![x] = ch;
  }
  return grid.map(r2 => r2.join(''));
}
