# SDD ledger — plan: /home/claude/fener-tasiyicisi/docs/superpowers/plans/2026-11-27-fener-tasiyicisi.md
Spec: docs/superpowers/specs/2026-11-27-fener-tasiyicisi-design.md
Pre-flight:
- G3→G10: activeRun `unknown|null` in G3, narrowed to RunState in G10 — consistent.
- G2→G4: PlayerStats/StatKey shared — consistent.
- G5→G8/G10: addToInventory returns {save, autoMelted} — G8/G10 must destructure; consistent.
- G8: QuestTemplate kind 'reachMinute' consumed by QuestEvent 'reachedSec' — Ruling: progress when sec >= minute*60 — plan implies mapping — cost low.
- G12→G13: RunScene uses base stats in G12; G13 swaps in runStats — consistent ordering.
Scope: user asked to bring to "a stage" now; target Tasks 1-12 this session.
Task 1: Ruling: TypeScript 7 / Vite 8 / Vitest 5 (template's current) instead of plan's 'TypeScript 5' — current stable — low cost
Task 1: complete (commits 6c0cfd8..6ff1850, tests: npm test →    Duration  448ms (environment 79%, tests 8%, import 6%, transform 4%, worker 2%))
Ruling: task-start can't parse Turkish 'Görev N' headings — briefs read from plan file directly; task-done used for ledger — no cost
Task 2: complete (commits 6ff1850..4fa21ab, tests: npm test →              at least ~312ms faster with isolate: false — reuses workers across files instead of one per file)
Task 3: complete (commits 4fa21ab..f1dcad7, tests: npm test →              at least ~654ms faster with isolate: false — reuses workers across files instead of one per file)
Task 4: complete (commits f1dcad7..cb3e16c, tests: npm test →              at least ~1.20s faster with isolate: false — reuses workers across files instead of one per file)
Task 5: complete (commits cb3e16c..2ba17ee, tests: npm test →              at least ~1.51s faster with isolate: false — reuses workers across files instead of one per file)
Task 6: complete (commits 2ba17ee..344744c, tests: npm test →              at least ~1.84s faster with isolate: false — reuses workers across files instead of one per file)
Task 7: complete (commits 344744c..93f5130, tests: npm test →              at least ~2.15s faster with isolate: false — reuses workers across files instead of one per file)
Task 8: Ruling: reachMinute quest counts in any zone (template has no zone field) — simpler, spec doesn't require zone — low cost
Task 8: complete (commits 93f5130..bee3145, tests: npm test →              at least ~2.45s faster with isolate: false — reuses workers across files instead of one per file)
Task 9: Ruling: newZone = highest unlocked zone (>0) whose boss is undefeated, lowest priority — plan wording ambiguous, no 'played' tracking needed — low cost (suggestion may persist until boss beaten)
Task 9: complete (commits bee3145..eba1379, tests: npm test →              at least ~2.61s faster with isolate: false — reuses workers across files instead of one per file)
Task 10: complete (commits eba1379..d8bd9f7, tests: npm test →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Task 11: complete (commits d8bd9f7..fce59db, tests: npm test →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Task 12: Ruling: autosave (5 sn) + visibilitychange pause/save implemented in G12 instead of G14 — needed by RunScene anyway, G14 only adds UI — no cost
Task 12: Ruling: SPAWN_DISTANCE 560 (plan 600) — 600 left screen empty ~15 s at start — tuning, low cost
Task 12: Ruling: zone scaling — enemy hp × zoneMult, contact/projectile dmg × (1 + (mult-1)·0.5) — spec says zone difficulty multiplier, plan didn't pin — balance only
Task 12: Ruling: skills/registry.ts created in G12 with lightRing only (plan lists it in G13) — RunScene needs it — none
Task 12: Ruling: RunHandle gains forfeit() for "Turu bitir" (G14 pause panel) — none
Task 12: verified headless Chrome (playwright, swiftshader): joystick move, kills, level-up cards, autosave every 5 s, boss spawn at 480 s, onEnd on death; no page errors. Not verified on a real phone.
Task 12: note: Scale.FIT letterboxes on tall phones (9:19.5) — revisit in G17
Task 12: complete (commits fce59db..fb560d5, tests: npm test →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Task 13: Ruling: skills target/spawn near enemies (sparkRain falls on nearest enemy to a random point) instead of purely random points — random points mostly missed — feel only
Task 13: complete (commits 58421a5..ac545fa, tests: npm test →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Task 14: Ruling: RunOptions.onLevelUp(choices, state) gets current RunState — level-up card needs level/skills/rerolls; plan signature lacked it — none
Task 14: Ruling: pause panel in its own file ui/screens/pause.ts (+test) — plan described it under HUD without a file — none
Task 14: complete (commits ac545fa..aab8c44, tests: npm test →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Task 15: Ruling: finishRun lives in src/app/runFlow.ts (+resultFromState) — plan named it without a file — none
Task 15: Ruling: createRouter takes a screens map (camp/gear/... injected from main) — keeps router testable without menu screens — none
Task 15: Ruling: ?dev=run path removed per plan; dev params (t, skills) no longer reachable — perf flag comes in G17 — low
Task 15: Ruling: resumed run loses fallback bonusKor (+20s) earned before the save — RunState has no bonusKor field — ≤ a few dozen Kor
Task 15: verified headless: camp→run→reload→resume prompt→abandon→run end→camp, no page errors
Task 15: complete (commits aab8c44..b5a32d4, tests: npm test →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Task 16: Ruling: completeRun/abandonActiveRun/newId moved to src/app/actions.ts (router re-exports) — camp importing router pulled Phaser into happy-dom tests — none
Task 16: Ruling: settings import confirmation is an in-page "Kaydı değiştir" button instead of a browser confirm() dialog — dialogs block, testable — none
Task 16: Ruling: melting uses per-row 🔥 toggles + "Erit (N)" button; tapping a row equips — plan said "çoklu seçim" without UI detail — UX only
Task 16: verified headless: camp→run (cards picked)→pause→end→run end→camp→gear→tree screenshots, no page errors
Task 16: complete (commits b5a32d4..df5f61d, tests: npm test →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Task 17: Ruling: Phaser Scale.RESIZE at camera zoom 1 instead of FIT 540×960 — FIT letterboxed tall phones; RESIZE fills the screen, field of view now depends on device width — enemies spawn 560 px away, still off-screen on phones
Task 17: Ruling: perf mode is ?perf=1 on the app URL (applies to next dive) — plan put it on RunScene; same effect — none
Task 17: verified headless Chrome (software GL): SW active, manifest ok (portrait, 4 icons), offline reload shows camp, perf mode ~54 FPS with 292 enemies. Real-phone FPS and install NOT verified.
Task 17: complete (commits df5f61d..b3d86eb, tests: npm test →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Final review: self-review (subagent tool available but user did not ask for agents; author review is weaker than a fresh reviewer)
Final: fixed unreadable save silently replaced by a fresh one on next write — "bozuk kayıt okunamazsa ham hali yedeklenir" RED→GREEN, suite 124/124
Final: fixed returning from background left the run frozen with no UI — "arka plana geçince onHidden çağrılır" RED→GREEN + headless check (pause panel shown), suite 124/124
Final: fixed death ended the run from inside Phaser's update and destroyed the game mid-frame — deferred with setTimeout; headless death→run-end path verified (no unit test: needs Phaser canvas), suite 124/124
Final: minor (deferred): resumed run after boss spawned respawns the boss at full HP
Final: minor (deferred): camp idle amount doesn't tick while the camp screen is open (updates on next render)
Final: minor (deferred): resumed run loses fallback bonusKor earned before the save
Final: minor (deferred): sparks from enemies killed at the ring edge sit outside pickup range until the player moves
Sonrası (2026-11-27, pixel art sonrası):
- fixed: halka kenarında ölenlerin kıvılcımları toplanmıyordu — PLAYER_BASE.pickupRange 50 → 90 (test: toplama mesafesi > halka yarıçapı + 10). Ruling: denge değeri, plan sabitlememişti.
- fixed: devam edilen turda boss tam canla doğuyordu — RunState.bossHpRatio (eski kayıtlar normalizeRunState ile tamamlanır)
- fixed: devam edilen turda yedek karttan gelen Kor kayboluyordu — RunState.bonusKor
- fixed: kamp açıkken idle birikim sayısı donuktu — 30 sn'de bir yeniden çizim
- added: titreşim (hasar, seviye, ölüm) + ayarlarda aç/kapa; iOS Safari desteklemez
- added: düşman ölünce basamaklı sis bulutu efekti (havuzlu, en fazla 60)
