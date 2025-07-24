// ✅ galeria.jsx con SEO y mejoras visuales
import React from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import logo from "../assets/galeria/logo.png";

// Importar todas las imágenes automáticamente desde assets
const imagenes = Object.values(
  import.meta.glob('../assets/galeria/cortesyservicios*.jpeg', { eager: true, as: 'url' })
).sort((a, b) => {
  const numA = parseInt(a.match(/(\d+)\.jpeg$/)?.[1] || 0);
  const numB = parseInt(b.match(/(\d+)\.jpeg$/)?.[1] || 0);
  return numA - numB;
});

export default function Galeria() {
  return (
    <div className="min-h-screen p-6 bg-black text-white">
      <Helmet>
        <title>Galería | BarberYass</title>
        <meta name="description" content="Explora nuestra galería exclusiva de cortes, estilos y resultados en BarberYass. Donde el arte y la barbería se encuentran." />
        <meta name="keywords" content="galería barbería, cortes modernos, BarberYass, estilos de cabello, servicios premium" />
        <meta name="author" content="BarberYass" />
      </Helmet>

      <motion.img
        src={logo}
        alt="Logo"
        className="w-20 mx-auto mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      />

      <h2 className="text-center text-3xl font-bold mb-2">✨ Galería de Servicios</h2>
      <p className="text-center text-gray-400 mb-10">
        Momentos y resultados con estilo exclusivo BarberYass
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {imagenes.map((src, index) => (
          <motion.div
            key={index}
            className="rounded overflow-hidden shadow-lg bg-white"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={src}
              alt={`Servicio ${index + 1}`}
              className="w-full h-64 object-cover"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
