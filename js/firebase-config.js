import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBYjR3NUR0IyL-aQBBxRsDU3pha_foZwQo",
    authDomain: "to-do-71ec7.firebaseapp.com",
    projectId: "to-do-71ec7",
    storageBucket: "to-do-71ec7.firebasestorage.app",
    messagingSenderId: "398588497606",
    appId: "1:398588497606:web:f1d54c7f412d4417c751c7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);