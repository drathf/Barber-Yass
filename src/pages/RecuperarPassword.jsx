// src/pages/RecuperarPassword.jsx
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import logo from "../assets/galeria/logo.png";
import fondo from "../assets/galeria/fondo-barberia.jpg";
import { useNavigate } from "react-router-dom";

const RecuperarPassword = () => {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMensaje("✅ Te hemos enviado un correo para restablecer tu contraseña.");
      setEmail("");
    } catch (err) {
      console.error(err);
      setError("❌ Ocurrió un error. Verifica el correo ingresado.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <Helmet>
        <title>Recuperar Contraseña | BarberYass</title>
        <meta
          name="description"
          content="Restablece tu contraseña de BarberYass si la has olvidado."
        />
        <meta name="keywords" content="recuperar contraseña, BarberYass, login" />
      </Helmet>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

      <motion.div
        className="relative z-10 bg-white bg-opacity-95 p-6 rounded-xl shadow-md w-full max-w-sm text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img src={logo} alt="Logo BarberYass" className="w-20 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-4 text-gray-800">Recuperar contraseña</h2>

        {mensaje && (
          <p className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{mensaje}</p>
        )}
        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>
        )}

        <form onSubmit={handleReset} className="space-y-4 text-left">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
          >
            Enviar enlace de recuperación
          </button>
        </form>

        <p className="text-sm mt-4 text-gray-500">
          ¿Ya recordaste tu contraseña?{" "}
          <button
            onClick={() => navigate("/perfil")}
            className="text-blue-600 underline"
          >
            Iniciar sesión
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default RecuperarPassword;
