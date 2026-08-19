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

**Extended to balanced/mixing flows (resolved 2026-08-18, owner's own sketch):** a mixing
junction — several ports sharing the in role, several sharing out, everything blending
together — is drawn the exact same way, just with more pairs: connect *every* inlet to
*every* outlet, straight if that specific pair is directly opposite, elbow if merely adjacent.
Mixing isn't a separate rendering case with its own logic; it's the same per-pair rule with no
single anchor to route through, so it routes through all of them. This wasn't a new rule
layered on top of the old one — it's the same rule finally applied everywhere it should have
been from the start. Retired the standalone "plain spokes to a shared centre point" technique
entirely; nothing in the spec uses it anymore.

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
    Reconfirmed 2026-08-18 via mockup board, with a reason this time (see below).
  - Twin elbows curving in the *same* rotational sense (a "pinwheel," vs. `xbend`'s
    figure-eight) — **inactive**. Resolved 2026-08-18: structurally distinct from `xbend`
    (confirmed by the same symmetry method) and now confirmed buildable and legible once
    actually rendered, but judged not wanted.

  **Owner's stated reasoning (2026-08-18):** every non-mixing, multi-stream variant gets
  rejected for the same reason — confirmed this is the actual reasoning behind `xover`,
  `xbend`, the pinwheel, and all twelve of corner-through's non-mixing layer, not just a
  hypothesis. They read as *two* independent parts sharing a cell, not one physical fitting —
  each stream is its own self-contained thing, and occupying the same cell doesn't make them
  a single part. Now a settled rule, not a per-case judgment call — see Rules of thumb below.
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

  2-in-2-out layer (12 total, mixed verdict — see revision below):
  - 4 mixing variants (stem-in/arms-out, arms-in/stem-out, and the two ways to pair one stem
    end with one arm as the inlets) — **active**, owner-confirmed 2026-08-18. Originally
    rejected as aesthetically broken (arms meeting a shared chamber at a hard right angle).
    That verdict was on the *rendering*, not the shape: it was drawn as plain spokes into one
    shared centre point, which really does look bad for a shape with a distinguished stem
    plus separate perpendicular arms. Redrawn per the owner's sketch using the extended
    construction rule (every inlet to every outlet, straight/elbow per pair) instead of a
    shared centre, and all four read as legitimate parts. Two of the four come out all-elbow
    (stem-in/arms-out and its mirror); the other two pick up one straight segment where an
    opposite relationship spans the in/out split.
  - 8 non-mixing variants (2 from pairing the stem together and the arms together — one has a
    genuine straight run through the stem plus a separate elbow between the arms — and 3 each
    from the two ways of pairing a stem end with an arm, all-elbow, no straight segment) —
    still **inactive**, unaffected by the above. Rejected under the "two parts, not one" rule
    (separate non-touching streams reading as two parts), which is a different problem with a
    different fix — not a rendering-technique issue, so the elbow-based redraw doesn't apply
    here and doesn't need to.

  Net result for this shape: single-anchor splits/merges and mixing junctions all hold up as
  real parts; only the non-mixing layer is rejected, and for a reason specific to it.
- **Five-way** — a complete flat cross (N/E/S/W, all mutually equivalent) plus one extra port
  (the "apex," here called U) with nothing opposite it — structurally, cross plus one more.
  1-in-4-out / 4-in-1-out layer (4, all **active**, owner-confirmed 2026-08-18 via mockup
  board):
  - Split, apex is the inlet — nothing opposes the apex, so all four connections down to the
    flat ports are elbows: a four-way starfish, no straight segment.
  - Split, a flat port is the inlet — its opposite flat port gets a straight segment, the
    other two flat ports plus the apex all get elbow taps: an elaborated T with three
    branches instead of one.
  - Merge — the mirror of each of the above, same shapes.

  2-in-3-out / 3-in-2-out layer (mixing half resolved; non-mixing half not built):
  - 6 mixing variants — **active**, owner-confirmed 2026-08-18, drawn with the extended
    construction rule from the start (every inlet to every outlet), not the retired spoke
    technique. Three distinct ways to pick the minority side: apex + one flat port (1 straight
    segment, 5 elbow), two opposite flat ports (all 6 elbow — the one opposite relationship in
    play stays entirely on one side of the in/out split), two adjacent flat ports (2 straight,
    4 elbow — now *both* flat-port opposite relationships get split across in and out). Split
    and merge of each share the same shape, mirrored.
  - Non-mixing variants also exist in this layer (multiple ways two inflows could feed
    different non-touching subsets of the three outflows) but weren't built — Rule 1 rejects
    them regardless of the exact count, so there's nothing to gain from a mockup there.
- **Six-way** — every direction open, the maximum port count. Every port is equivalent to
  every other under the shape's own symmetry (the full 24-rotation group acts transitively on
  the six directions), so — unlike five-way, which has a distinguished apex — there's no
  special port to single out at the connectivity-pattern level.

  1-in-5-out / 5-in-1-out layer (2, **active**, owner-confirmed 2026-08-18 via mockup board):
  - Split or merge, any port as anchor — every other tier's single-anchor layer had to
    distinguish "run" vs. "branch" ports or "flat" vs. "apex" ports; six-way doesn't, because
    every port has the same relationship to the anchor. The anchor's opposite is always
    present (all six directions exist), so it's always one straight segment plus four elbows,
    regardless of which port is chosen as anchor — a single flow topology per direction, not
    several.

  2-in-4-out / 4-in-2-out mixing layer (4, **active**, owner-confirmed 2026-08-18, built with
  the extended construction rule from the start):
  - Opposite pair in (e.g. N,S) — no opposite relationship crosses the in/out split, so all
    eight inlet-to-outlet connections are elbows.
  - Adjacent pair in (e.g. N,E) — each inlet's opposite now sits on the outlet side, so two of
    the eight connections come out straight (N–S and E–W), the other six elbows.
  - Merge — the mirror of each of the above, same shapes.

  3-in-3-out mixing layer (2, **active**, owner-confirmed 2026-08-18, new territory — the
  first genuinely balanced split in the whole catalogue):
  - **T-type** inlets — the three inlets include one full opposite pair plus one more (e.g.
    N,S,E in). One straight segment (the third inlet to its opposite, which sits on the
    outlet side) plus eight elbows — nine connections total, the busiest single panel built so
    far.
  - **Corner-type** inlets — the three inlets are mutually perpendicular, one from each
    opposite pair, no pair among them (e.g. N,E,U in — the same "one from each axis" pattern
    as the corner connectivity pattern itself). Here *every* inlet's opposite lands on the
    outlet side, so all three activate as straight segments — three straight plus six elbow,
    still nine connections, but a different mix than T-type.
  - **No separate merge variant for either** — confirmed algebraically, not just by
    inspection: for both T-type and corner-type, the complement of the inlet set (swap every
    in to out and vice versa) is a set of the *same* type, and there's a proper rotation of
    the cube that maps one onto the other exactly, port-by-port, role-consistent. That means
    "T-type-in" and its complementary "T-type-out" are literally the same flow topology, just
    posed differently — not two catalogue entries. This is new: every other tier's split/merge
    pair has *different* port counts on each side (1 vs. 5, 2 vs. 4, 1 vs. 2...), which is
    exactly what makes split and merge distinct there — a rotation can't turn a 1-port set
    into a 5-port set. Six-way's 3-in-3-out is the only balanced split in the whole catalogue,
    and that balance is what makes the self-complementary rotation possible.

  Non-mixing variants also exist in both mixing layers (inlets and outlets pairing off into
  independent through-streams that don't touch) but weren't built — Rule 1 rejects them
  regardless of the exact count, same as every other tier's non-mixing layer.

  Eight flow topologies total, all **active** — the entire connectivity pattern resolved
  without a single rejection, the only tier where that's true.

## Rules of thumb (owner-confirmed 2026-08-18, apply going forward without re-deriving)

1. **Two parts, not one.** Any non-mixing, multi-stream variant — separate streams that never
   touch, just happening to share a cell — reads as two independent parts occupying the same
   space, not a single fitting. Reject on sight; don't wait for a mockup to confirm.
2. ~~No right-angle branching into a mixing chamber~~ — **retracted 2026-08-18.** This was
   never a fact about the shapes; it was an artifact of one specific rendering technique
   (every port as a plain spoke into one shared centre point), which genuinely does look bad
   for a shape with a distinguished axis plus separate perpendicular arms. The fix wasn't to
   reject those shapes, it was to stop drawing mixing junctions that way — see the
   construction rule's extension above (every inlet to every outlet, straight/elbow per pair,
   no shared centre). Once corner-through's and five-way's mixing variants were redrawn with
   that method, all ten read as legitimate parts. **Current rule:** draw every mixing junction
   with the extended construction rule from the start; there's no shape-level reason left to
   expect a rejection on sight the way rule 1 still gives one for non-mixing variants.

Confirmed on **six-way** (2026-08-18): its mixing layers were drawn correctly the first time
with the extended construction rule, no reject-then-redraw pass needed — the only tier that
didn't need at least one round of correction. Its non-mixing layer wasn't even built, since
Rule 1's rejection was confirmed decisively enough by every prior tier that a mockup would add
nothing.

## Open / deferred

- ~~Manufacturability sanity check~~ — **resolved 2026-08-18, moot.** This was framed around
  whether five-way/six-way fittings read as "real kit" next to commercial hardware. The owner
  manufactures every part himself, so there's no external catalogue to match against — every
  flow topology marked active in this document is, by definition, available to manufacture.
  Nothing left to check here.
- ~~Pose mechanics~~ — **resolved 2026-08-19**, see the section below. Nothing deferred
  remains in this document.

## Pose mechanics (resolved 2026-08-19, validated on `boards/pipegrid-pose-mechanics-test.html`)

How a shape's canonical local directions map onto actual world directions. This replaces the
current build's hand-built approach entirely — today's `rot` field spans only 4 flat rotations
plus a few hard-coded vertical exceptions (`vup`/`vdn`/`riser`), which is exactly the "one shape
per physical topology" problem this document exists to fix.

**The model.** A pose is one of the 24 orientation-preserving rotations of a cube, stored as a
plain lookup table: for each of the six directions, which direction does it become. A shape
defines its ports *once*, in a home orientation; applying a pose's table to those ports yields
their world-facing directions. No per-shape orientation logic, no hand-built exceptions —
`vup`/`vdn`/`riser` stop being separate kinds and become the elbow and straight in particular
poses, which is the whole point.

**Generated, not hand-typed.** The 24 rotations are produced mechanically by repeatedly combining
two primitive moves (a quarter-spin about the vertical axis, a quarter-tip about the E–W axis)
until no new ones appear. Getting exactly 24 is itself the first correctness check; the board also
verifies the set is closed under composition, contains the identity, and contains an inverse for
every member.

**Distinct poses are shape-and-role dependent.** Given a shape *and* a flow topology, the number of
genuinely different placements is 24 divided by however many rotations leave that exact
port-and-role configuration unchanged. Two facts, both verified rather than asserted (the first was
initially stated backwards and corrected — see below):

- **Assigning flow roles raises the pose count, or leaves it equal — never lowers it.** A role
  removes symmetry, and fewer self-matching rotations means more orientations are tellable apart.
  A bare straight has 3 poses (it only cares which axis it lies on); a directional straight has 6,
  because the 180° flip that's invisible on the bare shape swaps inlet for outlet once the ends
  have roles. The roled count is always a whole multiple of the bare count, capped at 24. It stays
  *equal* when the shape already distinguishes the ports on its own — five-way's apex split is 6
  either way, since the apex is singular by geometry before any role is assigned.
- **Bare counts are bookkeeping only.** Nothing is ever placed on the board without a flow
  direction, so bare figures exist purely to check the rotation math against shapes simple enough
  to reason about by hand. The test board keeps them in the validation table and deliberately keeps
  them out of the visual explorer.

**Validated against hand-derived numbers** (all pass, plus a coset-size check confirming every
group of equivalent rotations is the same size, as orbit-stabilizer requires): cap 6 · straight
3 bare / 6 directional · corner 8 bare / 24 split / 24 merge · T 12 bare / 24 `tsplit` · cross
`xjunc` 6 · five-way apex split 6 · six-way opposite-pair-in 3 / adjacent-pair-in 12 /
corner-type 3-in-3-out 8.

That last figure independently confirms this document's earlier claim that six-way's corner-type
3-in-3-out has no separate merge variant: there are exactly 8 ways to pick one direction from each
opposite pair as the inlet set, and the pose count comes out to 8, not 16 — so every such
configuration, including the complement of any given one, is the same topology posed differently.
The claim was originally derived by hand; the pose system reproduces it without being told.

**Correction on record (2026-08-19).** This section originally claimed the opposite — that roles
could only *shrink* the pose count. The owner's question about whether a directional straight has
2 orientations along its axis is what surfaced it: the reasoning had the symmetry argument
inverted, and the board's own numbers (3→6, 8→24, 12→24) contradicted the claim printed above them.
Corrected in both the board text and here, and the corrected version was then verified across
eight shapes rather than re-asserted.

**Not yet built:** how a pose gets *chosen* at placement time — the gesture/UI question — and how
poses serialize into the save file without breaking the v:3 envelope. Both belong to the vertical
slice, not to this document.

## Next

All nine connectivity patterns are now fully resolved — every flow topology across every
port-count tier (1 through 6) has been enumerated and given a verdict. What's left: the two
deferred items above (manufacturability sanity check, pose mechanics), plus the actual work of
bringing this catalogue into `index.html` to replace the current hand-built one.
