import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthContext } from "../contexts/AuthContext";
import { getDashboardRoute } from "../utils/roleUtils";
import LoadingScreen from "./LoadingScreen";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isInitialized, user } = useAuthContext();
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  const { pathname } = useLocation();
  const [requestedLocation, setRequestedLocation] = useState<string | null>(null);

  // Redirect to Auth0's universal login if not authenticated
  useEffect(() => {
    if (!isLoading && isInitialized && !isAuthenticated) {
      if (pathname !== requestedLocation) {
        setRequestedLocation(pathname);
      }
      loginWithRedirect({
        appState: { returnTo: pathname }
      });
    }
  }, [isLoading, isInitialized, isAuthenticated, loginWithRedirect, pathname, requestedLocation]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  // Role-based routing for authenticated users
  if (user && pathname === '/') {
    const dashboardRoute = getDashboardRoute(user);
    return <Navigate to={dashboardRoute} replace />;
  }

  // If authenticated but no user data, redirect to root to trigger login flow
  if (isAuthenticated && !user && isInitialized) {
    return <Navigate to="/" replace />;
  }

  if (requestedLocation && pathname !== requestedLocation) {
    setRequestedLocation(null);
    return <Navigate to={requestedLocation} />;
  }

  return <>{children}</>;
}; 