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
  const [reservas, setReservas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

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
  };

  const cargarHorarios = async () => {
    const q = query(collection(db, "horarios"), where("fecha", "==", fecha));
    const snap = await getDocs(q);
    setHorarios(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const getNombreReserva = (hora) => {
    const r = reservas.find((r) => r.fecha === fecha && r.hora === hora);
    return r?.nombre || "";
  };

  const getEstado = (hora) => {
    const h = horarios.find((h) => h.hora === hora);
    if (!h) return "nuevo";
    if (h.reservado) return "reservado";
    return h.disponible ? "habilitado" : "deshabilitado";
  };

  const toggleHorario = async (hora) => {
    const actual = horarios.find((h) => h.hora === hora);
    if (actual?.reservado) return;
    if (actual) {
      await updateDoc(doc(db, "horarios", actual.id), {
        disponible: !actual.disponible,
      });
    } else {
      await addDoc(collection(db, "horarios"), {
        fecha,
        hora,
        disponible: true,
        reservado: false,
      });
    }
    cargarHorarios();
  };

  const eliminarReserva = async (id) => {
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
    cargarReservas();
    cargarHorarios();
  };

  const filtradas = reservas.filter((r) =>
    r.nombre?.toLowerCase().includes(filtro.toLowerCase())
  );

  const estilos = {
    nuevo: "bg-green-500 hover:bg-green-600",
    habilitado: "bg-blue-500 hover:bg-blue-600",
    deshabilitado: "bg-yellow-500 hover:bg-yellow-600",
    reservado: "bg-gray-400 cursor-not-allowed",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <Helmet>
        <title>Gestión de Horarios</title>
      </Helmet>

      <img src={logo} className="w-24 mx-auto mb-4" alt="Logo" />
      <h2 className="text-2xl font-bold text-center mb-4">🗓️ Gestión de Horarios</h2>

      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="p-2 border rounded block mx-auto mb-6"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {HORAS.map((hora) => {
          const estado = getEstado(hora);
          const nombre = getNombreReserva(hora);
          return (
            <button
              key={hora}
              onClick={() => toggleHorario(hora)}
              disabled={estado === "reservado"}
              className={`p-2 rounded-full text-white shadow ${estilos[estado]}`}
            >
              {hora} ({estado}) {nombre && `- ${nombre}`}
            </button>
          );
        })}
      </div>

      <h3 className="text-xl font-semibold mb-2">📋 Reservas</h3>
      <input
        type="text"
        placeholder="Buscar cliente..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="p-2 mb-4 border rounded w-full max-w-md"
      />

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
            {filtradas.map((r, i) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{r.nombre}</td>
                <td className="p-2">{new Date(r.fecha).toLocaleDateString()}</td>
                <td className="p-2">{r.hora}</td>
                <td className="p-2">{r.estado}</td>
                <td className="p-2">
                  <button
                    onClick={() => eliminarReserva(r.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHorarios;
