import { collectIdle, computeIdleKor, idleFillRatio } from '../../src/core/idle';
import { createDefaultSave } from '../../src/core/save/schema';

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
test('doluluk oranı 0..1', () => {
  expect(idleFillRatio(s(200, 0), 12 * H)).toBeCloseTo(0.25);
  expect(idleFillRatio(s(200, 0), 99 * H)).toBe(1);
  expect(idleFillRatio(s(200, 10 * H), 0)).toBe(0);
});
