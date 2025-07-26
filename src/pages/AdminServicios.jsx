// src/pages/AdminServicios.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/galeria/logo.png";

export default function AdminServicios() {
  const { rol } = useAuth();
  const [servicios, setServicios] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "" });

  useEffect(() => {
    const cargarServicios = async () => {
      const snap = await getDocs(collection(db, "servicios"));
      setServicios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    cargarServicios();
  }, []);

  if (!(rol === "god" || rol === "admin" || rol === "barberyass")) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        🚫 Acceso denegado
      </div>
    );
  }

  const agregarServicio = async () => {
    if (!nuevo.nombre || !nuevo.precio) return;
    await addDoc(collection(db, "servicios"), { ...nuevo, precio: parseFloat(nuevo.precio) });
    setNuevo({ nombre: "", precio: "" });
  };

  const actualizarServicio = async (id, nombre, precio) => {
    await updateDoc(doc(db, "servicios", id), { nombre, precio: parseFloat(precio) });
  };

  const eliminarServicio = async (id) => {
    await deleteDoc(doc(db, "servicios", id));
    setServicios((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen p-6">
      <img src={logo} alt="Logo" className="w-20 mb-4" />
      <h2 className="text-2xl font-bold mb-4">💈 Gestión de Servicios</h2>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Nombre"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
          className="border p-2 rounded flex-1"
        />
        <input
          type="number"
          placeholder="Precio"
          value={nuevo.precio}
          onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
          className="border p-2 rounded w-32"
        />
        <button
          onClick={agregarServicio}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Agregar
        </button>
      </div>
      <div className="space-y-4">
        {servicios.map((s) => (
          <div
            key={s.id}
            className="p-3 bg-gray-100 rounded flex justify-between items-center"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={s.nombre}
                onChange={(e) =>
                  setServicios((prev) =>
                    prev.map((item) =>
                      item.id === s.id ? { ...item, nombre: e.target.value } : item
                    )
                  )
                }
                className="border p-2 rounded"
              />
              <input
                type="number"
                value={s.precio}
                onChange={(e) =>
                  setServicios((prev) =>
                    prev.map((item) =>
                      item.id === s.id ? { ...item, precio: e.target.value } : item
                    )
                  )
                }
                className="border p-2 rounded w-24"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => actualizarServicio(s.id, s.nombre, s.precio)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Actualizar
              </button>
              <button
                onClick={() => eliminarServicio(s.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
