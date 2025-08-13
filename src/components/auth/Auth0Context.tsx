import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
// config
import { useApolloClient, gql } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import { setSession } from "./utils";
import { CURRENT_USER_QUERY } from "../../graphql";
import { auth0UserService, Auth0User } from "../../services/auth0UserService";
import { User as AppUser } from "../../types";

// ----------------------------------------------------------------------

interface User {
  id: string;
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  origin: string;
  status: string;
  roles: any[];
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
  // App-specific user data
  appUser?: AppUser;
}

interface AuthState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

interface AuthContextType {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
  method: string;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  authorize: () => Promise<void>;
}

type AuthAction =
  | {
      type: "INITIAL";
      payload: { isAuthenticated: boolean; user: User | null };
    }
  | { type: "LOGIN"; payload: { user: User } }
  | { type: "LOGOUT" }
  | { type: "AUTHORIZE"; payload: { isAuthenticated: boolean; user: User } };

interface AuthProviderProps {
  children: ReactNode;
}

// ----------------------------------------------------------------------

const initialState: AuthState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

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

  return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext<AuthContextType | null>(null);

// ----------------------------------------------------------------------

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const apolloClient = useApolloClient();
  const {
    loginWithRedirect,
    isAuthenticated,
    getIdTokenClaims,
    logout: Auth0Logout,
  } = useAuth0();

  const getUser = useCallback(async (): Promise<User> => {
    try {
      // Get Auth0 user data
      const { data, error } = await apolloClient.query({
        query: gql`${CURRENT_USER_QUERY}`,
        errorPolicy: "all",
      });

      const { user } = data;
      const auth0UserData = extractUser(user);

      // Handle Auth0 user with our service
      const auth0User: Auth0User = {
        sub: auth0UserData.id,
        email: auth0UserData.email,
        name: auth0UserData.name,
        email_verified: true, // Auth0 handles this
        given_name: auth0UserData.firstName,
        family_name: auth0UserData.lastName
      };

      // Create/update user in 8base
      const userCreationResponse = await auth0UserService.handleAuth0User(auth0User);

      // Return combined user data
      return {
        ...auth0UserData,
        appUser: userCreationResponse.user
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }, [apolloClient]);

  const initialize = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const user = await getUser();

        dispatch({
          type: "INITIAL",
          payload: {
            isAuthenticated: true,
            user,
          },
        });
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
      console.error(error);
      dispatch({
        type: "INITIAL",
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  }, [getUser, isAuthenticated]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async () => {
    await loginWithRedirect();
  }, [loginWithRedirect]);

  // AUTHORIZE THROUGH SPA
  const authorize = useCallback(async () => {
    const claim = await getIdTokenClaims();
    if (!claim) return;
    const accessToken = claim.__raw;
    setSession(accessToken);

    if (isAuthenticated) {
      const user = await getUser();
      if (user.access_token_data) {
        localStorage.setItem("user", JSON.stringify(user));
        user.access_token_data.outlook_access_token &&
          localStorage.setItem(
            "outlook_access_token",
            user.access_token_data.outlook_access_token
          );
        user.access_token_data.outlook_refresh_token &&
          localStorage.setItem(
            "outlook_refresh_token",
            user.access_token_data.outlook_refresh_token
          );
        user.access_token_data.google_access_token &&
          localStorage.setItem(
            "google_access_token",
            user.access_token_data.google_access_token
          );
        user.access_token_data.google_refresh_token &&
          localStorage.setItem(
            "google_refresh_token",
            user.access_token_data.google_refresh_token
          );
        user.access_token_data.sms_access_token &&
          localStorage.setItem(
            "ring_central_token",
            user.access_token_data.sms_access_token
          );
        user.access_token_data.sms_refresh_token &&
          localStorage.setItem(
            "ring_central_refresh_token",
            user.access_token_data.sms_refresh_token
          );
        user.access_token_data.sms_user_data &&
          localStorage.setItem(
            "ring_central_user_data",
            JSON.stringify(user.access_token_data.sms_user_data)
          );
      }
      dispatch({
        type: "AUTHORIZE",
        payload: {
          isAuthenticated: true,
          user,
        },
      });
    }
  }, [getIdTokenClaims, getUser, isAuthenticated]);

  // LOGOUT
  const logout = useCallback(async () => {
    await Auth0Logout();
  }, [Auth0Logout]);

  const memoizedValue = useMemo(
    (): AuthContextType => ({
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
    roles: x.roles.items,
    createdAt: x.createdAt,
    updatedAt: x.updatedAt,
  };

  return user;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
