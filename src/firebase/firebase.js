// 📁 src/firebase/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Configuración de Firebase (copiada desde Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAtDkZlsTksbzDOUuA9S8XYQc5dxpbeJTg",
  authDomain: "barberyass.firebaseapp.com",
  projectId: "barberyass",
  storageBucket: "barberyass.appspot.com", // 🔹 corregido (.app -> .appspot.com)
  messagingSenderId: "971412744981",
  appId: "1:971412744981:web:fa2bd795477b170600971c",
  measurementId: "G-LGTKEPPCTH",
};

// 🔹 Inicializar app (si no existe)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// 🔹 Servicios principales exportados
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// 🔹 App secundaria opcional (para crear usuarios sin desloguear admin)
let secondaryApp = null;
let secondaryAuth = null;

if (!getApps().some((a) => a.name === "Secondary")) {
  secondaryApp = initializeApp(firebaseConfig, "Secondary");
  secondaryAuth = getAuth(secondaryApp);
}

export { secondaryApp, secondaryAuth };
