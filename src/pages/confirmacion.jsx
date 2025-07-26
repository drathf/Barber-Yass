// ✅ Confirmacion.jsx optimizado con SEO, Helmet-Async y animaciones
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import logo from '../assets/galeria/logo.png';

const Confirmacion = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white">
      <Helmet>
        <title>Reserva Confirmada | BarberYass</title>
        <meta
          name="description"
          content="Confirmación de tu cita en BarberYass. ¡Gracias por reservar con nosotros!"
        />
        <meta
          name="keywords"
          content="confirmación reserva, BarberYass, cita barbero"
        />
        <meta name="author" content="BarberYass" />
      </Helmet>

      <motion.img
        src={logo}
        alt="Logo BarberYass"
        className="w-20 mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      />

      <motion.h1
        className="text-3xl font-bold mb-3 text-green-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        ¡Reserva Confirmada! ✅
      </motion.h1>

      <p className="mb-6 text-gray-700 max-w-md">
        Gracias por confiar en <strong>BarberYass</strong>. Hemos registrado tu cita con éxito y pronto recibirás la confirmación por <strong>WhatsApp</strong>. 
      </p>

      <Link
        to="/perfil"
        className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
      >
        Ver mis reservas
      </Link>
    </div>
  );
};

export default Confirmacion;
