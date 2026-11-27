# Fener Taşıyıcısı

Tek elle, dikey ekranda oynanan survivor-like + kalıcı RPG gelişimli kişisel mobil oyun (Phaser 3 + TypeScript + Vite, PWA).

- Tasarım: `docs/superpowers/specs/2026-11-27-fener-tasiyicisi-design.md`
- Plan: `docs/superpowers/plans/2026-11-27-fener-tasiyicisi.md` (Görev 1-12 tamam, sıradaki: Görev 13)
- İlerleme defteri: `.superpowers/` git'e girmiyor; durum bu README'de ve commit geçmişinde.

```bash
npm install
npm test          # 89 test
npm run dev       # aynı ağdaki telefondan: http://<bilgisayar-ip>:5173/?dev=run
```

Geliştirici parametreleri (`?dev=run` ile): `t=470` (boss'a 10 sn), `zone=1`, `level=8`.
Seviye kartları şimdilik otomatik ilk seçeneği seçer; arayüz Görev 14'te gelir.
