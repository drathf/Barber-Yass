import React from "react";
import { Routes, Route, Link } from "react-router-dom";

// Layouts
import Layout from "./components/Layout";
import AdminLayout from "./layouts/AdminLayout";

// Protecciones
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedRouteByRol from "./components/ProtectedRouteByRol";

// Páginas
import Home from "./pages/Home";
import Galeria from "./pages/galeria";
import RecuperarPassword from "./pages/RecuperarPassword";
import Servicios from "./pages/Servicios";
import Perfil from "./pages/perfil";
import Reservar from "./pages/reservar";
import Confirmacion from "./pages/confirmacion";

// Panel Admin
import AdminPanel from "./pages/adminpanel";
import AdminGestionUsuarios from "./pages/AdminGestionUsuarios";
import AdminHorarios from "./pages/AdminHorarios";
import AdminReservaManual from "./pages/AdminReservaManual";
import AdminServicios from "./pages/AdminServicios";

const NotFound = () => (
  <div className="min-h-screen flex flex-col justify-center items-center text-center p-10">
    <h1 className="text-5xl font-bold text-red-600 mb-2">404</h1>
    <p className="text-lg text-gray-700 mb-4">Página no encontrada</p>
    <Link to="/" className="text-blue-600 underline">
      Volver al inicio
    </Link>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/recuperar" element={<RecuperarPassword />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/perfil" element={<Perfil />} />

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

        {/* Panel Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRouteByRol rolesPermitidos={["god", "admin", "barberyass"]}>
              <AdminLayout />
            </ProtectedRouteByRol>
          }
        >
          <Route index element={<AdminPanel />} />
          <Route path="usuarios" element={<AdminGestionUsuarios />} />
          <Route path="horarios" element={<AdminHorarios />} />
          <Route path="manual" element={<AdminReservaManual />} />
          <Route path="servicios" element={<AdminServicios />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
