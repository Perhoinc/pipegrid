# SETUP — from this folder to a working Claude Code project

You'll do this once. Nothing here requires writing code. Budget half an hour.

## Before you start

1. **A GitHub account** (free): go to github.com, sign up. GitHub is where the
   project will live permanently and what publishes it to the web.
2. **The Claude Desktop app** on your computer, signed in with your existing
   Claude account. Download: https://claude.com/download — the app includes
   Claude Code as a visual interface, no terminal needed. (Claude Code requires
   a paid plan — Pro or higher; if you're unsure what you have, the app will
   tell you.)
3. **This folder**, unzipped, somewhere sensible — for example
   `Documents/pipegrid`.

## First session

1. Open the Claude Desktop app and open its **Code** area.
2. Point it at the `pipegrid` folder you unzipped.
3. Type your first message:

   > Read CLAUDE.md and tell me where we are.

   Claude will read its instructions and the state document and report back in
   plain language. This is how every session begins from now on.

4. Then say:

   > Set this folder up as a git project, install what the tests need, and run
   > the tests. Tell me what you did in plain language.

   Claude will initialise the project history, fetch the one testing tool it
   needs (jsdom), and run the 36 checks. You want to hear "all green".

5. Then say:

   > Create a GitHub repository for this project under my account, push
   > everything to it, and turn on GitHub Pages so index.html is served at a
   > public address. Walk me through anything you need from me.

   Claude may need you to sign in to GitHub once during this step — it will
   tell you exactly what to click. At the end you'll have a web address like
   `https://<yourname>.github.io/pipegrid/`.

6. **Open that address on the iPad.** Add it to your home screen. That is the
   app now — every time Claude publishes, this address updates.

## Sanity checks before you continue building

- The iPad address shows the current app (v38, with the vertical crosses).
- "Run the tests" comes back green.
- "Go back to the last version" and "publish" both make sense to Claude when
  you ask about them.

## One habit worth keeping

Your saved boards (the JSON files from Save in the app) are yours — they live
in the browser and in files you export, not in this repository. If a board
matters, save the file somewhere safe, or ask Claude to add a `boards-saved/`
folder to the repository and keep copies there.

## If anything goes wrong

Say what you see in plain language ("the address shows an old version",
"the tests are red"). Claude Code can see the project and its history and will
diagnose from there. Nothing you can type will destroy the project — every
version is recoverable.
