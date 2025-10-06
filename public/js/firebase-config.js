// Firebase Configuration for Nails By Sau Booking System
// Replace these values with your actual Firebase project credentials

const firebaseConfig = {
    apiKey: "AIzaSyCv_03_wwb_bR_Fd8p3B4ORbFzOuaqhjm0",
    authDomain: "nailsbysau.firebaseapp.com",
    projectId: "nailsbysau",
    storageBucket: "nailsbysau.firebasestorage.app",
    messagingSenderId: "27650722373",
    appId: "1:27650722373:web:5db0fba2cf0ea3bda4f12c",
    measurementId: "G-GOWKV6T1HQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;

console.log('Firebase initialized successfully');

