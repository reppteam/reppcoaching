import React, {
  createContext,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useApolloClient } from "@apollo/client";
import { GET_8BASE_USER_BY_EMAIL, CREATE_8BASE_USER } from "../graphql/8baseUser";
import { setSession } from "../utils/authUtils";
import { setApolloClient } from "../services/8baseService";

// ----------------------------------------------------------------------

interface User {
  id: string;
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  origin?: string;
  status?: string;
  roles?: any[];
  createdAt: string;
  updatedAt: string;
  access_token_data?: {
    outlook_access_token?: string;
    outlook_refresh_token?: string;
    google_access_token?: string;
    google_refresh_token?: string;
    sms_access_token?: string;
    sms_refresh_token?: string;
    sms_user_data?: any;
  };
}

interface AuthState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

interface AuthContextType extends AuthState {
  method: string;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  authorize: () => Promise<void>;
}

const initialState: AuthState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

type AuthAction =
  | { type: "INITIAL"; payload: { isAuthenticated: boolean; user: User | null } }
  | { type: "LOGIN"; payload: { user: User } }
  | { type: "LOGOUT" }
  | { type: "AUTHORIZE"; payload: { isAuthenticated: boolean; user: User } };

const reducer = (state: AuthState, action: AuthAction): AuthState => {
  if (action.type === "INITIAL") {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }
  if (action.type === "LOGIN") {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === "LOGOUT") {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  }
  if (action.type === "AUTHORIZE") {
    return {
      ...state,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }

  return state;
};

// ----------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | null>(null);

// ----------------------------------------------------------------------

export const extractUser = (x: any): User => {
  const user: User = {
    id: x.id,
    avatarUrl: x?.avatar?.downloadUrl,
    firstName: x.firstName,
    lastName: x.lastName,
    name: `${x.firstName} ${x.lastName}`,
    email: x.email,
    origin: x.origin,
    status: x.status,
    roles: x.roles?.items,
    createdAt: x.createdAt,
    updatedAt: x.updatedAt,
    access_token_data: x.access_token_data,
  };

  return user;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const apolloClient = useApolloClient();
  const {
    loginWithRedirect,
    isAuthenticated,
    getIdTokenClaims,
    logout: Auth0Logout,
    user: auth0User,
  } = useAuth0();

  const getUser = useCallback(async () => {
    try {
      if (!auth0User?.email) {
        console.error("No Auth0 user email available");
        return null;
      }
      // Query 8base for user by email
      const { data, error } = await apolloClient.query({
        query: GET_8BASE_USER_BY_EMAIL,
        variables: { email: auth0User.email },
        errorPolicy: "all",
      });

      if (error) {
        console.error("Error fetching user:", error);
        return null;
      }

      if (!data) {
        console.error("No data returned from GraphQL query");
        return null;
      }

      const users = data.usersList?.items;

      if (!users || users.length === 0) {
        console.log("Creating new user in 8base...");

        // Try to create a new user in 8base
        try {
          const { data: createData } = await apolloClient.mutate({
            mutation: CREATE_8BASE_USER,
            variables: {
              input: {
                email: auth0User.email,
                firstName: auth0User.given_name || auth0User.name?.split(' ')[0] || 'User',
                lastName: auth0User.family_name || auth0User.name?.split(' ').slice(1).join(' ') || 'Name',
                roles: {
                  connect: [{ name: "Student" }] // Default to Student role
                }
              }
            }
          });

          if (createData?.userCreate) {
            console.log("Created new user:", createData.userCreate);
            return extractUser(createData.userCreate);
          }
        } catch (createError) {
          console.error("Error creating user:", createError);
        }

        return null;
      }

      const extractedUser = extractUser(users[0]);
      return extractedUser;
    } catch (error) {
      console.error("Error in getUser:", error);
      return null;
    }
  }, [apolloClient, auth0User]);

  // Set the Apollo Client in 8baseService when it's available
  useEffect(() => {
    if (apolloClient) {
      setApolloClient(apolloClient);
    }
  }, [apolloClient]);

  const initialize = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const user = await getUser();
        // Only set initialized if we successfully got user data
        if (user) {
          dispatch({
            type: "INITIAL",
            payload: {
              isAuthenticated: true,
              user,
            },
          });
        } else {
          // If no user found, keep not initialized so AuthGuard can handle it
          console.log('AuthContext: No user found, keeping not initialized');
          dispatch({
            type: "INITIAL",
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } else {
        dispatch({
          type: "INITIAL",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (error) {
      console.error("Error in initialize:", error);
      dispatch({
        type: "INITIAL",
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  }, [getUser, isAuthenticated, auth0User]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Retry mechanism for when user data is not immediately available
  useEffect(() => {
    if (isAuthenticated && !state.user && state.isInitialized) {

      const retryTimer = setTimeout(() => {
        initialize();
      }, 2000); // Retry after 2 seconds

      return () => clearTimeout(retryTimer);
    }
  }, [isAuthenticated, state.user, state.isInitialized, initialize]);

  // LOGIN
  const login = useCallback(async () => {
    await loginWithRedirect();
  }, [loginWithRedirect]);

  // AUTHORIZE THROUGH SPA
  const authorize = useCallback(async () => {
    try {
      const claim = await getIdTokenClaims();
      if (!claim) {
        console.error('No ID token claims available');
        return;
      }
      const accessToken = claim.__raw;
      setSession(accessToken);

      if (isAuthenticated) {
        const user = await getUser();
        if (user && user.access_token_data) {
          localStorage.setItem("user", JSON.stringify(user));

          if (user.access_token_data.outlook_access_token) {
            localStorage.setItem("outlook_access_token", user.access_token_data.outlook_access_token);
          }
          if (user.access_token_data.outlook_refresh_token) {
            localStorage.setItem("outlook_refresh_token", user.access_token_data.outlook_refresh_token);
          }
          if (user.access_token_data.google_access_token) {
            localStorage.setItem("google_access_token", user.access_token_data.google_access_token);
          }
          if (user.access_token_data.google_refresh_token) {
            localStorage.setItem("google_refresh_token", user.access_token_data.google_refresh_token);
          }
          if (user.access_token_data.sms_access_token) {
            localStorage.setItem("ring_central_token", user.access_token_data.sms_access_token);
          }
          if (user.access_token_data.sms_refresh_token) {
            localStorage.setItem("ring_central_refresh_token", user.access_token_data.sms_refresh_token);
          }
          if (user.access_token_data.sms_user_data) {
            localStorage.setItem("ring_central_user_data", JSON.stringify(user.access_token_data.sms_user_data));
          }
        }

        dispatch({
          type: "AUTHORIZE",
          payload: {
            isAuthenticated: true,
            user: user!,
          },
        });
      }
    } catch (error) {
      console.error("Error in authorize:", error);
    }
  }, [getIdTokenClaims, getUser, isAuthenticated]);

  // LOGOUT
  const logout = useCallback(async () => {
    await Auth0Logout();
  }, [Auth0Logout]);

  const memoizedValue = useMemo(
    () => ({
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      method: "auth0",
      login,
      logout,
      authorize,
    }),
    [
      state.isInitialized,
      state.isAuthenticated,
      state.user,
      login,
      logout,
      authorize,
    ]
  );

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};