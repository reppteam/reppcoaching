import React from 'react';
import { AuthProvider } from '../auth/Auth0Context';

interface AuthViewModelProps {
  children: React.ReactNode;
}

export const AuthViewModel: React.FC<AuthViewModelProps> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
}; 