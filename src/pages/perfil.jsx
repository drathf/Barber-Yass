import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

function Perfil() {
  const { user } = useAuth();
  const [datosUsuario, setDatosUsuario] = useState({});
  const [reservas, setReservas] = useState([]);
  const [rol, setRol] = useState("");
  const navigate = useNavigate();

  const obtenerDatos = async () => {
    if (!user?.email) return;

    const ref = collection(db, "usuarios");
    const q = query(ref, where("correo", "==", user.email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      setDatosUsuario(data);
      setRol(data.rol || "");
    }
  };

  const obtenerReservas = async () => {
    if (!user?.email) return;

    const ref = collection(db, "reservas");
    const q = query(ref, where("correo", "==", user.email));
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReservas(data);
  };

  const activarPago = async () => {
    if (!user?.email) return;

    const ref = collection(db, "usuarios");
    const q = query(ref, where("correo", "==", user.email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docRef = doc(db, "usuarios", snapshot.docs[0].id);
      await updateDoc(docRef, { pago: true });
      alert("✅ Pago confirmado correctamente.");
      obtenerDatos();
    }
  };

  useEffect(() => {
    obtenerDatos();
    obtenerReservas();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">👤 Mi Perfil</h2>

      <div className="bg-white shadow-md rounded p-4 mb-6 space-y-2">
        <p><strong>Nombre:</strong> {datosUsuario.nombre}</p>
        <p><strong>Correo:</strong> {datosUsuario.correo}</p>
        <p><strong>Teléfono:</strong> {datosUsuario.telefono}</p>
        <p><strong>Dirección:</strong> {datosUsuario.direccion}</p>
        <p><strong>Rol:</strong> {rol}</p>
        <p>
          <strong>Pago confirmado:</strong>{" "}
          {datosUsuario.pago ? "✅ Sí" : "❌ No"}
        </p>

        {rol === "user" && (
          <div className="text-center mt-6 space-y-4">
            {!datosUsuario.pago && (
              <button
                onClick={activarPago}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Confirmar Pago 50%
              </button>
            )}

            <button
              onClick={() => navigate("/reservar")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 block mx-auto"
            >
              Reservar cita
            </button>
          </div>
        )}

        {rol === "vip" && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/reservar")}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Reservar cita VIP
            </button>
          </div>
        )}
      </div>

      {(rol === "user" || rol === "vip") && (
        <div className="bg-white shadow-md rounded p-4">
          <h3 className="text-xl font-semibold mb-2">📅 Mis Reservas</h3>
          {reservas.length === 0 ? (
            <p>No tienes reservas aún.</p>
          ) : (
            <ul className="space-y-2">
              {reservas.map((reserva) => (
                <li
                  key={reserva.id}
                  className="border-b border-gray-200 pb-2"
                >
                  <p><strong>Fecha:</strong> {reserva.fecha}</p>
                  <p><strong>Hora:</strong> {reserva.hora}</p>
                  <p><strong>Barbero:</strong> {reserva.barbero}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Perfil;
