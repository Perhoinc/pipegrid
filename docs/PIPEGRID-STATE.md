# PIPEGRID — Project State & Handoff
*(v38 · July 2026 · pair with pipegrid38.html — the file IS the source of truth; this doc is the memory)*

## What this is
A browser-based pipe-layout visualiser: a finite catalogue of pipe parts placed on a grid by touch gestures, with directional flow, validation, multi-layer (3D) stacks, a bill-of-materials, and persistence. Built for iPad (Safari/WebKit), hosted on the owner's subdomain (one.com web space; the root domain points at Squarespace and CANNOT serve files — subdomain only). Design language: disciplined, manufacturable, drawing-office. Owner is a sculptor; treat the catalogue as a real fabrication kit.

## Hard technical constraints
- ONE self-contained vanilla-JS HTML file, script in an IIFE (the Claude-app preview runs inline scripts in shared scope; top-level consts collide → blank screen).
- WebKit touch quirks: permanent transparent `<rect id="hit">` ON TOP of a disposable `<g id="scene">`; `#scene *{pointer-events:none}`. WebKit cancels touch streams if the touched node is removed — never break this.
- Non-passive touchstart/move preventDefault on canvas + document; `overscroll-behavior` none/contain.
- localStorage works on the real domain, NOT in the Claude-app preview — storage calls are try/catch no-ops there.
- `window.__pg={state,serialize,validate,makeSmall,togglePart,render}` — all tests depend on it; never shrink it.

## THE MARK GRAMMAR (tightened in v38)
Two colours, two registers. **Pipe-coloured = structure. Amber = flow.**
- Rings are GEOMETRY, io-blind, permanent. ⊙ = opening faces up. **Under-ring** (painted before the channel; O3 r=12 under full-width runs, r=10 under half-covering spokes) = opening dives beneath its run, no mark. **Graded chevrons mean a SHARED VERTICAL BORE — a run — and nothing else** (v38 rule, owner-decreed after the faint-faint proposal was rightly rejected): full points along the pipe's body, faint (`GLYPH_FAINT=0.3`) marks the mouth. Bottom of a run ▲full/▼faint; top ▼full/▲faint; passing through both full. Parts with NO shared bore render as their constituent turns instead — see the bend pair below.
- Flow lives in TRACE: `traceVMark` draws amber ⊙/⊗ or amber chevrons (diverging/converging), pulsing, on top. Hint rings show the chevron of the opening the MATE must have.
- Icons: D language — amber inlet dots, amber-core Source, geometry pose marks. Icons never disagree with the canvas.

## Architecture (all in pipegrid38.html)
- **state**: parts[], rows/cols (max 24×28), tool, vari{tee,cross,cap}, pose{tee,elbow,straight,cross}, sel, lastTool, theme, layer, showVal/showFoot/showGhost, drag, downCell.
- **POSE**: a rotated fitting is the same fitting. `makeSmall(...,pose)` remaps port dirs. Tees: up/dn send branch=ports[1] to U/D; rr sends ports[0]→D, ports[2]→U (default rising). **Crosses (v38): one vertical pose, `vert`, same convention — ports[0]→D, ports[2]→U, horizontals rot-aimed.** `XGEOS={xbranch,xcross,xover,xbend}` is the family test; `poseFor` routes tee→pose.tee, cross family→pose.cross. This mapping makes xover's [[0,2],[1,3]] streams put the N–S stream vertical, and xbend's [[0,1],[2,3]] streams into exactly D+E / U+W — the twin elbows. Vert-tool fold-in stands: elbow poses → vup/vdn, straight poses → riser1/riser/**riser3** via `kindFor`; gesture gates `!kindFor(tool)` route posed base tools to the small-part path.
- **ROLE_SLOTS (v37)**: the variant you chose is sacred. The unique role port may only walk LEGAL slots — tsplit/tmerge [0,2] (which IS the rising↔descending flip in vertical poses), tsplitb/tmergeb [1] (pinned; trace-tap = clean no-op), xsplit/xmerge [0,1,2,3]. Applied in togglePart AND both snap searches. Caps keep their src↔snk trace flip (owner-decreed exception: a cap is a cap). autoOrient never flips SWAP-distinct kinds.
- **Snapping**: nearest port wins (tie by candidate order — known). Vertical snap constrains the vertical port; posed tees AND vert crosses walk the role among legal slots to mate (`(idx+3)%4` aims vert-cross horizontals to the nudge). Horizontal snap scores rot × legal-walk: mate-ok +10, branch-to-nudge +3, other +2, neutral +1, default io on ties.
- **Elbow gesture (v37)**: direction locks early; span = press-relative travel along the locked axis, dead until `ELBOW_SPAN_DEAD=0.65` cells, then one span per cell.
- **Selection**: `tapOwner` shared by all tap paths — first tap selects (halo + #selchip: name · pose mark · layer), consecutive taps rotate by owner type; deselect on empty tap/placement/erase/restore; invisible to undo.
- **Render order** (svgInner): grid → footprints → below-ghosts → **under pass** (under-rings; for vert xbend the ENTIRE D-elbow via `xbendUnder`: gradient defs + shadowed bore + gradient limb) → active channels → cap cores → hint rings → structural glyphs → above-ghosts → trace (arrows + amber vertical marks) → previews → halo → validation.
- **Vertical crosses render**: mixing kinds (xsplit/xmerge/xjunc vert) share one static dress — horizontal spokes + bore + through chevrons (variants are trace's story, as flat crosses share the +). **xover vert** = the overpass made literal: run breaks in a gap at ±16 straddling the bore, through chevrons (a real vertical run). **xbend vert = twin elbows**: U-limb in partPath (spoke to its ring, over, ⊙); D-limb entirely in the under pass with the SHADOW: linear gradients on casing+lumen from the port (normal) to dark at `XB_RAMP=0.65`, plateau to the bore; bore filled by a radial pit (`XB_PIT`); constants `XBEND_OFF=3, XB_DKC=0.7, XB_DKL=0.4`; `shade(hex,f)` mixes toward black. Rings offset ±XBEND_OFF toward each feed side — truthful here (two real bores). Known: the D-limb has no dash animation in trace (it lives outside partPath); ghosts of vert xbends show the U-limb only. `traceVMark` special-cases the pair: one amber mark per stream at each offset; stream-cycling (GRAY) flips one per tap, pose preserved.
- **Riser ×3 (v38)**: kind `riser3`, layers [L,L+1,L+2], ports D@L / U@L+2; middle floor owns no port — pure body, classifies "through". `riserFloorClass` generalised; `rehome` maps layers by index and pins riser3 port layers; snap isR includes it. Fourth slot in the Straight pose row (three-bay section icon).
- **Undo/zoom/gestures/pan**: unchanged from v36 (session-anchored pinch, CELL=44, PAD=1000, serialize-snapshot history 60).

## UI
Rail: Straight/Elbow/Tee/Cross/Cap → undo/redo/move/erase/trace → layer → VIEW → ⋯Board. H4 highlight (inset amber bar + tint). Pose rows with word labels via `POSE_DEF`: straight FLAT/×1/×2/×3, elbow FLAT/UP/DOWN, tee FLAT/BR▲/BR▼/RISER, **cross FLAT/VERT⇕** (⇕ icon = full run + neutral bore; the tee's rr mark is stub + bore). VIEW: toggles + zoom stepper + theme. BOARD: GRID → FILE → DANGER → hint. Cut list: layer sections carry orientation subtotals (POSE_MARK/POSE_SEQ incl. ⇕ and ⇅ for r1/r2/r3); STACK is a clean bill. **Risers bill as straights of their length** (riser1→Straight-1, riser→-2, riser3→-3); elbow span 1 unifies flat+up/dn; vert crosses subtotal ⇕ under their kind line.

## Persistence
localStorage `pipegrid.board.v1`, envelope v:3 unchanged across v36–38 (riser3 and `po:"vert"` are additive — older apps may reject files containing them; accepted). v:1/v:2 migrate as before. Save/Load as before.

## Roadmap (owner-ordered)
1. **Exploded/axonometric stack overview** (was parked; now next).
2. **Valve + flow propagation** (merger=OR, valve gives NOT/AND → universality).
3. **GitHub repo + Pages + Claude Code** as permanent home.

## Test pattern (jsdom)
Boot `{runScripts:"dangerously",pretendToBeVisual:true,url:"https://pipegrid.test/"}`; stub PointerEvent + set/releasePointerCapture on `.canvas`; rect mocks with PAD (svg left/top = 1000−scroll); scroll 1000,1000 re-pinned after boot rAF; dispatch on canvas; assert via __pg. **Traps**: autosave only writes after a MUTATION (check the envelope after clear, not at boot); flyout var/pose buttons exist only while their tool is active — switch tool BEFORE clicking them; tap places rot0 (spokes vertical); `opacity` follows `d` — match forward; jsdom drops self-closing tags; snap ties need clean neighbourhoods; restore/undo remint ids; verify every python replace (tagged, counted). v38 suite: test_v38.js, 36 assertions (vert crosses incl. gradient under-pass and stream cycling, snap walk, riser3 floors + hints, BOM, roundtrip, v37 regressions). NB the container hosting /home/claude resets between sessions — shipped files persist in /mnt/user-data/outputs; recover working copies from there and `npm i jsdom` fresh.

## Working style (owner)
Batched multi-point feedback; option widgets before big decisions; plans before implementation; static mockup boards before conventions (v38's bend-pair shadow was tuned across three board iterations — his rejection of the faint-faint chevron state produced the tighter grammar); hard-resets rejected versions; precise device feedback; iPad is the instrument — jsdom verifies logic, his thumb verifies feel. HTML ships every version; this STATE doc ships at majors. A plain-language PIPEGRID-GUIDE.md exists for the owner — keep it truthful at majors too.
