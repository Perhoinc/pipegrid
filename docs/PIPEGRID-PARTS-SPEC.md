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
| 3 | 2 | **T** — an opposite pair plus one more (a run with a branch) | existing |
| 3 | ↑ | **Corner** — three mutually perpendicular ports, no opposite pair, meeting at a cube vertex | **new** (owner-confirmed 2026-08-17) |
| 4 | 2 | **Cross** — all four ports of one flat plane (two full opposite pairs) | existing |
| 4 | ↑ | **Corner-through** — a corner fitting with one of its three arms extended straight out the far side | **new** |
| 5 | 1 | **Five-way** — every direction open except one | **new** |
| 6 | 1 | **Six-way** — every direction open, the maximum | **new** |

Nine connectivity patterns total. Five already exist in some form in the current catalogue;
four do not (corner, corner-through, five-way, six-way). Per the owner's 2026-08-17
direction, all nine are wanted — completeness across every port-count tier is the goal, not
a curated subset.

## Open / deferred

- **Flow-topology limitations.** The owner has indicated there will be limitations placed on
  which flow-topology variants are actually offered within some of these connectivity
  patterns (i.e., not necessarily every mathematically possible in/out and stream-pairing
  arrangement for the busier shapes will become a real catalogue entry). Not yet specified —
  deferred to a later pass, once the flow-topology enumeration itself is on the table to
  react to. Noted here so it isn't lost.
- **Manufacturability sanity check.** Five-way and six-way fittings are real hardware but
  less common than the smaller shapes — worth confirming on the iPad later that they still
  read as "real kit" and not just combinatorics for its own sake.
- **Pose mechanics.** Not yet designed: how a shape's canonical local directions actually map
  through the 24-rotation pose system in code (today's `rot` field only spans 4 flat
  rotations plus a couple of hand-built vertical exceptions). Comes after the shape/flow
  enumeration is settled, since it needs to serve whatever the final shape count turns out
  to be.

## Next

Flow-topology pass, one connectivity pattern at a time — for a given shape, how many
genuinely different ways flow can move through its ports. Start with the smaller/simpler
shapes already partly explored (straight, elbow, T) to confirm the method, then the busier
new ones (corner, cross, corner-through, five-way, six-way) where there's more room for flow
to vary.
