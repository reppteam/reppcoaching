import { eightBaseM2MAuthService } from './8baseM2MAuthService';
import { eightbaseService } from './8baseService';
import { User } from '../types';

export interface SaasUserCreationData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'coach' | 'coach_manager' | 'super_admin';
  is_active: boolean;
  has_paid: boolean;
  assignedCoachId?: string;
}

export interface SaasUserCreationResult {
  success: boolean;
  message: string;
  error?: string;
  auth0UserId?: string;
  verificationSent?: boolean;
  verificationLink?: string;
  userRecord?: any;
  studentRecord?: any;
  coachRecord?: any;
}

class SaasUserCreationService {
  /**
   * Create a new user following the proper SaaS flow:
   * 1. Create user in Auth0 Management API
   * 2. Send password reset ticket (welcome email)
   * 3. Let 8base auto-create user on first login
   */
  async createUserWithInvitation(userData: SaasUserCreationData): Promise<SaasUserCreationResult> {
    try {
      console.log('=== SAAS USER CREATION STARTED ===');
      console.log('User data:', userData);

      // Step 1: Create user in Auth0 Management API
      const auth0User = await this.createAuth0User(userData);
      console.log('User created in Auth0:', auth0User);

      // Step 2: Create 8base User record
      const userRecord = await this.create8baseUserRecord(userData, auth0User.user_id);
      console.log('8base User record created:', userRecord);

      // Step 3: Create role-specific records
      let studentRecord = null;
      let coachRecord = null;
      
      if (userData.role === 'user') {
        studentRecord = await this.createStudentRecord(userData, userRecord?.id);
        console.log('Student record created:', studentRecord);
      } else if (userData.role === 'coach') {
        coachRecord = await this.createCoachRecord(userData, userRecord?.id);
        console.log('Coach record created:', coachRecord);
      }

      // Step 4: Send verification email with password information
      const verificationResult = await this.sendVerificationEmail(auth0User.user_id, userData.email);
      console.log('Verification email result:', verificationResult);

      console.log('=== SAAS USER CREATION COMPLETED ===');

      return {
        success: true,
        message: this.generateSuccessMessage(userData.role, verificationResult.success, verificationResult.ticketUrl, userData.email, userRecord, studentRecord, coachRecord),
        auth0UserId: auth0User.user_id,
        verificationSent: verificationResult.success,
        verificationLink: verificationResult.ticketUrl,
        userRecord: userRecord,
        studentRecord: studentRecord,
        coachRecord: coachRecord
      };

    } catch (error) {
      console.error('SaaS user creation failed:', error);
      return {
        success: false,
        message: 'Failed to create user invitation',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create user in Auth0 Management API
   */
  private async createAuth0User(userData: SaasUserCreationData): Promise<any> {
    try {
      const managementToken = await eightBaseM2MAuthService.getManagementToken();
      
      // Ensure required fields are not empty
      const firstName = userData.firstName?.trim() || 'User';
      const lastName = userData.lastName?.trim() || 'Name';
      const email = userData.email?.trim();
      
      if (!email) {
        throw new Error('Email is required for user creation');
      }

      // Set password as the user's email ID
      const userPassword = email;
      
      // Generate a valid username (1-15 chars, no email format)
      const username = this.generateUsername(firstName, lastName);

      const auth0UserData = {
        connection: 'Username-Password-Authentication',
        email: email,
        username: username,
        password: userPassword, // Password is the user's email
        given_name: firstName,
        family_name: lastName,
        name: `${firstName} ${lastName}`,
        email_verified: false, // Set to false so verification email is sent
        app_metadata: {
          role: userData.role,
          is_active: userData.is_active,
          has_paid: userData.has_paid,
          assignedCoachId: userData.assignedCoachId
        }
      };

      console.log('Creating Auth0 user with data:', auth0UserData);

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
        throw new Error(`Auth0 user creation failed: ${error.message || error.error} (Status: ${response.status})`);
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
   * Send verification email via Auth0 Management API
   */
  private async sendVerificationEmail(userId: string, userEmail: string): Promise<{ success: boolean; error?: string; ticketUrl?: string }> {
    try {
      const managementToken = await eightBaseM2MAuthService.getManagementToken();
      
      const ticketData = {
        user_id: userId,
        result_url: `${window.location.origin}/auth/callback?password=${encodeURIComponent(userEmail)}`, // Include password info in redirect
        ttl_sec: 3600, // 1 hour expiry
        includeEmailInRedirect: false
      };

      console.log('Sending verification email with data:', ticketData);

      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/tickets/email-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Verification email failed: ${error.message || error.error} (Status: ${response.status})`);
      }

      const ticket = await response.json();
      console.log('Verification email sent successfully:', ticket);
      
      return { 
        success: true,
        ticketUrl: ticket.ticket
      };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send verification email'
      };
    }
  }

  /**
   * Create 8base User record
   */
  private async create8baseUserRecord(userData: SaasUserCreationData, auth0UserId: string): Promise<any> {
    try {
      const userRecordData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        is_active: userData.is_active,
        has_paid: userData.has_paid,
        auth0UserId: auth0UserId, // Link to Auth0 user
        assignedCoachId: userData.assignedCoachId !== 'none' ? userData.assignedCoachId : undefined
      };

      console.log('Creating 8base User record with data:', userRecordData);
      const userRecord = await eightbaseService.createUser(userRecordData);
      console.log('8base User record created successfully:', userRecord);
      
      return userRecord;
    } catch (error) {
      console.error('Error creating 8base User record:', error);
      throw new Error(`Failed to create 8base User record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create Coach record with comprehensive relationships (for advanced use cases)
   */
  async createCoachWithFullRelationships(coachData: {
    firstName: string;
    lastName: string;
    email: string;
    bio?: string;
    userId: string;
    studentIds?: string[];
    sessionId?: string;
    profileImageId?: string;
    callLogBId?: string;
    assignmentCoashId?: string;
    coachNoteId?: string;
  }): Promise<any> {
    try {
      const coachRecordData: any = {
        firstName: coachData.firstName,
        lastName: coachData.lastName,
        email: coachData.email,
        bio: coachData.bio || '',
        users: {
          connect: { id: coachData.userId }
        }
      };

      // Add optional relationship fields
      if (coachData.studentIds && coachData.studentIds.length > 0) {
        coachRecordData.students = {
          connect: coachData.studentIds.map(id => ({ id }))
        };
      }

      if (coachData.sessionId) {
        coachRecordData.session = {
          connect: { id: coachData.sessionId }
        };
      }

      if (coachData.profileImageId) {
        coachRecordData.profileImage = {
          connect: { id: coachData.profileImageId }
        };
      }

      if (coachData.callLogBId) {
        coachRecordData.callLogBId = {
          connect: { id: coachData.callLogBId }
        };
      }

      if (coachData.assignmentCoashId) {
        coachRecordData.assignmentCoash = {
          connect: { id: coachData.assignmentCoashId }
        };
      }

      if (coachData.coachNoteId) {
        coachRecordData.coachNote = {
          connect: { id: coachData.coachNoteId }
        };
      }

      console.log('Creating Coach record with full relationships:', coachRecordData);
      const coachRecord = await eightbaseService.createCoachDirect(coachRecordData);
      console.log('Coach record created successfully with relationships:', coachRecord);
      
      return coachRecord;
    } catch (error) {
      console.error('Error creating Coach record with relationships:', error);
      throw new Error(`Failed to create Coach record with relationships: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create Coach record and link to User record (basic version)
   */
  private async createCoachRecord(userData: SaasUserCreationData, userId?: string): Promise<any> {
    try {
      if (!userId) {
        throw new Error('User ID is required to create Coach record');
      }

      const coachRecordData: any = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        bio: '',
        users: {  // Link to User record - schema expects 'users' (plural)
          connect: { id: userId }
        }
      };

      // Add optional relationship fields only if they have values
      if (userData.assignedCoachId && userData.assignedCoachId !== 'none') {
        coachRecordData.students = {
          connect: { id: userData.assignedCoachId }
        };
      }

      console.log('Creating Coach record with data:', coachRecordData);
      console.log('Data being sent to createCoachDirect:', JSON.stringify(coachRecordData, null, 2));
      const coachRecord = await eightbaseService.createCoachDirect(coachRecordData);
      console.log('Coach record created successfully:', coachRecord);
      
      return coachRecord;
    } catch (error) {
      console.error('Error creating Coach record:', error);
      throw new Error(`Failed to create Coach record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create Student record and link to User record
   */
  private async createStudentRecord(userData: SaasUserCreationData, userId?: string): Promise<any> {
    try {
      if (!userId) {
        throw new Error('User ID is required to create Student record');
      }

      const studentRecordData = {
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
          connect: { id: userId } // Link to User record
        }
      };

      console.log('Creating Student record with data:', studentRecordData);
      const studentRecord = await eightbaseService.createStudentDirect(studentRecordData);
      console.log('Student record created successfully:', studentRecord);
      
      return studentRecord;
    } catch (error) {
      console.error('Error creating Student record:', error);
      throw new Error(`Failed to create Student record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Removed password reset method - using only verification email now

  /**
   * Generate the exact GraphQL mutation structure for Coach creation
   * This matches the mutation structure you provided
   */
  generateCoachCreateMutation(coachData: {
    userId: string;
    studentIds?: string[];
    sessionId?: string;
    profileImageId?: string;
    callLogBId?: string;
    assignmentCoashId?: string;
    coachNoteId?: string;
    firstName: string;
    lastName: string;
    email: string;
    bio?: string;
  }): string {
    const mutationData: any = {
      firstName: `"${coachData.firstName}"`,
      lastName: `"${coachData.lastName}"`,
      email: `"${coachData.email}"`,
      bio: `"${coachData.bio || ''}"`,
      users: {
        connect: { id: `"${coachData.userId}"` }
      }
    };

    // Add optional relationships
    if (coachData.studentIds && coachData.studentIds.length > 0) {
      mutationData.students = {
        connect: coachData.studentIds.map(id => ({ id: `"${id}"` }))
      };
    }

    if (coachData.sessionId) {
      mutationData.session = {
        connect: { id: `"${coachData.sessionId}"` }
      };
    }

    if (coachData.profileImageId) {
      mutationData.profileImage = {
        connect: { id: `"${coachData.profileImageId}"` }
      };
    }

    if (coachData.callLogBId) {
      mutationData.callLogBId = {
        connect: { id: `"${coachData.callLogBId}"` }
      };
    }

    if (coachData.assignmentCoashId) {
      mutationData.assignmentCoash = {
        connect: { id: `"${coachData.assignmentCoashId}"` }
      };
    }

    if (coachData.coachNoteId) {
      mutationData.coachNote = {
        connect: { id: `"${coachData.coachNoteId}"` }
      };
    }

    const dataString = JSON.stringify(mutationData, null, 2)
      .replace(/"/g, '') // Remove quotes from values
      .replace(/:/g, ': '); // Add space after colons

    return `mutation MyMutation {
  __typename
  coachCreate(
    data: ${dataString}
  ) {
    users {
      email
    }
  }
}`;
  }

  /**
   * Generate appropriate success message
   */
  private generateSuccessMessage(role: string, verificationSent: boolean, verificationLink?: string, userEmail?: string, userRecord?: any, studentRecord?: any, coachRecord?: any): string {
    let message = `✅ User invitation sent successfully!`;
    message += `\n👤 Role: ${role}`;
    
    // Show created records
    if (userRecord) {
      message += `\n👤 User record created: ${userRecord.id}`;
    }
    
    if (studentRecord) {
      message += `\n📚 Student record created: ${studentRecord.id}`;
      message += `\n🔗 Student linked to User: ${userRecord?.id}`;
    }
    
    if (coachRecord) {
      message += `\n🏆 Coach record created: ${coachRecord.id}`;
      message += `\n🔗 Coach linked to User: ${userRecord?.id}`;
    }
    
    if (verificationSent && verificationLink) {
      message += `\n📧 Verification email sent successfully`;
      message += `\n🔗 Verification Link: ${verificationLink}`;
      message += `\n🔐 Password: ${userEmail} (same as email address)`;
    } else {
      message += `\n⚠️ Note: Verification email could not be sent`;
      message += `\n💡 User may need manual setup`;
    }
    
    message += `\n\n📋 Next Steps:`;
    message += `\n1. User receives verification email`;
    message += `\n2. User clicks verification link to verify email`;
    message += `\n3. User can log in with email and password (same as email)`;
    message += `\n4. Records are already created in 8base (User + ${role === 'coach' ? 'Coach' : 'Student'} tables)`;
    
    return message;
  }

  /**
   * Check if user already exists by email
   */
  async checkUserExists(email: string): Promise<{ exists: boolean; auth0Exists?: boolean; auth0UserId?: string }> {
    try {
      const managementToken = await eightBaseM2MAuthService.getManagementToken();
      
      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${managementToken}`
        }
      });
      
      if (response.ok) {
        const users = await response.json();
        const auth0Exists = users.length > 0;
        const auth0UserId = auth0Exists ? users[0].user_id : undefined;
        
        return {
          exists: auth0Exists,
          auth0Exists,
          auth0UserId
        };
      } else {
        console.error('Failed to check user existence in Auth0');
        return { exists: false };
      }
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return { exists: false };
    }
  }

  /**
   * Resend verification email for existing user
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const userCheck = await this.checkUserExists(email);
      
      if (!userCheck.exists || !userCheck.auth0UserId) {
        return {
          success: false,
          message: 'User not found in Auth0',
          error: 'User does not exist'
        };
      }

      const verificationResult = await this.sendVerificationEmail(userCheck.auth0UserId, email);
      
      if (verificationResult.success) {
        return {
          success: true,
          message: `Verification email sent successfully. Password: ${email}`
        };
      } else {
        return {
          success: false,
          message: 'Failed to send verification email',
          error: verificationResult.error
        };
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      return {
        success: false,
        message: 'Failed to resend verification email',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate a valid username for Auth0 (1-15 chars, no email format)
   */
  private generateUsername(firstName: string, lastName: string): string {
    // Create base username from first and last name
    const firstInitial = firstName.charAt(0).toLowerCase();
    const lastPart = lastName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
    
    // Combine and ensure it's 1-15 characters
    let username = firstInitial + lastPart;
    
    // If too short, add random numbers
    if (username.length < 3) {
      username += Math.floor(Math.random() * 1000).toString();
    }
    
    // If too long, truncate
    if (username.length > 15) {
      username = username.substring(0, 15);
    }
    
    // Add random suffix to ensure uniqueness
    const randomSuffix = Math.floor(Math.random() * 100).toString();
    username = username.substring(0, 15 - randomSuffix.length) + randomSuffix;
    
    return username;
  }

  /**
   * Generate a secure temporary password for new users
   */
  private generateTemporaryPassword(): string {
    // Generate a secure random password that meets Auth0 requirements
    const length = 16;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one character from each required type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special char
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

export const saasUserCreationService = new SaasUserCreationService();
