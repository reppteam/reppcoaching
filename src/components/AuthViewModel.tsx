import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';

interface AuthViewModelProps {
  children: React.ReactNode;
}

export const AuthViewModel: React.FC<AuthViewModelProps> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
}; 