import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../context/AuthContext";

const Reservar = () => {
  const { usuario } = useAuth();

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);

  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [servicio, setServicio] = useState("");
  const [horario, setHorario] = useState("");
  const [requierePago, setRequierePago] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);

  // Teléfono de Barber Yass
  const telefonoBarberYass = "51907011564";

  // Formatear fecha DD/MM/AAAA
  const formatearFecha = (fecha) => {
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  // Cargar datos del usuario autenticado
  useEffect(() => {
    const cargarDatosUsuario = async () => {
      if (usuario) {
        const snap = await getDoc(doc(db, "usuarios", usuario.uid));
        if (snap.exists()) {
          const data = snap.data();
          setNombre(data.nombre || "");
          setEmail(data.email || "");
          setRequierePago(data.requierePago || false);
        }
      }
    };
    cargarDatosUsuario();
  }, [usuario]);

  // Cargar servicios en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "servicios"), (snapshot) => {
      setServiciosDisponibles(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });
    return () => unsubscribe();
  }, []);

  // Cargar horarios disponibles en tiempo real
  useEffect(() => {
    const fechaFormato = formatearFecha(fechaSeleccionada);
    const unsubscribe = onSnapshot(collection(db, "horarios"), (snapshot) => {
      const disponibles = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (h) => h.fecha === fechaFormato && h.disponible && !h.reservado
        );
      setHorariosDisponibles(disponibles);
    });
    return () => unsubscribe();
  }, [fechaSeleccionada]);

  // Guardar reserva con validación del 50%
  const reservarCita = async () => {
    if (!nombre || !email || !servicio || !horario) {
      setMensaje("⚠️ Completa todos los campos");
      return;
    }

    // Validar si requiere pago adelantado
    if (requierePago) {
      setMensaje(
        "⚠️ Este usuario debe pagar el 50% adelantado antes de reservar. Contacta a Barber Yass."
      );
      return;
    }

    setProcesando(true);

    try {
      const horarioSeleccionado = horariosDisponibles.find(
        (h) => h.id === horario
      );
      if (!horarioSeleccionado) {
        setMensaje("⚠️ El horario ya no está disponible");
        setProcesando(false);
        return;
      }

      // Registrar la reserva
      const servicioData = serviciosDisponibles.find((s) => s.id === servicio);
      const ref = await addDoc(collection(db, "reservas"), {
        horarioId: horarioSeleccionado.id,
        fecha: horarioSeleccionado.fecha,
        hora: horarioSeleccionado.hora,
        nombre,
        email,
        servicio: servicioData?.nombre || "Servicio",
        monto: servicioData?.precio || 0,
        estado: "activa",
        creado: new Date().toISOString(),
      });

      // Actualizar horario
      await updateDoc(doc(db, "horarios", horarioSeleccionado.id), {
        reservado: true,
        disponible: false,
        reservaId: ref.id,
      });

      // WhatsApp de confirmación
      const whatsappMsg = `👋 Hola soy, ${nombre}, he reservado una cita ✅%0A📅 *${horarioSeleccionado.fecha}* a las *${horarioSeleccionado.hora}*%0A💈 Servicio: *${
        servicioData?.nombre || "Servicio"
      }*%0A💲 Monto: *S/. ${servicioData?.precio || 0}*%0A%0A¡Agradezco tu confirmacion!`;
      window.open(`https://wa.me/${telefonoBarberYass}?text=${whatsappMsg}`, "_blank");

      setMensaje("✅ Reserva realizada con éxito");
      setServicio("");
      setHorario("");
    } catch (error) {
      console.error("Error creando la reserva:", error);
      setMensaje("❌ Error al reservar, intenta nuevamente");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Reserva tu cita</h1>

      {/* Mostrar mensaje del 50% si aplica */}
      {requierePago && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded mb-4 text-center">
          ⚠️ Este usuario debe pagar el 50% adelantado antes de reservar. 
          <br />
          <button
            onClick={() =>
              window.open(
                `https://wa.me/${telefonoBarberYass}?text=Hola%20Barber%20Yass,%20quiero%20realizar%20mi%20pago%20adelantado%20del%2050%25.`,
                "_blank"
              )
            }
            className="mt-2 px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            💬 Contactar por WhatsApp
          </button>
        </div>
      )}

      {mensaje && !requierePago && (
        <p
          className={`text-center mb-4 ${
            mensaje.includes("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {mensaje}
        </p>
      )}

      <input
        type="text"
        placeholder="Nombre y apellido"
        className="border p-2 rounded w-full mb-3"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <input
        type="email"
        placeholder="Correo electrónico"
        className="border p-2 rounded w-full mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled
      />

      <select
        className="border p-2 rounded w-full mb-3"
        value={servicio}
        onChange={(e) => setServicio(e.target.value)}
        disabled={requierePago}
      >
        <option value="">Selecciona un servicio</option>
        {serviciosDisponibles.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nombre} - S/. {s.precio}
          </option>
        ))}
      </select>

      <div className="mb-3">
        <DatePicker
          selected={fechaSeleccionada}
          onChange={(date) => setFechaSeleccionada(date)}
          dateFormat="dd/MM/yyyy"
          className="border p-2 rounded w-full"
          disabled={requierePago}
        />
      </div>

      <select
        className="border p-2 rounded w-full mb-3"
        value={horario}
        onChange={(e) => setHorario(e.target.value)}
        disabled={requierePago}
      >
        <option value="">Selecciona un horario</option>
        {horariosDisponibles.map((h) => (
          <option key={h.id} value={h.id}>
            {h.hora}
          </option>
        ))}
      </select>

      <button
        onClick={reservarCita}
        disabled={procesando || requierePago}
        className={`w-full py-2 rounded text-white ${
          procesando || requierePago
            ? "bg-gray-400"
            : "bg-black hover:bg-gray-800"
        }`}
      >
        {procesando ? "Reservando..." : "Confirmar Reserva"}
      </button>
    </div>
  );
};

export default Reservar;
