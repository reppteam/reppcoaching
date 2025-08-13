import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { client, authClient } from './8baseClient';
import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from '@8base/react-auth';
import { Auth0SPAViewModel } from './components/auth/Auth0SPAViewModel';
import { AuthViewModel } from './components/auth/AuthViewModel';
import { ApolloViewModel } from './components/apollo';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Create a subscribable wrapper for the auth client
const subscribableAuthClient = {
  ...authClient,
  subscribe: (callback: any) => {
    // Simple subscription implementation
    return () => {}; // Return unsubscribe function
  },
  notify: (data: any) => {
    // Notify subscribers
  },
  batch: (updates: any) => {
    // Batch updates
  },
  getState: authClient.getState.bind(authClient),
  setState: authClient.setState.bind(authClient),
  purgeState: authClient.purgeState.bind(authClient),
  checkIsAuthorized: authClient.checkIsAuthorized.bind(authClient)
};

  root.render(
    <Auth0SPAViewModel>
    <ApolloViewModel>
      <AuthViewModel>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </AuthViewModel>
    </ApolloViewModel>
  </Auth0SPAViewModel>
  );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
