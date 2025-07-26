import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import logo from "../assets/galeria/logo.png";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const [usuario, setUsuario] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [rolUsuario, setRolUsuario] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setNombreUsuario(data.nombre || user.email);
          setRolUsuario(data.rol);
        }
      } else {
        setUsuario(null);
        setNombreUsuario("");
        setRolUsuario("");
      }
    });
    return () => unsubscribe();
  }, []);

  const cerrarSesion = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <motion.header
      className="backdrop-blur bg-black/80 text-white fixed top-0 left-0 w-full z-50 shadow-md"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
        {/* Logo -> Perfil */}
        <button
          onClick={() => navigate("/perfil")}
          className="flex items-center gap-2 hover:scale-105 transition"
          title="Ir a perfil/login"
        >
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-bold text-lg tracking-wide">Lugo Studio</span>
        </button>

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
          <Link
            to="/reservar"
            className={`hover:text-purple-400 ${isActive("/reservar") ? "text-purple-400" : ""}`}
          >
            Reservar Cita
          </Link>

          {/* Mostrar admin panel solo si tiene rol */}
          {usuario && ["god", "admin", "barberyass"].includes(rolUsuario) && (
            <Link
              to="/admin/horarios"
              className={`hover:text-purple-400 ${isActive("/admin/horarios") ? "text-purple-400" : ""}`}
            >
              Admin Panel
            </Link>
          )}

          {usuario && (
            <div className="flex items-center gap-3">
              <span className="text-sm">👤 {nombreUsuario}</span>
              <button
                onClick={cerrarSesion}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-xs transition"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Navbar;
