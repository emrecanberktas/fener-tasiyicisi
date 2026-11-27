import { FIRE_FRAMES, ICONS, SPRITES } from '../art/grids';
import { ditherDisc, gridToSvg, parseGrid, svgDataUri, type Grid } from '../art/render';
import { h } from './dom';

const cache = new Map<string, string>();
const uri = (key: string, g: Grid): string => {
  let u = cache.get(key);
  if (!u) { u = svgDataUri(gridToSvg(g)); cache.set(key, u); }
  return u;
};

/** 8×8 pixel simge; scale = ekran pikseli / sprite pikseli. */
export function icon(name: keyof typeof ICONS | string, scale = 3, alt = ''): HTMLImageElement {
  const g = ICONS[name] ?? ICONS.kor!;
  const size = parseGrid(g)[0]!.length * scale;
  return h('img', { class: 'px-icon', src: uri(`i:${name}`, g), width: String(size), height: String(size), alt });
}

export function sprite(name: keyof typeof SPRITES, scale = 3): HTMLImageElement {
  const rows = parseGrid(SPRITES[name]!);
  return h('img', { class: 'px-icon', src: uri(`s:${name}`, rows), width: String(rows[0]!.length * scale), height: String(rows.length * scale), alt: '' });
}

/** Kamp sahnesi: dither'lı ışık, kare kare yanan ateş, ateşin başındaki taşıyıcı. */
export function campScene(fill: number): HTMLElement {
  const frames = FIRE_FRAMES.map(parseGrid);
  const fw = frames[0]![0]!.length, fh = frames[0]!.length;
  const sheet = Array.from({ length: fh }, (_, y) => frames.map(f => f[y]).join(''));
  const glowSize = 72;
  const glowScale = 3;
  const scale = 6;
  return h('div', { class: 'camp-scene', style: { '--fill': String(fill) } as unknown as Partial<CSSStyleDeclaration>, 'aria-hidden': 'true' },
    h('img', { class: 'scene-glow', src: uri('glow', ditherDisc(glowSize, 'e', 0.05)), width: String(glowSize * glowScale), height: String(glowSize * glowScale), alt: '' }),
    h('div', {
      class: 'scene-fire',
      style: {
        width: `${fw * scale}px`, height: `${fh * scale}px`,
        backgroundImage: `url("${uri('firesheet', sheet)}")`,
        backgroundSize: `${fw * scale * 3}px ${fh * scale}px`,
      },
    }),
    Object.assign(sprite('player', scale), { className: 'px-icon scene-player' }),
    h('span', { class: 'ember e1' }), h('span', { class: 'ember e2' }), h('span', { class: 'ember e3' }));
}
