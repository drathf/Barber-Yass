import React, { useEffect, useState } from "react";
import {
  collection,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext"; // ✅ Validación de login y roles
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";

const AdminHorarios = () => {
  const { usuario, cargando } = useAuth();
  const [rol, setRol] = useState(null);

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [horarios, setHorarios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [contadorSemana, setContadorSemana] = useState({});
  const [semanaActual, setSemanaActual] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const semanaLaboral = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  // Formatear fecha DD/MM/AAAA
  const formatearFecha = (fecha) => {
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  // Obtener lunes de la semana actual
  const obtenerLunesSemana = (fechaBase) => {
    const fecha = new Date(fechaBase);
    const diaSemana = fecha.getDay(); // 0 domingo, 1 lunes
    const distanciaLunes = (diaSemana === 0 ? -6 : 1) - diaSemana;
    fecha.setDate(fecha.getDate() + distanciaLunes);
    return fecha;
  };

  // Generar días lunes a sábado
  const generarSemanaActual = () => {
    const lunes = obtenerLunesSemana(new Date());
    return Array.from({ length: 6 }, (_, i) => {
      const fecha = new Date(lunes);
      fecha.setDate(lunes.getDate() + i);
      return fecha;
    });
  };

  // Obtener rol de usuario
  useEffect(() => {
    if (usuario) {
      const ref = doc(db, "usuarios", usuario.uid);
      getDoc(ref).then((snap) => {
        if (snap.exists()) setRol(snap.data().rol);
      });
    }
  }, [usuario]);

  // Auto-actualización de la semana cada lunes 00:00
  useEffect(() => {
    setSemanaActual(generarSemanaActual());

    const interval = setInterval(() => {
      const ahora = new Date();
      if (ahora.getDay() === 1 && ahora.getHours() === 0 && ahora.getMinutes() === 0) {
        setSemanaActual(generarSemanaActual());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Cargar datos de horarios y reservas
  useEffect(() => {
    const unsubHorarios = onSnapshot(collection(db, "horarios"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setHorarios(data.filter((h) => h.fecha === formatearFecha(fechaSeleccionada)));

      const contador = semanaActual.reduce((acc, fecha, idx) => {
        const nombreDia = semanaLaboral[idx];
        acc[nombreDia] = {
          fecha: formatearFecha(fecha),
          habilitados: 0,
          agendadas: 0,
        };
        return acc;
      }, {});

      data.forEach((h) => {
        const nombreDia = Object.keys(contador).find(
          (dia) => contador[dia].fecha === h.fecha
        );
        if (nombreDia) {
          if (h.disponible && !h.reservado) contador[nombreDia].habilitados += 1;
          if (h.reservado) contador[nombreDia].agendadas += 1;
        }
      });

      setContadorSemana(contador);
    });

    const unsubReservas = onSnapshot(collection(db, "reservas"), (snapshot) => {
      setReservas(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubHorarios();
      unsubReservas();
    };
  }, [fechaSeleccionada, semanaActual]);

  // Horarios base
  const generarHorariosBase = () => {
    return Array.from({ length: 9 }, (_, i) => `${i + 11}:00`);
  };

  // Validación de permisos
  const tienePermiso = () => rol === "god" || rol === "admin" || rol === "barberyass";

  // Acciones de horarios
  const crearHorario = async (hora) => {
    if (!tienePermiso()) {
      alert("⛔ No tienes permisos para crear horarios");
      return;
    }
    const fechaFormato = formatearFecha(fechaSeleccionada);
    const ref = doc(collection(db, "horarios"));
    await setDoc(ref, {
      fecha: fechaFormato,
      hora,
      disponible: false,
      reservado: false,
      reservaId: null,
    });
  };

  const cambiarDisponibilidad = async (horario) => {
    if (!tienePermiso()) {
      alert("⛔ No tienes permisos para habilitar/deshabilitar horarios");
      return;
    }
    await updateDoc(doc(db, "horarios", horario.id), {
      disponible: !horario.disponible,
    });
  };

  const liberarHorarioReservado = async (horario) => {
    if (!tienePermiso()) {
      alert("⛔ No tienes permisos para liberar horarios");
      return;
    }
    if (!window.confirm("¿Liberar este horario reservado?")) return;
    if (horario.reservaId) {
      await deleteDoc(doc(db, "reservas", horario.reservaId));
    }
    await updateDoc(doc(db, "horarios", horario.id), {
      reservado: false,
      disponible: false,
      reservaId: null,
    });
  };

  // Acciones de reservas
  const eliminarReserva = async (reserva) => {
    if (!tienePermiso()) {
      alert("⛔ No tienes permisos para eliminar reservas");
      return;
    }
    if (!window.confirm("¿Eliminar esta reserva?")) return;
    await deleteDoc(doc(db, "reservas", reserva.id));

    const horarioRef = horarios.find((h) => h.id === reserva.horarioId);
    if (horarioRef) {
      await updateDoc(doc(db, "horarios", horarioRef.id), {
        reservado: false,
        disponible: true,
        reservaId: null,
      });
    }
  };

  const marcarCulminado = async (reserva) => {
    if (!tienePermiso()) {
      alert("⛔ No tienes permisos para marcar reservas");
      return;
    }
    if (!window.confirm("¿Marcar esta reserva como culminada?")) return;
    await updateDoc(doc(db, "reservas", reserva.id), {
      estado: "culminada",
    });
  };

  const obtenerNombreReserva = (horario) => {
    const reserva = reservas.find((r) => r.id === horario.reservaId);
    return reserva ? `${reserva.nombre}` : "Desconocido";
  };

  // Exportar Excel
  const exportarExcel = () => {
    const datos = reservas.map((r, i) => ({
      "#": i + 1,
      Nombre: r.nombre,
      Email: r.email,
      Servicio: r.servicio,
      "Fecha/Hora": `${r.fecha} ${r.hora}`,
      Monto: r.monto,
      Estado: r.estado,
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reservas");
    XLSX.writeFile(wb, `Reservas_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const reservasFiltradas = reservas.filter((r) =>
    filtroEstado === "todos" ? true : r.estado === filtroEstado
  );

  const horariosBase = generarHorariosBase();

  // 🛑 Validación de login y roles
  if (cargando) {
    return <div className="p-10 text-center">Cargando...</div>;
  }

  if (!usuario) {
    return <div className="p-10 text-center text-red-600">Debes iniciar sesión</div>;
  }

  if (!tienePermiso()) {
    return <div className="p-10 text-center text-red-600">⛔ Acceso denegado</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-purple-800 mb-4">
        Gestión de Horarios
      </h1>

      {/* Contador semanal */}
      <div className="flex flex-wrap gap-4 mb-6">
        {semanaLaboral.map((dia) => (
          <div
            key={dia}
            className="bg-white rounded shadow px-4 py-2 text-center border"
          >
            <p className="font-bold capitalize">
              {dia} ({contadorSemana[dia]?.fecha || "--/--"})
            </p>
            <p className="text-purple-600 text-lg">
              {contadorSemana[dia]?.habilitados || 0} habilitados
            </p>
            <p className="text-blue-600 text-sm">
              {contadorSemana[dia]?.agendadas || 0} citas agendadas
            </p>
          </div>
        ))}
      </div>

      {/* Selección de fecha */}
      <div className="mb-6">
        <DatePicker
          selected={fechaSeleccionada}
          onChange={(date) => setFechaSeleccionada(date)}
          dateFormat="dd/MM/yyyy"
          className="border p-2 rounded w-48"
        />
      </div>

      {/* Botones de horarios */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {horariosBase.map((hora) => {
          const horario = horarios.find((h) => h.hora === hora);
          if (!horario) {
            return (
              <button
                key={hora}
                onClick={() => crearHorario(hora)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 shadow"
              >
                {hora} (Deshabilitado)
              </button>
            );
          }
          if (horario.reservado) {
            return (
              <button
                key={hora}
                onClick={() => liberarHorarioReservado(horario)}
                className="bg-gray-500 text-white rounded-lg px-4 py-2 shadow"
              >
                {hora} - Reservado por {obtenerNombreReserva(horario)}
              </button>
            );
          }
          return (
            <button
              key={hora}
              onClick={() => cambiarDisponibilidad(horario)}
              className={`rounded-lg px-4 py-2 shadow text-white ${
                horario.disponible
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {hora} {horario.disponible ? "(Habilitado)" : "(Deshabilitado)"}
            </button>
          );
        })}
      </div>

      {/* Tabla de reservas */}
      <div className="bg-white rounded shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Reservas registradas</h2>

          <div className="flex items-center gap-3">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border rounded p-2 text-sm shadow"
            >
              <option value="todos">Todos</option>
              <option value="activa">Activas</option>
              <option value="culminada">Culminadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
            <button
              onClick={exportarExcel}
              className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-2 rounded-lg shadow hover:opacity-90 transition"
            >
              📊 Exportar Excel
            </button>
          </div>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">#</th>
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Servicio</th>
              <th className="border px-2 py-1">Fecha/Hora</th>
              <th className="border px-2 py-1">Monto</th>
              <th className="border px-2 py-1">Estado</th>
              <th className="border px-2 py-1">Acción</th>
            </tr>
          </thead>
          <tbody>
            {reservasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-3">
                  No hay reservas registradas
                </td>
              </tr>
            ) : (
              reservasFiltradas.map((r, i) => (
                <tr key={r.id}>
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">{r.nombre}</td>
                  <td className="border px-2 py-1">{r.email}</td>
                  <td className="border px-2 py-1">{r.servicio}</td>
                  <td className="border px-2 py-1">
                    {r.fecha} {r.hora}
                  </td>
                  <td className="border px-2 py-1">S/. {r.monto}</td>
                  <td className="border px-2 py-1">{r.estado}</td>
                  <td className="border px-2 py-1 text-center flex gap-1 justify-center">
                    <button
                      onClick={() => marcarCulminado(r)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs shadow"
                    >
                      ✅ Culminar
                    </button>
                    <button
                      onClick={() => eliminarReserva(r)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs shadow"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHorarios;
