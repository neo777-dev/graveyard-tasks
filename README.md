# 🪦 Graveyard Tasks 👻

A Halloween task manager for **Kiroween 2026 — Costume Contest**.

Bury your tasks. Watch the finished ones rise as ghosts.

## What it does

- **Add tasks** with a title, due date, priority (shown as 1–3 candles) and category (Haunt / Treat / Chore / Spell).
- **Graveyard view:** active tasks are tombstone cards. **Overdue** tasks turn into skeletons (💀 + OVERDUE tag). **Completed** tasks rise as floating ghosts into the **Rest in Peace** section.
- **Filter** by All / Active / Completed / Overdue, **search** by title, **sort** by due date / priority / newest.
- **Stats bar** with total / active / completed / overdue counts and a moon-phase progress ring (% laid to rest).
- **Edit, complete, bring back, delete** (delete confirms first).
- **Export / import** tasks as JSON, **clear completed**, and **reset** to the 6 sample tasks.
- **Offline, no account, no server.** Tasks live only in your browser (localStorage).

## How to run

No build step, no install:

```bash
# Option 1 — just open the file
open index.html

# Option 2 — serve locally
python3 -m http.server
# then visit http://localhost:8000
```

## How to use (5 steps)

1. Open `index.html` — 6 sample tasks are seeded on first run.
2. Add a task in "Bury a new task" (title is required).
3. Click **Lay to rest** on a task and watch it rise as a ghost 👻.
4. Use the filters, search box, and sort menu to find tasks; overdue ones show as skeletons 💀.
5. Export a JSON backup from **Graveyard tools** before clearing browser data.

## Tests

```bash
node --test test/tasks.test.mjs
# 10 tests, 0 failures
```

## Project structure

```
index.html          # structure
styles.css          # Halloween styling (no external assets)
app.js              # pure task logic (exported, tested) + browser UI
test/tasks.test.mjs # node:test suite
.kiro/
  specs/graveyard-tasks/   # requirements, design, tasks
  steering/                # product + tech steering
  hooks/                   # documented on-save check
README.md
LICENSE             # MIT
```

## Kiroween 2026

- Category: **Costume Contest** — any app with a polished haunting UI; the spooky design (tombstones, skeletons, ghosts, moon, fog) is the interface, not decoration on top of it.
- Built with Kiro (specs, steering, hooks in `.kiro/`).

## License

MIT — see `LICENSE`.
