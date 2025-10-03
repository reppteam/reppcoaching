import { auth0TokenService } from './auth0TokenService';
import { eightbaseService } from './8baseService';
import { User } from '../types';

export interface Auth0UserCreationData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'coach' | 'coach_manager' | 'super_admin';
  is_active: boolean;
  has_paid: boolean;
  assignedCoachId?: string;
}

export interface Auth0UserCreationResult {
  success: boolean;
  user?: User;
  message: string;
  error?: string;
  auth0UserCreated?: boolean;
  passwordResetSent?: boolean;
  roleSpecificRecordCreated?: boolean;
}

class Auth0UserCreationService {
  /**
   * Create a new user with Auth0 integration:
   * 1. Create user in Auth0 first
   * 2. Send password reset email via Auth0
   * 3. Create user in 8base with proper role
   * 4. Create role-specific records (Student/Coach tables)
   */
  async createUserWithAuth0(userData: Auth0UserCreationData): Promise<Auth0UserCreationResult> {
    try {
      console.log('=== AUTH0 USER CREATION STARTED ===');
      console.log('User data:', userData);

      let auth0UserCreated = false;
      let passwordResetSent = false;
      let roleSpecificRecordCreated = false;
      let auth0Error: string | undefined;

      // Step 1: Create user in Auth0 first
      try {
        const auth0User = await this.createAuth0User(userData);
        auth0UserCreated = true;
        console.log('User created in Auth0:', auth0User);

        // Step 2: Send password reset email via Auth0
        const passwordResetResult = await this.sendPasswordResetEmail(userData.email);
        passwordResetSent = passwordResetResult.success;
        
        if (passwordResetResult.success) {
          console.log('Password reset email sent successfully');
        } else {
          console.warn('Failed to send password reset email:', passwordResetResult.error);
        }
      } catch (auth0Error) {
        console.error('Failed to create Auth0 user:', auth0Error);
        console.error('Auth0 Error Details:', {
          message: auth0Error instanceof Error ? auth0Error.message : 'Unknown error',
          stack: auth0Error instanceof Error ? auth0Error.stack : undefined
        });
        auth0Error = auth0Error instanceof Error ? auth0Error.message : 'Unknown Auth0 error';
        // Continue with 8base user creation even if Auth0 fails
      }

      // Step 3: Create user in 8base
      const createdUser = await eightbaseService.createUser(userData);
      console.log('User created in 8base:', createdUser);

      if (!createdUser) {
        throw new Error('Failed to create user in 8base');
      }

      // Step 4: Create role-specific records
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
        } else if (userData.role === 'coach_manager') {
          // Create Coach record for coach manager (so they can have students assigned)
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
          console.log('Coach record created successfully for coach manager');
        }
        // For other roles (super_admin), only User table record is created
      } catch (roleError) {
        console.error('Failed to create role-specific record:', roleError);
        // Don't fail the entire operation if role-specific record creation fails
      }

      // Step 5: Assign coach if specified (for students)
      if (userData.role === 'user' && userData.assignedCoachId && userData.assignedCoachId !== 'none') {
        try {
          await eightbaseService.assignCoachToStudent(createdUser.id, userData.assignedCoachId);
          console.log('Coach assigned to student successfully');
        } catch (assignmentError) {
          console.error('Failed to assign coach to student:', assignmentError);
          // Don't fail the entire operation if coach assignment fails
        }
      }

      console.log('=== AUTH0 USER CREATION COMPLETED ===');
      console.log('User created:', createdUser);
      console.log('Auth0 user created:', auth0UserCreated);
      console.log('Password reset sent:', passwordResetSent);
      console.log('Role-specific record created:', roleSpecificRecordCreated);

      return {
        success: true,
        user: createdUser,
        message: this.generateSuccessMessage(userData.role, auth0UserCreated, passwordResetSent, roleSpecificRecordCreated, auth0Error),
        auth0UserCreated,
        passwordResetSent,
        roleSpecificRecordCreated
      };

    } catch (error) {
      console.error('Auth0 user creation failed:', error);
      return {
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create user in Auth0
   */
  private async createAuth0User(userData: Auth0UserCreationData): Promise<any> {
    try {
      const managementToken = await auth0TokenService.getManagementToken();
      
      const auth0UserData = {
        email: userData.email,
        given_name: userData.firstName,
        family_name: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
        connection: 'Username-Password-Authentication',
        email_verified: false,
        app_metadata: {
          role: userData.role,
          is_active: userData.is_active,
          has_paid: userData.has_paid
        }
      };

      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(auth0UserData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Auth0 user creation failed: ${error.message || error.error}`);
      }

      const auth0User = await response.json();
      console.log('Auth0 user created successfully:', auth0User);
      return auth0User;
    } catch (error) {
      console.error('Error creating Auth0 user:', error);
      throw error;
    }
  }

  /**
   * Send password reset email via Auth0
   */
  private async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/dbconnections/change_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
          email: email,
          connection: 'Username-Password-Authentication'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Password reset failed: ${error.error_description || error.error}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send password reset email'
      };
    }
  }

  /**
   * Generate appropriate success message based on what was accomplished
   */
  private generateSuccessMessage(
    role: string, 
    auth0UserCreated: boolean,
    passwordResetSent: boolean, 
    roleSpecificRecordCreated: boolean,
    auth0Error?: string
  ): string {
    let message = `✅ User created successfully as ${role}`;
    
    if (auth0UserCreated) {
      message += '\n🔐 Auth0 account created';
    } else {
      message += '\n⚠️ Auth0 account creation failed';
      if (auth0Error) {
        message += `\n   Error: ${auth0Error}`;
      }
    }
    
    if (roleSpecificRecordCreated) {
      if (role === 'user') {
        message += '\n📚 Student profile created in Student table';
      } else if (role === 'coach') {
        message += '\n👨‍🏫 Coach profile created in Coach table';
      }
    }
    
    if (passwordResetSent) {
      message += '\n📧 Password reset link sent to email';
    } else {
      message += '\n⚠️ Note: Password reset link could not be sent';
    }
    
    if (auth0UserCreated && passwordResetSent) {
      message += '\n\nUser can now log in using their email and the password they set via the reset link.';
    } else {
      message += '\n\nNote: User may need to be created in Auth0 manually or use alternative login method.';
      if (auth0Error) {
        message += `\n\nDebug: ${auth0Error}`;
      }
    }
    
    return message;
  }

  /**
   * Check if user already exists by email
   */
  async checkUserExists(email: string): Promise<{ exists: boolean; user?: User; auth0Exists?: boolean }> {
    try {
      // Check in 8base
      const users = await eightbaseService.getUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // Check in Auth0
      let auth0Exists = false;
      try {
        const managementToken = await auth0TokenService.getManagementToken();
        const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Bearer ${managementToken}`
          }
        });
        
        if (response.ok) {
          const auth0Users = await response.json();
          auth0Exists = auth0Users.length > 0;
        }
      } catch (auth0Error) {
        console.warn('Could not check Auth0 user existence:', auth0Error);
      }
      
      return {
        exists: !!existingUser,
        user: existingUser,
        auth0Exists
      };
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return { exists: false };
    }
  }
}

export const auth0UserCreationService = new Auth0UserCreationService();
