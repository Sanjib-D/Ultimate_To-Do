import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { loginUser, registerUser, loginGuest, logoutUser } from "./auth.js";
import {
  addTask,
  listenToTasks,
  toggleTaskStatus,
  deleteTask,
  updateTask // <--- IMPORT THIS NEW FUNCTION
} from "./task-manager.js";

// DOM Elements
const authForm = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const guestBtn = document.getElementById("guest-login-btn");
const logoutBtn = document.getElementById("logout-btn");
const toggleBtn = document.getElementById("toggle-auth-mode");
const toggleMsg = document.getElementById("toggle-msg");
const authTitle = document.getElementById("auth-title");
const authBtn = document.getElementById("auth-btn");

const taskInputWrapper = document.getElementById("task-input-wrapper");
const taskTitleInput = document.getElementById("task-title");
const taskForm = document.getElementById("task-form");
const taskListEl = document.getElementById("task-list");

// Phase 5 Elements
const progressCircle = document.getElementById('progress-circle');
const progressText = document.getElementById('progress-text');
const themeToggle = document.getElementById('theme-toggle');

// Phase 6 Elements (Modal & Search)
const searchInput = document.getElementById('search-input');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const successSound = document.getElementById('success-sound');

// State Variables
let isLoginMode = true;
let currentUser = null;
let unsubscribeTasks = null;
let currentTasks = []; 
let filterMode = "all"; 
let sortMode = "newest"; 
let currentCategory = "all";
let searchTerm = ""; // New state for search

// ==============================================
// 1. FILTER, SORT & SEARCH
// ==============================================

// Search Listener
searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    applyFiltersAndRender();
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    filterMode = e.target.dataset.filter;
    applyFiltersAndRender();
  });
});

const sortSelect = document.getElementById("sort-select");
if (sortSelect) {
  sortSelect.addEventListener("change", (e) => {
    sortMode = e.target.value;
    applyFiltersAndRender();
  });
}

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"));
    e.currentTarget.classList.add("active");
    currentCategory = e.currentTarget.dataset.category;

    const titleMap = {
      all: "All Tasks",
      work: "Work Projects",
      personal: "Personal Life",
      study: "Study & Learning",
    };
    document.getElementById("page-title").textContent = titleMap[currentCategory];
    applyFiltersAndRender();
  });
});

// ==============================================
// 2. AUTH & SESSION LOGIC (Unchanged)
// ==============================================

toggleBtn.addEventListener("click", () => {
  isLoginMode = !isLoginMode;
  if (isLoginMode) {
    authTitle.textContent = "Welcome Back";
    authBtn.textContent = "Log In";
    toggleMsg.textContent = "New here?";
    toggleBtn.textContent = "Create an account";
  } else {
    authTitle.textContent = "Create Account";
    authBtn.textContent = "Sign Up";
    toggleMsg.textContent = "Already have an account?";
    toggleBtn.textContent = "Log In";
  }
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passInput.value;
  const result = isLoginMode
    ? await loginUser(email, password)
    : await registerUser(email, password);
  if (!result.success) alert(result.error);
});

guestBtn.addEventListener("click", async () => {
  const guestUser = await loginGuest();
  handleUserSession(guestUser);
});

logoutBtn.addEventListener("click", () => {
  if (currentUser && currentUser.uid === "guest-user") {
    currentUser = null;
    if (unsubscribeTasks) unsubscribeTasks();
    currentTasks = [];
    switchScreen("login");
  } else {
    logoutUser();
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) handleUserSession(user);
  else if (currentUser?.uid !== "guest-user") {
    currentUser = null;
    if (unsubscribeTasks) unsubscribeTasks();
    switchScreen("login");
  }
});

function handleUserSession(user) {
  // 1. Update Current User State
  currentUser = user;
  document.getElementById("user-name").textContent = user.email ? user.email.split('@')[0] : "Guest";
  
  // 2. Clear previous data IMMEDIATELY (Fixes the "Guest Data" ghosting issue)
  currentTasks = []; 
  taskListEl.innerHTML = '<div style="text-align:center; margin-top:20px; color:#888;">Loading tasks...</div>';
  updateProgress([]); // Reset progress ring

  // 3. Show Dashboard
  switchScreen("dashboard");

  // 4. Stop listening to previous user's data
  if (unsubscribeTasks) unsubscribeTasks();
  
  // 5. Start listening to new user's data
  unsubscribeTasks = listenToTasks(user.uid, (tasks) => {
    currentTasks = tasks; 
    applyFiltersAndRender(); 
  });
}

// ==============================================
// 3. TASK CREATION
// ==============================================

taskTitleInput.addEventListener("focus", () => taskInputWrapper.classList.add("active"));

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const title = taskTitleInput.value.trim();
  const priority = document.getElementById("task-priority").value;
  const date = document.getElementById("task-date").value;
  const category = document.getElementById("task-category").value; 

  if (title) {
    await addTask(currentUser.uid, title, priority, date, category);
    taskForm.reset();
    taskInputWrapper.classList.remove("active");
  }
});

// ==============================================
// 4. THEME & PROGRESS
// ==============================================

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark 
        ? '<i class="fas fa-sun"></i> Light Mode' 
        : '<i class="fas fa-moon"></i> Dark Mode';
});

// Updated Progress Logic
function updateProgress(tasks) {
    if (tasks.length === 0) {
        setProgress(0);
        return;
    }
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = Math.round((completed / total) * 100);
    
    // Check if we just hit 100% (and ensure we don't spam it)
    const prevPercent = parseInt(progressText.textContent);
    if (percent === 100 && prevPercent < 100) {
        triggerConfetti();
    }
    
    setProgress(percent);
}

function setProgress(percent) {
    const offset = 164 - (164 * percent) / 100;
    progressCircle.style.strokeDashoffset = offset;
    progressText.textContent = `${percent}%`;
}

// NEW: Confetti Effect
function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4a90e2', '#50e3c2', '#ff4d4d'] // Your app theme colors
    });
}

// ==============================================
// 5. EDIT MODAL LOGIC (NEW)
// ==============================================

function openEditModal(task) {
    // Populate form with existing data
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-title').value = task.title;
    document.getElementById('edit-category').value = task.category || 'personal';
    document.getElementById('edit-priority').value = task.priority || 2;
    document.getElementById('edit-date').value = task.dueDate || '';
    
    // Show Modal
    editModal.classList.remove('hidden');
    setTimeout(() => editModal.classList.add('active'), 10);
}

function closeEditModal() {
    editModal.classList.remove('active');
    setTimeout(() => editModal.classList.add('hidden'), 300);
}

cancelEditBtn.addEventListener('click', closeEditModal);

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const taskId = document.getElementById('edit-task-id').value;
    const updates = {
        title: document.getElementById('edit-title').value,
        category: document.getElementById('edit-category').value,
        priority: parseInt(document.getElementById('edit-priority').value),
        dueDate: document.getElementById('edit-date').value
    };

    await updateTask(currentUser.uid, taskId, updates);
    closeEditModal();
});

// ==============================================
// 6. RENDER LOGIC (UPDATED)
// ==============================================

function applyFiltersAndRender() {
  let filtered = [...currentTasks];

  // A. SEARCH FILTER (NEW)
  if (searchTerm) {
      filtered = filtered.filter(t => t.title.toLowerCase().includes(searchTerm));
  }

  // B. CATEGORY FILTER
  if (currentCategory !== "all") {
    filtered = filtered.filter((t) => t.category === currentCategory);
  }

  // C. STATUS FILTER
  if (filterMode === "pending") {
    filtered = filtered.filter((t) => !t.completed);
  } else if (filterMode === "completed") {
    filtered = filtered.filter((t) => t.completed);
  }

  // D. SORTING
  filtered.sort((a, b) => {
    if (sortMode === "priority") {
      return b.priority - a.priority;
    } else if (sortMode === "date") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else {
      const dateA = getDateFromTask(a);
      const dateB = getDateFromTask(b);
      return dateB - dateA;
    }
  });

  renderTasks(filtered);
}

function getDateFromTask(task) {
  if (!task.createdAt) return new Date(0);
  if (task.createdAt.toDate) return task.createdAt.toDate();
  return new Date(task.createdAt);
}

function renderTasks(tasks) {
  updateProgress(tasks);
  taskListEl.innerHTML = "";

  if (tasks.length === 0) {
    taskListEl.innerHTML = `<div style="text-align:center; color:#999; margin-top:30px;">No tasks found.</div>`;
    return;
  }

  // ... inside renderTasks(tasks) ...

    tasks.forEach((task) => {
        const div = document.createElement("div");
        div.className = `task-item ${task.completed ? "completed" : ""} priority-${task.priority || 1}`;

        const cat = task.category || "personal";
        const catBadge = `<span class="category-tag cat-${cat}">${cat}</span>`;

        let dateDisplay = "";
        if (task.dueDate) {
            const dateObj = new Date(task.dueDate);
            const dateStr = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            dateDisplay = `<span class="date-badge"><i class="far fa-calendar"></i> ${dateStr}</span>`;
        }

        // --- SECURITY FIX STARTS HERE ---
        
        // 1. Create the HTML structure WITHOUT the title first (using empty span)
        div.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
            
            <div class="task-content">
                <span class="task-text"></span> <div class="task-meta">
                    ${catBadge} 
                    ${dateDisplay}
                </div>
            </div>

            <button class="edit-btn"><i class="fas fa-pencil-alt"></i></button>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        `;

        // 2. Safely inject the text using textContent (Prevents hacking)
        div.querySelector(".task-text").textContent = task.title;

        // --- SECURITY FIX ENDS HERE ---

        const checkbox = div.querySelector(".task-checkbox");
        // ... (Keep the rest of your event listeners the same)
        checkbox.addEventListener("change", () => {
             // ... your existing sound logic
             toggleTaskStatus(currentUser.uid, task.id, task.completed);
        });
        div.querySelector(".delete-btn").addEventListener("click", () => deleteTask(currentUser.uid, task.id));
        div.querySelector(".edit-btn").addEventListener("click", () => openEditModal(task));

        taskListEl.appendChild(div);
    });
}

function switchScreen(screenName) {
  const loginScreen = document.getElementById("login-screen");
  const appDashboard = document.getElementById("app-dashboard");
  if (screenName === "dashboard") {
    loginScreen.classList.add("hidden");
    loginScreen.classList.remove("active");
    appDashboard.classList.remove("hidden");
    setTimeout(() => appDashboard.classList.add("active"), 50);
  } else {
    appDashboard.classList.add("hidden");
    appDashboard.classList.remove("active");
    loginScreen.classList.remove("hidden");
    setTimeout(() => loginScreen.classList.add("active"), 50);
  }
}

// ==============================================
// 7. MOBILE MENU LOGIC (NEW)
// ==============================================

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('app-sidebar'); // Make sure to add id="app-sidebar" to HTML
const sidebarOverlay = document.getElementById('sidebar-overlay');

function toggleMobileMenu() {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('active');
}

// Open Menu
if(mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
}

// Close Menu when clicking overlay
if(sidebarOverlay) {
    sidebarOverlay.addEventListener('click', toggleMobileMenu);
}

// Close Menu when clicking a nav item (UX improvement)
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        if(window.innerWidth <= 768) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        }
    });
});