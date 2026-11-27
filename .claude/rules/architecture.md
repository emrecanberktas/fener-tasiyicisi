# Mimari kuralları

- **Oyun kuralı = `src/core/`.** Hasar formülü, ödül, XP eğrisi, görev ilerlemesi gibi her kural saf
  fonksiyon olarak `core/`'da yazılır ve önce testi yazılır. `src/game/` yalnızca çizer, hareket ettirir
  ve `core/` fonksiyonlarını çağırır; kural içermez.
- **Kayıt şeması:** `SaveData` ya da `RunState`'e alan eklerken eski kayıtları kırma. Yeni alanı
  isteğe bağlı kabul et (`isRunState`/`migrateSave`) ve `normalizeRunState`/varsayılanla tamamla.
  Şemayı kıran bir değişiklikte `version`'ı artır ve göç (migration) yaz + test et.
- **Phaser yalnızca `src/game/` ve `src/app/router.ts`.** `src/ui/` ve `src/app/` içindeki diğer
  dosyalar Phaser'ı (dolaylı olarak bile) içe aktarmamalı; happy-dom testleri canvas olmadan çöker.
  Tur dışı eylemler `src/app/actions.ts`'te durur.
- **Store tek kaynak.** Ekranlar `ctx.store.update(fn)` ile değiştirir, `subscribe` ile yeniden çizer.
  `update` sırayla kalıcılaştırır; doğrudan `SaveStore.save` çağırma.
- **Phaser döngüsünden çıkış:** Sahne güncellemesinin içinden ekran değiştirecek bir şey çağrılacaksa
  `setTimeout(..., 0)` ile ertele (bkz. router `onEnd`).
- **Sayılar `src/data/`'da.** Denge değişikliği kod değil veri değişikliğidir; değeri değiştirince
  `tests/data/data.test.ts`'teki kısıtların hâlâ doğru olduğunu kontrol et.
