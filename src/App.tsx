import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Router
import Router from './routes';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationProvider } from './contexts/NavigationContext';

// Auth Components
import { Auth0SPAViewModel } from './components/auth/Auth0SPAViewModel';
import { AuthViewModel } from './components/AuthViewModel';

// Apollo Client
import { ApolloViewModel } from './components/apollo/ApolloViewModel';

// Styles
import './styles/globals.css';

// Toast Notifications
import { Toaster } from './components/ui/sonner';

// ----------------------------------------------------------------------

export default function App() {
  // Handle URL parameters for OAuth callbacks
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state === 'outlook') {
      localStorage.setItem('outlook_code', code);
    }
  }, []);

  return (
    <Auth0SPAViewModel>
      <ApolloViewModel>
        <AuthViewModel>
          <NavigationProvider>
            <ThemeProvider>
              <BrowserRouter>
                <Router />
                <Toaster />
              </BrowserRouter>
            </ThemeProvider>
          </NavigationProvider>
        </AuthViewModel>
      </ApolloViewModel>
    </Auth0SPAViewModel>
  );
}