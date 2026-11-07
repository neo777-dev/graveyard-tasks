# Tech steering — Graveyard Tasks

- **Stack:** static HTML + CSS + vanilla JavaScript. No framework, no build step, no dependencies, no backend.
- **Files:** `index.html`, `styles.css`, `app.js`, `test/tasks.test.mjs`.
- **Pure logic first:** task logic (add, complete, overdue, filter, sort, stats, export/import) lives in exported pure functions in `app.js`, testable in Node without a DOM. DOM wiring is guarded by `typeof document !== 'undefined'`.
- **Persistence:** localStorage only, key `graveyard-tasks-v1`. Seed 6 tasks on first run.
- **Offline:** zero external references — no CDN, no web fonts, no external images. Decorations are CSS and emoji only.
- **Tests:** `node --test test/tasks.test.mjs`. Keep tests deterministic — inject a fixed "today" for overdue checks, never depend on the real clock.
