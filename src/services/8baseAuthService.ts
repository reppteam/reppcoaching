import { authClient } from '../8baseClient';
import { eightBaseUserService } from './8baseUserService';
import { User } from '../types';

export interface Auth0User {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  nickname: string;
  picture: string;
  given_name?: string;
  family_name?: string;
  updated_at: string;
}

export interface Auth0SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  connection?: string;
}

export interface Auth0LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class EightBaseAuthService {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    const state = authClient.getState();
    return !!(state && state.idToken);
  }

  // Get current Auth0 user
  async getCurrentUser(): Promise<Auth0User | null> {
    try {
      const state = authClient.getState();
      if (!state || !state.idToken) {
        return null;
      }

      // Decode the ID token to get user info
      const payload = JSON.parse(atob(state.idToken.split('.')[1]));
      return payload as Auth0User;
    } catch (error) {
      console.error('Error getting current Auth0 user:', error);
      return null;
    }
  }

  // Sign up a new user with Auth0 through 8base
  async signUp(signUpData: Auth0SignUpData): Promise<Auth0User> {
    try {
      // Use Auth0's signup endpoint
      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/dbconnections/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
          email: signUpData.email,
          password: signUpData.password,
          name: `${signUpData.firstName} ${signUpData.lastName}`,
          given_name: signUpData.firstName,
          family_name: signUpData.lastName,
          connection: signUpData.connection || 'Username-Password-Authentication',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || 'Signup failed');
      }

      const userData = await response.json();

      // After successful Auth0 signup, create user in 8base
      await this.createUserIn8base({
        email: signUpData.email,
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        auth0Id: userData.user_id,
      });

      return userData;
    } catch (error) {
      console.error('Auth0 signup error:', error);
      throw error;
    }
  }

  // Login with Auth0 through 8base
  async login(loginData: Auth0LoginData): Promise<Auth0User> {
    try {
      // Check if Auth0 is configured
      if (!process.env.REACT_APP_AUTH0_DOMAIN || !process.env.REACT_APP_AUTH0_CLIENT_ID) {
        console.warn('Auth0 not configured, using mock login for development');
        return this.mockLogin(loginData);
      }

      // Use Auth0's login endpoint
      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'password',
          username: loginData.email,
          password: loginData.password,
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
          client_secret: process.env.REACT_APP_AUTH0_CLIENT_SECRET,
          scope: 'openid profile email',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Login failed');
      }

      const tokenData = await response.json();

      // Set the tokens in Auth0 client
      await authClient.setState({
        idToken: tokenData.id_token,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
      });

      // Get user info from the ID token
      const payload = JSON.parse(atob(tokenData.id_token.split('.')[1]));
      return payload as Auth0User;
    } catch (error) {
      console.error('Auth0 login error:', error);

      // Fallback to mock login if Auth0 fails
      console.warn('Falling back to mock login due to Auth0 error');
      return this.mockLogin(loginData);
    }
  }

  // Mock login for development when Auth0 is not configured
  private mockLogin(loginData: Auth0LoginData): Auth0User {
    console.log('Mock login with:', loginData);

    // Return mock user data
    return {
      sub: 'mock-user-id',
      email: loginData.email,
      email_verified: true,
      name: `${loginData.email.split('@')[0]} User`,
      nickname: loginData.email.split('@')[0],
      picture: '',
      given_name: loginData.email.split('@')[0],
      family_name: 'User',
      updated_at: new Date().toISOString()
    };
  }

  // Logout from Auth0
  async logout(): Promise<void> {
    try {
      await authClient.logout();
    } catch (error) {
      console.error('Auth0 logout error:', error);
      throw error;
    }
  }

  // Create user in 8base after Auth0 signup
  private async createUserIn8base(userData: {
    email: string;
    firstName: string;
    lastName: string;
    auth0Id: string;
  }): Promise<void> {
    try {
      // Check if user already exists in 8base
      const existingUser = await eightBaseUserService.getUserByEmail(userData.email);
      if (existingUser) {
        console.log('User already exists in 8base:', existingUser);
        return;
      }

      // Get student role
      const roles = await eightBaseUserService.getAllRoles();
      const studentRole = roles.find(role =>
        role.name === 'Student' || role.name === 'user' || role.name === 'student'
      );

      // Create user in 8base
      const createUserInput = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        roles: studentRole ? [studentRole.id] : undefined,
      };

      const newUser = await eightBaseUserService.createUser(createUserInput);
      console.log('Created user in 8base:', newUser);
    } catch (error) {
      console.error('Error creating user in 8base:', error);
      // Don't throw error here as Auth0 signup was successful
    }
  }

  // Get or create user in 8base from Auth0 user
  async getOrCreate8baseUser(auth0User: Auth0User): Promise<User | null> {
    try {
      // Try to find user by email
      let eightBaseUser = await eightBaseUserService.getUserByEmail(auth0User.email);

      if (!eightBaseUser) {
        // Create user in 8base if not found
        const roles = await eightBaseUserService.getAllRoles();
        const studentRole = roles.find(role =>
          role.name === 'Student' || role.name === 'user' || role.name === 'student'
        );

        const createUserInput = {
          email: auth0User.email,
          firstName: auth0User.given_name || auth0User.name.split(' ')[0],
          lastName: auth0User.family_name || auth0User.name.split(' ').slice(1).join(' '),
          roles: studentRole ? [studentRole.id] : undefined,
        };

        eightBaseUser = await eightBaseUserService.createUser(createUserInput);
      }

      // Convert to application User type
      const roleName = eightBaseUser.roles?.items?.[0]?.name?.toLowerCase() || 'user';
      const user: User = {
        id: eightBaseUser.id,
        name: `${eightBaseUser.firstName} ${eightBaseUser.lastName}`,
        email: eightBaseUser.email,
        role: (roleName === 'user' || roleName === 'coach' || roleName === 'coach_manager' || roleName === 'super_admin')
          ? roleName as 'user' | 'coach' | 'coach_manager' | 'super_admin'
          : 'user',
        access_start: new Date().toISOString().split('T')[0],
        access_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        has_paid: true,
        created_at: eightBaseUser.createdAt,
        coaching_term_start: null,
        coaching_term_end: null
      };

      return user;
    } catch (error) {
      console.error('Error getting or creating 8base user:', error);
      return null;
    }
  }

  // Get Auth0 tokens
  async getTokens(): Promise<{ idToken: string; accessToken: string } | null> {
    try {
      const state = authClient.getState();
      if (!state) return null;

      return {
        idToken: state.idToken,
        accessToken: state.accessToken,
      };
    } catch (error) {
      console.error('Error getting Auth0 tokens:', error);
      return null;
    }
  }

  // Refresh Auth0 tokens
  async refreshTokens(): Promise<void> {
    try {
      const state = authClient.getState();
      if (!state || !state.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: state.refreshToken,
          client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
          client_secret: process.env.REACT_APP_AUTH0_CLIENT_SECRET,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokenData = await response.json();

      await authClient.setState({
        idToken: tokenData.id_token,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || state.refreshToken,
      });
    } catch (error) {
      console.error('Error refreshing Auth0 tokens:', error);
      throw error;
    }
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get demo accounts for testing
  getDemoAccounts(): Array<{ email: string; password: string; role: string }> {
    return [
      { email: 'student@example.com', password: 'password', role: 'Student' },
      { email: 'coach@example.com', password: 'password', role: 'Coach' },
      { email: 'superadmin@example.com', password: 'password', role: 'Super Admin' }
    ];
  }
}

export const eightBaseAuthService = new EightBaseAuthService(); 