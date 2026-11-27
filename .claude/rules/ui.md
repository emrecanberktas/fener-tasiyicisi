# Arayüz kuralları

- **Tek el:** Ana eylemler ekranın alt ⅔'ünde (`.screen-actions`). Dokunma hedefi en az 48×48.
  Ayarlar gibi seyrek şeyler üstte kalabilir.
- **Metin `theme`'den gelir** (`theme.ui`, `theme.skills`…). Ekran kodunda sabit Türkçe metin yalnızca
  o ekrana özgü açıklama cümleleri için.
- **Yazım:** Cümle düzeni ("Sise dal", "Kampa dön"). Büyük harfli üst etiket, "A · B · C" gibi
  noktalı meta dizileri, "→/←" okları, tek kelimeyi renklendiren başlıklar kullanma. Butonlar ne
  yapacağını söyler ("En iyilerini tak", "3 parçayı erit, 42 Kor al").
- **Bileşen sınıfları:** `.px` pixel çerçeveli yüzey, `.btn-main` ana eylem (ekranda bir tane),
  `.btn-quiet` ikincil eylem, `.bar` + `.bar-fill.{xp,hp,boss}` segmentli çubuk, `icon(name, scale)`
  pixel simge. Yeni bir görsel dil icat etmeden önce bunları kullan.
- **Hareket:** Kendiliğinden oynayan animasyon yalnızca kamp ateşi ve yeni seviye noktası.
  `prefers-reduced-motion` altında kapatılır. Yeni sürekli animasyon ekleme.
- **Testler:** Her ekranın davranışı `tests/ui/`'da `data-*` seçicileriyle test edilir; seçicileri
  değiştirirsen testleri de güncelle.
