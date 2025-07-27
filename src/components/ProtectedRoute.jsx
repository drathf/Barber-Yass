// 📁 src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protege rutas para usuarios autenticados
 * Redirige a /perfil si no hay sesión activa
 */
const ProtectedRoute = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Cargando...
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/perfil" />;
  }

  return children;
};

export default ProtectedRoute;
