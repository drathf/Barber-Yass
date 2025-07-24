// src/components/AdminGestionUsuarios.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import logo from "../assets/galeria/logo.png"; // ✅ ruta corregida
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

export default function AdminGestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [filtro, setFiltro] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroPago, setFiltroPago] = useState(false);
  const [filtroActiva, setFiltroActiva] = useState(false);
  const [datosReservas, setDatosReservas] = useState({});
  const navigate = useNavigate();

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    telefono: "",
    dni: "",
    nacimiento: "",
  });

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const snap = await getDocs(collection(db, "usuarios"));
        const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsuarios(lista);
        obtenerReservasPorUsuario(lista);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        setMensaje("❌ Error al obtener usuarios");
      }
    };

    const obtenerReservasPorUsuario = async (usuarios) => {
      const snapshot = await getDocs(collection(db, "reservas"));
      const reservas = snapshot.docs.map((doc) => doc.data());

      const resumen = {};

      usuarios.forEach((u) => {
        const match = reservas.filter(
          (r) => r.telefono === u.telefono || r.email === u.email
        );

        const ahora = new Date();
        const inicioSemana = new Date(ahora);
        inicioSemana.setDate(ahora.getDate() - ahora.getDay() + 1);
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);

        const activaSemana = match.some((r) => {
          const fecha = new Date(`${r.fecha}T${r.hora}`);
          return r.estado === "activa" && fecha >= inicioSemana && fecha <= finSemana;
        });

        const ultima = match
          .filter((r) => r.estado === "atendido")
          .map((r) => new Date(`${r.fecha}T${r.hora}`))
          .sort((a, b) => b - a)[0];

        resumen[u.id] = {
          activa: activaSemana,
          ultimaReserva: ultima
            ? ultima.toLocaleString("es-PE", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : null,
        };
      });

      setDatosReservas(resumen);
    };

    obtenerUsuarios();
  }, []);

  const actualizarUsuario = async (id, campo, valor) => {
    try {
      await updateDoc(doc(db, "usuarios", id), { [campo]: valor });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, [campo]: valor } : u))
      );
      setMensaje("✅ Usuario actualizado");
      setTimeout(() => setMensaje(""), 2000);
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al actualizar");
    }
  };

  const eliminarUsuario = async (id, email) => {
    if (!confirm(`¿Deseas eliminar al usuario ${email}?`)) return;
    try {
      await deleteDoc(doc(db, "usuarios", id));
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      setMensaje("✅ Usuario eliminado correctamente");
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al eliminar usuario");
    }
  };

  const crearNuevoUsuario = async () => {
    const { nombre, email, telefono } = nuevoUsuario;
    if (!nombre || !email || !telefono) {
      setMensaje("❗Completa todos los campos obligatorios");
      return;
    }
    try {
      await addDoc(collection(db, "usuarios"), {
        ...nuevoUsuario,
        rol: "user",
        creado: new Date().toISOString(),
        requierePago: false,
      });
      setMensaje("✅ Usuario creado exitosamente");
      setNuevoUsuario({
        nombre: "",
        email: "",
        telefono: "",
        dni: "",
        nacimiento: "",
      });
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al crear usuario");
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideEmail = u.email?.toLowerCase().includes(filtro.toLowerCase());
    const coincideRol = filtroRol ? u.rol === filtroRol : true;
    const coincidePago = filtroPago ? u.requierePago : true;
    const coincideActiva = filtroActiva ? datosReservas[u.id]?.activa : true;
    return coincideEmail && coincideRol && coincidePago && coincideActiva;
  });

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>Admin Usuarios - BarberYass</title>
        <meta name="description" content="Gestión completa de usuarios, clientes y roles en BarberYass." />
      </Helmet>

      <motion.img
        src={logo}
        alt="Logo BarberYass"
        className="w-20 mx-auto mb-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      />

      <h2 className="text-2xl font-bold mb-4 text-center">🛠 Gestión de Usuarios</h2>
      {mensaje && <p className="mb-4 text-blue-600 text-center">{mensaje}</p>}

      <div className="mb-4">
        <button
          onClick={() => navigate("/admin")}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ⬅ Volver al panel admin
        </button>
      </div>

      {/* Formulario nuevo usuario */}
      <div className="mb-6 bg-white shadow p-4 rounded grid gap-3 md:grid-cols-5">
        <input type="text" placeholder="Nombre completo *" className="p-2 border rounded"
          value={nuevoUsuario.nombre} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} />
        <input type="email" placeholder="Correo *" className="p-2 border rounded"
          value={nuevoUsuario.email} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} />
        <input type="text" placeholder="Celular *" className="p-2 border rounded"
          value={nuevoUsuario.telefono} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, telefono: e.target.value })} />
        <input type="text" placeholder="DNI" className="p-2 border rounded"
          value={nuevoUsuario.dni} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, dni: e.target.value })} />
        <input type="date" placeholder="Nacimiento" className="p-2 border rounded"
          value={nuevoUsuario.nacimiento} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nacimiento: e.target.value })} />
        <button
          onClick={crearNuevoUsuario}
          className="md:col-span-5 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          ➕ Crear usuario (rol: user)
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-4 justify-between items-center">
        <input type="text" placeholder="Buscar por correo..." value={filtro}
          onChange={(e) => setFiltro(e.target.value)} className="p-2 border rounded w-full sm:w-64" />
        <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} className="p-2 border rounded">
          <option value="">Todos los roles</option>
          <option value="user">user</option>
          <option value="vip">vip</option>
          <option value="admin">admin</option>
          <option value="barber">barber</option>
        </select>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={filtroPago} onChange={(e) => setFiltroPago(e.target.checked)} />
          Requiere pago
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={filtroActiva} onChange={(e) => setFiltroActiva(e.target.checked)} />
          Reserva activa
        </label>
      </div>

      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Correo</th>
              <th className="p-2">Rol</th>
              <th className="p-2 text-center">Pago</th>
              <th className="p-2 text-center">Activa</th>
              <th className="p-2">Última cita</th>
              <th className="p-2 text-center">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((u, index) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{u.nombre}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">
                    {u.rol === "god" ? (
                      <span className="text-red-600 text-xs font-semibold italic">god</span>
                    ) : (
                      <select
                        value={u.rol}
                        onChange={(e) => actualizarUsuario(u.id, "rol", e.target.value)}
                        className="border rounded p-1"
                      >
                        <option value="user">user</option>
                        <option value="vip">vip</option>
                        <option value="admin">admin</option>
                        <option value="barber">barber</option>
                      </select>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    <input type="checkbox" checked={u.requierePago || false}
                      onChange={(e) => actualizarUsuario(u.id, "requierePago", e.target.checked)} />
                  </td>
                  <td className="p-2 text-center">
                    {datosReservas[u.id]?.activa ? "✅" : "—"}
                  </td>
                  <td className="p-2 text-xs text-gray-600">
                    {datosReservas[u.id]?.ultimaReserva || "—"}
                  </td>
                  <td className="p-2 text-center">
                    {u.rol !== "god" && (
                      <button onClick={() => eliminarUsuario(u.id, u.email)}
                        className="text-red-600 hover:underline text-xs">
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
