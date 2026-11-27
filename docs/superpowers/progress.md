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
