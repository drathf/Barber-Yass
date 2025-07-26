// src/layouts/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar"; // ✅ Usa el navbar global

const AdminLayout = () => {
  const { rol } = useAuth();

  const rolesPermitidos = ["admin", "god", "barberyass"];
  if (!rolesPermitidos.includes(rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg font-semibold">
        ⛔ Acceso denegado
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ✅ Navbar superior reutilizable */}
      <Navbar />

      {/* ✅ Contenido del panel */}
      <main className="flex-1 pt-20 px-4 md:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
