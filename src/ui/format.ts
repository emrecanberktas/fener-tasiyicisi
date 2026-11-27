import type { TreeNodeDef, StatKey, GearItem } from '../data/types';
import type { Quest } from '../core/save/schema';
import { theme } from '../theme';
import { questTarget } from '../core/quests';

export const fmtStat = (k: StatKey, v: number): string => `${theme.stats[k]} +${Math.round(v * 10) / 10}`;

export const fmtGearStats = (g: GearItem): string =>
  (Object.entries(g.stats) as [StatKey, number][]).map(([k, v]) => fmtStat(k, v)).join(' · ');

const RULE_TEXT: Record<string, string> = {
  startWithTwoSkills: 'Tura 2 yetenekle başla',
  fourChoices: 'Seviye atlayınca 4 seçenek',
  oneReroll: 'Her turda 1 kez seçenekleri yenile',
};

export const fmtNodeEffect = (n: TreeNodeDef): string =>
  n.effect.type === 'stat' ? fmtStat(n.effect.stat, n.effect.value) : RULE_TEXT[n.effect.rule] ?? n.effect.rule;

export function fmtQuest(q: Quest): { text: string; ratio: number; reward: string } {
  const t = q.template;
  const target = questTarget(t);
  const text = t.kind === 'kills' ? `${t.target} düşman söndür`
    : t.kind === 'reachMinute' ? `Bir turda ${t.minute}. dakikaya ulaş`
    : t.kind === 'skillLevel' ? `${theme.skills[t.skillId].name} yeteneğini ${t.level}. seviyeye çıkar`
    : `${theme.zones[t.zoneIndex as 0 | 1 | 2].name} bölgesinde ${theme.enemies.mistHeart.name}'ni yen`;
  const reward = 'kor' in q.reward ? `+${q.reward.kor} Kor` : `${theme.rarities[q.reward.gearMinRarity]}+ parça`;
  return { text, ratio: Math.min(1, q.progress / target), reward };
}
