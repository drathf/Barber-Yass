import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRouteByRol = ({ rolesPermitidos }) => {
  const [usuario, setUsuario] = useState(null);
  const [rolUsuario, setRolUsuario] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);

        // Obtener rol desde Firestore
        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRolUsuario(snap.data().rol);
        }
      } else {
        setUsuario(null);
        setRolUsuario("");
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // Mientras carga los datos, muestra un loader o nada
  if (cargando) {
    return (
      <div className="min-h-screen flex justify-center items-center text-lg">
        Cargando...
      </div>
    );
  }

  // Si no está logueado, redirigir al inicio
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // Si el rol no está permitido, redirigir al inicio
  if (!rolesPermitidos.includes(rolUsuario)) {
    return <Navigate to="/" replace />;
  }

  // Si pasa todas las validaciones, mostrar la ruta protegida
  return <Outlet />;
};

export default ProtectedRouteByRol;
