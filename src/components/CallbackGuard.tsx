import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthContext } from "../contexts/AuthContext";
import LoadingScreen from "./LoadingScreen";

interface CallbackGuardProps {
  children: React.ReactNode;
}

export const CallbackGuard: React.FC<CallbackGuardProps> = ({ children }) => {
  const { isInitialized } = useAuthContext();
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}; 