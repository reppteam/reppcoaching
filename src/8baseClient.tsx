import { AuthProvider, AuthContext, type AuthContextProps } from '@8base/react-auth';
import { WebAuth0AuthClient } from '@8base/web-auth0-auth-client';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const authClient = new WebAuth0AuthClient({
  domain: process.env.REACT_APP_AUTH0_DOMAIN!,
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID!,
  redirectUri: `${window.location.origin}/auth/callback`,
  logoutRedirectUri: `${window.location.origin}/auth`,
});

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_8BASE_API_URL,
});

const authLink = setContext(async (_, { headers }) => {
  const { idToken } = await authClient.getState() || {};
  return {
    headers: {
      ...headers,
      authorization: idToken ? `Bearer ${idToken}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export { AuthProvider, AuthContext, authClient, client, ApolloProvider };