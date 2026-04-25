/* ===================================================
   LIFE DASHBOARD — script.js
   Features: Clock, Greeting, Focus Timer (custom duration),
             To-Do List (add/edit/delete/done/sort/no-duplicate),
             Quick Links, Light/Dark mode, Custom name
   =================================================== */

/* ---------- THEME ---------- */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const html = document.documentElement;

function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('theme', theme);
}

themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
});

applyTheme(localStorage.getItem('theme') || 'dark');


/* ---------- CLOCK & GREETING ---------- */
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${h}:${m}:${s}`;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    document.getElementById('date').textContent =
        `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    const hour = now.getHours();
    let greet;
    if (hour >= 5 && hour < 12) greet = '🌤 Good Morning';
    else if (hour >= 12 && hour < 17) greet = '☀️ Good Afternoon';
    else if (hour >= 17 && hour < 21) greet = '🌆 Good Evening';
    else greet = '🌙 Good Night';
    document.getElementById('greeting').textContent = greet;
}
setInterval(updateClock, 1000);
updateClock();


/* ---------- CUSTOM NAME ---------- */
const greetName = document.getElementById('greetName');
const editNameBtn = document.getElementById('editNameBtn');
const nameModal = document.getElementById('nameModal');
const nameInput = document.getElementById('nameInput');
const saveName = document.getElementById('saveName');
const cancelName = document.getElementById('cancelName');

function loadName() {
    const n = localStorage.getItem('userName') || '';
    greetName.textContent = n ? `${n}!` : '';
}

editNameBtn.addEventListener('click', () => {
    nameInput.value = localStorage.getItem('userName') || '';
    nameModal.classList.add('open');
    nameInput.focus();
});
cancelName.addEventListener('click', () => nameModal.classList.remove('open'));
saveName.addEventListener('click', () => {
    const val = nameInput.value.trim();
    if (val) localStorage.setItem('userName', val);
    else localStorage.removeItem('userName');
    loadName();
    nameModal.classList.remove('open');
});
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveName.click(); });
loadName();


/* ---------- FOCUS TIMER ---------- */
let timerDuration = parseInt(localStorage.getItem('timerDuration')) || 25; // minutes
let totalSeconds = timerDuration * 60;
let remaining = totalSeconds;
let timerInterval = null;
let running = false;

const timerDisplay = document.getElementById('timerDisplay');
const timerBar = document.getElementById('timerBar');
const durationValue = document.getElementById('durationValue');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');

function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function renderTimer() {
    timerDisplay.textContent = formatTime(remaining);
    const pct = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 100;
    timerBar.style.width = pct + '%';
}

function saveDuration() {
    localStorage.setItem('timerDuration', timerDuration);
}

document.getElementById('plusDuration').addEventListener('click', () => {
    if (running) return;
    timerDuration = Math.min(timerDuration + 1, 99);
    durationValue.textContent = timerDuration;
    totalSeconds = timerDuration * 60;
    remaining = totalSeconds;
    saveDuration();
    renderTimer();
});

document.getElementById('minusDuration').addEventListener('click', () => {
    if (running) return;
    timerDuration = Math.max(timerDuration - 1, 1);
    durationValue.textContent = timerDuration;
    totalSeconds = timerDuration * 60;
    remaining = totalSeconds;
    saveDuration();
    renderTimer();
});

startBtn.addEventListener('click', () => {
    if (running) return;
    running = true;
    timerInterval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            remaining = 0;
            clearInterval(timerInterval);
            running = false;
            renderTimer();
            showToast('⏰ Timer done! Take a break.', 'accent');
        }
        renderTimer();
    }, 1000);
});

stopBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    running = false;
});

resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    running = false;
    remaining = totalSeconds;
    renderTimer();
});

// Init
durationValue.textContent = timerDuration;
renderTimer();


/* ---------- TOAST ---------- */
const toast = document.getElementById('toast');
let toastTimeout;
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}


/* ---------- TO-DO LIST ---------- */
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyTasks = document.getElementById('emptyTasks');
const sortSelect = document.getElementById('sortSelect');

// Edit modal
const editModal = document.getElementById('editModal');
const editTaskInput = document.getElementById('editTaskInput');
const saveEdit = document.getElementById('saveEdit');
const cancelEdit = document.getElementById('cancelEdit');
let editingIndex = null;

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getSortedTasks() {
    const mode = sortSelect.value;
    const copy = [...tasks.map((t, i) => ({ ...t, _orig: i }))];
    if (mode === 'asc') return copy.sort((a, b) => a.text.localeCompare(b.text));
    if (mode === 'desc') return copy.sort((a, b) => b.text.localeCompare(a.text));
    if (mode === 'done') return copy.sort((a, b) => Number(a.done) - Number(b.done));
    return copy;
}

function renderTasks() {
    taskList.innerHTML = '';
    const sorted = getSortedTasks();
    emptyTasks.classList.toggle('hidden', sorted.length > 0);

    sorted.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.done ? ' done' : '');

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = task.done;
        cb.addEventListener('change', () => {
            tasks[task._orig].done = cb.checked;
            saveTasks();
            renderTasks();
        });

        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = task.text;

        const actions = document.createElement('div');
        actions.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'icon-btn';
        editBtn.innerHTML = '<i class="fas fa-pen"></i>';
        editBtn.title = 'Edit task';
        editBtn.addEventListener('click', () => {
            editingIndex = task._orig;
            editTaskInput.value = task.text;
            editModal.classList.add('open');
            editTaskInput.focus();
        });

        const delBtn = document.createElement('button');
        delBtn.className = 'icon-btn btn-danger';
        delBtn.innerHTML = '<i class="fas fa-trash"></i>';
        delBtn.title = 'Delete task';
        delBtn.addEventListener('click', () => {
            tasks.splice(task._orig, 1);
            saveTasks();
            renderTasks();
        });

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        li.appendChild(cb);
        li.appendChild(span);
        li.appendChild(actions);
        taskList.appendChild(li);
    });
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    // CHALLENGE: Prevent duplicate tasks (case-insensitive)
    const duplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
    if (duplicate) {
        showToast('⚠️ Task already exists!');
        return;
    }

    tasks.push({ text, done: false });
    saveTasks();
    renderTasks();
    taskInput.value = '';
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
sortSelect.addEventListener('change', renderTasks);

// Edit modal
saveEdit.addEventListener('click', () => {
    const val = editTaskInput.value.trim();
    if (!val || editingIndex === null) return;
    tasks[editingIndex].text = val;
    saveTasks();
    renderTasks();
    editModal.classList.remove('open');
    editingIndex = null;
});
cancelEdit.addEventListener('click', () => {
    editModal.classList.remove('open');
    editingIndex = null;
});
editTaskInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveEdit.click(); });

renderTasks();


/* ---------- QUICK LINKS ---------- */
let links = JSON.parse(localStorage.getItem('quickLinks')) || [
    { name: 'Google', url: 'https://google.com' },
    { name: 'YouTube', url: 'https://youtube.com' },
    { name: 'GitHub', url: 'https://github.com' },
];

const addLinkBtn = document.getElementById('addLinkBtn');
const linkName = document.getElementById('linkName');
const linkUrl = document.getElementById('linkUrl');
const linksGrid = document.getElementById('linksGrid');
const emptyLinks = document.getElementById('emptyLinks');

function saveLinks() {
    localStorage.setItem('quickLinks', JSON.stringify(links));
}

function getFavicon(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
    } catch { return null; }
}

function renderLinks() {
    linksGrid.innerHTML = '';
    emptyLinks.classList.toggle('hidden', links.length > 0);

    links.forEach((link, i) => {
        const chip = document.createElement('div');
        chip.className = 'link-chip';

        const favicon = getFavicon(link.url);
        if (favicon) {
            const img = document.createElement('img');
            img.src = favicon;
            img.width = 16;
            img.height = 16;
            img.style.borderRadius = '3px';
            img.onerror = () => img.remove();
            chip.appendChild(img);
        }

        const label = document.createElement('span');
        label.textContent = link.name;
        label.style.cursor = 'pointer';
        label.addEventListener('click', () => window.open(link.url, '_blank'));

        const removeBtn = document.createElement('button');
        removeBtn.className = 'link-remove';
        removeBtn.innerHTML = '<i class="fas fa-xmark"></i>';
        removeBtn.title = 'Remove link';
        removeBtn.addEventListener('click', e => {
            e.stopPropagation();
            links.splice(i, 1);
            saveLinks();
            renderLinks();
        });

        chip.appendChild(label);
        chip.appendChild(removeBtn);
        linksGrid.appendChild(chip);
    });
}

function addLink() {
    const name = linkName.value.trim();
    let url = linkUrl.value.trim();
    if (!name || !url) { showToast('⚠️ Please fill in both fields.'); return; }
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    links.push({ name, url });
    saveLinks();
    renderLinks();
    linkName.value = '';
    linkUrl.value = '';
}

addLinkBtn.addEventListener('click', addLink);
linkUrl.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });
linkName.addEventListener('keydown', e => { if (e.key === 'Enter') linkUrl.focus(); });

renderLinks();
