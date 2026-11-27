import { TREE, treeNode } from '../../data/tree';
import type { TreeNodeDef } from '../../data/types';
import type { SaveData } from '../save/schema';

export function canUnlockNode(save: SaveData, nodeId: string): boolean {
  const n = treeNode(nodeId);
  if (!n) return false;
  const unlocked = new Set(save.tree.unlocked);
  return !unlocked.has(n.id) && n.requires.every(r => unlocked.has(r)) && save.kor >= n.cost;
}

export function unlockNode(save: SaveData, nodeId: string): SaveData {
  if (!canUnlockNode(save, nodeId)) throw new Error(`Düğüm açılamaz: ${nodeId}`);
  const n = treeNode(nodeId)!;
  return { ...save, kor: save.kor - n.cost, tree: { unlocked: [...save.tree.unlocked, n.id] } };
}

export function cheapestUnlockable(save: SaveData): TreeNodeDef | null {
  return TREE.filter(n => canUnlockNode(save, n.id))
    .reduce<TreeNodeDef | null>((b, n) => (!b || n.cost < b.cost ? n : b), null);
}
