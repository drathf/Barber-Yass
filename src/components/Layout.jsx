// src/layouts/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

import wsIcon from "../assets/galeria/ws-white.svg";
import igIcon from "../assets/galeria/ig-white.svg";
import gmailIcon from "../assets/galeria/gmail-white.svg";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Navbar fijo */}
      <header className="shadow-md fixed w-full z-50 bg-white">
        <Navbar />
      </header>

      {/* Contenido principal */}
      <main className="pt-20 flex-1 px-4 md:px-10 lg:px-20">
        <Outlet />
      </main>

      {/* Footer con enlaces y contacto */}
      <footer className="bg-black text-white py-6 mt-10 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
          {/* Derechos reservados */}
          <div className="text-center md:text-left">
            <p className="text-sm">© {new Date().getFullYear()} BarberYass</p>
            <p className="text-xs text-gray-400">Todos los derechos reservados.</p>
          </div>

          {/* Íconos + botón WhatsApp */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex gap-4">
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

            <a
              href="https://wa.me/51907011564"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-full shadow-md transition mt-3 sm:mt-0"
            >
              💬 Contáctanos por WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
