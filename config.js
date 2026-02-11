// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAJZeMIQoPcfcMQb7R30thxt2Le4sRjwos",
    authDomain: "hatuake-cd81c.firebaseapp.com",
    projectId: "hatuake-cd81c",
    storageBucket: "hatuake-cd81c.firebasestorage.app",
    messagingSenderId: "236181089555",
    appId: "1:236181089555:web:b9a9aef7935b12bcd93ee6",
    measurementId: "G-GBH7EBLF46"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Log initialization for debugging (optional, can be removed in production)
console.log("🔥 Firebase Initialized Successfully");
console.log(`📡 Project ID: ${firebaseConfig.projectId}`);

// Export the initialized instances so other files can use them directly
export { app, analytics, auth, db, storage };
