// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

// Hook para usar el contexto en otros componentes
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [cargando, setCargando] = useState(true);

  /**
   * Inicio de sesión con Google
   * Si el usuario no existe en Firestore lo crea con rol por defecto 👤 (user)
   */
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const userRef = doc(db, "usuarios", result.user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        // Crear usuario nuevo en Firestore
        await setDoc(userRef, {
          nombre: result.user.displayName,
          email: result.user.email,
          foto: result.user.photoURL || "",
          rol: "user", // Rol por defecto
          requierePago: true, // Debe pagar 50% para reservar
          creado: new Date().toISOString(),
        });
        setRol("user");
      } else {
        setRol(snap.data().rol);
      }
    } catch (error) {
      console.error("Error en login con Google:", error);
      alert("Error al iniciar sesión con Google");
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  /**
   * Listener de cambios en sesión Firebase
   * Obtiene datos y rol desde Firestore
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);

      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            setRol(snap.data().rol);
          } else {
            // Si el documento no existe, crearlo con valores por defecto
            await setDoc(userRef, {
              nombre: user.displayName,
              email: user.email,
              foto: user.photoURL || "",
              rol: "user",
              requierePago: true,
              creado: new Date().toISOString(),
            });
            setRol("user");
          }
        } catch (error) {
          console.error("Error obteniendo datos del usuario:", error);
          setRol(null);
        }
      } else {
        setRol(null);
      }

      setCargando(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ usuario, rol, loginWithGoogle, logout, cargando }}
    >
      {children}
    </AuthContext.Provider>
  );
};
