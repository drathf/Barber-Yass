// src/pages/Auth.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";

// ✅ Rutas corregidas (src/assets/galeria)
import logo from "../assets/galeria/logo.png";
import fondo from "../assets/galeria/fondo-barberia.jpg";
import servicios1 from "../assets/galeria/servicios (1).jpg";
import servicios2 from "../assets/galeria/servicios (2).jpg";
import servicios6 from "../assets/galeria/servicios (6).jpg";
import servicios7 from "../assets/galeria/servicios (7).jpg";
import servicios17 from "../assets/galeria/servicios (17).jpg";
import servicios18 from "../assets/galeria/servicios (18).jpg";

const Auth = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, usuario, rol } = useAuth();

  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);

  // Galería agrupada
  const galeria = [
    servicios1, servicios18,
    servicios2, servicios6,
    servicios7, servicios17,
  ];

  // Redirección según rol
  useEffect(() => {
    if (usuario && rol) {
      if (rol === "god" || rol === "admin" || rol === "barberyass") {
        navigate("/admin");
      } else {
        navigate("/perfil");
      }
    }
  }, [usuario, rol, navigate]);

  const handleGoogleLogin = async () => {
    setMensaje(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      setMensaje("✅ Bienvenido, redirigiendo...");
    } catch (error) {
      console.error("Google Login Error:", error);
      setMensaje("⚠️ No se pudo iniciar sesión con Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center relative px-4"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <Helmet>
        <title>Autenticación | BarberYass</title>
        <meta
          name="description"
          content="Inicia sesión con tu cuenta Google en BarberYass."
        />
      </Helmet>

      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

      {/* Caja central */}
      <motion.div
        className="relative z-10 w-full max-w-sm bg-white bg-opacity-95 p-6 rounded-xl shadow-xl text-center backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src={logo}
          alt="Logo BarberYass"
          className="w-24 mx-auto mb-4 rounded-full"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        />

        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Bienvenido a BarberYass
        </h2>

        {mensaje && (
          <div
            className={`text-sm mb-4 p-3 rounded ${
              mensaje.startsWith("✅")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {mensaje}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full py-2 rounded-lg font-medium border flex items-center justify-center gap-2 ${
            loading
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-white hover:bg-gray-100 text-black"
          }`}
          aria-label="Iniciar sesión con Google"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          {loading ? "Conectando..." : "Iniciar sesión con Google"}
        </button>
      </motion.div>

      {/* Galería inferior */}
      <div className="relative z-10 mt-8 w-full max-w-4xl px-4">
        <div className="hidden md:grid grid-cols-3 gap-3">
          {galeria.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Visual ${i + 1}`}
              loading="lazy"
              className="w-full h-32 object-cover rounded-xl shadow-lg border border-white hover:scale-105 transition duration-200"
            />
          ))}
        </div>
        <div className="md:hidden flex gap-3 overflow-x-auto scrollbar-hide">
          {galeria.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Visual ${i + 1}`}
              loading="lazy"
              className="h-28 w-28 object-cover rounded-xl shadow-md border border-white hover:scale-105 transition duration-200"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Auth;
