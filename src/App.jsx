// 📁 src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import Layout from "./components/Layout";
import AdminLayout from "./layouts/AdminLayout";

// Protecciones
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedRouteByRol from "./components/ProtectedRouteByRol";

// Páginas públicas
import Home from "./pages/Home";
import Login from "./pages/login";
import RecuperarPassword from "./pages/RecuperarPassword";
import Register from "./pages/register";
import Galeria from "./pages/galeria";

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

// Página de error 404
const NotFound = () => (
  <div className="min-h-screen flex flex-col justify-center items-center text-center p-10">
    <h1 className="text-5xl font-bold text-red-600 mb-2">404</h1>
    <p className="text-lg text-gray-700 mb-4">Página no encontrada</p>
    <a href="/" className="text-blue-600 underline">Volver al inicio</a>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Rutas públicas y de usuarios */}
      <Route path="/recuperar" element={<RecuperarPassword />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/galeria" element={<Galeria />} />

        {/* Rutas privadas (requieren login) */}
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

      {/* Rutas administrativas protegidas por rol */}
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

      {/* Página de error si no coincide ninguna ruta */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
