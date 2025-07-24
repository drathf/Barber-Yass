// src/components/Navbar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/galeria/logo.png";
import { motion } from "framer-motion";

const Navbar = () => {
  const { usuario, rol, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/"); // Redirigir al inicio
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <motion.header
      className="backdrop-blur bg-black/80 text-white fixed top-0 left-0 w-full z-50 shadow-md"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
        {/* Logo + Marca */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-bold text-lg tracking-wide">BarberYass</span>
        </Link>

        {/* Navegación */}
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link
            to="/"
            className={`hover:text-purple-400 ${isActive("/") ? "text-purple-400" : ""}`}
          >
            Inicio
          </Link>

          <Link
            to="/galeria"
            className={`hover:text-purple-400 ${isActive("/galeria") ? "text-purple-400" : ""}`}
          >
            Galería
          </Link>

          {usuario && (
            <Link
              to="/perfil"
              className={`hover:text-purple-400 ${isActive("/perfil") ? "text-purple-400" : ""}`}
            >
              Perfil
            </Link>
          )}

          {rol === "user" && (
            <Link
              to="/reservar"
              className={`hover:text-purple-400 ${isActive("/reservar") ? "text-purple-400" : ""}`}
            >
              Reservar
            </Link>
          )}

          {rol === "vip" && (
            <>
              <Link
                to="/reservar"
                className={`hover:text-purple-400 ${isActive("/reservar") ? "text-purple-400" : ""}`}
              >
                Reservar
              </Link>
              <Link
                to="/eventos"
                className={`hover:text-purple-400 ${isActive("/eventos") ? "text-purple-400" : ""}`}
              >
                Promos
              </Link>
            </>
          )}

          {(rol === "admin" || rol === "barberyass") && (
            <>
              <Link
                to="/eventos"
                className={`hover:text-purple-400 ${isActive("/eventos") ? "text-purple-400" : ""}`}
              >
                Promos
              </Link>
              <Link
                to="/admin"
                className={`hover:text-purple-400 ${
                  location.pathname.startsWith("/admin") ? "text-purple-400" : ""
                }`}
              >
                Admin
              </Link>
            </>
          )}

          {rol === "god" && (
            <>
              <Link
                to="/reservar"
                className={`hover:text-purple-400 ${isActive("/reservar") ? "text-purple-400" : ""}`}
              >
                Reservar
              </Link>
              <Link
                to="/eventos"
                className={`hover:text-purple-400 ${isActive("/eventos") ? "text-purple-400" : ""}`}
              >
                Promos
              </Link>
              <Link
                to="/admin"
                className={`hover:text-purple-400 ${
                  location.pathname.startsWith("/admin") ? "text-purple-400" : ""
                }`}
              >
                Admin
              </Link>
            </>
          )}

          {/* Sesión */}
          {usuario ? (
            <motion.button
              onClick={handleLogout}
              whileTap={{ scale: 0.95 }}
              className="ml-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition"
            >
              Cerrar sesión
            </motion.button>
          ) : (
            <Link
              to="/login"
              className="ml-3 bg-white text-black px-3 py-1 rounded text-xs hover:bg-gray-200 transition"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Navbar;
