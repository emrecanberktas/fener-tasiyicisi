import type { Grid } from './render';

/*
 * Elle çizilmiş pixel sprite'lar. Karakterler src/art/palette.ts içinde.
 * '.' saydam. Her satır aynı genişlikte olmalı (testler denetler).
 */

export const SPRITES: Record<string, Grid> = {
  // Fener taşıyıcısı: kapüşonlu pelerin, sağ elinde fener (sağa bakar).
  player: [
    '...kkkk....',
    '..kSSSSk...',
    '.kSssssSk..',
    '.kskbbksk..',
    '.ksbkbbsk..',
    '.kssbbssk..',
    'kSssssssk..',
    'kSsssssskk.',
    'kSssssssBkk',
    'kSsssssk.kEk',
    'kSssssskkEYEk',
    '.kssssssk.kEk',
    '.kssssssk..k',
    '.kssksssk...',
    '..kk.kkk....',
  ].map(r => r.padEnd(13, '.')),
  // Kıvılcım (XP): küçük kor taneciği.
  spark: [
    '.E.',
    'EYE',
    '.E.',
  ],
  // Sis ruhunun mermisi.
  bolt: [
    '.cc.',
    'cCCc',
    'cCCc',
    '.cc.',
  ],
  // Dönen alev.
  flame: [
    '..E..',
    '.EE..',
    '.EYE.',
    'EYYEe',
    'eEYEe',
    '.eEe.',
    '..r..',
  ],
  // Işık mızrağı (sağa doğru).
  spear: [
    '.........bk.',
    'BBBBBBBBbbbE',
    '.........bk.',
  ],
};

export const ENEMY_SPRITES: Record<string, Grid> = {
  // Sis böceği: küçük, kalabalık, soluk gözlü.
  mistBug: [
    '..kkkk..',
    '.kffffk.',
    'kfGfGffk',
    'kffffffk',
    'kfFffFfk',
    '.kkfkfk.',
    '.k.k.k..',
  ],
  // Gölge kurdu: alçak, uzun, kor gözlü.
  shadowWolf: [
    '..........kk..',
    'k........kWk..',
    'kWk.....kWWWk.',
    '.kWkkkkkkWWeWk',
    '.kWWWWWWWWWWWk',
    '.kwWWWWWWWWkk.',
    '.kwWkkkwWWk...',
    '.kWk..kWk.....',
    '.kk...kk......',
  ],
  // Sis devi: kambur, iri, ağır.
  mistGiant: [
    '....kkkkk.....',
    '...kfffffk....',
    '..kfGfffGfk...',
    '..kfffffffk...',
    '.kkfffkfffkk..',
    'kfffkfffffffk.',
    'kffkfffffffkfk',
    'kfk.kfffffk.kk',
    'kfk.kfffffk...',
    'kk..kfffffk...',
    '....kfffffk...',
    '...kffk.kffk..',
    '...kfk...kfk..',
    '..kkk...kkkk..',
  ],
  // Sis ruhu: süzülen soğuk alev.
  mistSpirit: [
    '...kk....',
    '..kcck...',
    '.kcCCck..',
    'kcCkCkck.',
    'kcCCCCck.',
    '.kcCCck..',
    '.kccccck.',
    '..kc.kcck',
    '..k...kc.',
    '.......k.',
  ],
};

/** 8×8 simgeler (yetenekler, sekmeler). */
export const ICONS: Record<string, Grid> = {
  lightRing: ['..eeee..', '.e....e.', 'e..EE..e', 'e.EYYE.e', 'e.EYYE.e', 'e..EE..e', '.e....e.', '..eeee..'],
  sparkRain: ['E.......', '.e...E..', '....e...', '.E......', '..e..E..', '......e.', 'E..E....', '.e..e..E'],
  chainLightning: ['....cC..', '...cC...', '..cCCc..', '....Cc..', '...Cc...', '..cC....', '.cC.....', '.C......'],
  orbitFlames: ['...E....', '..eE....', '.......E', 'E..bb..e', 'e..bb...', '.......e', '....Ee..', '....E...'],
  lightSpear: ['.......E', '......EY', '.....bE.', '....bb..', '...bb...', '..BB....', '.BB.....', 'B.......'],
  flare: ['E..E..E.', '.E.E.E..', '..EEE...', 'EEEYEEE.', '..EEE...', '.E.E.E..', 'E..E..E.', '........'],
  wideLight: ['e......e', '.e....e.', '..eEEe..', '..EYYE..', '..EYYE..', '..eEEe..', '.e....e.', 'e......e'],
  intenseFlame: ['...E....', '...EE...', '..EEe...', '..EYEe..', '.eEYYEe.', '.eEYYEe.', '.reEEer.', '..rrrr..'],
  lightStep: ['........', '....bb..', '...bbb..', '..bbbB..', '.bbbbB..', 'bbbbbB..', '........', 'MM.MM.MM'],
  attraction: ['.rr..rr.', '.RR..RR.', '.rr..rr.', '.rr..rr.', '.rr..rr.', '.rrrrrr.', '..rrrr..', '........'],
  wick: ['...E....', '..EYE...', '..EYE...', '...k....', '..bbb...', '..bbB...', '..bbB...', '.BBBBB..'],
  amber: ['...ee...', '..eEEe..', '.eEYEEe.', '.eEEEEe.', '.eEEEre.', '..eEre..', '...ee...', '........'],
  lantern: ['...kk...', '..k..k..', '.kSSSSk.', '.kSEESk.', '.kEYYEk.', '.kSEESk.', '.kSSSSk.', '..kkkk..'],
  tree: ['...mm...', '..mmmm..', '.mmMmmm.', '..mmmm..', '.mmmmMm.', 'mmMmmmmm', '...BB...', '..BBBB..'],
  scroll: ['.bbbbbb.', 'BbbbbbbB', '.bBBBBb.', '.bbbbbb.', '.bBBBbb.', '.bbbbbb.', 'BbbbbbbB', '.bbbbbb.'],
  cog: ['..b..b..', '.bbbbbb.', 'bbbBBbbb', '.bB..Bb.', '.bB..Bb.', 'bbbBBbbb', '.bbbbbb.', '..b..b..'],
  kor: ['...e....', '..eEe...', '.eEYEe..', 'eEYYYEe.', '.eEYEe..', '..eEe...', '...e....', '........'],
  hazne: ['..kkkk..', '.kBbbBk.', '.kbbbbk.', '.kbEEbk.', '.kbEEbk.', '.kbbbbk.', '.kBBBBk.', '..kkkk..'],
  cam: ['..kkkk..', '.kGGFFk.', 'kGG..FFk', 'kG....Fk', 'kF....Fk', 'kFF..FFk', '.kFFFFk.', '..kkkk..'],
  fitil: ['...E....', '..EYE...', '...E....', '...k....', '...k....', '..kBk...', '..kBk...', '..kkk...'],
};

/** Kamp ateşi: 3 kare, aynı boyutta. */
const FIRE_BASE = [
  '...rreeeerr...',
  '..kkkBkkBkkk..',
  '.kBbkkkkkkbBk.',
  'kkkk..kk..kkkk',
];
export const FIRE_FRAMES: Grid[] = [
  [
    '......E.......',
    '.....EE.......',
    '.....EEe......',
    '....eEYEe.....',
    '....eEYEe..E..',
    '...eEYYYEe....',
    '..eeEYYYEee...',
    '..reEEYYEEer..',
    '..reeEEEEeer..',
    ...FIRE_BASE,
  ],
  [
    '.......E......',
    '.......EE.....',
    '......eEE.....',
    '.....eEYEe....',
    '..E..eEYEe....',
    '....eEYYYEe...',
    '...eeEYYYEee..',
    '..reEEYYEEer..',
    '..reeEEEEeer..',
    ...FIRE_BASE,
  ],
  [
    '..............',
    '......E.......',
    '......EE......',
    '.....eEYe.....',
    '....eEYYEe....',
    '...eEYYYYEe...',
    '...eEYYYYEe...',
    '..reEEYYEEer..',
    '..reeEEEEeer..',
    ...FIRE_BASE,
  ],
];
