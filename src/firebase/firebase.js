// src/firebase/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAtDkZlsTksbzDOUuA9S8XYQc5dxpbeJTg",
  authDomain: "barberyass.firebaseapp.com",
  projectId: "barberyass",
  storageBucket: "barberyass.firebasestorage.app",
  messagingSenderId: "971412744981",
  appId: "1:971412744981:web:fa2bd795477b170600971c",
  measurementId: "G-LGTKEPPCTH"
};

// 🔹 Verifica si ya existe una app inicializada
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// 🔹 Servicios principales
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app); // Para Cloud Functions
export const storage = getStorage(app); // Si quieres subir imágenes

// 🔹 App secundaria opcional (para crear usuarios sin desloguear admin)
export const secondaryApp = initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);
