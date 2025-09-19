import { forgotPasswordService } from './forgotPasswordService';
import { eightbaseService } from './8baseService';
import { User } from '../types';

export interface EnhancedUserCreationData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'coach' | 'coach_manager' | 'super_admin';
  is_active: boolean;
  has_paid: boolean;
  assignedCoachId?: string;
}

export interface EnhancedUserCreationResult {
  success: boolean;
  user?: User;
  message: string;
  error?: string;
  auth0PasswordResetSent?: boolean;
  roleSpecificRecordCreated?: boolean;
}

class EnhancedUserCreationService {
  /**
   * Create a new user with enhanced features:
   * 1. Create user in 8base with proper role
   * 2. Create role-specific records (Student/Coach tables)
   * 3. Send Auth0 password reset link
   */
  async createUserWithEnhancements(userData: EnhancedUserCreationData): Promise<EnhancedUserCreationResult> {
    try {
      console.log('=== ENHANCED USER CREATION STARTED ===');
      console.log('User data:', userData);

      // Step 1: Create user in 8base
      const createdUser = await eightbaseService.createUser(userData);
      console.log('User created in 8base:', createdUser);

      if (!createdUser) {
        throw new Error('Failed to create user in 8base');
      }

      let roleSpecificRecordCreated = false;
      let auth0PasswordResetSent = false;

      // Step 2: Create role-specific records
      try {
        if (userData.role === 'user') {
          // Create Student record
          const studentData = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: '',
            business_name: '',
            location: '',
            target_market: '',
            strengths: '',
            challenges: '',
            goals: '',
            preferred_contact_method: '',
            availability: '',
            notes: '',
            user: {
              connect: { id: createdUser.id }
            }
          };

          await eightbaseService.createStudentDirect(studentData);
          roleSpecificRecordCreated = true;
          console.log('Student record created successfully');

        } else if (userData.role === 'coach') {
          // Create Coach record
          const coachData = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            bio: '',
            user: {
              connect: { id: createdUser.id }
            }
          };

          await eightbaseService.createCoachDirect(coachData);
          roleSpecificRecordCreated = true;
          console.log('Coach record created successfully');
        }
        // For other roles (coach_manager, super_admin), only User table record is created
      } catch (roleError) {
        console.error('Failed to create role-specific record:', roleError);
        // Don't fail the entire operation if role-specific record creation fails
      }

      // Step 3: Send Auth0 password reset link
      try {
        const passwordResetResult = await forgotPasswordService.sendPasswordResetEmail(userData.email);
        auth0PasswordResetSent = passwordResetResult.success;
        
        if (passwordResetResult.success) {
          console.log('Auth0 password reset email sent successfully');
        } else {
          console.warn('Failed to send Auth0 password reset email:', passwordResetResult.error);
        }
      } catch (auth0Error) {
        console.error('Error sending Auth0 password reset email:', auth0Error);
        // Don't fail the entire operation if Auth0 email fails
      }

      // Step 4: Assign coach if specified (for students)
      if (userData.role === 'user' && userData.assignedCoachId && userData.assignedCoachId !== 'none') {
        try {
          await eightbaseService.assignCoachToStudent(createdUser.id, userData.assignedCoachId);
          console.log('Coach assigned to student successfully');
        } catch (assignmentError) {
          console.error('Failed to assign coach to student:', assignmentError);
          // Don't fail the entire operation if coach assignment fails
        }
      }

      console.log('=== ENHANCED USER CREATION COMPLETED ===');
      console.log('User created:', createdUser);
      console.log('Role-specific record created:', roleSpecificRecordCreated);
      console.log('Auth0 password reset sent:', auth0PasswordResetSent);

      return {
        success: true,
        user: createdUser,
        message: this.generateSuccessMessage(userData.role, auth0PasswordResetSent, roleSpecificRecordCreated),
        auth0PasswordResetSent,
        roleSpecificRecordCreated
      };

    } catch (error) {
      console.error('Enhanced user creation failed:', error);
      return {
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate appropriate success message based on what was accomplished
   */
  private generateSuccessMessage(
    role: string, 
    auth0PasswordResetSent: boolean, 
    roleSpecificRecordCreated: boolean
  ): string {
    let message = `✅ User created successfully as ${role}`;
    
    if (roleSpecificRecordCreated) {
      if (role === 'user') {
        message += '\n📚 Student profile created in Student table';
      } else if (role === 'coach') {
        message += '\n👨‍🏫 Coach profile created in Coach table';
      }
    }
    
    if (auth0PasswordResetSent) {
      message += '\n📧 Password reset link sent to email';
    } else {
      message += '\n⚠️ Note: Password reset link could not be sent';
    }
    
    message += '\n\nUser can now log in using their email and the password they set via the reset link.';
    
    return message;
  }

  /**
   * Check if user already exists by email
   */
  async checkUserExists(email: string): Promise<{ exists: boolean; user?: User }> {
    try {
      const users = await eightbaseService.getUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      return {
        exists: !!existingUser,
        user: existingUser
      };
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return { exists: false };
    }
  }
}

export const enhancedUserCreationService = new EnhancedUserCreationService();
