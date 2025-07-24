// src/pages/AdminServicios.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import logo from '../assets/galeria/logo.png';

const AdminServicios = () => {
  const { rol } = useAuth();
  const [servicios, setServicios] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: '', precio: '' });
  const [mensaje, setMensaje] = useState('');

  const cargarServicios = async () => {
    const snap = await getDocs(collection(db, 'servicios'));
    const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setServicios(lista);
  };

  useEffect(() => {
    if (rol === 'admin' || rol === 'god') {
      cargarServicios();
    }
  }, [rol]);

  const agregarServicio = async () => {
    if (!nuevo.nombre || !nuevo.precio || isNaN(nuevo.precio)) {
      return setMensaje('❗ Nombre y precio válido requeridos');
    }

    try {
      await addDoc(collection(db, 'servicios'), {
        nombre: nuevo.nombre.trim(),
        precio: parseFloat(nuevo.precio),
      });
      setNuevo({ nombre: '', precio: '' });
      setMensaje('✅ Servicio agregado');
      cargarServicios();
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al agregar servicio');
    }
  };

  const actualizarServicio = async (id, nombre, precio) => {
    try {
      await updateDoc(doc(db, 'servicios', id), {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
      });
      setMensaje('✅ Servicio actualizado');
      cargarServicios();
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al actualizar servicio');
    }
  };

  const eliminarServicio = async (id) => {
    const servicio = servicios.find((s) => s.id === id);
    if (!window.confirm(`¿Eliminar el servicio "${servicio?.nombre}"?`)) return;

    try {
      await deleteDoc(doc(db, 'servicios', id));
      setMensaje('🗑️ Servicio eliminado');
      cargarServicios();
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al eliminar servicio');
    }
  };

  if (rol !== 'admin' && rol !== 'god') {
    return (
      <div className="p-6 text-red-600 font-semibold text-center">
        Acceso restringido.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <Helmet>
        <title>Admin Servicios | BarberYass</title>
        <meta name="description" content="Panel de administración de servicios de BarberYass." />
        <meta name="keywords" content="admin servicios, barbería, BarberYass" />
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

      <h2 className="text-2xl font-bold mb-2 text-center">🛠️ Gestión de Servicios</h2>
      <p className="text-center text-sm text-gray-600 mb-6">
        Total de servicios activos: <strong>{servicios.length}</strong>
      </p>

      {mensaje && <p className="mb-4 text-center text-blue-600 font-medium">{mensaje}</p>}

      {/* Formulario de nuevo servicio */}
      <div className="mb-6 bg-white p-4 border rounded shadow">
        <h3 className="font-semibold mb-2">➕ Nuevo Servicio</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre del servicio"
            className="p-2 border rounded"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
          />
          <input
            type="number"
            placeholder="Precio (S/.)"
            className="p-2 border rounded"
            value={nuevo.precio}
            onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
          />
        </div>
        <button
          onClick={agregarServicio}
          className="mt-4 w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Guardar servicio
        </button>
      </div>

      {/* Lista de servicios existentes */}
      <div className="space-y-4">
        {servicios.length === 0 ? (
          <p className="text-center text-gray-500">No hay servicios registrados.</p>
        ) : (
          servicios.map((s) => (
            <div
              key={s.id}
              className="p-4 bg-white rounded shadow flex flex-col md:flex-row justify-between items-center gap-4"
            >
              <div className="w-full md:w-2/3">
                <input
                  type="text"
                  className="w-full mb-2 p-2 border rounded"
                  value={s.nombre}
                  onChange={(e) =>
                    setServicios((prev) =>
                      prev.map((item) =>
                        item.id === s.id ? { ...item, nombre: e.target.value } : item
                      )
                    )
                  }
                />
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={s.precio}
                  onChange={(e) =>
                    setServicios((prev) =>
                      prev.map((item) =>
                        item.id === s.id ? { ...item, precio: e.target.value } : item
                      )
                    )
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => actualizarServicio(s.id, s.nombre, s.precio)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => eliminarServicio(s.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminServicios;
