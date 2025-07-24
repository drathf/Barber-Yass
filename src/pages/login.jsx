import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

// Assets
import logo from '../assets/galeria/logo.png';
import fondo from '../assets/galeria/fondo-barberia.jpg';
import corte1 from '../assets/galeria/cortesyservicios1.jpeg';
import corte2 from '../assets/galeria/cortesyservicios2.jpeg';
import corte3 from '../assets/galeria/cortesyservicios3.jpeg';
import corte4 from '../assets/galeria/cortesyservicios4.jpeg';
import corte5 from '../assets/galeria/cortesyservicios5.jpeg';
import evento1 from '../assets/galeria/evento1.png';
import marca1 from '../assets/galeria/marca1.png';
import marca2 from '../assets/galeria/marca2.png';
import marca3 from '../assets/galeria/marca3.png';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const galeria = [evento1, marca1, marca2, marca3, corte1, corte2, corte3, corte4, corte5];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.includes('@') || password.length < 6) {
      return setError('❌ Ingresa un correo válido y una contraseña de al menos 6 caracteres.');
    }

    try {
      setLoading(true);
      await login(email.toLowerCase(), password);
      navigate('/perfil');
    } catch (err) {
      console.error('Login error:', err.code, err.message);
      const errorMsg =
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
          ? '❌ Credenciales incorrectas o usuario no registrado.'
          : err.code === 'auth/invalid-email'
          ? '❌ Formato de correo inválido.'
          : '❌ Error al iniciar sesión. Intenta nuevamente.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate('/perfil');
    } catch (err) {
      console.error('Google login error:', err);
      setError('❌ No se pudo iniciar sesión con Google.');
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
        <title>Iniciar Sesión | BarberYass</title>
        <meta name="description" content="Accede a tu cuenta BarberYass para gestionar tus reservas, perfil y más." />
      </Helmet>

      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

      {/* Botón Volver */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-xs md:text-sm text-white bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded transition"
        >
          ← Atrás
        </button>
      </div>

      {/* Formulario */}
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

        <h2 className="text-2xl font-semibold mb-4 text-gray-800 tracking-tight">Bienvenido a BarberYass</h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-medium transition duration-200 text-white ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
            }`}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="my-4 border-t border-gray-300" />

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2 bg-white border border-gray-400 hover:bg-gray-100 rounded-lg text-black flex items-center justify-center gap-2"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          {loading ? 'Conectando...' : 'Ingresar con Google'}
        </button>

        <p className="mt-4 text-sm text-gray-500">
          ¿Olvidaste tu contraseña?{' '}
          <Link to="/recuperar" className="text-blue-600 underline">
            Recupérala aquí
          </Link>
        </p>
      </motion.div>

      {/* Galería */}
      <div className="relative z-10 mt-8 w-full max-w-4xl px-4">
        <div className="hidden md:grid grid-cols-5 gap-3">
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

export default Login;
