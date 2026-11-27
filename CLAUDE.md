# Fener Taşıyıcısı

Tek elle, dikey ekranda oynanan kişisel mobil oyun: survivor-like tur + kalıcı RPG gelişimi + offline idle.
TypeScript (strict) · Phaser 3 · Vite · Vitest/happy-dom · PWA. Arayüz dili Türkçe.

- Tasarım (bağlayıcı): `docs/superpowers/specs/2026-11-27-fener-tasiyicisi-design.md`
- Plan ve verilen kararlar: `docs/superpowers/plans/`, `docs/superpowers/progress.md`
- Ayrıntılı kurallar: `.claude/rules/*.md` — işe başlamadan ilgili olanı oku.

## Komutlar
- `npm test` — tüm testler (her değişiklikten sonra yeşil olmalı)
- `npx tsc --noEmit` — tip denetimi
- `npm run dev` — telefondan `http://<ip>:5173/`; `/art.html` sprite önizleme; `?perf=1` 300 düşmanlı tur
- `npm run build` — PWA çıktısı (`dist/`)
- `npm run icons` — `public/icon.svg`'den PWA ikonları

## Katmanlar (kısaca)
| Klasör | Ne | Phaser? |
|---|---|---|
| `src/core/` | Oyunun tüm kuralları: kayıt, gelişim, idle, görevler, tur durumu, ödüller | Hayır, saf TS |
| `src/data/` | Sayısal tablolar (yetenekler, düşmanlar, ağaç, bölgeler) | Hayır |
| `src/theme/` | Görünen her metin ve renk, kimlik → içerik | Hayır |
| `src/art/` | Pixel sprite ızgaraları, palet, SVG/canvas çizim | Hayır |
| `src/game/` | Phaser tur sahnesi ve yetenek davranışları | Evet |
| `src/ui/` | DOM ekranları (kamp, fener, ağaç, görevler, ayarlar, HUD, kartlar) | Hayır |
| `src/app/` | Store, yönlendirici, tur akışı, titreşim | Yalnızca `router.ts` |

## Değişmez kurallar (spec'ten)
Enerji/can sınırı yok · bekleme sayacı yok · seri/kaçırma cezası yok · kalıcı gelişim tam 3 eksen
(seviye, fener parçaları, ağaç) · tek para birimi Kor · ekipman yükseltme sistemi yok · tek el, dikey,
etkileşim ekranın alt ⅔'ünde · idle deposu 48 saat · ölünce boss ödülü hariç her şey korunur.
Bunlardan birine dokunan bir istek gelirse önce Emre'ye sor.
