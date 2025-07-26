import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

// Fondo principal
import fondo from "../assets/galeria/fondo-barberia2.jpg";
import logoNotBeer from "../assets/galeria/logo-notbeer.jpg";
import logoMarma2 from "../assets/galeria/logo-marma2.jpg";
import logo99 from "../assets/galeria/logo-99.jpg";
import servicio1 from "../assets/galeria/servicio1.jpg";
import servicio18 from "../assets/galeria/servicio18.jpg";
import servicio2 from "../assets/galeria/servicio2.jpg";
import servicio6 from "../assets/galeria/servicio6.jpg";
import servicio7 from "../assets/galeria/servicio7.jpg";
import servicio17 from "../assets/galeria/servicio17.jpg";
import wsIcon from "../assets/galeria/ws-white.svg";

export default function Home() {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.scrollY);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gray-50 relative">
      <Helmet>
        <title>Lugo Studio | Barbería Exclusiva</title>
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
            className="text-4xl md:text-6xl font-bold mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Bienvenido a Lugo Studio
          </motion.h1>

          <motion.p
            className="mb-8 max-w-xl text-lg md:text-xl"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Estructuras profesionales y seguras. Diseños únicos y exclusivos.
          </motion.p>

          <Link
            to="/reservar"
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full text-white font-semibold mb-12 shadow-lg"
          >
            Reservar Cita
          </Link>
        </motion.div>
      </div>

      {/* Secciones */}
      {/* ... resto igual (servicios, marcas, CTA final) */}

      {/* Botón WhatsApp */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
        <a
          href="https://wa.me/51907011564?text=¡Hola!%20Quiero%20más%20información%20de%20Lugo%20Studio"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 p-3 rounded-full shadow-lg hover:scale-110 transition"
        >
          <img src={wsIcon} alt="WhatsApp" className="w-7" />
        </a>
      </div>
    </div>
  );
}
