// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  deleteUser,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
        const docSnap = await getDoc(doc(db, "usuarios", user.uid));
        setRol(docSnap.exists() ? docSnap.data().rol || "user" : "user");
      } else {
        setUsuario(null);
        setRol(null);
      }
      setCargando(false);
    });
    return () => unsub();
  }, []);

  // ✅ Login
  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUsuario(null);
      setRol(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // ✅ Delete user
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
      value={{ usuario, rol, cargando, login, logout, deleteUserAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
