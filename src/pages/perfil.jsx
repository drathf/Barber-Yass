import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import logo from "../assets/galeria/logo.png";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Perfil() {
  const { usuario, rol, cargando } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState(""); // 🔹 foto perfil Firestore
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

  // Login local
  const [credenciales, setCredenciales] = useState({ email: "", password: "" });
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      if (usuario) {
        // 🔹 Traer foto de perfil desde Firestore
        const ref = doc(db, "usuarios", usuario.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.fotoPerfil) setFotoPerfil(data.fotoPerfil);
        }
      }
    };
    cargarDatosUsuario();
  }, [usuario]);

  useEffect(() => {
    if (!usuario) return;

    const cargarDatos = async () => {
      if (rol === "user" || rol === "vip") {
        // Solo sus reservas
        const q = query(collection(db, "reservas"), where("uid", "==", usuario.uid));
        const snap = await getDocs(q);
        setReservas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }

      if (rol === "admin" || rol === "barberyass" || rol === "god") {
        // Dashboard
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

  // Confirmar pago user
  const activarPago = async () => {
    if (rol !== "user") {
      setMensaje("⚠️ Solo los usuarios 👤 pueden cambiar su estado de pago");
      return;
    }
    await updateDoc(doc(db, "usuarios", usuario.uid), { requierePago: false });
    setMensaje("✅ Tu estado de pago fue actualizado. Ahora puedes reservar.");
  };

  // Filtrar reservas
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

  // Login y logout
  const iniciarSesion = async (e) => {
    e.preventDefault();
    if (!credenciales.email || !credenciales.password) {
      setMensaje("⚠️ Ingresa tu email y contraseña");
      return;
    }

    try {
      setProcesando(true);
      await signInWithEmailAndPassword(auth, credenciales.email, credenciales.password);
      setMensaje("✅ Bienvenido");
    } catch (error) {
      console.error(error);
      setMensaje("❌ Credenciales incorrectas");
    } finally {
      setProcesando(false);
    }
  };

  const cerrarSesion = async () => {
    await signOut(auth);
  };

  // Loader
  if (cargando) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  // Si no está logueado -> Login
  if (!usuario) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.img src={logo} alt="Logo" className="w-24 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        <h2 className="text-xl font-bold mb-4">🔐 Inicia sesión</h2>
        {mensaje && <p className="mb-3 text-center text-red-600">{mensaje}</p>}

        <form onSubmit={iniciarSesion} className="w-full max-w-sm space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full border p-2 rounded"
            value={credenciales.email}
            onChange={(e) => setCredenciales({ ...credenciales, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full border p-2 rounded"
            value={credenciales.password}
            onChange={(e) => setCredenciales({ ...credenciales, password: e.target.value })}
          />
          <button
            type="submit"
            disabled={procesando}
            className={`w-full py-2 rounded text-white ${procesando ? "bg-gray-400" : "bg-black hover:bg-gray-800"}`}
          >
            {procesando ? "Conectando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    );
  }

  // Si está logueado -> Perfil
  return (
    <div className="min-h-screen p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <motion.img src={logo} alt="Logo" className="w-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        <button
          onClick={cerrarSesion}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
        >
          Cerrar sesión
        </button>
      </div>

      <h2 className="text-2xl font-bold text-center mb-4">👤 Mi Perfil</h2>
      {mensaje && <p className="text-center mb-3 text-green-600">{mensaje}</p>}

      {/* Datos usuario */}
      <div className="max-w-md mx-auto bg-gray-100 p-6 rounded shadow mb-6 text-center">
        {/* Foto de perfil */}
        <img
          src={fotoPerfil || "https://ui-avatars.com/api/?name=" + usuario.email}
          alt="Foto de perfil"
          className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-purple-400"
        />
        <p className="text-lg font-semibold">{usuario.displayName || "Usuario"}</p>
        <p className="text-sm text-gray-700">{usuario.email}</p>
        <p className="text-sm mt-1">
          <strong>Rol:</strong> {rol}
        </p>
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

      {/* Dashboard roles admin/god/barberyass */}
      {(rol === "admin" || rol === "barberyass" || rol === "god") && (
        <div className="max-w-6xl mx-auto mb-10">
          <h3 className="text-2xl font-semibold mb-6 text-center">📊 Dashboard BarberYass</h3>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
      <h3 className="text-xl font-semibold mb-3 text-center">📋 Mis Reservas</h3>
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
