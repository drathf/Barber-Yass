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
      return { estado: "reservado", nombre: reserva?.nombre || "Desconocido", reservaId: reserva?.id };
    }
    return { estado: h.disponible ? "habilitado" : "deshabilitado", nombre: null };
  };

  const toggleHorario = async (hora) => {
    const actual = horarios.find(h => h.hora === hora);
    const { estado, reservaId } = getEstado(hora);

    if (estado === "reservado") {
      const confirmar = window.confirm("¿Eliminar reserva para liberar este horario?");
      if (!confirmar) return;

      // Eliminar reserva y liberar slot
      await deleteDoc(doc(db, "reservas", reservaId));
      await updateDoc(doc(db, "horarios", actual.id), { reservado: false, disponible: true });
      await cargarHorarios();
      await cargarReservas();
      return;
    }

    if (actual) {
      await updateDoc(doc(db, "horarios", actual.id), { disponible: !actual.disponible });
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
    const reserva = reservas.find(r => r.id === id);
    if (!reserva) return;
    const q = query(collection(db, "horarios"), where("fecha", "==", reserva.fecha), where("hora", "==", reserva.hora));
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

  const filtradas = reservas.filter(r => r.nombre?.toLowerCase().includes(filtro.toLowerCase()));

  const estilos = {
    nuevo: "bg-blue-500 text-white hover:bg-blue-600",
    habilitado: "bg-green-500 text-white hover:bg-green-600",
    deshabilitado: "bg-yellow-500 text-white hover:bg-yellow-600",
    reservado: "bg-gray-500 text-white hover:bg-red-600",
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
              className={`py-2 px-3 rounded-xl font-semibold transition ${estilos[estado]}`}
            >
              {hora} {label}
            </button>
          );
        })}
      </div>

      <h3 className="text-xl font-semibold mb-2">📋 Reservas</h3>
      <input
        type="text"
        placeholder="Buscar cliente..."
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        className="p-2 mb-4 w-full max-w-md border border-gray-300 rounded"
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
                <td className="p-2">{new Date(r.fecha).toLocaleDateString("es-PE")}</td>
                <td className="p-2">{r.hora}</td>
                <td className="p-2">{r.estado}</td>
                <td className="p-2">
                  <button onClick={() => eliminarReserva(r.id)} className="text-red-600 hover:text-red-800">🗑️</button>
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
