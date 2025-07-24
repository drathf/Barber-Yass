// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  deleteUser,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setRol(snap.data().rol || "user");
        } else {
          // Si no existe el documento, lo creamos
          await setDoc(ref, {
            nombre: user.displayName || "",
            telefono: "",
            email: user.email.toLowerCase(),
            fechaNacimiento: "",
            rol: "user",
            creado: new Date().toISOString(),
          });
          setRol("user");
        }
      } else {
        setUsuario(null);
        setRol(null);
      }
      setCargando(false);
    });

    return () => unsub();
  }, []);

  // Login tradicional
  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // Login con Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUsuario(null);
      setRol(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Eliminar cuenta
  const deleteUserAccount = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await deleteUser(user);
        setUsuario(null);
        setRol(null);
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ usuario, rol, cargando, login, loginWithGoogle, logout, deleteUserAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
