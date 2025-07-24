// src/pages/register.jsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

import logo from '../assets/galeria/logo.png';
import fondo from '../assets/galeria/fondo-barberia.jpg';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setLoading(true);

    const emailLower = email.toLowerCase();

    try {
      const cred = await createUserWithEmailAndPassword(auth, emailLower, password);
      const user = cred.user;

      await setDoc(doc(db, 'usuarios', user.uid), {
        nombre,
        telefono,
        email: emailLower,
        fechaNacimiento,
        rol: 'user',
        creado: new Date().toISOString(),
      });

      setMensaje('✅ Usuario registrado correctamente.');
      setTimeout(() => navigate('/perfil'), 1500);
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error: ' + error.message);
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
        <meta name="keywords" content="registro, crear cuenta, barbería, BarberYass" />
        <meta name="author" content="BarberYass" />
      </Helmet>

      <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>

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

        <h2 className="text-xl font-bold mb-4 text-gray-800">Crear cuenta</h2>

        {mensaje && (
          <div
            className={`text-sm mb-4 p-3 rounded ${
              mensaje.startsWith('✅')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input
            type="text"
            placeholder="Nombre completo"
            className="w-full p-2 border rounded"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Teléfono"
            className="w-full p-2 border rounded"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800 text-white'
            }`}
          >
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
