import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

// Fondo principal y logos
import fondo from "../assets/galeria/fondo-barberia2.jpg";
import wsIcon from "../assets/galeria/ws-white.svg";

export default function Home() {
  const [offsetY, setOffsetY] = useState(0);

  // Control de scroll para parallax
  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gray-50 relative">
      <Helmet>
        <title>Lugo Studio | Barbería Exclusiva</title>
        <meta
          name="description"
          content="Barbería exclusiva con estilo y atención personalizada. Reserva tu cita en Lugo Studio y luce impecable."
        />
        <meta
          name="keywords"
          content="barbería premium, cortes de cabello, Lugo Studio, barbería Lima"
        />
      </Helmet>

      {/* HERO */}
      <div
        className="min-h-screen bg-fixed relative overflow-hidden z-0"
        style={{
          backgroundImage: `url(${fondo})`,
          backgroundPosition: `center ${20 - offsetY * 0.1}%`,
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 z-0" />

        <motion.div
          className="relative z-10 px-4 py-40 text-white text-center flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Bienvenido a <span className="text-purple-400">Lugo Studio</span>
          </motion.h1>

          <motion.p
            className="mb-8 max-w-xl text-lg md:text-xl text-gray-200"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Estructuras profesionales y seguras. Diseños únicos y exclusivos en
            cortes y barbería premium.
          </motion.p>

          <Link
            to="/reservar"
            className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-full text-white font-semibold mb-12 shadow-lg transition-transform hover:scale-105"
          >
            Reservar Cita
          </Link>
        </motion.div>
      </div>

      {/* Botón WhatsApp */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
        <a
          href="https://wa.me/51907011564?text=¡Hola!%20Quiero%20más%20información%20de%20Lugo%20Studio"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="bg-green-500 p-3 rounded-full shadow-lg hover:scale-110 transition"
        >
          <img src={wsIcon} alt="WhatsApp Lugo Studio" className="w-7" />
        </a>
      </div>
    </div>
  );
}
