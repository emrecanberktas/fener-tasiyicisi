import { SpatialGrid } from '../../src/core/spatialGrid';

test('yakındaki aday döner, uzaktaki dönmez', () => {
  const g = new SpatialGrid(64);
  g.insert(1, 0, 0); g.insert(2, 500, 500); g.insert(3, -40, 10);
  const near = g.queryRadius(0, 0, 50);
  expect(near).toContain(1); expect(near).toContain(3); expect(near).not.toContain(2);
});
test('clear sonrası boş', () => {
  const g = new SpatialGrid(64);
  g.insert(1, 0, 0); g.clear();
  expect(g.queryRadius(0, 0, 100)).toEqual([]);
});
