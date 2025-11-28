# Ultimate To-Do ✅

**Master Your Day, Effortlessly.**

Ultimate To-Do is a modern, responsive, and intelligent task management application designed to help you organize your life. Built with Vanilla JavaScript and Firebase, it features a distraction-free interface, offline capabilities, and smart categorization to keep you focused on what matters.

## 🚀 Live Demo

[**View Live Demo**](https://sanjib-d.github.io/Ultimate_To-Do/).

## ✨ Features

-   **Authentication & Cloud Sync:** Secure login and sign-up powered by **Firebase Auth** with real-time data syncing via **Firestore**.
-   **Offline "Guest" Mode:** Fully functional offline mode using LocalStorage. Data persists locally without an account.
-   **Smart Task Management:**
    -   **Categorization:** Organize tasks by *Work*, *Personal*, or *Study*.
    -   **Prioritization:** Assign Low, Medium, or High priority to tasks.
    -   **Due Dates:** Track deadlines efficiently.
-   **Dynamic Visuals:**
    -   **Progress Ring:** Real-time visualization of your daily goal completion.
    -   **Confetti Celebration:** A fun visual reward when you hit 100% completion! 🎉
    -   **Dark Mode:** A carefully crafted dark theme for late-night productivity.
-   **Filtering & Sorting:**
    -   **Search:** Instant search to find tasks in milliseconds.
    -   **Filters:** View All, Pending, or Completed tasks.
    -   **Sorting:** Sort by Newest, Priority, or Due Date.
-   **Responsive Design:** Features a mobile-friendly sidebar and adaptive layout for phones and tablets.

## 🛠️ Tech Stack

-   **Frontend:** HTML5, CSS3 (Custom Properties & Animations), JavaScript (ES6 Modules).
-   **Backend / BaaS:** Firebase (Authentication, Firestore Database).

## 📂 Project Structure

```text
/
├── index.html          # Landing page
├── app.html            # Main application interface
├── js/
│   ├── app.js          # Main logic (UI, Event Listeners, State)
│   ├── auth.js         # Authentication logic (Login, Register, Guest)
│   ├── firebase-config.js # Firebase initialization
│   └── task-manager.js # CRUD operations (Firestore + LocalStorage)
├── styles/
│   ├── main.css        # Global styles, Theme, & Responsive layout
│   └── auth.css        # Login screen specific styles
└── README.md           # Project documentation
```

---

## 🔄 How to Use

1.  **Get Started:** Sign up to sync data or select **Guest Mode** for offline use.
2.  **Add Tasks:** Click the input bar. Enter a title, select a category (*Work, Personal, Study*), set priority, and hit Enter.
3.  **Track Progress:** Check off tasks to fill the daily **Progress Ring**. 100% completion triggers a confetti celebration!.
4.  **Organize:** Use the sidebar to filter lists. Use the top bar to **Search** or **Sort** by date/priority.

---

## 👤 Author

**Sanjib Das**

* 💻 **GitHub:** [@Sanjib-D](https://github.com/Sanjib-D)
* 👔 **LinkedIn:** [Sanjib Dev](https://www.linkedin.com/in/sanjib-dev)
* 🚀 **Portfolio:** [Coming Soon]

*Built with ❤️ using Vanilla JavaScript, Firebase, and AI assistance.*
