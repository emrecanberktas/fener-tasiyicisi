import { abandonActiveRun } from '../../app/actions';
import type { ScreenRenderer } from '../../app/router';
import { accountXpToNext } from '../../core/progression/account';
import { getRecommendation, type Recommendation } from '../../core/progression/recommend';
import { collectIdle, computeIdleKor, idleFillRatio } from '../../core/idle';
import { treeNode } from '../../data/tree';
import { theme } from '../../theme';
import { h } from '../dom';
import { campScene, icon } from '../icons';
import { reactive } from '../layout';
import { showResumePrompt } from './resume';

const recText = (r: Recommendation, inv: { id: string; slot: keyof typeof theme.slots }[]): string => {
  if (r.kind === 'betterGear') {
    const g = inv.find(i => i.id === r.itemId);
    return `Daha iyi bir ${g ? theme.slots[g.slot].toLowerCase() : 'parça'} buldun`;
  }
  if (r.kind === 'unlockNode') return `${theme.treeNodes[r.nodeId] ?? treeNode(r.nodeId)?.id} açılabilir`;
  return `${theme.zones[r.zoneIndex as 0 | 1 | 2].name} seni bekliyor`;
};

export const renderCamp: ScreenRenderer = (root, ctx) => {
  let zone = ctx.store.get().zones.unlockedIndex;
  const draw = () => {
    const s = ctx.store.get();
    const now = ctx.now();
    const idle = computeIdleKor(s, now);
    const fill = idleFillRatio(s, now);
    const rec = getRecommendation(s);
    zone = Math.min(zone, s.zones.unlockedIndex);
    const zones = Array.from({ length: s.zones.unlockedIndex + 1 }, (_, i) => i);
    const onRec = () => {
      if (!rec) return;
      if (rec.kind === 'betterGear') ctx.go('gear', { highlight: rec.itemId });
      else if (rec.kind === 'unlockNode') ctx.go('tree', { highlight: rec.nodeId });
      else { zone = rec.zoneIndex; ctx.go('camp'); }
    };
    return h('div', { class: 'screen camp' },
      h('header', { class: 'camp-top' },
        h('div', { class: 'kor', 'aria-label': `${s.kor} Kor` }, icon('kor', 3), String(s.kor), h('small', {}, 'Kor')),
        h('button', { class: 'icon-btn', 'data-settings': '', 'aria-label': 'Ayarlar', onclick: () => ctx.go('settings') }, icon('cog', 3))),
      h('div', { class: 'camp-mid' },
        campScene(fill),
        h('div', { class: 'carrier' },
          h('span', {}, `Taşıyıcı, seviye ${s.account.level}`),
          h('div', { class: 'bar' }, h('div', { class: 'bar-fill xp', style: { width: `${(s.account.xp / accountXpToNext(s.account.level)) * 100}%` } }))),
        idle > 0
          ? h('button', { class: 'collect px', 'data-collect': '', onclick: () => void ctx.store.update(sv => collectIdle(sv, ctx.now())) }, icon('kor', 3), `${theme.ui.collect}: ${idle}`)
          : h('p', { class: 'idle-note' }, s.bestRunKor > 0 ? 'Sen yokken ateş Kor biriktirir.' : 'İlk turundan sonra ateş, sen yokken de Kor biriktirmeye başlar.')),
      h('div', { class: 'screen-actions' },
        rec ? h('button', { class: 'rec px', 'data-recommendation': '', onclick: onRec },
          icon(rec.kind === 'betterGear' ? 'lantern' : rec.kind === 'unlockNode' ? 'tree' : 'lightRing', 3), recText(rec, s.gear.inventory),
          h('span', { class: 'rec-go' }, rec.kind === 'betterGear' ? 'Tak' : rec.kind === 'unlockNode' ? 'Aç' : 'Seç')) : null,
        zones.length > 1 ? h('div', { class: 'zones' }, ...zones.map(i => h('button', {
          class: `zone${i === zone ? ' on' : ''}`, 'data-zone': String(i), 'aria-pressed': String(i === zone), onclick: () => { zone = i; redraw(); },
        }, theme.zones[i as 0 | 1 | 2].name))) : h('p', { class: 'zone-name' }, theme.zones[0].name),
        h('button', { class: 'btn-main dive', 'data-dive': '', onclick: () => ctx.go('run', { zoneIndex: zone }) }, theme.ui.dive),
        h('nav', { class: 'tabs' },
          h('button', { class: 'tab px', 'data-tab': 'gear', onclick: () => ctx.go('gear') }, icon('lantern', 3), 'Fener'),
          h('button', { class: 'tab px', 'data-tab': 'tree', onclick: () => ctx.go('tree') }, icon('tree', 3), 'Ağaç'),
          h('button', { class: 'tab px', 'data-tab': 'quests', onclick: () => ctx.go('quests') }, icon('scroll', 3), 'Görevler'))));
  };
  let redraw = () => {};
  const listeners = new Set<() => void>();
  const cleanup = reactive(root, fn => { listeners.add(fn); const u = ctx.store.subscribe(fn); return () => { listeners.delete(fn); u(); }; }, draw);
  redraw = () => listeners.forEach(fn => fn());
  let closePrompt = () => {};
  if (ctx.store.get().activeRun) {
    closePrompt = showResumePrompt(root, {
      onResume: () => ctx.go('run', { resume: true }),
      onAbandon: () => void abandonActiveRun(ctx),
    });
  }
  return () => { closePrompt(); cleanup(); };
};
