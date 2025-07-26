// 📁 src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Contexto y enrutamiento
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// HelmetProvider
import { HelmetProvider } from 'react-helmet-async';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ No se encontró el elemento con id="root". Revisa tu index.html');
} else {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
