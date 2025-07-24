// 📁 src/pages/reservar.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Helmet } from 'react-helmet';

import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext'; // ✅ Importado correctamente

import qrYape from '../assets/galeria/yape-qr.png';
import logo from '../assets/logo.png';

const Reservar = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [servicio, setServicio] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [aplica50, setAplica50] = useState(false);
  const [comentario, setComentario] = useState('');
  const [referencia, setReferencia] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [reservando, setReservando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const horariosSnap = await getDocs(collection(db, 'horarios'));
        const horarios = horariosSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((h) => h.disponible);

        setHorariosDisponibles(horarios);

        const serviciosSnap = await getDocs(collection(db, 'servicios'));
        const servicios = serviciosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setServiciosDisponibles(servicios);
      } catch (error) {
        console.error('Error al cargar horarios/servicios:', error);
        setMensaje('❌ Error al cargar datos. Intenta nuevamente.');
      }
    };

    cargarDatos();
  }, []);

  const reservarCita = async () => {
    if (!usuario || !seleccionado || !servicio || !metodoPago) {
      setMensaje('❗ Completa todos los campos obligatorios.');
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

      const msg = `👤 ${usuario.displayName || 'Cliente'} ha reservado: 💈 ${servicioData.nombre} (S/. ${servicioData.precio}) el 📅 ${seleccionado.fecha} a las 🕒 ${seleccionado.hora}. Pago: ${metodoPago}${aplica50 ? ' (50% pagado)' : ''}.`;
      const whatsappURL = `https://wa.me/+51907011564?text=${encodeURIComponent(msg)}`;
      window.open(whatsappURL, '_blank');

      navigate('/confirmacion');
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al reservar. Intenta nuevamente.');
    } finally {
      setReservando(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      {/* SEO */}
      <Helmet>
        <title>Reservar Cita | BarberYass</title>
        <meta name="description" content="Reserva tu cita exclusiva con BarberYass. Elige día, horario, servicio y método de pago." />
        <meta name="keywords" content="reserva barbería, cita barbera, BarberYass, servicios" />
        <meta name="author" content="BarberYass" />
      </Helmet>

      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img src={logo} alt="BarberYass" className="w-24 rounded-full" />
      </div>

      <h2 className="text-xl font-semibold text-center mb-4">Reserva tu cita</h2>

      {mensaje && (
        <div className={`text-sm mb-4 p-3 rounded ${mensaje.startsWith('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {mensaje}
        </div>
      )}

      {/* Horarios */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Horario disponible *</label>
        <select className="w-full p-2 border rounded" onChange={(e) => {
          const id = e.target.value;
          const horario = horariosDisponibles.find((h) => h.id === id);
          setSeleccionado(horario);
        }}>
          <option value="">Selecciona un horario</option>
          {horariosDisponibles.map((h) => (
            <option key={h.id} value={h.id}>{`${h.fecha} - ${h.hora}`}</option>
          ))}
        </select>
      </div>

      {/* Servicios */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Servicio *</label>
        <select className="w-full p-2 border rounded" value={servicio} onChange={(e) => setServicio(e.target.value)}>
          <option value="">Selecciona un servicio</option>
          {serviciosDisponibles.map((s) => (
            <option key={s.id} value={s.id}>{`${s.nombre} - S/. ${s.precio}`}</option>
          ))}
        </select>
      </div>

      {/* Método de pago */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Método de pago *</label>
        <select className="w-full p-2 border rounded" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
          <option value="">Selecciona una opción</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Yape">Yape</option>
          <option value="Plin">Plin</option>
        </select>
        {metodoPago === 'Yape' && (
          <img src={qrYape} alt="QR Yape" className="h-32 mt-2 mx-auto" />
        )}
      </div>

      {/* 50% adelantado */}
      <div className="mb-4 flex items-center gap-2">
        <input type="checkbox" checked={aplica50} onChange={(e) => setAplica50(e.target.checked)} />
        <label>¿Pagó el 50% por adelantado?</label>
      </div>

      {/* Comentario */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Comentario (opcional)</label>
        <textarea className="w-full p-2 border rounded" rows="2" value={comentario} onChange={(e) => setComentario(e.target.value)} />
      </div>

      {/* Referencia */}
      <div className="mb-6">
        <label className="block font-semibold mb-1">Referencia de pago (opcional)</label>
        <input type="text" className="w-full p-2 border rounded" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
      </div>

      {/* Botón */}
      <button
        onClick={reservarCita}
        disabled={reservando}
        className={`w-full py-3 rounded-lg font-semibold text-white transition ${
          reservando ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
        }`}
      >
        {reservando ? 'Reservando...' : 'Confirmar Reserva'}
      </button>
    </div>
  );
};

export default Reservar;
