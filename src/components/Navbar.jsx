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
  const [usuario, setUsuario] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [rolUsuario, setRolUsuario] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [esTransparente, setEsTransparente] = useState(true);

  // Transparencia al hacer scroll solo en home
  useEffect(() => {
    const manejarScroll = () => {
      setEsTransparente(location.pathname === "/" && window.scrollY <= 50);
    };
    manejarScroll();
    window.addEventListener("scroll", manejarScroll);
    return () => window.removeEventListener("scroll", manejarScroll);
  }, [location.pathname]);

  // Estado de sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setNombreUsuario(data.nombre || user.email);
          setRolUsuario(data.rol || "");
        }
      } else {
        setUsuario(null);
        setNombreUsuario("");
        setRolUsuario("");
      }
    });
    return () => unsubscribe();
  }, []);

  // Cerrar sesión
  const cerrarSesion = async () => {
    await signOut(auth);
    navigate("/");
  };

  const navItems = [
    { path: "/", label: "Inicio" },
    { path: "/galeria", label: "Galería" },
    { path: "/reservar", label: "Reservar Cita" },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        esTransparente
          ? "bg-black/40 backdrop-blur"
          : "bg-black text-white shadow-md"
      }`}
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3 text-white">
        {/* Logo */}
        <button
          onClick={() => navigate("/perfil")}
          className="flex items-center gap-2 hover:scale-105 transition"
          title={usuario ? "Ir a tu perfil" : "Iniciar sesión"}
        >
          <img
            src={logo}
            alt="Logo Lugo Studio"
            className="w-10 h-10 object-contain"
          />
          <span className="font-bold text-lg tracking-wide">Lugo Studio</span>
        </button>

        {/* Menú móvil */}
        <button
          className="md:hidden text-xl focus:outline-none"
          onClick={() => setMenuAbierto((prev) => !prev)}
          aria-label="Abrir menú"
        >
          {menuAbierto ? "✖" : "☰"}
        </button>

        {/* Navegación */}
        <nav
          className={`${
            menuAbierto ? "flex" : "hidden"
          } md:flex flex-col md:flex-row md:items-center gap-4 text-sm font-medium absolute md:static top-16 left-0 w-full md:w-auto bg-black md:bg-transparent p-4 md:p-0`}
        >
          {navItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              onClick={() => setMenuAbierto(false)}
              className={`hover:text-purple-400 ${
                location.pathname === item.path ? "text-purple-400" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Admin Panel */}
          {usuario && ["god", "admin", "barberyass"].includes(rolUsuario) && (
            <Link
              to="/admin"
              onClick={() => setMenuAbierto(false)}
              className={`hover:text-purple-400 ${
                location.pathname.startsWith("/admin") ? "text-purple-400" : ""
              }`}
            >
              Admin Panel
            </Link>
          )}

          {/* Usuario */}
          {usuario ? (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <span className="text-xs md:text-sm truncate max-w-[150px] md:max-w-none">
                👤 {nombreUsuario}
              </span>
              <button
                onClick={cerrarSesion}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-xs transition"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-2">
              <Link
                to="/perfil"
                onClick={() => setMenuAbierto(false)}
                className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-white text-xs transition text-center"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/recuperar"
                onClick={() => setMenuAbierto(false)}
                className="text-gray-300 hover:text-purple-400 text-xs text-center"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Navbar;
