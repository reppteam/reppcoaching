import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

interface Auth0SPAViewModelProps {
  children: React.ReactNode;
}

export const Auth0SPAViewModel: React.FC<Auth0SPAViewModelProps> = ({ children }) => {
 
  return (
    <Auth0Provider
      domain={"dev-8lo26de64qqp1i28.us.auth0.com"}
      clientId={"UplJIwoCM8CxUzwmUSefUhSD3Gbi6VR8"}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/auth/callback`,
      }}
      onRedirectCallback={(appState) => {
        // Handle redirect after successful authentication
        if (appState?.returnTo) {
          window.history.replaceState(
            {},
            document.title,
            appState.returnTo
          );
        }
      }}
    >
      {children}
    </Auth0Provider>
  );
}; 