import { abandonActiveRun } from '../../app/actions';
import type { ScreenRenderer } from '../../app/router';
import { accountXpToNext } from '../../core/progression/account';
import { getRecommendation, type Recommendation } from '../../core/progression/recommend';
import { collectIdle, computeIdleKor, idleFillRatio } from '../../core/idle';
import { treeNode } from '../../data/tree';
import { theme } from '../../theme';
import { h } from '../dom';
import { reactive } from '../layout';
import { showResumePrompt } from './resume';

const recText = (r: Recommendation, inv: { id: string; slot: keyof typeof theme.slots }[]): string => {
  if (r.kind === 'betterGear') {
    const g = inv.find(i => i.id === r.itemId);
    return `Daha iyi bir ${g ? theme.slots[g.slot].toLowerCase() : 'parça'} buldun — tak`;
  }
  if (r.kind === 'unlockNode') return `Ağaçta açılabilir: ${theme.treeNodes[r.nodeId] ?? treeNode(r.nodeId)?.id}`;
  return `Yeni bölge açık: ${theme.zones[r.zoneIndex as 0 | 1 | 2].name}`;
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
        h('div', { class: 'kor' }, h('span', { class: 'kor-dot' }), h('strong', {}, String(s.kor)), h('span', { class: 'muted' }, ' Kor')),
        h('button', { class: 'icon-btn', 'data-settings': '', 'aria-label': 'Ayarlar', onclick: () => ctx.go('settings') }, '⚙')),
      h('div', { class: 'camp-mid' },
        h('div', { class: 'fire', style: { '--fill': String(fill) } as unknown as Partial<CSSStyleDeclaration> }),
        h('div', { class: 'account' },
          h('span', {}, `Taşıyıcı Sv ${s.account.level}`),
          h('div', { class: 'bar thin' }, h('div', { class: 'bar-fill xp', style: { width: `${(s.account.xp / accountXpToNext(s.account.level)) * 100}%` } }))),
        idle > 0
          ? h('button', { class: 'collect', 'data-collect': '', onclick: () => void ctx.store.update(sv => collectIdle(sv, ctx.now())) }, `+${idle} ${theme.ui.collect}`)
          : h('p', { class: 'muted small' }, s.bestRunKor > 0 ? 'Kamp ateşi Kor biriktiriyor' : 'İlk turdan sonra kamp ateşi Kor biriktirmeye başlar')),
      h('div', { class: 'screen-actions' },
        rec ? h('button', { class: 'rec', 'data-recommendation': '', onclick: onRec }, h('span', { class: 'rec-star' }, '★'), recText(rec, s.gear.inventory)) : null,
        zones.length > 1 ? h('div', { class: 'zones' }, ...zones.map(i => h('button', {
          class: `chip${i === zone ? ' on' : ''}`, 'data-zone': String(i), onclick: () => { zone = i; redraw(); },
        }, theme.zones[i as 0 | 1 | 2].name))) : h('p', { class: 'muted small center' }, theme.zones[0].name),
        h('button', { class: 'primary dive', 'data-dive': '', onclick: () => ctx.go('run', { zoneIndex: zone }) }, theme.ui.dive),
        h('nav', { class: 'tabs' },
          h('button', { 'data-tab': 'gear', onclick: () => ctx.go('gear') }, 'Fener'),
          h('button', { 'data-tab': 'tree', onclick: () => ctx.go('tree') }, 'Ağaç'),
          h('button', { 'data-tab': 'quests', onclick: () => ctx.go('quests') }, 'Görevler'))));
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
