// Graveyard Tasks — pure task logic + browser UI wiring.
// Pure functions are exported so they can be unit-tested in Node.
// The DOM wiring at the bottom only runs in a browser (typeof document check).

export const STORAGE_KEY = 'graveyard-tasks-v1';
export const PRIORITIES = ['low', 'medium', 'high'];
export const CATEGORIES = ['Haunt', 'Treat', 'Chore', 'Spell'];
export const PRIORITY_CANDLES = { low: 1, medium: 2, high: 3 };

// Seed tasks: 1 overdue, 2 completed, 3 active (non-overdue).
// Dates are fixed in 2026 so the demo state is deterministic in Nov 2026.
export function seedTasks() {
  const base = Date.parse('2026-11-07T09:00:00Z');
  return [
    { id: 'seed-1', title: 'Carve the pumpkin', dueDate: '2026-10-31', priority: 'high', category: 'Haunt', completed: false, createdAt: base - 6 * 86400000, completedAt: null },
    { id: 'seed-2', title: 'Buy candy for trick-or-treaters', dueDate: '2026-10-31', priority: 'high', category: 'Treat', completed: true, createdAt: base - 6 * 86400000, completedAt: base - 2 * 86400000 },
    { id: 'seed-3', title: 'Hang the cobwebs', dueDate: '2026-11-01', priority: 'medium', category: 'Haunt', completed: true, createdAt: base - 5 * 86400000, completedAt: base - 1 * 86400000 },
    { id: 'seed-4', title: 'Pick a costume', dueDate: '2026-11-15', priority: 'medium', category: 'Spell', completed: false, createdAt: base - 4 * 86400000, completedAt: null },
    { id: 'seed-5', title: 'Bake ghost cookies', dueDate: '2026-11-20', priority: 'low', category: 'Treat', completed: false, createdAt: base - 3 * 86400000, completedAt: null },
    { id: 'seed-6', title: 'Sweep the haunted porch', dueDate: '2026-12-01', priority: 'low', category: 'Chore', completed: false, createdAt: base - 2 * 86400000, completedAt: null },
  ];
}

export function newId() {
  return 't-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// Validate an add-task form payload. Returns { ok, error }.
export function validateTask(input) {
  const title = (input.title || '').trim();
  if (!title) return { ok: false, error: 'Title is required.' };
  if (title.length > 120) return { ok: false, error: 'Title must be 120 characters or fewer.' };
  if (!PRIORITIES.includes(input.priority)) return { ok: false, error: 'Priority must be Low, Medium or High.' };
  if (!CATEGORIES.includes(input.category)) return { ok: false, error: 'Category is not recognised.' };
  if (input.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) return { ok: false, error: 'Due date must be YYYY-MM-DD.' };
  return { ok: true, error: null };
}

export function createTask(input, now = Date.now()) {
  const v = validateTask(input);
  if (!v.ok) throw new Error(v.error);
  return {
    id: newId(),
    title: input.title.trim(),
    dueDate: input.dueDate || '',
    priority: input.priority,
    category: input.category,
    completed: false,
    createdAt: now,
    completedAt: null,
  };
}

// A task is overdue when it is incomplete, has a due date, and that date
// is before "today" (local date, compared as YYYY-MM-DD strings).
// `today` is injectable so tests can use a fixed date.
export function todayString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isOverdue(task, today = todayString()) {
  return !task.completed && !!task.dueDate && task.dueDate < today;
}

export function toggleComplete(task, now = Date.now()) {
  const done = !task.completed;
  return { ...task, completed: done, completedAt: done ? now : null };
}

export function editTask(task, input) {
  const v = validateTask({ ...input, title: input.title ?? task.title });
  if (!v.ok) throw new Error(v.error);
  return { ...task, title: input.title.trim(), dueDate: input.dueDate ?? task.dueDate, priority: input.priority ?? task.priority, category: input.category ?? task.category };
}

export function filterTasks(tasks, filter, query = '', today = todayString()) {
  const q = query.trim().toLowerCase();
  return tasks.filter((t) => {
    if (q && !t.title.toLowerCase().includes(q)) return false;
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    if (filter === 'overdue') return isOverdue(t, today);
    return true; // 'all'
  });
}

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
export function sortTasks(tasks, sortBy = 'due') {
  const copy = [...tasks];
  if (sortBy === 'priority') {
    return copy.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.createdAt - b.createdAt);
  }
  if (sortBy === 'created') {
    return copy.sort((a, b) => b.createdAt - a.createdAt);
  }
  // 'due': dated tasks first by date, undated last, then by creation.
  return copy.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return a.createdAt - b.createdAt;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate) || a.createdAt - b.createdAt;
  });
}

export function computeStats(tasks, today = todayString()) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const overdue = tasks.filter((t) => isOverdue(t, today)).length;
  const active = total - completed;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, active, completed, overdue, pct };
}

export function exportTasks(tasks) {
  return JSON.stringify({ app: 'graveyard-tasks', version: 1, exportedAt: new Date().toISOString(), tasks }, null, 2);
}

// Validate + normalise imported JSON. Throws on bad input; returns task array.
export function importTasks(jsonText) {
  let parsed;
  try { parsed = JSON.parse(jsonText); } catch { throw new Error('Not valid JSON.'); }
  const list = Array.isArray(parsed) ? parsed : parsed.tasks;
  if (!Array.isArray(list)) throw new Error('JSON must be an array of tasks or an object with a tasks array.');
  return list.map((raw, i) => {
    const v = validateTask({ title: raw.title, priority: raw.priority || 'medium', category: raw.category || 'Chore', dueDate: raw.dueDate || '' });
    if (!v.ok) throw new Error(`Task ${i + 1}: ${v.error}`);
    return {
      id: typeof raw.id === 'string' && raw.id ? raw.id : newId(),
      title: raw.title.trim(),
      dueDate: raw.dueDate || '',
      priority: raw.priority || 'medium',
      category: raw.category || 'Chore',
      completed: !!raw.completed,
      createdAt: Number(raw.createdAt) || Date.now(),
      completedAt: raw.completedAt ? Number(raw.completedAt) : null,
    };
  });
}

export function clearCompleted(tasks) {
  return tasks.filter((t) => !t.completed);
}

// ---- localStorage persistence (browser only) ----
export function loadTasks(storage = null) {
  const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!store) return seedTasks();
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) {
      const seeds = seedTasks();
      store.setItem(STORAGE_KEY, JSON.stringify(seeds));
      return seeds;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedTasks();
    return parsed;
  } catch { return seedTasks(); }
}

export function saveTasks(tasks, storage = null) {
  const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  if (store) store.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---- Browser UI (only runs when document exists) ----
if (typeof document !== 'undefined') {
  let tasks = loadTasks();
  let filter = 'all';
  let sortBy = 'due';
  let query = '';
  let editingId = null;

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const candles = (p) => '🕯️'.repeat(PRIORITY_CANDLES[p]);
  const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date';

  function render() {
    const today = todayString();
    const stats = computeStats(tasks, today);
    $('#stat-total').textContent = stats.total;
    $('#stat-active').textContent = stats.active;
    $('#stat-completed').textContent = stats.completed;
    $('#stat-overdue').textContent = stats.overdue;
    $('#progress-text').textContent = stats.pct + '%';
    const ring = $('#progress-ring-fg');
    if (ring) ring.setAttribute('stroke-dasharray', `${stats.pct * 2.51} 251`);
    $('#clear-completed').disabled = stats.completed === 0;

    const visible = sortTasks(filterTasks(tasks, filter, query, today), sortBy, today);
    const active = visible.filter((t) => !t.completed);
    const done = visible.filter((t) => t.completed);

    const card = (t) => {
      const overdue = isOverdue(t, today);
      const cls = t.completed ? 'tomb ghost' : overdue ? 'tomb skeleton' : 'tomb';
      const icon = t.completed ? '👻' : overdue ? '💀' : '🪦';
      const tag = t.completed ? '<span class="tag rip">REST IN PEACE</span>' : overdue ? '<span class="tag overdue">OVERDUE</span>' : '';
      return `<article class="${cls}" data-id="${esc(t.id)}">
        <div class="tomb-icon" aria-hidden="true">${icon}</div>
        <div class="tomb-body">
          <h3>${esc(t.title)}</h3>
          <p class="meta">${fmtDate(t.dueDate)} · ${esc(t.category)} · ${candles(t.priority)} ${t.priority}</p>
          ${tag}
        </div>
        <div class="tomb-actions">
          <button data-act="toggle" aria-label="${t.completed ? 'Bring back' : 'Lay to rest'} ${esc(t.title)}">${t.completed ? '↩ Bring back' : '👻 Lay to rest'}</button>
          <button data-act="edit" aria-label="Edit ${esc(t.title)}">✏️ Edit</button>
          <button data-act="delete" aria-label="Delete ${esc(t.title)}">🗑️ Delete</button>
        </div>
      </article>`;
    };

    $('#graveyard').innerHTML = active.length
      ? active.map(card).join('')
      : '<p class="empty">🎃 The graveyard is empty. Add a task and give it a proper burial.</p>';
    $('#rip-yard').innerHTML = done.length
      ? done.map(card).join('')
      : '<p class="empty">No ghosts yet. Finish a task and watch it rise. 👻</p>';

    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('active', b.dataset.filter === filter));
  }

  function persistAndRender() { saveTasks(tasks); render(); }

  document.addEventListener('DOMContentLoaded', () => {
    render();
    $('#task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = {
        title: $('#title').value,
        dueDate: $('#due-date').value,
        priority: $('#priority').value,
        category: $('#category').value,
      };
      const err = $('#form-error');
      try {
        if (editingId) {
          tasks = tasks.map((t) => (t.id === editingId ? editTask(t, input) : t));
          editingId = null;
          $('#submit-btn').textContent = '🪦 Bury this task';
        } else {
          tasks = [...tasks, createTask(input)];
        }
        err.textContent = '';
        e.target.reset();
        persistAndRender();
      } catch (ex) { err.textContent = ex.message; }
    });
    $('#cancel-edit').addEventListener('click', () => {
      editingId = null;
      $('#task-form').reset();
      $('#submit-btn').textContent = '🪦 Bury this task';
      $('#cancel-edit').hidden = true;
    });
    document.querySelectorAll('.filter-btn').forEach((b) => b.addEventListener('click', () => { filter = b.dataset.filter; render(); }));
    $('#search').addEventListener('input', (e) => { query = e.target.value; render(); });
    $('#sort').addEventListener('change', (e) => { sortBy = e.target.value; render(); });

    const onCards = (e) => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const article = btn.closest('.tomb');
      const id = article.dataset.id;
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      if (btn.dataset.act === 'toggle') {
        const wasDone = task.completed;
        tasks = tasks.map((t) => (t.id === id ? toggleComplete(t) : t));
        if (!wasDone) {
          const ghost = document.createElement('div');
          ghost.className = 'ghost-burst';
          ghost.textContent = '👻';
          document.body.appendChild(ghost);
          setTimeout(() => ghost.remove(), 1600);
        }
        persistAndRender();
      } else if (btn.dataset.act === 'delete') {
        if (window.confirm(`Delete "${task.title}" forever?`)) {
          tasks = tasks.filter((t) => t.id !== id);
          persistAndRender();
        }
      } else if (btn.dataset.act === 'edit') {
        editingId = id;
        $('#title').value = task.title;
        $('#due-date').value = task.dueDate;
        $('#priority').value = task.priority;
        $('#category').value = task.category;
        $('#submit-btn').textContent = '💾 Save changes';
        $('#cancel-edit').hidden = false;
        $('#title').focus();
      }
    };
    $('#graveyard').addEventListener('click', onCards);
    $('#rip-yard').addEventListener('click', onCards);

    $('#export-btn').addEventListener('click', () => {
      const blob = new Blob([exportTasks(tasks)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'graveyard-tasks.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    $('#import-btn').addEventListener('click', () => $('#import-file').click());
    $('#import-file').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        tasks = importTasks(text);
        persistAndRender();
      } catch (ex) { alert('Import failed: ' + ex.message); }
      e.target.value = '';
    });
    $('#clear-completed').addEventListener('click', () => {
      if (window.confirm('Clear all completed tasks?')) {
        tasks = clearCompleted(tasks);
        persistAndRender();
      }
    });
    $('#reset-seed').addEventListener('click', () => {
      if (window.confirm('Reset to the 6 sample tasks? Your current tasks will be replaced.')) {
        tasks = seedTasks();
        persistAndRender();
      }
    });
  });
}
