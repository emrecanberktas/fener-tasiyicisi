import type { ScreenRenderer } from '../../app/router';
import { autoEquip, equip, gearPower, INVENTORY_CAP, meltItems, MELT_VALUE } from '../../core/progression/gear';
import { GEAR_SLOTS } from '../../data/gear';
import type { GearItem } from '../../data/types';
import { theme } from '../../theme';
import { h, hex } from '../dom';
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
      return h('div', { class: 'slot', style: g ? { borderColor: color(g) } : {} },
        h('span', { class: 'eyebrow' }, theme.slots[slot]),
        g ? h('span', { class: 'small', style: { color: color(g) } }, theme.rarities[g.rarity]) : h('span', { class: 'muted small' }, 'Boş'),
        g ? h('span', { class: 'small' }, fmtGearStats(g)) : null);
    }));
    const items = [...s.gear.inventory].sort((a, b) => gearPower(b) - gearPower(a));
    const list = h('ul', { class: 'list' }, ...items.map(g => {
      const isEq = equipped.has(g.id);
      return h('li', { class: `gear-row${g.id === highlight ? ' hl' : ''}`, style: { borderLeftColor: color(g) } },
        h('button', { class: 'gear-main', 'data-item': g.id, onclick: () => void ctx.store.update(sv => equip(sv, g.id)) },
          h('span', { style: { color: color(g) } }, `${theme.rarities[g.rarity]} ${theme.slots[g.slot]}${isEq ? ' · takılı' : ''}`),
          h('span', { class: 'muted small' }, fmtGearStats(g))),
        isEq ? null : h('button', {
          class: `melt-toggle${selected.has(g.id) ? ' on' : ''}`, 'data-melt-toggle': g.id, 'aria-label': 'Eritmek için seç',
          onclick: () => { if (selected.has(g.id)) selected.delete(g.id); else selected.add(g.id); redraw(); },
        }, selected.has(g.id) ? '✓' : '🔥'));
    }));
    const meltKor = [...selected].reduce((sum, id) => sum + (byId(id) ? MELT_VALUE[byId(id)!.rarity] : 0), 0);
    return subScreen(`Fener · ${s.gear.inventory.length}/${INVENTORY_CAP}`,
      [slots, items.length ? list : h('p', { class: 'muted' }, 'Henüz parça yok. Turlarda düşen parçalar burada birikir.')],
      [
        selected.size ? h('button', {
          class: 'ghost', 'data-melt': '',
          onclick: () => { const ids = [...selected]; selected.clear(); void ctx.store.update(sv => meltItems(sv, ids)); },
        }, `Erit (${selected.size}) · +${meltKor} Kor`) : null,
        h('button', { class: 'primary', 'data-autoequip': '', onclick: () => void ctx.store.update(autoEquip) }, 'Otomatik tak'),
      ],
      () => ctx.go('camp'));
  };
  const listeners = new Set<() => void>();
  const cleanup = reactive(root, fn => { listeners.add(fn); const u = ctx.store.subscribe(fn); return () => { listeners.delete(fn); u(); }; }, draw);
  redraw = () => listeners.forEach(fn => fn());
  return cleanup;
};
