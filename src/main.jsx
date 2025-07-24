// 📁 src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ✅ Estilos globales (Tailwind)
import './index.css';

// ✅ Enrutamiento y contexto de autenticación global
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// ✅ Punto de montaje
const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error('❌ No se encontró el elemento raíz con id="root". Verifica tu index.html');
}
