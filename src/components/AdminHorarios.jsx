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
import logo from "../assets/galeria/logo.png"; // ✅ Ruta corregida
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

  if (rol !== "admin" && rol !== "god") {
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

  const calcularEstadisticas = (reservas) => {
    const now = dayjs();
    const hoy = now.format("YYYY-MM-DD");
    let total = 0, semana = 0, mes = 0;
    let gananciaTotal = 0, gananciaSemana = 0, gananciaMes = 0;
    const porServicio = {};
    const clientes = {};

    reservas.forEach(r => {
      const fecha = r.fecha;
      const monto = parseFloat(r.montoPagado || 0);
      const diasDiferencia = now.diff(dayjs(fecha), "day");
      const esEstaSemana = diasDiferencia <= 6;
      const esEsteMes = now.month() === dayjs(fecha).month();

      if (["activa", "finalizada", "pagado", "atendido"].includes(r.estado)) {
        total++;
        gananciaTotal += monto;

        if (fecha === hoy || esEstaSemana) {
          semana++;
          gananciaSemana += monto;
        }
        if (esEsteMes) {
          mes++;
          gananciaMes += monto;
        }

        porServicio[r.servicio] = (porServicio[r.servicio] || 0) + monto;
        const clave = r.email || r.telefono || r.nombre;
        clientes[clave] = (clientes[clave] || 0) + 1;
      }
    });

    setEstadisticas({
      totalReservas: total,
      reservasSemana: semana,
      reservasMes: mes,
      ganancias: { total: gananciaTotal, semana: gananciaSemana, mes: gananciaMes },
      porServicio,
      clientes
    });
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
    calcularEstadisticas(nuevas);
    await cargarHorarios();
  };

  const filtradas = reservas.filter((r) =>
    r.nombre?.toLowerCase().includes(filtro.toLowerCase())
  );

  const total = filtradas.length;
  const paginadas = filtradas.slice((pagina - 1) * porPagina, pagina * porPagina);
  const totalPaginas = Math.ceil(total / porPagina);

  const exportarEstadisticas = () => {
    if (!estadisticas) return;
    const resumen = [
      { Métrica: "Total Reservas", Valor: estadisticas.totalReservas },
      { Métrica: "Reservas Semana", Valor: estadisticas.reservasSemana },
      { Métrica: "Reservas Mes", Valor: estadisticas.reservasMes },
      { Métrica: "Ganancias Totales", Valor: `S/. ${estadisticas.ganancias.total.toFixed(2)}` },
      { Métrica: "Ganancias Semana", Valor: `S/. ${estadisticas.ganancias.semana.toFixed(2)}` },
      { Métrica: "Ganancias Mes", Valor: `S/. ${estadisticas.ganancias.mes.toFixed(2)}` },
    ];
    const serviciosData = Object.entries(estadisticas.porServicio).map(([s, g]) => ({
      Servicio: s,
      Ganancia: g.toFixed(2),
    }));
    const clientesData = Object.entries(estadisticas.clientes).map(([c, r]) => ({
      Cliente: c,
      Reservas: r,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen), "Resumen");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(serviciosData), "Servicios");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clientesData), "Clientes");
    XLSX.writeFile(wb, "Estadisticas_BarberYass.xlsx");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <Helmet>
        <title>Admin Horarios - BarberYass</title>
        <meta name="description" content="Panel de horarios y reservas de BarberYass." />
      </Helmet>

      <motion.img src={logo} className="w-20 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-center mb-2">🗓️ Gestión de Horarios</h2>

      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="p-2 border rounded w-full max-w-sm mx-auto block my-6"
      />

      {mensaje && <p className="text-center text-blue-600 mb-3">{mensaje}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        {HORAS.map((hora) => {
          const estado = getEstado(hora);
          const estilos = {
            nuevo: "bg-green-600",
            habilitado: "bg-red-600",
            deshabilitado: "bg-green-600",
            reservado: "bg-gray-400",
          };
          return (
            <button
              key={hora}
              onClick={() => estado !== "reservado" && toggleHorario(hora)}
              disabled={estado === "reservado"}
              className={`text-white p-2 rounded ${estilos[estado]}`}
            >
              {hora} ({estado})
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
                  <button onClick={() => eliminarReserva(r.id)} className="text-red-500 text-sm">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPaginas > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPaginas }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPagina(i + 1)}
                className={`px-3 py-1 border rounded ${pagina === i + 1 ? "bg-black text-white" : "bg-white"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap items-center mt-6">
        <button onClick={() => setFiltro("")} className="px-4 py-2 bg-gray-200 rounded">Limpiar filtros</button>
        <button onClick={() => exportToExcel(filtradas)} className="px-4 py-2 bg-green-600 text-white rounded">Exportar Excel</button>
        <button onClick={() => exportToPDF(filtradas)} className="px-4 py-2 bg-blue-600 text-white rounded">Exportar PDF</button>
        <button onClick={exportarEstadisticas} className="px-4 py-2 bg-purple-600 text-white rounded">📈 Estadísticas</button>
        <button onClick={() => navigate("/admin")} className="ml-auto px-4 py-2 bg-black text-white rounded">⬅ Volver</button>
      </div>
    </div>
  );
};

export default AdminHorarios;
