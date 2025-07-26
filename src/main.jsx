import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { HelmetProvider } from "react-helmet-async";

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
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<Loader />}>
              <App />
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
}
