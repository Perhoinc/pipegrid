# PIPEGRID — A Plain-Language Guide
*What the application does, what every tool is for, and how the code behind it actually works — written for a reader who doesn't code. Current as of v37, July 2026.*

---

## 1 · What PIPEGRID is

PIPEGRID is a drawing board for pipe systems. You place parts from a fixed catalogue — straights, elbows, tees, crosses, caps — onto a grid, one cell at a time, using your fingers. Every part has openings ("ports"), every port has a direction, and flow runs through the whole system from sources to sinks. The board is three-dimensional: it has floors ("layers"), and parts can turn upward or downward and connect between floors. The app checks your work as you build (open ends, collisions, contradictory flow), shows you the whole system floor by floor, and writes you a bill of materials you could take to a workshop. It is deliberately strict, like a drawing office: a finite kit, one way to mean each thing, nothing decorative.

Everything lives in a single file, `pipegrid37.html`, which runs in the Safari browser on the iPad. There is no server and no account; the board saves itself into the browser's own storage, and you can export or import a board as a small file.

---

## 2 · The board

The grid floats in a large empty margin so you can pan freely. One finger draws; two fingers pan and pinch-zoom; a quick two-finger tap is undo, three fingers is redo. You are always looking at exactly one floor — the layer readout (L0, L1, …) in the rail tells you which. Parts on the floors below and above show as faint ghosts (warm below, cool above, fading with distance) so you can see the stack without leaving your floor.

**The core gesture rule: the gesture is the flow.** You press where the material comes *from* and drag the way it travels. A straight dragged east flows east. This one rule aims everything.

---

## 3 · The tools

The left rail holds five part tools, then the action tools, then the layer and menu controls.

**Straight** — pipes of length 1, 2 or 3 cells. Drag longer and the app automatically chains segments (a 7-cell drag becomes 3+3+1), pre-connected, as one undoable action. Its tray has a **pose row**: FLAT, RISER ×1, RISER ×2. The riser poses are the same straight turned on end — a vertical pipe passing through one floor, or spanning two. Tap to place them.

**Elbow** — quarter-turn arcs, span 1 to 6. Drag to aim: the first few pixels lock the direction, curling the drag picks which way the arc bends, and how far you travel sets the span (there's a deliberate dead zone so a small aiming nudge never accidentally grows the span). Its pose row — FLAT, UP, DOWN — turns the elbow out of the plane: a pipe that arrives horizontally and turns toward the ceiling or the floor.

**Tee** — the branching part, with four variants in its tray: Split·run, Split·branch, Merge·run, Merge·branch. "Split or merge" says whether one stream becomes two or two become one; "run or branch" says whether the special port (the single inlet of a split, the single outlet of a merge) sits on the straight-through run or on the side branch. The tee's pose row — FLAT, BR ▲, BR ▼, RISER — twists the same fitting vertically: branch opening upward, downward, or the run itself standing vertical with the branch teeing off sideways.

**Cross** — four-way parts: a 1-into-3 split, a 3-into-1 merge, a 2-by-2 junction, and two "two independent streams" parts (an overpass where the streams don't mix, and a bend pair). Vertical poses for crosses are the next planned addition.

**Cap** — the ends of the world: Source (flow begins here — its icon has an amber core) and Sink (flow ends here).

**Move, Erase, Trace** — Move drags a part to a new cell; Erase deletes what you tap; **Trace** is the flow inspector: the pipes animate in the true direction of travel, amber arrows appear at ports, vertical flow shows as pulsing amber marks in the rings, and tapping a part flips its flow *within its variant* — a Split·run can swap which run end feeds it, a cap can swap source↔sink, but no tap ever turns one variant into another. That is a hard rule of the whole app: the part you chose is the part you have.

**Tap-to-inspect** — with any part tool active, tapping a placed part selects it: an amber halo appears and a small chip names it (what it is, its pose, its floor). Tapping it again rotates it. Tapping empty ground deselects.

**Snapping** — pressing an empty cell right beside an open port pre-connects your new part to it. The connection anchors just that one opening; your nudge still chooses how the rest of the part swings.

---

## 4 · The mark language

The board speaks in two colours. **Pipe-colour means structure — what is physically there. Amber means flow — where material travels.** They never trade jobs.

Vertical openings are drawn as rings, read like a plan view from above:

- **Ring with a dot (⊙)** — this opening faces up, toward you.
- **Ring underneath the pipe** — this opening dives down, beneath its run. You see only the sliver of circle peeking out from under the pipe, exactly as you would looking down at the real thing. It needs no symbol; the overlap says it.
- **Ring with two chevrons (▲▼)** — a vertical pipe passes this floor. The *strong* chevron points along the pipe's body; the *faint* one marks the mouth. So the bottom of a vertical run shows a strong ▲ (pipe above me) and a faint ▼ (opens downward here); the top shows the reverse; a floor the pipe merely passes through shows both strong. Climbing the layers, the chevrons roll over exactly where the run ends — the marks literally draw its extent.

Because these marks describe geometry, they never change once a part is placed. Flow — rising or falling, this way or that — is the amber, pulsing story you see only in Trace mode. Dashed rings are previews: they mark where an opening from another floor is waiting for a mate, drawn with the chevron of the part you'd need to place.

---

## 5 · Menus and the cut list

**VIEW** holds the things that change how you look: Ghost layers, Footprints, Validate on/off, then the zoom stepper and the Carbon/Workshop theme. **⋯ (Board)** holds the things that change the document: grid size, save and load, and — separated at the bottom in warning red — Clear layer and Clear.

Tapping the **PARTS** count opens the **cut list**. Each floor gets its own section, with orientation noted where it matters (`flat ×3 · ▲ ×1 · ⇅ ×1`) — your reference during construction. The **STACK** section beneath is the clean bill of materials: one line per physical part, no orientations, because a rotated fitting orders as the same fitting. Elbows and their vertical twins are one line; risers count as straights of their length. A Copy button gives you the same list as plain text.

**Validate** (on by default) marks three kinds of trouble: open ends that want a mate, collisions, and flow clashes — two ports pushed together that both feed or both drink. Contradictions never block you from placing; they just get marked, so you can sketch fast and resolve later.

---

## 6 · How parts connect

Every part knows its ports: for each opening, a cell, a direction (north, east, south, west, up, down), and whether flow comes *in* or goes *out* there. Two ports are mated when they face each other across a shared boundary — east meets west across a gridline, and an up-port on floor 0 meets a down-port directly above it on floor 1. When you place a part, the app looks up its ports in a directory of every port on the board; matched pairs become connections, unmatched ones become "open" markers, and pairs whose in/out disagree become flow-clash markers. That directory is rebuilt from scratch every time anything changes, which is why the checking never drifts out of date.

---

## 7 · How the code works (for someone who doesn't read code)

You don't need to read a line of it to understand the machine. Here is the whole thing in plain terms.

**One file, three languages.** `pipegrid37.html` contains three kinds of writing, and the browser knows which is which. *HTML* is the skeleton — it says "there is a drawing area, there is a rail of buttons, there is a popover." *CSS* is the appearance — colours, sizes, the amber accent, the two themes (switching theme just swaps one palette of named colours for another; nothing else moves). *JavaScript* is the behaviour — everything that happens when you touch the screen. Think of a puppet theatre: HTML builds the stage, CSS paints it, JavaScript pulls the strings. Roughly nine-tenths of the file is JavaScript.

**The notebook: `state`.** At the heart of the program is one object called the *state* — think of it as a single notebook where absolutely everything true about your session is written down: the list of every placed part, the grid size, which tool is active, which pose is set, which floor you're on, what's selected, which view toggles are on. Nothing important lives anywhere else. If the notebook says there's a Split·run at row 4, column 6, floor 1, then there is one; if it doesn't, there isn't. Every rule in the app is really a rule about what may be written in this notebook.

**The catalogue: `CAT`.** The parts themselves are described in a catalogue — a table that says, for each kind of part, where its openings sit, which are inlets and which are outlets, and what shape it is. When you place a tee, the program doesn't invent a tee; it copies the catalogue entry, rotates it, applies your pose, and writes the result into the notebook. This is why the kit is finite and consistent: there is exactly one definition of each fitting, and every placed copy descends from it.

**The picture is redrawn, never edited.** Here is the single most useful thing to know: the app never "moves" anything on screen. Every time the notebook changes — every placement, every rotation, every layer switch — a function called `render` throws the entire picture away and redraws it from the notebook, in a strict order: grid lines first, then ghosts of other floors, then the under-rings (so pipes can cover them), then the pipes, then the rings and chevrons, then trace arrows, then previews and markers. Like a patient animator redrawing the whole frame. This sounds wasteful but is the app's greatest strength: the screen can never disagree with the notebook, because the screen is nothing *but* the notebook, drawn. The layered draw order is also how the "opening dives under the pipe" effect works — it isn't a trick, the ring genuinely is painted first and the pipe genuinely covers it.

**Fingers become parts.** The browser reports raw touch events — finger down here, moved there, lifted. A set of *listeners* (functions that wait for these reports) interprets them: how many fingers, how far, how fast, which cell. One finger on the grid becomes a placement gesture; the interpretation runs through the same questions you'd ask — which tool? which pose? is there an open port next door to snap to? which way is the nudge? — and produces a new catalogue-copy to write into the notebook. Then `render` runs, and you see it.

**Undo is a stack of photocopies.** Before any change is written, the app makes a compact photocopy of the notebook and puts it on a pile (it keeps the last sixty). Undo takes the top photocopy and copies it back over the notebook; redo goes the other way. This is also why selecting a part doesn't clutter your undo history: selection is deliberately left out of the photocopy.

**Saving is writing the notebook as a letter.** The photocopy format is called *JSON* — plain structured text that both people and programs can read. If you open a saved board file, you'll see it: a short header (which app, which version of the format, which theme) and then one small entry per part — its kind, rotation, cell, floor, flow directions, pose. Autosave writes this letter into the browser's private storage after every change; Save downloads it as a file; Load reads one back and rebuilds every part from the catalogue. The version number in the header is why old files keep working: the loader knows how to read every format the app has ever written.

**A few quirks with reasons.** All the code is wrapped in one sealed envelope (an *IIFE*) so it can't collide with anything else on the page. The layer your finger actually touches is an invisible sheet floating above the drawing — because Safari cancels a touch mid-gesture if the thing under your finger gets redrawn, and our drawing gets redrawn constantly; the invisible sheet never does. And zoom doesn't recalculate the drawing — it just tells the browser to display the same drawing larger, which is why pinching is smooth.

**The robot iPad.** Alongside the app there is a test suite: a program that boots PIPEGRID inside a simulated browser, fakes finger presses and drags, and then checks the notebook and the picture — fifty-six checks as of v37, from "a snapped Split·run never turns into a Split·branch" to "the riser's faint chevron sits on the correct side of each floor." Every new version must pass all of them before it ships. The tests verify the logic; your thumb verifies the feel — both are needed, neither replaces the other.

---

## 8 · Small glossary

**State** — the one notebook holding everything true right now. **Render** — redrawing the whole picture from the state. **Function** — a named block of instructions the program can run on demand (`render`, `validate`, `makeSmall` — the part-maker). **Port** — one opening of a part: cell + direction + in/out. **Pose** — the same fitting rotated into the vertical (flat, branch-up, branch-down, riser-run…). **Kind / variant** — which catalogue entry a part is (Split·run, Merge·branch…); by hard rule, nothing ever converts one into another. **JSON** — the plain-text letter format used for saves and undo photocopies. **Listener** — a function waiting for a touch, click, or key. **SVG** — the drawing language the picture is written in: shapes described as text ("a circle here, this radius, this colour"), which is why the app can build the whole scene as one long string and hand it to the browser. **jsdom** — the simulated browser the robot-iPad tests run in.
