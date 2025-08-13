import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { hasRole } from '../utils/roleUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { authState } = useAuth();
  if (authState.loading) return <div>Loading...</div>;
  if (!authState.user || !hasRole(authState.user, requiredRole)) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
}; 