// src/pages/AdminHorarios.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/galeria/logo.png";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import * as XLSX from "xlsx";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const HORAS = [
  "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

const AdminHorarios = () => {
  const { rol } = useAuth();
  const [fecha, setFecha] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [reservas, setReservas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState(null);

  if (!["admin", "god", "barberyass"].includes(rol)) {
    return (
      <div className="text-center text-red-600 font-semibold p-10">
        Acceso restringido.
      </div>
    );
  }

  useEffect(() => {
    cargarReservas();
  }, []);

  useEffect(() => {
    if (fecha) cargarHorarios();
  }, [fecha]);

  const cargarReservas = async () => {
    const snap = await getDocs(collection(db, "reservas"));
    const todas = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setReservas(todas);
    calcularEstadisticas(todas);
  };

  const cargarHorarios = async () => {
    const q = query(collection(db, "horarios"), where("fecha", "==", fecha));
    const snap = await getDocs(q);
    setHorarios(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const getEstado = (hora) => {
    const h = horarios.find((h) => h.hora === hora);
    if (!h) return "nuevo";
    if (h.reservado) return "reservado";
    return h.disponible ? "habilitado" : "deshabilitado";
  };

  const toggleHorario = async (hora) => {
    const existente = horarios.find((h) => h.hora === hora);
    try {
      if (existente) {
        if (existente.reservado) return setMensaje("⛔ No se puede modificar.");
        await updateDoc(doc(db, "horarios", existente.id), {
          disponible: !existente.disponible,
        });
      } else {
        await addDoc(collection(db, "horarios"), {
          fecha,
          hora,
          disponible: true,
          reservado: false,
        });
      }
      setMensaje("✅ Horario actualizado");
      await cargarHorarios();
    } catch {
      setMensaje("❌ Error al modificar horario");
    }
  };

  const eliminarReserva = async (id) => {
    if (!confirm("¿Eliminar esta reserva?")) return;
    const reserva = reservas.find((r) => r.id === id);
    if (!reserva) return;
    const q = query(
      collection(db, "horarios"),
      where("fecha", "==", reserva.fecha),
      where("hora", "==", reserva.hora)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const horarioId = snap.docs[0].id;
      await updateDoc(doc(db, "horarios", horarioId), {
        reservado: false,
        disponible: true,
      });
    }
    await deleteDoc(doc(db, "reservas", id));
    const nuevas = reservas.filter((r) => r.id !== id);
    setReservas(nuevas);
    await cargarHorarios();
  };

  const filtradas = reservas.filter((r) => r.nombre?.toLowerCase().includes(filtro.toLowerCase()));
  const total = filtradas.length;
  const paginadas = filtradas.slice((pagina - 1) * porPagina, pagina * porPagina);
  const totalPaginas = Math.ceil(total / porPagina);

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-black text-gold">
      <Helmet>
        <title>Admin Horarios - BarberYass</title>
      </Helmet>
      <motion.img src={logo} className="w-20 mx-auto mb-4" />
      <h2 className="text-2xl text-center font-bold text-gold mb-4">🗓️ Gestión de Horarios</h2>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="p-2 border rounded w-full max-w-sm mx-auto block my-6"
      />
      {mensaje && <p className="text-center text-green-400 mb-3">{mensaje}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        {HORAS.map((hora) => {
          const estado = getEstado(hora);
          const estilos = {
            nuevo: "bg-green-700",
            habilitado: "bg-yellow-600",
            deshabilitado: "bg-green-700",
            reservado: "bg-gray-500",
          };
          const label = estado === "habilitado" ? "Deshabilitar" : estado === "deshabilitado" ? "Habilitar" : estado;
          return (
            <button
              key={hora}
              onClick={() => estado !== "reservado" && toggleHorario(hora)}
              disabled={estado === "reservado"}
              className={`text-white font-bold p-2 rounded ${estilos[estado]}`}
            >
              {hora} ({label})
            </button>
          );
        })}
      </div>

      <h3 className="text-xl font-bold mb-4">📋 Reservas</h3>
      <input
        type="text"
        placeholder="Buscar cliente..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="p-2 border rounded mb-4 w-full max-w-md"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gold text-sm">
          <thead className="bg-yellow-900 text-gold">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Cliente</th>
              <th className="p-2">Día</th>
              <th className="p-2">Hora</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {paginadas.map((r, i) => (
              <tr key={r.id} className="border-t border-gold">
                <td className="p-2">{(pagina - 1) * porPagina + i + 1}</td>
                <td className="p-2">{r.nombre}</td>
                <td className="p-2">{new Date(r.fecha).toLocaleDateString("es-PE")}</td>
                <td className="p-2">{r.hora}</td>
                <td className="p-2 text-center font-semibold">{r.estado}</td>
                <td className="p-2">
                  <button onClick={() => eliminarReserva(r.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 flex-wrap items-center mt-6">
        <button onClick={() => setFiltro("")} className="px-4 py-2 bg-gray-700 text-white rounded">Limpiar filtros</button>
        <button onClick={() => exportToExcel(filtradas)} className="px-4 py-2 bg-green-700 text-white rounded">Exportar Excel</button>
        <button onClick={() => exportToPDF(filtradas)} className="px-4 py-2 bg-blue-700 text-white rounded">Exportar PDF</button>
        <button onClick={() => navigate("/admin")} className="ml-auto px-4 py-2 bg-yellow-700 text-white rounded">⬅ Volver</button>
      </div>
    </div>
  );
};

export default AdminHorarios;
