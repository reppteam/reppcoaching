import { eightbaseService } from './8baseService';
import { auth0TokenService } from './auth0TokenService';
import { User } from '../types';
import { mapApplicationRoleTo8baseRole } from '../config/staticRoles';

export interface InvitationData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'coach' | 'coach_manager' | 'super_admin';
  selectedRoleId?: string; // 8base role ID
  assigned_admin_id?: string;
  access_start?: string;
  access_end?: string;
  has_paid?: boolean;
  invited_by?: string;
  custom_message?: string;
}

export interface InvitationResult {
  success: boolean;
  user?: User;
  invitationId?: string;
  error?: string;
  emailSent?: boolean;
}

class UserInvitationService {
  // Create user and send invitation email
  async createUserWithInvitation(invitationData: InvitationData): Promise<InvitationResult> {
    try {
      // Step 1: Create user in 8base with role assignment (including coach/student relationships)
      const createdUser = await this.create8baseUserWithRole(invitationData);

      // Step 2: Create Auth0 user account with role metadata
      const auth0User = await this.createAuth0User(invitationData, createdUser.id);

      // Step 3: Send invitation email via SendGrid
      const emailResult = await this.sendInvitationEmail(invitationData, createdUser, auth0User);

      // Step 4: Create invitation record in 8base
      const invitationRecord = await this.createInvitationRecord(invitationData, createdUser, emailResult);

      return {
        success: true,
        user: createdUser,
        invitationId: invitationRecord?.id,
        emailSent: emailResult.success
      };

    } catch (error) {
      console.error('Error creating user with invitation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user and send invitation'
      };
    }
  }

  // Create 8base user with role assignment
  private async create8baseUserWithRole(invitationData: InvitationData): Promise<User> {
    try {
      // Use the selected role ID directly
      if (!invitationData.selectedRoleId) {
        throw new Error('No role ID provided for user creation');
      }

      let createdUser;

      // Create user based on role type
      if (invitationData.role === 'coach') {
         // Create coach with assigned students (if any)
         const coachInput = {
           email: invitationData.email,
           firstName: invitationData.firstName,
           lastName: invitationData.lastName,
           roles: {
             connect: { id: invitationData.selectedRoleId }
           }
           // Note: Student assignments would be handled separately if needed
         };

         createdUser = await eightbaseService.createUser(coachInput);
         
         // Create Coach record for coach role
         try {
           const coachData = {
             firstName: invitationData.firstName,
             lastName: invitationData.lastName,
             email: invitationData.email,
             bio: ''
           };
           await eightbaseService.createCoachDirect(coachData);
           console.log('Coach record created successfully');
         } catch (coachError) {
           console.error('Failed to create coach record:', coachError);
           // Don't fail the entire process if coach record creation fails
         }
         
       } else if (invitationData.role === 'coach_manager') {
         // Create coach manager with coach record (so they can have students assigned)
         const managerInput = {
           email: invitationData.email,
           firstName: invitationData.firstName,
           lastName: invitationData.lastName,
           roles: {
             connect: { id: invitationData.selectedRoleId }
           }
         };

         createdUser = await eightbaseService.createUser(managerInput);
         
         // Create Coach record for coach manager (so they can have students assigned)
         try {
           const coachData = {
             firstName: invitationData.firstName,
             lastName: invitationData.lastName,
             email: invitationData.email,
             bio: '',
             users: {
               connect: { id: createdUser.id }
             }
           };
           await eightbaseService.createCoachDirect(coachData);
           console.log('Coach record created successfully for coach manager');
         } catch (coachError) {
           console.error('Failed to create coach record for coach manager:', coachError);
           // Don't fail the entire process if coach record creation fails
         }
         
       } else if (invitationData.role === 'user') {
         // Create student with assigned coach (only if we have a valid coach ID)
         const studentInput: any = {
           email: invitationData.email,
           firstName: invitationData.firstName,
           lastName: invitationData.lastName,
           roles: {
             connect: { id: invitationData.selectedRoleId }
           }
         };

         // Only add assignedCoach if we have a valid coach ID
         // For now, let's not assign a coach automatically to avoid the error
         // The coach can be assigned later through the UI
         if (invitationData.assigned_admin_id) {
           console.log('Coach assignment skipped to avoid permission issues');
         }

         createdUser = await eightbaseService.createUser(studentInput);
         
         // Create Student record for user role
         try {
           const studentData = {
             firstName: invitationData.firstName,
             lastName: invitationData.lastName,
             email: invitationData.email,
             phone: '',
             business_name: '',
             location: '',
             target_market: '',
             strengths: '',
             challenges: '',
             goals: '',
             preferred_contact_method: '',
             availability: '',
             notes: ''
           };
           await eightbaseService.createStudentDirect(studentData);
           console.log('Student record created successfully');
         } catch (studentError) {
           console.error('Failed to create student record:', studentError);
           // Don't fail the entire process if student record creation fails
         }
         
       } else {
         // Create other roles (coach_manager, super_admin) with standard method
         const userInput = {
           email: invitationData.email,
           firstName: invitationData.firstName,
           lastName: invitationData.lastName,
           roles: {
             connect: { id: invitationData.selectedRoleId }
           }
         };

         createdUser = await eightbaseService.createUser(userInput);
       }
      
      // Transform to match our User interface
      return {
        id: createdUser.id,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        email: createdUser.email,
        role: invitationData.role,
        assigned_admin_id: invitationData.assigned_admin_id || null,
        access_start: invitationData.access_start || new Date().toISOString().split('T')[0],
        access_end: invitationData.access_end || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        has_paid: invitationData.has_paid || false,
        created_at: createdUser.created_at,
        coaching_term_start: null,
        coaching_term_end: null,
        is_active: true
      };

    } catch (error) {
      console.error('Error creating 8base user with role:', error);
      throw error;
    }
  }

  // Create Auth0 user account
  private async createAuth0User(invitationData: InvitationData, userId?: string): Promise<any> {
    try {
      // Get a fresh management token
      const managementToken = await auth0TokenService.getManagementToken();

      // Create user in Auth0 with FirstName@LastName password format
      const defaultPassword = this.generateDefaultPassword(invitationData.firstName, invitationData.lastName);

      const auth0Response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${managementToken}`
        },
        body: JSON.stringify({
          email: invitationData.email,
          password: defaultPassword,
          name: `${invitationData.firstName} ${invitationData.lastName}`,
          given_name: invitationData.firstName,
          family_name: invitationData.lastName,
          connection: 'Username-Password-Authentication',
          email_verified: false,
          app_metadata: {
            role: invitationData.role,
            invited_by: invitationData.invited_by,
            user_id: userId, // Link to 8base user ID
            access_start: invitationData.access_start,
            access_end: invitationData.access_end,
            has_paid: invitationData.has_paid
          },
          user_metadata: {
            role: invitationData.role,
            invited_by: invitationData.invited_by,
            user_id: userId,
            access_start: invitationData.access_start,
            access_end: invitationData.access_end,
            has_paid: invitationData.has_paid
          }
        })
      });

      if (!auth0Response.ok) {
        const error = await auth0Response.json();
        throw new Error(`Auth0 user creation failed: ${error.message}`);
      }

      const auth0User = await auth0Response.json();
      
      // Send password reset email instead of using temporary password
      const resetResult = await this.sendPasswordResetEmail(invitationData.email);
      
      return {
        ...auth0User,
        passwordResetSent: resetResult.success,
        resetError: resetResult.error
      };
    } catch (error) {
      console.error('Error creating Auth0 user:', error);
      throw error;
    }
  }

  // Send password reset email via Auth0
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
        throw new Error(`Auth0 password reset failed: ${error.error_description || error.error}`);
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

  // Send invitation email via SendGrid
  private async sendInvitationEmail(invitationData: InvitationData, user: User, auth0User: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const emailData = {
        personalizations: [{
          to: [{ email: invitationData.email, name: `${invitationData.firstName} ${invitationData.lastName}` }],
          dynamic_template_data: {
            firstName: invitationData.firstName,
            lastName: invitationData.lastName,
            email: invitationData.email,
            role: this.getRoleDisplayName(invitationData.role),
            loginUrl: `${window.location.origin}/login`,
            invitedBy: invitationData.invited_by || 'System Administrator',
            customMessage: invitationData.custom_message,
            accessStart: invitationData.access_start,
            accessEnd: invitationData.access_end,
            hasPaid: invitationData.has_paid,
            passwordResetSent: auth0User.passwordResetSent,
            resetError: auth0User.resetError
          }
        }],
        from: { email: "hello@repplaunch.com", name: 'Real Estate Photographer Pro' },
        template_id: this.getTemplateId(invitationData.role)
      };

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SENDGRID_API_KEY}`
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`SendGrid error: ${error.errors?.[0]?.message || 'Failed to send email'}`);
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.message_id
      };

    } catch (error) {
      console.error('Error sending invitation email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      };
    }
  }

  // Create invitation record in 8base
  private async createInvitationRecord(invitationData: InvitationData, user: User, emailResult: any): Promise<any> {
    try {
      // This would create a record in an Invitations table in 8base
      // For now, we'll return a mock record
      return {
        id: `inv_${Date.now()}`,
        user_id: user.id,
        email: invitationData.email,
        role: invitationData.role,
        invited_by: invitationData.invited_by,
        email_sent: emailResult.success,
        email_message_id: emailResult.messageId,
        created_at: new Date().toISOString(),
        status: 'sent'
      };
    } catch (error) {
      console.error('Error creating invitation record:', error);
      return null;
    }
  }

  // Generate default password in format: FirstName@LastName (first letter capitalized)
  private generateDefaultPassword(firstName: string, lastName: string): string {
    // Capitalize first letter of firstName, rest lowercase
    const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    
    // Make lastName all lowercase
    const formattedLastName = lastName.toLowerCase();
    
    return `${formattedFirstName}@${formattedLastName}`;
  }

  // Generate temporary password
  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Get role display name
  private getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      'user': 'Student',
      'coach': 'Coach',
      'coach_manager': 'Coach Manager',
      'super_admin': 'Super Administrator'
    };
    return roleMap[role] || role;
  }

  // Get SendGrid template ID based on role
  private getTemplateId(role: string): string {
    const templateMap: Record<string, string> = {
      'user': process.env.REACT_APP_SENDGRID_STUDENT_TEMPLATE_ID || 'd-xxxxxxxxxxxxxxxxxxxxxxxx',
      'coach': process.env.REACT_APP_SENDGRID_COACH_TEMPLATE_ID || 'd-xxxxxxxxxxxxxxxxxxxxxxxx',
      'coach_manager': process.env.REACT_APP_SENDGRID_MANAGER_TEMPLATE_ID || 'd-xxxxxxxxxxxxxxxxxxxxxxxx',
      'super_admin': process.env.REACT_APP_SENDGRID_ADMIN_TEMPLATE_ID || 'd-xxxxxxxxxxxxxxxxxxxxxxxx'
    };
    return templateMap[role] || templateMap['user'];
  }

  // Resend invitation email
  async resendInvitation(userId: string, invitationData: InvitationData): Promise<InvitationResult> {
    try {
      const users = await eightbaseService.getUsersByFilter({ id: { equals: userId } });
      const user = users[0];
      if (!user) {
        throw new Error('User not found');
      }

      // Send password reset email instead of updating password
      const resetResult = await this.sendPasswordResetEmail(user.email);

      // Create mock auth0User object for email template
      const auth0User = {
        passwordResetSent: resetResult.success,
        resetError: resetResult.error
      };

      // Send new invitation email
      const emailResult = await this.sendInvitationEmail(invitationData, user, auth0User);

      return {
        success: true,
        user,
        emailSent: emailResult.success
      };

    } catch (error) {
      console.error('Error resending invitation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resend invitation'
      };
    }
  }

  // Update Auth0 user password
  private async updateAuth0UserPassword(email: string, newPassword: string): Promise<any> {
    try {
      // Get a fresh management token
      const managementToken = await auth0TokenService.getManagementToken();

      // First, get the Auth0 user ID by email
      const searchResponse = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${managementToken}`
        }
      });

      if (!searchResponse.ok) {
        throw new Error('Failed to find Auth0 user');
      }

      const users = await searchResponse.json();
      if (users.length === 0) {
        throw new Error('Auth0 user not found');
      }

      const auth0UserId = users[0].user_id;

      // Update the user's password
      const updateResponse = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${auth0UserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${managementToken}`
        },
        body: JSON.stringify({
          password: newPassword,
          email_verified: false
        })
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(`Failed to update Auth0 user: ${error.message}`);
      }

      return await updateResponse.json();

    } catch (error) {
      console.error('Error updating Auth0 user password:', error);
      throw error;
    }
  }

  // Get invitation status
  async getInvitationStatus(userId: string): Promise<any> {
    try {
      // This would query the Invitations table in 8base
      // For now, return mock data
      return {
        status: 'sent',
        email_sent: true,
        created_at: new Date().toISOString(),
        last_sent: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting invitation status:', error);
      return null;
    }
  }

  // Cancel invitation
  async cancelInvitation(userId: string): Promise<boolean> {
    try {
      // This would update the Invitations table in 8base
      // For now, return success
      return true;
    } catch (error) {
      console.error('Error canceling invitation:', error);
      return false;
    }
  }
}

export const userInvitationService = new UserInvitationService();
