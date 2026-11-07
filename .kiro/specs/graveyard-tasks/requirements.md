# Requirements — Graveyard Tasks

## Introduction
Graveyard Tasks is a Halloween task manager for Kiroween 2026, Costume Contest category. A single user manages everyday tasks in a graveyard: active tasks are tombstones, overdue tasks become skeletons, completed tasks rise as ghosts into a "Rest in Peace" section. The app is a static web page with no backend, no account, and no network calls; all data lives in the browser's localStorage.

## Glossary
- **Task**: title, optional due date, priority (Low/Medium/High), category (Haunt/Treat/Chore/Spell), completed flag, created/completed timestamps.
- **Graveyard**: the list of active (incomplete) tasks.
- **Rest in Peace**: the list of completed tasks.
- **Overdue**: an incomplete task whose due date is before today.

## Requirements

### Requirement 1 — Add a task
**User Story:** As a user, I want to add a task with a title, due date, priority and category, so I can track what needs doing.

#### Acceptance Criteria
1. WHEN the user submits the form with a non-empty title THEN the system SHALL create a task and show it in the Graveyard.
2. WHEN the title is empty THEN the system SHALL reject it with a visible error and create nothing.
3. WHEN the title is longer than 120 characters THEN the system SHALL reject it.
4. WHEN the priority or category is not one of the listed values THEN the system SHALL reject it.

### Requirement 2 — Task states (tombstone / skeleton / ghost)
**User Story:** As a user, I want the state of each task to be visible at a glance, so I know what is urgent and what is done.

#### Acceptance Criteria
1. WHEN a task is incomplete and not overdue THEN the system SHALL show it as a tombstone card.
2. WHEN a task is incomplete and its due date is before today THEN the system SHALL show it with skeleton styling, a skull icon, and an OVERDUE tag.
3. WHEN a task is completed THEN the system SHALL show it as a ghost (faded, floating animation) in the Rest in Peace section.
4. WHEN a task is completed THEN the system SHALL record the completion time; WHEN it is brought back THEN the system SHALL clear it.

### Requirement 3 — Edit, delete, complete
**User Story:** As a user, I want to change or remove tasks, so the list stays accurate.

#### Acceptance Criteria
1. WHEN the user clicks "Lay to rest" THEN the system SHALL mark the task completed and move it to Rest in Peace.
2. WHEN the user clicks "Bring back" on a completed task THEN the system SHALL mark it incomplete and return it to the Graveyard.
3. WHEN the user edits a task THEN the system SHALL pre-fill the form and save the changes on submit.
4. WHEN the user deletes a task THEN the system SHALL ask for confirmation first.

### Requirement 4 — Filter, search, sort
**User Story:** As a user, I want to find tasks quickly, so I can focus on what matters.

#### Acceptance Criteria
1. WHEN the user picks All / Active / Completed / Overdue THEN the system SHALL show only matching tasks.
2. WHEN the user types in the search box THEN the system SHALL filter by title (case-insensitive).
3. WHEN the user picks a sort THEN the system SHALL order by due date, priority (High first), or newest first.

### Requirement 5 — Stats and progress
**User Story:** As a user, I want a summary of my graveyard, so I know how much is done.

#### Acceptance Criteria
1. WHEN tasks change THEN the system SHALL show total, active, completed and overdue counts.
2. WHEN tasks change THEN the system SHALL show percent completed in the moon-phase progress ring.
3. WHEN there are no tasks THEN the system SHALL show 0% (not NaN).

### Requirement 6 — Persistence, export, import
**User Story:** As a user, I want my tasks saved in my browser and exportable, so I do not lose them.

#### Acceptance Criteria
1. WHEN the app first loads with no saved data THEN the system SHALL seed 6 sample tasks (1 overdue, 2 completed, 3 active non-overdue).
2. WHEN tasks change THEN the system SHALL save them to localStorage.
3. WHEN the user exports THEN the system SHALL download a JSON file that re-imports cleanly.
4. WHEN the user imports invalid JSON or a task with no title THEN the system SHALL reject it with an error and keep the current tasks.
5. WHEN the user clicks "Clear completed" THEN the system SHALL ask for confirmation and remove only completed tasks.

### Requirement 7 — Offline static app, English only
**User Story:** As a user, I want the app to work by opening a file, with no setup.

#### Acceptance Criteria
1. WHEN the user opens index.html THEN the app SHALL work with no build step, no server, and no network.
2. WHEN the app loads THEN it SHALL make no external requests (no CDN, fonts, or images).
3. WHEN the app is displayed THEN all visible text SHALL be in English.
