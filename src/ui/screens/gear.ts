import type { ScreenRenderer } from '../../app/router';
import { autoEquip, equip, gearPower, INVENTORY_CAP, meltItems, MELT_VALUE } from '../../core/progression/gear';
import { GEAR_SLOTS } from '../../data/gear';
import type { GearItem } from '../../data/types';
import { theme } from '../../theme';
import { h, hex } from '../dom';
import { icon } from '../icons';

const frame = (c: string) => `0 -3px 0 0 ${c}, 0 3px 0 0 ${c}, -3px 0 0 0 ${c}, 3px 0 0 0 ${c}, inset 0 3px 0 0 #3a4354`;
import { fmtGearStats } from '../format';
import { reactive, subScreen } from '../layout';

export const renderGear: ScreenRenderer = (root, ctx, params) => {
  const highlight = (params as { highlight?: string } | undefined)?.highlight;
  const selected = new Set<string>();
  let redraw = () => {};
  const draw = () => {
    const s = ctx.store.get();
    const equipped = new Set(Object.values(s.gear.equipped));
    const byId = (id: string | null) => s.gear.inventory.find(g => g.id === id);
    const color = (g: GearItem) => hex(theme.rarityColors[g.rarity]);
    const slots = h('div', { class: 'slots' }, ...GEAR_SLOTS.map(slot => {
      const g = byId(s.gear.equipped[slot]);
      return h('div', { class: 'slot px', style: g ? { boxShadow: frame(color(g)) } : {} },
        icon(slot, 3),
        h('span', { class: 'slot-name' }, theme.slots[slot]),
        g ? h('span', { class: 'small', style: { color: color(g) } }, theme.rarities[g.rarity]) : h('span', { class: 'muted small' }, 'Boş'),
        g ? h('span', { class: 'small' }, fmtGearStats(g)) : null);
    }));
    const items = [...s.gear.inventory].sort((a, b) => gearPower(b) - gearPower(a));
    const list = h('ul', { class: 'list' }, ...items.map(g => {
      const isEq = equipped.has(g.id);
      return h('li', { class: `gear-row px${g.id === highlight ? ' hl' : ''}` },
        h('button', { class: 'gear-main', 'data-item': g.id, 'aria-label': `${theme.rarities[g.rarity]} ${theme.slots[g.slot]} tak`, onclick: () => void ctx.store.update(sv => equip(sv, g.id)) },
          h('span', { class: 'slot-box', style: { boxShadow: `inset 0 0 0 3px ${color(g)}` } }, icon(g.slot, 3)),
          h('span', { class: 'gear-text' },
            h('span', { style: { color: color(g) } }, `${theme.rarities[g.rarity]} ${theme.slots[g.slot].toLowerCase()}`),
            h('span', { class: 'muted small' }, fmtGearStats(g)),
            isEq ? h('span', { class: 'equipped-tag' }, 'Takılı') : null)),
        isEq ? null : h('button', {
          class: `melt-toggle${selected.has(g.id) ? ' on' : ''}`, 'data-melt-toggle': g.id, 'aria-label': 'Eritmek için seç', 'aria-pressed': String(selected.has(g.id)),
          onclick: () => { if (selected.has(g.id)) selected.delete(g.id); else selected.add(g.id); redraw(); },
        }, icon('intenseFlame', 3)));
    }));
    const meltKor = [...selected].reduce((sum, id) => sum + (byId(id) ? MELT_VALUE[byId(id)!.rarity] : 0), 0);
    return subScreen('Fener',
      [slots, items.length ? list : h('p', { class: 'muted' }, 'Henüz parça yok. Turlarda düşen parçalar burada birikir.')],
      [
        selected.size ? h('button', {
          class: 'btn-quiet', 'data-melt': '',
          onclick: () => { const ids = [...selected]; selected.clear(); void ctx.store.update(sv => meltItems(sv, ids)); },
        }, `${selected.size} parçayı erit, ${meltKor} Kor al`) : null,
        h('button', { class: 'btn-main', 'data-autoequip': '', onclick: () => void ctx.store.update(autoEquip) }, 'En iyilerini tak'),
      ],
      () => ctx.go('camp'),
      `${s.gear.inventory.length}/${INVENTORY_CAP} parça`);
  };
  const listeners = new Set<() => void>();
  const cleanup = reactive(root, fn => { listeners.add(fn); const u = ctx.store.subscribe(fn); return () => { listeners.delete(fn); u(); }; }, draw);
  redraw = () => listeners.forEach(fn => fn());
  return cleanup;
};
