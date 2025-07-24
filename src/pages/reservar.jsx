// ✅ reservar.jsx actualizado con SEO, QR local y logo importado
import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  addDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import logo from '../assets/galeria/logo.png';
import qrYape from '../assets/galeria/yape-qr.png';

const Reservar = () => {
  const { usuario, rol } = useAuth();
  const navigate = useNavigate();

  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horariosPorDia, setHorariosPorDia] = useState({});
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [servicio, setServicio] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [aplica50, setAplica50] = useState(false);
  const [comentario, setComentario] = useState('');
  const [referencia, setReferencia] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [reservando, setReservando] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'horarios'),
      where('disponible', '==', true),
      where('reservado', '==', false)
    );
    const unsub = onSnapshot(q, (snap) => {
      const horarios = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const agrupados = {};
      horarios.forEach((h) => {
        if (!agrupados[h.fecha]) agrupados[h.fecha] = [];
        agrupados[h.fecha].push(h);
      });
      setHorariosPorDia(agrupados);
    });

    const cargarServicios = async () => {
      const snap = await getDocs(collection(db, 'servicios'));
      const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setServiciosDisponibles(lista);
    };

    cargarServicios();
    return () => unsub();
  }, []);

  const reservarCita = async () => {
    if (!usuario || !seleccionado || !servicio || !metodoPago) {
      setMensaje('❗Completa todos los campos obligatorios');
      return;
    }

    setReservando(true);
    setMensaje('');

    try {
      const servicioData = serviciosDisponibles.find((s) => s.id === servicio);
      const montoPagado = aplica50 ? servicioData.precio / 2 : 0;

      await addDoc(collection(db, 'reservas'), {
        email: usuario.email,
        nombre: usuario.displayName || '',
        telefono: usuario.phoneNumber || '',
        fecha: seleccionado.fecha,
        hora: seleccionado.hora,
        servicio: servicioData.nombre,
        precio: servicioData.precio,
        metodoPago,
        aplica50,
        montoPagado,
        comentario,
        referencia,
        estado: 'activa',
        barbero: 'Yass',
        creado: new Date().toISOString(),
      });

      await updateDoc(doc(db, 'horarios', seleccionado.id), {
        reservado: true,
        disponible: false,
      });

      const msg = `Hola! Soy ${usuario.email} y he reservado: ${servicioData.nombre} (S/. ${servicioData.precio}) el ${seleccionado.fecha} a las ${seleccionado.hora}. Pago: ${metodoPago}${aplica50 ? ' (50% pagado)' : ''}.`;
      window.open(`https://wa.me/+51907011564?text=${encodeURIComponent(msg)}`, '_blank');

      navigate('/confirmacion');
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al reservar. Intenta nuevamente.');
    } finally {
      setReservando(false);
    }
  };

  const fechaStr = fechaSeleccionada ? format(fechaSeleccionada, 'yyyy-MM-dd') : null;

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <Helmet>
        <title>Reservar Cita | BarberYass</title>
        <meta name="description" content="Reserva tu cita exclusiva con BarberYass. Elige día, horario, servicio y método de pago." />
        <meta name="keywords" content="reserva barbería, cita barbera, BarberYass, servicios" />
        <meta name="author" content="BarberYass" />
      </Helmet>

      <motion.img src={logo} alt="Logo" className="w-20 mx-auto mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} />
      <h2 className="text-2xl font-bold text-center mb-4">Reservar cita</h2>

      {mensaje && <p className="text-center mb-4 font-medium text-red-500">{mensaje}</p>}

      <div className="mb-6">
        <label className="block font-semibold mb-1">Selecciona un día *</label>
        <DatePicker
          selected={fechaSeleccionada}
          onChange={(date) => {
            setFechaSeleccionada(date);
            setSeleccionado(null);
          }}
          locale={es}
          dateFormat="dd/MM/yyyy"
          className="w-full p-2 border rounded"
          placeholderText="Elige una fecha"
        />
      </div>

      {fechaStr && horariosPorDia[fechaStr] && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">🕒 Horarios disponibles para {fechaStr}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {horariosPorDia[fechaStr].map((h) => (
              <button
                key={h.id}
                onClick={() => setSeleccionado(h)}
                className={`p-2 border rounded text-sm ${seleccionado?.id === h.id ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
              >
                {h.hora}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block font-semibold mb-1">Servicio *</label>
        <select className="w-full p-2 border rounded" value={servicio} onChange={(e) => setServicio(e.target.value)}>
          <option value="">Selecciona un servicio</option>
          {serviciosDisponibles.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre} - S/. {s.precio}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Método de pago *</label>
        <select className="w-full p-2 border rounded" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
          <option value="">Selecciona una opción</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Yape">Yape</option>
          <option value="Plin">Plin</option>
          <option value="Tarjeta">Tarjeta</option>
        </select>
        {metodoPago === 'Yape' && (
          <img src={qrYape} alt="QR Yape" className="h-32 mt-2 mx-auto" />
        )}
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Comentario</label>
        <textarea className="w-full p-2 border rounded" rows="3" value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="¿Deseas comentar algo sobre tu cita?" />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">¿Cómo nos conociste?</label>
        <select className="w-full p-2 border rounded" value={referencia} onChange={(e) => setReferencia(e.target.value)}>
          <option value="">Seleccione una opción</option>
          <option value="Instagram">Instagram</option>
          <option value="Recomendación">Recomendación</option>
          <option value="Google">Google</option>
          <option value="Otra">Otra</option>
        </select>
      </div>

      {(rol === 'admin' || rol === 'god') && (
        <div className="mb-4 flex items-center gap-2">
          <input type="checkbox" id="abono" checked={aplica50} onChange={(e) => setAplica50(e.target.checked)} />
          <label htmlFor="abono" className="text-sm text-gray-700">Confirmo que el cliente ha pagado el 50%</label>
        </div>
      )}

      {seleccionado && servicio && metodoPago && (
        <div className="mt-6 bg-white border p-4 rounded shadow-md space-y-2 text-sm">
          <p><strong>📅 Fecha:</strong> {seleccionado.fecha}</p>
          <p><strong>🕒 Hora:</strong> {seleccionado.hora}</p>
          <p><strong>💈 Servicio:</strong> {serviciosDisponibles.find((s) => s.id === servicio)?.nombre}</p>
          <p><strong>💳 Método de pago:</strong> {metodoPago}</p>
          {aplica50 && (
            <p className="text-green-600">
              Abonado 50%: S/. {(serviciosDisponibles.find((s) => s.id === servicio)?.precio / 2).toFixed(2)}
            </p>
          )}
          <button
            onClick={reservarCita}
            disabled={reservando}
            className={`w-full py-2 mt-4 rounded font-semibold text-white ${reservando ? 'bg-gray-500' : 'bg-black hover:bg-gray-800'} transition`}
          >
            {reservando ? 'Reservando...' : 'Confirmar reserva'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Reservar;
