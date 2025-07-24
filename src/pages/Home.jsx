// ✅ Home.jsx con SEO, imagenes locales, y mejor estructura
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Helmet } from 'react-helmet';

import logo from '../assets/galeria/logo2.png';
import img1 from '../assets/galeria/cortesyservicios1.jpeg';
import img2 from '../assets/galeria/cortesyservicios6.jpeg';
import img3 from '../assets/galeria/cortesyservicios10.jpeg';
import marca1 from '../assets/galeria/marca1.png';
import marca2 from '../assets/galeria/marca2.png';
import marca3 from '../assets/galeria/marca3.png';
import fondo from '../assets/galeria/fondo-barberia.jpg';

export default function Home() {
  const { usuario } = useAuth();
  const galeria = [img1, img2, img3];
  const [promocionActiva, setPromocionActiva] = useState(false);

  useEffect(() => {
    const obtenerPromocion = async () => {
      const ref = doc(db, "configuracion", "promociones");
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().activa) {
        setPromocionActiva(true);
      }
    };
    obtenerPromocion();
  }, []);

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed relative" style={{ backgroundImage: `url(${fondo})` }}>
      <Helmet>
        <title>BarberYass | Barbería Exclusiva en Lima</title>
        <meta name="description" content="BarberYass: la barbería premium donde el estilo y la experiencia se encuentran. Reserva ahora tu cita con la mejor barbera." />
        <meta name="keywords" content="barbería, barber, Lima, corte de cabello, BarberYass, Lugo Studio" />
        <meta name="author" content="BarberYass" />
      </Helmet>

      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />

      <motion.main className="relative z-10 px-4 py-14 text-white text-center flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <motion.img src={logo} alt="Logo" className="w-24 mb-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} />

        <motion.h1 className="text-4xl md:text-5xl font-bold mb-4" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
          Bienvenido a BarberYass
        </motion.h1>

        <motion.p className="mb-8 max-w-md" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}>
          La barbería premium donde el estilo y la experiencia se encuentran. Reserva y vive tu mejor corte.
        </motion.p>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {usuario ? (
            <Link to="/reservar" className="bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition font-semibold">
              Reservar cita
            </Link>
          ) : (
            <>
              <Link to="/login" className="bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition font-semibold">Iniciar sesión</Link>
              <Link to="/register" className="bg-gray-200 text-black px-6 py-3 rounded-full hover:bg-gray-300 transition font-semibold">Crear cuenta</Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full px-2">
          {galeria.map((img, i) => (
            <div key={i} className="rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition duration-300">
              <img src={img} alt={`Servicio ${i + 1}`} className="object-cover w-full h-64 md:h-60" />
            </div>
          ))}
        </div>

        {promocionActiva && (
          <section className="bg-yellow-100 text-yellow-900 p-4 mt-10 rounded shadow-lg max-w-xl mx-auto">
            <h2 className="text-xl font-bold">🎉 Promoción Activa</h2>
            <p>Aprovecha esta oferta exclusiva antes de que termine el mes. ¡Agenda hoy mismo!</p>
          </section>
        )}
      </motion.main>

      <section className="bg-white bg-opacity-95 text-gray-800 py-10 px-4 mt-16 rounded-3xl shadow-lg max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Marcas Aliadas</h2>
        <p className="text-center text-sm text-gray-600 mb-8">Trabajamos con marcas profesionales del rubro para brindarte lo mejor.</p>
        <div className="flex flex-wrap justify-center items-center gap-8">
          <img src={marca1} alt="Marca 1" className="h-12 md:h-14 object-contain" />
          <img src={marca2} alt="Marca 2" className="h-12 md:h-14 object-contain" />
          <img src={marca3} alt="Marca 3" className="h-12 md:h-14 object-contain" />
        </div>
      </section>
    </div>
  );
}