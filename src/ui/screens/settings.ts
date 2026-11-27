import type { ScreenRenderer } from '../../app/router';
import type { SaveData } from '../../core/save/schema';
import { exportSave, importSave } from '../../core/save/storage';
import { theme } from '../../theme';
import { h } from '../dom';
import { subScreen } from '../layout';

export const renderSettings: ScreenRenderer = (root, ctx) => {
  const exportText = h('textarea', { class: 'code', 'data-export-text': '', readonly: true, rows: '3', hidden: true });
  const importText = h('textarea', { class: 'code', 'data-import-text': '', rows: '3', placeholder: 'Yedek metnini buraya yapıştır' });
  const status = h('div', { class: 'status' });
  let pending: SaveData | null = null;

  const doExport = () => {
    const json = exportSave(ctx.store.get());
    exportText.value = json;
    exportText.hidden = false;
    try {
      const a = h('a', { href: URL.createObjectURL(new Blob([json], { type: 'application/json' })), download: `fener-yedek-${new Date(ctx.now()).toISOString().slice(0, 10)}.json` });
      a.click();
    } catch { /* indirme desteklenmiyorsa metin yeterli */ }
    void navigator.clipboard?.writeText(json).catch(() => {});
  };

  const tryImport = (json: string) => {
    status.replaceChildren();
    try {
      pending = importSave(json);
      status.append(
        h('p', {}, `Yedek okundu: ${pending.kor} Kor, Taşıyıcı Sv ${pending.account.level}. Mevcut kaydının yerine geçecek.`),
        h('button', {
          class: 'btn-main', 'data-import-confirm': '',
          onclick: () => { const p = pending; pending = null; if (p) void ctx.store.update(() => ({ ...p, activeRun: null })).then(() => ctx.go('camp')); },
        }, 'Kaydı değiştir'));
    } catch {
      pending = null;
      status.append(h('p', { class: 'error', 'data-error': '' }, theme.ui.importError!));
    }
  };

  const fileInput = h('input', {
    type: 'file', accept: 'application/json,.json', 'data-import-file': '',
    onchange: async (e: Event) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) tryImport(await f.text());
    },
  });

  const el = subScreen('Ayarlar', [
    h('h3', {}, 'Kaydı yedekle'),
    h('p', { class: 'muted small' }, 'Oyun tarayıcıda çalıştığı için kaydın silinebilir. Ara sıra yedek almak iyi olur.'),
    h('button', { class: 'btn-quiet px', 'data-export': '', onclick: doExport }, 'Yedeği indir ve kopyala'),
    exportText,
    h('h3', {}, 'Yedekten geri yükle'),
    fileInput,
    importText,
    h('button', { class: 'btn-quiet px', 'data-import': '', onclick: () => tryImport(importText.value) }, 'Yapıştırdığım yedeği yükle'),
    status,
  ], [], () => ctx.go('camp'));
  root.append(el);
  return () => el.remove();
};
