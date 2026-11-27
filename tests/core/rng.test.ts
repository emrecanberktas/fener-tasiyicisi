import { createRng } from '../../src/core/rng';

test('aynı tohum aynı diziyi üretir', () => {
  const a = createRng(42), b = createRng(42);
  expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
});
test('next [0,1) aralığında', () => {
  const r = createRng(5);
  for (let i = 0; i < 1000; i++) { const v = r.next(); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); }
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
test('pick listeden eleman döner', () => {
  const r = createRng(3);
  for (let i = 0; i < 50; i++) expect(['a', 'b']).toContain(r.pick(['a', 'b']));
});
