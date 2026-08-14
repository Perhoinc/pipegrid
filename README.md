# PIPEGRID

A pipe-layout drawing board for iPad. One file, `index.html`, is the whole
application. This repository is its permanent home.

## What's in this folder

- `index.html` — the app itself (v38). Open it in any browser; publish it and
  open the published address on the iPad.
- `CLAUDE.md` — Claude Code's standing instructions: the working rules, the hard
  laws, how we build. Claude reads it automatically.
- `docs/PIPEGRID-STATE.md` — the technical memory (for Claude).
- `docs/PIPEGRID-GUIDE.md` — the plain-language manual (for you).
- `test/` + `package.json` — the robot-iPad test suite. 36 checks as of v38.
- `boards/` — every mockup board we've decided on, the design history.
- `archive/` — the previous builds (v35–v37).

## The sentences you'll actually use

Say these to Claude Code, in your own words — they are requests, not commands:

1. **"Read CLAUDE.md and tell me where we are."** — start of every session.
2. **"Run the tests."** — the robot iPad; everything should be green.
3. **"Make a mockup board for …"** — before any visual or convention change.
4. **"Go back to the last version."** — the hard reset, now clean and safe.
5. **"Publish."** — puts the current build on the live address for the iPad.

And when a version is done: **"Ship it as v39"** (Claude will tag it, update the
state doc if it's a major version, and publish).

## How versions work now

Every shipped version is a saved snapshot (a "commit") with a tag: v39, v40, …
Nothing is ever lost; any version can be brought back with one sentence. The
address you open on the iPad always shows the latest published version.
