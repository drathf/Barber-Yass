// 📁 src/firebase/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// ✅ Configuración de Firebase (copia los datos exactos desde tu consola Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyAtDkZlsTksbzDOUuA9S8XYQc5dxpbeJTg",
  authDomain: "barberyass.firebaseapp.com",
  projectId: "barberyass",
  storageBucket: "barberyass.appspot.com",
  messagingSenderId: "971412744981",
  appId: "1:971412744981:web:fa2bd795477b170600971c",
  measurementId: "G-LGTKEPPCTH",
};

// ✅ Inicializa la App de Firebase (solo una vez)
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  console.log("🔥 Firebase inicializado correctamente");
} catch (error) {
  console.error("❌ Error inicializando Firebase:", error);
}

// ✅ Inicializa y exporta los servicios de Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// 🔹 Logs para depurar conexiones
console.log("📂 Firestore conectado:", db);
console.log("🔑 Auth conectado:", auth);
