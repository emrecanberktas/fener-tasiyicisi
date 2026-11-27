/** Basit ızgara: queryRadius, yarıçapı kapsayan hücrelerdeki adayları döner. */
export class SpatialGrid {
  private cells = new Map<number, number[]>();
  private readonly cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  private key(cx: number, cy: number): number {
    return (cx + 32768) * 65536 + (cy + 32768);
  }

  clear(): void {
    this.cells.clear();
  }

  insert(id: number, x: number, y: number): void {
    const k = this.key(Math.floor(x / this.cellSize), Math.floor(y / this.cellSize));
    const cell = this.cells.get(k);
    if (cell) cell.push(id);
    else this.cells.set(k, [id]);
  }

  queryRadius(x: number, y: number, r: number): number[] {
    const out: number[] = [];
    const x0 = Math.floor((x - r) / this.cellSize), x1 = Math.floor((x + r) / this.cellSize);
    const y0 = Math.floor((y - r) / this.cellSize), y1 = Math.floor((y + r) / this.cellSize);
    for (let cx = x0; cx <= x1; cx++) {
      for (let cy = y0; cy <= y1; cy++) {
        const cell = this.cells.get(this.key(cx, cy));
        if (cell) for (const id of cell) out.push(id);
      }
    }
    return out;
  }
}
