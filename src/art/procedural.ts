import { createRng } from '../core/rng';
import { ditherDisc } from './render';

/** Sis Kalbi: dither'lı sis kütlesinin ortasında tek kor gözlü bir çekirdek. */
export function bossGrid(size = 30): string[] {
  const mist = ditherDisc(size, 'f', 0.55);
  const r = size / 2;
  return mist.map((row, y) => row.split('').map((ch, x) => {
    const dx = x + 0.5 - r, dy = y + 0.5 - r;
    const d = Math.hypot(dx, dy);
    const eye = Math.hypot(dx / 1.6, dy);
    if (eye < 1.6) return 'k';
    if (eye < 3) return 'E';
    if (eye < 4.2) return 'b';
    if (eye < 5) return 'k';
    if (d < r * 0.55 && (x * 7 + y * 3) % 11 === 0) return 'G';
    if (ch !== '.' && d > r * 0.8 && (x + y) % 3 === 0) return 'F';
    return ch;
  }).join(''));
}

/** Döşenebilir zemin: sis gecesi üzerinde seyrek taş, ot ve kül. */
export function groundTile(size = 96, seed = 7): string[] {
  const rng = createRng(seed);
  const g = Array.from({ length: size }, () => Array<string>(size).fill('n'));
  for (let i = 0; i < size * size * 0.05; i++) g[rng.int(0, size - 1)]![rng.int(0, size - 1)] = 'd';
  for (let i = 0; i < 11; i++) { // ot tutamları
    const x = rng.int(1, size - 3), y = rng.int(2, size - 1);
    g[y]![x] = 'M'; g[y - 1]![x + 1] = 'M'; g[y]![x + 2] = 'M';
  }
  for (let i = 0; i < 7; i++) { // taşlar
    const x = rng.int(0, size - 3), y = rng.int(0, size - 2);
    g[y]![x] = 's'; g[y]![x + 1] = 's'; g[y + 1]![x] = 'd'; g[y + 1]![x + 1] = 'd';
  }
  for (let i = 0; i < 6; i++) g[rng.int(0, size - 1)]![rng.int(0, size - 1)] = 'R'; // kül/kor izi
  return g.map(r => r.join(''));
}

const BAYER4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

/** Ekran kenarlarını dither'la karartan sis çerçevesi (w×h piksel birimi). */
export function vignetteGrid(w: number, h: number): string[] {
  const rows: string[] = [];
  for (let y = 0; y < h; y++) {
    let row = '';
    for (let x = 0; x < w; x++) {
      const nx = (x + 0.5) / w * 2 - 1, ny = (y + 0.5) / h * 2 - 1;
      const d = Math.max(0, Math.hypot(nx * 1.05, ny * 0.85) - 0.78) / 0.45;
      row += Math.min(1, d) * 16 > BAYER4[y % 4]![x % 4]! ? 'k' : '.';
    }
    rows.push(row);
  }
  return rows;
}
