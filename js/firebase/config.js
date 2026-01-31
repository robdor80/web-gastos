import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCyDxkF0w3zzWOpsZKQ4cPR6cmlm9AH42s",
  authDomain: "web-gastos-c559a.firebaseapp.com",
  projectId: "web-gastos-c559a",
  storageBucket: "web-gastos-c559a.firebasestorage.app",
  messagingSenderId: "512419216911",
  appId: "1:512419216911:web:079eabaa1a4afe65c72d7a"
};

// Inicializamos la app aquí para que todos la compartan
export const app = initializeApp(firebaseConfig);