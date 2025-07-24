// src/components/ProtectedRouteByRol.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const jerarquiaRoles = ["user", "vip", "admin", "barberyass", "god"];

const ProtectedRouteByRol = ({
  children,
  rolesPermitidos = [],
  redirectTo = "/login",
  mostrarMensaje = true,
}) => {
  const { usuario, rol, cargando } = useAuth();

  if (cargando) {
    return <div className="text-center p-8">Cargando permisos...</div>;
  }

  if (!usuario) return <Navigate to={redirectTo} />;

  const tieneAcceso =
    rolesPermitidos.includes(rol) ||
    rolesPermitidos.some((r) => jerarquiaRoles.indexOf(rol) > jerarquiaRoles.indexOf(r));

  if (!tieneAcceso) {
    if (!mostrarMensaje) return <Navigate to={redirectTo} />;
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-center p-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">⛔ Acceso Denegado</h2>
          <p>Tu rol actual <strong>{rol}</strong> no tiene acceso.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRouteByRol;
