// 📁 src/components/ProtectedRouteByRol.jsx
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRouteByRol = ({ rolesPermitidos }) => {
  const [usuario, setUsuario] = useState(null);
  const [rolUsuario, setRolUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        try {
          const ref = doc(db, "usuarios", user.uid);
          const snap = await getDoc(ref);
          setRolUsuario(snap.exists() ? snap.data().rol || "" : "");
        } catch (error) {
          console.error("Error obteniendo el rol del usuario:", error);
          setRolUsuario("");
        }
      } else {
        setUsuario(null);
        setRolUsuario("");
      }
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  // Loader
  if (cargando || rolUsuario === null) {
    return (
      <div className="min-h-screen flex justify-center items-center text-lg text-purple-700">
        ⏳ Verificando acceso...
      </div>
    );
  }

  // Usuario no logueado
  if (!usuario) {
    return <Navigate to="/perfil" replace />;
  }

  // Rol no permitido
  if (!rolesPermitidos.includes(rolUsuario)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-red-600 text-xl font-semibold">
        <span className="mb-2">🚫 Acceso denegado</span>
        <p className="text-base text-gray-700">
          No tienes permisos para acceder a esta sección.
        </p>
        <a
          href="/"
          className="mt-4 text-white bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg transition"
        >
          Volver al inicio
        </a>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRouteByRol;
