import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  // 1. If not logged in at all, kick to home/login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. If logged in but WRONG role, kick to their own dashboard
  if (!allowedRoles.includes(user.role)) {
    // Redirect based on their ACTUAL role
    if (user.role === 'CITIZEN') return <Navigate to="/dashboard" replace />;
    if (user.role === 'OFFICER') return <Navigate to="/officer-dashboard" replace />;
    
    // --- ADDED THIS LINE ---
    if (user.role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;

    // Fallback for unknown roles
    return <Navigate to="/" replace />;
  }

  // 3. If passed checks, render the Child Route
  return <Outlet />;
};

export default ProtectedRoute;