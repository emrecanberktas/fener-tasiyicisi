# Görsel kurallar (pixel art)

- **Bir sprite pikseli ekranda 3 CSS pikseli** (`PIXEL` / `--p: 3px`). Oyunda sprite'lar `setScale(PIXEL)`,
  arayüzde boşluk, kenarlık ve gölgeler 3'ün katları.
- **Sprite'lar `src/art/grids.ts`'te karakter ızgarası.** Her karakter `src/art/palette.ts`'teki bir renk,
  `.` saydam. Yeni renk gerekiyorsa palete ekle, sprite içinde hex kullanma. Satırlar eşit genişlikte
  olmalı (`tests/art/art.test.ts` denetler). Eklediğin her sprite'a `/art.html`'de bak.
- **Yeni düşman/yetenek = yeni ızgara + `ICONS`/`ENEMY_SPRITES` kaydı + tema kaydı.** Test, her
  yeteneğin simgesi ve her düşmanın sprite'ı olduğunu denetler.
- **Yumuşak degrade, bulanıklık, yuvarlak köşe yok.** Işık ve parlama `ditherDisc` (Bayer dither) ile,
  animasyonlar basamaklı (`steps()`, `Stepped` ease). Phaser `pixelArt: true` kalmalı.
- Palet adları: gece `n`, arduvaz `s/S`, kemik `b/B`, kor `e/E/Y`, pas `r/R`, yosun `m/M`, sis `f/F/G`,
  kurt `w/W`, ruh `c/C`, mürekkep `k`.
