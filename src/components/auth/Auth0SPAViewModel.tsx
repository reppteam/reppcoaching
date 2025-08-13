import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

import { EIGHT_BASE } from '../../config-global';

interface Auth0SPAViewModelProps {
  children: React.ReactNode;
}

export const Auth0SPAViewModel: React.FC<Auth0SPAViewModelProps> = ({ children }) => {
  console.log('Auth0SPAViewModel Config:', {
    domain: EIGHT_BASE.auth0Domain,
    clientId: EIGHT_BASE.auth0SpaClientId,
    redirect_uri: `http://localhost:3000/auth/callback`,
  });

  return (
    <Auth0Provider
      domain={"dev-8lo26de64qqp1i28.us.auth0.com"}
      clientId={"UplJIwoCM8CxUzwmUSefUhSD3Gbi6VR8"}
      authorizationParams={{
        redirect_uri: `http://localhost:3000/auth/callback`,
      }}
      onRedirectCallback={(appState) => {
        console.log('Auth0 Redirect Callback:', appState);
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