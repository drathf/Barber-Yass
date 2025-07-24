// ✅ reservar.jsx actualizado
// ... [importaciones se mantienen iguales]

const Reservar = () => {
  const { usuario, rol } = useAuth();
  const navigate = useNavigate();

  // ... [useState se mantiene igual]

  useEffect(() => {
    // ... [mismo código de cargar horarios y servicios]
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

      // ✅ Mensaje de confirmación con nombre en vez de email
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

  // ... [resto del componente se mantiene igual]

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      {/* SEO y LOGO */}
      <Helmet>
        <title>Reservar Cita | BarberYass</title>
        <meta name="description" content="Reserva tu cita exclusiva con BarberYass. Elige día, horario, servicio y método de pago." />
        <meta name="keywords" content="reserva barbería, cita barbera, BarberYass, servicios" />
        <meta name="author" content="BarberYass" />
      </Helmet>

      {/* ... logo y contenido inicial igual */}

      {/* Método de pago (editado sin tarjeta) */}
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

      {/* ... resto igual */}
    </div>
  );
};

export default Reservar;
