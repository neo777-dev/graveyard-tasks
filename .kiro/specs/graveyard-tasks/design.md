# Design — Graveyard Tasks

## Overview
A single static web app: `index.html` (structure), `styles.css` (Halloween styling), `app.js` (logic + UI). No framework, no build step, no backend. Data is stored in the browser only.

## Architecture
- **View**: `index.html` — header, stats bar, add-task form, filter/search/sort controls, Graveyard section, Rest in Peace section, tools section.
- **Style**: `styles.css` — dark night background, pumpkin orange accent, tombstone cards, floating-ghost animation, skeleton (red/cracked) styling, fog gradient, moon and bats (inline text/SVG-free decorations using emoji, no external images).
- **Logic**: `app.js` — pure functions (exported, unit-tested) plus a small browser UI layer guarded by `typeof document !== 'undefined'`, so Node can import the logic without a DOM.

## Data model (localStorage)
Storage key: `graveyard-tasks-v1`. Value: JSON array of tasks.

```json
{
  "id": "t-abc123",
  "title": "Carve the pumpkin",
  "dueDate": "2026-10-31",
  "priority": "high",
  "category": "Haunt",
  "completed": false,
  "createdAt": 1762500000000,
  "completedAt": null
}
```

- `priority`: `low` | `medium` | `high` (shown as 1 / 2 / 3 candles).
- `category`: `Haunt` | `Treat` | `Chore` | `Spell`.
- `dueDate`: `YYYY-MM-DD` or `""` (no due date).

## Data flow
1. Load: read localStorage; if empty or corrupt, seed 6 sample tasks and save them.
2. Render: compute stats (`computeStats`), filter (`filterTasks`), sort (`sortTasks`), split into active (Graveyard) and completed (Rest in Peace), render tombstone cards.
3. Mutate: add / toggle / edit / delete / clear-completed all go through the pure functions, then `saveTasks` + `render`.
4. Export: `exportTasks` serialises `{ app, version, exportedAt, tasks }` as JSON and triggers a browser download. Import: `importTasks` parses and validates, throwing on bad JSON or invalid tasks.

## Overdue rule
A task is overdue when `!completed && dueDate && dueDate < today`, where `today` is the local date as `YYYY-MM-DD`. The `today` value is injectable in the pure functions so tests can use a fixed date.

## Spooky UI mapping (Costume Contest)
- Active task → tombstone card, orange top border.
- Overdue task → skeleton: red top border, dark red gradient, 💀 icon, OVERDUE tag.
- Completed task → ghost: purple top border, faded text with strikethrough, 👻 icon, floating animation, REST IN PEACE tag.
- Completing a task → a ghost emoji rises and fades (`.ghost-burst` animation).
- Progress → moon-phase ring (SVG circle, stroke-dasharray set from percent completed).

## Testing
`test/tasks.test.mjs` (node:test): add validation, complete/restore, overdue detection with a fixed today, seed-state counts, search filter, due/priority sorting, stats, JSON export/import round-trip and rejection, clear-completed. Run with `node --test test/tasks.test.mjs`.
