import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <div className="min-h-screen flex items-center justify-center">⏳ Cargando...</div>;
  }

  return usuario ? children : <Navigate to="/perfil" />;
};

export default ProtectedRoute;
