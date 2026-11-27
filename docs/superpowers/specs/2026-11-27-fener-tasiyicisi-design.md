# Fener Taşıyıcısı — Tasarım Dokümanı

- **Tarih:** 2026-11-27
- **Durum:** Onay bekliyor
- **Sahibi / tek oyuncusu:** Emre

---

## 1. Amaç ve neden

Emre'nin kendisi için oynayacağı bir mobil oyun. Yatarken ya da otobüste/metroda **tek elle** oynanacak. Oyunun merkezinde, MMORPG'lerden sevdiği **gelişim hissi** var.

Emre MMORPG'leri (Blade & Soul, Lost Ark, WoW) ve mobil RPG'leri bıraktı. Bırakma sebepleri:

- günlük görev ve chore yükü,
- oyunun zaman talep etmesi,
- tekdüzelik,
- yavaş ilerleme ve tıkanma noktaları,
- mobil oyunlardaki 20-25 ayrı yükseltme sistemi arasında kaybolmak,
- iki elle oynama ya da kafa yorma gerekmesi.

Bu oyun, o gelişim hissini bu yükler olmadan vermek için var. Oyun ticari değil, bu yüzden para kazandırma tasarımı tamamen dışarıda.

## 2. Hedefler

- Tek başparmakla, dikey ekranda, rahatça oynanabilmesi.
- Her oturumda hissedilir bir gelişim olması: "biraz daha güçlendim".
- 5-10 dakikalık turlar. Tur her an yarıda bırakılabilmeli ve kaldığı yerden devam etmeli.
- Kafa yormadan oynanabilmesi, ama tekdüze olmaması. Çeşitlilik düşünmekten değil, **sürprizden** gelmeli: rastgele yetenek kombinasyonları, eşya düşmesi.
- Offline iken de ilerleme: idle birikim.
- "Şimdi neyi geliştirmeliyim?" sorusunun her zaman tek ve net bir cevabı olması.

## 3. Hedef dışı (non-goals)

- Çok oyunculu oyun, sunucu, hesap sistemi, liderlik tablosu.
- Mağazaya yayınlama ya da ticari kullanım (v1 için).
- Hikâye anlatımı, ara sahneler, diyaloglar.
- Detaylı sprite animasyonu ve sanat üretimi (v1 için).

## 4. Anti-hedefler: oyun çalışsa bile başarısız sayılacak durumlar

- **Enerji ya da can sistemi.** Oynamayı herhangi bir şekilde sınırlayan her şey.
- **Bekleme sayaçları.** "Yeni görev için X saat sonra gel", "sandık 4 saatte açılır" gibi.
- **Kaçırma cezası.** Seriler (streak), kaybolan günlük ödüller, kısa sürede dolan idle depoları.
- **Sistem şişmesi.** 3'ten fazla kalıcı gelişim ekseni, ya da birden fazla ana para birimi.
- **Tıkanma duvarı.** İlerlemenin saatlerce grind gerektirecek şekilde durması.
- **İki el ya da hızlı refleks gerektiren kontroller.**

## 5. Kısıtlar

- Tek geliştirici: Emre, frontend geliştirici, TypeScript'e hâkim.
- Hedef cihaz: Emre'nin telefonu. Android ya da iPhone olduğu henüz belli değil. v1 her ikisinde de çalışmalı.
- Telefon dikey tutulacak. Tüm etkileşim alanları ekranın alt ⅔'ünde, başparmağın rahat eriştiği yerde olacak.
- Oyun tamamen offline çalışmalı.
- Tema sonradan değiştirilebilmeli (bkz. 8.4).

## 6. Yaklaşımlar

| Yol | Artısı | Eksisi |
|---|---|---|
| **A. TypeScript + Phaser + Vite, PWA olarak** | Emre'nin mevcut araçları. Telefon tarayıcısında linkle anında test edilebilir. Hem Android'de hem iPhone'da kurulum gerektirmez. Gerekirse sonradan Capacitor ile gerçek uygulamaya çevrilebilir. | Ekranda yüzlerce varlık olunca performans için nesne havuzu (pooling) gibi önlemler gerekir. Bir motor kadar rahat değildir. |
| B. Godot | 2D için yapılmış bir motor, performans ve mobil çıktı güçlü. | Yeni dil (GDScript) ve yeni editör. Sahne kurulumunun bir kısmı elle yapılır. Telefonda deneme döngüsü daha yavaş. iPhone'a kurulum zahmetli. |
| C. Unity | Çok güçlü. | Bu kapsam için ağır. B'nin verdiği her şeyi daha fazla zahmetle verir. |

**Seçilen: A.** Emre seçimi bana bıraktı. Gerekçem:

- Emre'nin her gün kullandığı araçlar.
- En hızlı deneme döngüsünü veriyor. "Metroda deneyip hissine bakmak" bu projede kritik.
- Telefon işletim sisteminden bağımsız.

## 7. Oyun tasarımı

### 7.1 Temel döngü

```
Kamp (ana ekran) → Sise Dal (tur, ~8 dk) → Tur sonu ödülleri → Kampta geliştir → tekrar
                     ↑                                                    │
              Offline iken kamp ateşi Kor biriktirir ←──────────────────┘
```

### 7.2 Tur (run)

- **Hedef süre:** 8 dakika. Süre dolunca bölgenin boss'u ("Sis Kalbi") çıkar. Boss'u yenmek turu kazandırır.
- **Ölüm:** Tur biter. O ana kadar toplanan ödüllerin **tamamı** korunur, yalnızca boss ödülü kaçar. Ölmenin cezası "daha az kazandım" olmalı, "kaybettim" olmamalı.
- **Kontrol:** Başparmak ekranın alt ⅔'ünde herhangi bir yere konur ve sürüklenir. Dokunulan noktada görünmez bir sanal joystick oluşur. Parmak kaldırılınca karakter durur. Bunun dışında hiçbir kontrol yok.
- **Temel saldırı — Işık Halkası:** Karakterin etrafındaki ışık halkasının içindeki düşmanlar sürekli hasar alır. Tema ile mekanik aynı şey.
- **Seviye atlama:** Düşmanlardan düşen kıvılcımlar (XP) toplanır. Seviye atlayınca oyun durur ve alt yarıda 3 büyük kart çıkar. Tek dokunuşla seçilir.
- **Duraklatma:**
  - Uygulama arka plana geçince otomatik duraklar.
  - Ekranın sağ alt köşesinde başparmakla erişilebilen bir duraklat düğmesi var.
- **Tur kaydı:** Her 5 saniyede bir ve arka plana geçişte tur durumu kaydedilir. Oyun tekrar açılınca "Devam et" seçeneği çıkar.
- **Zorluk:** Düşman sayısı ve türleri zamanla artar. Bölge numarası arttıkça temel zorluk da artar.

### 7.3 Yetenek havuzu (v1: 12 yetenek, her biri en fazla 5 seviye)

Bir turda en fazla 4 aktif ve 4 pasif yetenek taşınabilir.

| Aktif (ışık biçimleri) | Pasif |
|---|---|
| Işık Halkası (başlangıç) | Genişleyen Işık (alan) |
| Kıvılcım Yağmuru (rastgele düşen alevler) | Yoğun Alev (hasar) |
| Zincir Şimşek (düşmandan düşmana sıçrar) | Hafif Adım (hareket hızı) |
| Dönen Alevler (etrafında döner) | Çekim (toplama mesafesi) |
| Işık Mızrağı (en yakın düşmana delici atış) | Fitil (can yenileme) |
| Parlama (periyodik alan patlaması) | Kehribar (XP kazancı) |

Havuzun tamamı başta açık değil. Bazı yetenekler karakter seviyesiyle havuza eklenir (bkz. 7.5). Bu, çeşitliliği zamanla artırmak için.

### 7.4 Düşmanlar (v1)

| Düşman | Rol |
|---|---|
| Sis Böceği | Yavaş, kalabalık sürüler halinde gelir. |
| Gölge Kurt | Hızlı, az canlı. |
| Sis Devi | Yavaş, çok dayanıklı. |
| Sis Ruhu | Uzaktan yavaş mermi atar. |
| **Sis Kalbi (boss)** | 8. dakikada çıkar. Bölgeye göre güçlenir. |

### 7.5 Kalıcı gelişim: tam olarak 3 eksen ve 1 para birimi

Para birimi tek: **Kor.**

1. **Karakter seviyesi**
   - Her tur, hayatta kalınan süre ve öldürülen düşman sayısına göre hesap XP'si verir.
   - Her seviye küçük, sabit bir bonus verir: can ve hasar.
   - Bazı seviyeler yeni bir yeteneği havuza ekler.
   - Harcama ya da karar gerektirmez, kendiliğinden ilerler.
2. **Fener parçaları (ekipman)**
   - 3 yuva var: **Hazne, Cam, Fitil.**
   - Parçalar turlarda ve boss'tan düşer.
   - 4 nadirlik kademesi var. Her parçanın 1-2 özelliği olur.
   - Ekipmanı "yükseltme" sistemi **yok**. İlerleme daha iyi parça bulmaktan gelir.
   - Envanter en fazla 30 parça alır. Fazlası tek dokunuşla "eritilir" ve Kor'a dönüşür.
   - "Otomatik en iyisini tak" düğmesi var.
3. **Yetenek ağacı**
   - Yaklaşık 20 düğüm. Kor ile açılır.
   - Kalıcı özellik bonusları verir. Birkaç büyük düğüm de tur kurallarını değiştirir, örneğin "tura 2 yetenekle başla".

**"Şimdi ne geliştirmeliyim?" kuralı:** Kampta her zaman tek bir öneri vurgulanır. Örneğin "Ağaçta açılabilecek bir düğüm var" ya da "Daha iyi bir parça buldun". Başka hiçbir şey kırmızı nokta ya da bildirimle dikkat çekmez.

### 7.6 Idle: Kamp ateşi

- Kamp ateşi, oyuncunun **en iyi tur sonucuna** bağlı bir hızda Kor üretir: ulaşılan en yüksek bölge ve süre.
- Depo **48 saatte** dolar. Daha uzun süre girmemenin cezası yoktur, sadece birikim durur.
- Oyuna dönünce tek dokunuşla toplanır.
- Hedef denge (builder ayarlar): 48 saatlik tam depo yaklaşık 3-4 ortalama turun Kor'u etmeli. Idle aktif oyunu desteklemeli, onun yerini almamalı.
- Saat geri alınırsa ya da zaman farkı negatif çıkarsa birikim 0 sayılır.

### 7.7 Görev akışı

- Her an **3 açık görev** vardır.
- Biri tamamlanınca **anında** yenisi gelir. Günlük sıfırlama yok, sayaç yok, seri yok.
- Görevler normal oynarken kendiliğinden tamamlanır, örneğin "toplam 500 düşman", "bir turda 6. dakikaya ulaş", "Zincir Şimşek'i 3. seviyeye çıkar".
- Ödül Kor ya da fener parçasıdır.
- Girilmeyen sürede görevler olduğu gibi bekler.

### 7.8 Bölgeler

- v1'de 3 bölge var: **Sisli Orman, Batık Köy, Kül Vadisi.**
- Bir bölgenin boss'unu yenmek sonraki bölgeyi açar.
- Bölgeler bir gelişim ekseni değil, içerik ve zorluk basamağı.
- Bölgeler arasında renk paleti, düşman karışımı ve zorluk çarpanı değişir.

### 7.9 Ekranlar

**Kamp (ana ekran):**

```
┌─────────────────────┐
│  🔥 Kor: 1.240       │
│                     │
│      ( kamp ateşi )  │
│   +320 Kor topla ▸   │
│                     │
│  ★ Öneri: Ağaçta     │
│    yeni düğüm açık   │
│                     │
│  ┌───────────────┐  │
│  │   SİSE DAL ▸   │  │ ← büyük, başparmak bölgesinde
│  └───────────────┘  │
│ [Fener][Ağaç][Görev]│
└─────────────────────┘
```

**Tur:** Karanlık zemin üzerinde karakter ve ışık halkası. Üstte seviye, süre ve XP çubuğu. Sağ altta duraklat düğmesi.

**Seviye kartı:** Alt yarıda 3 dikey kart. Her kartta yetenek adı, yeni seviyesi ve tek satırlık etkisi yazar.

**Tur sonu:** Süre, öldürülen düşman sayısı, kazanılan Kor, hesap XP'si ve düşen parçalar listelenir. Altta "Kampa dön" ve "Tekrar dal" düğmeleri var.

## 8. Teknik tasarım

### 8.1 Yığın

- TypeScript (strict)
- Phaser'ın güncel kararlı sürümü
- Vite
- PWA (vite-plugin-pwa): offline çalışma ve ana ekrana ekleme

### 8.2 Ekran ve performans

- Dikey, 9:16 referans çözünürlük.
- Ölçekleme: FIT. Güvenli alanlara (çentik, alt çubuk) uyulur.
- Hedef: orta seviye bir telefonda 60 fps, aynı anda en az 300 düşman.
- Düşmanlar, mermiler ve kıvılcımlar için nesne havuzu kullanılır.
- Çarpışma için basit daire-daire kontrolü yapılır. Gerekirse ızgara tabanlı mekânsal bölümleme eklenir. Ağır bir fizik motoru kullanılmaz.

### 8.3 Veri odaklı içerik

Yetenekler, düşmanlar, bölgeler, görevler, ekipman özellikleri ve yetenek ağacı düğümleri tipli veri tablolarında (`src/data/`) tanımlanır. Oyun mantığı yalnızca bu kimliklere ve sayılara dayanır.

### 8.4 Tema katmanı

- Görünen isimler, metinler, renk paletleri ve görsel/ses dosya yolları `src/theme/` altında, kimlik → içerik eşlemesi olarak tutulur.
- Oyun mantığı tema dosyalarına doğrudan dokunmaz.
- Tema değişikliği yalnızca bu katmanın değiştirilmesi ve yeni görsellerin üretilmesiyle yapılabilmeli.

### 8.5 Görseller ve ses

- v1 görselleri prosedürel ya da basit şekiller olacak: parlayan daireler, siluetler, partiküller. Ayrı bir sanat üretim süreci yok.
- Karanlık zemin ile ışığın kontrastı oyunun ana estetiği.
- Ses v1'de isteğe bağlı.

### 8.6 Kayıt

- Kalıcı ilerleme ve aktif tur durumu IndexedDB'de tutulur. Yedek olarak localStorage kullanılır.
- Kayıt şeması sürümlüdür ve sürüm geçişleri desteklenir.
- Ayarlar ekranında **dışa aktar / içe aktar** (JSON) vardır. Tarayıcı depolamasının silinmesine karşı bir güvence.

### 8.7 Telefonda test ve dağıtım

- Geliştirme sırasında `vite --host` ile aynı ağdaki telefondan erişilir.
- Kalıcı kullanım için statik barındırma (örn. GitHub Pages) yapılır ve oyun ana ekrana eklenir.
- Gerekirse sonradan Capacitor ile Android APK ya da iOS uygulaması üretilebilir. Bu v1'in parçası değil.

## 9. Kapsam

**v1 (oynanabilir ilk sürüm):**
- Tur döngüsü
- 12 yetenek, 4 düşman ve 1 boss
- 3 bölge
- 3 kalıcı gelişim ekseni
- Kamp ateşi (idle)
- Görev akışı
- Kayıt, dışa ve içe aktarma
- PWA kurulumu

**v1 sonrası (fikir, söz değil):**
- Yeni bölgeler ve yetenekler
- Ses ve müzik
- Daha iyi görseller ya da yeni tema
- Capacitor ile uygulama paketi

## 10. Builder'a bırakılanlar

- Tüm sayısal denge: hasar, can, XP eğrisi, spawn eğrisi, Kor miktarları. Bunun için iki hedef var:
  - İlk turlarda her turdan sonra en az bir anlamlı gelişim olmalı.
  - Hiçbir noktada ilerlemek için aynı bölgeyi 5'ten fazla kez tekrar etmek gerekmemeli.
- Yetenek ağacının düğüm düzeni ve tam içeriği.
- Görev havuzunun içeriği.
- Prosedürel görsellerin ayrıntıları.
- Klasör yapısı ve test yaklaşımı.

## 11. Kimin kararı

**Emre'nin kararları:**
- Oyunun amacı, oynama anı ve tek elle oynanma şartı
- Gelişim hissi
- Sistem şişmesine, enerjiye ve bekleme sayaçlarına karşı olmak
- Görevlerin olabilmesi, ama yormaması ve bekletmemesi
- Survivor-like yön ve offline idle gelişim
- Temanın şimdilik "Fener Taşıyıcısı" olması

**Benim kararlarım (Emre itiraz edebilir):**
- Phaser + PWA
- 8 dakikalık tur ve 8. dakikada boss
- Ölünce ödüllerin korunması
- Sanal joystick kontrolü
- 12 yetenek, tek para birimi (Kor) ve ekipman yükseltmesinin olmaması
- 48 saatlik idle deposu
- 3'lü kesintisiz görev akışı
- 3 bölge
- Prosedürel görseller
- Kayıt dışa ve içe aktarma
