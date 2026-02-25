const STORAGE_KEY = 'habit-tracker-v1';

const state = {
  habits: [],
};

const els = {
  form: document.getElementById('habit-form'),
  input: document.getElementById('habit-input'),
  list: document.getElementById('habit-list'),
  progress: document.getElementById('progress-label'),
  clearCompletedButton: document.getElementById('clear-completed'),
  resetAllButton: document.getElementById('reset-all'),
  habitTemplate: document.getElementById('habit-item-template'),
};

function loadHabits() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    state.habits = [];
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.habits = Array.isArray(parsed) ? parsed : [];
  } catch {
    state.habits = [];
  }
}

function saveHabits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.habits));
}

function createHabit(text) {
  return {
    id: crypto.randomUUID(),
    text,
    done: false,
    createdAt: Date.now(),
  };
}

function updateProgressLabel() {
  const total = state.habits.length;
  const completed = state.habits.filter((habit) => habit.done).length;
  els.progress.textContent = `${completed} / ${total} 완료`;
}

function renderHabits() {
  els.list.innerHTML = '';

  if (!state.habits.length) {
    const empty = document.createElement('li');
    empty.textContent = '아직 등록된 습관이 없어요. 하나 추가해보세요!';
    empty.className = 'habit-item';
    els.list.append(empty);
    updateProgressLabel();
    return;
  }

  for (const habit of state.habits) {
    const fragment = els.habitTemplate.content.cloneNode(true);
    const item = fragment.querySelector('.habit-item');
    const checkbox = fragment.querySelector('.habit-item__checkbox');
    const text = fragment.querySelector('.habit-item__text');
    const deleteButton = fragment.querySelector('.habit-item__delete');

    item.dataset.id = habit.id;
    checkbox.checked = habit.done;
    text.textContent = habit.text;

    checkbox.addEventListener('change', () => {
      toggleHabit(habit.id, checkbox.checked);
    });

    deleteButton.addEventListener('click', () => {
      deleteHabit(habit.id);
    });

    els.list.append(fragment);
  }

  updateProgressLabel();
}

function addHabit(text) {
  state.habits.unshift(createHabit(text));
  saveHabits();
  renderHabits();
}

function toggleHabit(id, done) {
  state.habits = state.habits.map((habit) =>
    habit.id === id ? { ...habit, done } : habit,
  );
  saveHabits();
  renderHabits();
}

function deleteHabit(id) {
  state.habits = state.habits.filter((habit) => habit.id !== id);
  saveHabits();
  renderHabits();
}

function clearCompletedHabits() {
  state.habits = state.habits.filter((habit) => !habit.done);
  saveHabits();
  renderHabits();
}

function resetHabits() {
  state.habits = [];
  saveHabits();
  renderHabits();
}

function handleSubmit(event) {
  event.preventDefault();
  const text = els.input.value.trim();

  if (!text) {
    return;
  }

  addHabit(text);
  els.form.reset();
  els.input.focus();
}

function bindEvents() {
  els.form.addEventListener('submit', handleSubmit);
  els.clearCompletedButton.addEventListener('click', clearCompletedHabits);
  els.resetAllButton.addEventListener('click', resetHabits);
}

function init() {
  loadHabits();
  bindEvents();
  renderHabits();
}

init();
