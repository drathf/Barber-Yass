import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

import logo from '../assets/galeria/logo.png';
import fondo from '../assets/galeria/fondo-barberia.jpg';

// Galería de cortes
import corte1 from '../assets/galeria/cortesyservicios1.jpeg';
import corte2 from '../assets/galeria/cortesyservicios2.jpeg';
import corte3 from '../assets/galeria/cortesyservicios3.jpeg';
import corte4 from '../assets/galeria/cortesyservicios4.jpeg';
import corte5 from '../assets/galeria/cortesyservicios5.jpeg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/perfil');
    } catch (err) {
      console.error(err);
      setError('❌ Credenciales incorrectas o usuario no registrado.');
      setEmail('');
      setPassword('');
    }
  };

  const galeria = [corte1, corte2, corte3, corte4, corte5];

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center relative px-4"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <Helmet>
        <title>Iniciar Sesión | BarberYass</title>
        <meta name="description" content="Accede a tu cuenta BarberYass para gestionar tus reservas, perfil y más." />
        <meta name="keywords" content="login, barbería, cuenta, ingresar, BarberYass" />
        <meta name="author" content="BarberYass" />
      </Helmet>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

      {/* Botón Atrás */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
        <button
          onClick={() => navigate(-1)}
          aria-label="Volver atrás"
          className="text-xs md:text-sm text-white bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded transition"
        >
          ← Atrás
        </button>
      </div>

      {/* Card de login */}
      <motion.div
        className="relative z-10 w-full max-w-sm bg-white bg-opacity-95 p-6 rounded-xl shadow-md text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src={logo}
          alt="Logo BarberYass"
          className="w-20 mx-auto mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        />

        <h2 className="text-xl font-bold mb-4 text-gray-800">Inicia sesión</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <input
            type="email"
            autoComplete="email"
            placeholder="Correo electrónico"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Contraseña"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
          >
            Ingresar
          </button>
        </form>

        {/* Opción de recuperación */}
        <p className="mt-4 text-sm text-gray-500">
          ¿Olvidaste tu contraseña?{' '}
          <Link to="/recuperar" className="text-blue-600 underline">
            Recupérala aquí
          </Link>
        </p>
      </motion.div>

      {/* Galería visual */}
      <div className="relative z-10 mt-8 w-full max-w-3xl px-4">
        {/* Desktop */}
        <div className="hidden md:grid grid-cols-5 gap-3">
          {galeria.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Corte ${i + 1}`}
              loading="lazy"
              className="w-full h-28 object-cover rounded-xl shadow-md border border-white hover:scale-105 transition duration-200"
            />
          ))}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex gap-3 overflow-x-auto scrollbar-hide">
          {galeria.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Corte ${i + 1}`}
              loading="lazy"
              className="h-28 w-28 object-cover rounded-xl shadow-md border border-white hover:scale-105 transition duration-200"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
