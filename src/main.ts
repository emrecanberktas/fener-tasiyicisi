import { unlockedSkills } from './core/progression/account';
import { computePlayerStats, runStats } from './core/progression/stats';
import { createRunState } from './core/run/runState';
import { createDefaultSave } from './core/save/schema';
import { SKILLS } from './data/skills';
import type { SkillId } from './data/types';
import { startRun, type RunHandle } from './game/createRun';
import { createHud } from './ui/screens/hud';
import { showLevelUp } from './ui/screens/levelUp';
import { showPausePanel } from './ui/screens/pause';
import './ui/styles.css';

const app = document.getElementById('app')!;
const params = new URLSearchParams(location.search);

// Geçici geliştirici yolu (Görev 15'te router ile değişecek): ?dev=run[&t=470][&zone=1][&level=8]
if (params.get('dev') === 'run') {
  const save = { ...createDefaultSave(Date.now()), account: { level: Number(params.get('level') ?? 1), xp: 0 } };
  const stats = computePlayerStats(save);
  const unlocked: SkillId[] = unlockedSkills(save);
  const state = createRunState(Date.now() >>> 0, Number(params.get('zone') ?? 0), stats, unlocked);
  state.elapsedSec = Number(params.get('t') ?? 0);
  // ?skills=all3: tüm yetenekler seviye 3 (en fazla 4 aktif + 4 pasif değil; görsel test için hepsi)
  if (params.get('skills') === 'all3') for (const id of Object.keys(SKILLS) as SkillId[]) state.skills[id] = 3;
  const gameEl = document.createElement('div');
  gameEl.className = 'game';
  app.append(gameEl);
  let run: RunHandle;
  let closeLevelUp = () => {};
  const hud = createHud(app, {
    onPause: () => {
      run.pause();
      const close = showPausePanel(app, { onContinue: () => { close(); run.resume(); }, onEnd: () => { close(); run.forfeit(); } });
    },
  });
  run = startRun(gameEl, {
    state, stats, unlocked,
    statsFor: s => runStats(stats, s.skills),
    onHud: h => hud.update(h),
    onLevelUp: (choices, cur) => {
      closeLevelUp();
      closeLevelUp = showLevelUp(app, choices, cur, {
        rerollsLeft: cur.rerollsLeft,
        onChoose: c => { closeLevelUp(); closeLevelUp = () => {}; run.chooseLevelUp(c); },
        onReroll: () => run.reroll(),
      });
    },
    onAutosave: () => {},
    onEnd: r => console.log('[dev] tur bitti', r),
  });
} else {
  app.textContent = 'Fener Taşıyıcısı — geliştirme sürümü. Tur için ?dev=run';
}
