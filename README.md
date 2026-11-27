# Fener Taşıyıcısı

Tek elle, dikey ekranda oynanan survivor-like + kalıcı RPG gelişimli kişisel mobil oyun (Phaser 3 + TypeScript + Vite, PWA).

- Tasarım: `docs/superpowers/specs/2026-11-27-fener-tasiyicisi-design.md`
- Plan: `docs/superpowers/plans/2026-11-27-fener-tasiyicisi.md` (Görev 1-17 tamam)
- İlerleme defteri ve verilen kararlar: `docs/superpowers/progress.md` (evde devam ederken `.superpowers/sdd/2026-11-27-fener-tasiyicisi/progress.md` olarak kopyala).

```bash
npm install
npm test          # 124 test
npm run dev       # aynı ağdaki telefondan: http://<bilgisayar-ip>:5173/?dev=run
```

Telefonda: `npm run dev` sonrası aynı ağdan `http://<bilgisayar-ip>:5173/` → kamp ekranı.
`?perf=1` ile bir sonraki tur 300 düşmanla başlar ve FPS gösterir.

**GitHub Pages:** Repo → Settings → Pages → Source: *GitHub Actions*. `main`'e push edince
`https://emrecanberktas.github.io/fener-tasiyicisi/` adresine yayınlanır; telefonda açıp
"Ana ekrana ekle" ile uygulama gibi kurulur ve internetsiz çalışır.
