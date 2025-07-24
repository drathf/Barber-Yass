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
import { Helmet } from "react-helmet";
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

  useEffect(() => {
    if (["admin", "god", "barberyass"].includes(rol)) {
      cargarReservas();
    }
  }, []);

  useEffect(() => {
    if (fecha) cargarHorarios();
  }, [fecha]);

  const cargarHorarios = async () => {
    const q = query(collection(db, "horarios"), where("fecha", "==", fecha));
    const snap = await getDocs(q);
    setHorarios(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const cargarReservas = async () => {
    const snap = await getDocs(collection(db, "reservas"));
    const todas = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setReservas(todas);
  };

  const getEstado = (hora) => {
    const h = horarios.find(h => h.hora === hora);
    if (!h) return { estado: "nuevo", nombre: null };
    if (h.reservado) {
      const reserva = reservas.find(r => r.fecha === fecha && r.hora === hora);
      return { estado: "reservado", nombre: reserva?.nombre || "Desconocido" };
    }
    return { estado: h.disponible ? "habilitado" : "deshabilitado", nombre: null };
  };

  const toggleHorario = async (hora) => {
    const actual = horarios.find(h => h.hora === hora);
    if (actual?.reservado) {
      const confirmacion = confirm("Este horario ya está reservado. ¿Deseas liberarlo?");
      if (!confirmacion) return;

      const reserva = reservas.find(r => r.fecha === fecha && r.hora === hora);
      if (reserva) {
        await deleteDoc(doc(db, "reservas", reserva.id));
      }
      await updateDoc(doc(db, "horarios", actual.id), {
        reservado: false,
        disponible: true,
      });
    } else if (actual) {
      await updateDoc(doc(db, "horarios", actual.id), { disponible: !actual.disponible });
    } else {
      await addDoc(collection(db, "horarios"), {
        fecha,
        hora,
        disponible: true,
        reservado: false,
      });
    }
    await cargarHorarios();
    await cargarReservas();
  };

  const estilos = {
    nuevo: "bg-blue-500 text-white hover:bg-blue-600",
    habilitado: "bg-green-600 text-white hover:bg-green-700",
    deshabilitado: "bg-yellow-500 text-white hover:bg-yellow-600",
    reservado: "bg-gray-400 text-white hover:bg-gray-500 cursor-pointer",
  };

  return (
    <div className="p-6 min-h-screen bg-white text-black max-w-6xl mx-auto">
      <Helmet><title>Admin Horarios - BarberYass</title></Helmet>
      <img src={logo} className="w-24 mx-auto mb-4" alt="Logo" />
      <h2 className="text-center text-2xl font-bold mb-6">🗓️ Gestión de Horarios</h2>

      <input
        type="date"
        value={fecha}
        onChange={e => setFecha(e.target.value)}
        className="block mx-auto mb-6 p-2 rounded border border-gray-300"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {HORAS.map(hora => {
          const { estado, nombre } = getEstado(hora);
          const label = estado === "reservado" ? `(Reservado - ${nombre})` : estado === "habilitado" ? "(Deshabilitar)" : "(Habilitar)";
          return (
            <button
              key={hora}
              onClick={() => toggleHorario(hora)}
              className={`py-2 px-3 rounded-lg font-semibold transition ${estilos[estado]}`}
              title={estado === "reservado" ? `Reservado por: ${nombre}` : ""}
            >
              {hora} {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHorarios;
