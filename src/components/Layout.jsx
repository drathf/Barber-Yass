  import React, { useEffect, useState } from "react";
  import { Link } from "react-router-dom";
  import { motion } from "framer-motion";
  import { Helmet } from "react-helmet";

  // Fondo principal
  import fondo from "../assets/galeria/fondo-barberia2.jpg";

  // Marcas Aliadas
  import logoNotBeer from "../assets/galeria/Logo NOT BEER. marca1.jpg";
  import logoMarma2 from "../assets/galeria/Logo MARMA2. marca2.jpg";
  import logo99 from "../assets/galeria/Logo 99. marca3.jpg";

  // Servicios destacados
  import servicio1 from "../assets/galeria/servicios (1).jpg";
  import servicio18 from "../assets/galeria/servicios (18).jpg";
  import servicio2 from "../assets/galeria/servicios (2).jpg";
  import servicio6 from "../assets/galeria/servicios (6).jpg";
  import servicio7 from "../assets/galeria/servicios (7).jpg";
  import servicio17 from "../assets/galeria/servicios (17).jpg";

  // Icono WhatsApp
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

        {/* HERO Principal con Parallax */}
        <div
          className="min-h-screen bg-fixed relative overflow-hidden"
          style={{
            backgroundImage: `url(${fondo})`,
            backgroundPosition: `center ${20 - offsetY * 0.1}%`, // Efecto parallax
            backgroundSize: "cover",
            transform: `translateY(${offsetY * 0.1}px)`,
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 z-0" />

          {/* Contenido Hero */}
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

        {/* SERVICIOS DESTACADOS */}
        <section className="py-20 bg-gray-100 text-center">
          <motion.h2
            className="text-3xl font-bold mb-10 text-gray-800"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Nuestros Servicios
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
            <div className="space-y-3">
              <img src={servicio1} alt="Servicio 1" className="rounded-lg shadow-lg" />
              <img src={servicio18} alt="Servicio 18" className="rounded-lg shadow-lg" />
            </div>
            <div className="space-y-3">
              <img src={servicio2} alt="Servicio 2" className="rounded-lg shadow-lg" />
              <img src={servicio6} alt="Servicio 6" className="rounded-lg shadow-lg" />
            </div>
            <div className="space-y-3">
              <img src={servicio7} alt="Servicio 7" className="rounded-lg shadow-lg" />
              <img src={servicio17} alt="Servicio 17" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </section>

        {/* MARCAS ALIADAS */}
        <section className="py-16 bg-white">
          <motion.h3
            className="text-center text-xl font-semibold mb-8 text-gray-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Marcas que confían en nosotros
          </motion.h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-6">
            <motion.img
              src={logoNotBeer}
              alt="Logo NOT BEER"
              className="bg-white rounded-lg p-3 shadow-md"
              whileHover={{ scale: 1.05 }}
            />
            <motion.img
              src={logoMarma2}
              alt="Logo MARMA2"
              className="bg-white rounded-lg p-3 shadow-md"
              whileHover={{ scale: 1.05 }}
            />
            <motion.img
              src={logo99}
              alt="Logo 99"
              className="bg-white rounded-lg p-3 shadow-md"
              whileHover={{ scale: 1.05 }}
            />
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-purple-700 text-center text-white">
          <h3 className="text-3xl font-bold mb-6">
            Agenda tu cita hoy y vive la experiencia Lugo Studio
          </h3>
          <Link
            to="/reservar"
            className="bg-black hover:bg-gray-800 px-8 py-3 rounded-full font-semibold text-white"
          >
            Reservar Ahora
          </Link>
        </section>

        {/* BOTÓN FLOTANTE WhatsApp */}
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
