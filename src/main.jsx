// 📁 src/main.jsx
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Contexto y enrutamiento
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// HelmetProvider (para SEO y meta tags)
import { HelmetProvider } from "react-helmet-async";

// Loader global
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center text-purple-700 text-lg font-semibold">
    ⏳ Cargando aplicación...
  </div>
);

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ No se encontró el elemento con id='root'. Revisa tu index.html");
} else {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <AuthProvider>
        <HelmetProvider>
          <BrowserRouter basename="/">
            {/* Suspense mostrará Loader mientras carga la app */}
            <Suspense fallback={<Loader />}>
              <App />
            </Suspense>
          </BrowserRouter>
        </HelmetProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}
