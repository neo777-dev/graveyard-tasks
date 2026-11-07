import test from 'node:test';
import assert from 'node:assert/strict';
import {
  seedTasks, createTask, validateTask, isOverdue, toggleComplete,
  filterTasks, sortTasks, computeStats, exportTasks, importTasks, clearCompleted,
} from '../app.js';

const TODAY = '2026-11-07';

test('add validation rejects an empty title', () => {
  assert.equal(validateTask({ title: '  ', priority: 'medium', category: 'Chore', dueDate: '' }).ok, false);
  assert.throws(() => createTask({ title: '', priority: 'medium', category: 'Chore', dueDate: '' }), /Title is required/);
  assert.equal(validateTask({ title: 'x'.repeat(121), priority: 'medium', category: 'Chore', dueDate: '' }).ok, false);
  assert.equal(validateTask({ title: 'Boo', priority: 'urgent', category: 'Chore', dueDate: '' }).ok, false);
});

test('createTask builds a valid incomplete task', () => {
  const t = createTask({ title: '  Haunt the attic ', priority: 'high', category: 'Haunt', dueDate: '2026-11-10' }, 1000);
  assert.equal(t.title, 'Haunt the attic');
  assert.equal(t.completed, false);
  assert.equal(t.createdAt, 1000);
  assert.ok(t.id.startsWith('t-'));
});

test('completing a task moves it to Rest in Peace (completed=true)', () => {
  const t = createTask({ title: 'Boo', priority: 'low', category: 'Chore', dueDate: '' }, 1000);
  const done = toggleComplete(t, 2000);
  assert.equal(done.completed, true);
  assert.equal(done.completedAt, 2000);
  assert.equal(filterTasks([done], 'completed').length, 1);
  assert.equal(filterTasks([done], 'active').length, 0);
  const back = toggleComplete(done, 3000);
  assert.equal(back.completed, false);
  assert.equal(back.completedAt, null);
});

test('overdue detection uses a fixed today: due before today and incomplete', () => {
  const overdue = { title: 'Old', dueDate: '2026-10-31', completed: false };
  const todayTask = { title: 'Today', dueDate: '2026-11-07', completed: false };
  const future = { title: 'Later', dueDate: '2026-11-20', completed: false };
  const doneLate = { title: 'Done late', dueDate: '2026-10-31', completed: true };
  const noDate = { title: 'No date', dueDate: '', completed: false };
  assert.equal(isOverdue(overdue, TODAY), true);
  assert.equal(isOverdue(todayTask, TODAY), false);
  assert.equal(isOverdue(future, TODAY), false);
  assert.equal(isOverdue(doneLate, TODAY), false);
  assert.equal(isOverdue(noDate, TODAY), false);
});

test('seed tasks show all states: 1 overdue, 2 completed, 3 active non-overdue', () => {
  const seeds = seedTasks();
  assert.equal(seeds.length, 6);
  assert.equal(computeStats(seeds, TODAY).overdue, 1);
  assert.equal(computeStats(seeds, TODAY).completed, 2);
  assert.equal(computeStats(seeds, TODAY).active, 4);
  assert.equal(filterTasks(seeds, 'overdue', '', TODAY).length, 1);
  assert.equal(filterTasks(seeds, 'completed', '', TODAY).length, 2);
});

test('filter by search matches title case-insensitively', () => {
  const seeds = seedTasks();
  assert.equal(filterTasks(seeds, 'all', 'pumpkin').length, 1);
  assert.equal(filterTasks(seeds, 'all', 'CANDY').length, 1);
  assert.equal(filterTasks(seeds, 'all', 'zzz').length, 0);
});

test('sort by due date puts dated tasks first; sort by priority puts high first', () => {
  const seeds = seedTasks();
  const byDue = sortTasks(seeds, 'due');
  assert.equal(byDue[0].dueDate, '2026-10-31');
  assert.equal(byDue.at(-1).dueDate, '2026-12-01');
  const byPriority = sortTasks(seeds, 'priority');
  assert.equal(byPriority[0].priority, 'high');
  assert.equal(byPriority.at(-1).priority, 'low');
});

test('stats compute totals and percent completed', () => {
  const stats = computeStats(seedTasks(), TODAY);
  assert.deepEqual(stats, { total: 6, active: 4, completed: 2, overdue: 1, pct: 33 });
  assert.deepEqual(computeStats([], TODAY), { total: 0, active: 0, completed: 0, overdue: 0, pct: 0 });
});

test('JSON export/import round-trips, and bad JSON is rejected', () => {
  const seeds = seedTasks();
  const back = importTasks(exportTasks(seeds));
  assert.equal(back.length, 6);
  assert.equal(back[0].title, seeds[0].title);
  assert.equal(back[0].completed, seeds[0].completed);
  assert.throws(() => importTasks('not json'), /Not valid JSON/);
  assert.throws(() => importTasks('[{"title":""}]'), /Title is required/);
  assert.throws(() => importTasks('{"nope":1}'), /array of tasks/);
});

test('clear completed keeps only active tasks', () => {
  const kept = clearCompleted(seedTasks());
  assert.equal(kept.length, 4);
  assert.ok(kept.every((t) => !t.completed));
});
