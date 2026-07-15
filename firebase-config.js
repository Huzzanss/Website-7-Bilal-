/* =========================================================
   ISI DENGAN firebaseConfig DARI PROJECT FIREBASE ANDA
   Firebase Console → Project Settings → Your apps → SDK setup
   ========================================================= */
const firebaseConfig = {
   apiKey: "AIzaSyAGPE_TGTfBYdZCJkiryEfvXWLp4Hn_fhQ",
   authDomain: "vii-bilal-2026.firebaseapp.com",
   projectId: "vii-bilal-2026",
   storageBucket: "vii-bilal-2026.firebasestorage.app",
   messagingSenderId: "319968710286",
   appId: "1:319968710286:web:a18a0a2531ef04177083df",
   measurementId: "G-SYJ0CKK811"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
