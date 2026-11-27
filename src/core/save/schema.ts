import type { GearItem, GearSlot, QuestTemplate, Rarity } from '../../data/types';

export const CURRENT_VERSION = 1;

export interface Quest {
  id: string;
  template: QuestTemplate;
  progress: number;
  reward: { kor: number } | { gearMinRarity: Rarity };
}

export interface SaveData {
  version: 1;
  kor: number;
  account: { level: number; xp: number };
  gear: { inventory: GearItem[]; equipped: Record<GearSlot, string | null> };
  tree: { unlocked: string[] };
  zones: { unlockedIndex: number; bossesDefeated: number[] };
  bestRunKor: number;
  idle: { lastCollectedAt: number };
  quests: { active: Quest[]; counter: number };
  activeRun: unknown | null;
  settings: { vibration: boolean };
}

export class SaveFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SaveFormatError';
  }
}

export function createDefaultSave(now: number): SaveData {
  return {
    version: 1,
    kor: 0,
    account: { level: 1, xp: 0 },
    gear: { inventory: [], equipped: { hazne: null, cam: null, fitil: null } },
    tree: { unlocked: [] },
    zones: { unlockedIndex: 0, bossesDefeated: [] },
    bestRunKor: 0,
    idle: { lastCollectedAt: now },
    quests: { active: [], counter: 0 },
    activeRun: null,
    settings: { vibration: true },
  };
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const fail = (field: string): never => { throw new SaveFormatError(`Geçersiz alan: ${field}`); };

export function migrateSave(raw: unknown): SaveData {
  if (!isObj(raw)) fail('kök');
  const r = raw as Record<string, unknown>;
  if (r.version !== CURRENT_VERSION) fail('version');
  if (!isNum(r.kor)) fail('kor');
  const acc = r.account;
  if (!isObj(acc) || !isNum(acc.level) || !isNum(acc.xp)) fail('account');
  const gear = r.gear;
  if (!isObj(gear) || !Array.isArray(gear.inventory) || !isObj(gear.equipped)) fail('gear');
  const tree = r.tree;
  if (!isObj(tree) || !Array.isArray(tree.unlocked)) fail('tree');
  const zones = r.zones;
  if (!isObj(zones) || !isNum(zones.unlockedIndex) || !Array.isArray(zones.bossesDefeated)) fail('zones');
  if (!isNum(r.bestRunKor)) fail('bestRunKor');
  const idle = r.idle;
  if (!isObj(idle) || !isNum(idle.lastCollectedAt)) fail('idle');
  const quests = r.quests;
  if (!isObj(quests) || !Array.isArray(quests.active) || !isNum(quests.counter)) fail('quests');

  const def = createDefaultSave(0);
  const settings = isObj(r.settings) ? { ...def.settings, ...r.settings } : def.settings;
  return {
    ...(r as unknown as SaveData),
    activeRun: r.activeRun ?? null,
    settings: settings as SaveData['settings'],
  };
}
