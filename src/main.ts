import { createRouter } from './app/router';
import { createStore } from './app/store';
import { createSaveStore } from './core/save/storage';
import { renderCamp } from './ui/screens/camp';
import { renderGear } from './ui/screens/gear';
import { renderQuests } from './ui/screens/quests';
import { renderSettings } from './ui/screens/settings';
import { renderTree } from './ui/screens/tree';
import './ui/styles.css';

async function main(): Promise<void> {
  const root = document.getElementById('app')!;
  const store = await createStore(createSaveStore(), Date.now);
  const router = createRouter(root, store, {
    camp: renderCamp, gear: renderGear, tree: renderTree, quests: renderQuests, settings: renderSettings,
  });
  router.go('camp');
}

void main();
