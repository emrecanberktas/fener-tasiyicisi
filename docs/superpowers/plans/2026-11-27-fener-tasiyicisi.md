# Fener Taşıyıcısı — Uygulama Planı

> **Agentic çalışanlar için:** ZORUNLU ALT SKILL: Bu planı görev görev uygulamak için superpowers:subagent-driven-development (önerilen) ya da superpowers:executing-plans kullan. Adımlar takip için checkbox (`- [ ]`) sözdizimi kullanır.

**Hedef:** Tek elle, dikey ekranda, offline oynanan bir survivor-like + kalıcı RPG gelişimli mobil web oyunu (PWA) yapmak.

**Mimari:** Oyunun tüm kuralları `src/core/` altında, Phaser'dan bağımsız saf TypeScript olarak yazılır ve Vitest ile TDD edilir. Phaser yalnızca tur sahnesini (`src/game/`) çizer ve çalıştırır. Menüler (kamp, fener, ağaç, görevler, tur sonu, seviye kartı, HUD) canvas'ın üstünde vanilla TS ile kurulmuş DOM katmanıdır (`src/ui/`). İçerik veri tablolarında (`src/data/`), görünen her şey tema katmanında (`src/theme/`) durur.

**Teknoloji yığını:** TypeScript 5 (strict), Phaser 3 (^3.90), Vite, Vitest + happy-dom, idb-keyval, vite-plugin-pwa, @vite-pwa/assets-generator.

**Spec:** `docs/superpowers/specs/2026-11-27-fener-tasiyicisi-design.md`

## Genel Kısıtlar

- Dikey 9:16 referans çözünürlük: 540×960. Phaser ölçekleme `Scale.FIT`. CSS `env(safe-area-inset-*)` ile güvenli alanlara uyulur.
- Tüm etkileşim alanları ekranın alt ⅔'ünde. Duraklat düğmesi sağ altta.
- Tamamen offline. Ağ isteği yok.
- Kalıcı gelişim tam olarak 3 eksen: karakter seviyesi, fener parçaları, yetenek ağacı. Tek para birimi: **Kor** (`save.kor`).
- Yasak: enerji/can sınırı, bekleme sayacı, streak, kaçırma cezası, ekipman yükseltme sistemi, kırmızı nokta bildirimleri (tek öneri hariç).
- Tur hedef süresi 480 sn. Boss (`mistHeart`) 480. saniyede çıkar.
- Turda en fazla 4 aktif + 4 pasif yetenek. Her yetenek en fazla seviye 5.
- Envanter sınırı 30. Fener yuvaları: `hazne`, `cam`, `fitil`. 4 nadirlik (0-3). Her parça 1-2 özellik taşır.
- Idle deposu 48 saatte dolar. Tam depo = en iyi turun Kor'unun 3,5 katı. Negatif zaman farkı = 0.
- Her an 3 açık görev. Biten görevin yerine anında yenisi gelir.
- 3 bölge. Boss'u yenmek sonraki bölgeyi açar.
- Ölünce boss ödülü dışındaki tüm ödüller korunur.
- Tur durumu her 5 sn'de ve `visibilitychange → hidden` anında kaydedilir.
- Kayıt şeması sürümlü (`version: 1`). Depolama IndexedDB, yedeği localStorage. JSON olarak dışa ve içe aktarılabilir.
- Oyun mantığı (`src/core/`, `src/game/`) görünen metin ya da renk içermez. Hepsi `src/theme/` üzerinden kimlikle alınır.
- Hedef performans: orta seviye telefonda 60 fps, 300 canlı düşman.

## İnceleme Odağı

1. **Uygulama tur ortasında öldürülürse** (iOS arka planda kapatır): Tekrar açılınca "Devam et" çıkmalı ve tur son kayıttaki süre, seviye ve yeteneklerle sürmeli. Bunu Görev 10'daki serialize/deserialize gidiş-dönüş testi ve Görev 14'teki elle doğrulama sabitler.
2. **Bozuk ya da yabancı bir kayıt dosyası içe aktarılırsa:** Mevcut kayıt bozulmamalı, kullanıcı hata mesajı görmeli. Görev 3'teki `importSave` testleri sabitler.
3. **Telefon saati ileri ya da geri alınırsa:** İleri alınırsa birikim 48 saatle sınırlanmalı. Geri alınırsa 0 sayılmalı ve referans zaman `now`'a çekilmeli. Görev 7'deki testler sabitler.
4. **Envanter doluyken parça düşerse:** Parça sessizce kaybolmamalı. Takılı olmayanlar arasında en düşük güçlü parça otomatik eritilmeli ve Kor'u eklenmeli. Görev 5'teki test sabitler.
5. **Tek seferde birden çok seviye atlanırsa ya da seçilebilir yetenek kalmazsa:** Her seviye için ayrı kart gösterilmeli, boş kart ekranı asla çıkmamalı. Yetenek kalmadıysa yedek kartlar (iyileş / +Kor) çıkmalı. Görev 10'daki testler sabitler.

---

## Dosya yapısı

```
index.html
package.json  tsconfig.json  vite.config.ts  pwa-assets.config.ts
public/icon.svg
.github/workflows/deploy.yml
src/
  main.ts                      # giriş: store'u yükle, router'ı başlat
  core/
    rng.ts                     # tohumlu RNG (mulberry32)
    save/schema.ts             # SaveData tipi, varsayılan, migrate
    save/storage.ts            # SaveStore (IndexedDB + localStorage), export/import
    progression/account.ts     # hesap XP'si ve seviyesi
    progression/stats.ts       # PlayerStats = seviye + parçalar + ağaç
    progression/gear.ts        # parça üretme, takma, eritme, envanter sınırı
    progression/tree.ts        # yetenek ağacı düğüm açma
    progression/recommend.ts   # tek öneri
    idle.ts                    # kamp ateşi birikimi
    quests.ts                  # 3'lü kesintisiz görev akışı
    run/runState.ts            # tur durumu, XP, seviye kartları
    run/rewards.ts             # tur sonu ödülleri ve save'e uygulanması
    run/spawn.ts               # düşman çıkış hızı ve tür seçimi
    spatialGrid.ts             # çarpışma için ızgara
  data/
    types.ts  skills.ts  enemies.ts  zones.ts  gear.ts  tree.ts  quests.ts  player.ts
  theme/
    types.ts  fener.ts  index.ts   # kimlik → isim/açıklama/renk
  game/
    createRun.ts               # startRun(container, opts): RunHandle
    RunScene.ts                # Phaser sahnesi
    joystick.ts                # yüzen joystick matematiği
    textures.ts                # prosedürel dokular
    skills/*.ts                # her aktif yeteneğin davranışı
  app/
    store.ts                   # SaveData sahibi, update + kalıcılık
    router.ts                  # ekranlar arası geçiş
  ui/
    dom.ts  styles.css
    screens/camp.ts gear.ts tree.ts quests.ts settings.ts runEnd.ts levelUp.ts hud.ts resume.ts
tests/                          # src ile aynı yapıda *.test.ts
```

---

### Görev 1: Proje iskeleti ve tohumlu RNG

**Dosyalar:**
- Oluştur: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.ts`, `src/core/rng.ts`
- Test: `tests/core/rng.test.ts`

**Arayüzler:**
- Üretir: `interface Rng { next(): number; int(min: number, maxInclusive: number): number; pick<T>(items: readonly T[]): T; weightedIndex(weights: readonly number[]): number }`, `createRng(seed: number): Rng`

- [ ] **Adım 1: İskeleti kur.**
  - Vite `vanilla-ts` şablonu kullanılır.
  - Bağımlılıklar: `phaser@^3.90`, `idb-keyval`. Geliştirme bağımlılıkları: `vitest`, `happy-dom`, `vite-plugin-pwa`, `@vite-pwa/assets-generator`.
  - `tsconfig` `strict: true`, `noUncheckedIndexedAccess: true`.
  - `vite.config.ts` içinde `test: { environment: 'happy-dom' }`.
  - Script'ler: `dev` (`vite --host`), `build` (`tsc --noEmit && vite build`), `test` (`vitest run`).
  - `index.html` içinde `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">` ve `<div id="app">`.
- [ ] **Adım 2: Başarısız testi yaz.**

```ts
test('aynı tohum aynı diziyi üretir', () => {
  const a = createRng(42), b = createRng(42);
  expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
});
test('int sınırları kapsar', () => {
  const r = createRng(1);
  const vals = Array.from({ length: 1000 }, () => r.int(2, 4));
  expect(new Set(vals)).toEqual(new Set([2, 3, 4]));
});
test('weightedIndex sıfır ağırlığı asla seçmez', () => {
  const r = createRng(7);
  for (let i = 0; i < 200; i++) expect(r.weightedIndex([0, 1, 0])).toBe(1);
});
```

- [ ] **Adım 3:** `npm test` çalıştır. Beklenen: FAIL, `createRng` tanımsız.
- [ ] **Adım 4: Uygula.** `createRng` mulberry32 ile yazılır. `next()` [0,1) aralığında döner.
- [ ] **Adım 5:** `npm test && npm run build`. Beklenen: testler PASS, build hatasız.
- [ ] **Adım 6: Commit.** `git init` (repo yoksa), `git add -A && git commit -m "chore: proje iskeleti ve tohumlu RNG"`

### Görev 2: Veri tabloları ve tema katmanı

**Dosyalar:**
- Oluştur: `src/data/types.ts`, `src/data/skills.ts`, `src/data/enemies.ts`, `src/data/zones.ts`, `src/data/gear.ts`, `src/data/tree.ts`, `src/data/quests.ts`, `src/data/player.ts`, `src/theme/types.ts`, `src/theme/fener.ts`, `src/theme/index.ts`
- Test: `tests/data/data.test.ts`

**Arayüzler:**
- Üretir (`src/data/types.ts`):
  - `type SkillId = 'lightRing'|'sparkRain'|'chainLightning'|'orbitFlames'|'lightSpear'|'flare'|'wideLight'|'intenseFlame'|'lightStep'|'attraction'|'wick'|'amber'`
  - `interface SkillDef { id: SkillId; kind: 'active'|'passive'; maxLevel: 5; unlockAccountLevel: number; perLevel: Record<string, number>; base: Record<string, number> }`
  - `type EnemyId = 'mistBug'|'shadowWolf'|'mistGiant'|'mistSpirit'|'mistHeart'`
  - `interface EnemyDef { id: EnemyId; hp: number; speed: number; contactDamage: number; xpValue: number; isBoss: boolean; appearsAfterSec: number; spawnWeight: number; ranged?: { range: number; projectileDamage: number; cooldownSec: number } }`
  - `interface ZoneDef { index: 0|1|2; mult: number }`
  - `type GearSlot = 'hazne'|'cam'|'fitil'`, `type Rarity = 0|1|2|3`
  - `type StatKey = 'damagePct'|'areaPct'|'moveSpeedPct'|'maxHp'|'regen'|'xpGainPct'|'pickupRangePct'`
  - `interface GearItem { id: string; slot: GearSlot; rarity: Rarity; stats: Partial<Record<StatKey, number>> }`
  - `type RuleId = 'startWithTwoSkills'|'fourChoices'|'oneReroll'`
  - `interface TreeNodeDef { id: string; cost: number; requires: string[]; effect: { type: 'stat'; stat: StatKey; value: number } | { type: 'rule'; rule: RuleId } }`
  - `type QuestTemplate = { kind: 'kills'; target: number } | { kind: 'reachMinute'; minute: number } | { kind: 'skillLevel'; skillId: SkillId; level: number } | { kind: 'bossDefeated'; zoneIndex: number }`
  - `interface PlayerStats { maxHp: number; regen: number; damageMult: number; areaMult: number; moveSpeedMult: number; xpGainMult: number; pickupRangeMult: number; rules: RuleId[] }`
- Üretir: `SKILLS: Record<SkillId, SkillDef>`, `ENEMIES: Record<EnemyId, EnemyDef>`, `ZONES: readonly ZoneDef[]`, `TREE: readonly TreeNodeDef[]`, `PLAYER_BASE`, `GEAR_STAT_BASE: Record<StatKey, number>`, `GEAR_SLOT_STATS: Record<GearSlot, StatKey[]>`
- Üretir (`src/theme/index.ts`): `theme: Theme`. `interface Theme { name: string; skills: Record<SkillId, { name: string; desc: (level: number) => string }>; enemies: Record<EnemyId, { name: string; color: number; radius: number }>; zones: Record<0|1|2, { name: string; bg: number; fog: number }>; slots: Record<GearSlot, string>; rarities: [string, string, string, string]; rarityColors: [number, number, number, number]; stats: Record<StatKey, string>; treeNodes: Record<string, string>; ui: Record<string, string> }`

Değerler (builder sonradan dengeleyebilir, ama test edilen kısıtlar sabit):
- **Yetenek açılma seviyeleri:**
  - Seviye 1: `lightRing`, `sparkRain`, `orbitFlames`, `wideLight`, `intenseFlame`, `lightStep`
  - `attraction` 2, `lightSpear` 3, `wick` 4, `chainLightning` 5, `amber` 6, `flare` 8
- **Oyuncu temel değerleri:** `PLAYER_BASE = { maxHp: 100, moveSpeed: 140, ringRadius: 70, ringDps: 12, pickupRange: 50, regen: 0 }`
- **Düşmanlar:**

| id | hp | speed | contactDamage | xpValue | appearsAfterSec | spawnWeight | ek |
|---|---|---|---|---|---|---|---|
| mistBug | 10 | 40 | 5 | 1 | 0 | 10 | |
| shadowWolf | 6 | 110 | 4 | 1 | 60 | 4 | |
| mistGiant | 80 | 25 | 15 | 5 | 150 | 2 | |
| mistSpirit | 15 | 35 | 3 | 2 | 240 | 2 | ranged {220, 6, 2} |
| mistHeart | 3000 | 30 | 25 | 0 | 480 | 0 | isBoss |

- **Bölgeler:** `ZONES` çarpanları `[1, 1.8, 3]`.
- **Ağaç:** 20 düğüm.
  - İlk 5 düğüm `requires: []` ya da zincir halinde, maliyetleri `50, 80, 120, 160, 200`.
  - Kural düğümleri tam 3 tane: `startWithTwoSkills`, `fourChoices`, `oneReroll`.
  - Kalan düğümlerin maliyetleri artan sırada, 1500'ü geçmez.

- [ ] **Adım 1: Başarısız testi yaz.**

```ts
test('tam 12 yetenek, 6 aktif 6 pasif', () => {
  const all = Object.values(SKILLS);
  expect(all).toHaveLength(12);
  expect(all.filter(s => s.kind === 'active')).toHaveLength(6);
});
test('ağaç 20 düğüm, 3 kural düğümü, gereksinimler var olan düğümleri gösterir', () => {
  expect(TREE).toHaveLength(20);
  expect(TREE.filter(n => n.effect.type === 'rule')).toHaveLength(3);
  const ids = new Set(TREE.map(n => n.id));
  TREE.forEach(n => n.requires.forEach(r => expect(ids.has(r)).toBe(true)));
});
test('ilk 5 düğüm ortalama bir bölge-1 turundan (≈280 Kor) ucuz', () => {
  expect(TREE.slice(0, 5).map(n => n.cost)).toEqual([50, 80, 120, 160, 200]);
});
test('her veri kimliğinin tema karşılığı var', () => {
  Object.keys(SKILLS).forEach(id => expect(theme.skills[id as SkillId].name).toBeTruthy());
  Object.keys(ENEMIES).forEach(id => expect(theme.enemies[id as EnemyId]).toBeDefined());
  TREE.forEach(n => expect(theme.treeNodes[n.id]).toBeTruthy());
  expect(Object.keys(theme.zones)).toHaveLength(3);
});
```

- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: Tabloları ve `fener` temasını yaz.**
  - Bölge isimleri: Sisli Orman, Batık Köy, Kül Vadisi.
  - Yuva isimleri: Hazne, Cam, Fitil.
  - Yetenek isimleri spec 7.3'teki gibi.
  - `src/theme/index.ts` `export const theme = fener;` yapar.
- [ ] **Adım 4:** `npm test`. Beklenen: PASS.
- [ ] **Adım 5: Commit.** `feat: veri tabloları ve tema katmanı`

### Görev 3: Kayıt şeması, depolama, dışa/içe aktarma

**Dosyalar:**
- Oluştur: `src/core/save/schema.ts`, `src/core/save/storage.ts`
- Test: `tests/core/save.test.ts`

**Arayüzler:**
- Tüketir: `GearItem`, `GearSlot`, `SkillId`, `QuestTemplate` (Görev 2)
- Üretir:
  - `CURRENT_VERSION = 1`
  - `interface Quest { id: string; template: QuestTemplate; progress: number; reward: { kor: number } | { gearMinRarity: Rarity } }`
  - `interface SaveData { version: 1; kor: number; account: { level: number; xp: number }; gear: { inventory: GearItem[]; equipped: Record<GearSlot, string | null> }; tree: { unlocked: string[] }; zones: { unlockedIndex: number; bossesDefeated: number[] }; bestRunKor: number; idle: { lastCollectedAt: number }; quests: { active: Quest[]; counter: number }; activeRun: RunState | null; settings: { vibration: boolean } }`
  - `RunState` tipi Görev 10'da tanımlanır. Bu görevde `activeRun: unknown | null` olarak kalır, Görev 10'da daraltılır.
  - `createDefaultSave(now: number): SaveData`
  - `class SaveFormatError extends Error`
  - `migrateSave(raw: unknown): SaveData`: Geçersizse `SaveFormatError` fırlatır. Sürüm 1 için alanları doğrular, eksik isteğe bağlı alanları varsayılanla doldurur.
  - `interface SaveStore { load(): Promise<SaveData | null>; save(data: SaveData): Promise<void> }`
  - `createSaveStore(backend?: { idb?: boolean }): SaveStore`: idb-keyval anahtarı `'fener.save'`. IndexedDB açılamazsa localStorage'da aynı anahtar kullanılır.
  - `exportSave(data: SaveData): string`
  - `importSave(json: string): SaveData`

- [ ] **Adım 1: Başarısız testi yaz.**

```ts
test('varsayılan kayıt geçerli ve sıfırdan başlar', () => {
  const s = createDefaultSave(1000);
  expect(s).toMatchObject({ version: 1, kor: 0, account: { level: 1, xp: 0 }, bestRunKor: 0, idle: { lastCollectedAt: 1000 } });
  expect(s.gear.equipped).toEqual({ hazne: null, cam: null, fitil: null });
});
test('export → import gidiş-dönüş aynı veriyi verir', () => {
  const s = { ...createDefaultSave(5), kor: 321 };
  expect(importSave(exportSave(s))).toEqual(s);
});
test.each(['', 'not json', '{"version":99}', '{"version":1,"kor":"çok"}', '[]'])(
  'geçersiz içe aktarma SaveFormatError fırlatır: %s',
  (bad) => expect(() => importSave(bad)).toThrow(SaveFormatError));
test('IndexedDB yoksa localStorage yedeğine yazar ve okur', async () => {
  const store = createSaveStore({ idb: false });
  const s = { ...createDefaultSave(1), kor: 9 };
  await store.save(s);
  expect(await store.load()).toEqual(s);
});
```

- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: Uygula.** `importSave` önce `JSON.parse` yapar, sonra `migrateSave` çağırır. Parse hatası da `SaveFormatError`'a çevrilir.
- [ ] **Adım 4:** `npm test`. Beklenen: PASS.
- [ ] **Adım 5: Commit.** `feat: sürümlü kayıt ve depolama`

### Görev 4: Hesap seviyesi ve oyuncu istatistikleri

**Dosyalar:**
- Oluştur: `src/core/progression/account.ts`, `src/core/progression/stats.ts`
- Test: `tests/core/progression/account.test.ts`, `tests/core/progression/stats.test.ts`

**Arayüzler:**
- Üretir:
  - `accountXpToNext(level: number): number` = `Math.round(100 * level ** 1.5)`
  - `addAccountXp(save: SaveData, xp: number): SaveData`: Birden fazla seviye atlatabilir.
  - `unlockedSkills(save: SaveData): SkillId[]`: `unlockAccountLevel <= save.account.level` olanlar.
  - `computePlayerStats(save: SaveData): PlayerStats`

İstatistik kuralları:
- **Seviye bonusu:** Seviye başına (1'in üstü) `+5 maxHp` ve `+%2 damage`.
- **Parça ve ağaç bonusları:** Takılı parçalar ve açılmış ağaç düğümleri özelliklere toplanarak eklenir. `*Pct` değerleri çarpanlara `1 + toplam/100` olarak çevrilir.
- **Kurallar:** Açılmış kural düğümleri `rules` listesine eklenir.

- [ ] **Adım 1: Başarısız testi yaz.**

```ts
test('XP eğrisi', () => { expect(accountXpToNext(1)).toBe(100); expect(accountXpToNext(4)).toBe(800); });
test('tek seferde birden çok seviye', () => {
  const s = addAccountXp(createDefaultSave(0), 100 + 283 + 50); // 1→2→3, 50 artık
  expect(s.account).toEqual({ level: 3, xp: 50 });
});
test('seviye 2 attraction yeteneğini açar', () => {
  const s = addAccountXp(createDefaultSave(0), 100);
  expect(unlockedSkills(s)).toContain('attraction');
  expect(unlockedSkills(createDefaultSave(0))).not.toContain('attraction');
});
test('istatistikler seviye + parça + ağaçtan toplanır', () => {
  const base = createDefaultSave(0);
  const s: SaveData = { ...base, account: { level: 3, xp: 0 },
    gear: { inventory: [{ id: 'g1', slot: 'cam', rarity: 0, stats: { damagePct: 10 } }], equipped: { hazne: null, cam: 'g1', fitil: null } } };
  const st = computePlayerStats(s);
  expect(st.maxHp).toBe(110);
  expect(st.damageMult).toBeCloseTo(1.14);
});
```

- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: Uygula.**
- [ ] **Adım 4:** `npm test`. Beklenen: PASS.
- [ ] **Adım 5: Commit.** `feat: hesap seviyesi ve oyuncu istatistikleri`

### Görev 5: Fener parçaları

**Dosyalar:**
- Oluştur: `src/core/progression/gear.ts`
- Test: `tests/core/progression/gear.test.ts`

**Arayüzler:**
- Tüketir: `Rng` (G1), `GEAR_STAT_BASE`, `GEAR_SLOT_STATS` (G2), `SaveData` (G3)
- Üretir:
  - `INVENTORY_CAP = 30`
  - `RARITY_WEIGHTS = [60, 28, 10, 2]`
  - `RARITY_MULT = [1, 1.5, 2.2, 3.2]`
  - `MELT_VALUE = [5, 12, 30, 80]`
  - `rollGear(rng: Rng, newId: () => string, opts?: { minRarity?: Rarity }): GearItem`: Yuva rastgele seçilir. Nadirlik 0-1 ise 1, 2-3 ise 2 farklı özellik o yuvanın `GEAR_SLOT_STATS` listesinden seçilir. Değer `GEAR_STAT_BASE[stat] * RARITY_MULT[rarity] * (0.8..1.2 arası rastgele)`, 1 ondalığa yuvarlanır.
  - `gearPower(item: GearItem): number`: Özellik değerlerinin `GEAR_STAT_BASE`'e oranlarının toplamı.
  - `addToInventory(save: SaveData, item: GearItem): { save: SaveData; autoMelted: GearItem | null }`
  - `equip(save: SaveData, itemId: string): SaveData`
  - `autoEquip(save: SaveData): SaveData`: Her yuvaya en yüksek güçlü parçayı takar.
  - `meltItems(save: SaveData, itemIds: string[]): SaveData`: Takılı parçalar eritilmez.
  - `bestUpgradeFor(save: SaveData): GearItem | null`: Takılıdan daha güçlü, takılı olmayan bir parça.

- [ ] **Adım 1: Başarısız testi yaz.**

```ts
test('minRarity uyulur, nadirlik 2+ iki özellik taşır', () => {
  const r = createRng(3); let n = 0;
  for (let i = 0; i < 100; i++) {
    const g = rollGear(r, () => `g${n++}`, { minRarity: 2 });
    expect(g.rarity).toBeGreaterThanOrEqual(2);
    expect(Object.keys(g.stats)).toHaveLength(2);
  }
});
test('envanter doluyken en zayıf takılı olmayan parça eritilir ve Kor eklenir', () => {
  let s = createDefaultSave(0);
  for (let i = 0; i < 30; i++) s = addToInventory(s, item(`g${i}`, 1, { maxHp: 10 + i })).save;
  s = equip(s, 'g0'); // en zayıf ama takılı → korunur
  const { save, autoMelted } = addToInventory(s, item('new', 1, { maxHp: 100 }));
  expect(autoMelted?.id).toBe('g1');
  expect(save.gear.inventory).toHaveLength(30);
  expect(save.kor).toBe(12);
});
test('takılı parça eritilmez', () => {
  let s = addToInventory(createDefaultSave(0), item('a', 0, { maxHp: 5 })).save;
  s = meltItems(equip(s, 'a'), ['a']);
  expect(s.gear.inventory.map(i => i.id)).toEqual(['a']);
});
test('autoEquip her yuvaya en güçlüsünü takar', () => { /* iki cam parçası, güçlü olan takılı */ });
```

(`item(id, rarity, stats, slot='cam')` test dosyasında yerel bir yardımcıdır.)

- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: Uygula.**
- [ ] **Adım 4:** `npm test`. Beklenen: PASS.
- [ ] **Adım 5: Commit.** `feat: fener parçaları`

### Görev 6: Yetenek ağacı

**Dosyalar:**
- Oluştur: `src/core/progression/tree.ts`
- Test: `tests/core/progression/tree.test.ts`

**Arayüzler:**
- Üretir:
  - `canUnlockNode(save: SaveData, nodeId: string): boolean`: Düğüm açık değilse, gereksinimleri açıksa ve `kor >= cost` ise true.
  - `unlockNode(save: SaveData, nodeId: string): SaveData`: Koşul sağlanmıyorsa `Error` fırlatır. Kor düşer.
  - `cheapestUnlockable(save: SaveData): TreeNodeDef | null`

- [ ] **Adım 1: Başarısız testi yaz.** Testler:
  - Kor yetmezse `canUnlockNode` false döner.
  - Gereksinim açık değilse false döner.
  - Açınca Kor düşer ve id `tree.unlocked`'a eklenir.
  - Aynı düğüm iki kez açılamaz.
  - `cheapestUnlockable`, 60 Kor ile `TREE[0]`'ı döner.
- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: Uygula.**
- [ ] **Adım 4:** `npm test`. Beklenen: PASS.
- [ ] **Adım 5: Commit.** `feat: yetenek ağacı`

### Görev 7: Kamp ateşi (idle)

**Dosyalar:**
- Oluştur: `src/core/idle.ts`
- Test: `tests/core/idle.test.ts`

**Arayüzler:**
- Üretir:
  - `IDLE_CAP_MS = 48 * 3600 * 1000`
  - `IDLE_FULL_MULT = 3.5`
  - `computeIdleKor(save: SaveData, now: number): number` = `floor(bestRunKor * IDLE_FULL_MULT * clamp(now - lastCollectedAt, 0, IDLE_CAP_MS) / IDLE_CAP_MS)`
  - `collectIdle(save: SaveData, now: number): SaveData`: Kor'u ekler. `lastCollectedAt = now` olur. `now < lastCollectedAt` ise de `lastCollectedAt = now` yapılır.
  - `idleFillRatio(save: SaveData, now: number): number` (0..1)

- [ ] **Adım 1: Başarısız testi yaz.**

```ts
const H = 3600_000;
const s = (best: number, last: number) => ({ ...createDefaultSave(last), bestRunKor: best });
test('24 saatte tam deponun yarısı', () => expect(computeIdleKor(s(200, 0), 24 * H)).toBe(350));
test('48 saatten sonrası birikmez', () => expect(computeIdleKor(s(200, 0), 500 * H)).toBe(700));
test('hiç tur yoksa birikim 0', () => expect(computeIdleKor(s(0, 0), 10 * H)).toBe(0));
test('saat geri alınırsa 0 ve referans now olur', () => {
  expect(computeIdleKor(s(200, 10 * H), 5 * H)).toBe(0);
  expect(collectIdle(s(200, 10 * H), 5 * H).idle.lastCollectedAt).toBe(5 * H);
});
test('toplama Kor ekler ve sayacı sıfırlar', () => {
  const r = collectIdle(s(200, 0), 48 * H);
  expect(r.kor).toBe(700); expect(computeIdleKor(r, 48 * H)).toBe(0);
});
```

- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: Uygula.**
- [ ] **Adım 4:** `npm test`. Beklenen: PASS.
- [ ] **Adım 5: Commit.** `feat: kamp ateşi birikimi`

### Görev 8: Görev akışı

**Dosyalar:**
- Oluştur: `src/core/quests.ts`
- Test: `tests/core/quests.test.ts`

**Arayüzler:**
- Tüketir: `Quest`, `SaveData` (G3), `Rng` (G1), `unlockedSkills` (G4)
- Üretir:
  - `ACTIVE_QUEST_COUNT = 3`
  - `type QuestEvent = { type: 'kills'; count: number } | { type: 'reachedSec'; sec: number } | { type: 'skillLevel'; skillId: SkillId; level: number } | { type: 'bossDefeated'; zoneIndex: number }`
  - `ensureQuests(save: SaveData, rng: Rng): SaveData`: 3'e tamamlar.
  - `applyQuestEvents(save: SaveData, events: QuestEvent[], rng: Rng, newId: () => string): { save: SaveData; completed: Quest[]; gear: GearItem[] }`: Ödüller otomatik verilir (Kor eklenir, parça `addToInventory` ile girer). Tamamlanan görevin yerine aynı çağrıda yenisi üretilir.
  - `generateQuest(save: SaveData, rng: Rng, id: string): Quest`

Görev üretme kuralları:
- `kills` hedefi `100 * account.level`, en fazla 2000. Görev oluşturulduktan sonraki öldürmeler sayılır.
- `reachMinute` 1..8 arası, ulaşılmış en yüksek bölgede.
- `skillLevel` açık yeteneklerden biri, seviye 3..5.
- `bossDefeated` yalnızca açık bir bölge için.
- Aynı anda iki aynı `kind` olmaz.
- Ödül:
  - %70 ihtimalle `{ kor: 40 * ZONES[unlockedIndex].mult }`
  - %30 ihtimalle `{ gearMinRarity: 1 }`

- [ ] **Adım 1: Başarısız testi yaz.**

```ts
test('her zaman tam 3 görev, kind tekrarı yok', () => {
  const q = ensureQuests(createDefaultSave(0), createRng(1)).quests.active;
  expect(q).toHaveLength(3);
  expect(new Set(q.map(x => x.template.kind)).size).toBe(3);
});
test('tamamlanan görevin yerine aynı anda yenisi gelir ve ödül verilir', () => {
  let s = ensureQuests(createDefaultSave(0), createRng(1));
  s = withQuest(s, { kind: 'kills', target: 100 }, { kor: 40 });
  const r = applyQuestEvents(s, [{ type: 'kills', count: 150 }], createRng(2), () => 'x');
  expect(r.completed).toHaveLength(1);
  expect(r.save.quests.active).toHaveLength(3);
  expect(r.save.kor).toBe(40);
});
test('ilerleme turlar arasında birikir', () => { /* 60 + 60 öldürme → 100'lük görev tamam */ });
```

- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: Uygula.**
- [ ] **Adım 4:** `npm test`. Beklenen: PASS.
- [ ] **Adım 5: Commit.** `feat: kesintisiz görev akışı`

### Görev 9: Tek öneri

**Dosyalar:**
- Oluştur: `src/core/progression/recommend.ts`
- Test: `tests/core/progression/recommend.test.ts`

**Arayüzler:**
- Tüketir: `bestUpgradeFor` (G5), `cheapestUnlockable` (G6)
- Üretir: `type Recommendation = { kind: 'betterGear'; itemId: string } | { kind: 'unlockNode'; nodeId: string } | { kind: 'newZone'; zoneIndex: number }`, `getRecommendation(save: SaveData): Recommendation | null`
- Öncelik sırası: `betterGear` > `unlockNode` > `newZone`. `newZone` ancak açılmış ama boss'u yenilmemiş bölge en yüksek bölge değilse önerilir. Hiçbiri yoksa `null` döner.

- [ ] **Adım 1: Başarısız testi yaz.** Testler:
  - Hiçbir şey yoksa `null`.
  - Daha iyi parça ve açılabilir düğüm birlikte varsa `betterGear`.
  - Yalnızca Kor varsa `unlockNode` ve id `TREE[0].id`.
- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: Uygula.**
- [ ] **Adım 4:** `npm test`. Beklenen: PASS.
- [ ] **Adım 5: Commit.** `feat: tek öneri`

### Görev 10: Tur durumu ve ödüller

**Dosyalar:**
- Oluştur: `src/core/run/runState.ts`, `src/core/run/rewards.ts`
- Değiştir: `src/core/save/schema.ts` (`activeRun: RunState | null`, migrate'te `isRunState` kontrolü)
- Test: `tests/core/run/runState.test.ts`, `tests/core/run/rewards.test.ts`

**Arayüzler:**
- Üretir (`runState.ts`):
  - `RUN_TARGET_SEC = 480`
  - `interface RunState { seed: number; zoneIndex: number; elapsedSec: number; level: number; xp: number; hp: number; kills: number; skills: Partial<Record<SkillId, number>>; pendingLevelUps: number; rerollsLeft: number; bossSpawned: boolean; playerX: number; playerY: number }`
  - `createRunState(seed: number, zoneIndex: number, stats: PlayerStats, unlocked: SkillId[]): RunState`: `lightRing: 1` ile başlar. `startWithTwoSkills` kuralı varsa açık aktiflerden rastgele bir tane daha seviye 1 eklenir. `oneReroll` varsa `rerollsLeft = 1`.
  - `xpToNextLevel(level: number): number` = `5 + 4 * level`
  - `addRunXp(state: RunState, amount: number): RunState`: Fazla XP birden çok `pendingLevelUps` üretir.
  - `type LevelUpChoice = { type: 'skill'; skillId: SkillId; newLevel: number } | { type: 'fallback'; kind: 'heal' | 'kor' }`
  - `rollLevelUpChoices(state: RunState, rng: Rng, unlocked: SkillId[], count: 3 | 4): LevelUpChoice[]`
    - Uygun olanlar: sahip olunan ve seviyesi 5'ten küçük yetenekler, ya da yuva varsa (aktif < 4, pasif < 4) açık ama sahip olunmayan yetenekler.
    - Tekrarsız `count` kadar seçilir. Uygun olan azsa yalnızca onlar döner.
    - Hiç uygun yoksa `[heal, kor]` döner.
  - `applyLevelUpChoice(state: RunState, choice: LevelUpChoice, stats: PlayerStats): { state: RunState; bonusKor: number }`
    - `heal` canı `stats.maxHp * 0.3` kadar doldurur, `kor` `bonusKor: 20` döner.
    - `pendingLevelUps` 1 azalır.
  - `isRunState(x: unknown): x is RunState`
- Üretir (`rewards.ts`):
  - `interface RunResult { zoneIndex: number; survivedSec: number; kills: number; bossDefeated: boolean; skills: Partial<Record<SkillId, number>>; bonusKor: number }`
  - `interface RunRewards { kor: number; accountXp: number; gear: GearItem[] }`
  - `computeRunRewards(result: RunResult, rng: Rng, newId: () => string): RunRewards`
    - `m = ZONES[zoneIndex].mult`
    - `kor = floor(kills * 0.5 * m) + floor(survivedSec / 60) * 10 * m + bonusKor + (bossDefeated ? 100 * m : 0)`, en sonda floor
    - `accountXp = kills + floor(survivedSec)`
    - Parça: `1 + floor(survivedSec / 120)` tane `rollGear`. Boss yenildiyse ayrıca 1 tane `minRarity: 2`.
  - `applyRunRewards(save: SaveData, result: RunResult, rewards: RunRewards): { save: SaveData; autoMelted: GearItem[] }`
    - Kor ve hesap XP'si eklenir, parçalar `addToInventory` ile girer.
    - `bestRunKor = max(bestRunKor, rewards.kor)`
    - Boss yenildiyse `unlockedIndex = min(2, max(unlockedIndex, zoneIndex + 1))` ve `bossesDefeated` güncellenir.
    - `activeRun = null` olur.
    - İlk kez `bestRunKor > 0` olduğunda `idle.lastCollectedAt` dokunulmaz (birikim zaten 48 saatle sınırlı).

- [ ] **Adım 1: Başarısız testi yaz.**

```ts
test('tek seferde çok XP birden çok seviye kartı kuyruğa alır', () => {
  const s = addRunXp(createRunState(1, 0, stats, unlocked), 9 + 13 + 1); // L1→2 (9), L2→3 (13)
  expect(s.level).toBe(3); expect(s.pendingLevelUps).toBe(2); expect(s.xp).toBe(1);
});
test('aktif yuvalar doluysa yeni aktif önerilmez', () => {
  const st = { ...base, skills: { lightRing: 1, sparkRain: 1, orbitFlames: 1, lightSpear: 1 } };
  const ch = rollLevelUpChoices(st, createRng(1), ALL_SKILLS, 3);
  ch.forEach(c => c.type === 'skill' && !(c.skillId in st.skills) && expect(SKILLS[c.skillId].kind).toBe('passive'));
});
test('her şey max ise yedek kartlar gelir, asla boş liste dönmez', () => {
  const maxed = { ...base, skills: Object.fromEntries(eightSkills.map(id => [id, 5])) };
  expect(rollLevelUpChoices(maxed, createRng(1), ALL_SKILLS, 3)).toEqual([{ type: 'fallback', kind: 'heal' }, { type: 'fallback', kind: 'kor' }]);
});
test('serialize gidiş-dönüş', () => {
  const s = createRunState(9, 1, stats, unlocked);
  const back = JSON.parse(JSON.stringify(s));
  expect(isRunState(back)).toBe(true); expect(back).toEqual(s);
});
test('ölüm: boss ödülü hariç her şey korunur', () => {
  const r = computeRunRewards({ zoneIndex: 0, survivedSec: 300, kills: 400, bossDefeated: false, skills: {}, bonusKor: 0 }, createRng(1), id);
  expect(r.kor).toBe(200 + 50); expect(r.accountXp).toBe(700); expect(r.gear).toHaveLength(3);
});
test('boss yenilince bonus, nadir parça ve sonraki bölge', () => {
  const res = { zoneIndex: 0, survivedSec: 480, kills: 400, bossDefeated: true, skills: {}, bonusKor: 0 };
  const rw = computeRunRewards(res, createRng(1), id);
  expect(rw.kor).toBe(200 + 80 + 100);
  expect(rw.gear.some(g => g.rarity >= 2)).toBe(true);
  expect(applyRunRewards(createDefaultSave(0), res, rw).save.zones.unlockedIndex).toBe(1);
});
```

- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: Uygula.** Ardından `schema.ts`'te `activeRun` tipini daralt.
- [ ] **Adım 4:** `npm test`. Beklenen: PASS (Görev 3 testleri dahil).
- [ ] **Adım 5: Commit.** `feat: tur durumu ve ödüller`

### Görev 11: Düşman çıkışı ve çarpışma ızgarası

**Dosyalar:**
- Oluştur: `src/core/run/spawn.ts`, `src/core/spatialGrid.ts`
- Test: `tests/core/run/spawn.test.ts`, `tests/core/spatialGrid.test.ts`

**Arayüzler:**
- Üretir:
  - `MAX_ALIVE = 300`
  - `BOSS_AT_SEC = 480`
  - `spawnRatePerSec(elapsedSec: number, zoneIndex: number): number` = `(1 + elapsedSec / 40) * ZONES[zoneIndex].mult`
  - `pickEnemyType(rng: Rng, elapsedSec: number): EnemyId`: Boss dışındaki, `appearsAfterSec <= elapsedSec` olan düşmanlar arasından `spawnWeight` ile seçer.
  - `class SpatialGrid { constructor(cellSize: number); clear(): void; insert(id: number, x: number, y: number): void; queryRadius(x: number, y: number, r: number): number[] }`: Sonuç, yarıçap içindeki hücrelerin adaylarıdır. Kesin mesafe kontrolünü çağıran yapar.

- [ ] **Adım 1: Başarısız testi yaz.** Testler:
  - `pickEnemyType(rng, 30)` 200 denemede yalnızca `mistBug` döner.
  - 300. saniyede `mistHeart` asla dönmez, `mistSpirit` en az bir kez döner.
  - `spawnRatePerSec(40, 2)` → 6.
  - Izgara: (0,0) ve (500,500) eklenir, `queryRadius(0,0,50)` 1. id'yi içerir, 2.'yi içermez.
- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: Uygula.**
- [ ] **Adım 4:** `npm test`. Beklenen: PASS.
- [ ] **Adım 5: Commit.** `feat: düşman çıkışı ve çarpışma ızgarası`

### Görev 12: Tur sahnesi — hareket, Işık Halkası, düşmanlar, boss

**Dosyalar:**
- Oluştur: `src/game/joystick.ts`, `src/game/textures.ts`, `src/game/RunScene.ts`, `src/game/createRun.ts`, `src/game/skills/types.ts`, `src/game/skills/lightRing.ts`
- Değiştir: `src/main.ts` (geçici: `?dev=run` ile doğrudan tur başlatma)
- Test: `tests/game/joystick.test.ts`

**Arayüzler:**
- Tüketir: `RunState`, `addRunXp`, `RUN_TARGET_SEC` (G10), `spawnRatePerSec`, `pickEnemyType`, `MAX_ALIVE`, `BOSS_AT_SEC`, `SpatialGrid` (G11), `PLAYER_BASE`, `ENEMIES`, `ZONES` (G2), `theme` (G2)
- Üretir:
  - `joystickVector(origin: {x: number; y: number}, pointer: {x: number; y: number}, radius: number): {x: number; y: number}`: Uzunluğu ≤ 1. Ölü bölge 0.1, altında `{0,0}`.
  - `isInJoystickZone(y: number, screenHeight: number): boolean` = `y >= screenHeight / 3`
  - `interface HudState { elapsedSec: number; level: number; xpRatio: number; hpRatio: number; bossHpRatio: number | null }`
  - `interface RunOptions { state: RunState; stats: PlayerStats; unlocked: SkillId[]; onHud(h: HudState): void; onLevelUp(choices: LevelUpChoice[]): void; onAutosave(s: RunState): void; onEnd(result: RunResult): void }`
  - `interface RunHandle { pause(): void; resume(): void; chooseLevelUp(c: LevelUpChoice): void; reroll(): void; destroy(): void }`
  - `startRun(container: HTMLElement, opts: RunOptions): RunHandle`
  - `interface SkillBehavior { update(dtSec: number, ctx: SkillContext): void; destroy(): void }`
  - `interface SkillContext { player: {x: number; y: number}; level: number; stats: PlayerStats; enemiesNear(x: number, y: number, r: number): EnemyRef[]; damage(e: EnemyRef, amount: number): void; scene: Phaser.Scene }`
  - `EnemyRef = { id: number; x: number; y: number }`

Sahne davranışı:
- **Dünya ve kamera:** Sınırsız düz dünya, kamera oyuncuyu takip eder. Arka plan rengi `theme.zones[zoneIndex].bg`. Ekranın kenarında bir sis vinyeti var.
- **Hareket:** Yüzen joystick. Basılan nokta joystick bölgesindeyse orijin olur. Hız `PLAYER_BASE.moveSpeed * stats.moveSpeedMult`.
- **Düşman çıkışı:** Düşmanlar ekran dışında, oyuncudan 600 px uzaklıkta rastgele açıda doğar. `spawnRatePerSec` birikimli olarak uygulanır ve `MAX_ALIVE` sınırını geçmez. Düşmanlar oyuncuya doğru yürür. Nesneler havuzdan alınır.
- **Işık Halkası:** Yarıçap `ringRadius * areaMult`. İçindeki her düşmana saniyede `ringDps * damageMult` hasar verir. Seviyeler spec 7.3'teki gibi alanı ve hasarı artırır.
- **Hasar alma:** Temas eden düşman `contactDamage` vurur. Oyuncu bundan sonra 0,5 sn hasar almaz.
- **Ölüm, XP ve skor:** Ölen düşman bir kıvılcım bırakır. Kıvılcım `pickupRange * pickupRangeMult` içindeyse oyuncuya çekilir, toplanınca `xpValue * xpGainMult` XP verir. `kills` artar.
- **Seviye kartı:** `pendingLevelUps > 0` olunca sahne duraklar ve `onLevelUp(rollLevelUpChoices(...))` çağrılır. Kart sayısı `fourChoices` kuralı varsa 4, yoksa 3.
- **Boss:** `elapsedSec >= BOSS_AT_SEC` ve `!bossSpawned` olunca boss doğar. Boss'un canı `hp * zone.mult`, `bossHpRatio` HUD'a gider.
- **Tur sonu:**
  - Boss ölünce `onEnd` çağrılır, `bossDefeated: true`.
  - `hp <= 0` olunca `onEnd` çağrılır, `bossDefeated: false`.
- **Uzak ranged düşmanlar:** `mistSpirit` menzildeyse mermi atar. Mermiler havuzdan alınır.
- **Can yenileme:** `regen` her saniye uygulanır.

- [ ] **Adım 1: Başarısız testi yaz.**

```ts
test('joystick vektörü 1 ile sınırlı', () => {
  const v = joystickVector({ x: 0, y: 0 }, { x: 300, y: 0 }, 60);
  expect(v.x).toBeCloseTo(1); expect(v.y).toBeCloseTo(0);
});
test('ölü bölge', () => expect(joystickVector({ x: 0, y: 0 }, { x: 3, y: 0 }, 60)).toEqual({ x: 0, y: 0 }));
test('joystick bölgesi alt ⅔', () => { expect(isInJoystickZone(100, 960)).toBe(false); expect(isInJoystickZone(400, 960)).toBe(true); });
```

- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: Uygula.** Önce `joystick.ts`, sonra sahne.
  - Dokular `textures.ts`'te `Graphics.generateTexture` ile prosedürel üretilir: parlayan daire, kıvılcım, düşman siluetleri (tema renk ve yarıçaplarıyla).
  - Fizik motoru kullanılmaz. Hareket ve çarpışma `SpatialGrid` ile elle yapılır.
- [ ] **Adım 4:** `npm test && npm run build`. Beklenen: PASS.
- [ ] **Adım 5: Elle doğrula.** `npm run dev`, telefonda ya da Chrome DevTools mobil emülasyonunda `/?dev=run` açılır. Şunlar görülmeli:
  - Başparmakla hareket ediliyor.
  - Halka düşmanları öldürüyor, kıvılcımlar toplanıyor.
  - Seviye atlayınca `onLevelUp` konsola yazılıyor (UI Görev 14'te gelir).
  - `/?dev=run&t=470` ile 10 sn sonra boss çıkıyor.
- [ ] **Adım 6: Commit.** `feat: tur sahnesi temel döngü`

### Görev 13: Diğer 11 yetenek

**Dosyalar:**
- Oluştur: `src/game/skills/sparkRain.ts`, `chainLightning.ts`, `orbitFlames.ts`, `lightSpear.ts`, `flare.ts`, `src/game/skills/registry.ts`
- Değiştir: `src/game/RunScene.ts` (yetenekleri `registry` üzerinden kur ve güncelle). `src/core/progression/stats.ts`'e `runStats(base: PlayerStats, skills: RunState['skills']): PlayerStats` eklenir: pasifler (`wideLight`, `intenseFlame`, `lightStep`, `attraction`, `wick`, `amber`) tur içi çarpanlara yansır.
- Test: `tests/core/progression/runStats.test.ts`

**Arayüzler:**
- Tüketir: `SkillBehavior`, `SkillContext` (G12), `SKILLS[...].base/perLevel` (G2)
- Üretir:
  - `createSkillBehavior(id: SkillId, scene: Phaser.Scene): SkillBehavior | null`: Pasifler için `null` döner.
  - `runStats(base: PlayerStats, skills: RunState['skills']): PlayerStats`

Pasif etkileri (seviye başına): `wideLight` alan +%10, `intenseFlame` hasar +%10, `lightStep` hız +%8, `attraction` toplama +%25, `wick` regen +0,5/sn, `amber` XP +%10.

- [ ] **Adım 1: Başarısız testi yaz.**

```ts
test('pasifler tur içi çarpanlara eklenir', () => {
  const s = runStats(baseStats, { intenseFlame: 3, wideLight: 2, wick: 2 });
  expect(s.damageMult).toBeCloseTo(baseStats.damageMult * 1.3);
  expect(s.areaMult).toBeCloseTo(baseStats.areaMult * 1.2);
  expect(s.regen).toBeCloseTo(baseStats.regen + 1);
});
```

- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: `runStats`'ı ve 5 aktif yetenek davranışını uygula.** Davranışlar spec 7.3'teki tanımlara uyar:
  - **sparkRain:** Periyodik olarak ekrandaki rastgele noktalara düşen alanlar.
  - **chainLightning:** En yakın düşmandan başlayıp `n` düşmana sıçrar.
  - **orbitFlames:** Oyuncunun etrafında dönen `n` alev.
  - **lightSpear:** En yakın düşmana delici bir atış.
  - **flare:** Periyodik alan patlaması.

  Seviye parametreleri `SKILLS[id].base/perLevel`'den okunur.
- [ ] **Adım 4:** `npm test && npm run build`. Beklenen: PASS.
- [ ] **Adım 5: Elle doğrula.** `/?dev=run&skills=all3` her yeteneği seviye 3 ile başlatır. Her biri ekranda görünür ve öldürür.
- [ ] **Adım 6: Commit.** `feat: yetenek davranışları`

### Görev 14: Seviye kartı, HUD, duraklatma, otomatik kayıt ve devam

**Dosyalar:**
- Oluştur: `src/ui/dom.ts`, `src/ui/styles.css`, `src/ui/screens/levelUp.ts`, `src/ui/screens/hud.ts`, `src/ui/screens/resume.ts`
- Değiştir: `src/game/RunScene.ts` (5 sn'de bir `onAutosave`, `visibilitychange` olunca duraklat + `onAutosave`)
- Test: `tests/ui/levelUp.test.ts`, `tests/ui/hud.test.ts`

**Arayüzler:**
- Tüketir: `RunHandle`, `HudState` (G12), `LevelUpChoice` (G10), `theme`
- Üretir:
  - `h(tag: string, props?: Record<string, unknown>, ...children: (Node | string)[]): HTMLElement`
  - `showLevelUp(root: HTMLElement, choices: LevelUpChoice[], state: RunState, opts: { rerollsLeft: number; onChoose(c: LevelUpChoice): void; onReroll(): void }): () => void`: Döndürdüğü fonksiyon overlay'i kaldırır.
  - `createHud(root: HTMLElement, opts: { onPause(): void }): { update(h: HudState): void; destroy(): void }`
  - `showResumePrompt(root: HTMLElement, opts: { onResume(): void; onAbandon(): void }): () => void`

Arayüz kuralları:
- **Seviye kartları:** Alt yarıda dikey sıralanır. Her kart en az 88 px yüksek, tamamı tıklanabilir. Kartta yetenek adı, `Sv N` ve `theme.skills[id].desc(N)` yazar. `rerollsLeft > 0` ise küçük bir "Yenile" düğmesi çıkar.
- **HUD:** Üstte süre (mm:ss), seviye ve XP çubuğu. Boss varken boss can çubuğu da çıkar. Sağ altta, güvenli alana uyan 56×56 duraklat düğmesi var.
- **Duraklat paneli:** "Devam" ve "Turu bitir" seçenekleri. "Turu bitir" ölüm gibi işlenir.

- [ ] **Adım 1: Başarısız testi yaz.**

```ts
test('her seçim için bir kart, tıklayınca onChoose', () => {
  const onChoose = vi.fn();
  showLevelUp(document.body, [skill('sparkRain', 1), skill('wick', 2), skill('lightRing', 3)], st, { rerollsLeft: 0, onChoose, onReroll: vi.fn() });
  const cards = document.querySelectorAll('[data-choice]');
  expect(cards).toHaveLength(3);
  (cards[1] as HTMLElement).click();
  expect(onChoose).toHaveBeenCalledWith(skill('wick', 2));
});
test('rerollsLeft 0 ise yenile düğmesi yok', () => expect(document.querySelector('[data-reroll]')).toBeNull());
test('HUD süreyi mm:ss gösterir', () => { const hud = createHud(document.body, { onPause: vi.fn() }); hud.update({ elapsedSec: 125, level: 4, xpRatio: .5, hpRatio: 1, bossHpRatio: null }); expect(document.body.textContent).toContain('02:05'); });
```

- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: Uygula.** Sahnedeki otomatik kayıt ve görünürlük işleyicisi de bu adımda eklenir.
- [ ] **Adım 4:** `npm test && npm run build`. Beklenen: PASS.
- [ ] **Adım 5: Elle doğrula.** Şunlar kontrol edilir:
  - Tur ortasında sekme değiştirilince oyun duruyor.
  - Sayfa yenilenince (G16'dan sonra kamptan) "Devam et" çıkıyor.
  - Tur son kayıttaki süre ve yeteneklerle sürüyor. Düşmanlar o anki süreye göre yeniden doğuyor.
- [ ] **Adım 6: Commit.** `feat: seviye kartı, HUD, duraklatma ve kayıt`

### Görev 15: Uygulama durumu, yönlendirici, tur sonu

**Dosyalar:**
- Oluştur: `src/app/store.ts`, `src/app/router.ts`, `src/ui/screens/runEnd.ts`
- Değiştir: `src/main.ts` (`?dev=run` geçici yolunu kaldır, store + router ile başlat)
- Test: `tests/app/store.test.ts`, `tests/app/runFlow.test.ts`

**Arayüzler:**
- Tüketir: Kayıt (G3), ödüller (G10), görevler (G8), `startRun` (G12), UI (G14)
- Üretir:
  - `interface Store { get(): SaveData; update(fn: (s: SaveData) => SaveData): Promise<void>; subscribe(fn: (s: SaveData) => void): () => void }`
  - `createStore(saveStore: SaveStore, now: () => number): Promise<Store>`: Kayıt yoksa `createDefaultSave(now())` + `ensureQuests` kullanılır.
  - `finishRun(save: SaveData, result: RunResult, rng: Rng, newId: () => string): { save: SaveData; rewards: RunRewards; completedQuests: Quest[]; autoMelted: GearItem[] }`
    - Sırayla `computeRunRewards` → `applyRunRewards` → `applyQuestEvents` çalışır.
    - Görev olayları: `kills`, `reachedSec`, sahip olunan her yetenek için `skillLevel`, boss yenildiyse `bossDefeated`.
  - `type Screen = 'camp' | 'gear' | 'tree' | 'quests' | 'settings' | 'run' | 'runEnd'`, `createRouter(root: HTMLElement, store: Store): { go(screen: Screen, params?: unknown): void }`
  - `showRunEnd(root: HTMLElement, data: { result: RunResult; rewards: RunRewards; completedQuests: Quest[] }, opts: { onCamp(): void; onAgain(): void }): () => void`

- [ ] **Adım 1: Başarısız testi yaz.**

```ts
test('finishRun ödülleri, en iyi turu ve görev ilerlemesini tek seferde uygular', () => {
  const s0 = ensureQuests(createDefaultSave(0), createRng(1));
  const r = finishRun(s0, { zoneIndex: 0, survivedSec: 480, kills: 400, bossDefeated: true, skills: { lightRing: 5 }, bonusKor: 0 }, createRng(2), seqId());
  expect(r.save.kor).toBeGreaterThanOrEqual(380);
  expect(r.save.bestRunKor).toBe(r.rewards.kor);
  expect(r.save.zones.unlockedIndex).toBe(1);
  expect(r.save.activeRun).toBeNull();
  expect(r.save.quests.active).toHaveLength(3);
});
test('store.update kalıcı hale getirir', async () => {
  const mem = memoryStore(); const st = await createStore(mem, () => 0);
  await st.update(s => ({ ...s, kor: 5 }));
  expect((await mem.load())?.kor).toBe(5);
});
```

- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: Uygula.**
  - Router `run` ekranında `startRun`'ı çağırır. `onAutosave` store'a `activeRun` olarak yazar. `onEnd` → `finishRun` → `runEnd` ekranı açılır.
  - Tur sonu ekranında süre, öldürme, Kor, hesap XP'si, düşen parçalar (nadirlik renkleriyle) ve tamamlanan görevler gösterilir. Altta "Kampa dön" ve "Tekrar dal" düğmeleri var.
- [ ] **Adım 4:** `npm test && npm run build`. Beklenen: PASS.
- [ ] **Adım 5: Commit.** `feat: uygulama durumu ve tur sonu akışı`

### Görev 16: Kamp ve menü ekranları

**Dosyalar:**
- Oluştur: `src/ui/screens/camp.ts`, `gear.ts`, `tree.ts`, `quests.ts`, `settings.ts`
- Test: `tests/ui/camp.test.ts`, `tests/ui/gear.test.ts`, `tests/ui/settings.test.ts`

**Arayüzler:**
- Tüketir: `Store`, `createRouter` (G15), `computeIdleKor`, `collectIdle`, `idleFillRatio` (G7), `getRecommendation` (G9), `equip`, `autoEquip`, `meltItems` (G5), `unlockNode`, `canUnlockNode` (G6), `exportSave`, `importSave` (G3)
- Üretir: Her ekran için `render<Name>(root: HTMLElement, ctx: { store: Store; go: (s: Screen, p?: unknown) => void; now: () => number }): () => void`

Ekranlar spec 7.9'daki taslağa göre:
- **Kamp:**
  - Üstte Kor miktarı.
  - Ortada kamp ateşi ve doluluk oranı. Birikim > 0 ise "+N Kor topla" düğmesi.
  - Tek öneri satırı. Dokununca ilgili ekrana gider.
  - Bölge seçici (açık bölgeler).
  - Altta büyük "Sise Dal" düğmesi ve sekmeler: Fener / Ağaç / Görevler.
  - Sağ üstte küçük ayarlar simgesi (tek el erişimi gerekmez, seyrek kullanılır).
  - `save.activeRun` varsa önce `showResumePrompt` açılır.
- **Fener:** 3 yuva, envanter listesi (güce göre sıralı), "Otomatik tak" ve çoklu seçimle "Erit" düğmeleri.
- **Ağaç:** Düğüm listesi. Durumlar: kilitli / açılabilir / açık. Açılabilir düğüm tek dokunuşla açılır.
- **Görevler:** 3 görev, ilerleme çubuklarıyla.
- **Ayarlar:** Kaydı dışa aktar (JSON dosyası indir ve panoya kopyala), içe aktar (dosya seç ya da yapıştır).
  - Hata varsa `theme.ui.importError` gösterilir ve mevcut kayıt korunur.
  - Başarılıysa onay istenir, sonra kayıt değiştirilir.

- [ ] **Adım 1: Başarısız testi yaz.**

```ts
test('birikim varsa topla düğmesi Kor ekler', async () => {
  const store = await storeWith({ bestRunKor: 200, idle: { lastCollectedAt: 0 } });
  renderCamp(document.body, { store, go: vi.fn(), now: () => 48 * H });
  (document.querySelector('[data-collect]') as HTMLElement).click();
  await flush();
  expect(store.get().kor).toBe(700);
});
test('öneri satırı tektir ve dokununca ilgili ekrana gider', async () => {
  const go = vi.fn(); renderCamp(document.body, { store: await storeWith({ kor: 60 }), go, now: () => 0 });
  expect(document.querySelectorAll('[data-recommendation]')).toHaveLength(1);
  (document.querySelector('[data-recommendation]') as HTMLElement).click();
  expect(go).toHaveBeenCalledWith('tree', expect.anything());
});
test('geçersiz içe aktarma mevcut kaydı bozmaz', async () => {
  const store = await storeWith({ kor: 77 });
  renderSettings(document.body, { store, go: vi.fn(), now: () => 0 });
  pasteImport('{"bozuk": true}');
  await flush();
  expect(store.get().kor).toBe(77);
  expect(document.body.textContent).toContain(theme.ui.importError);
});
test('fener: otomatik tak en güçlüyü yuvaya koyar', async () => { /* iki cam parçası */ });
```

- [ ] **Adım 2:** `npm test`. Beklenen: FAIL.
- [ ] **Adım 3: Uygula.** Tüm dokunma hedefleri en az 48×48 px. Ana eylemler ekranın alt ⅔'ünde. Yazı ve renkler `theme`'den gelir.
- [ ] **Adım 4:** `npm test && npm run build`. Beklenen: PASS.
- [ ] **Adım 5: Elle doğrula (tam döngü).** Kamp → Sise Dal → tur → ölüm → tur sonu → kamp. Kor artmış, parçalar envanterde, öneri güncellenmiş, görevler ilerlemiş olmalı.
- [ ] **Adım 6: Commit.** `feat: kamp ve menü ekranları`

### Görev 17: PWA, dağıtım ve performans kontrolü

**Dosyalar:**
- Oluştur: `public/icon.svg`, `pwa-assets.config.ts`, `.github/workflows/deploy.yml`
- Değiştir: `vite.config.ts` (VitePWA), `src/game/RunScene.ts` (`?perf=1`: 300 düşmanı hemen doğurur ve FPS sayacı gösterir)

Değerler:
- **Manifest:** `name: 'Fener Taşıyıcısı'`, `display: 'standalone'`, `orientation: 'portrait'`, `background_color` ve `theme_color` tema arka planı. İkonlar `@vite-pwa/assets-generator` `minimal2023Preset` ile `icon.svg`'den üretilir.
- **Service worker:** `registerType: 'autoUpdate'`. Tüm build çıktısı precache edilir.
- **Dağıtım:** `vite.config.ts` `base`, `process.env.BASE_PATH ?? '/'` olarak ayarlanır. GitHub Pages iş akışı `main`'e push'ta `npm ci && npm test && npm run build` çalıştırır ve `dist`'i yayınlar.

- [ ] **Adım 1:** PWA yapılandırmasını, ikonu ve iş akışını ekle.
- [ ] **Adım 2:** `npm run build && npx vite preview --host`. Beklenen:
  - `dist/manifest.webmanifest` ve `dist/sw.js` var.
  - Chrome DevTools → Application'da manifest hatasız, service worker aktif.
  - Network "Offline" yapılınca sayfa yenilenince oyun açılıyor.
- [ ] **Adım 3: Performans.** Telefonda `/?perf=1` açılır. Beklenen: 300 düşmanla FPS sayacı 60'a yakın (≥ 50 kabul).
  - Değilse profil alınır. İlk bakılacak yerler: havuzlama, ızgara hücre boyutu (≈ 64 px), her karede nesne oluşturma.
- [ ] **Adım 4: Telefonda kurulum.**
  - Android: Chrome → "Ana ekrana ekle".
  - iPhone: Safari → Paylaş → "Ana Ekrana Ekle".
  - Tam ekran ve dikey açılıyor, güvenli alanlar doğru olmalı.
- [ ] **Adım 5: Commit.** `feat: PWA ve dağıtım`

---

## Öz değerlendirme notları

- **Spec kapsamı:** 7.2 → G10, G12, G14 · 7.3 → G2, G13 · 7.4 → G2, G12 · 7.5 → G4, G5, G6, G9 · 7.6 → G7 · 7.7 → G8 · 7.8 → G10, G16 · 7.9 → G14, G15, G16 · 8.1-8.7 → G1, G2, G3, G12, G17.
- **Builder'a bırakılan denge:** Spec 10'daki iki hedef (her erken turdan sonra en az bir anlamlı gelişim, aynı bölgeyi 5'ten fazla tekrar etmeden ilerleme) G2'deki maliyet testi ve G16'nın tam döngü doğrulaması ile kontrol edilir. Kalanı oynayarak ayarlanır.
