import React, { useCallback, useEffect, useRef } from "react";
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";

import { setContext } from "@apollo/client/link/context";
import { useAuth0 } from "@auth0/auth0-react";
import { EIGHT_BASE } from "../../config-global";
import { getMainDefinition } from "@apollo/client/utilities";
// import { WebSocketLink } from "@apollo/client/link/ws";
import { WebSocketLink } from "@apollo/client/link/ws";
import { onError } from "@apollo/client/link/error";

interface ApolloViewModelProps {
  children: React.ReactNode;
}

const defaultOptions = {
  watchQuery: {
    // fetchPolicy: "no-cache",
    fetchPolicy: "cache-and-network" as const,
    // fetchPolicy: "network-only",
    errorPolicy: "all" as const,
  },
  query: {
    fetchPolicy: "network-only" as const,
    errorPolicy: "all" as const,
  },
  mutation: {
    errorPolicy: "all" as const,
  },
};

const ApolloViewModel: React.FC<ApolloViewModelProps> = ({ children }) => {
  const { isAuthenticated, getIdTokenClaims } = useAuth0();
  const client = useRef<ApolloClient<any> | null>(null);
  
  const getToken = useCallback(async (): Promise<string | null> => {
    let token: string | null = null;
    if (isAuthenticated) {
      const claim = await getIdTokenClaims();
      if (claim) {
        token = claim.__raw;
      }
    } else {
      token = localStorage.getItem("accessToken");
    }

    return token;
  }, [getIdTokenClaims, isAuthenticated]);

  const customToken = window.location.pathname.includes("careers")
    ? EIGHT_BASE.apiToken
    : localStorage.getItem("accessToken");
    
  const httpLink = createHttpLink({
    uri: EIGHT_BASE.apiEndpoint,
    headers: {
      Authorization: `Bearer ${customToken}`,
    },
  });

  const authLink = setContext(async (_, { headers, ...rest }) => {
    // Use 8base API token for now until Auth0 is properly configured
    const token = EIGHT_BASE.apiToken;
    console.log('Using 8base API token for GraphQL requests');

    return {
      ...rest,
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    };
  });

  const errorHandle = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map((item) => {
        console.error('GraphQL Error:', item);
        if (item.message === "Token expired") {
          return window.location.reload();
        }
      });
    }
    if (networkError) {
      console.error('Network Error:', networkError);
    }
  });

  const wsLink = new WebSocketLink({
    uri: "wss://ws.8base.com",
    options: {
      connectionParams: async () => ({
        workspaceId: EIGHT_BASE.workspaceId,
        environmentName: EIGHT_BASE.environmentName,
        token: EIGHT_BASE.apiToken,
      }),
      connectionCallback: async (errors: any) => {
        if (errors) {
          console.log(`Webscoket error:`, errors);
          throw new Error("Invalid message type!");
        }
        setInterval(() => {
          // Keep-alive functionality removed due to private API access
        }, 60000); // Send a keep-alive message every minute  * 5
      },
      reconnect: true,
      reconnectionAttempts: 5,
      lazy: true,
      // inactivityTimeout: 60 * 1000,
    },
    webSocketImpl: class WebSocketWithoutProtocol extends WebSocket {
      constructor(url: string) {
        super(url); // ignore protocol
      }
    },
  });

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );

  client.current = new ApolloClient({
    link: ApolloLink.from([errorHandle, authLink, splitLink]),
    cache: new InMemoryCache(),
    connectToDevTools: process.env.REACT_APP_ENV === "local",
    defaultOptions,
  });

  return <ApolloProvider client={client.current}>{children}</ApolloProvider>;
};

export { ApolloViewModel }; 