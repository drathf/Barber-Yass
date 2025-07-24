// src/pages/register.jsx
import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

// Assets
import logo from '../assets/galeria/logo.png';
import fondo from '../assets/galeria/fondo-barberia.jpg';

const Register = () => {
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔐 Registro / Login con Google
  const handleGoogleSignIn = async () => {
    setMensaje(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const refUsuario = doc(db, 'usuarios', user.uid);
      const docSnap = await getDoc(refUsuario);

      if (!docSnap.exists()) {
        await setDoc(refUsuario, {
          nombre: user.displayName || '',
          telefono: '',
          email: user.email.toLowerCase(),
          fechaNacimiento: '',
          rol: 'user',
          creado: new Date().toISOString(),
        });
      }

      setMensaje('✅ Bienvenido con Google.');
      setTimeout(() => navigate('/perfil'), 1000);
    } catch (error) {
      console.error('❌ Google Auth Error:', error);
      setMensaje('❌ Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <Helmet>
        <title>Registro | BarberYass</title>
        <meta name="description" content="Crea tu cuenta para reservar servicios en la barbería BarberYass." />
      </Helmet>

      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

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

        <h2 className="text-xl font-bold mb-4 text-gray-800">Regístrate con Google</h2>

        {mensaje && (
          <div
            className={`text-sm mb-4 p-3 rounded ${
              mensaje.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {mensaje}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2 bg-white border border-gray-400 rounded text-gray-800 hover:bg-gray-100"
        >
          {loading ? 'Conectando...' : 'Continuar con Google'}
        </button>
      </motion.div>
    </div>
  );
};

export default Register;
