// src/firebase/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; // ✅ Importar storage

const firebaseConfig = {
  apiKey: "AIzaSyAtDkZlsTksbzDOUuA9S8XYQc5dxpbeJTg",
  authDomain: "barberyass.firebaseapp.com",
  projectId: "barberyass",
  storageBucket: "barberyass.appspot.com", // ✅ Debe terminar en .appspot.com
  messagingSenderId: "971412744981",
  appId: "1:971412744981:web:fa2bd795477b170600971c",
};

const app = initializeApp(firebaseConfig);

// ✅ Exportar las instancias de Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
