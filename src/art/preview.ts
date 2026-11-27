// Geliştirme sırasında sprite'lara bakmak için: npm run dev → /art.html
import { ENEMY_SPRITES, FIRE_FRAMES, ICONS, SPRITES } from './grids';
import { ditherDisc, gridToSvg, svgDataUri, type Grid } from './render';

const show = (name: string, g: Grid, scale = 6) => {
  const img = document.createElement('img');
  img.src = svgDataUri(gridToSvg(g));
  img.onload = () => { img.width = img.naturalWidth * scale; };
  const fig = document.createElement('figure');
  fig.append(img, Object.assign(document.createElement('figcaption'), { textContent: name }));
  document.body.append(fig);
};
Object.entries(SPRITES).forEach(([n, g]) => show(n, g));
Object.entries(ENEMY_SPRITES).forEach(([n, g]) => show(n, g));
FIRE_FRAMES.forEach((g, i) => show(`fire${i}`, g));
Object.entries(ICONS).forEach(([n, g]) => show(n, g, 5));
show('ditherDisc', ditherDisc(40, 'E', 0.3, 'Y', 0.12), 4);
