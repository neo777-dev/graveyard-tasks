# Hooks — Graveyard Tasks

`on-save-check.json` documents one hook: when `app.js` or `test/tasks.test.mjs` is saved, run `node --test test/tasks.test.mjs`, and do not commit while tests fail.

This is a documented hook definition. It is not a claim that a Kiro runtime executed it during this build; the tests were run manually from the terminal (see README).
