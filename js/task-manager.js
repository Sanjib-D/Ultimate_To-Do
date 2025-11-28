import { db } from './firebase-config.js';
import {
    collection, addDoc, query, where, onSnapshot,
    doc, updateDoc, deleteDoc, serverTimestamp, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tasksCol = collection(db, "tasks");
const LOCAL_KEY = "ultimate_todo_local";

// Helpers for Local Storage
const getLocalTasks = () => JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
const saveLocalTasks = (tasks) => localStorage.setItem(LOCAL_KEY, JSON.stringify(tasks));



// 1. ADD TASK
// Updated ADD TASK to include Category
export const addTask = async (userId, title, priority, dueDate, category) => {
    
    // --- ADD THIS SECURITY CHECK ---
    if (!title || title.trim() === "") {
        alert("Task title cannot be empty!");
        return;
    }
    if (title.length > 200) {
        alert("Task title is too long!");
        return;
    }
    // -------------------------------

    // Default to 'personal' if no category provided
    const cat = category || 'personal';

    if (userId === "guest-user") {
        const tasks = getLocalTasks();
        tasks.unshift({
            id: Date.now().toString(),
            userId: "guest-user",
            title,
            priority: parseInt(priority),
            dueDate,
            category: cat, // NEW FIELD
            completed: false,
            createdAt: new Date().toISOString()
        });
        saveLocalTasks(tasks);
        window.dispatchEvent(new Event('local-storage-update'));
        return;
    }

    // Cloud Mode
    await addDoc(tasksCol, {
        userId,
        title,
        priority: parseInt(priority),
        dueDate,
        category: cat, // NEW FIELD
        completed: false,
        createdAt: serverTimestamp()
    });
};

// 2. TOGGLE COMPLETE
export const toggleTaskStatus = async (userId, taskId, currentStatus) => {
    if (userId === "guest-user") {
        const tasks = getLocalTasks();
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !currentStatus;
            saveLocalTasks(tasks);
            window.dispatchEvent(new Event('local-storage-update'));
        }
        return;
    }

    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { completed: !currentStatus });
};

// 3. DELETE TASK
export const deleteTask = async (userId, taskId) => {
    if (userId === "guest-user") {
        const tasks = getLocalTasks().filter(t => t.id !== taskId);
        saveLocalTasks(tasks);
        window.dispatchEvent(new Event('local-storage-update'));
        return;
    }

    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
};

// 4. LISTEN TO TASKS (Updated with Error Handling)
export const listenToTasks = (userId, callback) => {
    // CASE A: GUEST (Local Storage)
    if (userId === "guest-user") {
        callback(getLocalTasks());
        const localHandler = () => callback(getLocalTasks());
        window.addEventListener('local-storage-update', localHandler);
        return () => window.removeEventListener('local-storage-update', localHandler);
    }

    // CASE B: LOGGED IN (Firebase)
    // We need a composite index for this query (userId + createdAt)
    const q = query(
        tasksCol, 
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, 
        (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(tasks);
        },
        (error) => {
            console.error("Firebase Error:", error);
            // If you see "The query requires an index" in the console, 
            // click the link provided there to fix it!
            if (error.code === 'failed-precondition') {
                alert("Database Setup Required: Open your browser console (F12) and click the link from Firebase to create the Index.");
            }
        }
    );
};
// 5. UPDATE TASK DETAILS (NEW)
export const updateTask = async (userId, taskId, updates) => {
    if (userId === "guest-user") {
        // Local Mode
        const tasks = getLocalTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index > -1) {
            // Merge existing task with updates
            tasks[index] = { ...tasks[index], ...updates };
            saveLocalTasks(tasks);
            window.dispatchEvent(new Event('local-storage-update'));
        }
        return;
    }

    // Cloud Mode
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, updates);
};

