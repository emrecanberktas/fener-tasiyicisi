/** Fener Taşıyıcısı paleti: sis gecesi, kor ve kemik tonları. Tek karakter → renk. */
export const PALETTE: Record<string, string> = {
  k: '#0d1016', // en koyu çizgi
  d: '#151a24', // gölge
  n: '#1a1f2b', // sis gecesi (zemin)
  s: '#2b3240', // arduvaz (pelerin, panel)
  S: '#3a4354', // arduvaz açık
  f: '#5f7080', // sis
  F: '#8aa0b0', // sis açık
  G: '#c4d4dc', // sis parlak
  b: '#e6d8b8', // kemik
  B: '#a89a7e', // kemik koyu
  e: '#d9822b', // kor
  E: '#f0a040', // kor parlak
  Y: '#ffe7a3', // alev çekirdeği
  r: '#a8452e', // pas
  R: '#6e2a1f', // pas koyu
  m: '#6f8f4e', // yosun
  M: '#3f5530', // yosun koyu
  w: '#3b3150', // gölge kurdu
  W: '#5a4a78', // gölge kurdu açık
  c: '#6fb7b4', // ruh
  C: '#b6ece6', // ruh parlak
};

export const hexToNum = (hex: string): number => parseInt(hex.slice(1), 16);
