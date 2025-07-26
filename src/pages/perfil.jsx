// src/pages/perfil.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import logo from "../assets/galeria/logo.png";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Perfil() {
  const { usuario, rol } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [stats, setStats] = useState({
    totalReservas: 0,
    reservasActivas: 0,
    reservasAtendidas: 0,
    reservasCanceladas: 0,
    ganancias: 0,
  });

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");

  useEffect(() => {
    if (!usuario) return;

    const cargarDatos = async () => {
      // Usuarios normales
      if (rol === "user" || rol === "vip") {
        const q = query(collection(db, "reservas"), where("uid", "==", usuario.uid));
        const snap = await getDocs(q);
        setReservas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }

      // Admin/God/Barberyass dashboard
      if (rol === "admin" || rol === "barberyass" || rol === "god") {
        const reservasSnap = await getDocs(collection(db, "reservas"));
        const usuariosSnap = await getDocs(collection(db, "usuarios"));

        const reservasData = reservasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setReservas(reservasData);
        setUsuarios(usuariosSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        calcularStats(reservasData);
      }
    };

    cargarDatos();
  }, [usuario, rol]);

  // Estadísticas generales
  const calcularStats = (data) => {
    const total = data.length;
    const activas = data.filter((r) => r.estado === "activa").length;
    const atendidas = data.filter((r) => r.estado === "atendido").length;
    const canceladas = data.filter((r) => r.estado === "cancelada").length;
    const ganancias = data
      .filter((r) => r.estado === "atendido")
      .reduce((sum, r) => sum + (r.precio || 0), 0);

    setStats({
      totalReservas: total,
      reservasActivas: activas,
      reservasAtendidas: atendidas,
      reservasCanceladas: canceladas,
      ganancias: ganancias,
    });
  };

  // Confirmar pago user (👤)
  const activarPago = async () => {
    if (rol !== "user") {
      setMensaje("⚠️ Solo los usuarios 👤 pueden cambiar su estado de pago");
      return;
    }
    await updateDoc(doc(db, "usuarios", usuario.uid), { requierePago: false });
    setMensaje("✅ Tu estado de pago fue actualizado. Ahora puedes reservar.");
  };

  // Filtrar reservas dashboard
  const reservasFiltradas = reservas.filter((r) => {
    const fechaR = new Date(r.fecha);
    const fechaInicio = filtroFechaInicio ? new Date(filtroFechaInicio) : null;
    const fechaFin = filtroFechaFin ? new Date(filtroFechaFin) : null;

    return (
      (filtroEstado ? r.estado === filtroEstado : true) &&
      (fechaInicio ? fechaR >= fechaInicio : true) &&
      (fechaFin ? fechaR <= fechaFin : true)
    );
  });

  // Exportar Excel
  const exportarExcel = () => {
    const data = reservasFiltradas.map((r) => ({
      Cliente: r.nombre || "",
      Fecha: r.fecha,
      Hora: r.hora,
      Servicio: r.servicio,
      Precio: `S/. ${r.precio || 0}`,
      Estado: r.estado,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reservas");
    XLSX.writeFile(wb, `Reporte_BarberYass_${Date.now()}.xlsx`);
  };

  // Exportar PDF
  const exportarPDF = () => {
    const docPDF = new jsPDF();
    docPDF.text("Reporte BarberYass", 14, 15);

    const columnas = ["Cliente", "Fecha", "Hora", "Servicio", "Precio", "Estado"];
    const filas = reservasFiltradas.map((r) => [
      r.nombre,
      r.fecha,
      r.hora,
      r.servicio,
      `S/. ${r.precio || 0}`,
      r.estado,
    ]);

    docPDF.autoTable({
      head: [columnas],
      body: filas,
      startY: 25,
    });

    docPDF.save(`Reporte_BarberYass_${Date.now()}.pdf`);
  };

  // Sin sesión
  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Debes iniciar sesión para ver tu perfil</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <motion.img
        src={logo}
        alt="Logo"
        className="w-20 mb-4 mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <h2 className="text-2xl font-bold text-center mb-4">👤 Perfil</h2>
      {mensaje && <p className="text-center mb-3">{mensaje}</p>}

      {/* Datos usuario */}
      <div className="max-w-md mx-auto bg-gray-100 p-4 rounded shadow mb-6">
        <p><strong>Nombre:</strong> {usuario.displayName}</p>
        <p><strong>Email:</strong> {usuario.email}</p>
        <p><strong>Rol:</strong> {rol}</p>
      </div>

      {/* Pago usuario 👤 */}
      {rol === "user" && (
        <div className="text-center mb-6">
          <button
            onClick={activarPago}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Confirmar Pago 50%
          </button>
        </div>
      )}

      {/* Dashboard para roles god/admin/barberyass */}
      {(rol === "admin" || rol === "barberyass" || rol === "god") && (
        <div className="max-w-6xl mx-auto mb-10">
          <h3 className="text-2xl font-semibold mb-6 text-center">📊 Dashboard BarberYass</h3>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded shadow text-center">
              <p className="text-3xl font-bold">{stats.totalReservas}</p>
              <p>Total Reservas</p>
            </div>
            <div className="bg-green-100 p-4 rounded shadow text-center">
              <p className="text-3xl font-bold">{stats.reservasActivas}</p>
              <p>Activas</p>
            </div>
            <div className="bg-purple-100 p-4 rounded shadow text-center">
              <p className="text-3xl font-bold">{stats.reservasAtendidas}</p>
              <p>Atendidas</p>
            </div>
            <div className="bg-red-100 p-4 rounded shadow text-center">
              <p className="text-3xl font-bold">{stats.reservasCanceladas}</p>
              <p>Canceladas</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded shadow text-center">
              <p className="text-3xl font-bold">S/. {stats.ganancias.toFixed(2)}</p>
              <p>Ganancias</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex gap-2">
              <input
                type="date"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="date"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                className="border p-2 rounded"
              />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Todos</option>
                <option value="activa">Activa</option>
                <option value="atendido">Atendida</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportarExcel}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Exportar Excel
              </button>
              <button
                onClick={exportarPDF}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Exportar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservas */}
      <h3 className="text-xl font-semibold mb-3 text-center">📋 Reservas</h3>
      <div className="max-w-6xl mx-auto">
        {reservasFiltradas.length === 0 ? (
          <p className="text-center text-gray-600">No se encontraron reservas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2">Cliente</th>
                  <th className="p-2">Fecha</th>
                  <th className="p-2">Hora</th>
                  <th className="p-2">Servicio</th>
                  <th className="p-2">Precio</th>
                  <th className="p-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2">{r.nombre || "-"}</td>
                    <td className="p-2">{r.fecha}</td>
                    <td className="p-2">{r.hora}</td>
                    <td className="p-2">{r.servicio}</td>
                    <td className="p-2">S/. {r.precio || 0}</td>
                    <td className="p-2">{r.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
