// src/pages/adminpanel.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/galeria/logo.png";
import fondo from "../assets/galeria/fondo-barberia.jpg";
import { useAuth } from "../context/AuthContext";
import { Helmet } from "react-helmet-async";

const adminOpciones = [
  { path: "/admin/usuarios", label: "👥 Gestión de Usuarios", color: "bg-indigo-600" },
  { path: "/admin/horarios", label: "🕒 Horarios y Reservas", color: "bg-cyan-600" },
  { path: "/admin/servicios", label: "💈 Servicios", color: "bg-yellow-600" },
  { path: "/admin/manual", label: "📝 Reserva Manual", color: "bg-purple-600" },
];

export default function AdminPanel() {
  const { rol } = useAuth();

  if (!(rol === "god" || rol === "admin" || rol === "barberyass")) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl font-semibold">
        🚫 Acceso denegado
      </div>
    );
  }

  const iconRol = {
    god: "👑",
    admin: "⭐",
    barberyass: "⭐",
  }[rol] || "";

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <Helmet>
        <title>Panel de Administración | BarberYass</title>
      </Helmet>

      <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>

      <div className="relative z-10 p-6 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-screen">
        <motion.img
          src={logo}
          alt="Logo BarberYass"
          className="w-20 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        />

        <h2 className="text-4xl font-bold text-white text-center mb-4 drop-shadow-lg">
          🛠️ Panel de Administración {iconRol}
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-4xl">
          {adminOpciones.map((opcion, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className={`rounded-xl text-white text-center shadow-lg hover:shadow-2xl transition cursor-pointer ${opcion.color}`}
            >
              <Link
                to={opcion.path}
                className="block py-6 px-4 text-lg font-semibold tracking-wide"
              >
                {opcion.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
