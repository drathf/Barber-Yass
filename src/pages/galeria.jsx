import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async"; // ✅ Usar helmet-async

import logo from "../assets/galeria/logo.png";

// Logos de marcas aliadas
import marca1 from "../assets/galeria/Logo NOT BEER. marca1.jpg";
import marca2 from "../assets/galeria/Logo MARMA2. marca2.jpg";
import marca3 from "../assets/galeria/Logo 99. marca3.jpg";

// ✅ Importar automáticamente todas las imágenes y filtrar strings válidos
const imagesObject = import.meta.glob("../assets/galeria/servicios*.jpg", {
  eager: true,
});

const imagenes = Object.values(imagesObject)
  .map((module) => module?.default || "")
  .filter((img) => typeof img === "string" && img.endsWith(".jpg")) // Filtrar solo strings
  .sort((a, b) => {
    const numA = parseInt(a.match(/(\d+)\.jpg$/)?.[1] || 0);
    const numB = parseInt(b.match(/(\d+)\.jpg$/)?.[1] || 0);
    return numA - numB;
  });

export default function Galeria() {
  const [indexActivo, setIndexActivo] = useState(null);

  return (
    <div className="min-h-screen p-6 bg-black text-white">
      <Helmet>
        <title>Galería | Lugo Studio</title>
        <meta
          name="description"
          content="Explora nuestra galería exclusiva de cortes, estilos y resultados de Lugo Studio. Estructuras profesionales y diseños únicos."
        />
        <meta
          name="keywords"
          content="galería barbería, Lugo Studio, cortes de cabello, barbería premium"
        />
        <meta name="author" content="Lugo Studio" />
      </Helmet>

      {/* Logo */}
      <motion.img
        src={logo}
        alt="Logo Lugo Studio"
        className="w-20 mx-auto mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      />

      <h2 className="text-center text-3xl font-bold mb-2">
        ✨ Galería de Servicios
      </h2>
      <p className="text-center text-gray-400 mb-10">
        Momentos y resultados con estilo exclusivo Lugo Studio
      </p>

      {/* Grid de imágenes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        {imagenes.length === 0 ? (
          <p className="text-center col-span-3 text-gray-400">
            No se encontraron imágenes en la galería.
          </p>
        ) : (
          imagenes.map((src, index) => (
            <motion.div
              key={index}
              className="rounded overflow-hidden shadow-lg bg-white cursor-pointer"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIndexActivo(index)}
            >
              <img
                src={src}
                alt={`Servicio ${index + 1}`}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Marcas aliadas */}
      <h3 className="text-center text-2xl font-semibold mb-6">
        🤝 Marcas Aliadas
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[marca1, marca2, marca3].map((marca, i) => (
          <motion.img
            key={i}
            src={marca}
            alt={`Marca aliada ${i + 1}`}
            className="bg-white rounded-lg p-3 object-contain"
            whileHover={{ scale: 1.05 }}
          />
        ))}
      </div>

      {/* Modal de imagen ampliada */}
      <AnimatePresence>
        {indexActivo !== null && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIndexActivo(null)}
          >
            <motion.img
              key={indexActivo}
              src={imagenes[indexActivo]}
              alt={`Imagen ${indexActivo + 1}`}
              className="max-w-4xl max-h-[85vh] rounded-lg shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
