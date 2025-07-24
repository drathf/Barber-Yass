// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas que solo usuarios autenticados pueden ver.
 * Redirige a /login si no hay usuario autenticado.
 */
const ProtectedRoute = ({ children }) => {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
