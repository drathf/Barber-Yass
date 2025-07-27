// 📁 src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);

        try {
          // Obtener rol desde Firestore
          const ref = doc(db, "usuarios", user.uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            const rolFirestore = snap.data().rol || "user";
            setRol(rolFirestore);

            // Guardar el rol en el token para reglas de Firestore
            const tokenResult = await getIdTokenResult(user);
            if (tokenResult.claims.rol !== rolFirestore) {
              // ⚡ Importante: no se pueden actualizar los claims desde el frontend
              console.warn("⚠️ El rol no está en los claims. Se usará el de Firestore.");
            }
          } else {
            setRol("user");
          }
        } catch (error) {
          console.error("❌ Error obteniendo el rol:", error);
          setRol("user");
        }
      } else {
        setUsuario(null);
        setRol("");
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, rol, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
