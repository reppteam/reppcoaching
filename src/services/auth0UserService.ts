import { eightbaseService } from './8baseService';
import { User, StudentProfile } from '../types';

export interface Auth0User {
  sub: string; // Auth0 user ID
  email: string;
  name: string;
  email_verified: boolean;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface InvitationData {
  email: string;
  role: 'coach' | 'coach_manager' | 'super_admin';
  invitedBy: string;
  invitationToken: string;
}

export interface UserCreationResponse {
  user: User;
  studentProfile?: StudentProfile;
  isNewUser: boolean;
  message: string;
}

class Auth0UserService {
  private currentUser: User | null = null;

  // Get current user from 8base
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Set current user
  setCurrentUser(user: User | null): void {
    this.currentUser = user;
  }

  // Handle Auth0 user login/registration
  async handleAuth0User(auth0User: Auth0User): Promise<UserCreationResponse> {
    try {
      // Check if user already exists in 8base
      const existingUsers = await eightbaseService.getUsers();
      const existingUser = existingUsers.find(u => u.email.toLowerCase() === auth0User.email.toLowerCase());

      if (existingUser) {
        // User exists - return existing user
        this.currentUser = existingUser;
        
        // Get student profile if it's a student
        let studentProfile: StudentProfile | undefined;
        if (existingUser.role === 'user') {
          const profile = await eightbaseService.getStudentProfile(existingUser.id);
          studentProfile = profile || undefined;
        }

        return {
          user: existingUser,
          studentProfile,
          isNewUser: false,
          message: `Welcome back ${existingUser.name}!`
        };
      }

      // New user - create as student by default
      const newUser: Omit<User, 'id' | 'created_at'> = {
        name: auth0User.name || `${auth0User.given_name || ''} ${auth0User.family_name || ''}`.trim(),
        email: auth0User.email,
        role: 'user', // Default to student
        assigned_admin_id: null,
        access_start: new Date().toISOString().split('T')[0],
        access_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        has_paid: false, // Students start as free users
        coaching_term_start: this.calculateCoachingTermStart(),
        coaching_term_end: this.calculateCoachingTermEnd(),
        is_active: undefined
      };

      const createdUser = await eightbaseService.createUser(newUser);

      // Create student profile for new students
      const studentProfile = await eightbaseService.updateStudentProfile(createdUser.id, {
        business_name: '',
        location: '',
        target_market: '',
        strengths: '',
        challenges: '',
        goals: '',
        preferred_contact_method: 'Email',
        availability: 'Flexible',
        notes: 'New student from Auth0 registration'
      });

      this.currentUser = createdUser;

      return {
        user: createdUser,
        studentProfile,
        isNewUser: true,
        message: `Welcome ${createdUser.name}! Your student account has been created successfully.`
      };
    } catch (error) {
      console.error('Error handling Auth0 user:', error);
      throw error;
    }
  }

  // Handle coach invitation (called by admin)
  async handleCoachInvitation(invitationData: InvitationData): Promise<User> {
    try {
      // Check if user already exists
      const existingUsers = await eightbaseService.getUsers();
      const existingUser = existingUsers.find(u => u.email.toLowerCase() === invitationData.email.toLowerCase());

      if (existingUser) {
        // Update existing user to coach role
        const updatedUser = await eightbaseService.updateUser(existingUser.id, {
          role: invitationData.role,
          has_paid: true,
          is_active: true
        });
        return updatedUser;
      }

      // Create new coach user
      const newCoach: Omit<User, 'id' | 'created_at'> = {
        name: invitationData.email.split('@')[0], // Use email prefix as name
        email: invitationData.email,
        role: invitationData.role,
        assigned_admin_id: null,
        access_start: new Date().toISOString().split('T')[0],
        access_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        has_paid: true, // Coaches start as paid users
        coaching_term_start: null,
        coaching_term_end: null,
        is_active: true
      };

      const createdCoach = await eightbaseService.createUser(newCoach);
      return createdCoach;
    } catch (error) {
      console.error('Error handling coach invitation:', error);
      throw error;
    }
  }

  // Handle admin invitation (called by super admin)
  async handleAdminInvitation(invitationData: InvitationData): Promise<User> {
    try {
      // Check if user already exists
      const existingUsers = await eightbaseService.getUsers();
      const existingUser = existingUsers.find(u => u.email.toLowerCase() === invitationData.email.toLowerCase());

      if (existingUser) {
        // Update existing user to admin role
        const updatedUser = await eightbaseService.updateUser(existingUser.id, {
          role: invitationData.role,
          has_paid: true,
          is_active: true
        });
        return updatedUser;
      }

      // Create new admin user
      const newAdmin: Omit<User, 'id' | 'created_at'> = {
        name: invitationData.email.split('@')[0], // Use email prefix as name
        email: invitationData.email,
        role: invitationData.role,
        assigned_admin_id: null,
        access_start: new Date().toISOString().split('T')[0],
        access_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        has_paid: true, // Admins start as paid users
        coaching_term_start: null,
        coaching_term_end: null,
        is_active: true
      };

      const createdAdmin = await eightbaseService.createUser(newAdmin);
      return createdAdmin;
    } catch (error) {
      console.error('Error handling admin invitation:', error);
      throw error;
    }
  }

  // Update user role (for admin use)
  async updateUserRole(userId: string, newRole: string): Promise<User> {
    try {
      const updatedUser = await eightbaseService.updateUser(userId, { 
        role: newRole as any,
        has_paid: newRole !== 'user' ? true : false, // Non-students are paid
        is_active: newRole !== 'user' ? true : undefined
      });
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw error;
    }
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

  // Get all students (for coach/admin dashboards)
  async getAllStudents(): Promise<User[]> {
    return this.getUsersByRole('user');
  }

  // Get all coaches (for admin dashboards)
  async getAllCoaches(): Promise<User[]> {
    const coaches = await this.getUsersByRole('coach');
    const coachManagers = await this.getUsersByRole('coach_manager');
    return [...coaches, ...coachManagers];
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
}

export const auth0UserService = new Auth0UserService(); 