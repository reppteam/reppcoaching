import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthContext } from "../contexts/AuthContext";
import LoadingScreen from "./LoadingScreen";

interface GuestGuardProps {
  children: React.ReactNode;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { isInitialized, user } = useAuthContext();
  const { isAuthenticated, isLoading } = useAuth0();

  const { pathname } = useLocation();
  const [requestedLocation, setRequestedLocation] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && !user) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && user) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return <Navigate to="/dashboard" />;
  }

  if (requestedLocation && pathname !== requestedLocation) {
    setRequestedLocation(null);
    return <Navigate to={requestedLocation} />;
  }

  return <>{children}</>;
}; 