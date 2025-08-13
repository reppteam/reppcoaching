import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

import { EIGHT_BASE } from '../config-global';

interface Auth0SPAViewModelProps {
  children: React.ReactNode;
}

export const Auth0SPAViewModel: React.FC<Auth0SPAViewModelProps> = ({ children }) => {
  if (!EIGHT_BASE.auth0Domain || !EIGHT_BASE.auth0SpaClientId) {
    console.error('Auth0 configuration missing. Please check your .env file.');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Configuration Error</h2>
          <p className="text-muted-foreground">
            Auth0 configuration is missing. Please check your .env file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={EIGHT_BASE.auth0Domain}
      clientId={EIGHT_BASE.auth0SpaClientId}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/auth/callback`,
      }}
    >
      {children}
    </Auth0Provider>
  );
}; 