# PIPEGRID — Parts Library Spec (working document)

*(started 2026-08-17, alongside v38 · pairs with `docs/PIPEGRID-STATE.md` for the current
build's actual code, and with the 3D-view test boards in `boards/pipegrid-3d-*` for the
interaction model this catalogue will eventually be placed with)*

## Why this document exists

The current catalogue (`CAT` in `index.html`) grew one version at a time: each part was
added by hand when a session needed it. That worked, but it left gaps and inconsistencies
that only show up when you go looking — most importantly, a part that's meant to exist in
more than one orientation (an elbow that goes flat or vertical, a straight run that goes
flat or vertical) is currently **two separate hand-built parts**, not one shape rotated.
`vup`/`vdn` are their own fixed-size, fixed-orientation kind, entirely disconnected from the
general, resizable flat elbow. Same split between `straight` and `riser1`/`riser`/`riser3`.

The owner-decreed direction (confirmed 2026-08-17): **every part should be able to rotate
into any of its valid orientations in 3D space** — not just flat, or flat-plus-one-vertical-
tip. That means one shape definition per physical topology, with orientation as pure
geometry, decoupled from which "kind" a part is. This document is where that catalogue gets
worked out before any of it touches `index.html`.

## Vocabulary

- **Direction** — one of six: N, E, S, W, U, D. Opposite pairs: {N,S}, {E,W}, {U,D}. There
  is no seventh "center" direction — a cap's single port just faces whichever of the six
  directions it's posed toward.
- **Port** — an opening on one face of a part's cell, in one of the six directions.
- **Connectivity pattern** (a.k.a. shape, topology) — *which* directions have ports, with no
  regard yet to how flow moves through them. This is the part's physical silhouette — what
  you'd see if you looked at the empty fitting with no flow running through it.
- **Flow topology** — given a fixed connectivity pattern, how flow actually moves: which
  ports are in vs. out, and for 4+ port shapes, which ports pair up as through-streams that
  don't mix with the others (the existing `xsplit`/`xmerge`/`xjunc`/`xover`/`xbend` are five
  different flow topologies sharing the *same* 4-port connectivity pattern).
- **Pose** — the specific rotation (of the 24 orientation-preserving rotations of a cube)
  that maps a shape's canonical/local directions onto actual world directions. "A rotated
  fitting is the same fitting" (existing hard law) means pose never creates a new catalogue
  entry — it's applied at placement time.

## Connectivity patterns, by port count

Worked out directly (not estimated): for each port count 1 through 6, how many genuinely
different connectivity patterns exist once rotation is accounted for. Two patterns are the
same shape if some rotation of the cube maps one onto the other.

| Ports | Patterns | Description | Status |
|---|---|---|---|
| 1 | 1 | Cap — a single opening | existing (`src`/`snk`) |
| 2 | 2 | **Straight** — an opposite pair | existing |
| 2 | ↑ | **Elbow** — an adjacent pair | existing |
| 3 | 2 | **T** — one shape, two port roles: a "run" (two ports opposite each other) plus a "branch" (the third, perpendicular to both) | existing |
| 3 | ↑ | **Corner** — three mutually perpendicular ports, no opposite pair, meeting at a cube vertex | **new** (owner-confirmed 2026-08-17) |
| 4 | 2 | **Cross** — all four ports of one flat plane (two full opposite pairs) | existing |
| 4 | ↑ | **Corner-through** — a corner fitting with one of its three arms extended straight out the far side | **new** |
| 5 | 1 | **Five-way** — every direction open except one | **new** |
| 6 | 1 | **Six-way** — every direction open, the maximum | **new** |

Nine connectivity patterns total. Five already exist in some form in the current catalogue;
four do not (corner, corner-through, five-way, six-way). Per the owner's 2026-08-17
direction, all nine are wanted — completeness across every port-count tier is the goal, not
a curated subset.

## Policy: enumerate everything, activate selectively

Owner-decreed 2026-08-17, applies to every flow-topology pass below: work out the *complete*
set of mathematically distinct flow topologies for a shape, then mark each one active,
inactive, or uncertain. Inactive entries stay fully specified, just not offered as buildable
parts yet — turning one on later is a status change, not a rediscovery. Nothing gets left out
of the spec just because it isn't wanted for fabrication right now.

## Construction rule: straight vs. elbow (confirmed against the existing 2D renderer)

For any flow topology with exactly one port in the minority role — one inlet against
multiple outlets, or one outlet against multiple inlets; every split and merge variant, but
not balanced flows like `xjunc` — the existing renderer already applies one simple, uniform
rule, confirmed by reading it directly (`geo:"tee"` path, `index.html`): call the
minority-role port the anchor. For every other port, draw a straight channel to it if that
port sits directly opposite the anchor, and draw a quarter-arc (an elbow) to it if it's
merely adjacent. This isn't a per-part design choice made by hand — it's mechanical, and it
already produces every tee shape in the current app.

Consequence, confirmed against the code and the owner's sketch (2026-08-18): this one rule
automatically decides whether a split/merge variant reads as a **T** (a straight run with an
elbow tap) or a **Y** (two elbows, no straight segment at all) — nobody chooses between those
two shape-families by hand, it falls out of which specific port ends up as the anchor.

- **T-shaped**: happens whenever the anchor's directly-opposite port is *also* one of the
  shape's other ports. `tsplit`/`tmerge` (anchor = one end of the run) are T-shaped — the
  run's other end is opposite the anchor, so it draws as a straight; the branch is merely
  adjacent, so it draws as an elbow.
- **Y-shaped**: happens whenever *none* of the shape's other ports is directly opposite the
  anchor. `tsplitb`/`tmergeb` (anchor = the branch) are Y-shaped — the branch's opposite
  direction isn't a port on this shape at all, so both connections come out as elbows, with
  no straight segment anywhere.
- **Corner is always Y-shaped by this rule, no exceptions** — it has no opposite pair among
  its three ports at all, so any anchor's two connections are always both elbows. It doesn't
  read as a flat Y, though: corner's three arms point in three mutually perpendicular
  directions rather than two roughly-opposing ones plus a stem, so the same construction rule
  produces a genuinely different-looking result — a true 3D corner joint, not a Y.

Scope: this only covers the single-anchor case. Balanced flows (`xjunc` and its like) have no
single port in the minority role and are built differently in the existing code — open
question, noted below, whether the newer balanced splits (the adjacent-inlet cross junction,
corner-through's eventual 2-in-2-out layer) need their own version of this same kind of rule.

## Flow topology, by connectivity pattern

Method: for a shape's ports, work out (a) how many genuinely different in/out role-splits
exist given the shape's *own* rotational symmetry (not the full 24 — only the rotations that
map the shape back onto itself), and (b) for split counts of 4+ where two separate streams
could pass through without mixing, whether keeping them separate is itself a distinct,
further variant. Validated first against the three shapes whose answers are already known
from the existing catalogue.

- **Straight** — 1 flow topology. Flipping which end is in/out doesn't change the 1-in/1-out
  count, so it's a placement detail, not a separate catalogue entry. Matches existing.
- **Elbow** — 1 flow topology, same reasoning. Matches existing.
- **T** — 4 flow topologies: split with the inlet on the run vs. on the branch, merge with the
  outlet on the run vs. on the branch (`tsplit`/`tsplitb`/`tmerge`/`tmergeb`). The run's two
  ends are interchangeable with each other but not with the branch, which is what produces
  exactly these four and no more. Matches existing. Per the construction rule above,
  `tsplit`/`tmerge` are T-shaped and `tsplitb`/`tmergeb` are Y-shaped — two visually distinct
  families sharing the same four-topology count.
- **Corner** — 2 flow topologies: split (one in, two out) and merge (two in, one out). All
  three ports are interchangeable with each other (unlike the T), so unlike the T there's no
  further "which port" distinction — just the count-split. Both **active**. Always Y-shaped
  by construction (see above), reading as a 3D corner joint rather than a flat Y.
- **Cross** — 7 flow topologies, not the 5 currently built:
  - Split 1→3 (`xsplit`) — **active**, existing.
  - Merge 3→1 (`xmerge`) — **active**, existing.
  - General (mixing) junction, the two inlets opposite each other (`xjunc`) — **active**,
    existing.
  - General (mixing) junction, the two inlets *adjacent* to each other instead — **active**,
    new. Owner-confirmed wanted 2026-08-17. Not reachable from `xjunc` by any rotation; it's
    a structurally different shape, same as corner is from T.
  - Two full straight runs crossing without mixing (`xover`) — **inactive** (known,
    fabrication not wanted right now), existing.
  - Twin elbows curving in opposite rotational senses (`xbend`) — **inactive**, existing.
  - Twin elbows curving in the *same* rotational sense (a "pinwheel," vs. `xbend`'s
    figure-eight) — **uncertain**. Structurally distinct from `xbend`, confirmed by the same
    symmetry method, but unclear whether it's physically buildable as a compact single
    fitting, and unclear from description alone what it even looks like. Needs a picture
    before it can be marked active/inactive/dropped.
- **Corner-through** — 16 flow topologies total, all new (the shape itself is new).
  1-in-3-out / 3-in-1-out layer (4, all **active**, owner-confirmed 2026-08-18 via mockup
  board):
  - Split, the straight-stem end is the inlet — flow continues out the far stem end *and*
    branches down both corner arms. The far stem end is opposite the anchor, so this is
    **T-shaped**: one straight through-segment plus two elbow taps (an "elaborated T" with a
    branch on each side instead of one).
  - Split, a corner arm is the inlet — flow exits the *other* corner arm and *both* stem
    ends at once. Nothing in this shape is opposite a corner arm, so this is **Y-shaped**,
    but a three-way one: all three connections are elbows, no straight segment — a tripod
    off the one inlet.
  - Merge — the mirror of each of the above, same shapes.

  2-in-2-out layer (12, all **inactive** — owner-judged non-viable on inspection via mockup
  board, 2026-08-18, no specific reason logged):
  - 4 mixing variants: stem-in/arms-out, arms-in/stem-out, and the two ways to pair one stem
    end with one arm as the inlets.
  - 8 non-mixing variants, less symmetric than cross's equivalent layer so more of them stay
    distinct rather than collapsing into each other: 2 from pairing the stem together and the
    arms together (one has a genuine straight run through the stem plus a separate elbow
    between the arms), and 3 each from the two ways of pairing a stem end with an arm
    (all-elbow, no straight segment, differing only in which specific ports feed which).

  Net result for this shape: the simpler single-anchor splits and merges hold up as real
  parts; the busier balanced-flow layer, once actually visible, didn't.

## Open / deferred

- **Cross pinwheel** — needs a visual before it can be classified. See above; the mockup-board
  method used for corner-through's 2-in-2-out layer is the natural way to resolve this too.
- **Construction rule for balanced (no-single-anchor) flows** — the straight/elbow rule above
  only covers splits and merges with one minority-role port. `xjunc` and its kin already have
  their own hand-built rendering in the existing code; not yet checked whether that
  generalizes the same way, or needs its own version of the rule, once the newer balanced
  variants (adjacent-inlet cross junction, corner-through's 2-in-2-out layer) get worked out.
- **Manufacturability sanity check.** Five-way and six-way fittings are real hardware but
  less common than the smaller shapes — worth confirming on the iPad later that they still
  read as "real kit" and not just combinatorics for its own sake.
- **Pose mechanics.** Not yet designed: how a shape's canonical local directions actually map
  through the 24-rotation pose system in code (today's `rot` field only spans 4 flat
  rotations plus a couple of hand-built vertical exceptions). Comes after the shape/flow
  enumeration is settled, since it needs to serve whatever the final shape count turns out
  to be.

## Next

Five-way and six-way, which haven't been touched at all yet. The cross pinwheel is also still
open and can be resolved the same mockup-board way whenever it's convenient.
