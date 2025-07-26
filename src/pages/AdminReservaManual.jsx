// src/components/AdminReservaManual.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import logo from "../assets/galeria/logo.png"; // ✅ Ruta corregida
import { motion } from "framer-motion";

const HORAS = ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const AdminReservaManual = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [telefono, setTelefono] = useState("");
  const [ultimaReserva, setUltimaReserva] = useState(null);
  const [estadoUltima, setEstadoUltima] = useState("");
  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [seleccionado, setSeleccionado] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [estadoPago, setEstadoPago] = useState("no requerido");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [reservando, setReservando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      const [snapClientes, snapServicios] = await Promise.all([
        getDocs(collection(db, "usuarios")),
        getDocs(collection(db, "servicios")),
      ]);
      setClientes(snapClientes.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setServicios(snapServicios.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!fechaSeleccionada) return;
    const cargarHorarios = async () => {
      const q = query(collection(db, "horarios"), where("fecha", "==", fechaSeleccionada));
      const snap = await getDocs(q);
      setHorarios(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    cargarHorarios();
  }, [fechaSeleccionada]);

  const handleSelectCliente = async (cliente) => {
    setClienteSeleccionado(cliente);
    setTelefono(cliente.telefono || "");
    setBusqueda(`${cliente.nombre} — ${cliente.email}`);
    setMostrarSugerencias(false);

    const reservasSnap = await getDocs(query(collection(db, "reservas"), where("email", "==", cliente.email)));
    const reservas = reservasSnap.docs.map(doc => doc.data());

    if (reservas.length) {
      const ultima = reservas
        .sort((a, b) => new Date(`${b.fecha}T${b.hora}`) - new Date(`${a.fecha}T${a.hora}`))[0];
      setUltimaReserva(`${ultima.fecha} ${ultima.hora}`);
      setEstadoUltima(ultima.estado);
    } else {
      setUltimaReserva(null);
      setEstadoUltima("");
    }
  };

  const getEstado = (hora) => {
    const h = horarios.find((h) => h.hora === hora);
    if (!h) return "nuevo";
    if (h.reservado) return "reservado";
    return h.disponible ? "disponible" : "no disponible";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clienteSeleccionado || !telefono || !servicioSeleccionado || !seleccionado) {
      setMensaje("❗ Completa todos los campos obligatorios.");
      return;
    }

    setReservando(true);
    const hora = seleccionado;
    const horario = horarios.find((h) => h.hora === hora);
    const servicio = servicios.find((s) => s.id === servicioSeleccionado);
    if (!horario || !servicio) {
      setMensaje("❌ Error: horario o servicio inválido.");
      setReservando(false);
      return;
    }

    try {
      await addDoc(collection(db, "reservas"), {
        email: clienteSeleccionado.email,
        nombre: clienteSeleccionado.nombre || "",
        telefono,
        fecha: fechaSeleccionada,
        hora,
        servicio: servicio.nombre,
        precio: servicio.precio,
        barbero: "Yass",
        creado: Timestamp.now(),
        estado: "activa",
        metodoPago,
        estadoPago,
        creadoPorAdmin: true,
      });

      await updateDoc(doc(db, "horarios", horario.id), {
        reservado: true,
        disponible: false,
      });

      setMensaje("✅ Reserva creada correctamente.");
      setClienteSeleccionado(null);
      setTelefono("");
      setServicioSeleccionado("");
      setSeleccionado("");
      setMetodoPago("");
      setEstadoPago("no requerido");
      setBusqueda("");
      setUltimaReserva(null);
      setEstadoUltima("");
      setFechaSeleccionada("");
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al crear la reserva.");
    } finally {
      setReservando(false);
    }
  };

  const clientesFiltrados = clientes.filter((c) =>
    (c.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto">
      <motion.img
        src={logo}
        alt="Logo BarberYass"
        className="w-20 mx-auto mb-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      />
      <h2 className="text-2xl font-bold mb-4 text-center">📝 Registrar Atención Manual</h2>
      {mensaje && <p className="mb-4 text-center text-blue-600 font-medium">{mensaje}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar cliente por nombre o correo..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setMostrarSugerencias(true);
            }}
            className="w-full p-2 border rounded"
          />
          {mostrarSugerencias && clientesFiltrados.length > 0 && (
            <ul className="absolute w-full bg-white border rounded mt-1 max-h-40 overflow-y-auto shadow-lg z-10">
              {clientesFiltrados.map((c) => (
                <li
                  key={c.id}
                  className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-sm"
                  onClick={() => handleSelectCliente(c)}
                >
                  {c.nombre} — {c.email}
                </li>
              ))}
            </ul>
          )}
        </div>

        {clienteSeleccionado && (
          <div className="bg-gray-100 p-3 rounded text-sm">
            <p><strong>Cliente:</strong> {clienteSeleccionado.nombre} ({clienteSeleccionado.email})</p>
            <p><strong>Teléfono:</strong> {telefono}</p>
            {ultimaReserva && (
              <p><strong>Última reserva:</strong> {ultimaReserva} — <span className="uppercase font-medium text-blue-700">{estadoUltima}</span></p>
            )}
          </div>
        )}

        <input type="tel" placeholder="Teléfono del cliente" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full p-2 border rounded" required />
        <select value={servicioSeleccionado} onChange={(e) => setServicioSeleccionado(e.target.value)} className="w-full p-2 border rounded" required>
          <option value="">Selecciona un servicio</option>
          {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre} - S/. {s.precio}</option>)}
        </select>
        <input type="date" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} className="w-full p-2 border rounded" required />

        {fechaSeleccionada && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {HORAS.map((hora) => {
              const estado = getEstado(hora);
              return (
                <button key={hora} type="button" onClick={() => estado !== "reservado" && setSeleccionado(hora)} className={`p-2 text-sm rounded font-semibold transition border ${estado === "reservado" ? "bg-gray-300 cursor-not-allowed" : seleccionado === hora ? "bg-black text-white" : estado === "disponible" ? "bg-green-200 hover:bg-green-300" : "bg-red-200 hover:bg-red-300"}`} disabled={estado === "reservado"}>
                  {hora} {estado === "reservado" ? "⛔" : ""}
                </button>
              );
            })}
          </div>
        )}

        <input type="text" placeholder="Método de pago (opcional)" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className="w-full p-2 border rounded" />
        <select value={estadoPago} onChange={(e) => setEstadoPago(e.target.value)} className="w-full p-2 border rounded">
          <option value="no requerido">No requerido</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
        </select>

        <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition" disabled={reservando}>
          {reservando ? "Registrando..." : "Registrar Reserva"}
        </button>
      </form>
    </div>
  );
};

export default AdminReservaManual;
