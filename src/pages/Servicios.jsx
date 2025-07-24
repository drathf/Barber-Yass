// ✅ servicios.jsx optimizado con SEO y logo importado correctamente
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import logo from '../assets/galeria/logo.png';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [mensaje, setMensaje] = useState('');

  const coleccionRef = collection(db, 'servicios');

  useEffect(() => {
    const obtenerServicios = async () => {
      const snap = await getDocs(coleccionRef);
      const lista = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServicios(lista);
    };

    obtenerServicios();
  }, []);

  const agregarServicio = async () => {
    if (!nombre || !precio || isNaN(precio)) {
      setMensaje('❗Nombre y precio válido requeridos');
      return;
    }

    try {
      const docRef = await addDoc(coleccionRef, {
        nombre,
        precio: parseFloat(precio),
      });
      setServicios([...servicios, { id: docRef.id, nombre, precio: parseFloat(precio) }]);
      setNombre('');
      setPrecio('');
      setMensaje('✅ Servicio agregado');
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al agregar');
    }
  };

  const eliminarServicio = async (id) => {
    const confirmar = confirm('¿Eliminar este servicio?');
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, 'servicios', id));
      setServicios(servicios.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al eliminar');
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <Helmet>
        <title>Servicios | BarberYass</title>
        <meta name="description" content="Lista de servicios y precios ofrecidos por BarberYass." />
        <meta name="keywords" content="servicios, precios, barbería, BarberYass" />
        <meta name="author" content="BarberYass" />
      </Helmet>

      <motion.img
        src={logo}
        alt="Logo BarberYass"
        className="w-20 mx-auto mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      />

      <h2 className="text-2xl font-bold text-center mb-4">Servicios y Precios</h2>

      {mensaje && (
        <p className={`text-center mb-4 ${mensaje.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {mensaje}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Nombre del servicio"
          className="p-2 border rounded col-span-2"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="number"
          placeholder="Precio (S/.)"
          className="p-2 border rounded"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />
        <button
          onClick={agregarServicio}
          className="bg-black text-white py-2 rounded hover:bg-gray-800 transition col-span-full md:col-span-1"
        >
          Agregar servicio
        </button>
      </div>

      <div className="space-y-4">
        {servicios.length === 0 ? (
          <p className="text-gray-500 text-center">No hay servicios registrados.</p>
        ) : (
          servicios.map((servicio) => (
            <div
              key={servicio.id}
              className="flex justify-between items-center border p-4 rounded bg-white shadow"
            >
              <div>
                <p className="font-semibold text-gray-800">{servicio.nombre}</p>
                <p className="text-sm text-gray-500">S/. {servicio.precio.toFixed(2)}</p>
              </div>
              <button
                onClick={() => eliminarServicio(servicio.id)}
                className="text-red-600 text-sm hover:underline"
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Servicios;
