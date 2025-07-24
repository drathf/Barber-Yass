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

const HORAS = ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const AdminHorarios = () => {
  const { rol } = useAuth();
  const [fecha, setFecha] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => { if (rol === "admin" || rol === "god" || rol === "barberyass") cargarReservas(); }, [rol]);
  useEffect(() => { if (fecha) cargarHorarios(); }, [fecha]);

  const cargarReservas = async () => {
    const snap = await getDocs(collection(db, "reservas"));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setReservas(data);
    calcularEstadisticas(data);
  };

  const cargarHorarios = async () => {
    const q = query(collection(db, "horarios"), where("fecha", "==", fecha));
    const snap = await getDocs(q);
    setHorarios(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const getEstado = (hora) => {
    const h = horarios.find(h => h.hora === hora);
    if (!h) return "nuevo";
    if (h.reservado) return "reservado";
    return h.disponible ? "habilitado" : "deshabilitado";
  };

  const getNombreCliente = (hora) => {
    const r = reservas.find(r => r.fecha === fecha && r.hora === hora);
    return r?.nombre || "";
  };

  const toggleHorario = async (hora) => {
    const existente = horarios.find(h => h.hora === hora);
    if (existente?.reservado) return;
    if (existente) {
      await updateDoc(doc(db, "horarios", existente.id), { disponible: !existente.disponible });
    } else {
      await addDoc(collection(db, "horarios"), { fecha, hora, disponible: true, reservado: false });
    }
    cargarHorarios();
  };

  const eliminarReserva = async (id) => {
    const r = reservas.find(r => r.id === id);
    if (!r) return;
    const q = query(collection(db, "horarios"), where("fecha", "==", r.fecha), where("hora", "==", r.hora));
    const snap = await getDocs(q);
    if (!snap.empty) await updateDoc(doc(db, "horarios", snap.docs[0].id), { reservado: false, disponible: true });
    await deleteDoc(doc(db, "reservas", id));
    cargarReservas();
    cargarHorarios();
  };

  const filtradas = reservas.filter(r => r.nombre?.toLowerCase().includes(filtro.toLowerCase()));
  const paginadas = filtradas.slice((pagina - 1) * porPagina, pagina * porPagina);
  const totalPaginas = Math.ceil(filtradas.length / porPagina);

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <Helmet><title>Admin Horarios - BarberYass</title></Helmet>
      <motion.img src={logo} className="w-20 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-center mb-2">🗓️ Gestión de Horarios</h2>

      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="p-2 border rounded w-full max-w-sm mx-auto block my-6" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        {HORAS.map(hora => {
          const estado = getEstado(hora);
          const nombre = getNombreCliente(hora);
          const estilos = {
            nuevo: "bg-green-600",
            habilitado: "bg-yellow-600",
            deshabilitado: "bg-red-600",
            reservado: "bg-gray-400",
          };
          return (
            <button key={hora} onClick={() => toggleHorario(hora)} disabled={estado === "reservado"} className={`text-white p-2 rounded ${estilos[estado]}`}>
              {hora} ({estado}{nombre && estado === "reservado" ? ` - ${nombre}` : ""})
            </button>
          );
        })}
      </div>

      <h3 className="text-xl font-bold mb-4">📋 Reservas</h3>
      <input type="text" placeholder="Buscar cliente..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="p-2 border rounded mb-4 w-full max-w-md" />

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
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
              <tr key={r.id} className="border-t">
                <td className="p-2">{(pagina - 1) * porPagina + i + 1}</td>
                <td className="p-2">{r.nombre}</td>
                <td className="p-2">{new Date(r.fecha).toLocaleDateString("es-PE")}</td>
                <td className="p-2">{r.hora}</td>
                <td className="p-2 text-center font-semibold">{r.estado}</td>
                <td className="p-2">
                  <button onClick={() => eliminarReserva(r.id)} className="text-red-500 text-sm">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPaginas > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPaginas }).map((_, i) => (
              <button key={i} onClick={() => setPagina(i + 1)} className={`px-3 py-1 border rounded ${pagina === i + 1 ? "bg-black text-white" : "bg-white"}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHorarios;
