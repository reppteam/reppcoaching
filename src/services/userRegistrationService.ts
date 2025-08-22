import { eightbaseService } from './8baseService';
import { User, StudentProfile } from '../types';

export interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'coach' | 'coach_manager' | 'super_admin';
  businessName?: string;
  location?: string;
  targetMarket?: string;
  phone?: string;
  experience?: string;
  specialties?: string[];
}

export interface CoachRegistrationData extends UserRegistrationData {
  role: 'coach' | 'coach_manager';
  experience: string;
  specialties: string[];
  bio?: string;
  hourlyRate?: number;
}

export interface StudentRegistrationData extends UserRegistrationData {
  role: 'user';
  businessName?: string;
  location?: string;
  targetMarket?: string;
  goals?: string;
  challenges?: string;
}

export interface RegistrationResponse {
  user: User;
  studentProfile?: StudentProfile;
  token: string;
  message: string;
}

class UserRegistrationService {
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

  // Register a new user (student or coach)
  async registerUser(registrationData: UserRegistrationData): Promise<RegistrationResponse> {
    try {
      // Check if user already exists
      const existingUsers = await eightbaseService.getUsers();
      const existingUser = existingUsers.find(u => u.email.toLowerCase() === registrationData.email.toLowerCase());
      
      if (existingUser) {
        throw new Error('An account with this email already exists. Please log in instead.');
      }

      // Create the user in 8base
      const newUser: Omit<User, 'id' | 'created_at'> = {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        role: registrationData.role,
        assigned_admin_id: null,
        access_start: new Date().toISOString().split('T')[0],
        access_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        has_paid: registrationData.role === 'user' ? false : true, // Students start free, coaches start paid
        coaching_term_start: registrationData.role === 'user' ? this.calculateCoachingTermStart() : null,
        coaching_term_end: registrationData.role === 'user' ? this.calculateCoachingTermEnd() : null,
        is_active: registrationData.role !== 'user' ? true : undefined
      };

      const createdUser = await eightbaseService.createUser(newUser);

      // Create student profile if it's a student
      let studentProfile: StudentProfile | undefined;
      if (registrationData.role === 'user') {
        const studentRegData = registrationData as StudentRegistrationData;
        studentProfile = await eightbaseService.updateStudentProfile(createdUser.id, {
          business_name: studentRegData.businessName || '',
          location: studentRegData.location || '',
          target_market: studentRegData.targetMarket || '',
          strengths: '',
          challenges: studentRegData.challenges || '',
          goals: studentRegData.goals || '',
          preferred_contact_method: 'Email',
          availability: 'Flexible',
          notes: 'New student registration'
        });
      }

      // Set current user and token
      this.currentUser = createdUser;
      this.authToken = `${registrationData.role}-token-${createdUser.id}`;

      const roleDisplayName = this.getRoleDisplayName(registrationData.role);
      const message = `Welcome ${registrationData.firstName}! Your ${roleDisplayName} account has been created successfully.`;

      return {
        user: createdUser,
        studentProfile,
        token: this.authToken,
        message
      };
    } catch (error) {
      console.error('User registration error:', error);
      throw error;
    }
  }

  // Register a student specifically
  async registerStudent(studentData: StudentRegistrationData): Promise<RegistrationResponse> {
    return this.registerUser(studentData);
  }

  // Register a coach specifically
  async registerCoach(coachData: CoachRegistrationData): Promise<RegistrationResponse> {
    return this.registerUser(coachData);
  }

  // Login user (works for all roles)
  async loginUser(email: string, password: string): Promise<RegistrationResponse> {
    try {
      // Get all users from 8base
      const users = await eightbaseService.getUsers();
      
      // Find user by email
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        throw new Error('User not found. Please check your email or sign up.');
      }

      // For demo purposes, accept any password for existing users
      // In a real app, you would verify the password hash
      if (password !== 'password') {
        throw new Error('Invalid password. Please try again.');
      }

      // Get student profile if it's a student
      let studentProfile: StudentProfile | undefined;
      if (user.role === 'user') {
        const profile = await eightbaseService.getStudentProfile(user.id);
        studentProfile = profile || undefined;
      }

      // Set current user and token
      this.currentUser = user;
      this.authToken = `${user.role}-token-${user.id}`;

      const roleDisplayName = this.getRoleDisplayName(user.role);
      const message = `Welcome back ${user.firstName} ${user.lastName}! You are logged in as a ${roleDisplayName}.`;

      return {
        user,
        studentProfile,
        token: this.authToken,
        message
      };
    } catch (error) {
      console.error('User login error:', error);
      throw error;
    }
  }

  // Logout
  logout(): void {
    this.currentUser = null;
    this.authToken = null;
  }

  // Get role display name
  private getRoleDisplayName(role: string): string {
    switch (role) {
      case 'user':
        return 'Student';
      case 'coach':
        return 'Coach';
      case 'coach_manager':
        return 'Coach Manager';
      case 'super_admin':
        return 'Super Admin';
      default:
        return 'User';
    }
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

  // Assign student to coach
  async assignStudentToCoach(studentId: string, coachId: string | null): Promise<User> {
    try {
      return await eightbaseService.updateUser(studentId, { assigned_admin_id: coachId });
    } catch (error) {
      console.error('Failed to assign student to coach:', error);
      throw error;
    }
  }

  // Update user role
  async updateUserRole(userId: string, newRole: string): Promise<User> {
    try {
      return await eightbaseService.updateUser(userId, { role: newRole as any });
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const allUsers = await eightbaseService.getUsers();
      return allUsers.filter(user => user.role === role);
    } catch (error) {
      console.error('Failed to get users by role:', error);
      throw error;
    }
  }
}

export const userRegistrationService = new UserRegistrationService(); 