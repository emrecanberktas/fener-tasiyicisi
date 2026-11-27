import type { RuleId, StatKey, TreeNodeDef } from './types';

const stat = (id: string, cost: number, requires: string[], s: StatKey, value: number): TreeNodeDef =>
  ({ id, cost, requires, effect: { type: 'stat', stat: s, value } });
const rule = (id: string, cost: number, requires: string[], r: RuleId): TreeNodeDef =>
  ({ id, cost, requires, effect: { type: 'rule', rule: r } });

export const TREE: readonly TreeNodeDef[] = [
  stat('t01', 50, [], 'damagePct', 5),
  stat('t02', 80, ['t01'], 'maxHp', 20),
  stat('t03', 120, ['t01'], 'areaPct', 5),
  stat('t04', 160, ['t02'], 'moveSpeedPct', 5),
  stat('t05', 200, ['t03'], 'pickupRangePct', 20),
  stat('t06', 260, ['t04'], 'xpGainPct', 10),
  rule('t07', 320, ['t05'], 'oneReroll'),
  stat('t08', 400, ['t06'], 'damagePct', 8),
  stat('t09', 480, ['t07'], 'regen', 0.5),
  stat('t10', 560, ['t08'], 'areaPct', 8),
  stat('t11', 650, ['t09'], 'maxHp', 40),
  rule('t12', 750, ['t10', 't11'], 'startWithTwoSkills'),
  stat('t13', 850, ['t12'], 'damagePct', 10),
  stat('t14', 950, ['t12'], 'xpGainPct', 15),
  stat('t15', 1050, ['t13'], 'moveSpeedPct', 8),
  stat('t16', 1150, ['t14'], 'pickupRangePct', 30),
  stat('t17', 1250, ['t15'], 'regen', 1),
  stat('t18', 1350, ['t16'], 'areaPct', 12),
  rule('t19', 1450, ['t17', 't18'], 'fourChoices'),
  stat('t20', 1500, ['t19'], 'damagePct', 15),
];

export const treeNode = (id: string): TreeNodeDef | undefined => TREE.find(n => n.id === id);
