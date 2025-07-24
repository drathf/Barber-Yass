// 📁 src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";

// Layouts
import Layout from "./components/Layout";
import AdminLayout from "./layouts/AdminLayout";

// Protecciones
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedRouteByRol from "./components/ProtectedRouteByRol";

// Páginas públicas
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/register";
import Galeria from "./pages/galeria";
import RecuperarPassword from "./pages/RecuperarPassword";

// Páginas privadas (usuarios autenticados)
import Perfil from "./pages/perfil";
import Reservar from "./pages/reservar";
import Confirmacion from "./pages/confirmacion";

// Panel administrativo
import AdminPanel from "./pages/adminpanel";
import AdminGestionUsuarios from "./components/AdminGestionUsuarios";
import AdminHorarios from "./components/AdminHorarios";
import AdminReservasManual from "./components/AdminReservaManual";
import AdminServicios from "./components/AdminServicios";

// Página 404
const NotFound = () => (
  <div className="min-h-screen flex flex-col justify-center items-center text-center p-10">
    <h1 className="text-5xl font-bold text-red-600 mb-2">404</h1>
    <p className="text-lg text-gray-700 mb-4">Página no encontrada</p>
    <Link to="/" className="text-blue-600 underline">Volver al inicio</Link>
  </div>
);

function App() {
  return (
    <Routes>
      {/* 🔓 Rutas públicas */}
      <Route path="/recuperar" element={<RecuperarPassword />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/galeria" element={<Galeria />} />

        {/* 🔐 Rutas privadas (usuarios autenticados) */}
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservar"
          element={
            <ProtectedRoute>
              <Reservar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/confirmacion"
          element={
            <ProtectedRoute>
              <Confirmacion />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 🔐 Rutas administrativas por rol */}
      <Route
        path="/admin"
        element={
          <ProtectedRouteByRol rolesPermitidos={["admin", "barberyass", "god"]}>
            <AdminLayout />
          </ProtectedRouteByRol>
        }
      >
        <Route index element={<AdminPanel />} />
        <Route path="usuarios" element={<AdminGestionUsuarios />} />
        <Route path="horarios" element={<AdminHorarios />} />
        <Route path="manual" element={<AdminReservasManual />} />
        <Route path="servicios" element={<AdminServicios />} />
      </Route>

      {/* ❌ Ruta no encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
