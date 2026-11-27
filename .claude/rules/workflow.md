# Çalışma akışı

- Önce test, sonra kod (TDD). Kırmızıyı gör, sonra yeşile çevir; `npm test` ve `npx tsc --noEmit` temiz.
- Görsel/sahne değişikliklerinde testin yetmediği yerde tarayıcıda bak: `npm run dev`, mümkünse telefonda.
- Plandan ya da spec'ten saptığında `docs/superpowers/progress.md`'ye bir satır yaz:
  `Ruling: <ne yaptın> — <neden> — <yanlışsa bedeli>`.
- Commit mesajları Türkçe, `feat:`/`fix:`/`docs:` önekli.
