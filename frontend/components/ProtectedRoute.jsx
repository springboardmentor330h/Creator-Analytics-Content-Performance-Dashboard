// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ user }) {
  const token = localStorage.getItem('token');

  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}