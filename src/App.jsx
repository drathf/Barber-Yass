// 📁 src/App.jsx
import React from "react";
import { Routes, Route, Link, Outlet } from "react-router-dom";

// 🔐 Protecciones
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedRouteByRol from "./components/ProtectedRouteByRol";

// 🌐 Páginas públicas
import Home from "./pages/Home";
import Galeria from "./pages/galeria";
import RecuperarPassword from "./pages/RecuperarPassword";
import Servicios from "./pages/Servicios";
import Perfil from "./pages/perfil";
import Reservar from "./pages/reservar";
import Confirmacion from "./pages/confirmacion";

// 🛠️ Panel administrativo
import AdminPanel from "./pages/adminpanel";
import AdminGestionUsuarios from "./pages/AdminGestionUsuarios";
import AdminHorarios from "./pages/AdminHorarios";
import AdminReservaManual from "./pages/AdminReservaManual";
import AdminServicios from "./pages/AdminServicios";

// 📦 Componentes
import Navbar from "./components/Navbar";

// 🔗 Íconos footer
import wsIcon from "./assets/galeria/ws-white.svg";
import igIcon from "./assets/galeria/ig-white.svg";
import gmailIcon from "./assets/galeria/gmail-white.svg";

// ❌ Página 404
const NotFound = () => (
  <div className="min-h-screen flex flex-col justify-center items-center text-center p-10">
    <h1 className="text-5xl font-bold text-red-600 mb-2">404</h1>
    <p className="text-lg text-gray-700 mb-4">Página no encontrada</p>
    <Link to="/" className="text-blue-600 underline">
      Volver al inicio
    </Link>
  </div>
);

// 📦 Layout global (Navbar + Footer)
const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Navbar */}
      <header className="fixed w-full z-50">
        <Navbar />
      </header>

      {/* Contenido principal */}
      <main className="pt-20 flex-1 px-4 md:px-10 lg:px-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-6 mt-10 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm">
              © {new Date().getFullYear()} Lugo Studio | BarberYass
            </p>
            <p className="text-xs text-gray-400">Todos los derechos reservados.</p>
          </div>
          <div className="flex gap-4 items-center">
            <a
              href="https://wa.me/51907011564"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="hover:scale-110 transition-transform drop-shadow-md"
            >
              <img src={wsIcon} alt="WhatsApp" className="w-6 h-6" />
            </a>
            <a
              href="https://www.instagram.com/barberyass47/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:scale-110 transition-transform drop-shadow-md"
            >
              <img src={igIcon} alt="Instagram" className="w-6 h-6" />
            </a>
            <a
              href="mailto:barberyass@gmail.com"
              aria-label="Correo electrónico"
              className="hover:scale-110 transition-transform drop-shadow-md"
            >
              <img src={gmailIcon} alt="Gmail" className="w-6 h-6" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* 🔓 Rutas públicas */}
      <Route path="/recuperar" element={<RecuperarPassword />} />

      {/* Layout global */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/perfil" element={<Perfil />} />

        {/* Rutas protegidas */}
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

        {/* Panel admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRouteByRol rolesPermitidos={["god", "admin", "barberyass"]}>
              <Outlet />
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

      {/* Ruta no encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
