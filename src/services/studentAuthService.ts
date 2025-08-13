import { mockApi } from './mockApi';
import { User } from '../types';

export interface StudentLoginData {
  email: string;
  password: string;
}

export interface StudentSignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName?: string;
  location?: string;
  targetMarket?: string;
}

export interface StudentSignUpFormData extends StudentSignUpData {
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class StudentAuthService {
  private currentUser: User | null = null;
  private authToken: string | null = null;

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.authToken && !!this.currentUser;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get auth token
  getToken(): string | null {
    return this.authToken;
  }

  // Student login
  async loginStudent(loginData: StudentLoginData): Promise<AuthResponse> {
    try {
      // Get all users from mock API
      const users = await mockApi.getUsers();

      // Find user by email
      const user = users.find(u => u.email.toLowerCase() === loginData.email.toLowerCase());

      if (!user) {
        throw new Error('User not found. Please check your email or sign up.');
      }

      // For demo purposes, accept any password for existing users
      // In a real app, you would verify the password hash
      if (loginData.password !== 'password') {
        throw new Error('Invalid password. Please try again.');
      }

      // Set current user and token
      this.currentUser = user;
      this.authToken = `student-token-${user.id}`;

      return {
        user,
        token: this.authToken
      };
    } catch (error) {
      console.error('Student login error:', error);
      throw error;
    }
  }

  // Student signup
  async signUpStudent(signUpData: StudentSignUpData): Promise<AuthResponse> {
    try {
      // Get all users to check if email already exists
      const users = await mockApi.getUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === signUpData.email.toLowerCase());

      if (existingUser) {
        throw new Error('An account with this email already exists. Please log in instead.');
      }

      // Create new user
      const newUser: User = {
        id: (users.length + 1).toString(),
        name: `${signUpData.firstName} ${signUpData.lastName}`,
        email: signUpData.email,
        role: 'user',
        assigned_admin_id: null, // Will be assigned by admin later
        access_start: new Date().toISOString().split('T')[0],
        access_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        has_paid: false, // New students start as free users
        created_at: new Date().toISOString(),
        coaching_term_start: this.calculateCoachingTermStart(),
        coaching_term_end: this.calculateCoachingTermEnd()
      };

      // Add user to mock data using the mock API
      await mockApi.createUser(newUser);

      // Create student profile if business info provided
      if (signUpData.businessName || signUpData.location || signUpData.targetMarket) {
        await mockApi.updateStudentProfile(newUser.id, {
          business_name: signUpData.businessName || '',
          location: signUpData.location || '',
          target_market: signUpData.targetMarket || '',
          strengths: '',
          challenges: '',
          goals: '',
          preferred_contact_method: 'Email',
          availability: 'Flexible',
          notes: 'New student signup'
        });
      }

      // Set current user and token
      this.currentUser = newUser;
      this.authToken = `student-token-${newUser.id}`;

      return {
        user: newUser,
        token: this.authToken
      };
    } catch (error) {
      console.error('Student signup error:', error);
      throw error;
    }
  }

  // Logout
  logout(): void {
    this.currentUser = null;
    this.authToken = null;
  }



  // Calculate coaching term start date (6 months from now)
  private calculateCoachingTermStart(): string {
    const startDate = new Date();
    startDate.setDate(1); // First of the month
    return startDate.toISOString().split('T')[0];
  }

  // Calculate coaching term end date (6 months from start)
  private calculateCoachingTermEnd(): string {
    const startDate = new Date();
    startDate.setDate(1); // First of the month
    startDate.setMonth(startDate.getMonth() + 6); // 6 months later
    return startDate.toISOString().split('T')[0];
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

export const studentAuthService = new StudentAuthService(); 