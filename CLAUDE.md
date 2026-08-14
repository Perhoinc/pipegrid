# CLAUDE.md — PIPEGRID project memory

Read this first, every session. `docs/PIPEGRID-STATE.md` holds the full technical
memory (architecture, conventions, test traps) — read it before touching `index.html`.
This file holds the laws and the working protocol.

## What this project is
PIPEGRID: a touch-driven pipe-layout visualiser for iPad Safari. ONE self-contained
vanilla-JS file, `index.html` (currently v38). No frameworks, no build step, no server.
It is a fabrication-planning instrument for the owner's sculpture practice — treat the
part catalogue as a real physical kit.

## THE OWNER PROTOCOL (most important section)
The owner, Petter, is a sculptor and does not read or write code. He is the
**director**; Claude is the **builder**. This has worked through four major versions.
Keep it working:

1. **Explain in plain language, never in code.** Describe changes by their behaviour
   and appearance. `docs/PIPEGRID-GUIDE.md` is the owner's own plain-language manual —
   match its vocabulary (the notebook, redrawing the picture, ports, poses).
2. **Plans before builds.** For anything non-trivial, state a short plan and get a
   yes before editing.
3. **Static mockup boards before conventions or UI changes.** Build a self-contained
   HTML board in the app's exact chrome showing the options side by side (13 examples
   in `boards/`), let him judge on the iPad, THEN implement. Never skip this for
   visual-language decisions.
4. **Ask focused questions at real forks**; accept batched multi-point feedback and
   answer it point by point.
5. **His thumb is the second test suite.** jsdom verifies logic; only the device
   verifies feel. Flag what needs device judgement (legibility, gesture feel,
   tunable constants) explicitly.
6. **He hard-resets rejected directions.** In git this means: revert cleanly, don't
   layer patches over a rejected idea.

## HARD LAWS (owner-decreed, never violate)
- **No part ever converts to a different variant** — not by rotation, trace-tap,
  snapping, or any walk. `ROLE_SLOTS` encodes the legal role-port positions per kind.
  Sole exception: caps flip src↔snk in trace (a cap is a cap).
- **The mark grammar**: pipe-coloured = structure, amber = flow. Rings are geometry
  (⊙ opens up; under-ring dives beneath its run; graded chevrons mean a SHARED
  vertical bore and nothing else — full = pipe body, faint = mouth). Flow appears
  only in trace mode. Icons never disagree with the canvas.
- **A rotated fitting is the same fitting**: poses never multiply the catalogue or
  the bill of materials (one line per physical part; orientation only in layer
  detail).
- **Never bump the save-file schema (currently v:3) without a migration path.**
  Old boards must always load.
- The IIFE wrapper, the invisible hit-rect over the disposable scene, and the
  full-redraw render model are load-bearing WebKit decisions. Do not "improve" them.

## Engineering discipline (proven over v35–v38)
- Edit via small tagged replaces; verify each applied (count before, confirm after).
  Silent no-op replaces have caused bugs twice.
- `npm test` (jsdom suite, `test/test.js`) must be green before any commit that
  touches `index.html`. Grow the suite with every feature. The suite's hard-won
  traps are listed at the bottom of `docs/PIPEGRID-STATE.md` — read them before
  writing tests.
- Tunable feel-constants are named at the top of the script (`GLYPH_FAINT`,
  `ELBOW_SPAN_DEAD`, `XBEND_OFF`, `XB_*`). When the owner asks for "a bit more/less",
  it is usually one of these.
- Version discipline: `index.html` is always THE current build. Each shipped version
  = one commit tagged `v<N>` (continue from v38; next is v39). Copy the outgoing
  build into `archive/` before major rewrites. Update `docs/PIPEGRID-STATE.md` at
  major versions; keep `docs/PIPEGRID-GUIDE.md` truthful for the owner at majors too.

## Publishing
GitHub Pages serves `index.html` at the repo's Pages URL — that URL is what the
owner opens on the iPad. "Publish" = commit + push to the default branch; Pages
updates automatically. Never push a red test suite.

## Roadmap (owner-ordered, v38 state)
1. Exploded/axonometric stack overview (multi-floor visualisation).
2. Valve part + flow propagation (merger=OR; valve gives NOT/AND → logic).
3. (done in v38: full vertical mirror — tees, crosses, Riser ×3.)

## Session start ritual
1. Read this file and `docs/PIPEGRID-STATE.md`.
2. Run `npm test` to confirm the baseline is green.
3. Tell the owner, in plain language, where the project stands and what's next.
