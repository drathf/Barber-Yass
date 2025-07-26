import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import logo from "../assets/galeria/logo.png";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  // Estado usuario y rol
  const [usuario, setUsuario] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [rolUsuario, setRolUsuario] = useState("");

  // Estado login modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [credenciales, setCredenciales] = useState({ email: "", password: "" });
  const [mensaje, setMensaje] = useState("");

  // Detectar login y cargar datos usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setNombreUsuario(data.nombre);
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

  // Iniciar sesión
  const iniciarSesion = async (e) => {
    e.preventDefault();
    if (!credenciales.email || !credenciales.password) {
      setMensaje("⚠️ Ingresa email y contraseña");
      return;
    }
    try {
      await signInWithEmailAndPassword(
        auth,
        credenciales.email.toLowerCase(),
        credenciales.password
      );

      setMensaje("✅ Bienvenido");
      setCredenciales({ email: "", password: "" });

      setTimeout(() => {
        setShowLoginModal(false);
        setMensaje("");

        // Redirigir a /admin si es god o admin
        if (rolUsuario === "god" || rolUsuario === "admin") {
          navigate("/admin");
        }
      }, 1200);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setMensaje("❌ Credenciales incorrectas");
    }
  };

  // Cerrar sesión
  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <>
      <motion.header
        className="backdrop-blur bg-black/80 text-white fixed top-0 left-0 w-full z-50 shadow-md"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
          {/* Botón Lugo Studio (desactivado si está logueado) */}
          <button
            onClick={() => {
              if (!usuario) setShowLoginModal(true);
            }}
            disabled={usuario} // 👈 Desactivar si está logueado
            className={`flex items-center gap-2 ${
              usuario
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-105 transition"
            }`}
            title={usuario ? "Sesión iniciada" : "Iniciar sesión"}
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

            {/* Mostrar Admin Panel solo si es god o admin */}
            {usuario && (rolUsuario === "god" || rolUsuario === "admin") && (
              <Link
                to="/admin"
                className={`hover:text-purple-400 ${isActive("/admin") ? "text-purple-400" : ""}`}
              >
                Admin Panel
              </Link>
            )}

            {/* Si está logueado */}
            {usuario && (
              <div className="flex items-center gap-3">
                <span className="text-sm">👤 Bienvenido, <b>{nombreUsuario}</b></span>
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

      {/* Modal login */}
      {showLoginModal && !usuario && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center">Iniciar sesión</h2>

            {mensaje && (
              <p
                className={`text-center mb-3 ${
                  mensaje.includes("✅")
                    ? "text-green-600"
                    : mensaje.includes("⚠️")
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {mensaje}
              </p>
            )}

            <form onSubmit={iniciarSesion} className="space-y-4">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={credenciales.email}
                onChange={(e) =>
                  setCredenciales({ ...credenciales, email: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={credenciales.password}
                onChange={(e) =>
                  setCredenciales({ ...credenciales, password: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
              >
                Entrar
              </button>
            </form>

            <button
              onClick={() => setShowLoginModal(false)}
              className="w-full mt-4 text-center text-sm text-gray-600 hover:text-black"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
