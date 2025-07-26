import React, { useEffect, useState } from "react";
import {
  collection,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/galeria/logo.png";

export default function AdminGestionUsuarios() {
  const { rol } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [rolPendiente, setRolPendiente] = useState({});

  // Datos de nuevo usuario
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "user",
  });

  // Cargar usuarios
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "usuarios"), (snap) => {
      setUsuarios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Proteger acceso
  if (!["god", "admin", "barberyass"].includes(rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        🚫 Acceso denegado
      </div>
    );
  }

  // Crear usuario (Cloud Function)
  const crearUsuario = async (e) => {
    e.preventDefault();
    if (!nuevoUsuario.email || !nuevoUsuario.password || !nuevoUsuario.nombre) {
      return setMensaje("⚠️ Todos los campos son obligatorios");
    }

    try {
      const createUserByAdmin = httpsCallable(functions, "createUserByAdmin");
      const result = await createUserByAdmin(nuevoUsuario);
      setMensaje(`✅ Usuario creado (${result.data.rol})`);
      setNuevoUsuario({ nombre: "", email: "", password: "", rol: "user" });
    } catch (error) {
      setMensaje("❌ Error: " + error.message);
    }
  };

  // Guardar cambios de rol
  const guardarCambiosRol = async (id, nuevoRol, rolActualUsuario) => {
    // Validaciones
    if (rolActualUsuario === "god" && rol !== "god") {
      return setMensaje("❌ No puedes cambiar el rol de un usuario GOD");
    }
    if (nuevoRol === "god" && rol !== "god") {
      return setMensaje("❌ No puedes asignar rol GOD");
    }

    await updateDoc(doc(db, "usuarios", id), { rol: nuevoRol });
    setMensaje("✅ Rol actualizado correctamente");
    setRolPendiente((prev) => {
      const nuevo = { ...prev };
      delete nuevo[id];
      return nuevo;
    });
  };

  // Cambiar estado del 50% adelantado
  const cambiarRequierePago = async (usuario) => {
    // Solo god, admin y barberyass pueden modificar
    if (!["god", "admin", "barberyass"].includes(rol)) return;

    // Nadie puede modificar usuarios god, salvo otro god
    if (usuario.rol === "god" && rol !== "god") {
      return setMensaje("❌ No puedes modificar el estado de un usuario GOD");
    }

    await updateDoc(doc(db, "usuarios", usuario.id), {
      requierePago: !usuario.requierePago,
    });

    setMensaje(
      !usuario.requierePago
        ? "⚠️ Ahora este usuario debe pagar 50% para reservar"
        : "✅ El usuario ya puede reservar sin adelanto"
    );
  };

  // Eliminar usuario
  const eliminarUsuario = async (id, usuarioRol) => {
    if (usuarioRol === "god" && rol !== "god") {
      return setMensaje("❌ No puedes eliminar un usuario GOD");
    }
    if (!window.confirm("¿Seguro de eliminar este usuario?")) return;
    await deleteDoc(doc(db, "usuarios", id));
    setMensaje("✅ Usuario eliminado");
  };

  return (
    <div className="min-h-screen p-6">
      <img src={logo} alt="Logo" className="w-20 mb-4" />
      <h2 className="text-2xl font-bold mb-4">👥 Gestión de Usuarios</h2>
      {mensaje && <p className="mb-2 text-green-600">{mensaje}</p>}

      {/* Formulario crear usuario */}
      <form
        onSubmit={crearUsuario}
        className="bg-white shadow p-4 rounded mb-6 grid grid-cols-1 md:grid-cols-5 gap-3"
      >
        <input
          type="text"
          placeholder="Nombre"
          value={nuevoUsuario.nombre}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
          }
          className="border rounded p-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={nuevoUsuario.email}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })
          }
          className="border rounded p-2"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={nuevoUsuario.password}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
          }
          className="border rounded p-2"
        />
        <select
          value={nuevoUsuario.rol}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })
          }
          className="border rounded p-2"
        >
          <option value="user">👤 user</option>
          <option value="vip">💎 vip</option>
          <option value="admin">⭐ admin</option>
          <option value="barberyass">⭐ barberyass</option>
          {rol === "god" && <option value="god">👑 god</option>}
        </select>
        <button
          type="submit"
          className="col-span-1 md:col-span-5 bg-purple-600 hover:bg-purple-700 text-white rounded py-2"
        >
          ➕ Crear Usuario
        </button>
      </form>

      {/* Tabla usuarios */}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm bg-white shadow rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Nombre</th>
              <th className="p-2">Email</th>
              <th className="p-2">Rol</th>
              <th className="p-2 text-center">50% Adelanto</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.nombre}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={rolPendiente[u.id] ?? u.rol}
                      onChange={(e) =>
                        setRolPendiente({
                          ...rolPendiente,
                          [u.id]: e.target.value,
                        })
                      }
                      className="border rounded"
                      disabled={u.rol === "god" && rol !== "god"}
                    >
                      <option value="user">👤 user</option>
                      <option value="vip">💎 vip</option>
                      <option value="admin">⭐ admin</option>
                      <option value="barberyass">⭐ barberyass</option>
                      {rol === "god" && <option value="god">👑 god</option>}
                    </select>

                    {/* Botón guardar cambios */}
                    {rolPendiente[u.id] && rolPendiente[u.id] !== u.rol && (
                      <button
                        onClick={() =>
                          guardarCambiosRol(u.id, rolPendiente[u.id], u.rol)
                        }
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Guardar cambios
                      </button>
                    )}
                  </div>
                </td>

                {/* Casilla del 50% adelantado */}
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={u.requierePago}
                    onChange={() => cambiarRequierePago(u)}
                    disabled={!["god", "admin", "barberyass"].includes(rol)}
                    className="w-5 h-5 accent-purple-600"
                  />
                </td>

                <td className="p-2">
                  <button
                    onClick={() => eliminarUsuario(u.id, u.rol)}
                    className="text-red-600 hover:underline"
                    disabled={u.rol === "god" && rol !== "god"}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-3 text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
    