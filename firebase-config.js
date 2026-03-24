import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDV-p_a_-GyLGjAsaaLFkVLk79x3JqFyA",
  authDomain: "asish-f7dd3.firebaseapp.com",
  projectId: "asish-f7dd3",
  storageBucket: "asish-f7dd3.firebasestorage.app",
  messagingSenderId: "120249700723",
  appId: "1:120249700723:web:22f1c37d6666f0c97f7506",
  measurementId: "G-KKX5X8VD6M"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, analytics };
