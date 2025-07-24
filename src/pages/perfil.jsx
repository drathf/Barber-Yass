// Código optimizado como lo tienes estructurado, pero con mejoras estéticas y los nuevos botones incluidos.

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  doc, getDoc, updateDoc, collection, query, where, onSnapshot, deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import {
  getAuth,
  sendPasswordResetEmail,
  deleteUser as firebaseDeleteUser,
} from 'firebase/auth';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import logo from '../assets/galeria/logo.png';

const Perfil = () => {
  const { usuario, logout } = useAuth();
  const auth = getAuth();
  const navigate = useNavigate();

  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState({
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    nacimiento: '',
    comentario: '',
    foto: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [reservas, setReservas] = useState([]);
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [nacimientoGuardado, setNacimientoGuardado] = useState(false);
  const [dniGuardado, setDniGuardado] = useState(false);

  useEffect(() => {
    if (!usuario) return;

    const refUser = doc(db, 'usuarios', usuario.uid);
    const unsubUser = onSnapshot(refUser, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRol(data.rol || 'user');
        setNacimientoGuardado(!!data.nacimiento);
        setDniGuardado(!!data.dni);
        setPerfil({
          nombre: data.nombre || '',
          dni: data.dni || '',
          nacimiento: data.nacimiento || '',
          email: data.email || usuario.email,
          telefono: data.telefono || '',
          comentario: data.comentario || '',
          foto: data.foto || ''
        });
        setLoading(false);
      }
    });

    const qReservas = query(collection(db, 'reservas'), where('email', '==', usuario.email));
    const unsubReservas = onSnapshot(qReservas, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservas(lista);
    });

    return () => {
      unsubUser();
      unsubReservas();
    };
  }, [usuario]);

  const guardarCambios = async () => {
    try {
      const refDoc = doc(db, 'usuarios', usuario.uid);
      const updatedPerfil = { ...perfil };

      if (archivoFoto) {
        const storage = getStorage();
        const ref = storageRef(storage, `fotosPerfil/${usuario.uid}`);
        await uploadBytes(ref, archivoFoto);
        const url = await getDownloadURL(ref);
        updatedPerfil.foto = url;
      }

      const dataUpdate = {
        telefono: updatedPerfil.telefono,
        comentario: updatedPerfil.comentario,
        foto: updatedPerfil.foto || ''
      };

      if (!nacimientoGuardado && updatedPerfil.nacimiento) {
        dataUpdate.nacimiento = updatedPerfil.nacimiento;
      }

      if (!dniGuardado && updatedPerfil.dni) {
        dataUpdate.dni = updatedPerfil.dni;
      }

      await updateDoc(refDoc, dataUpdate);
      setMensaje('✅ Cambios guardados correctamente');
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al guardar cambios');
    }
  };

  const cambiarContrasena = async () => {
    try {
      await sendPasswordResetEmail(auth, usuario.email);
      setMensaje('📧 Se envió un enlace a tu correo para cambiar la contraseña.');
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al enviar correo de cambio de contraseña.');
    }
  };

  const cerrarSesion = async () => {
    await logout();
    navigate('/');
  };

  const eliminarCuenta = async () => {
    const confirm = window.confirm('⚠️ Esta acción eliminará tu cuenta y datos. ¿Estás seguro?');
    if (!confirm) return;

    try {
      const ref = doc(db, 'usuarios', usuario.uid);
      await deleteDoc(ref);

      const storage = getStorage();
      const fotoRef = storageRef(storage, `fotosPerfil/${usuario.uid}`);
      await deleteObject(fotoRef).catch(() => {}); // por si no hay foto

      const userAuth = auth.currentUser;
      await firebaseDeleteUser(userAuth);

      setMensaje('✅ Cuenta eliminada.');
      navigate('/');
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al eliminar la cuenta.');
    }
  };

  if (!usuario || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <Helmet>
        <title>Mi Perfil | BarberYass</title>
        <meta name="description" content="Gestiona tu perfil, actualiza tus datos y revisa tus reservas activas con BarberYass." />
      </Helmet>

      <motion.img src={logo} alt="Logo" className="w-20 mx-auto mb-4"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      />
      <h2 className="text-2xl font-bold text-center mb-4 text-purple-900">Hola, {perfil.nombre}</h2>
      {mensaje && <p className="text-center text-blue-600 mb-4">{mensaje}</p>}

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="text-center">
          {perfil.foto ? (
            <img src={perfil.foto} alt="Foto" className="w-28 h-28 rounded-full mx-auto object-cover border-2 border-black mb-2" />
          ) : (
            <div className="w-28 h-28 rounded-full mx-auto border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 mb-2">Sin foto</div>
          )}
          <input type="file" accept="image/*" onChange={(e) => setArchivoFoto(e.target.files[0])} className="block mx-auto text-sm" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
          <p><strong>Nombre:</strong> {perfil.nombre}</p>
          <input
            type="text"
            placeholder="DNI"
            disabled={dniGuardado}
            value={perfil.dni}
            onChange={(e) => setPerfil({ ...perfil, dni: e.target.value })}
            className="border p-2 rounded w-full sm:col-span-1"
          />
          <p><strong>Correo:</strong> {perfil.email}</p>
        </div>

        <input
          type="tel"
          placeholder="Teléfono"
          value={perfil.telefono}
          onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
          className="w-full border border-gray-300 p-2 rounded"
        />

        <input
          type="date"
          disabled={nacimientoGuardado}
          value={perfil.nacimiento}
          onChange={(e) => setPerfil({ ...perfil, nacimiento: e.target.value })}
          className="w-full border border-gray-300 p-2 rounded"
        />

        {(nacimientoGuardado || dniGuardado) && (
          <p className="text-xs text-gray-400 italic">* Los campos deshabilitados no pueden modificarse una vez guardados.</p>
        )}

        <textarea
          placeholder="Comentario personal"
          value={perfil.comentario}
          onChange={(e) => setPerfil({ ...perfil, comentario: e.target.value })}
          className="w-full border border-gray-300 p-2 rounded resize-none"
          rows={3}
        />

        <button onClick={guardarCambios} className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition">
          Guardar cambios
        </button>

        <button onClick={cambiarContrasena} className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
          Cambiar contraseña
        </button>

        <button onClick={cerrarSesion} className="w-full bg-gray-300 text-black py-2 rounded hover:bg-gray-400 transition mt-2">
          Cerrar sesión
        </button>

        <button onClick={eliminarCuenta} className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition mt-2">
          Eliminar cuenta
        </button>
      </div>

      {["admin", "god", "barberyass"].includes(rol) && (
        <div className="text-center my-6">
          <p className={`font-semibold ${rol === 'god' ? 'text-green-700' : 'text-indigo-600'}`}>
            {rol === 'god' ? '🔥 Acceso total como GOD' : '🔧 Eres administrador del sistema'}
          </p>
          <Link to="/admin" className="mt-3 inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">
            Ir al Panel Admin
          </Link>
        </div>
      )}

      <h3 className="text-xl font-semibold mt-10 mb-4">📅 Historial de Reservas</h3>

      {reservas.length === 0 ? (
        <p className="text-gray-500">No tienes reservas registradas.</p>
      ) : (
        <ul className="space-y-4">
          {reservas.map((reserva) => (
            <li key={reserva.id} className="p-4 border rounded bg-white shadow flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="text-sm text-gray-700">
                <p className="font-medium">
                  {new Date(`${reserva.fecha}T${reserva.hora}`).toLocaleString('es-PE', {
                    weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                <p className="text-xs text-gray-500">Servicio: {reserva.servicio}</p>
              </div>
              <span className={`text-xs mt-2 md:mt-0 px-3 py-1 rounded-full font-medium ${
                reserva.estado === 'cancelada' ? 'bg-red-100 text-red-600' :
                reserva.estado === 'finalizada' ? 'bg-gray-200 text-gray-700' :
                'bg-green-100 text-green-700'
              }`}>
                {reserva.estado}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Perfil;
