import { skillParam } from '../data/skills';
import type { Theme } from './types';

const p = skillParam;

export const fener: Theme = {
  name: 'Fener Taşıyıcısı',
  skills: {
    lightRing: { name: 'Işık Halkası', desc: l => `Etrafındaki ışık saniyede ${p('lightRing', 'dps', l)} hasar verir.` },
    sparkRain: { name: 'Kıvılcım Yağmuru', desc: l => `${p('sparkRain', 'count', l)} kıvılcım düşer, her biri ${p('sparkRain', 'damage', l)} hasar.` },
    chainLightning: { name: 'Zincir Şimşek', desc: l => `${p('chainLightning', 'jumps', l)} düşmana sıçrar, ${p('chainLightning', 'damage', l)} hasar.` },
    orbitFlames: { name: 'Dönen Alevler', desc: l => `Etrafında ${p('orbitFlames', 'count', l)} alev döner.` },
    lightSpear: { name: 'Işık Mızrağı', desc: l => `En yakın düşmana ${p('lightSpear', 'damage', l)} hasarlı delici atış.` },
    flare: { name: 'Parlama', desc: l => `Periyodik patlama: ${p('flare', 'damage', l)} hasar.` },
    wideLight: { name: 'Genişleyen Işık', desc: l => `Alan +%${10 * l}.` },
    intenseFlame: { name: 'Yoğun Alev', desc: l => `Hasar +%${10 * l}.` },
    lightStep: { name: 'Hafif Adım', desc: l => `Hareket hızı +%${8 * l}.` },
    attraction: { name: 'Çekim', desc: l => `Toplama mesafesi +%${25 * l}.` },
    wick: { name: 'Fitil', desc: l => `Saniyede ${0.5 * l} can yenile.` },
    amber: { name: 'Kehribar', desc: l => `XP kazancı +%${10 * l}.` },
  },
  enemies: {
    mistBug: { name: 'Sis Böceği', color: 0x5f7080, radius: 11 },
    shadowWolf: { name: 'Gölge Kurt', color: 0x5a4a78, radius: 14 },
    mistGiant: { name: 'Sis Devi', color: 0x5f7080, radius: 20 },
    mistSpirit: { name: 'Sis Ruhu', color: 0x6fb7b4, radius: 13 },
    mistHeart: { name: 'Sis Kalbi', color: 0x8aa0b0, radius: 40 },
  },
  zones: {
    0: { name: 'Sisli Orman', bg: 0x1a1f2b, fog: 0x1c2a24, groundTint: 0xd8f0d0 },
    1: { name: 'Batık Köy', bg: 0x161c2a, fog: 0x1a2533, groundTint: 0xc8d8ff },
    2: { name: 'Kül Vadisi', bg: 0x221a1c, fog: 0x2a1c18, groundTint: 0xffd0c0 },
  },
  slots: { hazne: 'Hazne', cam: 'Cam', fitil: 'Fitil' },
  rarities: ['Sıradan', 'Parlak', 'Nadir', 'Efsanevi'],
  rarityColors: [0xb8b8b8, 0x6fcf7a, 0x5aa9ff, 0xffb347],
  stats: {
    damagePct: 'Hasar %', areaPct: 'Alan %', moveSpeedPct: 'Hız %', maxHp: 'Can',
    regen: 'Yenilenme', xpGainPct: 'XP %', pickupRangePct: 'Toplama %',
  },
  treeNodes: {
    t01: 'Kor Kıvılcımı', t02: 'Sağlam Tutuş', t03: 'Geniş Cam', t04: 'Çevik Adım', t05: 'Mıknatıs Kül',
    t06: 'Bilge Alev', t07: 'İkinci Şans', t08: 'Keskin Işık', t09: 'Sıcak Kor', t10: 'Uzanan Işık',
    t11: 'Demir Hazne', t12: 'Çifte Başlangıç', t13: 'Kızgın Alev', t14: 'Parlak Zihin', t15: 'Rüzgâr Adımı',
    t16: 'Çekim Alanı', t17: 'Ebedi Kor', t18: 'Güneş Camı', t19: 'Dört Yol', t20: 'Sis Yakan',
  },
  ui: {
    dive: 'Sise dal', collect: 'Kor topla', resume: 'Kaldığım yerden devam et', abandon: 'Turu bitir, ödülleri al', pause: 'Duraklat',
    continue: 'Devam et', endRun: 'Turu bitir', camp: 'Kampa dön', again: 'Tekrar dal', reroll: 'Başka seçenekler',
    importError: 'Kayıt dosyası okunamadı. Mevcut kaydın korunuyor.', heal: 'İyileş', bonusKor: '+20 Kor',
  },
  player: { color: 0xe6d8b8, light: 0xf0a040 },
};
