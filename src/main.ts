import { abandonActiveRun, createRouter, type ScreenRenderer } from './app/router';
import { createStore } from './app/store';
import { createSaveStore } from './core/save/storage';
import { h } from './ui/dom';
import { showResumePrompt } from './ui/screens/resume';
import './ui/styles.css';

// Geçici kamp (Görev 16'da gerçek ekranla değişir).
const tempCamp: ScreenRenderer = (root, ctx) => {
  const el = h('div', { class: 'screen' }, h('div', { class: 'screen-actions' },
    h('button', { class: 'primary', onclick: () => ctx.go('run') }, 'Sise Dal'),
    h('p', { class: 'muted' }, `Kor: ${ctx.store.get().kor}`)));
  root.append(el);
  if (ctx.store.get().activeRun) showResumePrompt(root, { onResume: () => ctx.go('run', { resume: true }), onAbandon: () => void abandonActiveRun(ctx) });
  return () => el.remove();
};

async function main(): Promise<void> {
  const root = document.getElementById('app')!;
  const store = await createStore(createSaveStore(), Date.now);
  createRouter(root, store, { camp: tempCamp }).go('camp');
}

void main();
