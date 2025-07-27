import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRouteByRol = ({ rolesPermitidos }) => {
  const { usuario, rol, cargando } = useAuth();

  if (cargando) {
    return <div className="min-h-screen flex items-center justify-center">⏳ Verificando acceso...</div>;
  }

  if (!usuario) return <Navigate to="/perfil" />;

  return rolesPermitidos.includes(rol) ? <Outlet /> : (
    <div className="min-h-screen flex flex-col items-center justify-center text-red-600 text-lg">
      🚫 Acceso denegado
      <a href="/" className="mt-3 px-4 py-2 bg-purple-600 text-white rounded">Volver al inicio</a>
    </div>
  );
};

export default ProtectedRouteByRol;
